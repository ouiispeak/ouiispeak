import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabaseServer';
import LessonPlayer from '@/components/lesson/LessonPlayer';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: { module: string; lesson: string };
};

export default async function LessonPage({ params }: PageProps) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  // For now we just pass slugs; later we'll load lesson definitions from DB/files
  return (
    <LessonPlayer
      moduleSlug={params.module}
      lessonSlug={params.lesson}
    />
  );
}
