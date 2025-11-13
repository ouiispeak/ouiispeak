import type { Slide } from '@/lessons/types';
import { lessonSlug as slideCreatorSlug, slides as slideCreatorSlides } from '@/lessons/slide-templates/slide-creator-model';
import { lessonSlug as a0m1Lesson1Slug, slides as a0m1Lesson1Slides } from '@/lessons/A0/A0Module1Lesson1';
import { lessonSlug as a1m1Lesson1Slug, slides as a1m1Lesson1Slides } from '@/lessons/A1/A1Module1Lesson1';
import { lessonSlug as a2m1Lesson1Slug, slides as a2m1Lesson1Slides } from '@/lessons/A2/A2Module1Lesson1';
import { lessonSlug as b1m1Lesson1Slug, slides as b1m1Lesson1Slides } from '@/lessons/B1/B1Module1Lesson1';
import { lessonSlug as b2m1Lesson1Slug, slides as b2m1Lesson1Slides } from '@/lessons/B2/B2Module1Lesson1';
import { lessonSlug as c1m1Lesson1Slug, slides as c1m1Lesson1Slides } from '@/lessons/C1/C1Module1Lesson1';
import { lessonSlug as c2m1Lesson1Slug, slides as c2m1Lesson1Slides } from '@/lessons/C2/C2Module1Lesson1';
import {
  lessonSlug as slideTemplateRefSlug,
  slides as slideTemplateRefSlides,
} from '@/lessons/slide template ref/slide template ref lesson 1';

const registrations: Array<[string, Slide[]]> = [
  [slideCreatorSlug, slideCreatorSlides],
  [slideTemplateRefSlug, slideTemplateRefSlides],
  [a0m1Lesson1Slug, a0m1Lesson1Slides],
  [a1m1Lesson1Slug, a1m1Lesson1Slides],
  [a2m1Lesson1Slug, a2m1Lesson1Slides],
  [b1m1Lesson1Slug, b1m1Lesson1Slides],
  [b2m1Lesson1Slug, b2m1Lesson1Slides],
  [c1m1Lesson1Slug, c1m1Lesson1Slides],
  [c2m1Lesson1Slug, c2m1Lesson1Slides],
];

const lessonsBySlug: Record<string, Slide[]> = registrations.reduce<Record<string, Slide[]>>(
  (acc, [slug, slides]) => {
    acc[slug] = slides;
    return acc;
  },
  {},
);

export const registeredLessonSlugs = registrations.map(([slug]) => slug);

export function getSlidesForLesson(slug: string): Slide[] {
  return lessonsBySlug[slug] ?? [];
}
