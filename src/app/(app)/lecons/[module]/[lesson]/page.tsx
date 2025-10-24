import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabaseServer';
import LessonShell from '@/app/(app)/lecons/[...slug]/LessonShell';
import { type Slide } from '@/app/(app)/lecons/[...slug]/LessonPlayer';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ module: string; lesson: string }>;
};

async function getLessonContent(lessonSlug: string): Promise<Slide[]> {
  // For now, we'll import the specific lesson content
  // In a real app, this would be dynamic based on the slug
  if (lessonSlug === 'module-1/lesson-1') {
    const { slides } = await import('@/lessons/module-1/lesson-1');
    return slides as Slide[];
  }

  // Fallback for other lessons (must match Slide type)
  return [
    {
      id: 'intro',
      kind: 'text', // allowed kind
      title: 'Using the interface',
      html: 'On y va !',
    },
    {
      id: 'ready',
      kind: 'text', // allowed kind
      title: 'We are going to learn today!',
      html: '…',
    },
  ] satisfies Slide[];
}

export default async function LessonPage({ params }: PageProps) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { module, lesson } = await params;
  const lessonSlug = `${module}/${lesson}`;
  const slides = await getLessonContent(lessonSlug);

  return <LessonShell lessonSlug={lessonSlug} slides={slides} />;
}
