import json
import logging
import pywebpush
from py_vapid import Vapid01
from pywebpush import webpush, WebPushException
from .config import settings

# --- Use py-vapid library for proper VAPID key generation ---
vapid = Vapid01()
vapid.generate_keys()

# Get the public key in the format expected by browsers
vapid_public_key = vapid.public_key.public_key

# Get the private key for pywebpush
vapid_private_key = vapid.private_key.to_pem().decode('utf-8')

logging.info("Generated in-memory VAPID keys for this session.")
logging.info(f"Raw public key bytes length: {len(vapid.public_key.public_bytes_raw())}")
logging.info(f"VAPID public key length: {len(vapid_public_key)} chars")
logging.info(f"VAPID public key: {vapid_public_key}")

# Store subscriptions in memory instead of a file
subscriptions_in_memory = []

def get_vapid_public_key() -> str:
    # Use the in-memory public key.
    return vapid_public_key

def add_subscription(subscription_info: dict):
    endpoint = subscription_info.get('endpoint')
    # Check if the endpoint already exists to avoid duplicates
    if not any(sub.get('endpoint') == endpoint for sub in subscriptions_in_memory):
        logging.info(f"Adding new in-memory subscription: {endpoint}")
        subscriptions_in_memory.append(subscription_info)

def send_notification_to_all(title: str, body: str):
    notification_payload = json.dumps({"title": title, "body": body, "icon": "/images/icon-192x192.png"})
    # Use the VAPID_EMAIL from the environment variables.
    vapid_claims = {"sub": settings.VAPID_EMAIL}

    # Create a copy to iterate over, so we can modify the original list
    for sub in list(subscriptions_in_memory):
        try:
            webpush(
                subscription_info=sub,
                data=notification_payload,
                vapid_private_key=vapid_private_key,
                vapid_claims=vapid_claims
            )
        except WebPushException as ex:
            logging.error(f"Error sending notification to {sub.get('endpoint')}: {ex}")
            # If the subscription is gone (410), remove it from our list
            if ex.response and ex.response.status_code == 410:
                logging.info(f"Removing expired subscription: {sub.get('endpoint')}")
                subscriptions_in_memory.remove(sub)

