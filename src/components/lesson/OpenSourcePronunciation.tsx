"use client";

import { useState, useRef, useEffect, useCallback, type SVGProps } from 'react';
import { getUserMediaStream, getUserMediaError } from '@/lib/audio/getUserMediaStream';
import { setupAudioVisualization } from '@/lib/audio/setupAudioVisualization';
import { submitPronunciationAssessment } from '@/lib/audio/submitPronunciationAssessment';
import { useAudioLevel } from '@/hooks/audio/useAudioLevel';
import { useSilenceDetection } from '@/hooks/audio/useSilenceDetection';

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
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [words, setWords] = useState<
    { reference: string; actual: string | null; correct: boolean }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const pendingStopRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use hook for audio level monitoring
  const audioLevel = useAudioLevel(analyserRef.current, isRecording);

  async function startRecording() {
    if (typeof window === 'undefined') return;

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('L’enregistrement audio n’est pas pris en charge dans ce navigateur.');
      return;
    }

    setError(null);
    setScore(null);
    setTranscript(null);
    setWords([]);
    // Reset pendingStop at the start of recording to ensure clean state
    pendingStopRef.current = false;
    console.log('[START-RECORDING] Reset pendingStop to false');
    // Silence detection is handled by useSilenceDetection hook

    let stream: MediaStream;
    try {
      stream = await getUserMediaStream();
      streamRef.current = stream;
    } catch (err: unknown) {
      const message = err instanceof Error && err.message.includes('n\'est pas pris en charge')
        ? err.message
        : getUserMediaError(err);
      setError(message);
      return;
    }

    const mr = new MediaRecorder(stream);
    chunksRef.current = [];
    mediaRecorderRef.current = mr;

    // Set up audio visualization BEFORE starting MediaRecorder
    try {
      const { audioContext, analyser } = await setupAudioVisualization(stream);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
    } catch (err) {
      console.error('Audio visualization error:', err);
    }

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) {
        console.log('Audio chunk received:', e.data.size, 'bytes');
        chunksRef.current.push(e.data);
      }
    };

    // Audio level monitoring is now handled by useAudioLevel hook
    // Silence detection will be extracted in Step 2.2

    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

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
      } finally {
        // Reset pendingStop after stop handler completes
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
      }
    };

    // Store references locally for the closure
    const currentRecorder = mr;
    const currentAnalyser = analyserRef.current;
    
    mr.start();
    console.log('MediaRecorder start() called, initial state:', mr.state);
    setIsRecording(true);
    
    // Audio level monitoring is now handled automatically by useAudioLevel hook
  }

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
    // Silence detection cleanup is handled by useSilenceDetection hook
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    console.log('[STOP-RECORDING] Stopping MediaRecorder, state:', recorder.state);
    recorder.stop();
    setIsRecording(false);
    
    // Audio level monitoring cleanup is handled by useAudioLevel hook
    
    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    
    // Stream tracks will be stopped in the MediaRecorder onstop handler
  }, []); // No dependencies - uses refs and state setters which are stable

  // Silence detection hook - monitors analyser directly and auto-stops when silence detected
  // Reads analyser directly (not gated by rAF) to avoid stale values when tab is backgrounded
  // Note: We check recorder state directly, not pendingStopRef, because refs can be stale
  const handleSilenceDetected = useCallback(() => {
    // Check recorder state directly - this is the source of truth
    // Don't check pendingStopRef here - stopRecording() has its own guard against double-stops
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') {
      console.log('[AUTO-STOP] handleSilenceDetected: calling stopRecording()');
      stopRecording(); // stopRecording() will check pendingStopRef internally and prevent double-stops
    } else {
      console.log('[AUTO-STOP] handleSilenceDetected: skipping - recorder not in recording state', {
        hasRecorder: !!recorder,
        recorderState: recorder?.state
      });
    }
  }, [stopRecording]);

  useSilenceDetection(
    analyserRef.current, // Pass analyser directly so hook can read it independently of rAF
    isRecording, // Only gate with isRecording - callback will check pendingStopRef
    handleSilenceDetected
  );

  // Auto-start recording when autoStart prop is true
  useEffect(() => {
    console.log('Auto-start effect triggered:', { autoStart, isRecording, pendingStop: pendingStopRef.current, hasRecorder: mediaRecorderRef.current !== null });
    if (autoStart && !isRecording && !pendingStopRef.current && mediaRecorderRef.current === null) {
      // Start recording immediately when autoStart becomes true
      console.log('Auto-starting recording...');
      startRecording();
    }
  }, [autoStart]);

  useEffect(() => {
    return () => {
      pendingStopRef.current = true;
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
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

      // Clean up audio visualization
      // Animation frame cleanup is handled by useAudioLevel hook
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      analyserRef.current = null;
      streamRef.current = null;
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
