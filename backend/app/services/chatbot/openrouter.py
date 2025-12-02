from typing import Optional, Dict
import httpx
from app.config import settings


async def send_message(message: str, context: Optional[str] = None) -> Dict:
    if not settings.OPENROUTER_API_KEY:
        return {"reply": "OpenRouter API key not configured.", "provider": "openrouter", "confidence": 0.0}

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    if settings.OPENROUTER_HTTP_REFERER:
        headers["HTTP-Referer"] = settings.OPENROUTER_HTTP_REFERER
    if settings.OPENROUTER_TITLE:
        headers["X-Title"] = settings.OPENROUTER_TITLE

    payload = {
        "model": settings.OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": context or "You are a helpful farm assistant."},
            {"role": "user", "content": message},
        ],
    }

    url = f"{settings.OPENROUTER_BASE_URL}/chat/completions"
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(url, headers=headers, json=payload)
        if r.status_code >= 400:
            return {"reply": f"Error {r.status_code}: {r.text[:200]}", "provider": "openrouter", "confidence": 0.0}
        data = r.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        return {"reply": content or "", "provider": "openrouter", "confidence": 0.8}
