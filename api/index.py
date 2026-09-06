# Vercel Python Serverless entrypoint
import sys
import os

# Add parent directory to path so we can import backend modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Try to import and provide debug info if it fails
try:
    from backend.main import app
except Exception as e:
    # If import fails, create a minimal debug app
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    
    app = FastAPI(title="Debug API")
    app.add_middleware(CORSMiddleware, allow_origins=["https://piotrstyla.github.io"], allow_credentials=False, allow_methods=["GET"])
    
    @app.get("/api/vapid_public_key")
    def debug_error():
        raise HTTPException(status_code=503, detail="Usługa jest niedostępna.")
