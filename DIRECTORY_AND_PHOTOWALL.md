# Feature Spec — Directory & Photo Wall

Implementation brief for **MSHS Batch 2007 Reunion Hub** (React + Vite frontend, FastAPI + PostgreSQL,
single Docker image). Two new alumni-facing tabs plus mobile-layout optimizations to the existing tabs.
Follow the tokens in `DESIGN.md` ("Modern Nostalgia"); reuse existing auth, OTP session, and admin-passcode
patterns. Every new endpoint requires a logged-in alumni session; nothing here is public (the whole site is
already login-gated).

---

## 0. Mobile layout optimizations (existing tabs)

Apply before/alongside the new features. These change layout only — no new data.

- **Collapse the hero.** The current hero eats the full first viewport. Reduce it to ~40% height: keep the
  serif title, but render Date and Venue as two **side-by-side condensed pills** (icon + uppercase label +
  value) instead of stacked full-width bars. Move the descriptive paragraph below the CTA and truncate to two
  lines on mobile.
- **Responsive nav (bottom bar on mobile → header on desktop).** With five tabs (Survey, Board, Directory,
  Photos, Funds) the old pill row overflows a 393px screen, so the nav becomes breakpoint-dependent — see
  section 3 for the full spec. In short: a floating bottom tab bar on mobile with a raised gold active pill,
  and the same tabs relocated into the header between the title and avatar on desktop. Same `DESIGN.md` tokens
  in both.
- **Roster counts → stat cards.** On the Board tab, render "Attending alumni" and "Plus-ones & kids" as two
  side-by-side stat cards (small label, large serif number) rather than wide rows.
- **Consistent section rhythm.** Use 16px section padding, 12px gaps between cards, `--shadow` (0 4px 12px
  rgba(44,62,80,.06)) on every raised card. No change to survey step logic.

---

## 1. Directory

A browsable roster of the whole batch showing each person's **Then** (high school) and **Now** (recent) photo
plus what they're doing today. Reuses the profile data alumni already provide during one-time profile setup.

### 1.1 Data model

Most fields already exist on the alumni/profile record from registration + profile setup. Add what's missing.

```
alumni_profile (existing table — extend)
  id                uuid pk
  full_name         text            # existing
  email             text            # existing, NOT shown in directory
  mobile            text            # existing, NOT shown in directory
  then_photo_url    text null       # existing (profile setup "Then")
  now_photo_url     text null       # existing (profile setup "Now")
  # --- new, all optional, alumni-editable from Edit Profile ---
  current_city      text null       # e.g. "Makati" — free text
  current_role      text null       # e.g. "UX Director" — free text
  show_in_directory boolean default true   # privacy opt-out
  section_hs        text null       # optional HS section, e.g. "St. Ignatius"
```

Presence / attendance status is **derived**, not stored here — join to the existing RSVP roster:
- `attending`  → has an RSVP with attendance intent = yes/most-likely
- `missing`    → registered but no RSVP, OR flagged "missing" by committee (reuse existing missing/accounted-for
  status from the admin roster if present; otherwise treat "no account yet" as missing)
- `faculty`    → optional `is_faculty` flag on the profile (add boolean if you want the Faculty filter; default false)

### 1.2 Endpoints

```
GET /api/directory
  Query: ?q=<search>&filter=<all|attending|missing|faculty>&cursor=<opaque>&limit=24
  Auth: alumni session required
  Returns: {
    total: int,
    counts: { all, attending, missing, faculty },
    next_cursor: str | null,
    people: [{
      id, display_name, current_city, current_role, section_hs,
      then_photo_url, now_photo_url,
      status: "attending" | "missing" | "faculty",
      last_seen_city: str | null   # only when missing & no now photo
    }]
  }
  - Excludes anyone with show_in_directory = false.
  - Search matches display_name, current_city, current_role, section_hs (case-insensitive, trigram/ILIKE).
  - Keyset pagination on (full_name, id) for stable "Load more".

PATCH /api/profile/directory   # alumni edits their own directory fields
  Body: { current_city?, current_role?, section_hs?, show_in_directory? }
  Auth: alumni session; can only edit own record.
```

No new admin endpoint required, but surface `show_in_directory` and `current_city/role` in the existing
Edit-Profile modal so alumni can fill them in.

### 1.3 UI (mobile-first)

- **Header block:** serif H1 "The Batch of 2007", subtext "Reconnect with {total} batchmates. Search by name,
  section, or city."
- **Search field:** pill-shaped, `surface-container-high` background, magnifier icon, debounced 300ms → refetch.
- **Filter chips:** horizontally scrollable — All / Attending / Missing / Faculty, each with live count from
  `counts`. Active chip = `primary` fill, white text.
