"""Tshivenda quality layer.

This module exists because Tshivenda (ve) is poorly served by generic
translate-to-English-and-back chat pipelines and by language-detection
libraries trained on high-resource languages. The strategy here is:

1. **Detect Tshivenda by heuristic**, not langdetect — the langdetect library
   does not have a Tshivenda profile and will misclassify it as af/sw/zu.
2. **Skip the translate roundtrip for ve.** We pass Tshivenda directly to a
   model that handles African languages (Gemini), with a system prompt that
   anchors spelling, register, and a few-shot example set.
3. **Apply a corrections normalizer** to LLM output to fix known malformed
   forms (e.g., "mbumbno" → "Mbumbano") before returning to the user.
4. **Fail honestly.** When uncertain, the prompt instructs the model to admit
   uncertainty and offer alternatives instead of inventing spellings.

Limitations: the corrections file is small and targeted at observed errors;
it is not a full Tshivenda spellchecker. We document this in README.
"""

from __future__ import annotations

import json
import logging
import re
from functools import lru_cache
from pathlib import Path

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
CORRECTIONS_PATH = DATA_DIR / "tshivenda_corrections.json"
EXAMPLES_PATH = DATA_DIR / "tshivenda_examples.json"

# Tshivenda-distinctive strings. None of these alone proves Tshivenda but a
# match on any with reasonable text length is a strong signal versus other SA
# languages. Tuned to be conservative — false positives are worse than misses
# because the heuristic is only the first line of defence.
VE_MARKER_TOKENS = (
    "ndaa", "ndi a livhuwa", "vhone", "vhathu", "tshivenda", "vhavenda",
    "mbumbano", "mvelaphanda", "musanda", "khoro", "tshikolo", "muvhuso",
    "vhembe", "ndi tshi", "ndi khou", "ndi ḓo", "ndi ḓi", "vha khou",
    "u ḓi", "ḓa ", "ḽa ", "ṅwana", "ṱadi", "ṋwala",
    "khotsi", "musidzana", "mufana", "vhomma", "lufuno", "luambo",
)

# Diacritics distinctive to Tshivenda orthography.
VE_DIACRITICS = re.compile(r"[ḓḽṅṋṱḏ]", flags=re.IGNORECASE)


@lru_cache(maxsize=1)
def _load_corrections() -> dict[str, str]:
    try:
        with open(CORRECTIONS_PATH, encoding="utf-8") as f:
            data = json.load(f)
        return data.get("corrections", {})
    except FileNotFoundError:
        logger.warning("Tshivenda corrections file missing at %s", CORRECTIONS_PATH)
        return {}
    except Exception as e:
        logger.error("Failed to load Tshivenda corrections: %s", e)
        return {}


@lru_cache(maxsize=1)
def _load_examples() -> list[dict]:
    try:
        with open(EXAMPLES_PATH, encoding="utf-8") as f:
            data = json.load(f)
        return data.get("examples", [])
    except FileNotFoundError:
        logger.warning("Tshivenda examples file missing at %s", EXAMPLES_PATH)
        return []
    except Exception as e:
        logger.error("Failed to load Tshivenda examples: %s", e)
        return []


def looks_like_tshivenda(text: str) -> bool:
    """Heuristic detector. Returns True if text strongly resembles Tshivenda.

    Why: langdetect lacks a Tshivenda profile. Without a heuristic, ve text
    routes to the wrong pipeline. We err on the side of detection only when
    the signal is strong (markers OR distinctive diacritics).
    """
    if not text:
        return False
    lowered = text.lower()
    if VE_DIACRITICS.search(lowered):
        return True
    matches = sum(1 for token in VE_MARKER_TOKENS if token in lowered)
    return matches >= 1 and len(lowered) <= 280  # short utterances; long English text shouldn't trip this


