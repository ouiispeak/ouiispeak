import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabaseServer';
import LessonShell from '@/app/(app)/lecons/[...slug]/LessonShell';
import { resolveLessonFromSlug } from '@/lib/resolveLesson';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ module: string; lesson: string }>;
};

export default async function LessonPage({ params }: PageProps) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { module, lesson } = await params;
  const lessonSlug = `${module}/${lesson}` || 'templates/blank';
  
  const resolved = resolveLessonFromSlug(lessonSlug);
  const slides = resolved?.slides ?? [];
  const finalLessonSlug = resolved?.lessonSlug ?? lessonSlug;

  return <LessonShell lessonSlug={finalLessonSlug} slides={slides} />;
}
