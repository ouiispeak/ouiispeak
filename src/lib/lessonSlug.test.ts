import { describe, it, expect } from 'vitest';
import { parseLessonSlug, humanizeLessonSlug } from './lessonSlug';

describe('parseLessonSlug', () => {
  it('parses a valid lesson slug correctly', () => {
    const result = parseLessonSlug('a0-module-1/lesson-1');

    expect(result).not.toBeNull();
    expect(result).toMatchObject({
      slug: 'a0-module-1/lesson-1',
      module: 'A0',
      lesson: 'lesson-1',
      moduleKey: 'module-1',
    });
    expect(result?.displayName).toBeTruthy();
  });

  it('returns null for invalid slug format', () => {
    const result = parseLessonSlug('invalid-slug');
    expect(result).toBeNull();
  });

  it('returns null for slide-templates slug', () => {
    const result = parseLessonSlug('slide-templates/example');
    expect(result).toBeNull();
  });

  it('returns null for slug with less than 2 parts', () => {
    const result = parseLessonSlug('a0-module-1');
    expect(result).toBeNull();
  });

  it('handles different module levels correctly', () => {
    const a1Result = parseLessonSlug('a1-module-1/lesson-1');
    expect(a1Result?.module).toBe('A1');

    const b2Result = parseLessonSlug('b2-module-2/lesson-5');
    expect(b2Result?.module).toBe('B2');
    expect(b2Result?.moduleKey).toBe('module-2');
  });
});

describe('humanizeLessonSlug', () => {
  it('converts a lesson slug to human-readable format', () => {
    const result = humanizeLessonSlug('a0-module-1/lesson-1');
    expect(result).toBe('A0 module 1 · Lesson 1');
  });

  it('handles slide-templates slug specially', () => {
    const result = humanizeLessonSlug('slide-templates/example');
    expect(result).toBe('Prototype de diapositive');
  });

  it('handles single-segment slugs', () => {
    const result = humanizeLessonSlug('test-slug');
    expect(result).toBe('Test slug');
  });
});

