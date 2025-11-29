'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type SVGProps,
} from 'react';
import type { SpeechMatchSlideProps } from '@/lessons/types';
import { DEFAULT_SPEECH_LANG } from '@/lib/voices';
import { fetchSpeechAsset, type SpeechAsset } from '@/lib/speech';
import { getShowValue } from '@/lib/slideUtils';

const playIconProps: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-4 w-4',
  'aria-hidden': true,
};

const AudioIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg {...playIconProps} className={className}>
    <path d="M11 5L6 9H2v6h4l5 4V5z" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const PlayIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg {...playIconProps} className={className}>
    <path d="M7 5l12 7-12 7V5z" />
  </svg>
);

const PauseIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg {...playIconProps} className={className}>
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const ResumeIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg {...playIconProps} className={className}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

export default function SpeechMatchSlide({
  title,
  subtitle,
  note,
  elements,
  defaultLang = DEFAULT_SPEECH_LANG,
  gapClass: _gapClass = 'gap-3 sm:gap-4',
}: SpeechMatchSlideProps) {
  // Parse NS (no show) syntax
  const showTitle = getShowValue(title);
  const showSubtitle = getShowValue(subtitle);
  const showNote = getShowValue(note);
  
  const [currentTargetIndex, setCurrentTargetIndex] = useState<number | null>(null);
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedIndices, setCompletedIndices] = useState<Set<number>>(new Set());
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const audioCache = useRef<Map<number, SpeechAsset>>(new Map());
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const availableIndicesRef = useRef<number[]>([]);
  // Track pause state to restore on resume
  const pauseStateRef = useRef<{
    targetIndex: number | null;
    wasPlaying: boolean;
  } | null>(null);

  const playElement = useCallback(
    async (index: number) => {
      // Don't play if paused
      if (isPaused) return;

      const element = elements[index];
      if (!element) return;

      try {
        setIsPlaying(true);
        setError(null);

        // Stop any currently playing audio
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current.removeAttribute('src');
          currentAudioRef.current = null;
        }

        // Get or create audio asset
        let asset = audioCache.current.get(index);
        if (!asset) {
          asset = await fetchSpeechAsset(element.speech, { fallbackLang: defaultLang });
          audioCache.current.set(index, asset);
        }

        const audio = new Audio(asset.url);
        currentAudioRef.current = audio;

        audio.addEventListener('ended', () => {
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
            setIsPlaying(false);
          }
        });

        audio.addEventListener('error', () => {
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
            setIsPlaying(false);
          }
          const fallbackLabel = element.label ?? 'élément';
          setError(`Impossible de lire l'élément "${fallbackLabel}"`);
        });

        await audio.play();
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Impossible de lire cet élément.');
        setIsPlaying(false);
        if (currentAudioRef.current) {
          currentAudioRef.current = null;
        }
      }
    },
    [elements, defaultLang, isPaused],
  );

  const selectRandomElement = useCallback(() => {
    // Don't select if paused
    if (isPaused) return;

    const allIndices = elements.map((_, index) => index);
    const available = allIndices.filter(
      (index) => !completedIndices.has(index)
    );
    
    if (available.length === 0) {
      // All elements completed
      setMessage('Bravo ! Tu as terminé tous les éléments.');
      return;
    }

    const randomIndex = available[Math.floor(Math.random() * available.length)];
    setCurrentTargetIndex(randomIndex);
    setWrongIndex(null);
    setMessage(null);
    playElement(randomIndex);
  }, [completedIndices, elements, playElement, isPaused]);

  // Initialize available indices when completed indices change
  useEffect(() => {
    const allIndices = elements.map((_, index) => index);
    availableIndicesRef.current = allIndices.filter(
      (index) => !completedIndices.has(index)
    );
    
    // Only auto-select next element if activity has started, not paused, and we need a new target
    if (hasStarted && !isPaused && availableIndicesRef.current.length > 0 && currentTargetIndex === null && !isPlaying) {
      selectRandomElement();
    }
  }, [elements, completedIndices, currentTargetIndex, isPlaying, selectRandomElement, hasStarted, isPaused]);

  const handleStart = useCallback(() => {
    if (!hasStarted) {
      setHasStarted(true);
      selectRandomElement();
    }
  }, [hasStarted, selectRandomElement]);

  const handleElementClick = useCallback(
    (index: number) => {
      // Don't allow clicks if activity hasn't started
      if (!hasStarted) return;
      
      // Don't allow clicks if paused
      if (isPaused) return;
      
      // Don't allow clicks while audio is playing
      if (isPlaying) return;
      
      // Don't allow clicks on already completed elements
      if (completedIndices.has(index)) return;

      // If no target is set, select a random one
      if (currentTargetIndex === null) {
        selectRandomElement();
        return;
      }

      // Check if clicked element matches the target
      if (index === currentTargetIndex) {
        // Correct answer
        setCompletedIndices((prev) => new Set([...prev, index]));
        setWrongIndex(null);
        setMessage(null);
        
        // Wait a moment to show green, then select next element
        setTimeout(() => {
          setCurrentTargetIndex(null);
          // selectRandomElement will be called by useEffect
        }, 1000);
      } else {
        // Wrong answer
        setWrongIndex(index);
        setMessage('Essaie encore.');
        
        // Clear wrong state after a delay
        setTimeout(() => {
          setWrongIndex(null);
          setMessage(null);
        }, 2000);
      }
    },
    [isPlaying, currentTargetIndex, completedIndices, playElement, selectRandomElement, hasStarted, isPaused],
  );

  const handleElementKeyDown = useCallback(
    (event: KeyboardEvent<HTMLSpanElement>, index: number) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleElementClick(index);
      }
    },
    [handleElementClick],
  );

  const handleReplay = useCallback(() => {
    if (currentTargetIndex !== null && !isPlaying && !isPaused) {
      playElement(currentTargetIndex);
    }
  }, [currentTargetIndex, isPlaying, playElement, isPaused]);

  const handlePauseToggle = useCallback(async () => {
    if (isPaused) {
      // Resuming - restore state and continue from where we left off
      setIsPaused(false);
      
      const savedState = pauseStateRef.current;
      if (savedState) {
        if (savedState.targetIndex !== null) {
          // Restore the target index
          setCurrentTargetIndex(savedState.targetIndex);
          
          // If audio was playing, replay it
          if (savedState.wasPlaying) {
            await playElement(savedState.targetIndex);
          }
        } else if (hasStarted && currentTargetIndex === null) {
          // No target was set, select a new one
          selectRandomElement();
        }
      }
      
      // Clear saved state
      pauseStateRef.current = null;
    } else {
      // Pausing - save current state
      const wasPlaying = isPlaying;
      
      pauseStateRef.current = {
        targetIndex: currentTargetIndex,
        wasPlaying: wasPlaying || false,
      };
      
      setIsPaused(true);
      
      // Stop any currently playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.removeAttribute('src');
        currentAudioRef.current = null;
        setIsPlaying(false);
      }
    }
  }, [isPaused, isPlaying, currentTargetIndex, hasStarted, playElement, selectRandomElement]);

  const getElementStyles = useCallback(
    (index: number) => {
      // Completed elements stay green
      if (completedIndices.has(index)) {
        return 'bg-green-100 border-green-300 text-green-800';
      }
      
      // Wrong answer shows red
      if (wrongIndex === index) {
        return 'bg-red-100 border-red-300 text-red-800';
      }
      
      // Default styling
      return 'border-[#e3e0dc] bg-transparent text-[#222326]';
    },
    [completedIndices, wrongIndex],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      currentAudioRef.current?.pause();
      currentAudioRef.current?.removeAttribute('src');
      currentAudioRef.current = null;
      audioCache.current.forEach((asset) => asset.revoke?.());
      audioCache.current.clear();
    };
  }, []);

  return (
    <div className="flex min-h-[60vh] md:h-full w-full flex-col px-4 py-6 sm:px-6 sm:py-8 lg:py-10 leading-relaxed md:leading-loose pt-2 md:pt-4">
      {showTitle && (
        <h2 className="mb-3 sm:mb-4 md:mb-6 text-left text-xl sm:text-2xl md:text-3xl font-normal tracking-wide text-balance text-[#222326]">
          {showTitle}
        </h2>
      )}
      {showSubtitle && (
        <p className="mb-3 sm:mb-4 md:mb-6 text-left text-base sm:text-lg leading-relaxed sm:leading-loose text-[#192026]/80 text-balance">
          {showSubtitle}
        </p>
      )}
      {showNote && (
        <p className="mb-2 text-base sm:text-lg leading-relaxed sm:leading-loose text-[#192026]">
          {showNote}
        </p>
      )}
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center text-[#192026]">
        {error && (
          <p className="mb-4 md:mb-5 mt-2 text-sm text-[#8b6a2b] bg-amber-50 px-3 py-2 rounded-md">
            {error}
          </p>
        )}
        {message && (
          <p className="mb-4 md:mb-5 mt-2 text-sm text-[#222326] px-3 py-2">
            {message}
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center sm:-mt-6 md:-mt-8">
          <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl px-4">
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4">
              {elements.map((element, index) => {
                const isCompleted = completedIndices.has(index);
                const isClickable = hasStarted && !isCompleted && !isPlaying;

                return (
                  <span
                    key={`${element.label}-${index}`}
                    className={`flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-xl border px-4 text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal font-sans transition-all duration-200 ${
                      isClickable
                        ? 'cursor-pointer hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9599] focus-visible:ring-offset-2'
                        : isCompleted
                        ? 'cursor-default'
                        : 'cursor-not-allowed'
                    } ${getElementStyles(index)}`}
                    role={isClickable ? 'button' : undefined}
                    tabIndex={isClickable ? 0 : -1}
                    onClick={isClickable ? () => handleElementClick(index) : undefined}
                    onKeyDown={
                      isClickable
                        ? (event) => handleElementKeyDown(event, index)
                        : undefined
                    }
                  >
                    {element.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-center pb-4 gap-4">
          <div className="w-[100px] sm:w-[110px]">
            {!hasStarted ? (
              <button
                type="button"
                onClick={handleStart}
                className="flex flex-col items-center gap-1 rounded-xl border border-[#e3e0dc] bg-transparent px-4 py-2.5 text-center font-normal font-sans text-sm text-[#222326] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9599] focus-visible:ring-offset-2 sm:px-5 sm:py-3 sm:text-base w-full"
                style={{ opacity: 0.6 }}
              >
                <PlayIcon />
                <span className="text-xs text-[#222326] whitespace-nowrap">Play</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReplay}
                disabled={currentTargetIndex === null || isPlaying || isPaused}
                className="flex flex-col items-center gap-1 rounded-xl border border-[#e3e0dc] bg-transparent px-4 py-2.5 text-center font-normal font-sans text-sm text-[#222326] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9599] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 sm:px-5 sm:py-3 sm:text-base w-full"
                style={{ opacity: isPlaying ? 1 : 0.6 }}
              >
                <AudioIcon />
                <span className="text-xs text-[#222326] whitespace-nowrap">Replay</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handlePauseToggle}
            disabled={!hasStarted}
            className="flex flex-col items-center gap-1 rounded-xl border border-[#e3e0dc] bg-transparent px-4 py-2.5 text-center font-normal font-sans text-sm text-[#222326] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9599] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 sm:px-5 sm:py-3 sm:text-base w-[100px] sm:w-[110px]"
            style={{ opacity: 0.6 }}
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
        </div>
      </div>
    </div>
  );
}

