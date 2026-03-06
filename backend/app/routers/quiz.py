import json
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    QuizStartRequest,
    QuizStartResponse,
    QuizAnswerRequest,
    QuizAnswerResponse,
    QuizSummaryRequest,
    QuizSummaryResponse,
)
from app.services.quiz_engine import generate_quiz, check_answer, get_quiz_summary

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

SUBJECTS_PATH = Path(__file__).resolve().parent.parent / "data" / "subjects.json"


@router.get("/subjects")
async def get_subjects():
    with open(SUBJECTS_PATH, encoding="utf-8") as f:
        return json.load(f)


@router.post("/start", response_model=QuizStartResponse)
async def start_quiz(request: QuizStartRequest):
    try:
        quiz_id, questions = await generate_quiz(
            subject=request.subject,
            grade=request.grade,
            num_questions=request.num_questions,
            topic=request.topic,
            language=request.language,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error("Quiz generation failed: %s", e)
        raise HTTPException(
            status_code=503,
            detail="Failed to generate quiz. Please try again.",
        )

    return QuizStartResponse(quiz_id=quiz_id, questions=questions)


@router.post("/answer", response_model=QuizAnswerResponse)
async def answer_question(request: QuizAnswerRequest):
    try:
        is_correct, correct_answer, explanation = await check_answer(
            quiz_id=request.quiz_id,
            question_id=request.question_id,
            answer=request.answer,
        )
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error("Answer evaluation failed: %s", e)
        raise HTTPException(
            status_code=503,
            detail="Failed to evaluate answer. Please try again.",
        )

    return QuizAnswerResponse(
        correct=is_correct,
        correct_answer=correct_answer,
        explanation=explanation,
    )


@router.post("/summary", response_model=QuizSummaryResponse)
async def quiz_summary(request: QuizSummaryRequest):
    try:
        summary = get_quiz_summary(quiz_id=request.quiz_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return QuizSummaryResponse(**summary)
