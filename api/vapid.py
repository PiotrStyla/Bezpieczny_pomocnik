# Minimal VAPID endpoint for Vercel
from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["https://piotrstyla.github.io"], allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["Content-Type"])

@app.get("/api/vapid_public_key")
def get_vapid_public_key():
    """Minimal endpoint to return VAPID public key without heavy imports"""
    try:
        # Try to use push_notifications module
        from backend import push_notifications
        public_key = push_notifications.get_vapid_public_key()
        return {"public_key": public_key}
    except Exception as e:
        # Fallback: return error info
        raise HTTPException(status_code=503, detail="Usługa powiadomień jest niedostępna.")

@app.post("/api/subscribe")
def subscribe(subscription_info: dict = Body(...)):
    """Legacy registrations are disabled on the separate Vercel entrypoint too."""
    raise HTTPException(status_code=410, detail="Rejestracja powiadomień starej wersji jest wyłączona.")
