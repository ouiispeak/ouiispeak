/**
 * Hook for monitoring audio level from an AnalyserNode.
 * Automatically starts/stops animation loop based on recording state.
 */

import { useState, useEffect, useRef } from 'react';
import { calculateAudioLevel } from '@/lib/audio/calculateAudioLevel';

/**
 * Monitors audio level from an AnalyserNode while recording.
 * Automatically starts/stops the animation loop based on recording state.
 * 
 * @param analyser - The AnalyserNode to read audio data from (null when not available)
 * @param isRecording - Whether recording is currently active
 * @returns Current normalized audio level (0-1)
 */
export function useAudioLevel(
  analyser: AnalyserNode | null,
  isRecording: boolean
): number {
  const [audioLevel, setAudioLevel] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Only start animation loop if we have an analyser and are recording
    if (!analyser || !isRecording) {
      // Stop animation loop if it's running
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // Reset audio level when not recording
      if (!isRecording) {
        setAudioLevel(0);
      }
      return;
    }

    // Animation loop function
    const updateAudioLevel = () => {
      // Check if we still have analyser and are still recording
      if (!analyser || !isRecording) {
        console.log('[ANIMATION] Stopping: analyser missing or not recording');
        return;
      }

      // Calculate normalized audio level using utility function
      const normalizedLevel = calculateAudioLevel(analyser);

      // Debug logging (throttled)
      if (Math.random() < 0.1) { // Log ~10% of the time
        const dataArray = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(dataArray);
        const maxAmplitude = Math.max(...Array.from(dataArray));
        const minAmplitude = Math.min(...Array.from(dataArray));
        const amplitudeRange = maxAmplitude - minAmplitude;
        const allZeros = dataArray.every(v => v === 128); // 128 is silence in time domain
        console.log('[ANIMATION] Audio level:', {
          normalizedLevel: normalizedLevel.toFixed(3),
          amplitudeRange,
          maxAmplitude,
          minAmplitude,
          allZeros, // If true, analyser isn't getting data
          sampleValues: Array.from(dataArray.slice(0, 10)),
          dataArrayLength: dataArray.length
        });

        if (allZeros) {
          console.warn('WARNING: All audio samples are 128 (silence). Analyser may not be receiving data.');
        }
      }

      setAudioLevel(normalizedLevel);

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };

    // Start the animation loop
    console.log('[ANIMATION] Starting audio level monitoring');
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);

    // Cleanup: stop animation loop when effect cleanup runs
    return () => {
      if (animationFrameRef.current !== null) {
        console.log('[ANIMATION] Cleaning up: stopping animation loop');
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setAudioLevel(0);
    };
  }, [analyser, isRecording]);

  return audioLevel;
}

