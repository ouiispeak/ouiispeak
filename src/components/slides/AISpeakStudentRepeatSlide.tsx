'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { OpenSourcePronunciation } from '@/components/lesson/OpenSourcePronunciation';
import type { AiSpeakStudentRepeatSlideProps, AiSpeakStudentRepeatElement } from '@/lessons/types';
import { getShowValue } from '@/lib/slideUtils';
import { fetchSpeechAsset } from '@/lib/speech';
import { DEFAULT_SPEECH_LANG } from '@/lib/voices';

const PlayIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M7 5l12 7-12 7V5z" />
  </svg>
);

const getElementStyles = (isCurrent: boolean, isPlayed: boolean) => {
  if (isCurrent) {
    // Currently being played - teal color
    return {
      textColor: 'text-[#0c9599]',
      borderColor: 'border-[#0c9599]',
    };
  }
  if (isPlayed) {
    // Finished playing - gray color
    return {
      textColor: 'text-[#a6a198]',
      borderColor: 'border-[#a6a198]',
    };
  }
  // Default - not played yet
  return {
    textColor: 'text-[#222326]',
    borderColor: 'border-[#e3e0dc]',
  };
};

export default function AISpeakStudentRepeatSlide({
  title,
  instructions,
  samplePrompt,
  promptLabel = 'Phrase à prononcer',
  referenceText,
  elements,
  defaultLang = DEFAULT_SPEECH_LANG,
}: AiSpeakStudentRepeatSlideProps) {
  // Parse NS (no show) syntax
  const showTitle = getShowValue(title);
  const showInstructions = getShowValue(instructions);
  const showPromptLabel = getShowValue(promptLabel);
  
  // Support both single element (backwards compatible) and multiple elements
  const elementsList: AiSpeakStudentRepeatElement[] = useMemo(() => {
    if (elements && elements.length > 0) {
      return elements;
    }
    if (samplePrompt) {
      return [{ samplePrompt, referenceText }];
    }
    return [];
  }, [elements, samplePrompt, referenceText]);

  const [wordResults, setWordResults] = useState<
    Array<{ reference: string; actual: string | null; correct: boolean }[]>
  >(() => elementsList.map(() => []));

  const [currentElementIndex, setCurrentElementIndex] = useState<number | null>(null);
  const [isSequenceStarted, setIsSequenceStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState<boolean[]>(() => elementsList.map(() => false));
  const [isLoading, setIsLoading] = useState<boolean[]>(() => elementsList.map(() => false));
  const [error, setError] = useState<(string | null)[]>(() => elementsList.map(() => null));
  const [autoStartRecording, setAutoStartRecording] = useState<boolean[]>(() => elementsList.map(() => false));
  const audioRefs = useRef<(HTMLAudioElement | null)[]>(elementsList.map(() => null));
  const assetRefs = useRef<Array<{ url: string; revoke?: () => void } | null>>(elementsList.map(() => null));

  useEffect(() => {
    return () => {
      // Cleanup audio on unmount
      audioRefs.current.forEach((audio) => {
        audio?.pause();
        audio?.removeAttribute('src');
      });
      audioRefs.current = elementsList.map(() => null);
      assetRefs.current.forEach((asset) => asset?.revoke?.());
      assetRefs.current = elementsList.map(() => null);
    };
  }, []);

  const playElement = async (index: number) => {
    const element = elementsList[index];
    const repeatText = element.referenceText ?? element.samplePrompt;
    if (!repeatText) return;

    // Stop any currently playing audio for this element
    if (audioRefs.current[index]) {
      audioRefs.current[index]?.pause();
      audioRefs.current[index]?.removeAttribute('src');
      audioRefs.current[index] = null;
    }

    setIsLoading((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
    setError((prev) => {
      const newState = [...prev];
      newState[index] = null;
      return newState;
    });

    try {
      // Use provided speech content if available, otherwise generate TTS
      const speechContent = element.speech ?? { 
        mode: 'tts' as const, 
        text: repeatText, 
        lang: defaultLang 
      };
      
      const asset = await fetchSpeechAsset(
        speechContent,
        { fallbackLang: defaultLang, fallbackText: repeatText }
      );
      
      assetRefs.current[index] = asset;

      // Create and play audio
      const audio = new Audio(asset.url);
      audioRefs.current[index] = audio;

      audio.addEventListener('ended', () => {
        console.log(`Audio ended for element ${index}, setting autoStartRecording[${index}] = true`);
        setIsPlaying((prev) => {
          const newState = [...prev];
          newState[index] = false;
          return newState;
        });
        audioRefs.current[index] = null;
        
        // After audio ends, immediately auto-start recording
        setAutoStartRecording((prev) => {
          const newState = [...prev];
          newState[index] = true;
          console.log(`Updated autoStartRecording[${index}] to true, new state:`, newState);
          return newState;
        });
      });

      audio.addEventListener('error', () => {
        setError((prev) => {
          const newState = [...prev];
          newState[index] = 'Erreur lors de la lecture audio';
          return newState;
        });
        setIsPlaying((prev) => {
          const newState = [...prev];
          newState[index] = false;
          return newState;
        });
        setIsLoading((prev) => {
          const newState = [...prev];
          newState[index] = false;
          return newState;
        });
        audioRefs.current[index] = null;
      });

      await audio.play();
      setIsPlaying((prev) => {
        const newState = [...prev];
        newState[index] = true;
        return newState;
      });
      setIsLoading((prev) => {
        const newState = [...prev];
        newState[index] = false;
        return newState;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Impossible de lire le texte';
      setError((prev) => {
        const newState = [...prev];
        newState[index] = errorMessage;
        return newState;
      });
      setIsLoading((prev) => {
        const newState = [...prev];
        newState[index] = false;
        return newState;
      });
      setIsPlaying((prev) => {
        const newState = [...prev];
        newState[index] = false;
        return newState;
      });
    }
  };

  const handleListen = async () => {
    if (isSequenceStarted) return;
    setIsSequenceStarted(true);
    // Set current element index first so the Record button is rendered
    setCurrentElementIndex(0);
    // Play the first element immediately
    await playElement(0);
  };

  const handleRecordingComplete = (index: number) => {
    // Reset auto-start flag
    setAutoStartRecording((prev) => {
      const newState = [...prev];
      newState[index] = false;
      return newState;
    });

    // Move to next element
    const nextIndex = index + 1;
    if (nextIndex < elementsList.length) {
      setCurrentElementIndex(nextIndex);
      playElement(nextIndex);
    } else {
      // All elements complete
      setCurrentElementIndex(null);
    }
  };

  const handleWordResults = (index: number) => (results: { reference: string; actual: string | null; correct: boolean }[]) => {
    setWordResults((prev) => {
      const newState = [...prev];
      newState[index] = results;
      return newState;
    });
  };


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
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                {elementsList.map((element, elementIndex) => {
                  const repeatText = element.referenceText ?? element.samplePrompt;
                  const showSamplePrompt = getShowValue(element.samplePrompt);
                  const isCurrentElement = currentElementIndex === elementIndex;
                  const isPlayed = isSequenceStarted && currentElementIndex !== null && currentElementIndex > elementIndex;
                  const styles = getElementStyles(isCurrentElement, isPlayed);

                  if (!showSamplePrompt || !repeatText) return null;

                  return (
                    <span
                      key={elementIndex}
                      className={`flex h-10 w-auto min-w-[2.5rem] sm:h-12 sm:min-w-[3rem] md:h-14 md:min-w-[3.5rem] lg:h-16 lg:min-w-[4rem] items-center justify-center rounded-xl border ${styles.borderColor} bg-transparent px-4 text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal font-sans ${styles.textColor} transition-colors duration-200 cursor-pointer transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9599] focus-visible:ring-offset-2`}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (currentElementIndex === elementIndex) {
                          // If clicking the current element, do nothing (recording handled by button)
                          return;
                        } else {
                          // Play the clicked element
                          playElement(elementIndex);
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          if (currentElementIndex !== elementIndex) {
                            playElement(elementIndex);
                          }
                        }
                      }}
                    >
                      {repeatText}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Listen and Record buttons side by side at the bottom */}
        <div className="flex flex-col items-center gap-4 pb-4">
          {currentElementIndex !== null && error[currentElementIndex] && (
            <p className="text-xs text-red-600 text-center">{error[currentElementIndex]}</p>
          )}
          
          <div className="flex items-center justify-center gap-4">
            {/* Listen button - always visible */}
            <button
              type="button"
              onClick={handleListen}
              disabled={
                currentElementIndex !== null && 
                (isLoading[currentElementIndex] || isPlaying[currentElementIndex] || !elementsList[currentElementIndex])
              }
              className="flex flex-col items-center gap-1 rounded-xl border border-[#e3e0dc] bg-transparent px-4 py-2.5 text-center font-normal font-sans text-sm text-[#222326] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9599] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:px-5 sm:py-3 sm:text-base"
            >
              <PlayIcon />
              <span className="text-xs text-[#222326]">
                {currentElementIndex !== null && isLoading[currentElementIndex] 
                  ? 'Chargement...' 
                  : currentElementIndex !== null && isPlaying[currentElementIndex]
                  ? 'Lecture...'
                  : 'Écouter'}
              </span>
            </button>
            
            {/* Record button - always visible, render for first element if sequence started */}
            <div className="flex flex-col items-center">
              {(currentElementIndex !== null || isSequenceStarted) ? (
                <OpenSourcePronunciation 
                  key={`record-${currentElementIndex ?? 0}-${autoStartRecording[currentElementIndex ?? 0]}`}
                  referenceText={elementsList[currentElementIndex ?? 0].referenceText ?? elementsList[currentElementIndex ?? 0].samplePrompt} 
                  showReferenceLabel={false} 
                  buttonOnly={true}
                  onWordResults={handleWordResults(currentElementIndex ?? 0)}
                  hideWordChips={true}
                  autoStart={autoStartRecording[currentElementIndex ?? 0]}
                  onRecordingComplete={() => handleRecordingComplete(currentElementIndex ?? 0)}
                  buttonColor="#ec4899"
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex flex-col items-center gap-1 rounded-xl border border-[#e3e0dc] bg-transparent px-4 py-2.5 text-center font-normal font-sans text-sm text-[#222326] opacity-50 sm:px-5 sm:py-3 sm:text-base">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                    <span className="text-xs text-[#222326]">Record</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

