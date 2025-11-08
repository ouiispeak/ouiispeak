import { NextResponse } from 'next/server';

type TtsRequest = {
  text: string;
  voiceId?: string;
  languageCode?: string;
};

type TtsResponse = {
  audioUrl: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TtsRequest;

    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    // TODO: integrate with real TTS (ElevenLabs / OpenAI)
    // For now, just return a placeholder URL or a data URL.
    const mockUrl = 'https://example.com/mock-audio-file.mp3';

    const res: TtsResponse = {
      audioUrl: mockUrl,
    };

    return NextResponse.json(res);
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

