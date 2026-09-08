# MSHS Batch 2007 Reunion Hub — Application Reference

This document is an exhaustive, element-by-element reference for every screen in the app, organized
by the three user roles: **Attendee**, **Organizer**, and **Superadmin**. It describes what exists in
the current codebase — every tab, card, button, form field, filter, empty state, and status color —
not how to use the app or why it's built the way it is. See `README.md` for setup/deploy instructions
and a higher-level feature summary.

## Roles at a glance

| Role | Who | How it's reached | Portal |
|---|---|---|---|
| **Attendee** | Every registered alumnus, by default | Normal email + OTP login | Header + 5 tabs: Batch Board, Survey, Directory, Photos, Funds |
| **Organizer** | An attendee the superadmin has granted admin access | Same login, then "To organizer view" in the header's avatar menu | Same header shell, 5 tabs replace the attendee tabs: Event, Surveys, Ledger, Bulletin, RSVP |
| **Superadmin** | A single, env-configured identity (`SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD`), not an alumni account | Same login form, but the superadmin's email swaps the OTP step for a password prompt | A fully separate portal (`SuperadminPortal`) with 3 tabs: Surveys, Users, Activity Log — never shows the attendee/organizer app at all |

---

# 1. Attendee Role

Covers every screen a logged-in, non-organizer, non-superadmin user ("attendee") can reach.

## 1.1 Shared Chrome

### Authentication (`AuthGate.tsx`)

The entire site is gated behind login. `AuthGate` has four internal modes, all sharing one card
layout: a centered logo badge, the heading "Makati Science High School", subtitle "Batch 2007
Reunion Hub — sign in to continue", and a bordered form card.

**Login mode (default)**
- Single field: Email address (mail icon prefix).
- Button: "Send login code" (relabels "Sending…" while submitting).
- Footer link: "New here? Create an account" → switches to register mode.
- On submit, three possible outcomes: routes to the superadmin password step if the email matches
  the superadmin identity; shows an "account not found" message and switches to register mode; or
  succeeds and moves to the OTP verify step with a 60-second resend cooldown.

