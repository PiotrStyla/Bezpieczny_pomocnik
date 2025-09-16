from fastapi import FastAPI, Request, HTTPException
import base64
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List, Literal, Dict, Any
from cachetools import TTLCache
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from .config import settings
from .schema import Alert, SeverityLevel
from .data_sources import fetch_all_alerts
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
    public_key = get_vapid_public_key()
    try:
        decoded_key = base64.b64decode(public_key)
        url_safe_key = base64.urlsafe_b64encode(decoded_key).rstrip(b'=').decode('utf-8')
        return {"public_key": url_safe_key}
    except (base64.binascii.Error, TypeError):
        return {"public_key": public_key}

@app.post("/api/subscribe", status_code=201, summary="Zapisz subskrypcję na powiadomienia")
def subscribe(subscription: Dict[str, Any] = Body(...)):
    add_subscription(subscription)
    return {"message": "Subskrypcja zapisana."}

app.mount("/", StaticFiles(directory="frontend", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
