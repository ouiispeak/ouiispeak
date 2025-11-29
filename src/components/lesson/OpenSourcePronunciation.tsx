"use client";

import { useState, useRef, useEffect, type SVGProps } from 'react';

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
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const pendingStopRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceStartTimeRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    pendingStopRef.current = false;
    silenceStartTimeRef.current = null;

    let stream: MediaStream;
    try {
      // Request audio with specific constraints
      stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      streamRef.current = stream;
      
      console.log('Got media stream:', stream);
      console.log('Stream ID:', stream.id);
      console.log('Active:', stream.active);
      const audioTracks = stream.getAudioTracks();
      console.log('Audio tracks:', audioTracks.length);
      audioTracks.forEach((track, i) => {
        console.log(`Track ${i}:`, {
          id: track.id,
          kind: track.kind,
          label: track.label,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          settings: track.getSettings(),
          constraints: track.getConstraints(),
        });
      });
    } catch (err: unknown) {
      console.error('getUserMedia error:', err);
      const isPermissionError = err instanceof DOMException && err.name === 'NotAllowedError';
      const message = isPermissionError
        ? "L'accès au micro a été refusé."
        : "Impossible d'accéder au micro.";
      setError(message);
      return;
    }

    const mr = new MediaRecorder(stream);
    chunksRef.current = [];
    mediaRecorderRef.current = mr;

    // Set up audio visualization BEFORE starting MediaRecorder
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    
    try {
      console.log('Setting up audio visualization...');
      
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('Audio context created, state:', audioContext.state);
      
      // Resume audio context if suspended (required for some browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('Audio context resumed, new state:', audioContext.state);
      }
      
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3; // Lower for more responsive
      
      console.log('Creating media stream source from stream:', stream.id);
      const microphone = audioContext.createMediaStreamSource(stream);
      console.log('Media stream source created');
      
      microphone.connect(analyser);
      console.log('Analyser connected to microphone source');
      
      // Verify connection
      console.log('Analyser node:', {
        fftSize: analyser.fftSize,
        frequencyBinCount: analyser.frequencyBinCount,
        smoothingTimeConstant: analyser.smoothingTimeConstant,
      });
      
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

    // Start animation loop for audio level - define it here so it has access to the refs
    const updateAudioLevel = () => {
      const analyser = analyserRef.current;
      const recorder = mediaRecorderRef.current;
      
      if (!analyser || !recorder) {
        console.log('[ANIMATION] Stopping: analyser or recorder missing', { analyser: !!analyser, recorder: !!recorder });
        return;
      }
      
      // Check if still recording
      if (recorder.state !== 'recording') {
        console.log('[ANIMATION] Recorder state is not recording:', recorder.state, '- stopping animation loop');
        return;
      }
      
      // Use time domain data for better volume detection
      const dataArray = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(dataArray);
      
      // Calculate RMS (Root Mean Square) for volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const normalized = (dataArray[i] - 128) / 128; // Normalize to -1 to 1
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const normalizedLevel = Math.min(rms * 2, 1); // Scale and clamp to 0-1
      
      // Also get max amplitude for debugging
      const maxAmplitude = Math.max(...Array.from(dataArray));
      const minAmplitude = Math.min(...Array.from(dataArray));
      const amplitudeRange = maxAmplitude - minAmplitude;
      
      // Debug logging (throttled)
      if (Math.random() < 0.1) { // Log ~10% of the time
        const allZeros = dataArray.every(v => v === 128); // 128 is silence in time domain
        console.log('Audio level:', { 
          rms: rms.toFixed(3), 
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
      
      // Auto-stop detection: if audio level is below threshold for 1 second, stop recording
      const SILENCE_THRESHOLD = 0.20; // 15% threshold
      const SILENCE_DURATION = 1500; // 1 second of silence
      
      // Auto-stop detection: check conditions and log for debugging
      const recorderIsActive = mediaRecorderRef.current?.state === 'recording';
      if (recorderIsActive) {
        if (normalizedLevel < SILENCE_THRESHOLD) {
          if (silenceStartTimeRef.current === null) {
            silenceStartTimeRef.current = Date.now();
            console.log(`[AUTO-STOP] Silence detected (level: ${(normalizedLevel * 100).toFixed(1)}%), starting timer...`);
          } else {
            const silenceDuration = Date.now() - silenceStartTimeRef.current;
            console.log(`[AUTO-STOP] Still silent (level: ${(normalizedLevel * 100).toFixed(1)}%), duration: ${silenceDuration}ms / ${SILENCE_DURATION}ms`);
            if (silenceDuration >= SILENCE_DURATION) {
              console.log(`[AUTO-STOP] ✅ Stopping recording due to 1 second of silence (level: ${(normalizedLevel * 100).toFixed(1)}%)`);
              stopRecording();
              return;
            }
          }
        } else {
          if (silenceStartTimeRef.current !== null) {
            console.log(`[AUTO-STOP] Audio detected (level: ${(normalizedLevel * 100).toFixed(1)}%), resetting silence timer`);
            silenceStartTimeRef.current = null;
          }
        }
      } else {
        if (!recorderIsActive) {
          console.log('[AUTO-STOP] Skipped: recorder not active');
        }
        if (pendingStopRef.current) {
          console.log('[AUTO-STOP] Skipped: pendingStop is true');
        }
      }
      
      // Continue animation
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };

    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('file', blob, 'audio.webm');

      try {
        console.log('Sending audio to pronunciation assessment API...', {
          blobSize: blob.size,
          referenceText,
        });
        
        const res = await fetch(
          `/api/pronunciation-assessment?referenceText=${encodeURIComponent(referenceText)}`,
          {
            method: 'POST',
            body: formData,
          },
        );

        console.log('API response status:', res.status, res.statusText);

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          console.error('API error response:', body);
          setError(body.error ?? `Server error (${res.status})`);
          return;
        }

        const data = await res.json();
        console.log('Pronunciation assessment result:', data);
        const newWords = data.words ?? [];
        setTranscript(data.transcript);
        setScore(data.score);
        setWords(newWords);
        onWordResults?.(newWords);
        onRecordingComplete?.();
      } catch (err: unknown) {
        console.error('Fetch error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Impossible de contacter le serveur de prononciation: ${errorMessage}`);
      } finally {
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
    
    // Wait for MediaRecorder to actually start recording (it's async)
    const waitForRecording = () => {
      if (currentRecorder.state === 'recording') {
        console.log('MediaRecorder is now recording, starting audio level animation');
        if (currentAnalyser) {
          updateAudioLevel();
        } else {
          console.warn('Analyser not available');
        }
      } else {
        console.log('Waiting for MediaRecorder to start... current state:', currentRecorder.state);
        setTimeout(waitForRecording, 50);
      }
    };
    
    // Start checking after a short delay
    setTimeout(waitForRecording, 50);
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      console.log('[STOP-RECORDING] No active recorder, ignoring');
      return;
    }

    console.log('[STOP-RECORDING] Called, setting pendingStop to true');
    pendingStopRef.current = true;
    silenceStartTimeRef.current = null;
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    console.log('[STOP-RECORDING] Stopping MediaRecorder, state:', recorder.state);
    recorder.stop();
    setIsRecording(false);
    setAudioLevel(0);
    
    // Stop animation loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    
    // Stream tracks will be stopped in the MediaRecorder onstop handler
  }

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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      analyserRef.current = null;
      streamRef.current = null;
      setAudioLevel(0);
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
