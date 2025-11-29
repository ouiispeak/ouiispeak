import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabaseServer';
import { registeredLessonSlugs } from '@/lessons/registry';
import ModuleDropdown from '@/components/ModuleDropdown';

export const dynamic = 'force-dynamic';

type LessonInfo = {
  slug: string;
  module: string;
  lesson: string;
  displayName: string;
  moduleKey: string; // e.g., "module-1"
};

const moduleOrder = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default async function LessonsIndex() {
  const supabase = await createServerSupabase();
  const { data: { user: _user } } = await supabase.auth.getUser();
  // Optional guard:
  // if (!user) redirect('/auth');

  const featuredLessons = registeredLessonSlugs.filter(
    (slug) => slug !== 'templates/blank' && !slug.startsWith('slide template ref'),
  );

  const humanizeSlug = (slug: string) => {
    if (slug.includes('slide-templates')) {
      return 'Prototype de diapositive';
    }

    return slug
      .split('/')
      .map((segment) => segment.replace(/-/g, ' '))
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' · ');
  };

  const parseLessonSlug = (slug: string): LessonInfo | null => {
    if (slug.includes('slide-templates')) {
      return null; // Skip template slides
    }

    const parts = slug.split('/');
    if (parts.length < 2) return null;

    const modulePart = parts[0];
    const lessonPart = parts[1];

    // Extract module level (e.g., "a0-module-1" -> "A0")
    const moduleMatch = modulePart.match(/^([a-c]\d+)/i);
    if (!moduleMatch) return null;

    // Extract module key (e.g., "a0-module-1" -> "module-1")
    const moduleKeyMatch = modulePart.match(/module-(\d+)/i);
    const moduleKey = moduleKeyMatch ? `module-${moduleKeyMatch[1]}` : modulePart;

    const module = moduleMatch[1].toUpperCase();
    const lesson = lessonPart;
    const displayName = humanizeSlug(slug);

    return { slug, module, lesson, displayName, moduleKey };
  };

  // Group lessons by level, then by module
  const lessonsByLevelAndModule: Record<string, Record<string, LessonInfo[]>> = {};
  const otherLessons: LessonInfo[] = [];

  featuredLessons.forEach((slug) => {
    const lessonInfo = parseLessonSlug(slug);
    if (!lessonInfo) {
      // Handle non-standard lessons (like slide-templates)
      otherLessons.push({
        slug,
        module: 'Other',
        lesson: slug,
        displayName: humanizeSlug(slug),
        moduleKey: 'other',
      });
      return;
    }

    if (!lessonsByLevelAndModule[lessonInfo.module]) {
      lessonsByLevelAndModule[lessonInfo.module] = {};
    }
    if (!lessonsByLevelAndModule[lessonInfo.module][lessonInfo.moduleKey]) {
      lessonsByLevelAndModule[lessonInfo.module][lessonInfo.moduleKey] = [];
    }
    lessonsByLevelAndModule[lessonInfo.module][lessonInfo.moduleKey].push(lessonInfo);
  });

  // Sort lessons within each module numerically
  Object.keys(lessonsByLevelAndModule).forEach((level) => {
    Object.keys(lessonsByLevelAndModule[level]).forEach((moduleKey) => {
      lessonsByLevelAndModule[level][moduleKey].sort((a, b) => {
        // Extract lesson numbers (e.g., "lesson-1" -> 1, "lesson-10" -> 10)
        const getLessonNumber = (lesson: string): number => {
          const match = lesson.match(/lesson-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        };
        return getLessonNumber(a.lesson) - getLessonNumber(b.lesson);
      });
    });
  });

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto w-full rounded-lg bg-[#ece9e3] p-6 shadow-[2px_2px_4px_rgba(0,0,0,0.15),-1px_-1px_2px_rgba(255,255,255,0.95)]">
        <h1 className="mb-6 text-3xl font-normal text-[#222326] sm:mb-8 sm:text-4xl">
          Leçons
        </h1>

        <div className="flex flex-col gap-6 sm:gap-8">
          {moduleOrder.map((level) => {
            const levelModules = lessonsByLevelAndModule[level];
            if (!levelModules || Object.keys(levelModules).length === 0) return null;

            // Sort modules by module number
            const sortedModuleKeys = Object.keys(levelModules).sort((a, b) => {
              const getModuleNumber = (key: string): number => {
                const match = key.match(/module-(\d+)/);
                return match ? parseInt(match[1], 10) : 0;
              };
              return getModuleNumber(a) - getModuleNumber(b);
            });

            return (
              <div
                key={level}
                className="rounded-lg bg-[#f0ede9] p-6 shadow-[2px_2px_4px_rgba(0,0,0,0.15),-1px_-1px_2px_rgba(255,255,255,0.95)] overflow-hidden"
              >
                <div className="mb-0">
                  <h2 className="mb-0 text-2xl font-normal text-[#0c9599] sm:text-3xl">
                    Niveau {level}
                  </h2>
                </div>
                <div className="flex flex-col gap-4 mt-4">
                  {sortedModuleKeys.map((moduleKey) => {
                    const moduleNumber = moduleKey.match(/module-(\d+)/)?.[1] || '';
                    const moduleDisplayName = `Module ${moduleNumber}`;
                    return (
                      <ModuleDropdown
                        key={moduleKey}
                        moduleName={moduleDisplayName}
                        lessons={levelModules[moduleKey]}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}

          {otherLessons.length > 0 && (
            <div className="rounded-lg bg-[#f0ede9] p-6 shadow-[2px_2px_4px_rgba(0,0,0,0.15),-1px_-1px_2px_rgba(255,255,255,0.95)] sm:p-8">
              <h2 className="mb-4 text-2xl font-normal text-[#0c9599] sm:mb-6 sm:text-3xl">
                Autres
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {otherLessons.map((lesson) => (
                  <Link
                    key={lesson.slug}
                    href={`/lecons/${lesson.slug}`}
                    className="rounded-lg border border-[#d9d2c6] bg-white/70 px-4 py-3 text-sm font-normal text-[#222326] transition-colors duration-200 hover:bg-[#f0ede9] hover:border-[#c9c2b6]"
                  >
                    {lesson.displayName}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
