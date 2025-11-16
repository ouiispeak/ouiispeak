'use client';

import { SlideRegistry } from '@/components/slides';
import type { Slide } from '@/lessons/types';

type LessonPlayerProps = {
  slides: Slide[];
  currentIndex: number;
};

export default function LessonPlayer({ slides, currentIndex }: LessonPlayerProps) {
  if (!slides || slides.length === 0) {
    return <p>Aucune diapositive trouvée.</p>;
  }

  const safeIndex = Math.min(currentIndex, slides.length - 1);
  const current = slides[safeIndex];
  const SlideComponent = SlideRegistry[current.type] as
    | ((props: Slide['props']) => JSX.Element)
    | undefined;

  if (!SlideComponent) {
    return <p>Type de diapositive inconnu : {current.type}</p>;
  }

  return (
    <div className="mb-4 flex h-full flex-1 overflow-auto rounded-lg bg-[#f4f2ee] px-4 py-4 md:mb-6 md:px-6 md:py-6 lg:px-8 shadow-[1px_1px_3px_rgba(0,0,0,0.1),-1px_-1px_2px_rgba(255,255,255,0.9)]">
      <div className="mx-auto flex h-full w-full max-w-[720px] pt-6 pb-8 px-4 md:px-6 space-y-4 md:space-y-6">
        <SlideComponent {...(current.props as Slide['props'])} />
      </div>
    </div>
  );
}
