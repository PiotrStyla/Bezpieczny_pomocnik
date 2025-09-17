import json
import logging
from pywebpush import webpush, WebPushException

from py_vapid import Vapid
from .config import settings

# --- Permanent Fix --- #
# Generate VAPID keys on startup using py_vapid to ensure proper formatting.
try:
    # Try to create a new Vapid instance
    vapid = Vapid()
    vapid.generate_keys()
    # Get the keys in the proper format
    vapid_public_key = vapid.public_key
    vapid_private_key = vapid.private_key
    logging.info("Generated in-memory VAPID keys for this session.")
    logging.info(f"Public key (first 50 chars): {vapid_public_key[:50]}...")
except Exception as e:
    logging.error(f"Failed to generate VAPID keys: {e}")
    # Fallback to environment variables if generation fails
    vapid_public_key = settings.VAPID_PUBLIC_KEY
    vapid_private_key = settings.VAPID_PRIVATE_KEY
    logging.info("Using VAPID keys from environment variables.")

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
                # Use the in-memory private key.
                vapid_private_key=vapid_private_key,
                vapid_claims=vapid_claims
            )
        except WebPushException as ex:
            logging.error(f"Error sending notification to {sub.get('endpoint')}: {ex}")
            # If the subscription is gone (410), remove it from our list
            if ex.response and ex.response.status_code == 410:
                logging.info(f"Removing expired subscription: {sub.get('endpoint')}")
                subscriptions_in_memory.remove(sub)

