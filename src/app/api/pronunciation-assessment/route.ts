import { NextRequest, NextResponse } from 'next/server';

const WHISPER_BASE_URL = process.env.WHISPER_BASE_URL?.replace(/\/$/, '') ?? null;
const WHISPER_TIMEOUT_MS = Number(process.env.WHISPER_TIMEOUT_MS ?? 15000);

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9\s]/gi, '') // remove punctuation (English-focused)
    .replace(/\s+/g, ' ')
    .trim();
}

function simpleWordScore(reference: string, actual: string) {
  const refWords = normalizeText(reference).split(' ');
  const actWords = normalizeText(actual).split(' ');
  let correct = 0;

  for (let i = 0; i < refWords.length; i++) {
    if (actWords[i] && actWords[i] === refWords[i]) {
      correct++;
    }
  }

  const accuracy = refWords.length ? (correct / refWords.length) * 100 : 0;

  // Build per-word result for UI
  const wordResults = refWords.map((w, i) => ({
    reference: w,
    actual: actWords[i] ?? null,
    correct: actWords[i] === w,
  }));

  return { accuracy, wordResults };
}

export async function POST(req: NextRequest) {
  try {
    if (!WHISPER_BASE_URL) {
      return NextResponse.json(
        { error: 'WHISPER_BASE_URL env var is not configured.' },
        { status: 500 },
      );
    }

    const url = new URL(req.url);
    const referenceText = url.searchParams.get('referenceText');
    if (!referenceText) {
      return NextResponse.json(
        { error: 'Missing referenceText query param' },
        { status: 400 }
      );
    }

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Expected multipart/form-data with field "file"' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Missing audio file (field "file")' },
        { status: 400 }
      );
    }

    // Forward to Whisper server
    const whisperForm = new FormData();
    whisperForm.append('file', file);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), WHISPER_TIMEOUT_MS);

    const whisperRes = await fetch(`${WHISPER_BASE_URL}/transcribe`, {
      method: 'POST',
      body: whisperForm,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!whisperRes.ok) {
      const text = await whisperRes.text();
      console.error('Whisper error:', text);
      return NextResponse.json(
        { error: 'Whisper server error', status: whisperRes.status },
        { status: 502 }
      );
    }

    const { text } = (await whisperRes.json()) as { text: string };

    const { accuracy, wordResults } = simpleWordScore(referenceText, text);

    return NextResponse.json({
      transcript: text,
      score: accuracy,
      words: wordResults,
    });
  } catch (e: unknown) {
    console.error('Pronunciation route error', e);
    const isAbort = e instanceof Error && e.name === 'AbortError';
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json(
      { error: isAbort ? 'Whisper request timed out.' : message },
      { status: isAbort ? 504 : 500 },
    );
  }
}
