"""Conversation history persistence.

A pragmatic file-based store: one JSON file per conversation under
backend/app/data/conversations/<id>.json. This fits the existing project
shape (no DB), works locally and on Render's filesystem, and keeps the
storage layer cleanly swappable behind the functions in this module.

CAVEAT: Render's free tier has an ephemeral filesystem — conversations
will not survive a redeploy. For durable hosted storage, swap the read/write
helpers for a database client (Supabase/Postgres) without changing the
router or schema.
"""

from __future__ import annotations

import json
import logging
import os
import re
import time
import uuid
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "conversations"


def _ensure_dir() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def _path_for(conversation_id: str) -> Path:
    # Defensively reject anything that isn't a plain id to avoid path traversal.
    if not re.fullmatch(r"[A-Za-z0-9_-]{1,64}", conversation_id):
        raise ValueError(f"Invalid conversation id: {conversation_id!r}")
    return DATA_DIR / f"{conversation_id}.json"


def _now() -> float:
    return time.time()


def _summarize_first_message(messages: list[dict]) -> str:
    for m in messages:
        if m.get("role") == "user" and m.get("content"):
            text = m["content"].strip().replace("\n", " ")
            return text[:60] + ("…" if len(text) > 60 else "")
    return "New conversation"


def list_conversations() -> list[dict]:
    """Return conversation summaries sorted by updated_at desc."""
    _ensure_dir()
    out: list[dict] = []
    for fname in os.listdir(DATA_DIR):
        if not fname.endswith(".json"):
            continue
        try:
            with open(DATA_DIR / fname, encoding="utf-8") as f:
                data = json.load(f)
            out.append({
                "id": data["id"],
                "title": data.get("title") or _summarize_first_message(data.get("messages", [])),
                "language": data.get("language"),
                "created_at": data.get("created_at"),
                "updated_at": data.get("updated_at"),
                "message_count": len(data.get("messages", [])),
            })
        except Exception as e:
            logger.warning("Skipping unreadable conversation file %s: %s", fname, e)
    out.sort(key=lambda x: x.get("updated_at") or 0, reverse=True)
    return out


def get_conversation(conversation_id: str) -> dict:
    path = _path_for(conversation_id)
    if not path.exists():
        raise FileNotFoundError(f"Conversation {conversation_id} not found")
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def create_conversation(language: str | None = None, title: str | None = None) -> dict:
    _ensure_dir()
    now = _now()
    convo = {
        "id": uuid.uuid4().hex[:16],
        "title": title or "New conversation",
        "language": language,
        "created_at": now,
        "updated_at": now,
        "messages": [],
    }
    _write(convo)
    return convo


def update_conversation(
    conversation_id: str,
    *,
    messages: list[dict] | None = None,
    title: str | None = None,
    language: str | None = None,
) -> dict:
    convo = get_conversation(conversation_id)
    if messages is not None:
        convo["messages"] = messages
        if not convo.get("title") or convo["title"] == "New conversation":
            convo["title"] = _summarize_first_message(messages)
    if title is not None:
        convo["title"] = title
    if language is not None:
        convo["language"] = language
    convo["updated_at"] = _now()
    _write(convo)
    return convo


def append_messages(conversation_id: str, new_messages: list[dict]) -> dict:
    convo = get_conversation(conversation_id)
    convo["messages"].extend(new_messages)
    if not convo.get("title") or convo["title"] == "New conversation":
        convo["title"] = _summarize_first_message(convo["messages"])
    convo["updated_at"] = _now()
    _write(convo)
    return convo


def delete_conversation(conversation_id: str) -> None:
    path = _path_for(conversation_id)
    if path.exists():
        path.unlink()


def _write(convo: dict[str, Any]) -> None:
    _ensure_dir()
    path = _path_for(convo["id"])
    tmp = path.with_suffix(".json.tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(convo, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)
