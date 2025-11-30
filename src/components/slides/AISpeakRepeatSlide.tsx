'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type SVGProps,
} from 'react';
import type { AiSpeakRepeatCell, AiSpeakRepeatSlideProps } from '@/lessons/types';
import { DEFAULT_SPEECH_LANG, type SupportedLang } from '@/lib/voices';
import { fetchSpeechAsset, type SpeechAsset } from '@/lib/speech';
import { getShowValue } from '@/lib/slideUtils';
import { useAudioSequence, type AudioItem } from '@/hooks/audio/useAudioSequence';

type AISpeakRepeatProps = AiSpeakRepeatSlideProps;

const flattenRows = (rows: AiSpeakRepeatCell[][]) => rows.flat();

const playPauseIconProps: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-4 w-4',
  'aria-hidden': true,
};

const PlayIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg {...playPauseIconProps} className={className}>
    <path d="M7 5l12 7-12 7V5z" />
  </svg>
);

const PauseIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg {...playPauseIconProps} className={className}>
    <line x1="9" y1="5" x2="9" y2="19" />
    <line x1="15" y1="5" x2="15" y2="19" />
  </svg>
);

export default function AISpeakRepeatSlide({
  title,
  subtitle,
  lines,
  note,
  defaultLang = DEFAULT_SPEECH_LANG,
  gapClass = 'gap-3 sm:gap-4',
}: AISpeakRepeatProps) {
  // Parse NS (no show) syntax
  const showTitle = getShowValue(title);
  const showSubtitle = getShowValue(subtitle);
  const showNote = getShowValue(note);
  const rows = useMemo(() => lines ?? [], [lines]);

  const rowStartIndices = useMemo(() => {
    const starts: number[] = [];
    let runningTotal = 0;
    rows.forEach((row, index) => {
      starts[index] = runningTotal;
      runningTotal += row.length;
    });
    return starts;
  }, [rows]);

  const flatElements = useMemo(() => flattenRows(rows), [rows]);

  // UI state
  const [playedIndices, setPlayedIndices] = useState<Set<number>>(new Set());
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [hasPlayedAllInitially, setHasPlayedAllInitially] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sequenceState, setSequenceState] = useState<'idle' | 'playing' | 'paused' | 'completed'>(
    'idle',
  );

  // Audio asset caching (component-specific)
  const audioCache = useRef<Map<number, SpeechAsset>>(new Map());
  const [audioItems, setAudioItems] = useState<AudioItem[]>([]);
  const nextIndexRef = useRef(0);

  const resetStateForNewSequence = useCallback(() => {
    setPlayedIndices(() => new Set());
    setError(null);
    setSequenceState('idle');
  }, []);

  // Cleanup audio cache on unmount
  useEffect(() => {
    const cache = audioCache.current;
    return () => {
      cache.forEach((asset) => asset.revoke?.());
      cache.clear();
    };
  }, []);

  // Clear cache when rows change
  useEffect(() => {
    const cache = audioCache.current;
    cache.forEach((asset) => asset.revoke?.());
    cache.clear();
    setAudioItems([]);
  }, [rows]);

  // Resolve audio asset for a cell (cached)
  const resolveAudio = useCallback(
    async (cell: AiSpeakRepeatCell, index: number) => {
      if (audioCache.current.has(index)) {
        return audioCache.current.get(index)!;
      }

      const fallbackLang: SupportedLang = cell.speech.lang ?? defaultLang ?? DEFAULT_SPEECH_LANG;
      const asset = await fetchSpeechAsset(cell.speech, {
        fallbackLang,
        fallbackText: cell.label,
      });
      audioCache.current.set(index, asset);
      return asset;
    },
    [defaultLang],
  );

  // Pre-resolve all audio assets and build items array
  useEffect(() => {
    let cancelled = false;
    const resolveAll = async () => {
      const items: AudioItem[] = [];
      for (let i = 0; i < flatElements.length; i += 1) {
        if (cancelled) return;
        const cell = flatElements[i];
        if (!cell) continue;

        try {
          const asset = await resolveAudio(cell, i);
          if (cancelled) return;
          items.push({
            id: `${cell.label}-${i}`,
            url: asset.url,
          });
        } catch (err) {
          console.error(`Failed to resolve audio for index ${i}:`, err);
          // Use placeholder URL to keep array length consistent
          items.push({
            id: `${cell.label}-${i}`,
            url: '',
          });
        }
      }
      if (!cancelled) {
        setAudioItems(items);
      }
    };

    resolveAll();
    return () => {
      cancelled = true;
    };
  }, [flatElements, resolveAudio]);

  // Use audio sequence hook
  const {
    currentIndex,
    isPlaying,
    isPaused,
    playItem,
    playAllFrom,
    pause,
    resume,
    stop,
  } = useAudioSequence({
    items: audioItems,
    delayBetweenItemsMs: 1500,
    onItemStart: (index) => {
      // Update nextIndexRef for resume logic
      nextIndexRef.current = index;
    },
    onItemEnd: (index) => {
      // Mark as played
      setPlayedIndices((prev) => {
        const next = new Set(prev);
        next.add(index);
        return next;
      });
      nextIndexRef.current = index + 1;
    },
    onSequenceEnd: () => {
      setIsPlayingAll(false);
      if (nextIndexRef.current >= flatElements.length) {
        setSequenceState('completed');
      } else {
        setSequenceState('idle');
      }
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  // Sync isPlayingAll with hook's isPlaying when in sequence mode
  useEffect(() => {
    if (isPlaying && !isPaused) {
      setIsPlayingAll(true);
      setSequenceState('playing');
    } else if (isPaused) {
      setIsPlayingAll(false);
      setSequenceState('paused');
    } else if (!isPlaying && sequenceState === 'playing') {
      setIsPlayingAll(false);
    }
  }, [isPlaying, isPaused, sequenceState]);

  const handlePlayClick = useCallback(() => {
    if (sequenceState === 'paused' && nextIndexRef.current < flatElements.length) {
      resume();
    } else {
      // Start sequence
      if (!hasPlayedAllInitially) {
        resetStateForNewSequence();
        nextIndexRef.current = 0;
        setHasPlayedAllInitially(true);
        playAllFrom(0);
      }
    }
  }, [sequenceState, flatElements.length, hasPlayedAllInitially, resetStateForNewSequence, playAllFrom, resume]);

  const handleTogglePlayAll = useCallback(() => {
    if (isPlayingAll) {
      // Pause
      setSequenceState('paused');
      pause();
    } else {
      // Start or resume
      if (!hasPlayedAllInitially) {
        // First time - start from beginning
        resetStateForNewSequence();
        nextIndexRef.current = 0;
        setHasPlayedAllInitially(true);
        playAllFrom(0);
      } else if (sequenceState === 'paused') {
        // Resume from where it left off
        resume();
      }
    }
  }, [isPlayingAll, pause, resume, playAllFrom, hasPlayedAllInitially, sequenceState, resetStateForNewSequence]);

  const playSingleCell = useCallback(
    async (index: number) => {
      // Ensure audio is resolved before playing
      const cell = flatElements[index];
      if (!cell) return;

      try {
        // Ensure asset is resolved and items array is updated
        const asset = await resolveAudio(cell, index);
        
        // Update items array if needed
        setAudioItems((prev) => {
          const updated = [...prev];
          if (!updated[index] || updated[index].url !== asset.url) {
            updated[index] = {
              id: `${cell.label}-${index}`,
              url: asset.url,
            };
          }
          return updated;
        });

        // Wait a tick for state update, then play
        await new Promise((resolve) => setTimeout(resolve, 0));
        await playItem(index);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Impossible de lire cet élément.');
      }
    },
    [flatElements, resolveAudio, playItem],
  );

  const handleCellClick = useCallback(
    (cell: AiSpeakRepeatCell, index: number, isFirst: boolean) => {
      // If playing all sequence, interrupt it and play the clicked letter
      if (isPlayingAll) {
        stop();
        playSingleCell(index);
        return;
      }

      // If sequence is completed or idle, allow clicking any cell
      if (sequenceState === 'completed' || sequenceState === 'idle') {
        // First cell starts the full sequence, others play individually
        if (isFirst) {
          handlePlayClick();
        } else {
          playSingleCell(index);
        }
        return;
      }

      // If paused, first cell resumes, others play individually
      if (sequenceState === 'paused') {
        if (isFirst) {
          handlePlayClick();
        } else {
          playSingleCell(index);
        }
      }
    },
    [handlePlayClick, playSingleCell, sequenceState, isPlayingAll, stop],
  );

  const handleCellKeyDown = useCallback(
    (event: KeyboardEvent<HTMLSpanElement>, cell: AiSpeakRepeatCell, index: number, isFirst: boolean) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleCellClick(cell, index, isFirst);
      }
    },
    [handleCellClick],
  );

  const getElementStyles = useCallback(
    (globalIndex: number) => {
      // Use currentIndex from hook for highlighting
      if (currentIndex === globalIndex) {
        // Currently being played - teal color
        return {
          textColor: 'text-[#0c9599]',
          borderColor: 'border-[#0c9599]',
        };
      }
      if (playedIndices.has(globalIndex)) {
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
    },
    [currentIndex, playedIndices],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return (
    <div className="flex min-h-[60vh] md:h-full w-full flex-col px-4 py-6 sm:px-6 sm:py-8 lg:py-10 leading-relaxed md:leading-loose pt-2 md:pt-4">
      {showTitle && <h2 className="mb-3 sm:mb-4 md:mb-6 text-left text-xl sm:text-2xl md:text-3xl font-normal tracking-wide text-balance text-[#222326]">{showTitle}</h2>}
      {showSubtitle && <p className="mb-3 sm:mb-4 md:mb-6 text-left text-base sm:text-lg leading-relaxed sm:leading-loose text-[#192026]/80 text-balance">{showSubtitle}</p>}
      {showNote && (
        <p className="mb-2 text-base sm:text-lg leading-relaxed sm:leading-loose text-[#192026]">{showNote}</p>
      )}
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center text-[#192026]">
        {error && <p className="mb-4 md:mb-5 mt-2 text-sm text-[#8b6a2b] bg-amber-50 px-3 py-2 rounded-md">{error}</p>}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center sm:-mt-6 md:-mt-8">
          <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl px-4">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              {rows.map((line, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                className={['flex flex-wrap justify-center', gapClass].filter(Boolean).join(' ')}
              >
                      {line.map((cell, index) => {
                        const globalIndex = rowStartIndices[rowIndex] + index;
                        const isFirst = globalIndex === 0;
                        // All letters are always clickable
                        const isButton = true;
                        const styles = getElementStyles(globalIndex);

                return (
                  <span
                    key={`${cell.label}-${globalIndex}`}
                    className={`flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-xl border ${styles.borderColor} bg-transparent px-4 text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal font-sans ${styles.textColor} transition-colors duration-200 ${
                      isButton
                        ? 'cursor-pointer transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9599] focus-visible:ring-offset-2'
                        : ''
                    }`}
                    role={isButton ? 'button' : undefined}
                    tabIndex={isButton ? 0 : -1}
                    onClick={
                      isButton ? () => handleCellClick(cell, globalIndex, isFirst) : undefined
                    }
                      onKeyDown={
                        isButton
                          ? (event) => handleCellKeyDown(event, cell, globalIndex, isFirst)
                          : undefined
                      }
                    >
                      {cell.label}
                    </span>
                  );
                })}
              </div>
            ))}
            </div>
          </div>
        </div>
        <div className="flex justify-center pb-4">
          <button
            type="button"
            onClick={handleTogglePlayAll}
            disabled={
              flatElements.length === 0 || 
              (hasPlayedAllInitially && sequenceState === 'completed' && !isPlayingAll) ||
              (hasPlayedAllInitially && sequenceState === 'idle' && !isPlayingAll)
            }
            className="flex flex-col items-center gap-1 rounded-xl border border-[#e3e0dc] bg-transparent px-4 py-2.5 text-center font-normal font-sans text-sm text-[#222326] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9599] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 sm:px-5 sm:py-3 sm:text-base"
          >
            {isPlayingAll ? (
              <>
                <PauseIcon />
                <span className="text-xs text-[#222326]">Pause</span>
              </>
            ) : (
              <>
                <PlayIcon />
                <span className="text-xs text-[#222326]">Play all</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
