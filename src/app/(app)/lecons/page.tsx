import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabaseServer';
import { registeredLessonSlugs } from '@/lessons/registry';

export const dynamic = 'force-dynamic';

type LessonInfo = {
  slug: string;
  module: string;
  lesson: string;
  displayName: string;
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

    const module = moduleMatch[1].toUpperCase();
    const lesson = lessonPart;
    const displayName = humanizeSlug(slug);

    return { slug, module, lesson, displayName };
  };

  // Group lessons by module
  const lessonsByModule: Record<string, LessonInfo[]> = {};
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
      });
      return;
    }

    if (!lessonsByModule[lessonInfo.module]) {
      lessonsByModule[lessonInfo.module] = [];
    }
    lessonsByModule[lessonInfo.module].push(lessonInfo);
  });

  // Sort lessons within each module numerically
  Object.keys(lessonsByModule).forEach((module) => {
    lessonsByModule[module].sort((a, b) => {
      // Extract lesson numbers (e.g., "lesson-1" -> 1, "lesson-10" -> 10)
      const getLessonNumber = (lesson: string): number => {
        const match = lesson.match(/lesson-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };
      return getLessonNumber(a.lesson) - getLessonNumber(b.lesson);
    });
  });

  return (
    <main className="min-h-screen bg-[#f0ede9] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-normal text-[#222326] sm:mb-8 sm:text-4xl">
          Leçons
        </h1>

        <div className="flex flex-col gap-6 sm:gap-8">
          {moduleOrder.map((module) => {
            const lessons = lessonsByModule[module];
            if (!lessons || lessons.length === 0) return null;

            return (
              <div
                key={module}
                className="rounded-xl border border-[#e3e0dc] bg-[#f4f2ee] p-6 shadow-[1px_1px_3px_rgba(0,0,0,0.1),-1px_-1px_2px_rgba(255,255,255,0.9)] sm:p-8"
              >
                <h2 className="mb-4 text-2xl font-normal text-[#0c9599] sm:mb-6 sm:text-3xl">
                  Niveau {module}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {lessons.map((lesson) => (
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
            );
          })}

          {otherLessons.length > 0 && (
            <div className="rounded-xl border border-[#e3e0dc] bg-[#f4f2ee] p-6 shadow-[1px_1px_3px_rgba(0,0,0,0.1),-1px_-1px_2px_rgba(255,255,255,0.9)] sm:p-8">
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
