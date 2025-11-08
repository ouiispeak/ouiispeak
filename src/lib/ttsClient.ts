/**
 * Client-side helper for fetching TTS audio from the API.
 * 
 * This is a clean integration point for TTS functionality.
 * Currently uses a mock endpoint, but will integrate with real TTS providers later.
 */

export async function fetchTtsAudio(
  text: string,
  options?: { voiceId?: string; languageCode?: string }
): Promise<string> {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      voiceId: options?.voiceId,
      languageCode: options?.languageCode,
    }),
  });

  if (!res.ok) {
    throw new Error('TTS request failed');
  }

  const data = (await res.json()) as { audioUrl: string };
  return data.audioUrl;
}

