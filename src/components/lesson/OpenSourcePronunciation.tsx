"use client";

import { useState, useRef, useEffect, useCallback, useMemo, type SVGProps } from 'react';
import { getUserMediaError } from '@/lib/audio/getUserMediaStream';
import { setupAudioVisualization } from '@/lib/audio/setupAudioVisualization';
import { submitPronunciationAssessment } from '@/lib/audio/submitPronunciationAssessment';
import { useAudioLevel } from '@/hooks/audio/useAudioLevel';
import { useSilenceDetection } from '@/hooks/audio/useSilenceDetection';
import { useMediaRecorder } from '@/hooks/audio/useMediaRecorder';

type Props = {
  referenceText: string;
  showReferenceLabel?: boolean;
  buttonOnly?: boolean;
  onWordResults?: (results: { reference: string; actual: string | null; correct: boolean }[]) => void;
  hideWordChips?: boolean;
  autoStart?: boolean;
  onRecordingComplete?: () => void;
  buttonColor?: string;
};

const iconProps: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-4 w-4',
  'aria-hidden': true,
};

const MicrophoneIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg {...iconProps} className={className}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const StopRecordingIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg {...iconProps} className={className}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

export function OpenSourcePronunciation({ referenceText, showReferenceLabel = true, buttonOnly = false, onWordResults, hideWordChips = false, autoStart = false, onRecordingComplete, buttonColor }: Props) {
  const [score, setScore] = useState<number | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [words, setWords] = useState<
    { reference: string; actual: string | null; correct: boolean }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  // Audio visualization refs (managed by component, set by onStreamReady callback)
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Callbacks for MediaRecorder hook
  const handleStop = useCallback(async (blob: Blob) => {
    try {
      const data = await submitPronunciationAssessment(blob, referenceText);
      setTranscript(data.transcript);
      setScore(data.score);
      setWords(data.words);
      onWordResults?.(data.words);
      onRecordingComplete?.();
    } catch (err: unknown) {
      console.error('Fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Impossible de contacter le serveur de prononciation: ${errorMessage}`);
    }
  }, [referenceText, onWordResults, onRecordingComplete]);

  // Audio visualization setup - sets analyserRef and audioContextRef for hooks
  const handleStreamReady = useCallback(async (stream: MediaStream) => {
    try {
      const { audioContext, analyser } = await setupAudioVisualization(stream);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      // Audio level monitoring will start automatically via useAudioLevel hook
    } catch (err) {
      console.error('Audio visualization error:', err);
    }
  }, []);

  // Error handling callback
  const handleError = useCallback((err: Error) => {
    const message = err instanceof Error && err.message.includes('n\'est pas pris en charge')
      ? err.message
      : getUserMediaError(err);
    setError(message);
  }, []);

  // Options object for MediaRecorder hook (memoized to prevent unnecessary re-renders)
  const recorderOptions = useMemo(() => ({
    onStop: handleStop,
    onStreamReady: handleStreamReady,
    onError: handleError,
  }), [handleStop, handleStreamReady, handleError]);

  // Use MediaRecorder hook
  const {
    isRecording,
    startRecording: hookStartRecording,
    stopRecording: hookStopRecording,
    error: recorderError,
    mediaRecorderRef,
  } = useMediaRecorder(recorderOptions);

  // Merge recorder error with component error
  useEffect(() => {
    if (recorderError) {
      setError(recorderError);
    }
  }, [recorderError]);

  // Start recording wrapper - resets component state before starting
  const startRecording = useCallback(async () => {
    setError(null);
    setScore(null);
    setTranscript(null);
    setWords([]);
    await hookStartRecording();
  }, [hookStartRecording]);

  // Stop recording wrapper - cleans up audio visualization
  const stopRecording = useCallback(() => {
    hookStopRecording();
    
    // Clean up audio context (managed by component)
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, [hookStopRecording]);

  // Silence detection - auto-stops recording when silence is detected
  const handleSilenceDetected = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') {
      stopRecording();
    }
  }, [stopRecording]);

  useSilenceDetection(analyserRef.current, isRecording, handleSilenceDetected);

  // Auto-start recording when autoStart prop is true
  useEffect(() => {
    if (autoStart && !isRecording && mediaRecorderRef.current === null) {
      startRecording();
    }
  }, [autoStart, isRecording, startRecording]);

  // Cleanup audio visualization on unmount (MediaRecorder cleanup handled by hook)
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      analyserRef.current = null;
    };
  }, []);

  const button = (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        className="flex flex-col items-center gap-1 rounded-xl border px-4 py-2.5 text-center font-normal font-sans text-sm transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9599] focus-visible:ring-offset-2 sm:px-5 sm:py-3 sm:text-base w-[100px] sm:w-[110px]"
        style={{
          borderColor: isRecording ? '#9bbfb2' : '#e3e0dc',
          backgroundColor: isRecording ? '#9bbfb2' : 'transparent',
          color: isRecording ? '#222326' : '#222326',
          opacity: isRecording ? 1 : 0.6,
        }}
      >
        {isRecording ? (
          <>
            <StopRecordingIcon />
            <span className="text-xs text-[#222326] whitespace-nowrap">Stop</span>
          </>
        ) : (
          <>
            <MicrophoneIcon />
            <span className="text-xs text-[#222326] whitespace-nowrap">Record</span>
          </>
        )}
      </button>
    </div>
  );

  const results = (
    <div className="w-full">
      {error && <p className="mb-3 sm:mb-4 text-xs text-red-600 text-center">{error}</p>}

      {score != null && (
        <div className="rounded-lg bg-white/70 p-3 text-sm shadow-sm max-w-md mx-auto">
          <p className="mb-3 font-semibold text-[#3b3a37] text-center">
            Score: {Math.round(score)} / 100
          </p>
          {transcript && (
            <p className="text-base sm:text-lg text-[#4a4945] leading-relaxed sm:leading-loose mb-4 text-center">
              You said: &ldquo;{transcript}&rdquo;
            </p>
          )}
          {words.length > 0 && !hideWordChips && (
            <div className="mt-2 flex flex-wrap justify-center text-xs">
              {words.map((w, i) => (
                <span
                  key={i}
                  className={`inline-block px-3 py-1 rounded-full text-sm mr-2 mb-2 ${
                    w.correct 
                      ? 'bg-[#247368]/10 text-[#247368]' 
                      : 'bg-[#a6a198]/10 text-[#a6a198]'
                  }`}
                >
                  {w.reference}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (buttonOnly) {
    return (
      <>
        {button}
        {results}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {showReferenceLabel && (
        <p className="mb-4 md:mb-5 text-sm text-gray-700">
          Repeat: <span className="font-semibold">{referenceText}</span>
        </p>
      )}

      <div className="mt-4 md:mt-6 mb-2">
        {button}
      </div>

      {error && <p className="mb-4 md:mb-5 text-xs text-red-600">{error}</p>}

      {score != null && (
        <div className="rounded-lg bg-white/70 p-3 text-sm shadow-sm">
          <p className="mb-3 font-semibold text-[#3b3a37]">
            Score: {Math.round(score)} / 100
          </p>
          {transcript && (
            <p className="text-base sm:text-lg text-[#4a4945] leading-relaxed sm:leading-loose mb-4">
              You said: &ldquo;{transcript}&rdquo;
            </p>
          )}
          {words.length > 0 && !hideWordChips && (
            <div className="mt-2 flex flex-wrap text-xs">
              {words.map((w, i) => (
                <span
                  key={i}
                  className={`inline-block px-3 py-1 rounded-full text-sm mr-2 mb-2 ${
                    w.correct 
                      ? 'bg-[#247368]/10 text-[#247368]' 
                      : 'bg-[#a6a198]/10 text-[#a6a198]'
                  }`}
                >
                  {w.reference}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
