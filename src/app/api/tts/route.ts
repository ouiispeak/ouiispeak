import { NextResponse } from 'next/server';

import type { SupportedLang } from '@/lib/voices';
import { VOICE_PROFILES } from '@/lib/serverVoices';

type TtsRequest = {
  text?: string;
  voiceId?: string;
  modelId?: string;
  lang?: SupportedLang;
};

const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
const DEFAULT_VOICE_ID = process.env.ELEVEN_LABS_VOICE_ID;
const DEFAULT_MODEL_ID = process.env.ELEVEN_LABS_MODEL_ID || 'eleven_multilingual_v2';

export async function POST(req: Request) {
  if (!ELEVEN_LABS_API_KEY) {
    return NextResponse.json(
      { error: 'ELEVEN_LABS_API_KEY env var is not configured.' },
      { status: 500 },
    );
  }

  let body: TtsRequest = {};
  try {
    body = (await req.json()) as TtsRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  if (!body.text || typeof body.text !== 'string') {
    return NextResponse.json({ error: 'Missing text' }, { status: 400 });
  }

  const langProfile =
    (body.lang && VOICE_PROFILES[body.lang]) ||
    (VOICE_PROFILES.fr ?? VOICE_PROFILES.en);

  const voiceId = body.voiceId || langProfile?.voiceId || DEFAULT_VOICE_ID;
  const modelId = body.modelId || langProfile?.modelId || DEFAULT_MODEL_ID;

  if (!voiceId) {
    return NextResponse.json(
      { error: 'A voiceId is required but none was provided.' },
      { status: 500 },
    );
  }

  const elevenResponse = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVEN_LABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: body.text,
        model_id: modelId,
        voice_settings: {
          stability: 0.3,
          similarity_boost: 0.75,
        },
      }),
    },
  );

  if (!elevenResponse.ok) {
    const details = await elevenResponse.text();
    return NextResponse.json(
      { error: 'Failed to synthesize audio.', details },
      { status: elevenResponse.status },
    );
  }

  const audioBuffer = await elevenResponse.arrayBuffer();

  return new Response(audioBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
    },
  });
}
