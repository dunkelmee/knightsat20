# MSHS Batch 2007 Reunion Hub

Planning and community portal for the Makati Science High School (MSHS) Batch 2007 reunion:
a planning survey, quick RSVP roster, announcements bulletin, a public operating-funds dashboard,
and a committee admin/treasury portal.

The app is a React + Vite frontend backed by a FastAPI + PostgreSQL API, both shipped in a single
Docker image. The whole site is gated behind a login: alumni register with their email, full name,
and mobile/WhatsApp number, then log in with a 6-digit code emailed to them (no passwords). The
admin/treasury portal is a separate, additional shared passcode unlocked from inside the app once
logged in.

## Run locally with Docker (recommended)

**Prerequisites:** Docker

```
docker compose up --build
```

This starts Postgres and the app (frontend + API in one container, migrations run automatically on
boot). The app is served at http://localhost:8123.

Set `ADMIN_PASSWORD` / `SESSION_SECRET` in a `.env` file (see `.env.example`) before running if you
want something other than the defaults. Without `RESEND_API_KEY` set, login/registration codes are
logged to the app container's console instead of emailed — handy for local testing
(`docker compose logs -f app`), but set a real key before anyone but you needs to log in.

## Run locally without Docker

**Prerequisites:** Node.js (or Bun), Python 3.12+, a local Postgres instance

Backend:
```
cd backend
pip install -r requirements.txt
cp ../.env.example .env   # adjust DATABASE_URL to point at your local Postgres
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Frontend (in a second terminal, from the repo root):
```
npm install
npm run dev
```
The Vite dev server proxies `/api/*` to `http://localhost:8000` automatically, so open
http://localhost:3000.

## Deploy on Railway

1. Create a new Railway project from this repository — Railway detects the root `Dockerfile`
   automatically (`railway.json` pins `builder: DOCKERFILE` and a `/api/health` healthcheck).
2. Add a **Postgres** plugin to the project and let Railway inject `DATABASE_URL` into the app
   service.
3. Set the app service's environment variables: `ADMIN_PASSWORD` (the committee's shared admin
   passcode), `SESSION_SECRET` (a long random string — e.g.
   `python -c "import secrets; print(secrets.token_hex(32))"`), and `RESEND_API_KEY` (create an
   account at [resend.com](https://resend.com) and generate an API key — required for
   login/registration codes to actually reach alumni; verify a sending domain and set
   `RESEND_FROM_EMAIL` to it for reliable delivery instead of the `onboarding@resend.dev` test
   sender).
4. Deploy. The container runs `alembic upgrade head` on boot, then serves both the API and the
   built frontend from one process — no separate frontend service or CORS config needed.

The database starts empty by default — real committee data only. The admin portal's
"Reset Demo Data" button (or `POST /api/admin/reset-demo-data`) loads the fictional demo fixtures
if you want to show the app populated before real responses come in.

## Project layout

- `src/` — React frontend
- `backend/` — FastAPI app, SQLAlchemy models, Alembic migrations
- `Dockerfile` — multi-stage build: Vite build → FastAPI runtime serving both
- `docker-compose.yml` — local dev stack (Postgres + app)
