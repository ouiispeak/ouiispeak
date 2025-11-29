import { requireUser } from '@/lib/auth';
import LessonShell from '@/app/(app)/lecons/[...slug]/LessonShell';
import { resolveLessonFromSlug } from '@/lib/resolveLesson';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ module: string; lesson: string }>;
};

export default async function LessonPage({ params }: PageProps) {
  await requireUser();

  const { module, lesson } = await params;
  const lessonSlug = `${module}/${lesson}` || 'templates/blank';
  
  const resolved = resolveLessonFromSlug(lessonSlug);
  const slides = resolved?.slides ?? [];
  const finalLessonSlug = resolved?.lessonSlug ?? lessonSlug;

  return <LessonShell lessonSlug={finalLessonSlug} slides={slides} />;
}
