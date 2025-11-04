# Minimal VAPID endpoint for Vercel
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

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
        return {"error": str(e), "type": str(type(e).__name__)}

@app.post("/api/subscribe")
def subscribe(subscription_info: dict = Body(...)):
    """Save push notification subscription"""
    try:
        from backend import push_notifications
        push_notifications.add_subscription(subscription_info)
        return {"status": "success", "message": "Subscription saved"}
    except Exception as e:
        return {"error": str(e), "type": str(type(e).__name__)}
