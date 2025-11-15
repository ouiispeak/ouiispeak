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

export type AiSpeakStudentRepeatSlideProps = {
  title: string;
  instructions?: string;
  samplePrompt: string;
  promptLabel?: string;
  referenceText?: string;
};

type BaseSlide<T extends SlideType, P> = {
  id: string;
  type: T;
  props: P;
};

type AiSpeakRepeatSlide = BaseSlide<'ai-speak-repeat', AiSpeakRepeatSlideProps>;
type AiSpeakStudentRepeatSlide = BaseSlide<
  'ai-speak-student-repeat',
  AiSpeakStudentRepeatSlideProps
>;

type RemainingSlide = BaseSlide<
  Exclude<SlideType, 'ai-speak-repeat' | 'ai-speak-student-repeat'>,
  Record<string, unknown>
>;

export type Slide = AiSpeakRepeatSlide | AiSpeakStudentRepeatSlide | RemainingSlide;
