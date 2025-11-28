import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabaseServer';
import LessonShell from '@/app/(app)/lecons/[...slug]/LessonShell';
import { getSlidesForLesson } from '@/lessons/registry';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ module: string; lesson: string }>;
};

function getLessonContent(slug: string) {
  return getSlidesForLesson(slug);
}

export default async function LessonPage({ params }: PageProps) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { module, lesson } = await params;
  const lessonSlug = `${module}/${lesson}` || 'templates/blank';
  const slides = getLessonContent(lessonSlug);

  return <LessonShell lessonSlug={lessonSlug} slides={slides} />;
}
