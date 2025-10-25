"use client";

import React, { useRef } from "react";
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

  const [moduleName, lessonName] = lessonSlug.split("/");

  return (
    <LessonLayout
      sidebar={
        <LessonSidebar moduleName={moduleName} lessonName={lessonName} />
      }
    >
      <div className="w-full max-w-prose flex flex-col flex-1">
        <LessonPlayer
          ref={playerRef}
          lessonSlug={lessonSlug}
          slides={slides}
          hideInternalNav
        />
      </div>

      {/* Navigation under the lesson */}
      <div className="flex items-center">
        <button
          onClick={() => playerRef.current?.prev()}
        >
          Précédent
        </button>
        <button
          onClick={() => playerRef.current?.next()}
        >
          Suivant
        </button>
      </div>
    </LessonLayout>
  );
}
