import { parseLessonSlug, type LessonInfo } from '@/lib/lessonSlug';
import { getSlidesForLesson } from '@/lessons/registry';
import type { Slide } from '@/lessons/types';

export type ResolvedLesson = {
  lessonSlug: string;
  lessonInfo: LessonInfo;
  slides: Slide[];
};

/**
 * Normalize a slug input (string or string[]) into the canonical string form.
 * e.g. ["a0-module-1", "lesson-1"] -> "a0-module-1/lesson-1"
 */
function normalizeSlug(input: string | string[]): string {
  if (Array.isArray(input)) {
    return input.join('/');
  }
  return input;
}

/**
 * Resolve a lesson from a slug or slug segments.
 *
 * @param input - Lesson slug as string (e.g., "a0-module-1/lesson-1") or array of segments (e.g., ["a0-module-1", "lesson-1"])
 * @returns ResolvedLesson object with lessonSlug, lessonInfo, and slides, or null if the slug is invalid
 *
 * @remarks
 * For now we preserve current behaviour:
 * - If the slug is structurally invalid -> return null.
 * - If the slug is valid but getSlidesForLesson returns [] -> still return an object with slides: [].
 *   (We will decide later whether to treat [] as a 404.)
 */
export function resolveLessonFromSlug(
  input: string | string[],
): ResolvedLesson | null {
  const lessonSlug = normalizeSlug(input);

  // Check if lesson exists in registry first
  const slides = getSlidesForLesson(lessonSlug) ?? [];
  
  // Try to parse structured lesson info
  const lessonInfo = parseLessonSlug(lessonSlug);
  
  // If lesson exists in registry but doesn't match standard format,
  // create a minimal LessonInfo so the lesson can still be accessed
  if (!lessonInfo) {
    // Only return null if the lesson doesn't exist in registry at all
    if (slides.length === 0) {
      return null;
    }
    
    // Create a fallback LessonInfo for non-standard lessons
    return {
      lessonSlug,
      lessonInfo: {
        slug: lessonSlug,
        module: 'Other',
        lesson: lessonSlug.split('/').pop() ?? lessonSlug,
        displayName: lessonSlug.split('/').map(s => s.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(' · '),
        moduleKey: 'other',
      },
      slides,
    };
  }

  return {
    lessonSlug,
    lessonInfo,
    slides,
  };
}

