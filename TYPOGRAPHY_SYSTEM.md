# Typography System — Knights @ 20

A proposal. **Nothing in the codebase has been changed yet.** This document defines the target
system; `typography-audit.html` documents the current state it is replacing.

See `APP.md` for the element-by-element screen reference this system applies to.

---

## 1. The problem, in numbers

Measured across all 11 tabs plus the shared chrome — 244 text elements:

| | Now |
|---|---|
| Distinct font sizes app-wide | **36** |
| Distinct sizes on a single page | **8 – 17** (Funds 17, Batch Board 16, Survey 15) |
| Distinct sizes used by the mono face alone | **6** (8, 8.5, 9, 9.5, 10, 10.5px) |
| Distinct sizes used by the serif alone | **18** |
| Elements below 11px | **75 of 244 — 31%** (smallest: 7.5px) |
| Font weights in play | **4** (400, 500, 600, 700) |
| Elements that change size at a breakpoint | **14**, mostly by 1px |

Two structural causes, both worth naming because the fix follows from them:

**Size is doing all the work.** The app has three typefaces with genuinely distinct jobs, four
weights, an uppercase/tracked treatment, and a five-stop color ramp — but hierarchy is being
expressed almost entirely by nudging the size. Six mono sizes exist to distinguish labels that
are already distinguished by being mono, uppercase, and tracked.

**Nothing was ever named.** Every size is an ad-hoc arbitrary value (`text-[10.5px]`,
`text-[12.5px]`, `text-[11.5px]`) chosen at the call site. There is no vocabulary, so there is
nothing to reuse, and each new component invents a size that is 0.5px from an existing one.

A secondary trap: `src/index.css` sets `html,body{font-size:15px}`, so Tailwind's rem scale
resolves against 15px. `text-xs` is 11.25px, `text-sm` is 13.13px. Half the app's sizes are
accidental decimals nobody chose.

---

## 2. The principle

> **Size is one of four levers, not the only one.**

Hierarchy in this app is carried by:

| Lever | Signal it sends |
|---|---|
| **Family** | *What kind of thing this is* — editorial (serif), interface (sans), metadata (mono) |
| **Size** | *How important it is* — 5 steps, no more |
| **Weight** | *Emphasis within a step* — 3 weights |
| **Case + tracking** | *This is a label, not content* — uppercase + tracking, mono only |
| **Color** | *Foreground vs. supporting* — 3 stops |

Once family, case, and color are pulling their weight, five sizes is comfortable rather than
constraining. The audit shows this is already true where the design is strongest — the roster
card distinguishes a name, a status, a quote, and a timestamp using four different faces. The
size differences there are decorative, not load-bearing.

---

## 3. The scale

Five steps. Global — not a per-page ration. Every page is compliant by construction.

| Token | Size | Line height | Tracking | Role |
|---|---|---|---|---|
| `display` | `clamp(30px, 6.6cqw, 48px)` | 1.02 | −0.022em | Page title. **One per screen.** The only fluid step. |
| `title` | `24px` | 1.08 | −0.015em | Section headings, hero figures, grand totals |
| `heading` | `16px` | 1.20 | −0.01em | Card titles, question titles, person names, money figures |
| `body` | `12px` | 1.55 | 0 | Prose, inputs, options, table cells, values, buttons |
| `label` | `10px` | 1.35 | 0 / +0.14em mono | Field labels, chips, badges, eyebrows, counts, timestamps |
| `nav` | `8px` | 1.35 | +0.02em | **Exception** — mobile tab-bar labels only. See below. |

Ratios: 10 → 12 (1.20) → 16 (1.33) → 24 (1.50) → 48 (2.00). A steadily widening ramp on whole
even numbers, with 12 / 24 / 48 as exact doublings and 16 : 24 a clean 2:3. Tight at the bottom
where UI text lives and the eye needs continuity, decisive into `heading` so a heading reads as
one without needing bold.

`label` and `body` sit 2px apart and are not meant to read as strongly different sizes — they are
separated by weight, color, and family as well (§4–§6). The size difference only keeps a label
from crowding the prose beside it.

**Three deliberate consequences:**

