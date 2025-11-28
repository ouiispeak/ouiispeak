'use client';

import { useState } from 'react';
import { OpenSourcePronunciation } from '@/components/lesson/OpenSourcePronunciation';
import type { StudentRecordAccuracySlideProps } from '@/lessons/types';
import { getShowValue } from '@/lib/slideUtils';

export default function StudentRecordAccuracySlide({
  title,
  instructions,
  samplePrompt,
  promptLabel = 'Phrase à prononcer',
  referenceText,
}: StudentRecordAccuracySlideProps) {
  // Parse NS (no show) syntax
  const showTitle = getShowValue(title);
  const showInstructions = getShowValue(instructions);
  const showPromptLabel = getShowValue(promptLabel);
  const showSamplePrompt = getShowValue(samplePrompt);
  const repeatText = referenceText ?? samplePrompt;

  const [wordResults, setWordResults] = useState<
    { reference: string; actual: string | null; correct: boolean }[]
  >([]);

  const referenceWords = repeatText ? repeatText.split(' ') : [];

  return (
    <div className="flex min-h-[60vh] md:h-full w-full flex-col px-4 py-6 sm:px-6 sm:py-8 lg:py-10 leading-relaxed md:leading-loose pt-2 md:pt-4">
      {showTitle && <h2 className="mb-3 sm:mb-4 md:mb-6 text-left text-xl sm:text-2xl md:text-3xl font-normal tracking-wide text-balance text-[#222326]">{showTitle}</h2>}
      {showInstructions && (
        <p className="mb-3 sm:mb-4 md:mb-6 text-left text-base sm:text-lg leading-relaxed sm:leading-loose text-[#192026]/80 text-balance">{showInstructions}</p>
      )}

      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center sm:-mt-6 md:-mt-8">
          <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl px-4">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              {showPromptLabel && (
                <p className="mb-2 text-sm uppercase tracking-wide text-[#888]">{showPromptLabel}</p>
              )}
              {showSamplePrompt && repeatText && (
                <span className="text-center text-lg sm:text-xl md:text-2xl lg:text-[clamp(1.5rem,4vw,2.5rem)] font-normal font-sans text-[#222326] whitespace-normal break-words">
                  {referenceWords.map((word, index) => {
                    const result = wordResults[index];
                    const isCorrect = result?.correct === true;
                    const isIncorrect = result && result.correct === false;

                    const colorClass = isCorrect
                      ? 'text-[#247368]'
                      : isIncorrect
                      ? 'text-[#a6a198]'
                      : '';

                    return (
                      <span key={`${word}-${index}`}>
                        <span
                          className={`inline-block rounded-md px-1 py-0.5 ${colorClass}`}
                        >
                          {word}
                        </span>
                        {index < referenceWords.length - 1 && ' '}
                      </span>
                    );
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 pb-4">
          <OpenSourcePronunciation 
            referenceText={repeatText} 
            showReferenceLabel={false} 
            buttonOnly={true}
            onWordResults={setWordResults}
            hideWordChips={true}
          />
        </div>
      </div>
    </div>
  );
}

