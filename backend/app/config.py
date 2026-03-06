import logging
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    GROQ_API_KEY: str = ""
    GOOGLE_TRANSLATE_API_KEY: str = ""
    GEMINI_API_KEY: str = ""


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    if not settings.GROQ_API_KEY:
        logger.warning("GROQ_API_KEY is not set — chat and quiz features will not work")
    if not settings.GOOGLE_TRANSLATE_API_KEY:
        logger.warning("GOOGLE_TRANSLATE_API_KEY is not set — translations will return original text")
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not set — Gemini fallback unavailable")
    return settings