- **10px is the floor, with exactly one documented exception.** 27 elements (11%) currently sit
  below it. The exception is `nav` (8px), used by `MobileNav` in `nav/AppNav.tsx` and nowhere
  else: six labels share a phone-width bar underneath an icon that already carries the meaning,
  and at 10px they crowd. It is a *named token* rather than an arbitrary value precisely so it
  stays the only one — if a second element ever wants it, that is a signal the floor is wrong,
  not that the exception should spread. The desktop pill nav stays at `label`.

  The honest cost: the mobile tab bar is on every screen, so on mobile a page carries five steps
  of content type plus this sixth chrome size. The ≤ 5 budget is therefore a budget on **page
  content**, and the tab bar is called out separately rather than quietly counted in. Note that `label` and the mono eyebrow share one token, so they move together —
  10px sans is the tightest thing in the system, and the eyebrow survives it more comfortably
  than plain sans does, because uppercase + tracking + monospace widths all buy legibility back.
- **12px becomes the body size,** up from today's effective 11.25px (`text-xs`). Most prose,
  inputs, and option labels get *bigger*, not smaller. Cleaning up is not the same as shrinking.
- **`display` is the only responsive step.** All 14 of the current breakpoint size-swaps go
  away — they are 1px changes nobody can perceive that double the inventory.

---

## 4. Legal combinations

The constraint that makes five steps feel deliberate rather than flat is that not every family
may appear at every step. **Seven legal cells:**

| Step | Playfair Display | Plus Jakarta Sans | JetBrains Mono |
|---|---|---|---|
| `display` | **400** — page title, hero figure | — | — |
| `title` | **400** — section heading, grand total | — | — |
| `heading` | **400** — card title, name, figure | — | — |
| `body` | **400 italic** — quotes & captions only | **400** / **600** | — |
| `label` | — | **400** / **600** / **700** | **500** — uppercase, +0.14em |

Read as three rules:

1. **Mono only ever appears at `label`.** It is a single size, a single weight, always uppercase,
   always tracked. This one rule removes 6 of the 36 sizes.
2. **Serif never appears below `body`,** and below `heading` only as italic quotes and photo
   captions. Playfair at 11px is illegible and currently happens in four places.
3. **Sans never appears above `body`,** and is never uppercase. All figures, currency, and
   headings are serif — including in the organizer view, which currently sets them in bold sans.

---

## 5. Weight

Three weights. **500 is retired** — it appears 10 times out of 244 and does nothing 400 or 600
does not.

| Weight | Where |
|---|---|
| **400** Regular | All serif, all body prose, all mono, secondary meta |
| **600** Semibold | Field labels, chips, tabs, table headers, emphasized values, secondary buttons |
| **700** Bold | Primary buttons only |

Playfair is **always 400.** The organizer view currently sets `h3`/`h4` in Playfair 600–700 at
13–15px, which muddies the face at small sizes; those become serif 400 at `heading`.

---

## 6. Case, tracking, and color

**Uppercase belongs to mono, and to nothing else.** The organizer view has a competing pattern —
`text-xs font-bold uppercase tracking-wider` in sans — for the same job the attendee view does in
mono. Those all become the mono eyebrow, which unifies the two halves of the app.

**Color collapses to three stops.** The audit found opacity values of /50, /55, /60, /62, /66,
/70, /82, and /85 in use, most of them indistinguishable from each other.

| Stop | Token | Use |
|---|---|---|
| Primary | `text-on-surface` | Headings, names, values, body |
| Secondary | `text-on-surface-variant` | Supporting prose, labels, captions |
| Tertiary | `text-on-surface-variant/60` | Timestamps, counts, disabled |

On the dark hero, the equivalents are `#f2ece1`, `#f2ece1/70`, `#f6e6bf/60`.

---

## 7. Named patterns

Six composites cover most of the app. Building from these rather than from raw tokens is what
keeps the system from drifting again.

| Pattern | Recipe | Example |
|---|---|---|
| **Eyebrow** | mono · `label` · 500 · uppercase · +0.14em · tertiary | `VENUE · MAR 14`, `TOTAL HEADCOUNT` |
| **Page title** | serif · `display` · 400 | `Dalawang dekada na, musta na u?` |
| **Section heading** | serif · `title` · 400 | `Announcements`, `Attendance wall` |
| **Card title** | serif · `heading` · 400 | Announcement titles, person names, expense names |
| **Figure** | serif · `heading` (inline) or `title` (grand total) or `display` (hero) · 400 · lining + tabular nums | `₱412,000`, `128` |
| **Field label** | sans · `label` · 600 · secondary | `Venue suggestions:`, `Event Date *` |

