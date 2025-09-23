"""
Bezpieczny Pomocnik - Child Safety Application
Copyright (c) 2025 Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie
All Rights Reserved. Proprietary and Confidential.

This software is the exclusive property of:
Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie
30-404 Kraków, ul. Cegielniana 6B/45
Tel. +48 735 749 618 | Email: kontakt@fundacja-hospicjum.org
KRS: 0001063161 | NIP: 6793279476 | REGON: 526664276

Unauthorized copying, distribution, or use is strictly prohibited.
For licensing inquiries: kontakt@fundacja-hospicjum.org
"""

from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import logging
import asyncio
from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from cachetools import TTLCache
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from .config import settings
from .schema import Alert, SeverityLevel
from .data_sources import fetch_all_alerts, fetch_alerts_for_location, get_location_coverage_info
from .ai_processor import simplify_text, generate_tips
from .push_notifications import get_vapid_public_key, add_subscription, send_notification_to_all

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
cache = TTLCache(maxsize=10, ttl=settings.CACHE_TTL_SECONDS)
notified_alert_ids = set()
scheduler = AsyncIOScheduler()

app = FastAPI(
    title="Bezpieczny Pomocnik API",
    description="API dostarczające przetworzone komunikaty bezpieczeństwa dla Polski.",
    version="1.8.0"
)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def check_for_new_alerts_job():
    logging.info("Harmonogram: Sprawdzanie nowych alertów...")
    try:
        raw_alerts = fetch_all_alerts()
        for alert in raw_alerts:
            severity = classify_severity(alert["title"], alert["content"])
            if severity == SeverityLevel.WARNING and alert["id"] not in notified_alert_ids:
                simplified_body = simplify_text(alert["title"], alert["content"]) or alert["content"]
                send_notification_to_all(title=f"Nowy Alert: {alert['location']}", body=simplified_body[:200])
                notified_alert_ids.add(alert["id"])
    except Exception as e:
        logging.error(f"Błąd w zadaniu sprawdzającym alerty: {e}")

@app.on_event("startup")
async def startup_event():
    scheduler.add_job(check_for_new_alerts_job, 'interval', minutes=settings.SCHEDULER_INTERVAL_MINUTES)
    scheduler.start()

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()

def classify_severity(title: str, content: str) -> SeverityLevel:
    text_to_check = f"{title.lower()} {content.lower()}"
    if any(keyword in text_to_check for keyword in settings.WARNING_KEYWORDS): return SeverityLevel.WARNING
    if any(keyword in text_to_check for keyword in settings.CAUTION_KEYWORDS): return SeverityLevel.CAUTION
    return SeverityLevel.INFO

def detect_all_clear(title: str, content: str) -> bool:
    text_to_check = f"{title.lower()} {content.lower()}"
    return any(keyword in text_to_check for keyword in settings.ALL_CLEAR_KEYWORDS)

def map_color(severity: SeverityLevel) -> str:
    return {"warning": "czerwony", "caution": "żółty", "info": "zielony"}[severity.value]

async def process_alerts(raw_alerts: List[dict], lang: str) -> List[Alert]:
    processed = []
    for raw_alert in raw_alerts:
        severity = classify_severity(raw_alert["title"], raw_alert["content"])
        is_all_clear = detect_all_clear(raw_alert["title"], raw_alert["content"])
        if is_all_clear: severity = SeverityLevel.INFO
        simplified_content, tips = None, None
        if severity in [SeverityLevel.WARNING, SeverityLevel.CAUTION]:
            simplified_content = simplify_text(raw_alert["title"], raw_alert["content"], lang)
            if simplified_content: tips = generate_tips(simplified_content, lang)
        processed.append(Alert(id=raw_alert["id"], source=raw_alert["source"], title=raw_alert["title"], content=raw_alert["content"], simplified_content=simplified_content, severity=severity, color=map_color(severity), tips=tips, timestamp=raw_alert["timestamp"], location=raw_alert["location"], is_all_clear=is_all_clear))
    return processed

@app.get("/api/alerts", response_model=List[Alert], summary="Pobierz wszystkie aktualne alerty")
async def get_alerts(lang: Literal['pl', 'en', 'ua'] = Query('pl', description="Język uproszczonych treści.")):
    cache_key = f"alerts_{lang}"
    if cache_key in cache: return cache[cache_key]
    try:
        raw_alerts = fetch_all_alerts()
        processed_alerts = await process_alerts(raw_alerts, lang)
        sorted_alerts = sorted(processed_alerts, key=lambda x: x.timestamp, reverse=True)
        cache[cache_key] = sorted_alerts
        return sorted_alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Wystąpił błąd: {str(e)}")

