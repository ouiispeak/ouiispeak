/**
 * Hook for managing sequential audio playback.
 * Handles playing a list of audio items in sequence with delays, pause/resume, and cleanup.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

export type AudioItem = {
  id: string;
  url: string;
};

export type UseAudioSequenceOptions = {
  items: AudioItem[];
  delayBetweenItemsMs?: number; // default: 1500
  onItemStart?: (index: number, item: AudioItem) => void;
  onItemEnd?: (index: number, item: AudioItem) => void;
  onSequenceEnd?: () => void;
  onError?: (error: Error) => void;
};

export type UseAudioSequenceResult = {
  currentIndex: number | null;
  isPlaying: boolean;
  isPaused: boolean;
  playItem: (index: number) => Promise<void>;
  playAllFrom: (startIndex: number) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
};

/**
 * Hook for managing sequential audio playback.
 *
 * @param options - Configuration including items, delays, and callbacks
 * @returns Audio playback state and control functions
 */
export function useAudioSequence(
  options: UseAudioSequenceOptions
): UseAudioSequenceResult {
  // Track options in a ref to avoid stale closures
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // State
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Refs for audio lifecycle
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeSequenceRef = useRef(0);
  const delayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSequenceModeRef = useRef(false);
  const pausedIndexRef = useRef<number | null>(null);
  const nextIndexRef = useRef<number>(0);

  // Cleanup helper
  const cleanupAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.removeAttribute('src');
      currentAudioRef.current = null;
    }
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
  }, []);

  // Cancel any active sequence
  const cancelSequence = useCallback(() => {
    activeSequenceRef.current += 1;
    cleanupAudio();
    setIsPlaying(false);
    setIsPaused(false);
    pausedIndexRef.current = null;
    isSequenceModeRef.current = false;
    nextIndexRef.current = 0;
  }, [cleanupAudio]);

  // Play a single audio item
  const playSingleAudio = useCallback(
    async (index: number, sequenceId: number): Promise<void> => {
      const items = optionsRef.current.items;
      if (index < 0 || index >= items.length) {
        return;
      }

      const item = items[index];
      if (!item) {
        return;
      }

      // Cancel if sequence was cancelled
      if (activeSequenceRef.current !== sequenceId) {
        return;
      }

      // Create audio element
      const audio = new Audio(item.url);
      currentAudioRef.current = audio;

      // Set up event handlers
      const handleLoadedMetadata = () => {
        // Check if sequence was cancelled before playing
        if (activeSequenceRef.current !== sequenceId) {
          audio.pause();
          audio.removeAttribute('src');
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          return;
        }

        setCurrentIndex(index);
        setIsPaused(false);
        optionsRef.current.onItemStart?.(index, item);

        audio.play().catch((err) => {
          const error = err instanceof Error ? err : new Error('Failed to play audio');
          optionsRef.current.onError?.(error);
          cleanupAudio();
          setIsPlaying(false);
          setIsPaused(false);
        });
      };

      const handleEnded = () => {
        if (currentAudioRef.current === audio) {
          currentAudioRef.current = null;
        }
        optionsRef.current.onItemEnd?.(index, item);
      };

      const handleError = () => {
        if (currentAudioRef.current === audio) {
          currentAudioRef.current = null;
        }
        const error = new Error(`Failed to load audio: ${item.id}`);
        optionsRef.current.onError?.(error);
        setIsPlaying(false);
        setIsPaused(false);
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      audio.addEventListener('ended', handleEnded, { once: true });
      audio.addEventListener('error', handleError, { once: true });
    },
    [cleanupAudio]
  );

  // Play a single item (not part of a sequence)
  const playItem = useCallback(
    async (index: number): Promise<void> => {
      // Cancel any active sequence
      cancelSequence();

      const sequenceId = activeSequenceRef.current;
      setIsPlaying(true);
      setIsPaused(false);
      pausedIndexRef.current = null;
      isSequenceModeRef.current = false;

      await playSingleAudio(index, sequenceId);

      // Wait for audio to finish
      const audio = currentAudioRef.current;
      if (audio) {
        await new Promise<void>((resolve) => {
          const handleEnded = () => {
            audio.removeEventListener('ended', handleEnded);
            resolve();
          };
          audio.addEventListener('ended', handleEnded, { once: true });
        });
      }

      // Clean up if still the active item
      if (activeSequenceRef.current === sequenceId && currentAudioRef.current === audio) {
        setIsPlaying(false);
        setCurrentIndex(null);
      }
    },
    [cancelSequence, playSingleAudio]
  );

  // Play all items in sequence starting from startIndex
  const playAllFrom = useCallback(
    async (startIndex: number): Promise<void> => {
      const items = optionsRef.current.items;
      if (items.length === 0 || startIndex < 0 || startIndex >= items.length) {
        return;
      }

      // Cancel any active sequence
      cancelSequence();

      // Start new sequence
      activeSequenceRef.current += 1;
      const sequenceId = activeSequenceRef.current;
      setIsPlaying(true);
      setIsPaused(false);
      pausedIndexRef.current = null;
      isSequenceModeRef.current = true;
      nextIndexRef.current = startIndex;

      const delayMs = optionsRef.current.delayBetweenItemsMs ?? 1500;

      // Play sequence
      try {
        for (let index = startIndex; index < items.length; index += 1) {
          // Check if sequence was cancelled
          if (activeSequenceRef.current !== sequenceId) {
            break;
          }

      // Play this item
      await playSingleAudio(index, sequenceId);

      // Wait for audio to finish
      const audio = currentAudioRef.current;
      if (audio && activeSequenceRef.current === sequenceId) {
        await new Promise<void>((resolve) => {
          const handleEnded = () => {
            audio.removeEventListener('ended', handleEnded);
            resolve();
          };
          audio.addEventListener('ended', handleEnded, { once: true });
        });
      }

      // Update next index after item finishes
      if (activeSequenceRef.current === sequenceId) {
        nextIndexRef.current = index + 1;
      }

      // Check again after audio finished
      if (activeSequenceRef.current !== sequenceId) {
        break;
      }

          // Wait delay before next item (except for last item)
          if (index < items.length - 1) {
            await new Promise<void>((resolve) => {
              delayTimeoutRef.current = setTimeout(() => {
                delayTimeoutRef.current = null;
                resolve();
              }, delayMs);
            });
          }
        }

        // Sequence completed
        if (activeSequenceRef.current === sequenceId) {
          optionsRef.current.onSequenceEnd?.();
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentIndex(null);
          pausedIndexRef.current = null;
          isSequenceModeRef.current = false;
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Sequence playback error');
        optionsRef.current.onError?.(error);
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentIndex(null);
        pausedIndexRef.current = null;
        isSequenceModeRef.current = false;
      }
    },
    [cancelSequence, playSingleAudio]
  );

  // Pause current playback
  const pause = useCallback(() => {
    if (!isPlaying || !currentAudioRef.current) {
      return;
    }

    const audio = currentAudioRef.current;
    audio.pause();
    setIsPlaying(false);
    setIsPaused(true);

    // Store next index for resume (continue from next item after current)
    if (isSequenceModeRef.current && currentIndex !== null) {
      pausedIndexRef.current = nextIndexRef.current;
    }

    // Clear delay timeout if any
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
  }, [isPlaying, currentIndex]);

  // Resume paused playback
  const resume = useCallback(() => {
    if (!isPaused) {
      return;
    }

    const audio = currentAudioRef.current;
    if (audio && isSequenceModeRef.current && pausedIndexRef.current !== null) {
      // Resume sequence from paused position
      const resumeIndex = pausedIndexRef.current;
      setIsPaused(false);
      pausedIndexRef.current = null;
      playAllFrom(resumeIndex);
    } else if (audio) {
      // Resume single item
      audio.play().catch((err) => {
        const error = err instanceof Error ? err : new Error('Failed to resume audio');
        optionsRef.current.onError?.(error);
        setIsPlaying(false);
        setIsPaused(false);
      });
      setIsPlaying(true);
      setIsPaused(false);
    }
  }, [isPaused, playAllFrom]);

  // Stop all playback
  const stop = useCallback(() => {
    cancelSequence();
    setCurrentIndex(null);
  }, [cancelSequence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelSequence();
      setCurrentIndex(null);
    };
  }, [cancelSequence]);

  return {
    currentIndex,
    isPlaying,
    isPaused,
    playItem,
    playAllFrom,
    pause,
    resume,
    stop,
  };
}

