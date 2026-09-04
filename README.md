# MSHS Batch 2007 Reunion Hub

Planning and community portal for the Makati Science High School (MSHS) Batch 2007 reunion:
a planning survey, quick RSVP roster, announcements bulletin, a public operating-funds dashboard,
and a committee admin/treasury portal.

The app is a React + Vite frontend backed by a FastAPI + PostgreSQL API, both shipped in a single
Docker image. The whole site is gated behind a login: alumni register with their email, full name,
mobile/WhatsApp number, and a shared batch invite code, then log in with a 6-digit code emailed to
them (no passwords).
Organizer access to the admin/treasury portal is a permanent, per-account flag — every new account
is a plain attendee, and only the superadmin can grant/revoke organizer access (see "Roles" below).

## Features

### For alumni

- **Email-OTP login** — register with email, full name, mobile/WhatsApp number, and a batch invite
  code (shared in the reunion group chat, see `INVITE_CODE` below); log in with a 6-digit code
  emailed to you, no password to remember.
- **One-time profile setup** — confirm your name/mobile and optionally upload "Then" (high school)
  and "Now" (recent) photos, shown once right after your first login.
- **Survey** — a 3-step form covering attendance intent, preferred month/venue type, willingness to
  help organize (with skills offered), pledge amount, other sponsorships, plus-ones/kids count, and
  free-text suggestions. Submitting can auto-create or update your RSVP.
- **Batch Board** — announcements (filterable by tag, likeable, shareable, with pinned posts) plus a
  live attendee roster you can search/filter and a self-service "Express RSVP" form.
- **Directory** — search and filter batchmates by RSVP status or by their 1st–4th year section, with
  Then & Now photos where available.
- **Photo Wall** — browse shared photo albums and contribute your own, including one flagged "live
  on reunion day" for photos posted during the event.
- **Operating Funds & Ledger** — a public transparency dashboard showing total pledges, planned
  expenses, running balance, headcount estimates, and the itemized expense list. No personal data
  shown.
- **Edit profile** anytime from the header — update your contact info, Then & Now photos, and
  1st–4th year sections — plus logout.

### For organizers

Reachable once the superadmin has granted an account organizer access (see "Roles" below) — no
separate passcode, it's just part of your normal alumni login from then on. The organizer portal
adds:

- **Event Planning** — update the event status, date, and venue shown to everyone, and maintain a
  committee-internal scouted-venues shortlist (name, tentative date, address, quoted cost, notes).
- **Surveys** — view every response including contact details, delete a response, and mark pledges
  as paid.
- **Ledger & Expenses** — add, edit, and delete the planned expenses that feed the public funds
  dashboard.
- **Announcements** — create, edit, delete, and pin/unpin posts on the Batch Board.
- **RSVP Roster (organizer view)** — the full roster including contact info, not just the public counts.
- **Photo Wall moderation** — delete any album/photo, and toggle the "live on reunion day" album.

### Roles

- **Attendee** — every registered alumnus, by default.
- **Organizer** — an attendee the superadmin has granted organizer access. Toggle it from the
  header's account menu ("To organizer view" / "To attendee view") once granted.
- **Superadmin** — a single, env-configured identity (`SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD`),
  not an alumni account. Log in through the same login form — submitting the superadmin email swaps
  the OTP step for a password prompt. From their own portal the superadmin can view survey
  responses, see every registered user and when they signed up, grant/revoke organizer access, and
  read a human-readable log of actions taken across the app.

## Run locally with Docker (recommended)

**Prerequisites:** Docker

```
docker compose up --build
```

This starts Postgres and the app (frontend + API in one container, migrations run automatically on
boot). The app is served at http://localhost:8123.

Set `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` / `SESSION_SECRET` / `INVITE_CODE` in a `.env` file
(see `.env.example`) before running if you want something other than the defaults — `INVITE_CODE` is
the shared secret alumni must enter to register (leave it blank to disable the check, not
recommended once real people are registering). Without `RESEND_API_KEY` set, login/registration
codes are logged to the app container's console instead of emailed — handy for local testing
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
3. Set the app service's environment variables: `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` (the
   single superadmin identity — see "Roles" above), `SESSION_SECRET` (a long random string — e.g.
   `python -c "import secrets; print(secrets.token_hex(32))"`), `RESEND_API_KEY` (create an
   account at [resend.com](https://resend.com) and generate an API key — required for
   login/registration codes to actually reach alumni; verify a sending domain and set
   `RESEND_FROM_EMAIL` to it for reliable delivery instead of the `onboarding@resend.dev` test
   sender), and `INVITE_CODE` (the shared secret alumni enter to register — share it via the
   batch's group chat; leave unset and registration stays open to anyone, not recommended).
4. Deploy. The container runs `alembic upgrade head` on boot, then serves both the API and the
   built frontend from one process — no separate frontend service or CORS config needed.

The database starts empty by default — real committee data only.

## Project layout

- `src/` — React frontend
- `backend/` — FastAPI app, SQLAlchemy models, Alembic migrations
- `Dockerfile` — multi-stage build: Vite build → FastAPI runtime serving both
- `docker-compose.yml` — local dev stack (Postgres + app)