---

## 8. Per-page compliance

Every page under the new scale, versus today. Counts include the shared chrome, which is on
every screen.

| Page | Sizes now (m/d) | After | Steps used |
|---|---|---|---|
| Batch Board | 16 / 15 | **5** | display, title, heading, body, label |
| Survey | 15 / 15 | **5** | display, title, heading, body, label |
| Directory | 14 / 13 | **5** | display, title, heading, body, label |
| Photos | 13 / 12 | **5** | display, title, heading, body, label |
| Funds | 17 / 16 | **5** | display, title, heading, body, label |
| Event Planning | 8 / 9 | **3** | display, body, label |
| Surveys (organizer) | 9 / 8 | **4** | display, title, body, label |
| Ledger | 10 / 10 | **4** | display, title, body, label |
| Announcements (organizer) | 9 / 9 | **3** | display, body, label |
| RSVP Roster | 10 / 10 | **4** | display, title, body, label |
| Photo Wall (organizer) | 9 / 9 | **3** | display, body, label |

---

## 9. Role → token reference

**This table is the authority, not a numeric find-and-replace.** Two elements at 11.25px today
land on different steps depending on what they *are*: an option label is `body`, a field label is
`label`. Migrating by px value would leave the app as small as it is now.

### Shared chrome

| Element | Now | Becomes |
|---|---|---|
| Wordmark "Knights @ 20" | PJS 11.25 / 700 | sans `label` 600 |
| Kicker under wordmark | JBM 8 | **eyebrow** |
| Desktop nav pill | PJS 11.5 / 600 | sans `label` 600 |
| Mobile nav label | PJS 7.5 / 700 | sans `label` 600 — *requires shorter labels, see §11* |
| Profile chip name, menu items | PJS 11–11.25 | sans `body` 400 |
| Hero page title | PD clamp(32–54) | serif `display` |
| Hero subtitle | PJS 12.5 | sans `body` 400, secondary |

### Batch Board

| Element | Now | Becomes |
|---|---|---|
| Hero eyebrows ("Total Headcount", "Batch fund") | JBM 8 | **eyebrow** |
| Hero headcount figure | PD 58 / 46 | serif `display` |
| Hero stat lines, footnote | PJS 10–11 / 600 | sans `label` 600 |
| Hero footer figures | PD 18.75 | serif `heading` |
| RSVP CTA, "View my ticket" | PJS 10.5–11.25 / 700 | sans `body` 700 |
| Section headings | PD clamp(25–33) | serif `title` |
| Tag chips, status filters | PJS 10.5 / 600 | sans `label` 600 |
| Announcement tag · date | JBM 10 | **eyebrow** |
| Announcement title | PD 21 | serif `heading` |
| Announcement caption | PJS 11.25 | sans `body` 400 |
| Like count, author | PJS 10–10.5 | sans `label` 400, tertiary |
| Roster name | PJS 12.5 / 600 | serif `heading` |
| Roster status label | JBM 10 | **eyebrow** |
| Roster quote | PD 13.13 italic | serif `body` italic |
| Companions · date | JBM 8 | **eyebrow** |
| Empty-state headings | PD 22.5 | serif `title` |
| Empty-state body | PJS 11.25 | sans `body` 400 |

### Survey

| Element | Now | Becomes |
|---|---|---|
| Step tabs | PJS 10.5 / 600 | sans `label` 600 |
| Step number badge | JBM 9 / 700 | **eyebrow** |
| Question number + title | PD 19 | serif `heading` |
| "Optional" badge | JBM 9 / 600 | **eyebrow** |
| Option labels, month tiles | PJS 12 / 500 | sans `body` 400 |
| Month tile year | JBM 10.5 | **eyebrow** |
| Skill / sponsorship pills | PJS 11–12 / 500 | sans `label` 600 |
| Field labels | PJS 11.25 / 600 | sans `label` 600 |
| Inputs, textareas | PJS 11.25 | sans `body` 400 |
| Helper & validation text | PJS 11 | sans `label` 400, secondary |
| Pledge tier amount | PJS 14 / 600 | serif `heading` |
| Pledge tier subtitle | JBM 8 | **eyebrow** |
| Pledge / running totals | PD 18.75 | serif `heading` |
| Stepper label + value | PJS 12 / 500 | sans `body` 400 |
| Back / Next / Submit | PJS 11.25 / 600–700 | sans `body` 600 / 700 |
| Success heading | PD 30 | serif `display` |
| Success pledged amount | PD 22.5 | serif `title` |

