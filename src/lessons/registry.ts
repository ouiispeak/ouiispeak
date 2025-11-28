import type { Slide } from '@/lessons/types';
import { lessonSlug as slideCreatorSlug, slides as slideCreatorSlides } from '@/lessons/slide-templates/slide-creator-model';
import { lessonSlug as a0m1Lesson1Slug, slides as a0m1Lesson1Slides } from '@/lessons/A0/A0Module1Lesson1';
import { lessonSlug as a0m1Lesson2Slug, slides as a0m1Lesson2Slides } from '@/lessons/A0/A0Module1Lesson2';
import { lessonSlug as a0m1Lesson3Slug, slides as a0m1Lesson3Slides } from '@/lessons/A0/A0Module1Lesson3';
import { lessonSlug as a0m1Lesson4Slug, slides as a0m1Lesson4Slides } from '@/lessons/A0/A0Module1Lesson4';
import { lessonSlug as a0m1Lesson5Slug, slides as a0m1Lesson5Slides } from '@/lessons/A0/A0Module1Lesson5';
import { lessonSlug as a0m1Lesson6Slug, slides as a0m1Lesson6Slides } from '@/lessons/A0/A0Module1Lesson6';
import { lessonSlug as a0m1Lesson7Slug, slides as a0m1Lesson7Slides } from '@/lessons/A0/A0Module1Lesson7';
import { lessonSlug as a0m1Lesson8Slug, slides as a0m1Lesson8Slides } from '@/lessons/A0/A0Module1Lesson8';
import { lessonSlug as a0m1Lesson9Slug, slides as a0m1Lesson9Slides } from '@/lessons/A0/A0Module1Lesson9';
import { lessonSlug as a0m1Lesson10Slug, slides as a0m1Lesson10Slides } from '@/lessons/A0/A0Module1Lesson10';
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
  [a0m1Lesson2Slug, a0m1Lesson2Slides],
  [a0m1Lesson3Slug, a0m1Lesson3Slides],
  [a0m1Lesson4Slug, a0m1Lesson4Slides],
  [a0m1Lesson5Slug, a0m1Lesson5Slides],
  [a0m1Lesson6Slug, a0m1Lesson6Slides],
  [a0m1Lesson7Slug, a0m1Lesson7Slides],
  [a0m1Lesson8Slug, a0m1Lesson8Slides],
  [a0m1Lesson9Slug, a0m1Lesson9Slides],
  [a0m1Lesson10Slug, a0m1Lesson10Slides],
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
