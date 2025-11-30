'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import type { AiSpeakStudentRepeatSlideProps, AiSpeakStudentRepeatElement } from '@/lessons/types';
import { getShowValue } from '@/lib/slideUtils';
import { fetchSpeechAsset } from '@/lib/speech';
import { DEFAULT_SPEECH_LANG } from '@/lib/voices';
import { calculateAccuracy, type ElementStatus } from './aiSpeakStudentRepeatStyles';
import { ElementRow, SkipButton, ControlButtons } from './AISpeakStudentRepeatUI';

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
                  <ElementRow
                    key={`row-${rowIndex}`}
                    elements={row}
                    rowStartIndex={rowStartIndex}
                    currentElementIndex={currentElementIndex}
                    elementStatus={elementStatus}
                    isSequenceStarted={isSequenceStarted}
                    onElementClick={(absoluteIndex) => {
                      if (currentElementIndex === absoluteIndex) {
                        // If clicking the current element, do nothing (recording handled by button)
                        return;
                      } else {
                        // Play the clicked element
                        playElement(absoluteIndex);
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Skip button - shown after 3 incorrect attempts */}
        <SkipButton
          show={currentElementIndex !== null && incorrectAttempts[currentElementIndex] >= 3}
          onClick={handleSkip}
        />
        
        {/* Listen, Pause/Resume, and Record buttons */}
        <ControlButtons
          onListen={handleListen}
          onPauseToggle={handlePauseToggle}
          isPaused={isPaused}
          isSequenceStarted={isSequenceStarted}
          currentElementIndex={currentElementIndex}
          isLoading={isLoading}
          isPlaying={isPlaying}
          error={error}
          elementsListLength={elementsList.length}
          recordButtonProps={{
            referenceText: elementsList[currentElementIndex ?? 0]?.referenceText ?? elementsList[currentElementIndex ?? 0]?.samplePrompt ?? '',
            onWordResults: handleWordResults(currentElementIndex ?? 0),
            autoStart: autoStartRecording[currentElementIndex ?? 0] ?? false,
            onRecordingComplete: () => handleRecordingComplete(currentElementIndex ?? 0),
            key: `record-${currentElementIndex ?? 0}-${autoStartRecording[currentElementIndex ?? 0]}-${isPaused}`,
          }}
        />
      </div>
    </div>
  );
}

