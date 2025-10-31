"""
Catch-all API route for Vercel Serverless to forward /api/* to FastAPI.
We re-prefix incoming paths with '/api' so existing routes like '/api/vapid_public_key'
continue to work when called as /api/vapid_public_key on Vercel.
"""
from backend.main import app as fastapi_app

async def app(scope, receive, send):
    # Ensure HTTP paths are prefixed with /api for our FastAPI routes
    if scope.get("type") == "http":
        path = scope.get("path", "") or ""
        if not path.startswith("/api"):
            scope = dict(scope)
            if path.startswith("/"):
                scope["path"] = "/api" + path
            else:
                scope["path"] = "/api/" + path
    return await fastapi_app(scope, receive, send)
