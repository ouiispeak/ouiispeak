'use client';

import { useEffect, useState, useCallback } from 'react';

export type LessonNote = {
  id: string;
  lesson_slug: string;
  slide_id: string | null;
  content: string;
  created_at: string;
};

export function useLessonNotes(lessonSlug: string) {
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/lesson-notes?lesson_slug=${encodeURIComponent(lessonSlug)}`,
        { cache: 'no-store' }
      );
      const json = await res.json();
      setNotes(Array.isArray(json.data) ? json.data : []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e?.message ?? 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  }, [lessonSlug]);

  const add = useCallback(
    async (content: string, slideId: string | null) => {
      const res = await fetch('/api/lesson-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson_slug: lessonSlug, slide_id: slideId, content }),
      });
      const json = await res.json();
      await load();
      return json;
    },
    [lessonSlug, load]
  );

  const hasAny = notes.length > 0;

  useEffect(() => { load(); }, [load]);

  return { notes, loading, error, add, reload: load, hasAny };
}
