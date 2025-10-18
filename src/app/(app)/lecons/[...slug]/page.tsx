import type { Metadata } from 'next';
import LessonShell from './LessonShell';
import { type Slide } from './LessonPlayer';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Lecture de la leçon' };

type Params = { slug: string[] };

async function getLessonContent(lessonSlug: string): Promise<Slide[]> {
  // For now, we'll import the specific lesson content
  // In a real app, this would be dynamic based on the slug
  if (lessonSlug === 'module-1/lesson-1') {
    const { slides } = await import('@/lessons/module-1/lesson-1');
    return slides;
  }
  
  // Fallback for other lessons
  return [
    { kind: 'text', id: 'intro', title: 'Using the interface', html: 'On y va !' },
    { kind: 'text', id: 'ready', title: 'We are going to learn today!', html: '…' },
  ];
}

export default async function Page({ params }: { params: Params }) {
  const lessonSlug = params.slug.join('/');
  const slides = await getLessonContent(lessonSlug);
  return <LessonShell lessonSlug={lessonSlug} slides={slides} />;
}
