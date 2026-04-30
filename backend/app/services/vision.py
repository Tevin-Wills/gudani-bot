"""Image understanding service.

Uses Gemini as the vision provider because:
  - the user already has GEMINI_API_KEY in .env,
  - Gemini's free tier is generous enough for student/community usage,
  - it gives us full image understanding (not just OCR), so the bot can
    answer questions about photographed schoolwork, posters, signs, forms.

The caller chooses one of three modes:
  - "ocr": extract visible text only.
  - "describe": natural-language description of the image.
  - "qa": answer the user-supplied question about the image.

If Gemini fails or the key is missing, callers receive a clear error and
should surface a fallback message to the user (no silent guesses).
"""

from __future__ import annotations

import logging
from typing import Literal

from app.services.llm_service import get_gemini

logger = logging.getLogger(__name__)

ALLOWED_MIME = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"}
MAX_BYTES = 6 * 1024 * 1024  # 6 MB cap; protects free tier and request limits.

Mode = Literal["ocr", "describe", "qa"]


def _build_prompt(mode: Mode, language_hint: str | None, user_prompt: str | None) -> str:
    lang_clause = ""
    if language_hint and language_hint != "en":
        lang_clause = f"\nReply in language code: {language_hint}. If you don't speak it, reply in English with a note."

    if mode == "ocr":
        return (
            "Extract ALL visible text from this image, preserving line "
            "breaks and reading order. If there is no readable text, say "
            "'No readable text detected.'"
            + lang_clause
        )
    if mode == "describe":
        return (
            "Describe this image clearly and helpfully in 2-4 sentences. "
            "If it shows schoolwork, a form, a sign, or a notice, say so "
            "explicitly and summarize the key information."
            + lang_clause
        )
    if mode == "qa":
        question = (user_prompt or "").strip() or "What is shown in this image?"
        return (
            f"The user is asking about this image:\n\nQuestion: {question}\n\n"
            "Look at the image carefully and answer the question. If the "
            "image contains text (homework, a form, a sign), read it and use "
            "it. If the answer is uncertain, say what you can see and admit "
            "uncertainty rather than guessing."
            + lang_clause
        )
    raise ValueError(f"Unknown vision mode: {mode}")


async def analyze_image(
    image_bytes: bytes,
    mime_type: str,
    *,
    mode: Mode = "qa",
    language_hint: str | None = None,
    user_prompt: str | None = None,
) -> str:
    """Send an image (and optional prompt) to Gemini and return the text reply."""
    if mime_type not in ALLOWED_MIME:
        raise ValueError(
            f"Unsupported image type '{mime_type}'. Allowed: {sorted(ALLOWED_MIME)}"
        )
    if len(image_bytes) > MAX_BYTES:
        raise ValueError(f"Image too large ({len(image_bytes)} bytes). Max {MAX_BYTES} bytes.")
    if not image_bytes:
        raise ValueError("Empty image data.")

    prompt = _build_prompt(mode, language_hint, user_prompt)

    gemini = get_gemini()
    return await gemini.generate_with_image(
        prompt=prompt,
        image_bytes=image_bytes,
        mime_type=mime_type,
        temperature=0.3,
        max_tokens=1024,
    )
