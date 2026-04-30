import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import ChatRequest, ChatResponse
from app.services.lang_detect import detect_language
from app.services.translation import translate_text
from app.services.llm_service import get_llm_service
from app.services import tshivenda

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["chat"])

# Community-broadened system prompt. Still useful for learners but no longer
# school-only — Gudani Bot is positioned as a multilingual community helper.
SYSTEM_PROMPT_TEMPLATE = (
    "You are Gudani Bot, a friendly multilingual South African community and "
    "learning assistant. You help with everyday questions, schoolwork, "
    "language learning, translation, understanding documents/forms, and "
    "community information.\n"
    "Audience: students AND the broader community. Adapt your register: "
    "if the user mentions being a learner or asks about schoolwork, take a "
    "tutor's voice; otherwise speak as a helpful community assistant.\n"
    "When grade information is provided, treat it as a hint that the user "
    "is a Grade {grade} learner — keep explanations age-appropriate then.\n"
    "Be honest about what you don't know. Keep replies clear and concise."
)


def _is_learning_intent(text: str) -> bool:
    """Detect 'teach me X' style intents so we can switch to teaching mode."""
    if not text:
        return False
    lowered = text.lower()
    triggers = (
        "teach me", "ndi tama u guda", "ngifuna ukufunda", "ndifuna ukufunda",
        "ke batla ho ithuta", "ndi tama ", "ndifuna ", "translate this",
        "translate to", "ndamba hani", "ngingathi kanjani", "how do you say",
    )
    return any(t in lowered for t in triggers)


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # 1. Detect language if not provided. Tshivenda heuristic runs first
    #    inside detect_language since langdetect lacks a ve profile.
    language = request.language or detect_language(request.message)
    grade = request.grade or 8

    # 2. Tshivenda gets a dedicated pipeline (no translate roundtrip).
    if language == "ve":
        return await _handle_tshivenda(request, grade)

    # 3. Other languages: detect-translate-LLM-translate-back as before,
    #    but Afrikaans is handled directly by Groq because it speaks it.
    needs_translation = language not in ("en", "af")
    user_message = request.message

    if needs_translation:
        try:
            user_message = await translate_text(request.message, language, "en")
        except Exception as e:
            logger.error("Translation to English failed: %s", e)
            user_message = request.message

    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(grade=grade)
    messages = [{"role": "system", "content": system_prompt}]

    if request.conversation_history:
        for msg in request.conversation_history:
            messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": user_message})

    try:
        llm = get_llm_service()
        llm_response = await llm.generate(messages)
    except Exception as e:
        logger.error("LLM generation failed: %s", e)
        raise HTTPException(
            status_code=503,
            detail="The AI service is temporarily unavailable. Please try again shortly.",
        )

    final_response = llm_response
    if needs_translation:
        try:
            final_response = await translate_text(llm_response, "en", language)
        except Exception as e:
            logger.error("Translation back to %s failed: %s", language, e)
            final_response = llm_response

    return ChatResponse(
        response=final_response,
        detected_language=language,
        translated=needs_translation,
    )


async def _handle_tshivenda(request: ChatRequest, grade: int) -> ChatResponse:
    """Tshivenda-specific chat path.

    Strategy:
      1. Normalize user input (fix any common malformed forms).
      2. Send DIRECTLY to Gemini (handles African languages much better than
         Groq for ve) with a Tshivenda-anchored system prompt that includes
         curated few-shot examples and explicit spelling reminders.
      3. Fall back to Groq with the same Tshivenda prompt if Gemini fails.
      4. Post-process the response through normalize_tshivenda to fix any
         residual errors (e.g., 'mbumbno' → 'Mbumbano').
    """
    user_message = tshivenda.normalize_tshivenda(request.message)
    mode = "learn" if _is_learning_intent(request.message) else "chat"
    system_prompt = tshivenda.build_system_prompt(grade=grade, mode=mode)

    messages: list[dict] = [{"role": "system", "content": system_prompt}]

    if request.conversation_history:
        for msg in request.conversation_history:
            messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": user_message})

    raw_response: str | None = None
    last_err: Exception | None = None

    for provider in ("gemini", "groq"):
        try:
            llm = get_llm_service(provider)
            raw_response = await llm.generate(messages, temperature=0.5, max_tokens=900)
            if raw_response and raw_response.strip():
                logger.info("Tshivenda response generated via %s", provider)
                break
        except Exception as e:
            last_err = e
            logger.warning("Tshivenda provider %s failed: %s", provider, e)

    if not raw_response:
        logger.error("All Tshivenda providers failed: %s", last_err)
        raise HTTPException(
            status_code=503,
            detail="Tshivenda service temporarily unavailable. Please try again shortly.",
        )

    # Post-process: apply corrections to fix any residual misspellings.
    final_response = tshivenda.normalize_tshivenda(raw_response)

    return ChatResponse(
        response=final_response,
        detected_language="ve",
        translated=False,
    )
