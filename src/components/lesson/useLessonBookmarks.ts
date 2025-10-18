'use client';

import { useEffect, useState, useCallback } from 'react';

export type LessonBookmark = {
  id: string;
  lesson_slug: string;
  slide_id: string;
  created_at: string;
};

export function useLessonBookmarks(lessonSlug: string) {
  const [bookmarks, setBookmarks] = useState<LessonBookmark[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/lesson-bookmarks?lesson_slug=${encodeURIComponent(lessonSlug)}`,
        { cache: 'no-store' }
      );
      const json = await res.json();
      setBookmarks(Array.isArray(json.data) ? json.data : []);
    } finally {
      setLoading(false);
    }
  }, [lessonSlug]);

  const add = useCallback(
    async (slideId: string) => {
      const res = await fetch('/api/lesson-bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson_slug: lessonSlug, slide_id: slideId }),
      });
      const json = await res.json();
      await load();
      return json;
    },
    [lessonSlug, load]
  );

  const isBookmarked = useCallback(
    (slideId: string) => bookmarks.some(b => b.slide_id === slideId),
    [bookmarks]
  );

  useEffect(() => { load(); }, [load]);

  return { bookmarks, loading, add, reload: load, isBookmarked };
}
