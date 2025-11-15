import TitleSlide from './TitleSlide';
import TextSlide from './TextSlide';
import AISpeakRepeatSlide from './AISpeakRepeatSlide';
import AISpeakStudentRepeatSlide from './AISpeakStudentRepeatSlide';

export const SlideRegistry = {
  'title-slide': TitleSlide,
  'text-slide': TextSlide,
  'ai-speak-repeat': AISpeakRepeatSlide,
  'ai-speak-student-repeat': AISpeakStudentRepeatSlide,
};

export type SlideType = keyof typeof SlideRegistry;
