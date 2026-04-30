import logging

from langdetect import detect, LangDetectException

from app.services.tshivenda import looks_like_tshivenda

logger = logging.getLogger(__name__)

SUPPORTED_LANGUAGES = {"en", "af", "zu", "xh", "st", "tn", "nso", "ts", "ve"}


def detect_language(text: str) -> str:
    """Detect language of input text.

    Tshivenda check runs FIRST because langdetect lacks a Tshivenda profile
    and would otherwise misroute ve text to a wrong pipeline.
    """
    if looks_like_tshivenda(text):
        logger.info("Detected Tshivenda via heuristic")
        return "ve"

    try:
        detected = detect(text)
        if detected in SUPPORTED_LANGUAGES:
            logger.info("Detected language: %s", detected)
            return detected
        logger.warning(
            "Detected language '%s' not supported, defaulting to 'en'", detected
        )
        return "en"
    except LangDetectException:
        logger.warning("Language detection failed, defaulting to 'en'")
        return "en"
