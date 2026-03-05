import logging

from langdetect import detect, LangDetectException

logger = logging.getLogger(__name__)

SUPPORTED_LANGUAGES = {"en", "af", "zu", "xh", "st", "tn", "nso", "ts", "ve"}


def detect_language(text: str) -> str:
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