**Register mode**
- Optional green info banner carried over from a failed login attempt (e.g. "no account found").
- Fields: Email address, Full name (placeholder "e.g. Juan dela Cruz (IV-Curie)"), Mobile/WhatsApp
  number (placeholder "e.g. 09171234567"), **Invite code** (placeholder "From the batch Messenger
  group") — a shared secret alumni must obtain from the batch group chat; all four fields required.
- Button: "Create account" (relabels "Sending…").
- Footer link: "Already registered? Log in".
- On submit, moves to the OTP verify step (same 60s cooldown), unless the email matches the
  superadmin identity, in which case it routes to the superadmin password step instead.

**Verify (OTP) mode**
- Heading "Enter your code"; subtitle shows a server message or "We sent a 6-digit code to {email}".
- Six individual single-digit inputs, numeric keypad, auto-advancing focus, backspace moves back,
  and paste support splits a pasted code across all six boxes.
- Button: "Verify & Continue" (relabels "Verifying…").
- "Use a different email" (returns to login) and "Resend code" (disabled during the 60s cooldown,
  shows "Resend in {n}s").

**Superadmin-password mode** — never seen by a normal attendee unless they type the superadmin's
email; see §3.2 for details.

Errors from any step render as small red text below the relevant form.

### One-Time Profile Setup (`ProfileSetup.tsx`)

Shown immediately after first successful login/registration, before anything else is reachable.
Same visual shell as the login screen. Heading "Complete Your Profile", subtitle "One-time setup —
confirm your details and add a 'Then & Now' photo for the batch."

- **Full name** (pre-filled from registration).
- **Mobile / WhatsApp number** (pre-filled).
- **Then & Now photos (optional)** — two photo-upload tiles side by side: "Then (Batch 2007)"
  (hint "Upload a high school photo", applies a sepia/desaturated filter to the preview) and "Now
  (Today)" (hint "Upload a recent photo", no filter). Caption: "Photos upload automatically as soon
  as you pick them. You can add these later too."
- Validation: full name and mobile number both required.
- Submit button: "Save & Continue" (relabels "Saving…"). On success, enters the main app.

### Photo Upload Tile (`PhotoTile.tsx`)

Reusable square upload control used in Profile Setup, Edit Profile, and (a local variant) the
Directory tab.
- Label above (e.g. "Then (Batch 2007)").
- Square button: empty state shows an upload icon + hint text; once a photo exists (or a local
  preview is active) it shows the image, with the sepia filter applied when configured for the
  "Then" slot.
- Clicking opens a native file picker (`accept="image/*"`).
- Client-side guard: source file must be ≤ 15MB ("File too large (max 15MB)."); the file is resized
  client-side before upload.
- While uploading, a spinner overlay covers the tile.
- Once a photo is set, a small "Remove" link appears below the tile.
- Errors ("Upload failed. Please try again." / "Could not remove photo.") render as small centered
  red text under the tile.

### Header (`Header.tsx`)

Sticky top bar, backdrop-blurred, bottom border.
- **Brand block** (left): small primary-colored logo square + two-line text — "Makati Science High
  School '07 Reunion" and a pill badge "Knights @ 20" below it. Clicking navigates to the Survey tab.
- **Desktop nav** (hidden below the 700px container-query breakpoint): pill-style tab buttons for
  the five attendee tabs, rendered between the brand and the avatar.
- **Profile avatar & menu** (right, always visible):
  - Circular avatar: the user's "Now" photo if set, else their initials on a primary-container
    background. A small shield badge overlays the avatar when the organizer view is currently active.
  - Clicking toggles a dropdown (closes on outside click): header block with full name + email;
    **"Edit Profile"** (opens the Edit Profile modal); **"To organizer view"** (only shown if the
    account has organizer access — a plain attendee never sees this item); **"Log out"** (red text,
    separated by a divider).

### Hero / Pending Banner (`PendingBanner.tsx`)

Rendered only above the Batch Board tab, never on the other four tabs. Two-column layout on
desktop (text + a large "taped" photo on the right); compact single-column on mobile with a small
taped snapshot inline next to the headline.

- **Headline**: two-line serif display — "Dalawang dekada na," / italic "musta na u?"
- **Finalized badge**: a green "✓ Finalized" pill appears under the headline only when the event
  status is Finalized. No badge shows while Pending.
- **Description text**, status-dependent:
  - Finalized: "The official date and venue have been confirmed by the committee. Please submit
    your RSVP and pledge."
  - Pending: "Please share your preferred schedule, venue style, and batch fund pledge so we can
    finalize arrangements."
- **Photo**: a rotated, "taped" polaroid-style photo of the school courtyard — small inline on
  mobile, large standalone on desktop's right column.
- **Date / Venue / Time pills**, each icon + uppercase micro-label + value:
  - **Date** — the event date, or "Pending / For finalization" if unset.
  - **Venue** — the venue, or "Pending / For finalization" if unset.
  - **Time** — only shown once the event is Finalized *and* a time is set; never shown while Pending.
- **CTA button**: "Submit RSVP / Pledge" when Finalized, "Answer Survey" when Pending — navigates to
  the Survey tab and scrolls to the form.
- **Stats line**: "{N} responses • {formatted pledge total} pledged".

### Navigation Tabs (`AppNav.tsx`)

The five attendee tabs, in order:

1. **Batch Board** — grid icon
2. **Survey** — clipboard icon
3. **Directory** — people icon
4. **Photos** — image icon
5. **Funds** — bar-chart icon

Both the desktop nav (inline header pills) and the mobile nav (floating bottom bar) render from the
same tab list, so labels/icons/order can never drift apart between the two layouts.

- **Desktop nav**: horizontal pill row; active tab highlighted with a filled background.
- **Mobile nav**: a floating rounded bar fixed to the bottom of the viewport. The active tab's icon
  enlarges, lifts up, and sits inside a filled circular badge with its label visible below it;
  inactive tabs show a plain outlined icon with no visible label.

When a user with organizer access switches into the organizer view, the six organizer tabs (see §2)
fully replace these five in both nav components — never shown together.

### Edit Profile Modal (`ProfileEditModal.tsx`)

A centered modal, opened from the header avatar menu. Title "Edit Profile".

1. **Full name**
2. **Mobile / WhatsApp number**
3. **Then & Now photos (optional)** — same two photo tiles as onboarding. Caption: "Photos upload
   and resize automatically as soon as you pick them. Your 'Now' photo is also used as your profile
   avatar."
4. A **"Directory listing"** section:
   - **City** (placeholder "e.g. Makati")
   - **"What are you currently up to?"** (placeholder "e.g. UX Director, married with 2 kids")
   - **"High school section (optional)"** — a 2×2 grid of four dropdowns, one per year level, each
     defaulting to "Not set":
     - **1st Year**: Archimedes, Copernicus, Galileo, Pascal
     - **2nd Year**: Darwin, Hooke, Mendel, Pasteur
     - **3rd Year**: Becquerel, Lavoisier, Roentgen, Rutherford
     - **4th Year**: Einstein, Faraday, Fermin, Newton
   - **"Show me in the Directory"** checkbox — unchecking removes the user from the Directory tab.
5. Validation: full name and mobile number required.
6. Buttons: "Cancel" and "Save changes" (relabels "Saving…").

## 1.2 Batch Board Tab

A single scrolling page combining two sub-sections — **Announcements & Updates** and **Attendee
Roster & Guest List** — separated by a divider. The Pending/Finalized hero banner (§1.1) sits above
this tab only.

### Announcements & Updates

- Section header: "Announcements & Updates", with a horizontally scrollable row of tag filter chips
  on the right (shown only once at least one announcement exists): **All, Survey, Venue, Finance,
  Important, General**. The active chip is filled; others are outlined.
- Filtering is by exact tag match (case-insensitive), client-side.
- Sorting: pinned announcements always sort to the top; within each group, newest date first.
- **Empty state (no announcements at all)**: a megaphone icon badge, heading "No announcements
  yet", body "The organizing committee hasn't posted anything yet. Check back soon — updates on the
  date, venue, and finances will show up here first.", and a "Committee: Post an Update" button
  (only meaningful for a user who also has organizer access).
- **Empty state (filtered to zero)**: "No announcements tagged '{tag}' yet."
- **Card anatomy** (2-column grid desktop, 1-column mobile), two variants:
  - **With image**: a photo banner at top; a "PINNED" badge overlays the top-left when pinned; the
    tag overlays the bottom-right as a small dark pill. Below: title and caption.
  - **Without image**: a row at the top shows the tag as an outlined pill, plus a "Pinned" label
    with icon when pinned, followed by title and caption.
  - **Footer** (both variants): author name • date on the left; a **Like** button (filled heart,
    shows the like count) and a **Share** button (copies the page URL, briefly shows a checkmark
    confirmation) on the right.

### Attendee Roster & Guest List

Section header "Attendee Roster & Guest List", then a divider.

**Headcount stat strip** — 4 cards (2×2 mobile / 1×4 desktop):
1. **Attending Alumni** — count of RSVPs with status Attending.
2. **Plus-Ones & Kids** — sum of +1 companions plus total kids across attending RSVPs, prefixed "+".
3. **Total Headcount** — attending count + plus-ones + kids combined.
4. **Tentative (Maybe)** — count of RSVPs with status Maybe.

**"Express RSVP" collapsible quick form** — a card titled "Post a Quick Shoutout / Message (Quick
Form)", description "Want to leave a quick message or shoutout for the batch without the
10-question survey? Click here.", with a chevron toggle. Expanded, it reveals:
- **Attendance Status** (required) — 3-way choice: "Attending 🎉", "Maybe 🤔", "Can't join 😢".
- **Your Name** (required, placeholder "e.g. Juan dela Cruz (IV-Curie)").
- **Companions** — shown only when status is Attending: two steppers, "Adult (+1s)" and "Kids"
  (Minus / number / Plus, floor 0).
