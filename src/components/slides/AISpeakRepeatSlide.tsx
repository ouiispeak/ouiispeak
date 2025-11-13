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
import SoftIconButton from '@/components/CircleButton';

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

const PlayIcon = () => (
  <svg {...playPauseIconProps}>
    <path d="M7 5l12 7-12 7V5z" />
  </svg>
);

const PauseIcon = () => (
  <svg {...playPauseIconProps}>
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
      setSequenceState('playing');
      const startIndex = canResume ? nextIndexRef.current : 0;
      setError(null);
      await runSequence(startIndex, sequenceId);
    },
    [flatElements.length, isPlaying, resetStateForNewSequence, runSequence, sequenceState],
  );

  const handlePlayClick = useCallback(() => {
    if (sequenceState === 'paused' && nextIndexRef.current < flatElements.length) {
      startSequence({ resume: true });
    } else {
      startSequence();
    }
  }, [flatElements.length, sequenceState, startSequence]);

  const pauseSequence = useCallback(() => {
    if (!isPlaying && currentAudioRef.current === null) return;

    activeSequenceRef.current += 1;
    if (currentIndex !== null) {
      nextIndexRef.current = currentIndex;
    }
    currentAudioRef.current?.pause();
    currentAudioRef.current?.removeAttribute('src');
    currentAudioRef.current = null;
    setIsPlaying(false);
    setCurrentIndex(null);
    setSequenceState('paused');
  }, [currentIndex, isPlaying]);

  const playSingleCell = useCallback(
    async (cell: AiSpeakRepeatCell, index: number) => {
      try {
        const asset = await resolveAudio(cell, index);
        const audio = new Audio(asset.url);
        await audio.play();
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Impossible de lire cet élément.');
      }
    },
    [resolveAudio],
  );

  const handleCellClick = useCallback(
    (cell: AiSpeakRepeatCell, index: number, isFirst: boolean) => {
      if (isFirst && sequenceState !== 'playing') {
        handlePlayClick();
        return;
      }

      if (sequenceState === 'completed') {
        playSingleCell(cell, index);
      }
    },
    [handlePlayClick, playSingleCell, sequenceState],
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
    <div className="flex h-full w-full flex-col px-6 py-10">
      {note && (
        <div className="mb-4 self-start text-left">
          <ContentBox className="text-base">{note}</ContentBox>
        </div>
      )}
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center text-[#192026]">
        {title && <h2 className="mb-2 text-3xl font-semibold">{title}</h2>}
        {subtitle && <p className="text-lg text-[#192026]/80">{subtitle}</p>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            {rows.map((line, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                className={['flex flex-wrap justify-center', gapClass].filter(Boolean).join(' ')}
              >
                {line.map((cell, index) => {
                  const globalIndex = rowStartIndices[rowIndex] + index;
                const colorClass = getElementColor(globalIndex);
                const isFirst = globalIndex === 0;
                const isButton = isFirst || sequenceState === 'completed';

                return (
                  <span
                    key={`${cell.label}-${globalIndex}`}
                    className={`flex h-16 w-16 items-center justify-center text-center text-[2em] ${colorClass} ${
                      isButton
                        ? 'cursor-pointer transition-colors duration-200 hover:bg-[#f6f5f3]'
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
        <div className="flex justify-center pb-4">
          <SoftIconButton
            ariaLabel={
              isPlaying
                ? 'Mettre en pause la lecture'
                : sequenceState === 'paused' && nextIndexRef.current < flatElements.length
                  ? 'Reprendre la lecture'
                  : 'Lancer la lecture'
            }
            onClick={isPlaying ? pauseSequence : handlePlayClick}
            disabled={!isPlaying && flatElements.length === 0}
            className={isPlaying ? 'text-white bg-[#077373]' : ''}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </SoftIconButton>
        </div>
      </div>
    </div>
  );
}
