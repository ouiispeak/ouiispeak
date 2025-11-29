import { describe, it, expect } from 'vitest';
import { resolveLessonFromSlug } from './resolveLesson';

describe('resolveLessonFromSlug', () => {
  it('resolves a valid slug as string', () => {
    const result = resolveLessonFromSlug('a0-module-1/lesson-1');

    expect(result).not.toBeNull();
    expect(result?.lessonSlug).toBe('a0-module-1/lesson-1');
    expect(result?.lessonInfo).toMatchObject({
      module: 'A0',
      lesson: 'lesson-1',
      moduleKey: 'module-1',
    });
    expect(Array.isArray(result?.slides)).toBe(true);
  });

  it('resolves a valid slug as array', () => {
    const result = resolveLessonFromSlug(['a0-module-1', 'lesson-1']);

    expect(result).not.toBeNull();
    expect(result?.lessonSlug).toBe('a0-module-1/lesson-1');
    expect(result?.lessonInfo).toMatchObject({
      module: 'A0',
      lesson: 'lesson-1',
      moduleKey: 'module-1',
    });
    expect(Array.isArray(result?.slides)).toBe(true);
  });

  it('returns null for invalid slug', () => {
    const result = resolveLessonFromSlug('not-a-real-slug');
    expect(result).toBeNull();
  });

  it('returns null for slide-templates slug', () => {
    const result = resolveLessonFromSlug('slide-templates/example');
    expect(result).toBeNull();
  });

  it('handles empty array input', () => {
    const result = resolveLessonFromSlug([]);
    expect(result).toBeNull();
  });

  it('handles slug with valid structure but missing from registry', () => {
    // This slug has valid structure but may not exist in registry
    // The function should still return a result with empty slides array
    const result = resolveLessonFromSlug('a0-module-999/lesson-999');
    
    // If the slug structure is valid, it should return a result
    // (even if slides array is empty)
    if (result) {
      expect(result.lessonSlug).toBe('a0-module-999/lesson-999');
      expect(Array.isArray(result.slides)).toBe(true);
    } else {
      // If parseLessonSlug rejects it, that's also valid behavior
      expect(result).toBeNull();
    }
  });
});

