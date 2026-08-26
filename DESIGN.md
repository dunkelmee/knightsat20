---
name: Modern Nostalgia
colors:
  surface: '#fbf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ee'
  surface-container: '#f0eee9'
  surface-container-high: '#eae8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#524437'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#847465'
  outline-variant: '#d7c3b2'
  surface-tint: '#885200'
  primary: '#885200'
  on-primary: '#ffffff'
  primary-container: '#d9933f'
  on-primary-container: '#533000'
  inverse-primary: '#ffb869'
  secondary: '#4e6073'
  on-secondary: '#ffffff'
  secondary-container: '#cfe2f9'
  on-secondary-container: '#526478'
  tertiary: '#446272'
  on-tertiary: '#ffffff'
  tertiary-container: '#87a6b7'
  on-tertiary-container: '#1d3c4a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcbb'
  primary-fixed-dim: '#ffb869'
  on-primary-fixed: '#2b1700'
  on-primary-fixed-variant: '#673d00'
  secondary-fixed: '#d1e4fb'
  secondary-fixed-dim: '#b5c8df'
  on-secondary-fixed: '#091d2e'
  on-secondary-fixed-variant: '#36485b'
  tertiary-fixed: '#c7e7f9'
  tertiary-fixed-dim: '#accbdd'
  on-tertiary-fixed: '#001f2b'
  on-tertiary-fixed-variant: '#2c4b59'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
  paper-cream: '#F9F7F2'
  ink-charcoal: '#1A1A1A'
  washed-denim: '#8BAABB'
  sunset-gold: '#D9933F'
  film-shadow: '#2C3E50'
typography:
  display-hero:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 20px
  gutter: 16px
  section-gap: 40px
---

## Brand & Style
The design system balances the sentimental gravity of a 20-year milestone with the frictionless utility of a modern SaaS application. It evokes the feeling of leafing through a high-end, heavy-stock yearbook but operates with the speed of a contemporary mobile-first platform.

The aesthetic is "Modern Nostalgia"—a hybrid style that uses **Minimalism** for functional clarity and **Tactile** elements to ground the experience in history. We avoid literal retro-kitsch in favor of sophisticated cues: generous whitespace, high-end editorial typography, and subtle paper-grain overlays that make digital surfaces feel physical and enduring. The interface should feel like a "digital keepsake": premium, celebratory, and deeply trustworthy for a non-technical committee to manage.

## Colors
The palette is rooted in the contrast between **Ink Charcoal** and **Paper Cream**, establishing a sophisticated, readable foundation that moves away from the harshness of pure black and white.

- **Primary (Sunset Gold):** Reserved for high-priority actions, such as "RSVP Now" or "Purchase Tickets." It provides a warm, celebratory glow.
- **Secondary (Film Shadow):** A deep navy-charcoal used for navigation bars, headers, and grounding elements to provide a sense of authority and permanence.
- **Tertiary (Washed Denim):** A muted, desaturated blue used for informational states, secondary buttons, and decorative accents. It evokes the look of faded photography.
- **Neutral (Paper Cream):** The primary background color. It should be paired with a very subtle noise texture (2-3% opacity) to mimic physical paper stock.

## Typography
The typographic pairing is central to the "Modern Nostalgia" theme. 

**Source Serif 4** provides a sturdy, academic elegance reminiscent of traditional publishing and yearbooks. It is used for all "storytelling" elements: names in the directory, major headlines, and the "What's New" summary.

**Hanken Grotesk** is the functional workhorse. It is a sharp, contemporary sans-serif that ensures high legibility on mobile devices, especially for data-heavy admin tables and the OTP login screens.

Use `label-caps` for section headers like "THEN" and "NOW" to create a clear visual distinction from the narrative text.

## Layout & Spacing
The system utilizes a **Fluid Grid** with a mobile-first philosophy, as most users arrive via messaging apps. 

- **Mobile:** 4-column grid with 20px outside margins. 
- **Desktop:** 12-column grid, max-width 1140px, centered.
- **Spacing Rhythm:** Use increments of 8px. Generous whitespace is required between sections (40px+) to maintain the premium, "uncluttered" yearbook feel.
- **The "Then-and-Now" Pair:** Profile photos in the directory should appear as side-by-side squares on desktop and a vertical stack on mobile, maintaining a consistent aspect ratio to ensure alignment across the "Photo Wall."

## Elevation & Depth
Depth is conveyed through **Tonal Layers** and **Ambient Shadows** rather than heavy gradients.

- **Surface Levels:** The base level is `Paper Cream`. Primary cards and modals sit one level above on `White`, supported by a very soft, diffused shadow (Blur: 12px, Y: 4px, Opacity: 6% Film Shadow).
- **Interactive Depth:** Buttons use a slight "push" effect—moving from a soft shadow to a flat state on press to simulate physical tactility.
- **Texture:** Apply a global SVG noise filter to the background to break the digital perfection and provide a subtle, organic grain.

## Shapes
The shape language is "Rounded," utilizing a **8px standard radius** for most components. This softens the interface, making it feel approachable and friendly without becoming "bubbly" or juvenile. 

- **Cards/Images:** 8px corner radius.
- **Buttons:** 8px corner radius for a classic, professional look.
- **Profile Frames:** Use a subtle 1px border in `Washed Denim` at 20% opacity to frame "Then-and-Now" photos, mimicking the edge of a printed photograph.

## Components
- **Buttons:** Primary buttons use `Sunset Gold` with white text. Secondary buttons use an outline of `Film Shadow` with a `Paper Cream` background.
- **Then-and-Now Cards:** A specialized component containing two images. The "Then" image should have an optional sepia or B&W filter applied via CSS to emphasize the time gap.
- **The "What's New" Strip:** A horizontal notification bar at the top of the feed using `Washed Denim` background with a subtle slide-down animation on entry.
- **Input Fields:** Use 1px borders in `Film Shadow` (30% opacity). The 6-digit OTP input should feature oversized, segmented boxes for high touch-accuracy on mobile.
- **Status Badges:** "Missing" classmates are flagged with a subtle desaturated red, while "Accounted For" uses a soft botanical green. 
- **Admin Tables:** Use a condensed version of `Hanken Grotesk` with alternating row stripes in `Paper Cream` (50% opacity) for maximum data density and readability.