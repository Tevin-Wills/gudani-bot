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
    """Google Gemini service.

    Used as the African-language-aware backend for Tshivenda chat and as the
    vision provider for image understanding. The free tier on Gemini 1.5
    Flash is generous enough for student/community use.
    """

    BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"
    DEFAULT_MODEL = "gemini-2.0-flash"

    async def generate(
        self,
        messages: list[dict],
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str:
        model = model or self.DEFAULT_MODEL
        api_key = get_settings().GEMINI_API_KEY
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set")

        # Convert OpenAI-style messages to Gemini contents.
        # System prompt becomes systemInstruction; everything else becomes
        # alternating user/model parts.
        system_text = None
        contents: list[dict] = []
        for m in messages:
            role = m.get("role")
            content = m.get("content", "")
            if role == "system":
                system_text = (system_text + "\n\n" + content) if system_text else content
            elif role == "user":
                contents.append({"role": "user", "parts": [{"text": content}]})
            elif role == "assistant":
                contents.append({"role": "model", "parts": [{"text": content}]})

        cache_key = f"gemini:{model}:{hash(str(messages))}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        url = f"{self.BASE_URL}/{model}:generateContent?key={api_key}"
        body: dict = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            },
        }
        if system_text:
            body["systemInstruction"] = {"parts": [{"text": system_text}]}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=body, timeout=45.0)
                response.raise_for_status()
                data = response.json()
                candidates = data.get("candidates", [])
                if not candidates:
                    raise RuntimeError("Gemini returned no candidates")
                parts = candidates[0].get("content", {}).get("parts", [])
                result = "".join(p.get("text", "") for p in parts).strip()
                if not result:
                    raise RuntimeError("Gemini returned empty content")
                cache.set(cache_key, result)
                return result
        except httpx.HTTPStatusError as e:
            logger.error("Gemini API HTTP error: %s - %s", e.response.status_code, e.response.text)
            raise
        except Exception as e:
            logger.error("Gemini API error: %s", e)
            raise

    async def generate_with_image(
        self,
        prompt: str,
        image_bytes: bytes,
        mime_type: str = "image/jpeg",
        model: str | None = None,
        temperature: float = 0.4,
        max_tokens: int = 1024,
        system_prompt: str | None = None,
    ) -> str:
        """Vision call: send a single image plus a text prompt to Gemini.

        We deliberately keep this simple — single image, single user turn —
        because that's the pattern needed for the chat upload UI. Multi-turn
        vision conversations can be added later.
        """
        import base64

        model = model or self.DEFAULT_MODEL
        api_key = get_settings().GEMINI_API_KEY
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set")

        url = f"{self.BASE_URL}/{model}:generateContent?key={api_key}"
        encoded = base64.b64encode(image_bytes).decode("ascii")
        parts = [
            {"inlineData": {"mimeType": mime_type, "data": encoded}},
            {"text": prompt},
        ]
        body: dict = {
            "contents": [{"role": "user", "parts": parts}],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            },
        }
        if system_prompt:
            body["systemInstruction"] = {"parts": [{"text": system_prompt}]}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=body, timeout=60.0)
                response.raise_for_status()
                data = response.json()
                candidates = data.get("candidates", [])
                if not candidates:
                    raise RuntimeError("Gemini vision returned no candidates")
                parts_out = candidates[0].get("content", {}).get("parts", [])
                result = "".join(p.get("text", "") for p in parts_out).strip()
                if not result:
                    raise RuntimeError("Gemini vision returned empty content")
                return result
        except httpx.HTTPStatusError as e:
            logger.error("Gemini vision HTTP error: %s - %s", e.response.status_code, e.response.text)
            raise
        except Exception as e:
            logger.error("Gemini vision error: %s", e)
            raise


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


def get_gemini() -> GeminiService:
    """Typed accessor for vision/Tshivenda flows that need GeminiService specifically."""
    svc = get_llm_service("gemini")
    assert isinstance(svc, GeminiService)
    return svc
