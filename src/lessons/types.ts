export type SlideKind = 'free' | 'input' | 'note';

export type SlideDef = {
  id: string;
  title: string;
  body?: string;
  kind: SlideKind;
  // For `input` slides, define acceptance:
  accept?: {
    // All tokens that must be present (case-insensitive; punctuation ignored)
    includesAll?: string[];
    // Optional regex strings (joined OR)
    regexes?: string[];
  };
};

export type LessonDef = {
  moduleSlug: string;
  lessonSlug: string;
  slides: SlideDef[];
};
