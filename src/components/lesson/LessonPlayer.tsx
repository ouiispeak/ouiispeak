'use client';

import { useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import SlideRenderer from './SlideRenderer';
import type { Slide } from '@/lessons/types';

export type { Slide } from '@/lessons/types';

export type LessonPlayerHandle = {
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  index: number;
};

type LessonPlayerProps = {
  lessonSlug: string;
  slides: Slide[];
  hideInternalNav?: boolean;
  onReachEnd?: () => void;
  onSlideChange?: (index: number) => void;
};

const LessonPlayer = forwardRef<LessonPlayerHandle, LessonPlayerProps>(
  ({ lessonSlug, slides, hideInternalNav = false, onReachEnd, onSlideChange }, ref) => {
    const [index, setIndex] = useState(0);

    const current = slides[index] ?? null;

    const canNext = () => index < slides.length - 1;

    const next = useCallback(() => {
      if (index >= slides.length - 1) return;
      const ni = index + 1;
      setIndex(ni);
      onSlideChange?.(ni);
      if (ni === slides.length - 1) onReachEnd?.();
    }, [index, onReachEnd, onSlideChange, slides.length]);

    const prev = useCallback(() => {
      if (index === 0) return;
      const ni = index - 1;
      setIndex(ni);
      onSlideChange?.(ni);
    }, [index, onSlideChange]);

    const goTo = useCallback((i: number) => {
      if (i < 0 || i >= slides.length) return;
      setIndex(i);
      onSlideChange?.(i);
    }, [onSlideChange, slides.length]);

    const currentSlideId = current?.id ?? null;

    useEffect(() => {
      if (!currentSlideId || slides.length === 0) return;
      const totalSlides = Math.max(slides.length, 1);
      const pct = Math.round(((index + 1) / totalSlides) * 100);
      const payload = {
        lesson_slug: lessonSlug,
        slide_id: currentSlideId,
        percent: pct,
        done: false,
      };
      fetch('/api/lesson-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }, [index, slides.length, currentSlideId, lessonSlug]);

    useImperativeHandle(ref, () => ({ next, prev, goTo, index }), [index, next, prev, goTo]);

    return (
      <div className="w-full flex flex-col h-full min-h-0">
        <div className="flex-1 flex items-center justify-center min-h-0">
          {current && <SlideRenderer slide={current} />}
          {!current && (
            <div className="text-center text-gray-500">
              Aucune diapositive n&apos;est disponible pour le moment.
            </div>
          )}
        </div>

        {!hideInternalNav && (
          <div className="border-t p-3 flex justify-between">
            <button onClick={prev} disabled={index === 0}>
              ← Précédent
            </button>
            <div>
              {slides.length > 0 ? `${index + 1} / ${slides.length}` : '0 / 0'}
            </div>
            <button onClick={next} disabled={!canNext()}>
              Suivant →
            </button>
          </div>
        )}
      </div>
    );
  }
);

LessonPlayer.displayName = 'LessonPlayer';
export default LessonPlayer;
