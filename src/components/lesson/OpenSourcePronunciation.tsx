"use client";

import { useState, useRef, useEffect, type SVGProps } from 'react';

type Props = {
  referenceText: string;
  showReferenceLabel?: boolean;
  buttonOnly?: boolean;
};

const iconProps: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-6 w-6',
  'aria-hidden': true,
};

const MicrophoneIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg {...iconProps} className={className}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const StopRecordingIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg {...iconProps} className={className}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

export function OpenSourcePronunciation({ referenceText, showReferenceLabel = true, buttonOnly = false }: Props) {
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

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: unknown) {
      const isPermissionError = err instanceof DOMException && err.name === 'NotAllowedError';
      const message = isPermissionError
        ? 'L’accès au micro a été refusé.'
        : 'Impossible d’accéder au micro.';
      setError(message);
      return;
    }

    const mr = new MediaRecorder(stream);
    chunksRef.current = [];

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('file', blob, 'audio.webm');

      try {
        const res = await fetch(
          `/api/pronunciation-assessment?referenceText=${encodeURIComponent(referenceText)}`,
          {
            method: 'POST',
            body: formData,
          },
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error ?? 'Server error');
          return;
        }

        const data = await res.json();
        setTranscript(data.transcript);
        setScore(data.score);
        setWords(data.words ?? []);
      } catch (err: unknown) {
        console.error(err);
        setError('Impossible de contacter le serveur de prononciation.');
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

    mediaRecorderRef.current = mr;
    mr.start();
    setIsRecording(true);
  }

  function stopRecording() {
    pendingStopRef.current = true;
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
  }

  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) return;
      if (pendingStopRef.current) {
        return;
      }

      try {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      } catch {
        // ignore stop errors during cleanup
      }

      const stream = recorder.stream;
      if (stream) {
        stream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {
            // ignore cleanup errors
          }
        });
      }

      recorder.ondataavailable = null;
      recorder.onstop = null;
      mediaRecorderRef.current = null;
    };
  }, [isRecording]);

  const button = (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      className="flex flex-col items-center gap-1 rounded-xl border border-[#e3e0dc] bg-transparent px-4 py-2 text-center font-normal font-sans text-[#222326] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9599] focus-visible:ring-offset-2"
    >
      {isRecording ? (
        <>
          <StopRecordingIcon />
          <span className="text-xs text-[#222326]">Stop</span>
        </>
      ) : (
        <>
          <MicrophoneIcon />
          <span className="text-xs text-[#222326]">Record</span>
        </>
      )}
    </button>
  );

  if (buttonOnly) {
    return button;
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
            <p className="text-base text-[#4a4945] leading-relaxed mb-4">
              You said: &ldquo;{transcript}&rdquo;
            </p>
          )}
          <div className="mt-2 flex flex-wrap text-xs">
            {words.map((w, i) => (
              <span
                key={i}
                className="inline-block px-3 py-1 rounded-full bg-[#ece9e6] text-[#494843] text-sm mr-2 mb-2"
              >
                {w.reference}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
