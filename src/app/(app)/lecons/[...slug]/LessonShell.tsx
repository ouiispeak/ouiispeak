"use client";

import LessonPlayer from "./LessonPlayer";
import type { Slide } from '@/lessons/types';
import LessonChrome from "./LessonChrome";
import LessonSidebar from "./LessonSidebar";

type Props = {
  lessonSlug: string;
  slides: Slide[];
};

export default function LessonShell({ lessonSlug, slides }: Props) {
  const slugParts = lessonSlug.split('/').filter(Boolean);
  const moduleName = slugParts[0] ?? lessonSlug;
  const lessonName = slugParts[1] ?? null;
  const hasCanonicalSlug = slugParts.length >= 2;
  const playableSlides = hasCanonicalSlug ? slides : [];
  const currentSlide = playableSlides[0] ?? null;

  return (
    <LessonChrome
      sidebar={
        <LessonSidebar
          moduleName={moduleName}
          lessonName={lessonName}
          lessonSlug={lessonSlug}
          currentSlideId={currentSlide?.id}
        />
      }
    >
      <div className="flex h-full flex-1 flex-col gap-4">
        {!hasCanonicalSlug && (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">
            Cette leçon n&apos;est pas encore configurée correctement (slug incomplet). Ajoutez un module
            et une leçon pour continuer.
          </div>
        )}
        <div className="flex h-full flex-1">
          <LessonPlayer slides={playableSlides} />
        </div>
      </div>
    </LessonChrome>
  );
}