### Directory

| Element | Now | Becomes |
|---|---|---|
| Search input | PD 13.13 italic | serif `body` italic |
| Status chips, section pills | PJS 10.5 / 600 | sans `label` 600 |
| Chip counts, filter badge | JBM 9–10.5 | **eyebrow** |
| Then / Now labels, photo badge | JBM 8–9 | **eyebrow** |
| Initials placeholder | PD 22 | serif `title` |
| Person name | PD 17 | serif `heading` |
| City · role | PJS 10.5 | sans `body` 400, secondary |
| Section tags | JBM 8 | **eyebrow** |
| Sheet title, year labels | JBM 8–10 | **eyebrow** |
| Sheet buttons | PJS 11.25 / 600–700 | sans `body` 600 / 700 |

### Photos

| Element | Now | Becomes |
|---|---|---|
| Album title (grid) | PD 20 | serif `heading` |
| "Live" badge, counts | JBM 8–8.5 | **eyebrow** |
| Contributor initials | PJS 8 / 700 | sans `label` 700 |
| Album detail title | PD clamp(25–33) | serif `title` |
| Envelope eyebrow, photo count | JBM 9.5–10 | **eyebrow** |
| Upload CTA | PJS 11.25 / 700 | sans `body` 700 |
| Photo caption | PD 11.5 italic | serif `body` italic |
| Back / load-more buttons | PJS 11.5 / 600 | sans `body` 600 |

### Funds

| Element | Now | Becomes |
|---|---|---|
| Hero eyebrow, stat labels | JBM 9.5–10 | **eyebrow** |
| Balance figure | PD 33.75 / 45 | serif `display` |
| Balance caption, footnotes | PJS 9.5–11.5 | sans `label` 400, tertiary |
| Stat tile figures | PD 18.75 | serif `heading` |
| Sub-tabs | PJS 10.5 / 600 | sans `label` 600 |
| Card titles, expense names | PD 16.88 | serif `heading` |
| Status pills, row keys, categories | JBM 8–10 | **eyebrow** |
| Row values, vote labels | PJS 13 / 600 | sans `body` 600 |
| Expense notes | PJS 10.5 | sans `body` 400, secondary |
| Expense amount | PD 21 | serif `heading` |
| Grand total | PD 22.5 | serif `title` |
| Empty headings | PD clamp(24–28) | serif `title` |

### Organizer view — all six tabs

The organizer tabs are already close to compliant (3–6 sizes each); the work here is less about
count and more about **bringing them into the same language as the attendee view**.

| Element | Now | Becomes |
|---|---|---|
| Metric card label (`text-xs bold uppercase`) | PJS 11.25 / 700 upper | **eyebrow** (mono) |
| Metric card figure | PJS 22.5–28.13 / 700 | serif `title` |
| Metric card footnote | PJS 11 | sans `label` 400, tertiary |
| Section `h3` / `h4` (serif by inheritance) | PD 11.25–15 / 600–700 | serif `heading` 400 |
| Section descriptions | PJS 11.25 | sans `body` 400, secondary |
| Field labels | PJS 11.25 / 600 | sans `label` 600 |
| Inputs, selects, textareas | PJS 11.25 | sans `body` 400 |
| Field helper text | PJS 10 | sans `label` 400, tertiary |
| Table headers | PJS 10 upper | **eyebrow** |
| Table cells | PJS 11.25 | sans `body` 400 |
| Names in tables/cards | PD 11.25–13.13 / 600 | serif `heading` 400 |
| Money amounts | PJS 13.13–15 / 700 | serif `heading` |
| Status / tag / category badges | PJS 10 / 600–700 | **eyebrow** |
| Buttons | PJS 11.25 / 600–700 | sans `body` 600 / 700 |
| Venue name, album title | PD 11.25–13.13 / 600 | serif `heading` 400 |
| Volunteer notes (italic) | PJS 10 italic | serif `body` italic |

---

## 10. Implementation sketch

