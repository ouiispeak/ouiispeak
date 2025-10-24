'use client';

import React, { useRef } from 'react';
import LessonPlayer, { type LessonPlayerHandle, type Slide } from './LessonPlayer';
import Link from 'next/link';

type Props = {
  lessonSlug: string;
  slides: Slide[];
};

export default function LessonShell({ lessonSlug, slides }: Props) {
  const playerRef = useRef<LessonPlayerHandle>(null);

  return (
    <>
      {/* MAIN LESSON AREA */}
      <div className="flex-1 min-w-0">
        <LessonPlayer
          ref={playerRef}
          lessonSlug={lessonSlug}
          slides={slides}
          hideInternalNav
        />
      </div>

      {/* SIDEBAR / TOOLS AREA */}
      <aside className="w-full md:w-56 border-t md:border-t-0 md:border-l border-[#ddd] p-4 flex flex-col gap-3 text-sm">
        <h3 className="font-medium text-[#222326] mb-2">Leçon</h3>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => playerRef.current?.prev()}
            className="text-[#222326] hover:text-blue-600 hover:underline text-left"
          >
            ⬅️ Précédent
          </button>
          <button 
            onClick={() => playerRef.current?.next()}
            className="text-[#222326] hover:text-blue-600 hover:underline text-left"
          >
            Suivant ➡️
          </button>
        </div>

        <div className="border-t border-[#ddd] pt-3 mt-3">
          <Link 
            href="/lecons"
            className="text-[#222326] hover:text-blue-600 hover:underline block"
          >
            💾 Enregistrer & Quitter
          </Link>
        </div>
      </aside>
    </>
  );
}
