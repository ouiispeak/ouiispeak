'use client';

import { OpenSourcePronunciation } from '@/components/lesson/OpenSourcePronunciation';
import type { AiSpeakStudentRepeatSlideProps } from '@/lessons/types';
import { getShowValue } from '@/lib/slideUtils';

export default function AISpeakStudentRepeatSlide({
  title,
  instructions,
  samplePrompt,
  promptLabel = 'Phrase à prononcer',
  referenceText,
}: AiSpeakStudentRepeatSlideProps) {
  // Parse NS (no show) syntax
  const showTitle = getShowValue(title);
  const showInstructions = getShowValue(instructions);
  const showPromptLabel = getShowValue(promptLabel);
  const showSamplePrompt = getShowValue(samplePrompt);
  const repeatText = referenceText ?? samplePrompt;

  return (
    <div className="flex h-full w-full flex-col px-6 py-10 leading-relaxed md:leading-loose pt-2 md:pt-4">
      {showTitle && <h2 className="mb-4 md:mb-6 text-left text-2xl font-normal tracking-wide text-balance text-[#222326]">{showTitle}</h2>}
      {showInstructions && (
        <p className="mb-4 md:mb-6 text-left text-lg text-[#192026]/80 text-balance">{showInstructions}</p>
      )}

      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center -mt-8">
          <div className="w-full max-w-4xl px-4">
            <div className="flex flex-col items-center gap-4">
              {showPromptLabel && (
                <p className="mb-2 text-sm uppercase tracking-wide text-[#888]">{showPromptLabel}</p>
              )}
              {showSamplePrompt && (
                <span className="inline-flex items-center justify-center rounded-xl border border-[#e3e0dc] bg-transparent px-6 py-4 text-center text-[3em] font-normal font-sans text-[#222326] whitespace-nowrap">
                  {showSamplePrompt}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-center pb-4">
          <OpenSourcePronunciation referenceText={repeatText} showReferenceLabel={false} buttonOnly={true} />
        </div>
      </div>
    </div>
  );
}
