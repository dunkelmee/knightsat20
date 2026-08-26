from pathlib import Path

from fastapi import APIRouter, FastAPI
from starlette.middleware.sessions import SessionMiddleware
from starlette.staticfiles import StaticFiles

from app.config import get_settings
from app.routers import (
    admin_auth,
    announcements,
    dashboard,
    event_details,
    expenses,
    rsvps,
    survey_responses,
)

settings = get_settings()

app = FastAPI(title="Knightsat20 Reunion Hub API")

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret,
    session_cookie="knightsat_admin_session",
    same_site="lax",
    https_only=settings.is_production,
)

health_router = APIRouter()


@health_router.get("/api/health")
async def health_check():
    return {"status": "ok"}


app.include_router(health_router)
app.include_router(admin_auth.router)
app.include_router(survey_responses.router)
app.include_router(rsvps.router)
app.include_router(announcements.router)
app.include_router(expenses.router)
app.include_router(event_details.router)
app.include_router(dashboard.router)

static_dir = Path(settings.static_dir)
if static_dir.is_dir():
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