- **Card grid:** **1 column on mobile**, 2 on ≥600px, 3–4 on desktop (matches the Class-of-2004 desktop mock).
  Each card:
  - **Then/Now pair**: two squares side by side, 8px radius, 1px `washed-denim` @20% border (the "printed photo
    edge" from DESIGN.md). Apply `filter: sepia(.55) contrast(.95)` to the **Then** image via CSS. Small
    `THEN` / `NOW` tag chip bottom-left of each.
  - **Presence dot**: top-right of the pair — green = attending, desaturated red = missing (per Status Badges
    in DESIGN.md).
  - **Missing person**: `now_photo_url` null → render a placeholder tile (hanger/─ icon) labeled NOW, and show
    `Last seen in {last_seen_city}` in italic `outline` color instead of city·role.
  - **Name** in Source Serif 4 (600), **city · role** in Hanken Grotesk `body-md`/muted below.
- **Load more** button (keyset cursor). No infinite scroll — explicit button, matches existing app feel.
- **Empty/opt-out states:** if a search returns nothing → "No batchmates match '{q}'. Try a section or city."
  If someone has no Then/Now photos, show initials monogram tiles rather than broken images.

### 1.4 Privacy notes
- Never expose email or mobile in this endpoint (those stay in the admin-only roster).
- `show_in_directory=false` hides the person entirely and drops them from `counts`.

---

## 2. Photo Wall

Collaborative albums the whole batch fills before and during the reunion. Anyone logged in can create an album
and add photos to any album. Intended to be projected live on reunion day.

### 2.1 Data model

```
album
  id            uuid pk
  title         text not null
  description   text null
  created_by    uuid fk -> alumni_profile.id
  cover_photo_id uuid null fk -> photo.id   # defaults to most recent photo
  is_live_day   boolean default false       # flags the "Reunion Day" album for the live view
  created_at    timestamptz default now()

photo
  id            uuid pk
  album_id      uuid fk -> album.id (on delete cascade)
  uploaded_by   uuid fk -> alumni_profile.id
  storage_key   text not null               # object-storage path or local /uploads key
  thumb_key     text not null               # generated thumbnail
  width         int null
  height        int null
  caption       text null
  created_at    timestamptz default now()

# derived per album: photo_count, contributor_count (distinct uploaded_by)
```

**Storage:** reuse whatever the existing "Then/Now" profile-photo upload uses. If that writes to local disk in
the container, do the same under `/uploads/albums/{album_id}/{photo_id}`; if S3-compatible, keep that. Generate
a ~400px thumbnail on upload (Pillow) so the grid stays light on mobile data. Validate mime (jpeg/png/heic →
convert HEIC to jpeg), cap size (e.g. 15 MB), strip EXIF GPS.

### 2.2 Endpoints

```
GET  /api/albums
  Returns: [{ id, title, description, is_live_day, photo_count, contributor_count,
              cover_thumb_url, recent_thumb_urls[3], contributors[{initials}] }]
  Sorted: is_live_day first, then most-recently-active.

POST /api/albums
  Body: { title, description? }
  Auth: any alumni. Returns created album.

GET  /api/albums/{id}
  Returns: album meta + paginated photos
  Query: ?cursor=&limit=30
  photos: [{ id, thumb_url, full_url, caption, uploader_initials, created_at }]

POST /api/albums/{id}/photos          # multipart, one or many files
  Auth: any alumni. Server generates thumb, returns created photo records.

DELETE /api/albums/{id}/photos/{pid}  # uploader can delete own; admin can delete any
DELETE /api/albums/{id}               # creator or admin only; cascades photos
PATCH  /api/albums/{id}               # title/description/cover; creator or admin
```

Admin (committee passcode) can moderate: delete any album or photo, and toggle `is_live_day`. Add these to the
existing admin portal alongside Announcements/Ledger.

### 2.3 UI (mobile-first)

**Albums list (tab landing):**
- Header "Photo Wall" + subtext "Build albums together — shown live on reunion day." with a **+ Album** button
  top-right (opens a small create-album sheet: title + optional description).
- Album cards: a **mosaic cover** (1 large + 2 small thumbnails in a 2fr/1fr grid), then title, then a meta row:
  "{photo_count} photos · {contributor_count} contributors" on the left, overlapping contributor avatars
  (initials monograms, `washed-denim`) on the right.
- The `is_live_day` album shows a **"LIVE ON REUNION DAY"** badge (gold dot + `primary` text on `#fdf3e6`).

**Album detail:**
- Back link "← All albums", serif album title, "{n} photos · Anyone in the batch can add to this album."
- **Upload strip**: dashed `sunset-gold` border on `#fdf3e6`, camera icon, "Add your photos / Tap to upload from
  your phone · JPG/PNG/HEIC". Triggers the native file picker (`<input type=file multiple accept="image/*">`,
  `capture` allowed so phones can shoot directly). Show per-file upload progress; optimistic thumbnails.
- **Photo grid**: 3 columns on mobile, 3px gutters, square thumbnails, tap → lightweight lightbox (full image +
  caption + uploader initials + delete if own/admin).
- **FAB** (+) bottom-right as a shortcut to upload into the current album (or create an album from the list view).
- **Empty album:** "No photos yet. Be the first to add one." with the upload strip prominent. The Reunion-Day
  album can show "Opens on reunion day" until `is_live_day` uploads begin.

### 2.4 "Live on reunion day" view (optional, nice-to-have)
A read-only `/photos/live` route that auto-refreshes the `is_live_day` album as a full-bleed slideshow for
projecting at the venue. Poll `GET /api/albums/{id}?limit=30` every ~20s (or SSE) and cross-fade newest photos.

---

## 3. Navigation & routing

Order (all five, in this sequence): **Survey · Board · Directory · Photos · Funds**. `Directory` and `Photos`
are new. Build the nav as a **single `<AppNav>` component** driven by one array of tab definitions
(`{ key, label, icon, route }`) so the mobile and desktop presentations render from the same source of truth and
can't drift apart. The active tab is derived from the current route.

### 3.1 Responsive placement (one component, two layouts)

The nav changes *placement and shape* by breakpoint, not its contents. Prefer a **CSS container query** on the
app shell over a viewport media query, so the layout responds to the app's own width (this is what the click
dummy does and it keeps the component self-contained). Breakpoint: **≥ 700px = desktop**, below = mobile.

**Mobile (< 700px) — floating bottom tab bar**
- Fixed to the bottom of the viewport, inset ~12px from the left/right/bottom edges, `container-lowest` (white)
  background, 20px radius, 1px `outline-variant` border, soft ambient shadow (`0 6px 20px rgba(44,62,80,.16)`).
- Five equal items. The **active** item is a raised circle (~56px) filled with `sunset-gold`, white icon,
  translated up ~20px so it breaks above the bar's top edge, with a 4px `surface`-colored ring and its own
  shadow; its short uppercase label (`label-caps`) shows beneath in `primary`. **Inactive** items are icon-only
  in `outline` color with no visible label (label height collapses to 0).
- The scroll container needs `padding-bottom: ~96px` so content never hides behind the floating bar.
- The header on mobile carries only: logo + school name + `BATCH 2007` chip + avatar (no tab row).

**Desktop (≥ 700px) — tabs in the header, between title and avatar**
- The bottom bar is hidden; the same five tabs render inline in the header, positioned **after the brand/title
  block and before the avatar** (a flex spacer pushes them to the right, avatar sits at the far end).
- Each tab is an icon + label row; the **active** tab is a soft pill (`#fdf3e6` background, `primary` text),
  inactive tabs are `on-surface-variant` with a `container-low` hover. (An underline treatment is an acceptable
  alternative, but keep it consistent with the active-pill choice used elsewhere.)
- Directory and Photo-Wall grids widen on desktop: **3 columns**, `max-width: 1000px`, centered — matching the
  desktop directory mock.

Respect `prefers-reduced-motion` for the active-pill lift/transition, keep visible keyboard focus on every tab,
and mark up the nav as a real `<nav>` with `aria-current="page"` on the active tab.

### 3.2 Routing
- Frontend routes: `/directory`, `/photos`, `/photos/:albumId`, and optional `/photos/live`.
- Both tabs sit behind the existing alumni auth guard. No admin passcode needed to *view or contribute*; admin
  passcode only gates moderation/delete.

## 4. Migrations & seeding
- Alembic migration: extend `alumni_profile` (directory fields), create `album` and `photo` tables.
- Extend the existing **Reset Demo Data** fixture set: ~12 demo alumni with Then/Now photos, city, role, mixed
  attending/missing status; 3 demo albums ("Throwback: HS Days", "Batch Trips", "Reunion Day — Live") with a
  handful of demo photos and one flagged `is_live_day=true`.

## 5. Acceptance checklist
- [ ] Nav renders from one shared tab array: floating bottom bar with raised gold active pill on a 360px
      viewport, and the same tabs inline in the header (between title and avatar) at ≥700px — no overflow either way.
- [ ] Directory: search, three filters with live counts, Then(sepia)/Now cards, presence dots, missing-person
      placeholder, keyset "Load more", email/mobile never exposed, opt-out hides the person.
- [ ] Edit Profile lets alumni set city/role/section and toggle directory visibility.
- [ ] Photo Wall: create album, multi-upload (incl. from phone camera), thumbnails generated, 3-col grid,
      lightbox, delete own photo, admin delete any, contributor counts correct.
- [ ] `is_live_day` album surfaces first and carries the live badge.
- [ ] All new endpoints reject unauthenticated requests; moderation endpoints reject non-admin.
