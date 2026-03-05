import json
import uuid
import logging

from app.services.llm_service import get_llm_service
from app.models.schemas import QuizQuestion

logger = logging.getLogger(__name__)


async def generate_quiz(subject: str, grade: int, num_questions: int = 5) -> tuple[str, list[QuizQuestion]]:
    llm = get_llm_service()

    prompt = (
        f"Generate exactly {num_questions} multiple-choice quiz questions for a Grade {grade} "
        f"learner on the subject: {subject}. This is for a South African school curriculum (CAPS).\n\n"
        f"Return ONLY a JSON array where each element has:\n"
        f'- "question": the question text\n'
        f'- "options": array of 4 options (A, B, C, D)\n'
        f'- "correct_answer": the correct option text\n\n'
        f"No extra text, just the JSON array."
    )

    messages = [
        {"role": "system", "content": "You are a South African school education quiz generator. Return only valid JSON."},
        {"role": "user", "content": prompt},
    ]

    response = await llm.generate(messages, temperature=0.8, max_tokens=2048)

    # Parse JSON from LLM response
    try:
        # Strip markdown code fences if present
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        raw_questions = json.loads(cleaned)
    except json.JSONDecodeError:
        logger.error("Failed to parse quiz JSON: %s", response[:200])
        raise ValueError("Failed to generate valid quiz questions")

    quiz_id = str(uuid.uuid4())
    questions = [
        QuizQuestion(
            question=q["question"],
            options=q.get("options"),
            question_number=i + 1,
        )
        for i, q in enumerate(raw_questions)
    ]

    return quiz_id, questions


async def evaluate_answer(question: str, student_answer: str, correct_answer: str) -> tuple[bool, str]:
    llm = get_llm_service()

    messages = [
        {
            "role": "system",
            "content": (
                "You are a friendly South African school teacher evaluating a student's answer. "
                "Be encouraging and educational in your feedback."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Question: {question}\n"
                f"Correct answer: {correct_answer}\n"
                f"Student's answer: {student_answer}\n\n"
                f"Is the student's answer correct or essentially correct? "
                f"Reply with a JSON object: {{\"is_correct\": true/false, \"feedback\": \"your feedback\"}}"
            ),
        },
    ]

    response = await llm.generate(messages, temperature=0.3, max_tokens=512)

    try:
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        result = json.loads(cleaned)
        return result["is_correct"], result["feedback"]
    except (json.JSONDecodeError, KeyError):
        logger.error("Failed to parse evaluation JSON: %s", response[:200])
        is_correct = student_answer.strip().lower() == correct_answer.strip().lower()
        feedback = "Correct! Well done!" if is_correct else f"Not quite. The correct answer is: {correct_answer}"
        return is_correct, feedback
