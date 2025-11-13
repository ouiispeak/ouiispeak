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
    const message = await response.text();
    throw new Error(message || 'Impossible de générer la voix.');
  }

  const arrayBuffer = await response.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);
  return {
    url,
    revoke: () => URL.revokeObjectURL(url),
  };
}
