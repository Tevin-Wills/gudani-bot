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


def _load_faq_data() -> dict:
    with open(FAQ_PATH, encoding="utf-8") as f:
        return json.load(f)


def _get_all_items(faq_data: dict, category: str | None = None) -> list[dict]:
    """Flatten all FAQ items, optionally filtered by category."""
    items = []
    categories = faq_data.get("categories", {})
    for cat_key, cat_val in categories.items():
        if category and cat_key != category:
            continue
        for item in cat_val.get("items", []):
            items.append({**item, "category": cat_key})
    return items


def _search_faqs(question: str, items: list[dict]) -> dict | None:
    """Simple keyword matching to find the best FAQ match."""
    question_lower = question.lower()
    best_match = None
    best_score = 0

    # Keywords extracted from question words
    keywords_map = {
        "fees": ["fee", "fees", "cost", "pay", "payment", "price", "money", "afford", "much", "rand", "r15"],
        "term_dates": ["term", "start", "end", "holiday", "break", "calendar", "date", "when", "hours", "time", "open", "close"],
        "admissions": ["enroll", "enrol", "register", "admission", "apply", "application", "document", "space", "available"],
        "uniform": ["uniform", "dress", "wear", "clothes", "blazer", "shirt", "skirt", "trousers", "buy"],
        "transport": ["transport", "bus", "drop", "pickup", "pick-up", "ride", "gate", "route"],
        "contacts": ["contact", "phone", "email", "address", "principal", "office", "call", "number"],
        "financial": ["nsfas", "bursary", "exemption", "financial", "assistance", "aid"],
    }

    # Common stop words to ignore
    stop_words = {"the", "a", "an", "is", "are", "do", "does", "i", "my", "to", "for", "of", "in", "at", "and", "or", "what", "how", "there", "have"}

    for item in items:
        score = 0
        q_lower = item["q"].lower()

        # Direct question word overlap (excluding stop words)
        q_words = set(question_lower.split()) - stop_words
        faq_words = set(q_lower.split()) - stop_words
        overlap = q_words & faq_words
        score += len(overlap) * 2

        # Keyword category matching
        for kw_list in keywords_map.values():
            matching = [kw for kw in kw_list if kw in question_lower]
            if matching:
                for kw in matching:
                    if kw in q_lower:
                        score += 3

        if score > best_score:
            best_score = score
            best_match = item

    return best_match if best_score >= 4 else None


@router.get("/faq/categories")
async def get_categories():
    faq_data = _load_faq_data()
    categories = []
    for key, val in faq_data.get("categories", {}).items():
        categories.append({
            "id": key,
            "description": val.get("description", ""),
            "questions": [item["q"] for item in val.get("items", [])],
        })
    return categories


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

    # Load and search FAQ data
    faq_data = _load_faq_data()
    items = _get_all_items(faq_data, category=request.category)
    match = _search_faqs(search_query, items)

    if match:
        answer = match["a"]
        source = "faq"
    else:
        # LLM fallback with FAQ context
        try:
            llm = get_llm_service()
            # Build context from all FAQ data
            context_lines = [f"School: {faq_data.get('school_name', 'Gudani Demo School')}"]
            all_items = _get_all_items(faq_data)
            for item in all_items:
                context_lines.append(f"Q: {item['q']}\nA: {item['a']}")
            faq_context = "\n\n".join(context_lines)

            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are Gudani Bot, a South African school assistant for Gudani Demo School. "
                        "Answer questions using ONLY the school information provided below. "
                        "If the information is not available, say: "
                        "'I don't have information about that. Please contact the school office at 015-xxx-xxxx.'\n\n"
                        f"SCHOOL INFORMATION:\n{faq_context}"
                    ),
                },
                {"role": "user", "content": search_query},
            ]
            answer = await llm.generate(messages, max_tokens=512)
            source = "llm"
        except Exception as e:
            logger.error("FAQ LLM fallback failed: %s", e)
            answer = "I don't have information about that. Please contact the school office at 015-xxx-xxxx."
            source = "fallback"

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