Not applied yet. Recorded so the shape of the change is agreed before it starts.

Tailwind v4 generates `text-*` utilities from the `--text-*` namespace, so the scale becomes five
real class names and the arbitrary values disappear:

```css
/* src/index.css — inside the existing @theme block */
@theme {
  --text-label: 10px;
  --text-label--line-height: 1.35;
  --text-body: 12px;
  --text-body--line-height: 1.55;
  --text-heading: 16px;
  --text-heading--line-height: 1.2;
  --text-heading--letter-spacing: -0.01em;
  --text-title: 24px;
  --text-title--line-height: 1.08;
  --text-title--letter-spacing: -0.015em;
  --text-display: clamp(30px, 6.6cqw, 48px);
  --text-display--line-height: 1.02;
  --text-display--letter-spacing: -0.022em;
}
```

Giving `text-label`, `text-body`, `text-heading`, `text-title`, `text-display`. The eyebrow
pattern is worth a component-layer utility rather than five repeated classes:

```css
@layer components {
  .eyebrow {
    font-family: var(--font-mono);
    font-size: var(--text-label);
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
}
```

**Sizes are literal px, never rem.** This deliberately decouples type from the 15px root. The
root stays at 15px so Tailwind's rem-based *spacing* scale is untouched — changing it would move
every margin and padding in the app by 6.7%, which is a separate decision and not this one.

---

## 11. Guardrails

Rules that keep the inventory from growing back:

1. **No arbitrary font sizes.** `text-[...]` for font-size is banned. Enforceable with a CI grep
   for `text-\[[0-9.]+(px|rem)\]`.
2. **No raw Tailwind sizes.** `text-xs` … `text-5xl` are banned in app code; they are the source
   of the decimal sizes.
3. **No responsive size changes** except `display`, which is fluid and therefore does not need a
   breakpoint variant either.
4. **10px floor.** The one exception is `text-nav` (8px), legal only inside `MobileNav` in
   `nav/AppNav.tsx`. A CI grep for `text-nav` appearing anywhere else should fail.
5. **Uppercase is mono-only.**
6. **Family and step must be a legal pair** (§4).

Guardrail 4 has one real cost worth deciding on now: the mobile bottom-nav labels are 7.5px today
because six organizer tab names must fit across a phone. The `nav` exception (8px) buys most
of that back, but `Announcements` and `Event Planning` remain the two widest labels in the bar.
If they still crowd on a 360px screen the remaining fix is shorter labels, not smaller type — `Event Planning → Event`, `Announcements → Posts`,
`RSVP Roster → RSVP`, `Photo Wall → Photos`, `Surveys → Surveys`, `Ledger → Ledger`.

---

## 12. Decisions needing sign-off

Four places where the system makes a visible change rather than a tidy-up:

1. **Body text gets bigger.** 11.25px → 12px across all prose, inputs, and option labels. A
   modest increase, but it touches almost every screen and will make dense views — the survey
   form, the organizer tables — slightly taller.
2. **The hero headcount figure shrinks on mobile,** 58px → 30px, because it shares the `display`
   step with the page title. Alternative: pin the figure at a fixed 48px on both breakpoints, at
   the cost of it out-shouting the title on a phone.
3. **Section headings shrink,** 33px → 24px on desktop, and card titles 21px → 16px. The
   hierarchy is preserved; the overall scale is calmer.
4. **The organizer view goes serif for headings and figures.** Currently bold sans. This is what
   makes the two halves of the app feel like one product, but it is a real change of character
   for those six tabs.

Items 1 and 4 are the ones to look at first — they are the difference between "cleaner" and
"different."

---

## 13. Suggested migration order

Smallest-risk first, and each step is independently shippable:

1. Add the five `@theme` tokens and the `.eyebrow` utility. Changes nothing on its own.
2. Migrate the **shared chrome** — one file pair (`TabHero.tsx`, `AppNav.tsx`), visible everywhere,
   fastest read on whether the scale feels right.
3. Migrate the **organizer tabs**. Six files, already near-compliant, low traffic, and they
   validate the serif-figure decision cheaply.
4. Migrate the **attendee tabs** in order of size count: Funds, Batch Board, Survey, Directory,
   Photos.
5. Add the CI guardrails (§11) once no violations remain.
6. Re-run `typography-audit.html` against the migrated code to confirm ≤5 per page.