- **Message / Shoutout for Batch 2007** — optional 2-row textarea.
- Buttons: "Cancel" and "Save to Roster".
- On submit: if Attending, fires a confetti burst; on success shows an inline confirmation panel —
  green checkmark, "Thanks, {name}!", note that the shoutout was posted to the roster below, and a
  "Submit Another Message" button that resets the form.

**Live Roster card**:
- Header "Live Roster ({filtered count})". Once at least one RSVP exists, a toolbar appears:
  - **Search** (placeholder "Search batchmate…") — matches name or message text.
  - **Status filter chips**: All / Attending / Maybe.
- **Empty state (no RSVPs at all)**: "No batchmates on the roster yet", body "Be the first! Answer
  the survey or post a quick shoutout above to join the guest list.", and a "Post a Quick Shoutout"
  button that opens the Express RSVP form.
- **Empty state (filtered to zero)**: "No batchmates found matching your search or filter." or "No
  batchmates found matching '{query}'."
- **Card anatomy** (2-column grid desktop, 1-column mobile): name; if bringing a plus-one/kids, a
  small "+1 Adult Guest • N Kid(s)" line; a status badge ("✓ Attending" green, "⏳ Maybe"
  primary-tinted, "Can't Join" neutral); an italicized quoted message block if one was left; footer
  "MakSci Batch 2007" • submission date.
- **"View more" pagination**: only the first 6 matching entries show initially; a dashed button
  "View {N} more batchmate(s)" reveals the rest. Changing the search or status filter resets back
  to the 6-item preview.

## 1.3 Survey Tab

A single always-open, 3-step form (one response per user, upserted on resubmit). Header "Reunion
Planning Survey", subtitle "Help us choose the best date, venue style, and batch fund target."
Below it, a clickable 3-step switcher: **Attendance & Dates**, **Help & Skills**, **Pledges &
Guests** — jumping between steps is not gated to linear progression.

If the user has an existing response, all fields pre-fill from it.

**Step 1 — Attendance & Dates**
1. **"Can you attend?"** (required) — tagged "Auto-adds to Roster" (any answer here also
   creates/updates the roster entry). Four options: "Yes, definitely! 🎉", "Most likely, but still
   confirming 👍", "Not sure yet 🤔", "Unfortunately, I won't be able to attend ✈️". Choosing "Not
   sure yet" reveals "What would help you decide?" (free text).
2. **"Preferred Month (2027)"** — tagged "2027 Planning". Two toggleable, multi-select month
   buttons: **April**, **December**. Below: free-text "Other month / specific date suggestions".
3. **"Venue & Vibe"** — multi-select checkboxes: Hotel/function room in Makati or BGC, Private
   events place/Garden pavilion, Makati Science High School campus, Restaurant/Lounge with private
   area, Resort/Out-of-town day-tour, Other (reveals a specify field). Below: separate "Venue
   suggestions" free-text field.
- "Next" advances to Step 2.

**Step 2 — Help & Skills**
4. **"Volunteer & Organizing"** — single-select: "Yes, happy to help!", "Maybe, depending on
   tasks", "Can help occasionally", "Prefer to just attend & relax".
5. **"Skills to Share"** — multi-select tiles: Program/Host/Emcee, Photo/Video & Slideshow,
   Graphics/Merch & ID Design, Treasury & Registration, Food/Catering & Drinks, Venue & Ingress
   Setup, Music/DJ & Entertainment, Reaching Out to Batchmates, Other (reveals a specify field), and
   a full-width "Prefer to just attend & relax" option that clears all other selections when chosen
   (mutually exclusive). Below: optional "Notes on what you can help with".
6. **"Recommend an Event Organizer / Coordination Company"** (optional) — a single free-text field
   for suggesting a professional, non-batch event organizer.
- "Back" and "Next" buttons.

**Step 3 — Pledges & Guests**
7. **"Financial Pledge"** — tagged "Operating Fund", note "Minimum contribution is ₱2,000." Five
   tiered tile options: ₱2,000 ("Standard (Min)"), ₱3,000 ("Recommended", the default), ₱5,000
   ("Silver"), ₱10,000+ ("Gold / Patron"), Custom Amount ("Min. ₱2,000"). Choosing Custom
   Amount/Other/₱10,000+ reveals a numeric field with live validation:
   - Below ₱2,000: red warning "⚠️ The minimum pledge amount is ₱2,000. Please enter ₱2,000 or
     higher."
   - ₱2,000 or above: green "✓ Valid pledge: {amount}".
   - A dark bar always shows "Total pledge recorded: {max(2000, computed pledge)}".
   - **In-Kind Sponsorships** (same card, multi-select tiles): Lechon/Main Dish, Craft
     Beers/Alcoholic Drinks, Dessert/Cake/Grazing table, Raffle Prizes/Gift Bags,
     Photobooth/Photography, Batch Souvenirs/Shirts, Other (reveals specify field), and a
     full-width "None for now" that clears other selections when chosen. Below: optional details
     textarea.
