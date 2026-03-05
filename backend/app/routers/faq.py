import json
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.models.schemas import FAQRequest, FAQResponse
from app.services.lang_detect import detect_language
from app.services.translation import translate_text
from app.services.llm_service import get_llm_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["faq"])

FAQ_PATH = Path(__file__).resolve().parent.parent / "data" / "faq_data.json"


def _load_faqs() -> list[dict]:
    with open(FAQ_PATH, encoding="utf-8") as f:
        return json.load(f)


def _search_faqs(question: str, faqs: list[dict]) -> dict | None:
    question_lower = question.lower()
    best_match = None
    best_score = 0

    for faq in faqs:
        score = sum(1 for kw in faq["keywords"] if kw in question_lower)
        if score > best_score:
            best_score = score
            best_match = faq

    return best_match if best_score > 0 else None


@router.post("/faq", response_model=FAQResponse)
async def faq(request: FAQRequest):
    language = request.language or detect_language(request.question)

    # Translate question to English for searching
    search_query = request.question
    needs_translation = language not in ("en", "af")
    if needs_translation:
        try:
            search_query = await translate_text(request.question, language, "en")
        except Exception as e:
            logger.warning("FAQ question translation failed: %s", e)

    # Search FAQ data
    faqs = _load_faqs()
    match = _search_faqs(search_query, faqs)

    if match:
        answer = match["answer"]
        source = "faq"
    else:
        # Fallback to LLM
        try:
            llm = get_llm_service()
            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are Gudani Bot, a South African school assistant. "
                        "Answer the following question about South African school education. "
                        "Keep your answer concise and helpful."
                    ),
                },
                {"role": "user", "content": search_query},
            ]
            answer = await llm.generate(messages)
            source = "llm"
        except Exception as e:
            logger.error("FAQ LLM fallback failed: %s", e)
            raise HTTPException(
                status_code=503,
                detail="Unable to answer your question right now. Please try again.",
            )

    # Translate answer back if needed
    if needs_translation:
        try:
            answer = await translate_text(answer, "en", language)
        except Exception as e:
            logger.warning("FAQ answer translation failed: %s", e)

    return FAQResponse(
        answer=answer,
        source=source,
        detected_language=language,
    )
