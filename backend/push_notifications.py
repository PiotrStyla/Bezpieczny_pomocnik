import json
import logging
import pywebpush
from pywebpush import webpush, WebPushException
import base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
import os
from .config import settings

SUBSCRIPTIONS_FILE = os.path.join(os.path.dirname(__file__), "subscriptions.json")

def _load_subscriptions_from_file():
    """Load subscriptions from JSON file if it exists."""
    try:
        if os.path.exists(SUBSCRIPTIONS_FILE):
            with open(SUBSCRIPTIONS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                # Ensure it's a list
                if isinstance(data, list):
                    logging.info(f"Loaded {len(data)} subscriptions from file.")
                    return data
                else:
                    logging.warning("Subscriptions file is not a list; starting fresh.")
                    return []
    except Exception as e:
        logging.warning(f"Failed to load subscriptions file (read-only filesystem?): {e}")
    return []

def _save_subscriptions_to_file(subscriptions):
    """Atomically save subscriptions to JSON file."""
    try:
        temp_file = SUBSCRIPTIONS_FILE + ".tmp"
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(subscriptions, f, ensure_ascii=False, indent=2)
        # Atomic move
        os.replace(temp_file, SUBSCRIPTIONS_FILE)
        logging.info(f"Saved {len(subscriptions)} subscriptions to file.")
    except Exception as e:
        logging.warning(f"Failed to save subscriptions file (read-only filesystem?): {e}")

def _ensure_vapid_keys():
    global vapid_public_key, vapid_private_key
    env_pub = (getattr(settings, 'VAPID_PUBLIC_KEY', None) or '').strip()
    env_priv = (getattr(settings, 'VAPID_PRIVATE_KEY', None) or '').strip()
    
    # Ignore default placeholder values
    if env_pub.startswith('Your_') or env_priv.startswith('Your_'):
        logging.info("Ignoring placeholder VAPID keys from config")
        env_pub = ''
        env_priv = ''
    
    # Allow PEM stored in .env with escaped newlines
    if env_priv:
        env_priv = env_priv.replace('\\n', '\n')

    if env_pub and env_priv:
        try:
            padding = '=' * (-len(env_pub) % 4)
            base64.urlsafe_b64decode((env_pub + padding).encode('utf-8'))
            vapid_public_key = env_pub
            vapid_private_key = env_priv
            logging.info("Using VAPID keys from environment.")
            return
        except Exception:
            pass

    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()
    raw_public_key = public_key.public_bytes(
        encoding=serialization.Encoding.X962,
        format=serialization.PublicFormat.UncompressedPoint
    )
    vapid_public_key = base64.urlsafe_b64encode(raw_public_key).rstrip(b'=').decode('utf-8')
    vapid_private_key = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    ).decode('utf-8')
    logging.info("Generated in-memory VAPID keys for this session.")

_ensure_vapid_keys()

# Initialize subscriptions from file on module import
subscriptions_in_memory = _load_subscriptions_from_file()

def get_vapid_public_key() -> str:
    # Use the in-memory public key.
    return vapid_public_key

def add_subscription(subscription_info: dict):
    endpoint = subscription_info.get('endpoint')
    # Check if the endpoint already exists to avoid duplicates
    if not any(sub.get('endpoint') == endpoint for sub in subscriptions_in_memory):
        logging.info(f"Adding new in-memory subscription: {endpoint}")
        subscriptions_in_memory.append(subscription_info)
        _save_subscriptions_to_file(subscriptions_in_memory)
    else:
        logging.info(f"Subscription already exists, skipping save: {endpoint}")

def remove_subscription(endpoint: str):
    """Remove a subscription by endpoint (used for expired ones)."""
    global subscriptions_in_memory
    original_len = len(subscriptions_in_memory)
    subscriptions_in_memory = [sub for sub in subscriptions_in_memory if sub.get('endpoint') != endpoint]
    if len(subscriptions_in_memory) < original_len:
        logging.info(f"Removed subscription: {endpoint}")
        _save_subscriptions_to_file(subscriptions_in_memory)

def send_notification_to_all(title: str, body: str):
    notification_payload = json.dumps({"title": title, "body": body, "icon": "./images/logo_192x192.png"})
    # Use the VAPID_EMAIL from the environment variables.
    vapid_claims = {"sub": settings.VAPID_EMAIL}

    # Create a copy to iterate over, so we can modify the original list
    results = {"successes": [], "failures": []}
    for sub in list(subscriptions_in_memory):
        try:
            webpush(
                subscription_info=sub,
                data=notification_payload,
                vapid_private_key=vapid_private_key,
                vapid_claims=vapid_claims,
                ttl=60
            )
            results["successes"].append(sub.get("endpoint"))
        except WebPushException as ex:
            logging.error(f"Error sending notification to {sub.get('endpoint')}: {ex}")
            # If the subscription is gone (410), remove it from our list
            if ex.response and ex.response.status_code == 410:
                logging.info(f"Removing expired subscription: {sub.get('endpoint')}")
                remove_subscription(sub.get('endpoint'))
            status = getattr(ex.response, 'status_code', None) if hasattr(ex, 'response') else None
            results["failures"].append({
                "endpoint": sub.get("endpoint"),
                "error": str(ex),
                "status": status
            })
        except Exception as ex:
            logging.error(f"Unexpected error sending notification: {ex}")
            results["failures"].append({
                "endpoint": sub.get("endpoint"),
                "error": str(ex),
                "status": None
            })
    return results

