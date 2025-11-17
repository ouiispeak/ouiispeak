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
import ContentBox from './ContentBox';
import type { AiSpeakRepeatCell, AiSpeakRepeatSlideProps } from '@/lessons/types';
import { DEFAULT_SPEECH_LANG, type SupportedLang } from '@/lib/voices';
import { fetchSpeechAsset, type SpeechAsset } from '@/lib/speech';
import { getShowValue } from '@/lib/slideUtils';

type AISpeakRepeatProps = AiSpeakRepeatSlideProps;

const flattenRows = (rows: AiSpeakRepeatCell[][]) => rows.flat();

const playPauseIconProps: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-6 w-6',
  'aria-hidden': true,
};

const PlayIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg {...playPauseIconProps} className={className}>
    <path d="M7 5l12 7-12 7V5z" />
  </svg>
);

const PauseIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
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
  gapClass = 'gap-4',
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

  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [playedIndices, setPlayedIndices] = useState<Set<number>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sequenceState, setSequenceState] = useState<'idle' | 'playing' | 'paused' | 'completed'>(
    'idle',
  );

  const audioCache = useRef<Map<number, SpeechAsset>>(new Map());
  const activeSequenceRef = useRef(0);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const nextIndexRef = useRef(0);

  const resetStateForNewSequence = useCallback(() => {
    setPlayedIndices(() => new Set());
    setCurrentIndex(null);
    setError(null);
    setSequenceState('idle');
  }, []);

  useEffect(() => {
    const cache = audioCache.current;
    return () => {
      activeSequenceRef.current += 1;
      currentAudioRef.current?.pause();
      currentAudioRef.current?.removeAttribute('src');
      currentAudioRef.current = null;
      cache.forEach((asset) => asset.revoke?.());
      cache.clear();
    };
  }, []);

  useEffect(() => {
    const cache = audioCache.current;
    cache.forEach((asset) => asset.revoke?.());
    cache.clear();
  }, [rows]);

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

  const playAudioForIndex = useCallback(
    (asset: SpeechAsset, index: number, sequenceId: number) =>
      new Promise<number>((resolve, reject) => {
        const audio = new Audio(asset.url);
        currentAudioRef.current = audio;

        const handleError = () => {
          audio.pause();
          audio.removeAttribute('src');
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          const fallbackLabel = flatElements[index]?.label ?? 'élément';
          reject(new Error(`Impossible de lire l'élément "${fallbackLabel}"`));
        };

        audio.addEventListener(
          'loadedmetadata',
          () => {
            if (activeSequenceRef.current !== sequenceId) {
              audio.pause();
              audio.removeAttribute('src');
              if (currentAudioRef.current === audio) {
                currentAudioRef.current = null;
              }
              resolve(0);
              return;
            }

            setCurrentIndex(index);
            audio
              .play()
              .catch((err) => {
                handleError();
                reject(err);
              });
          },
          { once: true },
        );

        audio.addEventListener(
          'ended',
          () => {
            const duration = audio.duration || 0;
            setPlayedIndices((prev) => {
              const next = new Set(prev);
              next.add(index);
              return next;
            });
            audio.pause();
            audio.removeAttribute('src');
            if (currentAudioRef.current === audio) {
              currentAudioRef.current = null;
            }
            resolve(duration);
          },
          { once: true },
        );

        audio.addEventListener('error', handleError, { once: true });
      }),
    [flatElements],
  );

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const runSequence = useCallback(
    async (startIndex: number, sequenceId: number) => {
      try {
        for (let index = startIndex; index < flatElements.length; index += 1) {
          if (activeSequenceRef.current !== sequenceId) break;

          const cell = flatElements[index];
          if (!cell) continue;

          setCurrentIndex(index);
          nextIndexRef.current = index;
          const asset = await resolveAudio(cell, index);

          if (activeSequenceRef.current !== sequenceId) break;

          const duration = await playAudioForIndex(asset, index, sequenceId);

          if (activeSequenceRef.current !== sequenceId) break;

          const effectiveDuration = duration > 0 ? duration : 0.05;
          const pauseMs = effectiveDuration * 0.05 * 1000;

          setPlayedIndices((prev) => {
            if (prev.has(index)) return prev;
            const next = new Set(prev);
            next.add(index);
            return next;
          });

          nextIndexRef.current = index + 1;
          await wait(pauseMs);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Lecture impossible.');
      } finally {
        if (activeSequenceRef.current === sequenceId) {
          currentAudioRef.current = null;
          setIsPlaying(false);
          setIsPlayingAll(false);
          setCurrentIndex(null);
          if (nextIndexRef.current >= flatElements.length) {
            setSequenceState('completed');
          } else {
            setSequenceState('idle');
          }
        }
      }
    },
    [flatElements, playAudioForIndex, resolveAudio],
  );

  const startSequence = useCallback(
    async ({ resume }: { resume?: boolean } = {}) => {
      if (flatElements.length === 0 || isPlaying) return;

      const canResume =
        resume &&
        sequenceState === 'paused' &&
        nextIndexRef.current < flatElements.length &&
        nextIndexRef.current >= 0;

      if (!canResume) {
        resetStateForNewSequence();
        nextIndexRef.current = 0;
      }

      currentAudioRef.current?.pause();
      currentAudioRef.current?.removeAttribute('src');
      currentAudioRef.current = null;
      activeSequenceRef.current += 1;
      const sequenceId = activeSequenceRef.current;
      setIsPlaying(true);
      setIsPlayingAll(true);
      setSequenceState('playing');
      const startIndex = canResume ? nextIndexRef.current : 0;
      setError(null);
      await runSequence(startIndex, sequenceId);
    },
    [flatElements.length, isPlaying, resetStateForNewSequence, runSequence, sequenceState],
  );

  const stopAllPlayback = useCallback(() => {
    activeSequenceRef.current += 1;
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.removeAttribute('src');
      currentAudioRef.current = null;
    }
    setIsPlaying(false);
    setIsPlayingAll(false);
    setCurrentIndex(null);
    setSequenceState('idle');
  }, []);

  const handlePlayClick = useCallback(() => {
    if (sequenceState === 'paused' && nextIndexRef.current < flatElements.length) {
      startSequence({ resume: true });
    } else {
      startSequence();
    }
  }, [flatElements.length, sequenceState, startSequence]);

  const handleTogglePlayAll = useCallback(() => {
    if (isPlayingAll) {
      stopAllPlayback();
    } else {
      startSequence();
    }
  }, [isPlayingAll, stopAllPlayback, startSequence]);

  const pauseSequence = useCallback(() => {
    if (!isPlaying && currentAudioRef.current === null) return;
    stopAllPlayback();
  }, [isPlaying, stopAllPlayback]);

  const playSingleCell = useCallback(
    async (cell: AiSpeakRepeatCell, index: number) => {
      try {
        // Stop any currently playing audio
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current.removeAttribute('src');
          currentAudioRef.current = null;
        }

        const asset = await resolveAudio(cell, index);
        const audio = new Audio(asset.url);
        currentAudioRef.current = audio;

        audio.addEventListener('ended', () => {
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
        });

        audio.addEventListener('error', () => {
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          const fallbackLabel = cell.label ?? 'élément';
          setError(`Impossible de lire l'élément "${fallbackLabel}"`);
        });

        await audio.play();
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Impossible de lire cet élément.');
        if (currentAudioRef.current) {
          currentAudioRef.current = null;
        }
      }
    },
    [resolveAudio],
  );

  const handleCellClick = useCallback(
    (cell: AiSpeakRepeatCell, index: number, isFirst: boolean) => {
      // If playing all sequence, interrupt it and play the clicked letter
      if (isPlayingAll) {
        stopAllPlayback();
        playSingleCell(cell, index);
        return;
      }

      // If sequence is completed or idle, allow clicking any cell
      if (sequenceState === 'completed' || sequenceState === 'idle') {
        // First cell starts the full sequence, others play individually
        if (isFirst) {
          handlePlayClick();
        } else {
          playSingleCell(cell, index);
        }
        return;
      }

      // If paused, first cell resumes, others play individually
      if (sequenceState === 'paused') {
        if (isFirst) {
          handlePlayClick();
        } else {
          playSingleCell(cell, index);
        }
      }
    },
    [handlePlayClick, playSingleCell, sequenceState, isPlayingAll, stopAllPlayback],
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

  const getElementColor = useCallback(
    (globalIndex: number) => {
      if (currentIndex === globalIndex) return 'text-[#0c9599]';
      if (playedIndices.has(globalIndex)) return 'text-[#736e65]';
      return 'text-[#192026]';
    },
    [currentIndex, playedIndices],
  );

  return (
    <div className="flex h-full w-full flex-col px-6 py-10 leading-relaxed md:leading-loose pt-2 md:pt-4">
      {showTitle && <h2 className="mb-4 md:mb-6 text-left text-2xl font-normal tracking-wide text-balance text-[#222326]">{showTitle}</h2>}
      {showSubtitle && <p className="mb-4 md:mb-6 text-left text-lg text-[#192026]/80 text-balance">{showSubtitle}</p>}
      {showNote && (
        <p className="mb-2 text-base text-[#192026]">{showNote}</p>
      )}
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center text-[#192026]">
        {error && <p className="mb-4 md:mb-5 mt-2 text-sm text-[#8b6a2b] bg-amber-50 px-3 py-2 rounded-md">{error}</p>}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center -mt-8">
          <div className="w-full max-w-4xl px-4">
            <div className="flex flex-col items-center gap-4">
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

                return (
                  <span
                    key={`${cell.label}-${globalIndex}`}
                    className={`flex h-16 items-center justify-center rounded-xl border border-[#e3e0dc] bg-transparent px-4 text-center text-[4em] font-normal font-sans text-[#222326] ${
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
            disabled={flatElements.length === 0}
            className="flex flex-col items-center gap-1 rounded-xl border border-[#e3e0dc] bg-transparent px-4 py-2 text-center font-normal font-sans text-[#222326] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9599] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
