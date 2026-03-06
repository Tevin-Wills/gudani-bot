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
    topic: str | None = None
    grade: int
    language: str | None = None
    num_questions: int = 5


class QuizAnswerRequest(BaseModel):
    quiz_id: str
    question_id: int
    answer: str


class QuizSummaryRequest(BaseModel):
    quiz_id: str


class FAQRequest(BaseModel):
    question: str
    language: str | None = None
    category: str | None = None


class AnnounceRequest(BaseModel):
    message: str
    tone: str = "formal"
    source_language: str = "en"


# --- Responses ---

class ChatResponse(BaseModel):
    response: str
    detected_language: str
    translated: bool


class QuizQuestion(BaseModel):
    id: int
    type: str
    question: str
    options: list[str]
    correct_answer: str


class QuizStartResponse(BaseModel):
    quiz_id: str
    questions: list[QuizQuestion]


class QuizAnswerResponse(BaseModel):
    correct: bool
    correct_answer: str
    explanation: str


class QuizSummaryResponse(BaseModel):
    total: int
    correct: int
    score_percent: float
    weak_areas: list[str]
    recommendation: str


class FAQResponse(BaseModel):
    answer: str
    source: str
    detected_language: str


class AnnounceResponse(BaseModel):
    translations: dict[str, str]


class HealthResponse(BaseModel):
    status: str
    name: str


class LanguageInfo(BaseModel):
    code: str
    name: str
    native_name: str
