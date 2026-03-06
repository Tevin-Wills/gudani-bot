import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import AnnounceRequest, AnnounceResponse
from app.services.llm_service import get_llm_service
from app.services.translation import translate_text

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["announcements"])

ALL_LANGUAGES = ["en", "af", "zu", "xh", "st", "tn", "nso", "ts", "ve"]


@router.post("/announce", response_model=AnnounceResponse)
async def generate_announcement(request: AnnounceRequest):
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=422, detail="Message cannot be empty")

    source_lang = request.source_language

    # If source is not English, translate to English first for polishing
    english_message = message
    if source_lang != "en":
        try:
            english_message = await translate_text(message, source_lang, "en")
        except Exception as e:
            logger.warning("Source translation failed: %s", e)
            english_message = message

    # Polish with LLM if formal tone
    if request.tone == "formal":
        try:
            llm = get_llm_service()
            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are a professional school administrator writing official announcements "
                        "for Gudani Demo School in South Africa. Rewrite the following message in a "
                        "formal, professional tone suitable for parents and learners. Keep it concise "
                        "and clear. Return ONLY the rewritten message, no extra commentary."
                    ),
                },
                {"role": "user", "content": english_message},
            ]
            english_message = await llm.generate(messages, temperature=0.3, max_tokens=512)
        except Exception as e:
            logger.warning("LLM polishing failed, using original: %s", e)

    # Translate to all 9 languages
    translations = {}
    for lang in ALL_LANGUAGES:
        if lang == "en":
            translations["en"] = english_message
        else:
            try:
                translations[lang] = await translate_text(english_message, "en", lang)
            except Exception as e:
                logger.warning("Translation to %s failed: %s", lang, e)
                translations[lang] = english_message

    return AnnounceResponse(translations=translations)