8. **"Companions (0 if none)"** — two numeric steppers, "Adult Guests (+1s)" and "Kids" (min 0,
   max 10, editable number field between Minus/Plus).
9. **"Ideas or Suggestions"** — free-text textarea.
- Bottom bar: live computed pledge total on the left, "Back" button, "Submit Survey" button.
- Validation: a Custom/Other pledge below ₱2,000 (or empty) blocks submission with the same
  minimum-pledge message shown inline.
- **On success**: the whole tab swaps to a confirmation screen — green checkmark, "Thank you,
  {name}!", confirmation text noting the response and pledge were recorded and the user was
  automatically added to the public Attendee Roster; if a pledge was made, a highlighted "Pledged
  Batch Fund: {amount}" chip; two buttons — "View Attendee Roster" (goes to Batch Board) and "Edit
  My Response" (returns to Step 1 with answers intact, since it's an upsert).

## 1.4 Directory Tab

Header "The Batch of 2007", subtitle "Reconnect with {total} batchmate(s). Search by name, section,
or city."

- **Search bar**: pill input, placeholder "Find a batchmate…"; debounced before refetching.
- **Status filter chips** (horizontally scrollable, each shows a live count): **All**, **Attending**,
  **Tentative**, **Faculty**.
- **"Filter by section" button**: opens a bottom sheet; shows a badge with the active filter count.
  - **Filter sheet**: title "Filter by section"; four groups, one per year level, using the same
    section options as Edit Profile (1st: Archimedes/Copernicus/Galileo/Pascal; 2nd:
    Darwin/Hooke/Mendel/Pasteur; 3rd: Becquerel/Lavoisier/Roentgen/Rutherford; 4th:
    Einstein/Faraday/Fermin/Newton). Each option is a toggle pill (single-select per year, click
    again to deselect). Bottom buttons: "Clear all" and "Show results".
- **Loading state**: a grid of 9 pulsing skeleton cards.
- **Empty state**: heading "No batchmates match '{query}'" (when searching) or "No batchmates
  found" (otherwise); body "Try a section or city instead." or "Try a different filter."
