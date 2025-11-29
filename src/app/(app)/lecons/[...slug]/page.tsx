import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import LessonShell from './LessonShell';
import { resolveLessonFromSlug } from '@/lib/resolveLesson';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Lecture de la leçon' };

type Params = { slug: string[] };

export default async function Page({ params }: { params: Params }) {
  await requireUser();
  
  const segments = params.slug;

  // Handle special "play" prefix: drop it if present
  const normalizedSegments =
    segments[0] === 'play'
      ? segments.slice(1)
      : segments;

  const resolved = resolveLessonFromSlug(normalizedSegments);
  const slides = resolved?.slides ?? [];
  const lessonSlug = resolved?.lessonSlug ?? normalizedSegments.join('/');

  return <LessonShell lessonSlug={lessonSlug} slides={slides} />;
}
