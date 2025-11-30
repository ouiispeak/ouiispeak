/**
 * Hook for detecting silence during audio recording and triggering auto-stop.
 * Monitors audio level and calls a callback when silence threshold is exceeded.
 * Uses a real timer (setInterval) to continuously check silence duration, and reads
 * the analyser directly to avoid dependency on rAF updates (which can be throttled).
 */

import { useEffect, useRef } from 'react';
import { calculateAudioLevel } from '@/lib/audio/calculateAudioLevel';

const SILENCE_THRESHOLD = 0.50; // 50% threshold
const SILENCE_DURATION = 1500; // 1.5 seconds of silence
const CHECK_INTERVAL = 100; // Check every 100ms

/**
 * Monitors audio level for silence detection and triggers auto-stop callback.
 * Tracks silence duration using a real timer and reads the analyser directly
 * (not gated by rAF) to ensure accurate detection even when the tab is backgrounded.
 * 
 * @param analyser - The AnalyserNode to read audio data from (null when not available)
 * @param isRecording - Whether recording is currently active
 * @param onSilenceDetected - Callback to call when silence duration exceeds threshold (must be memoized)
 */
export function useSilenceDetection(
  analyser: AnalyserNode | null,
  isRecording: boolean,
  onSilenceDetected: () => void
): void {
  const silenceStartTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(analyser);

  // Update analyser ref whenever it changes
  useEffect(() => {
    analyserRef.current = analyser;
  }, [analyser]);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Reset silence timer when not recording or no analyser
    if (!isRecording || !analyserRef.current) {
      if (silenceStartTimeRef.current !== null) {
        console.log('[AUTO-STOP] Resetting silence timer: not recording or no analyser', { isRecording, hasAnalyser: !!analyserRef.current });
      }
      silenceStartTimeRef.current = null;
      return;
    }

    console.log('[AUTO-STOP] Starting silence detection interval', { isRecording, hasAnalyser: !!analyserRef.current });

    // Start interval to continuously check silence duration
    // Read analyser directly (not gated by rAF) to avoid stale values when tab is backgrounded
    intervalRef.current = setInterval(() => {
      const currentAnalyser = analyserRef.current;
      if (!currentAnalyser) {
        return;
      }

      // Read audio level directly from analyser (independent of rAF)
      const currentLevel = calculateAudioLevel(currentAnalyser);

      // Check if audio level is below silence threshold
      if (currentLevel < SILENCE_THRESHOLD) {
        // Start tracking silence if not already tracking
        if (silenceStartTimeRef.current === null) {
          silenceStartTimeRef.current = Date.now();
          console.log(`[AUTO-STOP] Silence detected (level: ${(currentLevel * 100).toFixed(1)}%), starting timer...`);
        } else {
          // Check if silence duration has exceeded threshold
          const silenceDuration = Date.now() - silenceStartTimeRef.current;
          
          // Log progress every 500ms to avoid spam
          if (silenceDuration % 500 < CHECK_INTERVAL) {
            console.log(`[AUTO-STOP] Still silent (level: ${(currentLevel * 100).toFixed(1)}%), duration: ${silenceDuration}ms / ${SILENCE_DURATION}ms`);
          }
          
          if (silenceDuration >= SILENCE_DURATION) {
            console.log(`[AUTO-STOP] ✅ Stopping recording due to 1.5 seconds of silence (level: ${(currentLevel * 100).toFixed(1)}%)`);
            silenceStartTimeRef.current = null; // Reset before calling callback
            onSilenceDetected();
          }
        }
      } else {
        // Audio detected - reset silence timer
        if (silenceStartTimeRef.current !== null) {
          console.log(`[AUTO-STOP] Audio detected (level: ${(currentLevel * 100).toFixed(1)}%), resetting silence timer`);
          silenceStartTimeRef.current = null;
        }
      }
    }, CHECK_INTERVAL);

    // Cleanup: clear interval on unmount or when dependencies change
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRecording, analyser, onSilenceDetected]);
}

