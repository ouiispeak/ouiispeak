'use client';

import { DEFAULT_SPEECH_LANG, type SupportedLang } from '@/lib/voices';
import type { SpeechContent } from '@/lessons/types';

export type SpeechAsset = {
  url: string;
  revoke?: () => void;
};

type FetchSpeechOptions = {
  fallbackLang?: SupportedLang;
  fallbackText?: string;
};

export async function fetchSpeechAsset(
  speech: SpeechContent,
  { fallbackLang, fallbackText }: FetchSpeechOptions = {},
): Promise<SpeechAsset> {
  if (!speech) {
    throw new Error('A speech configuration is required.');
  }

  if (speech.mode === 'file') {
    if (!speech.fileUrl) {
      throw new Error('Speech mode "file" requires a fileUrl.');
    }
    return { url: speech.fileUrl };
  }

  const text = speech.text ?? fallbackText;
  if (!text) {
    throw new Error('Speech mode "tts" requires text to synthesize.');
  }

  const lang = speech.lang ?? fallbackLang ?? DEFAULT_SPEECH_LANG;

  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      lang,
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Impossible de générer la voix.';
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } else {
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
    } catch {
      // If parsing fails, use default message
    }
    throw new Error(errorMessage);
  }

  const arrayBuffer = await response.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);
  return {
    url,
    revoke: () => URL.revokeObjectURL(url),
  };
}
