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

export default async function Page({ params }: { params: Params }) {
  const lessonSlug = params.slug.join('/');
  const slides = await getLessonContent(lessonSlug);

  return (
    <section className="min-h-screen bg-[#f6f5f3] text-[#222326] px-4 py-6 flex justify-center">
      <div className="w-full max-w-screen-lg border border-[#ddd] rounded-xl bg-white shadow-sm overflow-hidden">
        {/* The shell handles:
           - main lesson content
           - sidebar tools (notes, signet, aide, redémarrer, quitter)
           - responsive layout (sidebar right on desktop, stacked on mobile) */}
        <LessonShell lessonSlug={lessonSlug} slides={slides} />
      </div>
    </section>
  );
}
