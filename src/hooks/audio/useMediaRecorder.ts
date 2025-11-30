/**
 * Hook for managing MediaRecorder lifecycle and audio recording.
 * Handles stream acquisition, MediaRecorder creation, start/stop, and cleanup.
 * 
 * Note: Audio visualization (analyserRef, audioContextRef) is managed by the component
 * via the onStreamReady callback, as these refs are needed by other hooks.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { getUserMediaStream } from '@/lib/audio/getUserMediaStream';

export type UseMediaRecorderOptions = {
  onStop?: (blob: Blob) => Promise<void> | void;
  onStreamReady?: (stream: MediaStream) => Promise<void> | void;
  onError?: (error: Error) => void;
  onDataAvailable?: (event: BlobEvent) => void;
};

export type UseMediaRecorderReturn = {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  error: string | null;
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
};

/**
 * Hook for managing MediaRecorder lifecycle.
 * 
 * @param options - Callbacks for stop, stream ready, error, and data available events
 * @returns Recording state, start/stop functions, error state, and mediaRecorderRef
 */
export function useMediaRecorder(
  options?: UseMediaRecorderOptions
): UseMediaRecorderReturn {
  // Track options in a ref to avoid stale closures
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // State
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for MediaRecorder lifecycle
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const pendingStopRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    if (typeof window === 'undefined') return;

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      const errorMsg = 'L\'enregistrement audio n\'est pas pris en charge dans ce navigateur.';
      setError(errorMsg);
      optionsRef.current?.onError?.(new Error(errorMsg));
      return;
    }

    setError(null);
    // Reset pendingStop at the start of recording to ensure clean state
    pendingStopRef.current = false;
    console.log('[START-RECORDING] Reset pendingStop to false');

    let stream: MediaStream;
    try {
      stream = await getUserMediaStream();
      streamRef.current = stream;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error.message);
      optionsRef.current?.onError?.(error);
      return;
    }

    const mr = new MediaRecorder(stream);
    chunksRef.current = [];
    mediaRecorderRef.current = mr;

    // Set up audio visualization via callback (sets analyserRef/audioContextRef in component)
    try {
      await optionsRef.current?.onStreamReady?.(stream);
    } catch (err) {
      console.error('Stream ready callback error:', err);
      // Continue anyway - visualization failure shouldn't block recording
    }

    // Set up MediaRecorder event handlers
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) {
        console.log('Audio chunk received:', e.data.size, 'bytes');
        chunksRef.current.push(e.data);
      }
      // Also call the optional callback if provided
      optionsRef.current?.onDataAvailable?.(e);
    };

    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

      // Call onStop callback (handles API submission in component)
      try {
        await optionsRef.current?.onStop?.(blob);
      } catch (err) {
        console.error('Stop callback error:', err);
      }

      // Cleanup after stop handler completes
      pendingStopRef.current = false;
      chunksRef.current = [];
      mr.stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore cleanup errors
        }
      });
      mr.ondataavailable = null;
      mr.onstop = null;
      if (mediaRecorderRef.current === mr) {
        mediaRecorderRef.current = null;
      }
    };

    mr.start();
    console.log('MediaRecorder start() called, initial state:', mr.state);
    setIsRecording(true);
  }, []); // No dependencies - uses optionsRef.current

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      console.log('[STOP-RECORDING] No active recorder, ignoring');
      // Reset pendingStop if recorder is already inactive
      pendingStopRef.current = false;
      return;
    }

    // Guard against double-stops - but only if recorder is already stopping
    // If recorder is still recording, we need to stop it even if pendingStop is true
    if (pendingStopRef.current && recorder.state !== 'recording') {
      console.log('[STOP-RECORDING] Already stopping (pendingStop is true and recorder not recording), ignoring duplicate call');
      return;
    }

    console.log('[STOP-RECORDING] Called, setting pendingStop to true');
    pendingStopRef.current = true;
    console.log('[STOP-RECORDING] Stopping MediaRecorder, state:', recorder.state);
    recorder.stop();
    setIsRecording(false);
  }, []); // No dependencies - uses refs

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pendingStopRef.current = true;
      const recorder = mediaRecorderRef.current;
      if (recorder) {
        try {
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
        } catch {
          // ignore stop errors during cleanup
        }
        recorder.ondataavailable = null;
        recorder.onstop = null;
      }
      mediaRecorderRef.current = null;

      // Stop stream tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {
            // ignore cleanup errors
          }
        });
        streamRef.current = null;
      }
    };
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    error,
    mediaRecorderRef,
  };
}

