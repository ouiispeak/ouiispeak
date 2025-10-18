import type { LessonDef } from './types';
import lesson1 from './module-1/lesson-1';

const registry: LessonDef[] = [lesson1];

export function getLesson(moduleSlug: string, lessonSlug: string): LessonDef | null {
  return registry.find(l => l.moduleSlug === moduleSlug && l.lessonSlug === lessonSlug) ?? null;
}
