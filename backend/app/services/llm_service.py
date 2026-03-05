import logging
from abc import ABC, abstractmethod

import httpx

from app.config import get_settings
from app.services.cache import cache

logger = logging.getLogger(__name__)


class LLMService(ABC):
    @abstractmethod
    async def generate(
        self,
        messages: list[dict],
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str: ...


class GroqService(LLMService):
    API_URL = "https://api.groq.com/openai/v1/chat/completions"
    DEFAULT_MODEL = "llama-3.3-70b-versatile"

    async def generate(
        self,
        messages: list[dict],
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str:
        model = model or self.DEFAULT_MODEL
        api_key = get_settings().GROQ_API_KEY
        if not api_key:
            raise RuntimeError("GROQ_API_KEY is not set")

        # Check cache
        cache_key = f"groq:{hash(str(messages))}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.API_URL,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model,
                        "messages": messages,
                        "temperature": temperature,
                        "max_tokens": max_tokens,
                    },
                    timeout=30.0,
                )
                response.raise_for_status()
                data = response.json()
                result = data["choices"][0]["message"]["content"]
                cache.set(cache_key, result)
                return result
        except httpx.HTTPStatusError as e:
            logger.error("Groq API HTTP error: %s - %s", e.response.status_code, e.response.text)
            raise
        except Exception as e:
            logger.error("Groq API error: %s", e)
            raise


class GeminiService(LLMService):
    async def generate(
        self,
        messages: list[dict],
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str:
        raise NotImplementedError("GeminiService is not yet implemented")


_instances: dict[str, LLMService] = {}


def get_llm_service(provider: str = "groq") -> LLMService:
    if provider not in _instances:
        if provider == "groq":
            _instances[provider] = GroqService()
        elif provider == "gemini":
            _instances[provider] = GeminiService()
        else:
            raise ValueError(f"Unknown LLM provider: {provider}")
    return _instances[provider]
