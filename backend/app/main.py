import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.tasks import router as tasks_router
from app.config import load_env, redact_secrets
from app.log_redaction import install_secret_redaction

load_env()
install_secret_redaction()

app = FastAPI(title="Multi-Agent Task Force API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv("FRONTEND_ORIGIN", "http://localhost:3000").split(",")
        if origin.strip()
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks_router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/health/db")
def health_db():
    try:
        from app.db.supabase_client import get_supabase

        supabase = get_supabase()
        supabase.table("tasks").select("id").limit(1).execute()
        return {"db": "ok"}
    except Exception as exc:
        message = str(exc).strip() or type(exc).__name__
        return JSONResponse(
            status_code=503,
            content={"db": "error", "detail": redact_secrets(message)},
        )
