from typing import Dict
import base64
import httpx
from app.config import settings


async def identify_image(image_bytes: bytes) -> Dict:
    if not settings.PLANTID_API_KEY:
        return {"plant": "Unknown", "confidence": 0.0, "note": "PLANTID_API_KEY not set"}

    b64 = base64.b64encode(image_bytes).decode("ascii")
    payload = {
        "images": [b64],
        "similar_images": True,
    }
    headers = {"Content-Type": "application/json", "Api-Key": settings.PLANTID_API_KEY}
    url = "https://api.plant.id/v2/identify"
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(url, headers=headers, json=payload)
        if r.status_code >= 400:
            return {"plant": "Error", "confidence": 0.0, "note": f"{r.status_code}: {r.text[:200]}"}
        data = r.json()
        suggestions = data.get("suggestions", [])
        if suggestions:
            top = suggestions[0]
            name = top.get("plant_name") or top.get("name") or "Unknown"
            prob = top.get("probability") or top.get("confidence") or 0.0
            return {"plant": str(name), "confidence": float(prob)}
        return {"plant": "Unknown", "confidence": 0.0}
