import type { Metadata } from 'next';
import LessonShell from './LessonShell';
import { type Slide } from '@/lessons/types';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Lecture de la leçon' };

type Params = { slug: string[] };

async function getLessonContent(): Promise<Slide[]> {
  // Starting from an empty state so new templates can be added later.
  return [];
}

export default async function Page({ params }: { params: Params }) {
  const segments = params.slug;

  const rawLessonSlug =
    segments[0] === 'play'
      ? segments.slice(1).join('/')
      : segments.join('/');

  const lessonSlug = rawLessonSlug || 'templates/blank';

  const slides = await getLessonContent();

  return <LessonShell lessonSlug={lessonSlug} slides={slides} />;
}

