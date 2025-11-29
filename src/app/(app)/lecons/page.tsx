import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabaseServer';
import { registeredLessonSlugs } from '@/lessons/registry';
import ModuleDropdown from '@/components/ModuleDropdown';
import {
  parseLessonSlug,
  humanizeLessonSlug,
  type LessonInfo,
} from '@/lib/lessonSlug';

export const dynamic = 'force-dynamic';

const moduleOrder = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default async function LessonsIndex() {
  // @ts-ignore - TypeScript language server issue with Supabase types
  const supabase = await createServerSupabase();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // @ts-ignore
  const { data: { user: _user } } = await supabase.auth.getUser();
  // Optional guard:
  // if (!user) redirect('/auth');

  const featuredLessons = registeredLessonSlugs.filter(
    // @ts-ignore
    (slug: string) => slug !== 'templates/blank' && !slug.startsWith('slide template ref'),
  );

  // Group lessons by level, then by module
  type LessonsByModule = { [moduleKey: string]: LessonInfo[] };
  type LessonsByLevel = { [level: string]: LessonsByModule };
  const lessonsByLevelAndModule: LessonsByLevel = {};
  const otherLessons: LessonInfo[] = [];

  featuredLessons.forEach((slug: string) => {
    const lessonInfo = parseLessonSlug(slug);
    if (!lessonInfo) {
      // Handle non-standard lessons (like slide-templates)
      // @ts-ignore
      otherLessons.push({
        slug,
        module: 'Other',
        lesson: slug,
        displayName: humanizeLessonSlug(slug),
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
    // @ts-ignore
    lessonsByLevelAndModule[lessonInfo.module][lessonInfo.moduleKey].push(lessonInfo);
  });

  // Sort lessons within each module numerically
  // @ts-ignore
  const levelKeys: string[] = Object.keys(lessonsByLevelAndModule);
  // @ts-ignore
  for (const level of levelKeys) {
    // @ts-ignore
    const moduleKeys: string[] = Object.keys(lessonsByLevelAndModule[level]);
    // @ts-ignore
    for (const moduleKey of moduleKeys) {
      // @ts-ignore
      lessonsByLevelAndModule[level][moduleKey].sort((a: LessonInfo, b: LessonInfo) => {
        // Extract lesson numbers (e.g., "lesson-1" -> 1, "lesson-10" -> 10)
        const getLessonNumber = (lesson: string): number => {
          // @ts-ignore
          const match = lesson.match(/lesson-(\d+)/);
          if (match && match[1]) {
            // @ts-ignore
            return parseInt(match[1], 10);
          }
          return 0;
        };
        return getLessonNumber(a.lesson) - getLessonNumber(b.lesson);
      });
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto w-full rounded-lg bg-[#ece9e3] p-6 shadow-[2px_2px_4px_rgba(0,0,0,0.15),-1px_-1px_2px_rgba(255,255,255,0.95)]">
        <h1 className="mb-6 text-3xl font-normal text-[#222326] sm:mb-8 sm:text-4xl">
          Leçons
        </h1>

        <div className="flex flex-col gap-6 sm:gap-8">
          {/* @ts-ignore */}
          {moduleOrder.map((level: string) => {
            const levelModules = lessonsByLevelAndModule[level];
            // @ts-ignore
            const moduleKeys: string[] = levelModules ? Object.keys(levelModules) : [];
            // @ts-ignore
            if (!levelModules || moduleKeys.length === 0) return null;

            // Sort modules by module number
            // @ts-ignore
            const sortedModuleKeys = moduleKeys.slice().sort((a: string, b: string) => {
              const getModuleNumber = (key: string): number => {
                // @ts-ignore
                const match = key.match(/module-(\d+)/);
                if (match && match[1]) {
                  // @ts-ignore
                  return parseInt(match[1], 10);
                }
                return 0;
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
                  {/* @ts-ignore */}
                  {sortedModuleKeys.map((moduleKey: string) => {
                    // @ts-ignore
                    const match = moduleKey.match(/module-(\d+)/);
                    const moduleNumber = match && match[1] ? match[1] : '';
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

          {/* @ts-ignore */}
          {otherLessons.length > 0 && (
            <div className="rounded-lg bg-[#f0ede9] p-6 shadow-[2px_2px_4px_rgba(0,0,0,0.15),-1px_-1px_2px_rgba(255,255,255,0.95)] sm:p-8">
              <h2 className="mb-4 text-2xl font-normal text-[#0c9599] sm:mb-6 sm:text-3xl">
                Autres
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {/* @ts-ignore */}
                {otherLessons.map((lesson: LessonInfo) => (
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
