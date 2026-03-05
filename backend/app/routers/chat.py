import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import ChatRequest, ChatResponse
from app.services.lang_detect import detect_language
from app.services.translation import translate_text
from app.services.llm_service import get_llm_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["chat"])

SYSTEM_PROMPT_TEMPLATE = (
    "You are Gudani Bot, a friendly and helpful multilingual South African school assistant. "
    "You help learners with their schoolwork and answer questions about South African education. "
    "You are currently assisting a Grade {grade} learner. "
    "Keep your answers clear, age-appropriate, and encouraging. "
    "If you don't know something, say so honestly."
)


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # 1. Detect language if not provided
    language = request.language or detect_language(request.message)
    grade = request.grade or 8

    # 2. Determine if translation is needed
    needs_translation = language not in ("en", "af")
    user_message = request.message

    # 3. Translate to English if needed
    if needs_translation:
        try:
            user_message = await translate_text(request.message, language, "en")
        except Exception as e:
            logger.error("Translation to English failed: %s", e)
            user_message = request.message

    # 4. Build messages for LLM
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(grade=grade)
    messages = [{"role": "system", "content": system_prompt}]

    if request.conversation_history:
        for msg in request.conversation_history:
            messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": user_message})

    # 5. Call LLM
    try:
        llm = get_llm_service()
        llm_response = await llm.generate(messages)
    except Exception as e:
        logger.error("LLM generation failed: %s", e)
        raise HTTPException(
            status_code=503,
            detail="The AI service is temporarily unavailable. Please try again shortly.",
        )

    # 6. Translate response back if needed
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
