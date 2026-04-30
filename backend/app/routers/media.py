import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services import speech, vision
from app.services.lang_detect import detect_language

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/media", tags=["media"])


@router.post("/analyze-image")
async def analyze_image(
    image: UploadFile = File(...),
    mode: str = Form("qa"),
    language: str | None = Form(None),
    prompt: str | None = Form(None),
):
    """Accept an image upload + optional question, return Gemini's analysis.

    Mode:
      - "ocr": extract visible text only
      - "describe": short natural-language description
      - "qa": answer the user's question about the image (default)
    """
    if mode not in ("ocr", "describe", "qa"):
        raise HTTPException(status_code=422, detail="mode must be one of ocr|describe|qa")

    image_bytes = await image.read()
    mime = (image.content_type or "image/jpeg").lower()

    # Determine reply language. If the user typed a prompt, detect from it;
    # otherwise honour the explicit language parameter; default English.
    reply_language = language
    if not reply_language and prompt:
        reply_language = detect_language(prompt)
    if not reply_language:
        reply_language = "en"

    try:
        text = await vision.analyze_image(
            image_bytes=image_bytes,
            mime_type=mime,
            mode=mode,  # type: ignore[arg-type]
            language_hint=reply_language,
            user_prompt=prompt,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error("Image analysis failed: %s", e)
        raise HTTPException(
            status_code=503,
            detail="Image analysis is temporarily unavailable. Please try again shortly.",
        )

    return {
        "response": text,
        "mode": mode,
        "language": reply_language,
        "filename": image.filename,
    }


@router.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    language: str | None = Form(None),
):
    """Server-side speech-to-text fallback.

    The frontend prefers the browser Web Speech API. This endpoint returns
    a structured "unsupported" response unless a provider is wired up — the
    frontend uses that to display a graceful fallback message.
    """
    audio_bytes = await audio.read()
    mime = audio.content_type or "audio/webm"
    result = await speech.transcribe(audio_bytes, mime, language)
    return {
        "text": result.text,
        "language": result.language,
        "provider": result.provider,
        "supported": result.supported,
        "note": result.note,
    }


@router.post("/synthesize")
async def synthesize(
    text: str = Form(...),
    language: str | None = Form(None),
):
    """Server-side text-to-speech fallback. See speech.synthesize doc."""
    result = await speech.synthesize(text, language)
    if not result.supported:
        return {
            "supported": False,
            "provider": result.provider,
            "note": result.note,
        }
    # If a future provider returns audio, send it as a base64 data URL so the
    # frontend can play it without an extra round-trip.
    import base64
    return {
        "supported": True,
        "provider": result.provider,
        "mime_type": result.mime_type,
        "audio_b64": base64.b64encode(result.audio_bytes or b"").decode("ascii"),
    }
