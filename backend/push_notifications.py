import json
import logging
from pywebpush import webpush, WebPushException
import base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
from .config import settings

# --- Permanent Fix --- #
# Generate VAPID keys on startup to bypass corrupted environment variables.
private_key = ec.generate_private_key(ec.SECP256R1())
public_key = private_key.public_key()

# Get the raw public key in uncompressed format for the browser
raw_public_key = public_key.public_bytes(
    encoding=serialization.Encoding.X962,
    format=serialization.PublicFormat.UncompressedPoint
)
vapid_public_key = base64.urlsafe_b64encode(raw_public_key).rstrip(b'=').decode('utf-8')

# Get the private key in PEM format for the webpush library
vapid_private_key = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
).decode('utf-8')

logging.info("Generated in-memory VAPID keys for this session.")

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

