import json
import uuid
import logging

from app.services.llm_service import get_llm_service
from app.services.translation import translate_text
from app.models.schemas import QuizQuestion

logger = logging.getLogger(__name__)

# In-memory quiz store: quiz_id -> { language, subject, questions: [{id, type, question, options, correct_answer}], answers: {question_id: {answer, correct}} }
quiz_store: dict[str, dict] = {}

MAX_JSON_RETRIES = 2


def _parse_json_response(response: str) -> list | dict:
    """Parse JSON from LLM response, stripping markdown fences if present."""
    cleaned = response.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[1]
        cleaned = cleaned.rsplit("```", 1)[0].strip()
    return json.loads(cleaned)


async def generate_quiz(
    subject: str,
    grade: int,
    num_questions: int = 5,
    topic: str | None = None,
    language: str | None = None,
) -> tuple[str, list[QuizQuestion]]:
    llm = get_llm_service()

    topic_clause = f" on the topic of {topic}" if topic else ""
    prompt = (
        f"Generate {num_questions} quiz questions for Grade {grade} {subject}{topic_clause}. "
        f"Mix question types: multiple choice (4 options), true/false, and fill in the blank.\n"
        f"Return ONLY a JSON array with this exact structure for each question:\n"
        f'{{"id": 1, "type": "mcq", "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correct_answer": "A"}}\n'
        f'For true_false: options should be ["True", "False"] and correct_answer is "True" or "False"\n'
        f'For fill_blank: options should be empty array, correct_answer is the word/phrase\n'
        f"Make questions appropriate for South African curriculum (CAPS). Use South African examples where possible."
    )

    messages = [
        {"role": "system", "content": "You are a South African school education quiz generator. Return only valid JSON."},
        {"role": "user", "content": prompt},
    ]

    # Retry logic for JSON parsing
    raw_questions = None
    last_error = None
    for attempt in range(MAX_JSON_RETRIES + 1):
        try:
            response = await llm.generate(messages, temperature=0.8, max_tokens=2048)
            raw_questions = _parse_json_response(response)
            break
        except json.JSONDecodeError as e:
            last_error = e
            logger.warning("JSON parse attempt %d failed: %s", attempt + 1, e)
            if attempt < MAX_JSON_RETRIES:
                messages.append({"role": "assistant", "content": response})
                messages.append({"role": "user", "content": "That was not valid JSON. Please return ONLY a valid JSON array, no other text."})

    if raw_questions is None:
        logger.error("Failed to parse quiz JSON after %d attempts: %s", MAX_JSON_RETRIES + 1, last_error)
        raise ValueError("Failed to generate valid quiz questions. Please try again.")

    # Normalize questions
    questions = []
    for i, q in enumerate(raw_questions):
        qtype = q.get("type", "mcq")
        if qtype not in ("mcq", "true_false", "fill_blank"):
            qtype = "mcq"
        questions.append(
            QuizQuestion(
                id=i + 1,
                type=qtype,
                question=q["question"],
                options=q.get("options") or [],
                correct_answer=str(q.get("correct_answer", "")),
            )
        )

    quiz_id = str(uuid.uuid4())
    lang = language or "en"

    # Translate questions if needed
    if lang not in ("en", "af"):
        for q in questions:
            try:
                q.question = await translate_text(q.question, "en", lang)
                if q.options:
                    q.options = [await translate_text(opt, "en", lang) for opt in q.options]
            except Exception as e:
                logger.warning("Quiz question translation failed: %s", e)

    # Store quiz for answer checking
    quiz_store[quiz_id] = {
        "language": lang,
        "subject": subject,
        "topic": topic,
        "grade": grade,
        "questions": [q.model_dump() for q in questions],
        "raw_questions": raw_questions,
        "answers": {},
    }

    return quiz_id, questions


