// src/app/(app)/tableau-de-bord/page.tsx
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabaseServer';
import {
  fetchModuleAndLessons,
  fetchUserLessonProgress,
  type UserLessonRow,
  type LessonRow,
} from '@/lib/lessonQueries';

export const dynamic = 'force-dynamic';

type ViewItem = {
  lesson: LessonRow;
  progress?: UserLessonRow;
  state: 'not_started' | 'in_progress' | 'completed';
  unlocked: boolean;
};

export default async function TableauDeBordPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Load module + lessons
  const { module, lessons } = await fetchModuleAndLessons(supabase, 'module-1');

  // Load this user's progress rows for those lessons
  const lessonIds = lessons.map((l) => l.id);
  const progressRows = await fetchUserLessonProgress(supabase, user.id, lessonIds);

  // Index progress by lesson_id for quick lookup
  const progressByLessonId: Record<string, UserLessonRow | undefined> = Object.fromEntries(
    progressRows.map((row) => [row.lesson_id, row])
  );

  // Compute states + unlocks
  const view: ViewItem[] = [];
  let previousCompleted = true; // first lesson is unlocked

  for (const l of lessons) {
    const prog = progressByLessonId[l.id];
    const requiredScore = l.required_score ?? 0;
    const userScore = prog?.score ?? 0;
    const completed = !!prog?.completed_at && userScore >= requiredScore;

    const state: ViewItem['state'] = !prog ? 'not_started' : completed ? 'completed' : 'in_progress';
    const unlocked = previousCompleted;

    view.push({ lesson: l, progress: prog, state, unlocked });
    previousCompleted = completed;
  }

  return (
    <main style={{ padding: 16 }}>
      <h1>Tableau de bord</h1>
      <p>Module : {module.title}</p>
      <ol>
        {view.map((v, idx) => {
          const requiredScore = v.lesson.required_score ?? 0;
          return (
            <li key={v.lesson.id} style={{ marginBottom: 8 }}>
              <strong>{idx + 1}. {v.lesson.title}</strong>
              <div>
                État : {v.state} · {v.unlocked ? 'déverrouillé' : 'verrouillé'} · score requis : {requiredScore}
                {typeof v.progress?.score === 'number' ? ` · score : ${v.progress.score}` : null}
              </div>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
