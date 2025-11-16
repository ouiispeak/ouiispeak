import type { Metadata } from 'next';
import LessonShell from './LessonShell';
import { getSlidesForLesson } from '@/lessons/registry';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Lecture de la leçon' };

type Params = { slug: string[] };

function getLessonContent(slug: string) {
  return getSlidesForLesson(slug);
}

export default async function Page({ params }: { params: Params }) {
  const segments = params.slug;

  const lessonSlug =
    segments[0] === 'play'
      ? segments.slice(1).join('/')
      : segments.join('/');

  const slides = getLessonContent(lessonSlug);

  return <LessonShell lessonSlug={lessonSlug} slides={slides} />;
}
