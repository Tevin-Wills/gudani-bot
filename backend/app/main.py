import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import HealthResponse, LanguageInfo
from app.routers import chat, quiz, faq

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

app = FastAPI(title="Gudani Bot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(quiz.router)
app.include_router(faq.router)

SUPPORTED_LANGUAGES = [
    LanguageInfo(code="en", name="English", native_name="English"),
    LanguageInfo(code="af", name="Afrikaans", native_name="Afrikaans"),
    LanguageInfo(code="zu", name="Zulu", native_name="isiZulu"),
    LanguageInfo(code="xh", name="Xhosa", native_name="isiXhosa"),
    LanguageInfo(code="st", name="Sotho", native_name="Sesotho"),
    LanguageInfo(code="tn", name="Tswana", native_name="Setswana"),
    LanguageInfo(code="nso", name="Northern Sotho", native_name="Sepedi"),
    LanguageInfo(code="ts", name="Tsonga", native_name="Xitsonga"),
    LanguageInfo(code="ve", name="Venda", native_name="Tshivenda"),
]


@app.get("/api/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok", name="Gudani Bot")


@app.get("/api/languages", response_model=list[LanguageInfo])
async def languages():
    return SUPPORTED_LANGUAGES
