import TitleSlide from './TitleSlide';
import TextSlide from './TextSlide';
import AISpeakRepeatSlide from './AISpeakRepeatSlide';
import AISpeakStudentRepeatSlide from './AISpeakStudentRepeatSlide';
import PronunciationSlide from './PronunciationSlide';

export const SlideRegistry = {
  'title-slide': TitleSlide,
  'text-slide': TextSlide,
  'ai-speak-repeat': AISpeakRepeatSlide,
  'ai-speak-student-repeat': AISpeakStudentRepeatSlide,
  'pronunciation': PronunciationSlide,
};

export type SlideType = keyof typeof SlideRegistry;
