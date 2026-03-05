import logging

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

GOOGLE_TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2"


async def translate_text(text: str, source: str, target: str) -> str:
    if source == target:
        return text

    api_key = get_settings().GOOGLE_TRANSLATE_API_KEY
    if not api_key:
        logger.warning("Google Translate API key not set, returning original text")
        return text

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                GOOGLE_TRANSLATE_URL,
                params={"key": api_key},
                json={
                    "q": text,
                    "source": source,
                    "target": target,
                    "format": "text",
                },
                timeout=10.0,
            )
            response.raise_for_status()
            data = response.json()
            translated = data["data"]["translations"][0]["translatedText"]
            logger.info("Translated from %s to %s", source, target)
            return translated
    except Exception as e:
        logger.error("Translation failed: %s", e)
        return text
