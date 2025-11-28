import TitleSlide from './TitleSlide';
import TextSlide from './TextSlide';
import AISpeakRepeatSlide from './AISpeakRepeatSlide';
import StudentRecordAccuracySlide from './StudentRecordAccuracySlide';
import AISpeakStudentRepeatSlide from './AISpeakStudentRepeatSlide';
import SpeechMatchSlide from './SpeechMatchSlide';
import LessonEndSlide from './LessonEndSlide';

export const SlideRegistry = {
  'title-slide': TitleSlide,
  'text-slide': TextSlide,
  'ai-speak-repeat': AISpeakRepeatSlide,
  'student-record-accuracy': StudentRecordAccuracySlide,
  'ai-speak-student-repeat': AISpeakStudentRepeatSlide,
  'speech-match': SpeechMatchSlide,
  'lesson-end': LessonEndSlide,
};

export type SlideType = keyof typeof SlideRegistry;
