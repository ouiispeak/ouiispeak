# Whisper Pronunciation Service

This directory hosts a very small FastAPI service that wraps
[`faster-whisper`](https://github.com/guillaumekln/faster-whisper) so the
Next.js pronunciation endpoint can delegate automatic speech recognition
to an isolated Python worker.

## Prerequisites

- Python 3.10+ (the models benefit from newer PyTorch builds)
- `ffmpeg` available on the `PATH`

## Installation

```bash
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

## Running the service

```bash
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

Environment variables:

| Variable | Default | Description |
| --- | --- | --- |
| `WHISPER_MODEL` | `small` | Model size passed to `WhisperModel`. |
| `WHISPER_COMPUTE_TYPE` | `int8_float16` | Precision passed to `WhisperModel`. |
| `WHISPER_DEVICE` | `auto` | Device string (`cpu`, `cuda`, etc.). |
| `WHISPER_LANGUAGE` | _auto-detect_ | Optional ISO code to lock decoding. |

## Connecting Next.js

Add the service URL to `.env.local` so `/api/pronunciation-assessment`
knows where to forward requests:

```
WHISPER_BASE_URL=http://localhost:8000
```

Then start the Next dev server (`pnpm dev`). The `PronunciationSlide`
and `AISpeakStudentRepeat` slide types will now record audio in the
browser, POST it to `/api/pronunciation-assessment`, which in turn calls
this Python worker’s `/transcribe` endpoint.
