"""Language-learning endpoints.

Tshivenda is the priority language with curated content; other South
African languages fall back to LLM-only output and are documented as
"best effort" in the README.

Endpoints:
  GET  /api/learn/phrase-of-the-day      curated Tshivenda phrase
  GET  /api/learn/vocabulary             curated Tshivenda vocab by category
  GET  /api/learn/lessons                curated Tshivenda lessons list
  GET  /api/learn/lessons/{lesson_id}    single curated lesson
  POST /api/learn/translate              user text → target language (LLM)
  POST /api/learn/explain                explain a word/phrase (LLM)
  POST /api/learn/practice               generate a tiny vocab quiz (LLM)
"""

from __future__ import annotations

import json
import logging
import random
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.llm_service import get_llm_service, get_gemini
from app.services import tshivenda

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/learn", tags=["learn"])

LESSONS_PATH = Path(__file__).resolve().parent.parent / "data" / "tshivenda_lessons.json"


def _load_lessons() -> dict:
    with open(LESSONS_PATH, encoding="utf-8") as f:
        return json.load(f)


@router.get("/phrase-of-the-day")
async def phrase_of_the_day():
    """Deterministic per-day phrase pick so refreshing doesn't shuffle it."""
    data = _load_lessons()
    pool = data.get("phrase_of_the_day", [])
    if not pool:
        raise HTTPException(status_code=404, detail="No phrases available")
    day = datetime.now(timezone.utc).date().toordinal()
    pick = pool[day % len(pool)]
    return {"language": "ve", **pick}


@router.get("/vocabulary")
async def vocabulary(category: str | None = None):
    data = _load_lessons()
    vocab = data.get("vocabulary", {})
    if category:
        if category not in vocab:
            raise HTTPException(status_code=404, detail=f"Unknown category: {category}")
        return {"category": category, "items": vocab[category]}
    return {"language": "ve", "categories": vocab}


@router.get("/lessons")
async def list_lessons():
    data = _load_lessons()
    lessons = data.get("lessons", [])
    return [
        {"id": l["id"], "title": l["title"], "level": l["level"], "summary": l["summary"]}
        for l in lessons
    ]


@router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str):
    data = _load_lessons()
    for l in data.get("lessons", []):
        if l["id"] == lesson_id:
            return l
    raise HTTPException(status_code=404, detail="Lesson not found")


# --- LLM-backed endpoints ---


class TranslateRequest(BaseModel):
    text: str
    source: str = "en"
    target: str  # 've', 'zu', etc.


@router.post("/translate")
async def translate(request: TranslateRequest):
    """Translate (with explanation) using the language-aware LLM."""
    if not request.text.strip():
        raise HTTPException(status_code=422, detail="text cannot be empty")

    if request.target == "ve":
        # Use the Tshivenda-anchored prompt for higher quality output.
        system = tshivenda.build_system_prompt(mode="learn")
        user = (
            f"Translate the following from {request.source} to Tshivenda. "
            f"Give the Tshivenda translation, then a one-line literal English gloss "
            f"in parentheses, then a brief usage note if helpful.\n\nText: {request.text}"
        )
        provider = "gemini"
    else:
        system = (
            "You are a careful South African language tutor. Translate the "
            "user's text into the requested language. Then on a new line, "
            "give a literal English gloss. Be honest if you are uncertain."
        )
        user = f"Translate from {request.source} to {request.target}: {request.text}"
        provider = "groq"

    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]
    try:
        llm = get_llm_service(provider)
        out = await llm.generate(messages, temperature=0.3, max_tokens=512)
    except Exception as e:
        logger.error("Translate generate failed (%s): %s", provider, e)
        raise HTTPException(status_code=503, detail="Translation service unavailable")

    if request.target == "ve":
        out = tshivenda.normalize_tshivenda(out)

    return {"translation": out, "source": request.source, "target": request.target}


class ExplainRequest(BaseModel):
    text: str
    language: str  # the language of `text`
    explain_in: str = "en"  # language to explain in


@router.post("/explain")
async def explain(request: ExplainRequest):
    if not request.text.strip():
        raise HTTPException(status_code=422, detail="text cannot be empty")

    if request.language == "ve":
        system = tshivenda.build_system_prompt(mode="learn")
        user = (
            f"Explain the meaning, usage, and any cultural context of this "
            f"Tshivenda word/phrase to a beginner. Reply in {request.explain_in}. "
            f"If unsure of any part, say so honestly.\n\nWord/phrase: {request.text}"
        )
        provider = "gemini"
    else:
        system = (
            "You are a friendly South African language teacher. Explain the "
            "meaning, usage, and (if relevant) cultural context of the given "
            "word/phrase clearly to a learner."
        )
        user = (
            f"The {request.language} word/phrase is: {request.text}\n"
            f"Explain it in {request.explain_in}."
        )
        provider = "groq"

    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]
    try:
        llm = get_llm_service(provider)
        out = await llm.generate(messages, temperature=0.4, max_tokens=512)
    except Exception as e:
        logger.error("Explain generate failed (%s): %s", provider, e)
        raise HTTPException(status_code=503, detail="Explain service unavailable")

    if request.explain_in == "ve":
        out = tshivenda.normalize_tshivenda(out)

    return {"explanation": out, "language": request.language, "explain_in": request.explain_in}


class PracticeRequest(BaseModel):
    language: str = "ve"
    category: str | None = None  # e.g. 'greetings'
    count: int = 4


@router.post("/practice")
async def practice(request: PracticeRequest):
    """Generate a small flashcard-style practice set.

    For Tshivenda, we draw from the curated vocab (no LLM needed → fast,
    accurate). For other languages we ask the LLM to suggest pairs but
    flag them as machine-generated.
    """
    if request.language == "ve":
        data = _load_lessons()
        vocab_categories = data.get("vocabulary", {})
        if request.category and request.category in vocab_categories:
            pool = vocab_categories[request.category]
        else:
            pool = [item for items in vocab_categories.values() for item in items]
        if not pool:
            raise HTTPException(status_code=404, detail="No vocabulary available")
        n = max(1, min(request.count, 10))
        sample = random.sample(pool, k=min(n, len(pool)))
        return {"language": "ve", "source": "curated", "items": sample}

    # Fallback for non-Tshivenda languages.
    n = max(1, min(request.count, 10))
    cat_clause = f" in the category '{request.category}'" if request.category else ""
    user = (
        f"Give {n} useful beginner vocabulary entries for {request.language}{cat_clause}. "
        f"Return ONLY a JSON array. Each entry must be: "
        f'{{"native": "<word in {request.language}>", "en": "<English meaning>"}}. '
        f"No commentary."
    )
    try:
        llm = get_llm_service("groq")
        raw = await llm.generate(
            [{"role": "user", "content": user}],
            temperature=0.5,
            max_tokens=512,
        )
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        items = json.loads(cleaned)
    except Exception as e:
        logger.error("Practice generation failed: %s", e)
        raise HTTPException(status_code=503, detail="Practice service unavailable")

    # Normalize to {ve, en} shape used by frontend.
    normalized = [
        {"ve": it.get("native", ""), "en": it.get("en", "")}
        for it in items
        if isinstance(it, dict)
    ]
    return {"language": request.language, "source": "llm", "items": normalized}
