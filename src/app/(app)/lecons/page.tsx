import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabaseServer';
import { registeredLessonSlugs } from '@/lessons/registry';
import ModuleDropdown from '@/components/ModuleDropdown';
import { type LessonInfo } from '@/lib/lessonSlug';
import { groupLessonsForIndex } from '@/lib/lessonGrouping';

export const dynamic = 'force-dynamic';

export default async function LessonsIndex() {
  const supabase = await createServerSupabase();
  const { data: { user: _user } } = await supabase.auth.getUser();
  // Optional guard:
  // if (!user) redirect('/auth');

  const { levels, otherLessons } = groupLessonsForIndex(registeredLessonSlugs);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto w-full rounded-lg bg-[#ece9e3] p-6 shadow-[2px_2px_4px_rgba(0,0,0,0.15),-1px_-1px_2px_rgba(255,255,255,0.95)]">
        <h1 className="mb-6 text-3xl font-normal text-[#222326] sm:mb-8 sm:text-4xl">
          Leçons
        </h1>

        <div className="flex flex-col gap-6 sm:gap-8">
          {levels.map((levelData) => (
            <div
              key={levelData.level}
              className="rounded-lg bg-[#f0ede9] p-6 shadow-[2px_2px_4px_rgba(0,0,0,0.15),-1px_-1px_2px_rgba(255,255,255,0.95)] overflow-hidden"
            >
              <div className="mb-0">
                <h2 className="mb-0 text-2xl font-normal text-[#0c9599] sm:text-3xl">
                  Niveau {levelData.level}
                </h2>
              </div>
              <div className="flex flex-col gap-4 mt-4">
                {levelData.modules.map((moduleData) => (
                  <ModuleDropdown
                    key={moduleData.moduleKey}
                    moduleName={`Module ${moduleData.moduleNumber}`}
                    lessons={moduleData.lessons}
                  />
                ))}
              </div>
            </div>
          ))}

          {otherLessons.length > 0 && (
            <div className="rounded-lg bg-[#f0ede9] p-6 shadow-[2px_2px_4px_rgba(0,0,0,0.15),-1px_-1px_2px_rgba(255,255,255,0.95)] sm:p-8">
              <h2 className="mb-4 text-2xl font-normal text-[#0c9599] sm:mb-6 sm:text-3xl">
                Autres
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
