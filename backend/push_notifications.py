import json
import logging
from pywebpush import webpush, WebPushException

import base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization

# --- VAPID Key Diagnostic --- #
# Manually generate a new key pair on startup and store it in memory.
# This is a low-level implementation to guarantee it works.
private_key = ec.generate_private_key(ec.SECP256R1())
public_key = private_key.public_key()

# Get the raw public key in uncompressed format for the browser
raw_public_key = public_key.public_bytes(
    encoding=serialization.Encoding.X962,
    format=serialization.PublicFormat.UncompressedPoint
)
url_safe_public_key = base64.urlsafe_b64encode(raw_public_key).rstrip(b'=').decode('utf-8')

# Get the private key in PEM format for the webpush library
private_pem = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
)

logging.info("Generated new temporary VAPID keys for this session.")
logging.info(f"Temporary Public Key: {url_safe_public_key}")

# Store subscriptions in memory instead of a file
subscriptions_in_memory = []

def get_vapid_public_key() -> str:
    # Use the in-memory public key for this diagnostic test.
    return url_safe_public_key

def add_subscription(subscription_info: dict):
    endpoint = subscription_info.get('endpoint')
    # Check if the endpoint already exists to avoid duplicates
    if not any(sub.get('endpoint') == endpoint for sub in subscriptions_in_memory):
        logging.info(f"Adding new in-memory subscription: {endpoint}")
        subscriptions_in_memory.append(subscription_info)

def send_notification_to_all(title: str, body: str):
    logging.info(f"Sending notification to {len(subscriptions_in_memory)} in-memory subscribers.")
    
    notification_payload = json.dumps({"title": title, "body": body, "icon": "/images/icon-192x192.png"})
    # Use a dummy email for the diagnostic test.
    vapid_claims = {"sub": "mailto:test@example.com"}

    # Create a copy to iterate over, so we can modify the original list
    for sub in list(subscriptions_in_memory):
        try:
            webpush(
                subscription_info=sub,
                data=notification_payload,
                # Use the in-memory private key (in PEM format) for this diagnostic test.
                vapid_private_key=private_pem,
                vapid_claims=vapid_claims
            )
        except WebPushException as ex:
            logging.error(f"Error sending notification to {sub.get('endpoint')}: {ex}")
            # If the subscription is gone (410), remove it from our list
            if ex.response and ex.response.status_code == 410:
                logging.info(f"Removing expired subscription: {sub.get('endpoint')}")
                subscriptions_in_memory.remove(sub)

