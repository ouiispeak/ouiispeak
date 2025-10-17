export type LessonRow = {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  order_index: number;
  estimated_minutes: number | null;
  required_score: number | null;
  content: any | null;
};

export type UserLessonRow = {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number | null;
  current_step: number | null;
  started_at: string | null;
  last_opened_at: string | null;
  completed_at: string | null;
  notes: string | null;
};

export async function fetchModuleAndLessons(supabase: any, moduleSlug: string) {
  // Get the module
  const { data: module, error: modErr } = await supabase
    .from('modules')
    .select('id, slug, title, level, order_index, description')
    .eq('slug', moduleSlug)
    .single();
  if (modErr) throw modErr;

  // Get lessons for the module
  const { data: lessons, error: lesErr } = await supabase
    .from('lessons')
    .select('id, module_id, slug, title, order_index, estimated_minutes, required_score, content')
    .eq('module_id', module.id)
    .order('order_index', { ascending: true });
  if (lesErr) throw lesErr;

  return { module, lessons: lessons as LessonRow[] };
}

export async function fetchUserLessonProgress(supabase: any, userId: string, lessonIds: string[]) {
  if (!userId || lessonIds.length === 0) return [];
  const { data, error } = await supabase
    .from('user_lessons')
    .select('id, user_id, lesson_id, status, score, current_step, started_at, last_opened_at, completed_at, notes')
    .in('lesson_id', lessonIds)
    .eq('user_id', userId);
  if (error) throw error;
  return data as UserLessonRow[];
}

export function computeUnlocks(lessons: LessonRow[], progress: Record<string, UserLessonRow | undefined>) {
  // Returns a map: lessonId -> { unlocked: boolean, reason: string }
  const unlockMap: Record<string, { unlocked: boolean; reason: string }> = {};

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const prev = i > 0 ? lessons[i - 1] : undefined;
    if (!prev) {
      unlockMap[lesson.id] = { unlocked: true, reason: 'Première leçon' };
      continue;
    }
    const prevProgress = progress[prev.id];
    const required = lesson.required_score ?? 0;
    const ok = !!prevProgress && prevProgress.status === 'completed' && (prevProgress.score ?? 0) >= required;
    unlockMap[lesson.id] = ok
      ? { unlocked: true, reason: 'Leçon précédente complétée' }
      : { unlocked: false, reason: 'Compléter la leçon précédente' };
  }

  return unlockMap;
}

