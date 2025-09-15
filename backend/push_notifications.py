import json
import logging
from pywebpush import webpush, WebPushException

from .config import settings

# Store subscriptions in memory instead of a file
subscriptions_in_memory = []

def get_vapid_public_key() -> str:
    return settings.VAPID_PUBLIC_KEY

def add_subscription(subscription_info: dict):
    endpoint = subscription_info.get('endpoint')
    # Check if the endpoint already exists to avoid duplicates
    if not any(sub.get('endpoint') == endpoint for sub in subscriptions_in_memory):
        logging.info(f"Adding new in-memory subscription: {endpoint}")
        subscriptions_in_memory.append(subscription_info)

def send_notification_to_all(title: str, body: str):
    if "Your_VAPID" in settings.VAPID_PRIVATE_KEY or not settings.VAPID_PUBLIC_KEY:
        logging.warning("VAPID keys not configured. Cannot send notifications.")
        return

    logging.info(f"Sending notification to {len(subscriptions_in_memory)} in-memory subscribers.")
    
    notification_payload = json.dumps({"title": title, "body": body, "icon": "/images/icon-192x192.png"})
    vapid_claims = {"sub": settings.VAPID_EMAIL}

    # Create a copy to iterate over, so we can modify the original list
    for sub in list(subscriptions_in_memory):
        try:
            webpush(
                subscription_info=sub,
                data=notification_payload,
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims=vapid_claims
            )
        except WebPushException as ex:
            logging.error(f"Error sending notification to {sub.get('endpoint')}: {ex}")
            # If the subscription is gone (410), remove it from our list
            if ex.response and ex.response.status_code == 410:
                logging.info(f"Removing expired subscription: {sub.get('endpoint')}")
                subscriptions_in_memory.remove(sub)

def generate_vapid_keys():
    # Zaktualizowany sposób generowania kluczy dla nowej wersji pywebpush
    from pywebpush import Vapid
    vapid = Vapid.from_new()
    private_key = vapid.private_key_b64
    public_key = vapid.public_key_b64
    print("Wygenerowane klucze VAPID. Zapisz je w pliku .env.")
    print(f"VAPID_PUBLIC_KEY={public_key}")
    print(f"VAPID_PRIVATE_KEY={private_key}")

if __name__ == "__main__":
    generate_vapid_keys()
