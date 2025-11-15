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
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center leading-relaxed md:leading-loose pt-2 md:pt-4">
      <p className="text-base font-semibold mb-4 text-[#192026]">
        Ta mission : écoute, puis parle quand tu es prêt·e.
      </p>
      <div>
        <h2 className="mb-4 md:mb-6 mt-4 md:mt-6 text-3xl font-semibold text-[#222326]">{title}</h2>
        {instructions && <p className="mb-4 md:mb-5 mt-2 text-base text-[#555]">{instructions}</p>}
      </div>

      <div className="w-full max-w-2xl rounded-md border border-dashed border-[#999] bg-[#f3f1ef] p-6 text-left mb-6 md:mb-8 mt-4 md:mt-6">
        <p className="mb-4 md:mb-5 text-sm uppercase tracking-wide text-[#888]">{promptLabel}</p>
        <p className="mb-4 md:mb-5 mt-2 text-[1.15em] font-medium leading-relaxed text-[#192026]">{samplePrompt}</p>

        <div className="mt-6">
          <OpenSourcePronunciation referenceText={repeatText} showReferenceLabel={false} />
        </div>

        <p className="mb-4 md:mb-5 mt-4 text-sm text-[#666]">
          Votre enregistrement est envoyé au service de prononciation puis noté automatiquement.
        </p>
      </div>
    </div>
  );
}
