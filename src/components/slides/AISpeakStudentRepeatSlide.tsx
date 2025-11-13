'use client';

import { OpenSourcePronunciation } from '@/components/lesson/OpenSourcePronunciation';
import type { AiSpeakStudentRepeatSlideProps } from '@/lessons/types';

export default function AISpeakStudentRepeatSlide({
  title,
  instructions,
  samplePrompt,
  promptLabel = 'Phrase à prononcer',
  referenceText,
}: AiSpeakStudentRepeatSlideProps) {
  const repeatText = referenceText ?? samplePrompt;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
      <div>
        <h2 className="text-3xl font-semibold text-[#222326]">{title}</h2>
        {instructions && <p className="mt-2 text-base text-[#555]">{instructions}</p>}
      </div>

      <div className="w-full max-w-2xl rounded-md border border-dashed border-[#999] bg-white/60 p-6 text-left">
        <p className="text-sm uppercase tracking-wide text-[#888]">{promptLabel}</p>
        <p className="mt-2 text-2xl font-medium text-[#222326]">{samplePrompt}</p>

        <div className="mt-6">
          <OpenSourcePronunciation referenceText={repeatText} showReferenceLabel={false} />
        </div>

        <p className="mt-4 text-sm text-[#666]">
          Votre enregistrement est envoyé au service de prononciation puis noté automatiquement.
        </p>
      </div>
    </div>
  );
}
