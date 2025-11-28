import type { SlideType } from '@/components/slides';
import type { SupportedLang } from '@/lib/voices';

export type SpeechMode = 'tts' | 'file';

export type SpeechContent = {
  mode: SpeechMode;
  lang?: SupportedLang;
  text?: string;
  fileUrl?: string;
};

export type SpeakableSegment = {
  text: string;
  lang?: SupportedLang;
};

export type AiSpeakRepeatCell = {
  label: string;
  speech: SpeechContent;
};

export type AiSpeakRepeatSlideProps = {
  title: string;
  subtitle?: string;
  note?: string;
  defaultLang?: SupportedLang;
  lines: AiSpeakRepeatCell[][];
  gapClass?: string;
};

export type StudentRecordAccuracySlideProps = {
  title: string;
  instructions?: string;
  samplePrompt: string;
  promptLabel?: string;
  referenceText?: string;
};

export type AiSpeakStudentRepeatElement = {
  samplePrompt: string;
  referenceText?: string;
  speech?: SpeechContent; // Optional: if provided, use this instead of TTS. If mode is 'file', use fileUrl. If mode is 'tts' or not provided, generate TTS from referenceText/samplePrompt.
};

export type SlideLayout = 'vertical' | 'horizontal' | 'wrap' | 'grid';

export type AiSpeakStudentRepeatSlideProps = {
  title: string;
  instructions?: string;
  samplePrompt?: string; // For backwards compatibility
  promptLabel?: string;
  referenceText?: string; // For backwards compatibility
  elements?: AiSpeakStudentRepeatElement[]; // New: array of elements
  defaultLang?: SupportedLang;
  layout?: SlideLayout; // Layout direction: 'vertical' (default), 'horizontal', 'wrap', or 'grid'
};

export type SpeechMatchSlideProps = {
  title: string;
  subtitle?: string;
  note?: string;
  defaultLang?: SupportedLang;
  elements: AiSpeakRepeatCell[];
  gapClass?: string;
};

type BaseSlide<T extends SlideType, P> = {
  id: string;
  type: T;
  props: P;
};

type AiSpeakRepeatSlide = BaseSlide<'ai-speak-repeat', AiSpeakRepeatSlideProps>;
type StudentRecordAccuracySlide = BaseSlide<
  'student-record-accuracy',
  StudentRecordAccuracySlideProps
>;
type AiSpeakStudentRepeatSlide = BaseSlide<
  'ai-speak-student-repeat',
  AiSpeakStudentRepeatSlideProps
>;
type SpeechMatchSlide = BaseSlide<
  'speech-match',
  SpeechMatchSlideProps
>;

type RemainingSlide = BaseSlide<
  Exclude<SlideType, 'ai-speak-repeat' | 'student-record-accuracy' | 'ai-speak-student-repeat' | 'speech-match'>,
  Record<string, unknown>
>;

export type Slide = AiSpeakRepeatSlide | StudentRecordAccuracySlide | AiSpeakStudentRepeatSlide | SpeechMatchSlide | RemainingSlide;
