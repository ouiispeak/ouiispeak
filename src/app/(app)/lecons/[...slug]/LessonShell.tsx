"use client";

import React, { useRef } from "react";
import LessonPlayer, {
  type LessonPlayerHandle,
  type Slide,
} from "./LessonPlayer";
import Link from "next/link";

type Props = {
  lessonSlug: string;
  slides: Slide[];
};

export default function LessonShell({ lessonSlug, slides }: Props) {
  const playerRef = useRef<LessonPlayerHandle>(null);

  const [moduleName, lessonName] = lessonSlug.split("/");

  return (
    <div className="flex flex-col md:flex-row w-full h-full flex-1 text-[#222326] bg-white">
      {/* MAIN LESSON AREA */}
      <div className="flex-1 min-w-0 p-6 flex flex-col items-center text-center">
        <div className="w-full max-w-prose flex flex-col flex-1">
          <LessonPlayer
            ref={playerRef}
            lessonSlug={lessonSlug}
            slides={slides}
            hideInternalNav
          />
        </div>

        {/* Navigation under the lesson */}
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
      <aside
        className="
          w-full md:w-56
          border-t md:border-t-0 md:border-l border-[#ddd]
          bg-white
          p-6 flex flex-col gap-4 text-sm text-center md:text-left
        "
      >
        <div className="font-medium">
          {moduleName} / {lessonName}
        </div>

        <hr className="border-[#ddd]" />

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

        <div className="mt-auto text-[10px] text-[#6b7280] text-center md:text-left">
          Barre latérale · outils
        </div>
      </aside>
    </div>
  );
}