def normalize_tshivenda(text: str) -> str:
    """Apply curated corrections to a Tshivenda string.

    Word-boundary, case-insensitive replacement using the corrections JSON.
    Capitalization in the replacement value is taken verbatim from the
    corrections file (since the value encodes the canonical capitalization).

    This runs on both user input (before sending to LLM) and LLM output
    (before returning to user).
    """
    if not text:
        return text
    corrections = _load_corrections()
    if not corrections:
        return text

    out = text
    # Sort by length desc so multi-word entries match before their substrings.
    for wrong in sorted(corrections.keys(), key=len, reverse=True):
        right = corrections[wrong]
        # Word-boundary regex; allow apostrophes and hyphens within the term.
        # \b doesn't play perfectly with non-ASCII; use look-around for
        # safer matching against typical separators.
        pattern = re.compile(
            rf"(?<![A-Za-zḓḽṅṋṱḏ])({re.escape(wrong)})(?![A-Za-zḓḽṅṋṱḏ])",
            flags=re.IGNORECASE,
        )
        out = pattern.sub(right, out)
    return out


def build_system_prompt(grade: int | None = None, mode: str = "chat") -> str:
    """Build the Tshivenda-specific system prompt.

    Args:
        grade: optional learner grade; included for educational tone shaping.
        mode: "chat" for general conversation, "learn" for explicit teaching.
    """
    examples = _load_examples()
    corrections = _load_corrections()

    base = (
        "You are Gudani Bot, a Tshivenda-speaking community and learning "
        "assistant for the Vhavenda community and learners across South "
        "Africa. You help with everyday questions, schoolwork, language "
        "learning, translation, and community matters.\n\n"
        "RULES FOR TSHIVENDA OUTPUT (follow strictly):\n"
        "1. Reply in fluent, natural Tshivenda. Keep sentences short and clear.\n"
        "2. NEVER invent spellings. If you are not certain of a word, write it "
        "in English in parentheses or admit uncertainty in Tshivenda.\n"
        "3. Use the canonical spellings shown in the examples below. In "
        "particular: 'Mbumbano' (NOT 'mbumbno'), 'Tshivenda' (NOT 'tshi venda' "
        "or 'luvenda'), 'Ndi a livhuwa' (NOT 'ndilivhuwa').\n"
        "4. When the user is clearly learning, give the Tshivenda phrase, then "
        "a short English gloss in parentheses.\n"
        "5. If you don't know something, say so honestly: 'A thi ḓivhi' "
        "or 'I'm not sure of the exact Tshivenda term'.\n"
        "6. Tshivenda uses diacritics (ḓ ḽ ṅ ṋ ṱ). Use them when you are "
        "confident; do not sprinkle them randomly.\n"
        "7. Be respectful and warm. Use 'ni' (you, plural/respectful) by "
        "default unless the user signals informal register.\n"
    )

    if grade:
        base += f"\nThe user may be a Grade {grade} learner — keep explanations age-appropriate when relevant.\n"

    if mode == "learn":
        base += (
            "\nIn LEARN mode you are explicitly teaching Tshivenda. Always "
            "include: (a) the Tshivenda phrase, (b) a literal English gloss, "
            "(c) one usage example. Keep replies short and digestible.\n"
        )

    # Inject up to 8 few-shot examples (full set in file but prompt budget is finite).
    if examples:
        base += "\nEXAMPLES of correct Tshivenda interactions:\n"
        for ex in examples[:8]:
            base += f"User: {ex['user']}\nGudani: {ex['assistant']}\n\n"

    # Inject the most important spelling corrections inline so the model sees them.
    if corrections:
        base += "CORRECT SPELLING REMINDERS (use the right side):\n"
        # Pick a curated subset — the high-signal ones.
        priority = ["mbumbno", "tshi venda", "luvenda", "ndilivhuwa", "thohonifho"]
        for wrong in priority:
            if wrong in corrections:
                base += f"  '{wrong}' → '{corrections[wrong]}'\n"

    return base


def get_few_shot_messages(limit: int = 6) -> list[dict]:
    """Return few-shot examples as alternating user/assistant messages.

    Some providers respect few-shots better as message turns than as
    in-prompt examples. This is offered as an alternative injection mode.
    """
    examples = _load_examples()
    out: list[dict] = []
    for ex in examples[:limit]:
        out.append({"role": "user", "content": ex["user"]})
        out.append({"role": "assistant", "content": ex["assistant"]})
    return out
