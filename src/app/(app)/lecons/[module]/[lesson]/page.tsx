import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabaseServer';
import LessonShell from '@/app/(app)/lecons/[...slug]/LessonShell';
import { type Slide } from '@/lessons/types';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: { module: string; lesson: string };
};

async function getLessonContent(): Promise<Slide[]> {
  return [];
}

export default async function LessonPage({ params }: PageProps) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { module, lesson } = params;
  const lessonSlug = `${module}/${lesson}` || 'templates/blank';
  const slides = await getLessonContent();

  return <LessonShell lessonSlug={lessonSlug} slides={slides} />;
}