async def check_answer(quiz_id: str, question_id: int, answer: str) -> tuple[bool, str, str]:
    """Check an answer and return (correct, correct_answer, explanation)."""
    if quiz_id not in quiz_store:
        raise KeyError(f"Quiz not found: {quiz_id}")

    quiz = quiz_store[quiz_id]
    raw_questions = quiz["raw_questions"]
    language = quiz["language"]

    # Find the question
    question_data = None
    for q in raw_questions:
        if q.get("id") == question_id:
            question_data = q
            break
    if question_data is None:
        # Fall back to index
        idx = question_id - 1
        if 0 <= idx < len(raw_questions):
            question_data = raw_questions[idx]
        else:
            raise KeyError(f"Question {question_id} not found in quiz {quiz_id}")

    correct_answer = str(question_data.get("correct_answer", ""))
    student_answer = answer.strip()

    # Normalize for comparison
    is_correct = student_answer.lower() == correct_answer.lower()
    # For MCQ, also check if they gave the option letter
    if not is_correct and question_data.get("type") == "mcq":
        # Check if student gave just the letter (A, B, C, D) matching correct_answer
        if len(student_answer) == 1 and student_answer.upper() == correct_answer.upper():
            is_correct = True
        # Check if correct_answer is a letter and student gave the full option text
        if len(correct_answer) == 1:
            for opt in question_data.get("options", []):
                if opt.startswith(f"{correct_answer.upper()})") and student_answer.lower() in opt.lower():
                    is_correct = True
                    break

    # Store the answer
    quiz["answers"][question_id] = {"answer": student_answer, "correct": is_correct}

    # Generate explanation via LLM
    llm = get_llm_service()
    messages = [
        {
            "role": "system",
            "content": (
                "You are a friendly South African school teacher. Give a brief, encouraging explanation "
                "of why the answer is correct or incorrect. 2-3 sentences maximum."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Question: {question_data['question']}\n"
                f"Correct answer: {correct_answer}\n"
                f"Student's answer: {student_answer}\n"
                f"Was correct: {is_correct}\n\n"
                f"Give a brief explanation."
            ),
        },
    ]

    try:
        explanation = await llm.generate(messages, temperature=0.3, max_tokens=256)
    except Exception as e:
        logger.error("Explanation generation failed: %s", e)
        explanation = "Well done!" if is_correct else f"The correct answer is: {correct_answer}"

    # Translate explanation if needed
    if language not in ("en", "af"):
        try:
            explanation = await translate_text(explanation, "en", language)
        except Exception as e:
            logger.warning("Explanation translation failed: %s", e)

    return is_correct, correct_answer, explanation


def get_quiz_summary(quiz_id: str) -> dict:
    """Generate a summary of quiz results."""
    if quiz_id not in quiz_store:
        raise KeyError(f"Quiz not found: {quiz_id}")

    quiz = quiz_store[quiz_id]
    answers = quiz["answers"]
    raw_questions = quiz["raw_questions"]
    total = len(raw_questions)
    correct_count = sum(1 for a in answers.values() if a["correct"])
    score_percent = round((correct_count / total * 100) if total > 0 else 0, 1)

    # Find weak areas - questions answered incorrectly
    weak_areas = []
    for q in raw_questions:
        qid = q.get("id", 0)
        if qid in answers and not answers[qid]["correct"]:
            # Extract topic hint from the question
            weak_areas.append(q["question"][:80])

    if score_percent >= 80:
        recommendation = "Excellent work! You have a strong understanding of this material. Try a harder topic next!"
    elif score_percent >= 60:
        recommendation = "Good effort! Review the questions you got wrong and try again to improve your score."
    elif score_percent >= 40:
        recommendation = "Keep practising! Focus on the weak areas listed above and ask Gudani Bot to explain those topics."
    else:
        recommendation = "Don't worry, learning takes time! Ask Gudani Bot to help you understand the basics of this subject before trying again."

    return {
        "total": total,
        "correct": correct_count,
        "score_percent": score_percent,
        "weak_areas": weak_areas,
        "recommendation": recommendation,
    }
