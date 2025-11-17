"use client";

import { useEffect, useState } from "react";
import LessonPlayer from "./LessonPlayer";
import type { Slide } from '@/lessons/types';
import LessonChrome from "./LessonChrome";
import LessonSidebar from "./LessonSidebar";
import SoftIconButton from "@/components/CircleButton";
import LessonProgressBar from "@/components/lesson/LessonProgressBar";

const ChevronLeftIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-7 w-7"
    aria-hidden="true"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-7 w-7"
    aria-hidden="true"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

type Props = {
  lessonSlug: string;
  slides: Slide[];
};

export default function LessonShell({ lessonSlug, slides }: Props) {
  type SidebarState = 'full' | 'collapsed' | 'hidden';
  type VisibleSidebarState = 'full' | 'collapsed';

  const [sidebarState, setSidebarState] = useState<SidebarState>('full');
  const [lastVisibleSidebarState, setLastVisibleSidebarState] =
    useState<VisibleSidebarState>('full');
  const [currentIndex, setCurrentIndex] = useState(0);
  const handleRestartAction = () => {
    setCurrentIndex(0);
  };

  const handleSidebarStateChange = (next: SidebarState) => {
    if (next === 'hidden') {
      setLastVisibleSidebarState((prev) => {
        // Only update the remembered state when we are hiding from a visible state
        if (sidebarState === 'full' || sidebarState === 'collapsed') {
          return sidebarState;
        }
        return prev;
      });
      setSidebarState('hidden');
      return;
    }

    // For 'full' and 'collapsed', update both current and last visible
    setSidebarState(next);
    setLastVisibleSidebarState(next);
  };

  const slugParts = lessonSlug.split('/').filter(Boolean);
  const hasCanonicalSlug = slugParts.length >= 2;
  const playableSlides = hasCanonicalSlug ? slides : [];
  const effectiveIndex = playableSlides.length > 0 ? Math.min(currentIndex, playableSlides.length - 1) : 0;
  const currentSlide = playableSlides[effectiveIndex] ?? null;

  useEffect(() => {
    if (playableSlides.length === 0) {
      if (currentIndex !== 0) {
        setCurrentIndex(0);
      }
      return;
    }
    const maxIndex = playableSlides.length - 1;
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [currentIndex, playableSlides.length]);

  const prevDisabled = effectiveIndex === 0;
  const nextDisabled = effectiveIndex >= playableSlides.length - 1;

  return (
    <LessonChrome
      sidebarState={sidebarState}
      sidebar={
        <LessonSidebar
          lessonSlug={lessonSlug}
          currentSlideId={currentSlide?.id}
          sidebarState={sidebarState}
          lastVisibleSidebarState={lastVisibleSidebarState}
          onSidebarStateChange={handleSidebarStateChange}
          onRestartAction={handleRestartAction}
        />
      }
    >
      {!hasCanonicalSlug && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          Cette leçon n&apos;est pas encore configurée correctement (slug incomplet). Ajoutez un module
          et une leçon pour continuer.
        </div>
      )}
      <LessonPlayer
        slides={playableSlides}
        currentIndex={effectiveIndex}
      />
      <div className="flex items-center justify-between gap-4 text-base">
        <SoftIconButton
          ariaLabel="Aller à la diapositive précédente"
          onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}
          disabled={prevDisabled}
        >
          <ChevronLeftIcon />
        </SoftIconButton>
        <LessonProgressBar current={effectiveIndex} total={playableSlides.length} showLabel={false} ariaLabel="Progression de la leçon" className="max-w-xs" />
        <SoftIconButton
          ariaLabel="Aller à la diapositive suivante"
          onClick={() => setCurrentIndex((value) => Math.min(playableSlides.length - 1, value + 1))}
          disabled={nextDisabled}
        >
          <ChevronRightIcon />
        </SoftIconButton>
      </div>
    </LessonChrome>
  );
}
