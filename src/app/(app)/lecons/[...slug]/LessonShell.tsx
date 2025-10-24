"use client";

import React, { useRef } from "react";
import LessonPlayer, { type LessonPlayerHandle, type Slide } from './LessonPlayer';
import Link from 'next/link';

type Props = {
  lessonSlug: string;
  slides: Slide[];
};

export default function LessonShell({ lessonSlug, slides }: Props) {
  const playerRef = useRef<LessonPlayerHandle>(null);

  // Extract module and lesson names from slug
  const [moduleName, lessonName] = lessonSlug.split('/');

  return (
    <div className="flex flex-col md:flex-row">
      {/* MAIN LESSON AREA */}
      <div className="flex-1 min-w-0 p-6 flex flex-col items-center text-center">
        {/* This is where the actual lesson content / player goes */}
        <LessonPlayer
          ref={playerRef}
          lessonSlug={lessonSlug}
          slides={slides}
          hideInternalNav
        />

        {/* Navigation at the BOTTOM of the main area */}
        <div className="mt-6 flex items-center gap-4 text-sm">
          <button 
            onClick={() => playerRef.current?.prev()} 
            className="underline hover:text-blue-600 hover:underline"
          >
            Précédent
          </button>
          <button 
            onClick={() => playerRef.current?.next()} 
            className="underline hover:text-blue-600 hover:underline"
          >
            Suivant
          </button>
        </div>
      </div>

      {/* SIDEBAR / TOOLS AREA */}
      <aside className="w-full md:w-56 border-t md:border-t-0 md:border-l border-[#ddd] p-6 flex flex-col gap-4 text-sm text-center md:text-left bg-white">
        {/* Module / lesson label */}
        <div>
          <div className="font-medium">
            {moduleName} / {lessonName}
          </div>
        </div>

        <hr className="border-[#ddd]" />

        {/* Utility links / actions */}
        <button className="text-[#222326] hover:text-blue-600 hover:underline">
          Notes (présentes)
        </button>

        <button className="text-[#222326] hover:text-blue-600 hover:underline">
          Signet enregistré
        </button>

        <button className="text-[#222326] hover:text-blue-600 hover:underline">
          Aide
        </button>

        <button className="text-[#222326] hover:text-blue-600 hover:underline">
          Redémarrer
        </button>

        <Link 
          href="/lecons"
          className="text-[#222326] hover:text-blue-600 hover:underline"
        >
          Quitter
        </Link>
      </aside>
    </div>
  );
}
