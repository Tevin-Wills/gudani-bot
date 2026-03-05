from pydantic import BaseModel


# --- Shared ---

class ConversationMessage(BaseModel):
    role: str
    content: str


# --- Requests ---

class ChatRequest(BaseModel):
    message: str
    language: str | None = None
    grade: int | None = 8
    conversation_history: list[ConversationMessage] | None = None


class QuizStartRequest(BaseModel):
    subject: str
    grade: int
    language: str | None = None
    num_questions: int = 5


class QuizAnswerRequest(BaseModel):
    question: str
    student_answer: str
    correct_answer: str
    language: str | None = None


class FAQRequest(BaseModel):
    question: str
    language: str | None = None


# --- Responses ---

class ChatResponse(BaseModel):
    response: str
    detected_language: str
    translated: bool


class QuizQuestion(BaseModel):
    question: str
    options: list[str] | None = None
    question_number: int


class QuizStartResponse(BaseModel):
    quiz_id: str
    questions: list[QuizQuestion]


class QuizAnswerResponse(BaseModel):
    is_correct: bool
    feedback: str
    correct_answer: str


class FAQResponse(BaseModel):
    answer: str
    source: str
    detected_language: str


class HealthResponse(BaseModel):
    status: str
    name: str


class LanguageInfo(BaseModel):
    code: str
    name: str
    native_name: str
