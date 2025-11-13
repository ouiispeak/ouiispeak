'use client';

import { OpenSourcePronunciation } from '@/components/lesson/OpenSourcePronunciation';

type PronunciationSlideProps = {
  referenceText: string;
  prompt?: string;
};

export default function PronunciationSlide({ referenceText, prompt }: PronunciationSlideProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-6 py-8 text-center md:px-10">
      {prompt && (
        <p className="text-sm text-gray-700 mb-1">{prompt}</p>
      )}
      <OpenSourcePronunciation referenceText={referenceText} />
    </div>
  );
}

