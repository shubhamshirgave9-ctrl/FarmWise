from typing import Dict
import httpx


async def fetch_weather(lat: float, lon: float) -> Dict:
    url = (
        "https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}&hourly=temperature_2m,relativehumidity_2m,precipitation"
    )
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(url)
        if r.status_code >= 400:
            return {"temperature": 0.0, "humidity": 0.0, "rainfall": 0.0}
        data = r.json()
        hourly = data.get("hourly", {})
        temps = hourly.get("temperature_2m") or []
        hums = hourly.get("relativehumidity_2m") or []
        prec = hourly.get("precipitation") or []
        # Simple aggregates
        temp_avg = sum(temps) / len(temps) if temps else 0.0
        hum_avg = sum(hums) / len(hums) if hums else 0.0
        rain_sum = sum(prec) if prec else 0.0
        return {"temperature": round(temp_avg, 2), "humidity": round(hum_avg, 2), "rainfall": round(rain_sum, 2)}
