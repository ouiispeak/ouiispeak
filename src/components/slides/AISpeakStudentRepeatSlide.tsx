'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { OpenSourcePronunciation } from '@/components/lesson/OpenSourcePronunciation';
import type { AiSpeakStudentRepeatSlideProps, AiSpeakStudentRepeatElement } from '@/lessons/types';
import { getShowValue } from '@/lib/slideUtils';
import { fetchSpeechAsset } from '@/lib/speech';
import { DEFAULT_SPEECH_LANG } from '@/lib/voices';

const AudioIcon = () => (
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
    <path d="M11 5L6 9H2v6h4l5 4V5z" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const PauseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const ResumeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

type ElementStatus = 'pending' | 'correct' | 'incorrect' | 'passed';

const getElementStyles = (
  isCurrent: boolean,
  isPlayed: boolean,
  status: ElementStatus
) => {
  // Status-based colors take priority
  if (status === 'correct') {
    // Correct (≥80%) - green momentarily
    return {
      textColor: 'text-[#9bbfb2]',
      borderColor: 'border-[#9bbfb2]',
    };
  }
  if (status === 'incorrect') {
    // Incorrect (<80%) - red
    return {
      textColor: 'text-[#bf6f6f]',
      borderColor: 'border-[#bf6f6f]',
    };
  }
  if (status === 'passed') {
    // Passed - gray (default passed state)
    return {
      textColor: 'text-[#a6a198]',
      borderColor: 'border-[#a6a198]',
    };
  }
  
  // Status is 'pending' - use current/played logic
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

  // Group elements into rows of maximum 7 elements each (matching AISpeakRepeatSlide behavior)
  const elementRows = useMemo(() => {
    const rows: AiSpeakStudentRepeatElement[][] = [];
    const maxElementsPerRow = 7;
    
    for (let i = 0; i < elementsList.length; i += maxElementsPerRow) {
      rows.push(elementsList.slice(i, i + maxElementsPerRow));
    }
    
    return rows;
  }, [elementsList]);

  const [elementStatus, setElementStatus] = useState<ElementStatus[]>(
    () => elementsList.map(() => 'pending')
  );

  const [incorrectAttempts, setIncorrectAttempts] = useState<number[]>(
    () => elementsList.map(() => 0)
  );

  const [currentElementIndex, setCurrentElementIndex] = useState<number | null>(null);
  const [isSequenceStarted, setIsSequenceStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState<boolean[]>(() => elementsList.map(() => false));
  const [isLoading, setIsLoading] = useState<boolean[]>(() => elementsList.map(() => false));
  const [error, setError] = useState<(string | null)[]>(() => elementsList.map(() => null));
  const [autoStartRecording, setAutoStartRecording] = useState<boolean[]>(() => elementsList.map(() => false));
  const audioRefs = useRef<(HTMLAudioElement | null)[]>(elementsList.map(() => null));
  const assetRefs = useRef<Array<{ url: string; revoke?: () => void } | null>>(elementsList.map(() => null));
  const correctTimeoutRefs = useRef<Array<NodeJS.Timeout | null>>(elementsList.map(() => null));
  const latestWordResultsRef = useRef<Array<{ reference: string; actual: string | null; correct: boolean }[]>>(
    elementsList.map(() => [])
  );
  // Track pause state to restore on resume
  const pauseStateRef = useRef<{
    elementIndex: number | null;
    wasPlaying: boolean;
    wasWaitingForRecording: boolean;
  } | null>(null);

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
      // Cleanup timeouts
      correctTimeoutRefs.current.forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
      correctTimeoutRefs.current = elementsList.map(() => null);
    };
  }, []);

  const playElement = async (index: number) => {
    // Don't play if paused
    if (isPaused) return;

    const element = elementsList[index];
    const repeatText = element.referenceText ?? element.samplePrompt;
    if (!repeatText) return;

    // Clear any existing timeout for this element
    if (correctTimeoutRefs.current[index]) {
      clearTimeout(correctTimeoutRefs.current[index]);
      correctTimeoutRefs.current[index] = null;
    }

    // Reset status to pending when replaying (for incorrect attempts)
    if (elementStatus[index] === 'incorrect') {
      setElementStatus((prev) => {
        const newState = [...prev];
        newState[index] = 'pending';
        return newState;
      });
    }

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
    if (isSequenceStarted || isPaused) return;
    setIsSequenceStarted(true);
    // Set current element index first so the Record button is rendered
    setCurrentElementIndex(0);
    // Play the first element immediately
    await playElement(0);
  };

  const handlePauseToggle = async () => {
    if (isPaused) {
      // Resuming - restore state and continue from where we left off
      setIsPaused(false);
      
      const savedState = pauseStateRef.current;
      if (savedState && savedState.elementIndex !== null) {
        const index = savedState.elementIndex;
        
        // Only resume if this element hasn't been passed yet
        if (elementStatus[index] !== 'passed') {
          if (savedState.wasWaitingForRecording) {
            // Was waiting for recording to start - restore auto-start flag
            setAutoStartRecording((prev) => {
              const newState = [...prev];
              newState[index] = true;
              return newState;
            });
          } else if (savedState.wasPlaying || elementStatus[index] === 'pending' || elementStatus[index] === 'incorrect') {
            // Was playing audio or needs to start - replay the audio
            await playElement(index);
          }
        } else {
          // Element was passed, move to next one
          const nextIndex = index + 1;
          if (nextIndex < elementsList.length) {
            setCurrentElementIndex(nextIndex);
            await playElement(nextIndex);
          } else {
            // All elements complete
            setCurrentElementIndex(null);
          }
        }
      }
      
      // Clear saved state
      pauseStateRef.current = null;
    } else {
      // Pausing - save current state
      const wasPlaying = currentElementIndex !== null && isPlaying[currentElementIndex ?? -1];
      const wasWaitingForRecording = currentElementIndex !== null && autoStartRecording[currentElementIndex ?? -1];
      
      pauseStateRef.current = {
        elementIndex: currentElementIndex,
        wasPlaying: wasPlaying || false,
        wasWaitingForRecording: wasWaitingForRecording || false,
      };
      
      setIsPaused(true);
      
      // Stop any currently playing audio
      audioRefs.current.forEach((audio, index) => {
        if (audio) {
          audio.pause();
          audio.removeAttribute('src');
          audioRefs.current[index] = null;
          setIsPlaying((prev) => {
            const newState = [...prev];
            newState[index] = false;
            return newState;
          });
        }
      });
      
      // Clear any pending auto-start recordings (we'll restore on resume if needed)
      setAutoStartRecording((prev) => prev.map(() => false));
    }
  };

  const calculateAccuracy = (results: { reference: string; actual: string | null; correct: boolean }[]): number => {
    if (results.length === 0) return 0;
    const correctCount = results.filter((r) => r.correct).length;
    return (correctCount / results.length) * 100;
  };

  const handleRecordingComplete = (index: number) => {
    // Don't proceed if paused
    if (isPaused) return;

    // Reset auto-start flag
    setAutoStartRecording((prev) => {
      const newState = [...prev];
      newState[index] = false;
      return newState;
    });

    // Check accuracy from latest word results (use ref for synchronous access)
    const results = latestWordResultsRef.current[index];
    const accuracy = calculateAccuracy(results);

    if (accuracy >= 80) {
      // Correct - reset incorrect attempts counter
      setIncorrectAttempts((prev) => {
        const newState = [...prev];
        newState[index] = 0;
        return newState;
      });

      // Show green momentarily, then transition to passed
      setElementStatus((prev) => {
        const newState = [...prev];
        newState[index] = 'correct';
        return newState;
      });

      // After 1.5 seconds, transition to passed state
      correctTimeoutRefs.current[index] = setTimeout(() => {
        if (isPaused) return; // Don't proceed if paused during timeout
        
        setElementStatus((prev) => {
          const newState = [...prev];
          newState[index] = 'passed';
          return newState;
        });
        correctTimeoutRefs.current[index] = null;

        // Move to next element after showing green feedback
        const nextIndex = index + 1;
        if (nextIndex < elementsList.length) {
          setCurrentElementIndex(nextIndex);
          playElement(nextIndex);
        } else {
          // All elements complete
          setCurrentElementIndex(null);
        }
      }, 1500);
    } else {
      // Incorrect - increment attempt count and show red
      setIncorrectAttempts((prev) => {
        const newState = [...prev];
        newState[index] = (newState[index] || 0) + 1;
        return newState;
      });

      setElementStatus((prev) => {
        const newState = [...prev];
        newState[index] = 'incorrect';
        return newState;
      });

      // Replay the audio for this element
      setTimeout(() => {
        if (!isPaused) {
          playElement(index);
        }
      }, 500); // Small delay before replaying
    }
  };

  const handleSkip = () => {
    if (currentElementIndex === null) return;

    const index = currentElementIndex;
    
    // Mark element as passed
    setElementStatus((prev) => {
      const newState = [...prev];
      newState[index] = 'passed';
      return newState;
    });

    // Reset incorrect attempts for this element
    setIncorrectAttempts((prev) => {
      const newState = [...prev];
      newState[index] = 0;
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
    // Update ref immediately for synchronous access
    latestWordResultsRef.current[index] = results;
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
              {elementRows.map((row, rowIndex) => {
                // Calculate the starting index for this row
                const rowStartIndex = elementRows.slice(0, rowIndex).reduce((sum, r) => sum + r.length, 0);
                
                return (
                  <div
                    key={`row-${rowIndex}`}
                    className="flex flex-wrap justify-center gap-3 sm:gap-4"
                  >
                    {row.map((element, colIndex) => {
                      const elementIndex = rowStartIndex + colIndex;
                      const repeatText = element.referenceText ?? element.samplePrompt;
                      const showSamplePrompt = getShowValue(element.samplePrompt);
                      const isCurrentElement = currentElementIndex === elementIndex;
                      const isPlayed = isSequenceStarted && currentElementIndex !== null && currentElementIndex > elementIndex;
                      const status = elementStatus[elementIndex];
                      const styles = getElementStyles(isCurrentElement, isPlayed, status);

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
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Skip button - shown after 3 incorrect attempts */}
        {currentElementIndex !== null && incorrectAttempts[currentElementIndex] >= 3 && (
          <div className="flex justify-center pb-2">
            <button
              type="button"
              onClick={handleSkip}
              className="flex flex-col items-center gap-1 rounded-xl border border-[#e3e0dc] bg-transparent px-4 py-2.5 text-center font-normal font-sans text-sm text-[#222326] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9599] focus-visible:ring-offset-2 sm:px-5 sm:py-3 sm:text-base w-[100px] sm:w-[110px]"
              style={{ opacity: 0.6 }}
            >
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
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
              <span className="text-xs text-[#222326] whitespace-nowrap">Passer</span>
            </button>
          </div>
        )}
        
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
                isPaused ||
                (currentElementIndex !== null && 
                (isLoading[currentElementIndex] || isPlaying[currentElementIndex] || !elementsList[currentElementIndex]))
              }
              className="flex flex-col items-center gap-1 rounded-xl border px-4 py-2.5 text-center font-normal font-sans text-sm transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9599] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:px-5 sm:py-3 sm:text-base w-[100px] sm:w-[110px]"
              style={{
                borderColor: currentElementIndex !== null && isPlaying[currentElementIndex] ? '#9bbfb2' : '#e3e0dc',
                backgroundColor: currentElementIndex !== null && isPlaying[currentElementIndex] ? '#9bbfb2' : 'transparent',
                color: currentElementIndex !== null && isPlaying[currentElementIndex] ? '#222326' : '#222326',
                opacity: currentElementIndex !== null && isPlaying[currentElementIndex] ? 1 : 0.6,
              }}
            >
              <AudioIcon />
              <span className="text-xs whitespace-nowrap" style={{ color: '#222326' }}>
                {currentElementIndex !== null && isLoading[currentElementIndex] 
                  ? 'Chargement...' 
                  : currentElementIndex !== null && isPlaying[currentElementIndex]
                  ? 'Lecture...'
                  : 'Écouter'}
              </span>
            </button>
            
            {/* Pause/Resume button - always visible */}
            <button
              type="button"
              onClick={handlePauseToggle}
              disabled={!isSequenceStarted}
              className="flex flex-col items-center gap-1 rounded-xl border border-[#e3e0dc] bg-transparent px-4 py-2.5 text-center font-normal font-sans text-sm text-[#222326] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9599] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 sm:px-5 sm:py-3 sm:text-base w-[100px] sm:w-[110px]"
              style={{ opacity: !isSequenceStarted ? 0.6 : 0.6 }}
              aria-label={isPaused ? 'Resume activity' : 'Pause activity'}
            >
              {isPaused ? (
                <>
                  <ResumeIcon />
                  <span className="text-xs text-[#222326] whitespace-nowrap">Reprendre</span>
                </>
              ) : (
                <>
                  <PauseIcon />
                  <span className="text-xs text-[#222326] whitespace-nowrap">Pause</span>
                </>
              )}
            </button>
            
            {/* Record button - always visible, render for first element if sequence started */}
            <div className="flex flex-col items-center w-[100px] sm:w-[110px]">
              {(currentElementIndex !== null || isSequenceStarted) ? (
                <div className={isPaused ? 'opacity-50 pointer-events-none w-full' : 'w-full'}>
                  <OpenSourcePronunciation 
                    key={`record-${currentElementIndex ?? 0}-${autoStartRecording[currentElementIndex ?? 0]}-${isPaused}`}
                    referenceText={elementsList[currentElementIndex ?? 0].referenceText ?? elementsList[currentElementIndex ?? 0].samplePrompt} 
                    showReferenceLabel={false} 
                    buttonOnly={true}
                    onWordResults={handleWordResults(currentElementIndex ?? 0)}
                    hideWordChips={true}
                    autoStart={isPaused ? false : autoStartRecording[currentElementIndex ?? 0]}
                    onRecordingComplete={() => handleRecordingComplete(currentElementIndex ?? 0)}
                    buttonColor="#9bbfb2"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 w-[100px] sm:w-[110px]">
                  <div className="flex flex-col items-center gap-1 rounded-xl border border-[#e3e0dc] bg-transparent px-4 py-2.5 text-center font-normal font-sans text-sm text-[#222326] opacity-50 sm:px-5 sm:py-3 sm:text-base w-full">
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
                    <span className="text-xs text-[#222326] whitespace-nowrap">Record</span>
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

