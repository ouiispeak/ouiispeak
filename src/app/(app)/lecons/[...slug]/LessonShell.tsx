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
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: '100vh' }}>
      <aside style={{ borderRight: '1px solid #ddd', padding: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Leçon</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          <button onClick={() => playerRef.current?.prev()}>⬅️ Précédent</button>
          <button onClick={() => playerRef.current?.next()}>Suivant ➡️</button>
          <Link href="/lecons">Enregistrer & Quitter</Link>
        </div>
      </aside>

      <section style={{ height: '100vh' }}>
        <LessonPlayer
          ref={playerRef}
          lessonSlug={lessonSlug}
          slides={slides}
          hideInternalNav
        />
      </section>
    </div>
  );
}
