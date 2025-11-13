'use client';

import { useState } from 'react';
import { SlideRegistry } from '@/components/slides';
import SoftIconButton from '@/components/CircleButton';
import LessonProgressBar from '@/components/lesson/LessonProgressBar';
import type { Slide } from '@/lessons/types';

const StepBackIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="3" height="16" />
    <polygon points="21 4 9 12 21 20 21 4" />
  </svg>
);

const StepForwardIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <rect x="18" y="4" width="3" height="16" />
    <polygon points="3 4 15 12 3 20 3 4" />
  </svg>
);

type LessonPlayerProps = {
  slides: Slide[];
};

export default function LessonPlayer({ slides }: LessonPlayerProps) {
  const [index, setIndex] = useState(0);

  if (!slides || slides.length === 0) {
    return <p>Aucune diapositive trouvée.</p>;
  }

  const safeIndex = Math.min(index, slides.length - 1);
  const current = slides[safeIndex];
  const SlideComponent = SlideRegistry[current.type] as
    | ((props: Slide['props']) => JSX.Element)
    | undefined;

  if (!SlideComponent) {
    return <p>Type de diapositive inconnu : {current.type}</p>;
  }

  const prevDisabled = safeIndex === 0;
  const nextDisabled = safeIndex >= slides.length - 1;

  return (
    <section className="flex h-full flex-1 flex-col rounded-2xl bg-[#edeae7] px-4 py-4 md:px-6 md:py-6 lg:px-8">
      <div className="flex h-full flex-1 overflow-auto">
        <div className="flex h-full w-full">
          <SlideComponent {...(current.props as Slide['props'])} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#ddd5cf] pt-4 text-base">
        <SoftIconButton
          ariaLabel="Aller à la diapositive précédente"
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
          disabled={prevDisabled}
          className="h-14 w-14"
        >
          <StepBackIcon />
        </SoftIconButton>
        <LessonProgressBar current={safeIndex} total={slides.length} showLabel={false} ariaLabel="Progression de la leçon" className="max-w-xs" />
        <SoftIconButton
          ariaLabel="Aller à la diapositive suivante"
          onClick={() => setIndex((value) => Math.min(slides.length - 1, value + 1))}
          disabled={nextDisabled}
          className="h-14 w-14"
        >
          <StepForwardIcon />
        </SoftIconButton>
      </div>
    </section>
  );
}
