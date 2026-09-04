from pathlib import Path

from fastapi import APIRouter, FastAPI
from starlette.middleware.sessions import SessionMiddleware
from starlette.staticfiles import StaticFiles

from app.config import get_settings
from app.routers import (
    albums,
    announcements,
    auth,
    checkin,
    dashboard,
    directory,
    event_details,
    expenses,
    rsvps,
    scouted_venues,
    superadmin,
    survey_responses,
)
from app.storage import ensure_uploads_dir

settings = get_settings()

app = FastAPI(title="Knightsat20 Reunion Hub API")

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret,
    session_cookie="knightsat_session",
    same_site="lax",
    https_only=settings.is_production,
)

health_router = APIRouter()


@health_router.get("/api/health")
async def health_check():
    return {"status": "ok"}


app.include_router(health_router)
app.include_router(auth.router)
app.include_router(superadmin.router)
app.include_router(survey_responses.router)
app.include_router(rsvps.router)
app.include_router(announcements.router)
app.include_router(expenses.router)
app.include_router(event_details.router)
app.include_router(dashboard.router)
app.include_router(directory.router)
app.include_router(albums.router)
app.include_router(scouted_venues.router)
app.include_router(checkin.router)

# Photo Wall uploads — mounted before the SPA catch-all below so /uploads/*
# requests are served from disk rather than falling through to index.html.
ensure_uploads_dir()
app.mount("/uploads", StaticFiles(directory=settings.uploads_dir), name="uploads")

static_dir = Path(settings.static_dir)
if static_dir.is_dir():
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
