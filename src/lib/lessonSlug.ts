// src/lib/lessonSlug.ts

export type LessonInfo = {
  slug: string;
  module: string;      // e.g. "A0"
  lesson: string;      // e.g. "lesson-1"
  displayName: string;
  moduleKey: string;   // e.g. "module-1"
};

/**
 * Converts a lesson slug (e.g., "a0-module-1/lesson-1") into a human-readable display name.
 * @param slug - The lesson slug string
 * @returns Humanized display name (e.g., "A0 Module 1 · Lesson 1")
 */
export function humanizeLessonSlug(slug: string): string {
  if (slug.includes('slide-templates')) {
    return 'Prototype de diapositive';
  }

  return slug
    .split('/')
    .map((segment) => segment.replace(/-/g, ' '))
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' · ');
}

/**
 * Parses a lesson slug string into structured lesson information.
 * @param slug - The lesson slug (e.g., "a0-module-1/lesson-1")
 * @returns LessonInfo object with parsed components, or null if the slug format is invalid
 */
export function parseLessonSlug(slug: string): LessonInfo | null {
  if (slug.includes('slide-templates')) return null;

  const parts = slug.split('/');
  if (parts.length < 2) return null;

  const modulePart = parts[0];
  const lessonPart = parts[1];

  // Extract module level (e.g., "a0-module-1" -> "A0")
  const moduleMatch = modulePart.match(/^([a-c]\d+)/i);
  if (!moduleMatch) return null;

  // Extract module key (e.g., "a0-module-1" -> "module-1")
  const moduleKeyMatch = modulePart.match(/module-(\d+)/i);
  const moduleKey = moduleKeyMatch ? `module-${moduleKeyMatch[1]}` : modulePart;

  const moduleLevel = moduleMatch[1].toUpperCase();

  return {
    slug,
    module: moduleLevel,
    lesson: lessonPart,
    displayName: humanizeLessonSlug(slug),
    moduleKey,
  };
}
