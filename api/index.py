# Vercel Python Serverless entrypoint
# Reuse the existing FastAPI app from backend/main.py
import sys
import os

# Add parent directory to path so we can import backend modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app