- **Card anatomy** (1 col mobile / 2 col tablet / 3 col desktop):
  - Two side-by-side square photo tiles, "THEN" and "NOW". The Then tile applies the sepia filter;
    if no Then photo, shows the person's initials instead. The Now tile, if empty, shows a
    circle-slash icon.
  - A colored status dot overlays the top-right corner: green = attending, purple/tertiary =
    faculty, red = tentative.
  - Name below the photos.
  - Secondary line: if tentative and no Now photo, shows "last seen" info (a city if known, else
    italic "Last seen — unknown", plus their current role if set); otherwise shows city and current
    role, whichever are filled in.
  - Section tags: small pills for every year-section the person has filled in (e.g. "1st:
    Archimedes").
- **"Load more batchmates"** pagination button, shown only when more results exist; label becomes
  "Loading…" while fetching.

## 1.5 Photos Tab (Photo Wall)

### Album grid

Header "Photo Wall", subtitle "Build albums together — shown live on reunion day." A "+ Album"
button opens the Create Album modal.

- **Loading state**: "Loading albums…"
- **Empty state**: "No albums yet", "Start the first one for the batch to fill together.", and a
  "+ Create an Album" button.
- **Card anatomy** (1/2/3-column grid): a collage header (the most recent photo large on the left,
  two more recent thumbnails stacked on the right, or a placeholder icon if the album is empty); a
  "LIVE ON REUNION DAY" pulsing-dot badge shown only when the album is flagged live-day; the album
  title; a meta line "{photoCount} photos · {contributorCount} contributor(s)"; overlapping
  contributor-initial avatars with a "+N" overflow badge. Clicking a card opens its detail view.
- **Delete album** (trash icon, bottom-right of the card) — shown only to an organizer, and only on
  an album with zero photos. Confirms via a browser dialog (`Delete the empty album "{title}"? This
  can't be undone.`) before deleting. Albums are collaborative, so there is deliberately no way to
  delete one that has photos in it from the UI — that would be discarding other people's uploads.

### Create Album Modal

Title "New Album".
- **Title** (required — "Give the album a title." if blank), placeholder "e.g. Batch Trips &
  Reunions".
- **Description** (optional, 2-row textarea).
- Buttons: "Cancel" and "Create Album" (relabels "Creating…"). On success, opens the new (empty)
  album immediately.

### Album Detail

- "All albums" back link at top.
- Album title + "{photoCount} photo(s) · Anyone in the batch can add to this album."
- **"Add your photos"** dashed upload button: "Tap to upload from your phone · JPG/PNG/HEIC" —
  opens a native multi-file picker; deliberately not restricted to the camera, so it opens the
  gallery picker on mobile. Photos are resized client-side before upload. Button label becomes
  "Uploading…" while in flight; a processing failure shows "Couldn't process one or more photos.
  Try a JPG or PNG instead."
- A floating circular "+" button offers the same upload shortcut while scrolling.
- **Empty state**: if the album is flagged live-day and has no photos, "Opens on reunion day" (no
  secondary text); otherwise "No photos yet", "Be the first to add one."
- **Photo grid**: 3-column grid of square thumbnails; clicking one opens the lightbox.
- **"Load more photos"** pagination button when more exist.

### Lightbox

Full-screen dark overlay (click the background to close).
- Large centered image with a close (X) button overlaying its top-right corner.
- Below the image: the uploader's initials badge, plus the photo's caption or italic "No caption".
- **Delete button** — shown only when the viewer is either an organizer or the original uploader of
  that specific photo; a plain attendee only sees it on their own uploads.

## 1.6 Funds Tab

Header "Operating Funds & Ledger". A fully read-only, transparency-focused view for attendees — no
edit controls appear here (those live in the separate organizer Ledger tab, §2.3). The component
renders two entirely separate layout trees gated by breakpoint (mobile/tablet vs. desktop), rather
than one responsive layout.

Figures used throughout: **Total Pledges** (server-aggregated, no personal data attached);
**Total Expenses** (sum of every logged expense amount); **Net Running Balance** (pledges minus
expenses).

### Mobile / tablet layout

1. **Hero net balance card** — a full-width dark card (switches to solid red if the balance is
   negative). Shows "Net Running Balance", a large formatted figure, and a caption — "Projected
   budget surplus" if non-negative, "Pledges needed for full budget" if negative.
2. **Mini stat pair** — two small side-by-side cards: "Pledges" (primary-colored figure) and
   "Expenses" (neutral figure).
3. **Segmented control** (3 tabs, one always active): **Ledger**, **Preferences**, **Schedule** —
   only one panel is shown at a time.
   - **Ledger panel**: header "Budget Ledger" + item count. Empty state: a piggy-bank icon, "No
     budget line-items yet", "The committee hasn't logged any planned expenses yet. Once budget
     items are added, they'll show up here." Otherwise, a stack of expense cards: item name,
     optional notes, a category pill, the formatted amount, and a status pill (green "Paid",
     primary-tinted "Committed", neutral for anything else, e.g. "Planned").
   - **Preferences panel**: stacks the Preferred Months and Preferred Venue Types cards (below).
   - **Schedule panel**: shows the Official Schedule Status card (below) if the event has been
     configured; otherwise a plain "Schedule details haven't been announced yet." message.

### Desktop layout

1. **Three metric cards**, side by side:
   - **Total Pledges** — formatted figure in primary color, caption "From {N} alumni responses".
   - **Planned Expenses** — formatted figure, caption "Across {N} budget items".
   - **Net Running Balance** — formatted figure, green if non-negative or red if negative, same two
     possible captions as the mobile hero card.
2. **Breakdown grid**:
   - **Left — Budget Ledger table**: header "Budget Ledger" + item count. Same empty state wording
     as mobile. Otherwise a full table: **Item** (name + notes), **Category** (pill), **Estimated**
     (right-aligned amount), **Status** (right-aligned colored pill, same coloring as mobile). Rows
     alternate subtle shading.
   - **Right — stacked insight cards**: Preferred Months, Preferred Venue Types, and Official
     Schedule Status, all three shown together (unlike mobile's tabs).

### Shared cards (identical on both layouts)

- **Preferred Months card** — "Preferred Months (Survey Q3)": a bar list of the top 6 most-voted
  months, each row showing the month, "{count} votes ({pct}%)", and a primary-colored progress bar.
  Empty state: "No votes yet — month preferences will appear once alumni start answering the
  survey."
- **Preferred Venue Types card** — "Preferred Venue Types (Survey Q4)": same bar-list treatment,
  bars colored secondary. Same-style empty state for venue preferences.
- **Official Schedule Status card** — a status pill reading "✓ Finalized" (green) or "⏳ Pending /
  Planning" (primary-tinted). Below it, a detail box listing Date, Venue, and — only when Finalized
  with a time set — Time, and — only if set — Attire. The card is entirely absent if the event
  hasn't been configured at all, which is what triggers the mobile Schedule panel's plain fallback
  message.

---

# 2. Organizer Role

A regular alumni account the superadmin has granted admin/treasury access to — reachable via "To
organizer view" in the header's avatar menu (see §1.1). There is no separate passcode; it's a
permanent per-account flag.

## 2.1 Accessing the Organizer View

Toggling "To organizer view" swaps the active tab to the organizer portal; toggling back returns to
whichever attendee tab was last active. When the organizer view is active, the five organizer tabs
fully replace the five attendee tabs in both the desktop header nav and the mobile bottom bar — they
are never shown together. If an account without organizer access somehow reaches this state, a
plain "You don't have organizer access." message is shown instead.

The organizer portal itself has no shared shell beyond a centered container — it's a pure router
that renders exactly one of five tab components based on the selected tab.

The five organizer tabs. There is deliberately no Photo Wall tab: albums are collaborative, so they
are moderated from the attendee Photos tab (§1.5) rather than from a separate back office.

The nav label is deliberately terser than the hero title, because one label
serves both the desktop pill row and the mobile bottom bar, where they share
a phone width at the 8px `nav` step (see TYPOGRAPHY_SYSTEM.md §11).

| Tab | Nav label | Hero title |
|---|---|---|
| `event` | Event | Event Planning |
| `responses` | Surveys | Survey Responses |
| `funds` | Ledger | Operating Ledger |
| `announcements` | Bulletin | Announcements |
| `rsvp` | RSVP | RSVP Roster |

## 2.2 Event Planning Tab

### Overview banner

Title "Event Schedule & Venue Settings" with a status badge — green "✓ Finalized" or amber "⏳
Pending / Planning". Subtext: "Update date, venue, time, and address. Changes reflect immediately on
the public banner and event pages." A **"Reset to Pending"** button resets the in-progress form
fields (date, venue, address, time) back to their default "pending" placeholder values — this only
affects the form, not the saved event, until "Save Event Details" is clicked.

### Live preview

A "Live Public Banner Preview" strip showing the in-progress form values as pill chips (Date, Venue,
and Time when Finalized) — a live reflection of unsaved edits, not the saved server state.

### Main settings form

Submit button: "Save Event Details".
- **Event Status** (required radio): "Pending / Survey Phase" ("Date & venue still being decided")
  or "Finalized & Confirmed" ("Contract signed / fixed date & venue").
- **Event Date** (required text, placeholder "e.g. Saturday, December 5, 2026 or Pending / For
  finalization") — an empty value falls back to "Pending / For finalization" on save.
- **Event Time & Duration** (optional, placeholder "e.g. 5:30 PM - 10:30 PM").
- **Venue Name** (required text, placeholder "e.g. Grand Ballroom, Dusit Thani Manila or Pending /
  For finalization") — falls back the same way if left blank.
- **Venue Address / Area** (optional, placeholder "e.g. Ayala Center, Makati City").
- **Dress Code / Attire** (optional, placeholder "e.g. Smart Casual / Semi-Formal").
- **Reunion Theme / Catchphrase** (optional, placeholder "e.g. MakSci Batch 2007: 20 Years After").
- **Committee Notes / Special Instructions** (optional, 2-row textarea).
- On save, a green "Saved successfully! Updated across the site." confirmation appears next to the
  button and auto-hides after 3 seconds. No inline validation error beyond native browser
  "required" enforcement.

### Scouted Venues shortlist (committee-internal)

Card titled "Scouted Venues (N)" with an "Add Venue" button opening the Add/Edit Venue modal. This
list is explicitly marked "not shown to attendees."
- **Empty state**: "No scouted venues yet. Add one to start building the shortlist."
- **Card anatomy** (1/2-column grid): venue name; Edit button (opens the modal pre-filled); Delete
  button (confirms via a browser dialog: `Remove "{name}" from the shortlist?`); tentative date if
  set; address if set; quoted cost if set (formatted, bold primary color); misc details if set.

### Add/Edit Venue Modal

Header "Add Scouted Venue" / "Edit Scouted Venue", subtitle repeating the "not shown to attendees"
note.
- **Name** (required — "Please provide a venue name." if blank), placeholder "e.g. Dusit Thani
  Manila (Grand Ballroom)".
- **Tentative Date** (optional, free-form text, placeholder "e.g. Saturday, April 24, 2027").
- **Quoted Cost (₱)** (optional, number ≥ 0, step 100) — if entered, must parse to a non-negative
  number ("Please provide a valid numeric quoted cost." otherwise).
- **Address** (optional).
- **Miscellaneous Details** (optional, 2-row textarea).
- Buttons: "Cancel" and "Save Changes" (edit) / "Add to Shortlist" (create).

## 2.3 Surveys Tab

### Top metric cards

1. **Total Submissions** — response count, caption "Batchmates responded".
2. **Total Pledges Extracted** — sum of computed pledge amounts, caption "{N} batchmates pledging".
3. **Pledges Collected** — sum of pledges marked Fully Paid, caption "Marked as Fully Paid".

### Action toolbar

- **Search** (placeholder "Search by name, contact, section, skill, venue...") — matches name,
  contact number, section, venue suggestion, or any offered skill.
- **Export Full CSV** — exports every response (ignores active filters).
- **Export Pledges & Ledger CSV** — exports responses plus expense data together.

### Filter chips

- **Attendance filter**: All Statuses / "Yes, definitely!" / "Most likely, but still confirming" /
  "Not sure yet" / Declined.
- **Pledges filter**: All Amounts / With Pledges (>₱0) / Fully Paid / Unpaid or Pledged / Zero /
  In-Kind only.
- A live counter: "Showing **N** of M responses." Filters and search combine with AND logic.

### Responses table (desktop) / card list (mobile)

Same data, two layouts. Columns/fields:
- **Batchmate** — name + section badge if set.
- **Contact** — number, plus email if present.
- **Attendance** — colored pill (green/gold/primary/red per answer); the declined option is
  display-shortened to "Cannot attend".
- **Pledge (Parsed PHP)** — formatted amount in primary color plus the selected tier and any custom
  amount, or "₱0" in muted color if none.
- **Payment Status** — a dropdown (Unpaid/Pledged, Partially Paid, Fully Paid), shown/editable only
  when the pledge is above ₱0; changing it saves immediately, no separate save step.
- **Skills / In-Kind** — the offered skills list (truncated with a full-list tooltip), plus any
  in-kind sponsorships in primary color below.
- **Actions** — an "Inspect Full Response" button (opens the detail modal) and a "Delete response"
  button (confirms via browser dialog before deleting).
- **Empty state**: "No survey responses match your filter criteria."

### Response Detail Modal

Header: full name + section badge + submission timestamp. Sections:
- **Contact info** — number and email.
- **Q2. Attendance** — the raw answer, plus a decision-factor note if given.
- **Q3. Preferred Date & Range** — preferred months as pill chips, plus specific-date notes if any.
- **Q4. Venue Preference** — preferred venue types joined together, plus a venue suggestion if any.
- **Q5. Pledge & Sponsorship** — the pledge amount (large, bold), the selected tier, any manual
  custom-amount entry, and any in-kind sponsorships as pill chips with details; includes the same
  editable Payment Status dropdown found in the table.
- **Q6. Skills & Services Offered** — pill chips plus free-text details.
- **Q7 / Q8** — side by side: willingness to organize (plus any nominated organizer), and
  companions (plus-one / kids count).
- **Q9. Other Suggestions** — free text, only shown if non-empty.
- Footer: "Close Inspector" button.

## 2.4 Ledger Tab

Labeled "Ledger" in the nav; internally titled "Planned Expenses Ledger" / "Operating Funds."

### 3 metric cards

1. **Total Pledges (Q5 Auto-Computed)** — sum across all responses; sub-row shows Paid vs. Pending
   split.
2. **Total Planned Expenses** — sum of all expense amounts, caption "{N} budgeted ledger items."
3. **Net Running Balance** — pledges minus expenses; the whole card flips to a dark "surplus" style
   when non-negative, or solid red "Budget Shortfall / Needs More Pledges" when negative.

### Expense management header

Title "Planned Expenses Ledger", subtext about adding supplier estimates/operating costs. Two
buttons: **Export Financial Ledger** (CSV) and **Add Planned Expense** (opens the modal).

### Expenses table (desktop) / card list (mobile)

Columns: expense name, category pill, amount (bold), target date or "TBD", status pill (green
Paid / gold Approved / secondary Quoted / gray Estimated), notes (truncated with tooltip, or "—"),
and Edit/Delete actions (delete confirms via browser dialog). A footer row totals the expenses and
shows the net balance. Mobile empty state: "No planned expenses yet."

### Category breakdown cards

One small card per category actually in use (not a fixed list of all possible categories), each
showing the category name, its summed amount, and its percentage of total expenses.

### Add/Edit Expense Modal

Header "Add Planned Expense Item" / "Edit Planned Expense".
- **Expense Name / Description** (required — "Please provide an expense item name." if blank).
- **Category** (select, defaults to "Venue & Banquet"): Venue & Banquet, Audio Visual & Lights,
  Souvenirs & T-Shirts, Photo & Video, Prizes & Tokens, Decorations & Program, Administrative &
  Misc.
- **Estimated Amount (₱)** (required, > 0 — "Please provide a valid numeric amount greater than
  0." otherwise).
- **Target Payment Date** (optional date picker).
- **Status** (select, defaults to "Estimated"): Estimated, Quoted, Approved, Paid.
- **Notes & Supplier Details** (optional, 2-row textarea).
- Buttons: "Cancel" and "Add Expense to Ledger" (create) / "Save Changes" (edit).

## 2.5 Announcements Tab

Section heading "Posts", subtext about publishing updates and photos. A right-aligned **"New
Post"** button opens the Add/Edit modal. The heading uses the same treatment as the Ledger tab's
Planned Expenses section — serif `title`, small icon, hairline rule — with the action in its own
row below.

### Announcements list

A 2-column (desktop) / 1-column (mobile) grid, no search/filter/sort controls — every announcement
is listed. Pinned announcements get a highlighted border. Each card shows: tag pill and, if pinned,
a "Pinned" pill; date (top-right); cover image if set; title and caption (clamped to 3 lines);
footer "Author: {name} • Likes: {count}". Actions: **Pin to Top / Unpin** toggle (applies
immediately, no confirmation), **Edit** (opens the modal pre-filled), **Delete** (confirms via
browser dialog).

### Add/Edit Announcement Modal

Header "Create Batch Announcement" / "Edit Announcement".
- **Title** (required).
- **Category Tag** (select, defaults to "General"): Important, Survey, Venue, Finance, General,
  Volunteer.
- **Author / Department** (optional; defaults to "Batch 2007 Core Committee" if left blank).
- **Caption & Body Content** (required, 4-row textarea).
- **Cover Image**: a live preview thumbnail (with a clear/"X" button); **Upload From Device** (≤
  4MB, stored as an embedded image with no separate server upload step for this path); a **paste
  image URL** field; four one-click preset images ("High School Alumni", "Venue & Celebration",
  "Finance & Transparency", "Dinner & Toast").
- **Pin Announcement to Top** — a checkbox in a highlighted row.
- Validation: Title and Caption both required.
- Buttons: "Cancel" and "Publish Announcement" (create) / "Save Announcement" (edit).

## 2.6 RSVP Roster Tab

The organizer's internal roster — distinct from the public roster shown on the attendee Batch
Board, since it includes full contact details. No search bar; the one filter control is the
committee/skill filter described below. This tab is primarily an aggregate dashboard plus a
volunteer directory, not a searchable table of individuals.

### 4 summary metric cards

1. **Confirmed Alumni** — count of Attending RSVPs, caption "Direct RSVPs".
2. **Companions (+1 & Kids)** — plus-ones and kids total, caption showing the split.
3. **Est. Total Headcount** — attending + plus-ones + kids combined.
4. **Survey Definite/Likely** — count of "Yes, definitely" plus "Most likely" survey responses.

### Attendance comparison grid

- **Left — Planning Survey Attendance Intent**: four horizontal progress bars (one per attendance
  answer) with counts and percentages.
- **Right — Dietary Requirements for Caterer**: a scrollable list of every RSVP with a stated
  dietary restriction, name + restriction pill. Empty state: "No special dietary restrictions
  specified yet."

### Volunteer Committee Formation Hub

Built from the survey's "skills offered" answers, grouped per skill/committee.
- **Committee filter** (select): "All Committees (N)" or an individual committee with its
  volunteer count.
- **Committee cards** (1/2/3-column grid): committee name, volunteer count badge, and a scrollable
  list of volunteers — name, contact number, and any notes they left, quoted.

No add/edit/delete controls exist on this tab — it's read-only aggregation of data submitted
elsewhere.

---

# 3. Superadmin Role

A single, env-configured identity (`SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD`) — not a row in the
users table, not an alumni account. The superadmin never sees the attendee/organizer app at all; it
is a completely separate, self-contained portal, with no "switch back to attendee view" toggle the
way the organizer role has.

## 3.1 Identity Model

Tracked in the app as a standalone flag, entirely separate from the normal logged-in-user state.
When active, the whole attendee/organizer component tree never mounts — the app renders the
superadmin portal instead, checked before anything else on load.

## 3.2 Login Flow

Uses the exact same login form as everyone else — no separate login page or URL.

- **Trigger**: on the normal login screen, submitting the superadmin's email (whether via "Send
  login code" or the registration form) is detected server-side and routes to a password step
  instead of OTP.
- **Superadmin-password screen**: a lock icon badge, heading "Superadmin password", the pending
  email shown beneath, a single centered password field, an inline error message on failure, a
  "Log in" button (relabels "Verifying…"), and a "Use a different email" link back to the normal
  login screen.
- No OTP step is ever involved for the superadmin — the password entirely replaces OTP verification
  for this one identity.

## 3.3 Session Bootstrap & Logout

On load, the app checks for both a normal session and a superadmin session in parallel — the two
are mutually exclusive. Logging out (a "Log out" button in the portal header) clears whichever
session is active and returns to the login screen.

## 3.4 Portal Shell

A self-contained page layout, structurally similar to the organizer portal but entirely separate.

- **Header**: a shield icon badge, title "Superadmin", subtitle "Batch 2007 Reunion Hub"; desktop
  nav for the three tabs (hidden on narrow viewports in favor of a floating mobile bottom bar,
  mirroring the pattern used elsewhere in the app); a "Log out" button always visible at the right.
- **Tabs** (Surveys is the default landing tab):
  1. **Surveys**
  2. **Users**
  3. **Activity Log**
- No footer is rendered in this portal (unlike the main attendee/organizer app shell).

## 3.5 Surveys Tab

Fetches all survey responses on mount (loading state: "Loading responses…"), then renders the
**same** Survey Responses component the organizer role uses (§2.3) — not a separate read-only
clone. The superadmin can delete responses and change payment status exactly as an organizer can.
One difference: expense data is not fetched or shown anywhere in this portal, so the "Export
Pledges & Ledger CSV" button here will include response/pledge data but no expense line items.

See §2.3 for the full element-by-element description of this component (search, filters, table/card
list, detail modal) — it isn't repeated here since it's identical.

## 3.6 Users Tab

Fetches the full registered-user list on mount.
- **Loading state**: "Loading users…"
- **Header**: "All Users (N)".
- **Empty state**: "No registered users yet."
- **Card anatomy** (one row per user, no search/filter/sort controls exist on this tab):
  - Full name.
  - **ORGANIZER** badge — shown only if the user currently has organizer access.
  - **Setup pending** badge — shown only if the user registered but hasn't completed one-time
    profile setup yet.
  - Email address.
  - "Registered {date}".
  - **Grant / Revoke button** — toggles organizer access; label and color flip based on current
    state ("Grant", primary styling vs. "Revoke", red styling). **Applies immediately, no
    confirmation dialog.**
  - **Delete button** — opens the delete confirmation modal (does not delete immediately); shows
    "Deleting…" and disables while that user's delete request is in flight.

## 3.7 Delete User Modal

A centered confirmation modal (click-outside cancels, unless a delete is already in progress).
- Warning icon + heading "Delete {user.fullName}?"
- Body text: "This permanently removes their account, survey response, RSVP, and every photo they
  uploaded, plus any albums they created — including other people's photos in those albums. This
  can't be undone." (This is the only place documenting the full cascade scope of a user delete.)
- **Confirmation field**: "Confirm your superadmin password" — the superadmin's *own* password, not
  the target user's, required as re-authentication before the delete executes.
- Inline error text on failure (e.g. wrong password).
- Buttons: **Cancel** (disabled while deleting) and **Delete permanently** (disabled until a
  password is entered; relabels "Deleting…" while in flight).
- There is no secondary "type the user's name" confirmation step — re-entering the superadmin's own
  password is the only gate.

## 3.8 Activity Log Tab

Fetches log entries on mount.
- **Loading state**: "Loading activity…"
- **Header**: "Activity Log (N)".
- **Empty state**: "No actions recorded yet."
- **List**: a simple divided list, no search/filter/sort/pagination controls, entries shown in
  whatever order the API returns them. Each row shows a human-readable description of the action on
  the left and a formatted timestamp (e.g. "Sep 3, 2:45 PM") on the right. Rows are static text only
  — no click-through detail view.

## 3.9 Summary of Confirmation Gates

- **Grant/Revoke organizer access** (Users tab) — no confirmation, applies instantly.
- **Delete user** (Users tab) — full modal confirmation requiring the superadmin's own password.
- **Delete survey response** (Surveys tab) — governed by the shared component from §2.3.
- Grant/Revoke and Delete surface no toast/success banner — the only feedback is the list updating
  (a badge/button changing, or a row disappearing) and, on delete failure, inline error text in the
  modal.
