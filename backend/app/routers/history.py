import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services import history

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/history", tags=["history"])


class HistoryMessage(BaseModel):
    role: str
    content: str
    timestamp: str | None = None
    detected_language: str | None = None
    translated: bool | None = None
    image_url: str | None = None  # filled in if message included an uploaded image


class CreateConversationRequest(BaseModel):
    language: str | None = None
    title: str | None = None
    messages: list[HistoryMessage] | None = None


class UpdateConversationRequest(BaseModel):
    messages: list[HistoryMessage] | None = None
    title: str | None = None
    language: str | None = None


@router.get("")
async def list_conversations():
    return history.list_conversations()


@router.post("")
async def create_conversation(request: CreateConversationRequest):
    convo = history.create_conversation(language=request.language, title=request.title)
    if request.messages:
        convo = history.update_conversation(
            convo["id"],
            messages=[m.model_dump() for m in request.messages],
        )
    return convo


@router.get("/{conversation_id}")
async def get_conversation(conversation_id: str):
    try:
        return history.get_conversation(conversation_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Conversation not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{conversation_id}")
async def update_conversation(conversation_id: str, request: UpdateConversationRequest):
    try:
        return history.update_conversation(
            conversation_id,
            messages=[m.model_dump() for m in request.messages] if request.messages is not None else None,
            title=request.title,
            language=request.language,
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Conversation not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: str):
    try:
        history.delete_conversation(conversation_id)
        return {"deleted": True, "id": conversation_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
