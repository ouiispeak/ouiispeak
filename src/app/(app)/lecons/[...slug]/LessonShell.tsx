"use client";

import React, { useRef, useState } from "react";
import LessonPlayer, {
  type LessonPlayerHandle,
  type Slide,
} from "./LessonPlayer";
import LessonLayout from "./LessonLayout";
import LessonSidebar from "./LessonSidebar";

type Props = {
  lessonSlug: string;
  slides: Slide[];
};

export default function LessonShell({ lessonSlug, slides }: Props) {
  const playerRef = useRef<LessonPlayerHandle>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const [moduleName, lessonName] = lessonSlug.split("/");

  const handleRestart = () => {
    playerRef.current?.goTo(0);
    setCurrentSlideIndex(0);
  };

  const handleSlideChange = (newIndex: number) => {
    setCurrentSlideIndex(newIndex);
  };

  return (
    <LessonLayout
      sidebar={
        <LessonSidebar 
          moduleName={moduleName} 
          lessonName={lessonName}
          lessonSlug={lessonSlug}
          currentSlideId={slides[currentSlideIndex]?.id}
          onRestart={handleRestart}
        />
      }
    >
      {/* PURPLE: Lesson player container */}
      <div className="w-full flex flex-col flex-1 p-4">
        <LessonPlayer
          ref={playerRef}
          lessonSlug={lessonSlug}
          slides={slides}
          hideInternalNav
          onSlideChange={handleSlideChange}
        />
      </div>

      {/* INDIGO: Navigation under the lesson */}
      <div className="flex items-center justify-between p-2">
        <button
          onClick={() => {
            playerRef.current?.prev();
            setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
          }}
          className="bg-[#edeae7] text-[#077373] rounded-md shadow-sm px-4 py-2 transition-all duration-200 hover:bg-[#d3e5de] hover:shadow-md active:bg-[#b8d3c8]"
        >
          Précédent
        </button>
        <button
          onClick={() => {
            playerRef.current?.next();
            setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1));
          }}
          className="bg-[#edeae7] text-[#077373] rounded-md shadow-sm px-4 py-2 transition-all duration-200 hover:bg-[#d3e5de] hover:shadow-md active:bg-[#b8d3c8]"
        >
          Suivant
        </button>
      </div>
    </LessonLayout>
  );
}
