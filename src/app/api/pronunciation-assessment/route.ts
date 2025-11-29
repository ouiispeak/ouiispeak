import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const resolveWhisperBaseUrl = () => {
  const explicit =
    process.env.WHISPER_BASE_URL ??
    process.env.NEXT_PUBLIC_WHISPER_BASE_URL ??
    null;

  if (explicit) {
    return explicit.replace(/\/$/, '');
  }

  if (process.env.NODE_ENV !== 'production') {
    // Default to the bundled whisper dev server when running locally.
    return 'http://127.0.0.1:8000';
  }

  return null;
};

const WHISPER_BASE_URL = resolveWhisperBaseUrl();
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

// Map of single letters to common Whisper transcriptions
const LETTER_TRANSCRIPTIONS: Record<string, string[]> = {
  'a': ['a', 'ay', 'eh'],
  'b': ['b', 'be', 'bee'],
  'c': ['c', 'see', 'sea'],
  'd': ['d', 'dee'],
  'e': ['e', 'ee', 'eh'],
  'f': ['f', 'ef', 'eff'],
  'g': ['g', 'gee', 'jee'],
  'h': ['h', 'aitch', 'haitch'],
  'i': ['i', 'eye', 'ay'],
  'j': ['j', 'jay', 'jai'],
  'k': ['k', 'kay', 'kei'],
  'l': ['l', 'el', 'ell'],
  'm': ['m', 'em'],
  'n': ['n', 'en'],
  'o': ['o', 'oh', 'owe'],
  'p': ['p', 'pee', 'pea'],
  'q': ['q', 'cue', 'queue', 'kyu'],
  'r': ['r', 'ar', 'are'],
  's': ['s', 'es', 'ess'],
  't': ['t', 'tee', 'tea'],
  'u': ['u', 'you', 'yew'],
  'v': ['v', 'vee'],
  'w': ['w', 'double u', 'double-u', 'doubleyou'],
  'x': ['x', 'ex', 'eks'],
  'y': ['y', 'why', 'wye', 'wy'],
  'z': ['z', 'zed', 'zee'],
};

function matchesLetter(letter: string, transcript: string): boolean {
  const normalizedLetter = letter.toLowerCase().trim();
  const normalizedTranscript = normalizeText(transcript);
  
  // If it's a single letter, check against common transcriptions
  if (normalizedLetter.length === 1 && LETTER_TRANSCRIPTIONS[normalizedLetter]) {
    const possibleTranscriptions = LETTER_TRANSCRIPTIONS[normalizedLetter];
    const transcriptWords = normalizedTranscript.split(/\s+/);
    
    // Check if any word in the transcript matches any possible transcription
    return transcriptWords.some(word => 
      possibleTranscriptions.some(trans => word === trans || word.startsWith(trans))
    );
  }
  
  // For non-single letters, use exact match
  return normalizedTranscript === normalizedLetter;
}

function simpleWordScore(reference: string, actual: string) {
  const refWords = normalizeText(reference).split(' ').filter(w => w.length > 0);
  const actWords = normalizeText(actual).split(' ').filter(w => w.length > 0);
  let correct = 0;

  // Special handling for single-letter references
  if (refWords.length === 1 && refWords[0].length === 1) {
    // Single letter - use flexible matching
    const letter = refWords[0];
    const matches = matchesLetter(letter, actual);
    correct = matches ? 1 : 0;
    
    return {
      accuracy: correct * 100,
      wordResults: [{
        reference: reference,
        actual: actual,
        correct: matches,
      }],
    };
  }

  // Standard word-by-word comparison for multi-word or multi-character references
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
      headers: {
        Accept: 'application/json',
      },
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
