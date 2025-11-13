import asyncio
import os
import tempfile
from pathlib import Path
from typing import Dict, Optional, Union

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel

WHISPER_MODEL = os.getenv("WHISPER_MODEL", "small")
WHISPER_COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "int8_float16")
WHISPER_DEVICE = os.getenv("WHISPER_DEVICE", "auto")
FORCED_LANGUAGE = os.getenv("WHISPER_LANGUAGE")

app = FastAPI(title="OuiiSpeak Whisper Gateway")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_model_lock = asyncio.Lock()
_model: Optional[WhisperModel] = None


def _candidate_compute_types() -> list[str]:
    candidates = [WHISPER_COMPUTE_TYPE]
    for fallback in ("int8", "float16", "float32"):
        if fallback not in candidates:
            candidates.append(fallback)
    return candidates


async def _get_model() -> WhisperModel:
    global _model
    if _model is None:
        async with _model_lock:
            if _model is None:
                last_error: Optional[Exception] = None
                for compute_type in _candidate_compute_types():
                    try:
                        _model = WhisperModel(
                            WHISPER_MODEL,
                            device=WHISPER_DEVICE,
                            compute_type=compute_type,
                        )
                        break
                    except ValueError as err:
                        last_error = err
                        continue
                if _model is None:
                    raise last_error or RuntimeError("Unable to initialize WhisperModel")
    return _model


@app.get("/healthz")
async def health() -> dict[str, str]:
    return {"status": "ok", "model": WHISPER_MODEL}


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)) -> Dict[str, Union[str, float]]:
    if not file:
        raise HTTPException(status_code=400, detail="Missing audio file.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty audio file.")

    tmp_dir = Path(tempfile.mkdtemp(prefix="ouiispeak-whisper-"))
    tmp_path = tmp_dir / file.filename

    try:
        tmp_path.write_bytes(data)

        model = await _get_model()
        segments, info = model.transcribe(
            str(tmp_path),
            language=FORCED_LANGUAGE,
            beam_size=5,
        )
        transcript = " ".join(segment.text.strip() for segment in segments).strip()

        return {
            "text": transcript,
            "language": info.language,
            "language_probability": getattr(info, "language_probability", 0.0),
        }
    finally:
        try:
            tmp_path.unlink(missing_ok=True)
            tmp_dir.rmdir()
        except OSError:
            pass