@app.get("/api/vapid_public_key")
def get_vapid_key():
    # Directly return the key from the environment settings.
    # This is the URL-safe base64 encoded public key.
    public_key = get_vapid_public_key()
    return {"public_key": public_key}

@app.post("/api/subscribe", status_code=201, summary="Zapisz subskrypcję na powiadomienia")
def subscribe(subscription: Dict[str, Any] = Body(...)):
    add_subscription(subscription)
    return {"message": "Subskrypcja zapisana."}

@app.get("/api/alerts/location", response_model=List[Alert], summary="Pobierz alerty dla konkretnej lokalizacji")
async def get_alerts_for_location(
    lat: float = Query(..., description="Szerokość geograficzna (latitude)"),
    lon: float = Query(..., description="Długość geograficzna (longitude)"), 
    lang: Literal['pl', 'en', 'ua'] = Query('pl', description="Język uproszczonych treści.")
):
    """
    Pobierz alerty relevantne dla konkretnej lokalizacji w Polsce.
    System automatycznie dobierze źródła alertów na podstawie współrzędnych:
    - Alerty ogólnopolskie (RCB, IMGW)  
    - Alerty wojewódzkie dla danego województwa
    - Alerty miejskie jeśli dostępne dla tego miasta
    """
    cache_key = f"alerts_location_{lat}_{lon}_{lang}"
    if cache_key in cache: 
        return cache[cache_key]
    
    try:
        # Fetch location-specific alerts
        raw_alerts = fetch_alerts_for_location(lat, lon)
        processed_alerts = await process_alerts(raw_alerts, lang)
        sorted_alerts = sorted(processed_alerts, key=lambda x: x.timestamp, reverse=True)
        
        cache[cache_key] = sorted_alerts
        return sorted_alerts
    except Exception as e:
        logging.error(f"Error fetching location alerts for {lat}, {lon}: {e}")
        raise HTTPException(status_code=500, detail=f"Błąd pobierania alertów dla lokalizacji: {str(e)}")

@app.get("/api/coverage", summary="Informacje o pokryciu alertami")
def get_coverage_info():
    """
    Pobierz informacje o aktualnym pokryciu Polski alertami:
    - Liczba źródeł alertów
    - Pokryte lokalizacje (województwa, miasta) 
    - Szczegóły każdego źródła
    """
    try:
        coverage = get_location_coverage_info()
        return {
            "status": "success",
            "coverage": coverage,
            "description": "Pokrycie alertami dla Polski",
            "total_voivodeships": 16,
            "total_major_cities": len(coverage["source_details"])
        }
    except Exception as e:
        logging.error(f"Error getting coverage info: {e}")
        raise HTTPException(status_code=500, detail=f"Błąd pobierania informacji o pokryciu: {str(e)}")

@app.post("/api/update-location", summary="Aktualizuj źródła alertów dla nowej lokalizacji")
def update_location_sources(
    lat: float = Query(..., description="Szerokość geograficzna"), 
    lon: float = Query(..., description="Długość geograficzna")
):
    """
    Aktualizuj konfigurację źródeł alertów na podstawie nowej lokalizacji użytkownika.
    Przydatne gdy użytkownik zmienił lokalizację i chce otrzymywać lokalne alerty.
    """
    try:
        # Update sources for new location
        settings.update_sources_for_location(lat, lon)
        
        # Clear relevant cache entries
        keys_to_remove = [key for key in cache.keys() if key.startswith('alerts_')]
        for key in keys_to_remove:
            del cache[key]
        
        # Get updated coverage info
        coverage = get_location_coverage_info()
        
        return {
            "status": "success", 
            "message": "Źródła alertów zaktualizowane dla nowej lokalizacji",
            "location": {"lat": lat, "lon": lon},
            "updated_coverage": coverage
        }
    except Exception as e:
        logging.error(f"Error updating location sources: {e}")
        raise HTTPException(status_code=500, detail=f"Błąd aktualizacji źródeł dla lokalizacji: {str(e)}")

