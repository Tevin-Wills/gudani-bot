import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    QuizStartRequest,
    QuizStartResponse,
    QuizAnswerRequest,
    QuizAnswerResponse,
)
from app.services.lang_detect import detect_language
from app.services.translation import translate_text
from app.services.quiz_engine import generate_quiz, evaluate_answer

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


@router.post("/start", response_model=QuizStartResponse)
async def start_quiz(request: QuizStartRequest):
    try:
        quiz_id, questions = await generate_quiz(
            subject=request.subject,
            grade=request.grade,
            num_questions=request.num_questions,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error("Quiz generation failed: %s", e)
        raise HTTPException(
            status_code=503,
            detail="Failed to generate quiz. Please try again.",
        )

    # Translate questions if needed
    language = request.language
    if language and language not in ("en", "af"):
        for q in questions:
            try:
                q.question = await translate_text(q.question, "en", language)
                if q.options:
                    q.options = [
                        await translate_text(opt, "en", language) for opt in q.options
                    ]
            except Exception as e:
                logger.warning("Quiz question translation failed: %s", e)

    return QuizStartResponse(quiz_id=quiz_id, questions=questions)


@router.post("/answer", response_model=QuizAnswerResponse)
async def answer_question(request: QuizAnswerRequest):
    language = request.language

    # Translate student answer to English if needed
    student_answer = request.student_answer
    if language and language not in ("en", "af"):
        try:
            student_answer = await translate_text(student_answer, language, "en")
        except Exception as e:
            logger.warning("Answer translation failed: %s", e)

    try:
        is_correct, feedback = await evaluate_answer(
            question=request.question,
            student_answer=student_answer,
            correct_answer=request.correct_answer,
        )
    except Exception as e:
        logger.error("Answer evaluation failed: %s", e)
        raise HTTPException(
            status_code=503,
            detail="Failed to evaluate answer. Please try again.",
        )

    # Translate feedback back if needed
    if language and language not in ("en", "af"):
        try:
            feedback = await translate_text(feedback, "en", language)
        except Exception as e:
            logger.warning("Feedback translation failed: %s", e)

    return QuizAnswerResponse(
        is_correct=is_correct,
        feedback=feedback,
        correct_answer=request.correct_answer,
    )
