import type { LessonDef } from '../types';

export const lessonSlug = 'module-1/lesson-1';

export type Slide = 
  | { kind: 'text'; id: string; title?: string; html?: string }
  | { kind: 'note-required'; id: string; title?: string; prompt: string }
  | {
      kind: 'text-input-check';
      id: string;
      title?: string;
      prompt: string;
      mustInclude: string[]; // tokens the answer must contain (case-insensitive)
    };

export const slides: Slide[] = [
  {
    kind: 'text',
    id: 'welcome',
    title: 'Using the interface',
    html: "We're going to learn today! Use the right arrow to continue."
  },
  {
    kind: 'text',
    id: 'letters-read',
    title: 'Read these letters out loud',
    html: 'A B C'
  },
  {
    kind: 'text',
    id: 'repeat-after-me',
    title: 'Repeat after me',
    html: 'A, B, C'
  },
  {
    kind: 'note-required',
    id: 'note-difficulty',
    title: 'Notes',
    prompt: 'In your notes, write which letter was most difficult to pronounce, then save.'
  },
  {
    kind: 'text-input-check',
    id: 'site-name',
    title: 'Name the website',
    prompt: 'Type the name of this website.',
    mustInclude: ['ouii', 'speak']
  },
  {
    kind: 'text-input-check',
    id: 'review-abc',
    title: 'Review',
    prompt: 'What letters did I give you?',
    mustInclude: ['a', 'b', 'c']
  },
  {
    kind: 'text',
    id: 'finish',
    title: 'Great job!',
    html: "Use the 'Enregistrer & Quitter' button to exit. You'll return to the Leçons page."
  }
];

// Convert to LessonDef format for registry compatibility
const lessonDef: LessonDef = {
  moduleSlug: 'module-1',
  lessonSlug: 'lesson-1',
  slides: slides.map(slide => {
    switch (slide.kind) {
      case 'text':
        return {
          id: slide.id,
          title: slide.title || '',
          body: slide.html,
          kind: 'free' as const
        };
      case 'note-required':
        return {
          id: slide.id,
          title: slide.title || '',
          body: slide.prompt,
          kind: 'note' as const
        };
      case 'text-input-check':
        return {
          id: slide.id,
          title: slide.title || '',
          body: slide.prompt,
          kind: 'input' as const,
          accept: {
            includesAll: slide.mustInclude
          }
        };
    }
  })
};

export default lessonDef;