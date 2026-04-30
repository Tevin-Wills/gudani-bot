"""Speech (STT/TTS) service layer.

DESIGN NOTE — honest about limits:

The frontend uses the browser's Web Speech API (SpeechRecognition for STT,
SpeechSynthesis for TTS). That gives us free, working voice on most modern
browsers without backend cost. It works well for English/Afrikaans and
partially for isiZulu/isiXhosa where browsers have voices installed; it is
generally NOT supported for Tshivenda, Sepedi, Xitsonga, Sesotho, Setswana.

These backend endpoints exist so:
  1. The frontend can call them as a structured fallback when the browser
     does not support an action.
  2. Future provider integrations (Whisper, Coqui, ElevenLabs, AWS Polly,
     Google Cloud TTS) can be plugged in without changing the router.

If no provider is configured, transcribe()/synthesize() return a structured
"unsupported" response that the frontend can show to the user instead of
faking output. This is intentional — we do not generate fake transcripts.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional

logger = logging.getLogger(__name__)


@dataclass
class TranscribeResult:
    text: Optional[str]
    language: Optional[str]
    provider: str
    supported: bool
    note: Optional[str] = None


@dataclass
class SynthesizeResult:
    audio_bytes: Optional[bytes]
    mime_type: Optional[str]
    provider: str
    supported: bool
    note: Optional[str] = None


# Languages that the BROWSER Web Speech API typically handles well.
# The frontend should prefer browser STT/TTS for these.
BROWSER_FRIENDLY = {"en", "af", "zu", "xh"}

# Languages with no robust free voice provider today. We surface this so the
# UI can warn the user honestly.
LIMITED_VOICE_SUPPORT = {"ve", "nso", "ts", "st", "tn"}


async def transcribe(
    audio_bytes: bytes,
    mime_type: str,
    language: Optional[str] = None,
) -> TranscribeResult:
    """Server-side STT.

    Currently a stub: no provider wired up. We return supported=False so the
    frontend can fall back gracefully. To wire up Whisper or another provider,
    implement here and return a real text/language. The router contract does
    not change.
    """
    logger.info(
        "STT requested for lang=%s, %d bytes, mime=%s — no backend provider configured",
        language, len(audio_bytes), mime_type,
    )
    return TranscribeResult(
        text=None,
        language=language,
        provider="none",
        supported=False,
        note=(
            "Server-side speech-to-text is not configured. The browser's "
            "built-in voice recognition is used by the web app for "
            "supported languages. Tshivenda and other low-resource South "
            "African languages have limited voice support; type the message "
            "instead."
        ),
    )


async def synthesize(
    text: str,
    language: Optional[str] = None,
) -> SynthesizeResult:
    """Server-side TTS.

    Same posture as transcribe(): stub returns supported=False so the
    frontend uses browser SpeechSynthesis for supported languages and
    surfaces a clear message otherwise.
    """
    logger.info(
        "TTS requested for lang=%s, %d chars — no backend provider configured",
        language, len(text),
    )
    note = "Server-side text-to-speech is not configured."
    if language in LIMITED_VOICE_SUPPORT:
        note += (
            f" The language '{language}' has limited free TTS support. "
            "The web app will only speak languages your browser/device has "
            "voices for."
        )
    return SynthesizeResult(
        audio_bytes=None,
        mime_type=None,
        provider="none",
        supported=False,
        note=note,
    )
