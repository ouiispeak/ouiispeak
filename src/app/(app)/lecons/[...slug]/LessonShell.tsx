"use client";

import React, { useRef, useState } from "react";
import LessonPlayer, {
  type LessonPlayerHandle,
} from "./LessonPlayer";
import type { Slide } from '@/lessons/types';
import LessonChrome from "./LessonChrome";
import LessonSidebar from "./LessonSidebar";

type Props = {
  lessonSlug: string;
  slides: Slide[];
};

export default function LessonShell({ lessonSlug, slides }: Props) {
  const playerRef = useRef<LessonPlayerHandle>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slugParts = lessonSlug.split('/').filter(Boolean);
  const moduleName = slugParts[0] ?? lessonSlug;
  const lessonName = slugParts[1] ?? null;
  const hasCanonicalSlug = slugParts.length >= 2;
  const playableSlides = hasCanonicalSlug ? slides : [];
  const totalSlides = playableSlides.length;
  const currentSlide = playableSlides[currentSlideIndex];

  const handleRestart = () => {
    playerRef.current?.goTo(0);
    setCurrentSlideIndex(0);
  };

  const handleSlideChange = (newIndex: number) => {
    setCurrentSlideIndex(newIndex);
  };

  React.useEffect(() => {
    if (totalSlides === 0) {
      setCurrentSlideIndex(0);
      return;
    }
    if (currentSlideIndex > totalSlides - 1) {
      setCurrentSlideIndex(totalSlides - 1);
    }
  }, [totalSlides, currentSlideIndex]);

  return (
    <LessonChrome
      sidebar={
        <LessonSidebar 
          moduleName={moduleName} 
          lessonName={lessonName}
          lessonSlug={lessonSlug}
          currentSlideId={currentSlide?.id}
          onRestartAction={handleRestart}
        />
      }
    >
      {/* PURPLE: Lesson player container */}
      <div className="w-full flex flex-col flex-1 min-h-0">
        {!hasCanonicalSlug && (
          <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">
            Cette leçon n&apos;est pas encore configurée correctement (slug incomplet). Ajoutez un module
            et une leçon pour continuer.
          </div>
        )}
        <LessonPlayer
          ref={playerRef}
          lessonSlug={lessonSlug}
          slides={playableSlides}
          hideInternalNav
          onSlideChange={handleSlideChange}
        />
      </div>

      {/* INDIGO: Navigation under the lesson */}
      <div className="flex items-center justify-between p-2">
        <button
          onClick={() => {
            playerRef.current?.prev();
          }}
          className="bg-[#edeae7] text-[#077373] rounded-md shadow-sm px-4 py-2 transition-all duration-200 hover:bg-[#d3e5de] hover:shadow-md active:bg-[#b8d3c8]"
          disabled={currentSlideIndex === 0 || totalSlides === 0}
        >
          Précédent
        </button>
        <button
          onClick={() => {
            playerRef.current?.next();
          }}
          className="bg-[#edeae7] text-[#077373] rounded-md shadow-sm px-4 py-2 transition-all duration-200 hover:bg-[#d3e5de] hover:shadow-md active:bg-[#b8d3c8] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={
            totalSlides === 0 ||
            currentSlideIndex >= Math.max(totalSlides - 1, 0)
          }
        >
          Suivant
        </button>
      </div>
    </LessonChrome>
  );
}
