"use client";

import { useState, useRef, useEffect } from 'react';

type Props = {
  referenceText: string;
  showReferenceLabel?: boolean;
};

export function OpenSourcePronunciation({ referenceText, showReferenceLabel = true }: Props) {
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

  return (
    <div className="flex flex-col gap-3">
      {showReferenceLabel && (
        <p className="mb-4 md:mb-5 text-sm text-gray-700">
          Repeat: <span className="font-semibold">{referenceText}</span>
        </p>
      )}

      <div className="mt-4 md:mt-6 mb-2">
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:bg-[#e8e5e1] focus:outline-none focus:ring-2 focus:ring-[#cfcac5] focus:ring-offset-2 focus:ring-offset-transparent ${
            isRecording ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          {isRecording ? 'Stop' : 'Record'}
        </button>
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
