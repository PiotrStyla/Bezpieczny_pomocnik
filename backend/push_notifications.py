import json
import os
from pywebpush import webpush, WebPushException
import logging
from tinydb import TinyDB, Query

from .config import settings

DATA_DIR = "data"
DB_PATH = os.path.join(DATA_DIR, "subscriptions.json")

os.makedirs(DATA_DIR, exist_ok=True)

db = TinyDB(DB_PATH)
Subscription = Query()

def get_vapid_public_key() -> str:
    return settings.VAPID_PUBLIC_KEY

def add_subscription(subscription_info: dict):
    endpoint = subscription_info.get('endpoint')
    if not db.search(Subscription.endpoint == endpoint):
        logging.info(f"Dodawanie nowej subskrypcji do bazy danych: {endpoint}")
        db.insert(subscription_info)

def send_notification_to_all(title: str, body: str):
    if "Your_VAPID" in settings.VAPID_PRIVATE_KEY or not settings.VAPID_PUBLIC_KEY:
        logging.warning("Brak kluczy VAPID. Wysyłanie powiadomień jest niemożliwe.")
        return

    all_subscriptions = db.all()
    logging.info(f"Wysyłanie powiadomienia do {len(all_subscriptions)} subskrybentów.")
    
    notification_payload = json.dumps({"title": title, "body": body, "icon": "/images/icon-192x192.png"})
    vapid_claims = {"sub": settings.VAPID_EMAIL}

    for sub in all_subscriptions:
        try:
            webpush(
                subscription_info=sub,
                data=notification_payload,
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims=vapid_claims
            )
        except WebPushException as ex:
            logging.error(f"Błąd wysyłania powiadomienia do {sub.get('endpoint')}: {ex}")
            if ex.response and ex.response.status_code == 410:
                db.remove(Subscription.endpoint == sub.get('endpoint'))

def generate_vapid_keys():
    from pywebpush import vapid
    private_key = vapid.generate_private_key()
    public_key = private_key.public_key
    print("Wygenerowane klucze VAPID. Zapisz je w pliku .env.")
    print(f"VAPID_PUBLIC_KEY={public_key.encode().decode('utf-8')}")
    print(f"VAPID_PRIVATE_KEY={private_key.encode().decode('utf-8')}")

if __name__ == "__main__":
    generate_vapid_keys()