@app.get("/api/poland-info", summary="Informacje o podziale administracyjnym Polski")
def get_poland_administrative_info():
    """
    Pobierz informacje o podziale administracyjnym Polski pokrytym przez system alertów.
    """
    try:
        from .poland_locations import WOJEWODZTWA, MAJOR_CITIES
        
        return {
            "voivodeships": {
                "count": len(WOJEWODZTWA),
                "list": [
                    {
                        "code": code,
                        "name": info["name"], 
                        "capital": info["capital"],
                        "imgw_code": info["imgw_code"]
                    }
                    for code, info in WOJEWODZTWA.items()
                ]
            },
            "major_cities": {
                "count": len(MAJOR_CITIES),
                "list": [
                    {
                        "code": code,
                        "name": info["name"],
                        "voivodeship": info["wojewodztwo"], 
                        "population": info["population"],
                        "coordinates": {"lat": info["lat"], "lon": info["lon"]}
                    }
                    for code, info in MAJOR_CITIES.items()
                ]
            },
            "coverage_summary": {
                "total_administrative_levels": 3,
                "levels": ["national", "voivodeship", "city"],
                "description": "System pokrywa alerty na poziomie krajowym (RCB, IMGW), wojewódzkim (16 województw) i miejskim (największe miasta)"
            }
        }
    except Exception as e:
        logging.error(f"Error getting Poland info: {e}")
        raise HTTPException(status_code=500, detail=f"Błąd pobierania informacji o Polsce: {str(e)}")

@app.post("/api/bielik-speech")
async def generate_bielik_speech(request: dict):
    """
    Generate speech using Bielik AI (Polish model)
    """
    try:
        action = request.get("action")
        context = request.get("context", {})
        
        if not action:
            raise HTTPException(status_code=400, detail="Missing action")
        
        # Import here to avoid startup issues
        from .bielik_ai import generate_bielik_response
        import os
        
        # Get API key
        api_key = os.getenv('BIELIK_API_KEY')
        if not api_key or api_key.startswith('hf_TUTAJ'):
            # Fallback to rule-based response
            return await generate_fallback_response(action, context)
        
        # Generate with Bielik AI
        bielik_response = await generate_bielik_response(action, context, api_key)
        
        if bielik_response:
            return {
                "success": True,
                "text": bielik_response,
                "model": "bielik-ai",
                "action": action,
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            # Fallback if Bielik fails
            return await generate_fallback_response(action, context)
            
    except Exception as e:
        logging.error(f"Bielik speech error: {e}")
        return await generate_fallback_response(action, context)

async def generate_fallback_response(action: str, context: dict):
    """
    Fallback rule-based responses when Bielik AI is unavailable
    """
    child_age = context.get('childAge', 8)
    try:
        child_age = int(child_age)
    except:
        child_age = 8
    
    # Age-appropriate responses
    if child_age <= 6:
        responses = {
            "find_safety": "🏃 Maluszku, szukaj bezpiecznych miejsc! Idź do sklepu, szkoły lub tam gdzie są dorośli!",
            "safe_route": "🚶 Maluszku, idź główną drogą! Nie skręcaj w ciemne uliczki!",
            "emergency_help": "🚨 Maluszku, w niebezpieczeństwie dzwoń 112! Poproś dorosłego o pomoc!",
            "where_am_i": "🧭 Maluszku, sprawdzam gdzie jesteś. Zapamiętaj ważne miejsca!",
            "welcome": "🎈 Cześć maluszku! Jestem twoim przyjacielem bezpieczeństwa!"
        }
    elif child_age <= 9:
        responses = {
            "find_safety": "🏃 Gdy się zgubisz, szukaj bezpiecznych miejsc: sklepy, szkoły, biblioteki!",
            "safe_route": "🚶 Bezpieczna droga: idź głównymi ulicami, gdzie jest dużo ludzi!",
            "emergency_help": "🚨 W sytuacji awaryjnej: dzwoń 112, znajdź dorosłego!",
            "where_am_i": "🧭 Sprawdzam gdzie jesteś. Zapamiętaj nazwy ulic i ważne miejsca!",
            "welcome": "👋 Witaj! Jestem twoim pomocnikiem bezpieczeństwa!"
        }
    else:
        responses = {
            "find_safety": "🏃 Najbliższe bezpieczne miejsca: sklepy, szkoły, biblioteki, komisariaty. Wybieraj dobrze oświetlone miejsca!",
            "safe_route": "🚶 Planuj bezpieczną trasę: główne ulice, przejścia dla pieszych. Unikaj skrótów przez pustnie tereny!",
            "emergency_help": "🚨 Procedura awaryjna: 1) Oceń sytuację 2) Dzwoń 112 3) Poinformuj dorosłego 4) Idź do bezpiecznego miejsca",
            "where_am_i": "🧭 Sprawdzam lokalizację. Zapamiętaj: nazwy ulic, numery budynków, punkty orientacyjne!",
            "welcome": "🛡️ Witaj! Jestem AI asystentem bezpieczeństwa. Pomogę ci w różnych sytuacjach!"
        }
    
    response_text = responses.get(action, responses["welcome"])
    
    return {
        "success": False,
        "text": response_text,
        "model": "rule-based-fallback",
        "action": action,
        "note": "Bielik AI unavailable - using rule-based response"
    }

app.mount("/", StaticFiles(directory="frontend", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
