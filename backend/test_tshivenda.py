"""Tshivenda evaluation harness.

Two run modes:

  1. Offline (default) — checks the corrections normalizer and prompt builder
     work as expected without calling any LLM. Good for CI.

  2. Live (--live) — sends each eval prompt through the real /api/chat
     endpoint at http://localhost:8000 and checks expected/forbidden keyword
     constraints. Requires the backend running with valid API keys.

Usage:
    python -m backend.test_tshivenda            # offline checks
    python -m backend.test_tshivenda --live     # full pipeline check
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Allow running as `python backend/test_tshivenda.py` from repo root.
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.services.tshivenda import (  # noqa: E402
    build_system_prompt,
    looks_like_tshivenda,
    normalize_tshivenda,
)

EVAL_PATH = Path(__file__).resolve().parent / "app" / "data" / "tshivenda_eval.json"


def run_offline() -> int:
    failures = 0

    # 1. Corrections normalizer round-trip.
    cases = [
        ("Mbumbno ndi mini?", "Mbumbano"),
        ("mbumbno ndi muvhigo", "Mbumbano"),
        ("ndi tshi venda", "Tshivenda"),
        ("ndilivhuwa", "Ndi a livhuwa"),
        ("luvenda", "Tshivenda"),
        ("Ndaaa, ni khou ita hani?", "Ndaa"),
    ]
    for input_text, expected_substr in cases:
        out = normalize_tshivenda(input_text)
        if expected_substr.lower() not in out.lower():
            print(f"FAIL normalize: {input_text!r} -> {out!r}, expected to contain {expected_substr!r}")
            failures += 1
        else:
            print(f"OK   normalize: {input_text!r} -> {out!r}")

    # 2. Heuristic detection.
    detection = [
        ("Ndaa, ni khou ita hani?", True),
        ("Mbumbano ndi mini?", True),
        ("Hello world", False),
        ("Sawubona unjani?", False),  # isiZulu — should not trip
        ("Goeie môre, hoe gaan dit?", False),  # Afrikaans
    ]
    for text, expected in detection:
        got = looks_like_tshivenda(text)
        if got == expected:
            print(f"OK   detect:    {text!r} -> {got}")
        else:
            print(f"FAIL detect:    {text!r} -> {got}, expected {expected}")
            failures += 1

    # 3. System prompt is non-trivial and contains few-shot.
    prompt = build_system_prompt(grade=8, mode="chat")
    if "Mbumbano" not in prompt or "EXAMPLES" not in prompt:
        print("FAIL system prompt missing required sections")
        failures += 1
    else:
        print("OK   system prompt contains examples and spelling guidance")

    return failures


def run_live(base_url: str = "http://localhost:8000") -> int:
    import httpx

    with open(EVAL_PATH, encoding="utf-8") as f:
        eval_data = json.load(f)

    failures = 0
    for case in eval_data.get("cases", []):
        prompt = case["prompt"]
        try:
            response = httpx.post(
                f"{base_url}/api/chat",
                json={
                    "message": prompt,
                    "language": case.get("language", "ve"),
                    "grade": 8,
                },
                timeout=60.0,
            )
            response.raise_for_status()
            answer = response.json().get("response", "").lower()
        except Exception as e:
            print(f"FAIL [{case['id']}] HTTP error: {e}")
            failures += 1
            continue

        case_failed = False
        for kw in case.get("expected_keywords", []):
            if kw.lower() not in answer:
                print(f"FAIL [{case['id']}] missing expected keyword '{kw}'")
                case_failed = True
        for kw in case.get("forbidden_keywords", []):
            if kw.lower() in answer:
                print(f"FAIL [{case['id']}] contains forbidden keyword '{kw}'")
                case_failed = True

        if case_failed:
            failures += 1
            print(f"  prompt:   {prompt}")
            print(f"  response: {answer[:200]}")
        else:
            print(f"OK   [{case['id']}] {prompt[:60]}")

    return failures


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--live", action="store_true", help="hit the real /api/chat endpoint")
    parser.add_argument("--base-url", default="http://localhost:8000")
    args = parser.parse_args()

    print("=" * 60)
    print("Tshivenda evaluation")
    print("=" * 60)

    failures = run_offline()
    print()
    if args.live:
        print("=" * 60)
        print("Live /api/chat checks")
        print("=" * 60)
        failures += run_live(args.base_url)

    print()
    if failures:
        print(f"FAILED: {failures} check(s) failed")
        return 1
    print("All checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
