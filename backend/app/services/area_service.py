from typing import Optional, Tuple
import httpx


def to_hectares(value: float, unit: str) -> float:
    u = (unit or "").lower()
    if u in {"acre", "acres"}:
        return float(value) * 0.4046856422
    return float(value)


async def geocode_city(name: str) -> Optional[Tuple[float, float]]:
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={name}"
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(url)
        if r.status_code >= 400:
            return None
        data = r.json()
        results = data.get("results") or []
        if not results:
            return None
        first = results[0]
        return float(first.get("latitude")), float(first.get("longitude"))
