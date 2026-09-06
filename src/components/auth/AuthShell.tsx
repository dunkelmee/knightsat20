import React from 'react';
import crestImage from '../../assets/maksci-07-crest.png';

// Shared "Memory Desk" chrome for every pre-app screen (AuthGate's four modes
// plus ProfileSetup): a dark hero band (crest + headline) above a glass
// "paper" card. On mobile a dark gradient + six-blob ambient wash covers the
// WHOLE page (hero and card area alike) for an immersive "gateway" moment,
// distinct from the rest of the app where only the per-tab hero band
// (TabHero.tsx) is dark — the hero band itself stays transparent there so
// that whole-page wash shows through it uninterrupted. On desktop the hero
// re-asserts its own opaque gradient + blob trio (it needs to read as a
// distinct band there), while the page around it carries a subtler
// three-blob parchment wash + grid lines, matching the authenticated app.
const GRADIENT = 'bg-[linear-gradient(168deg,#0d2620_0%,#123b32_48%,#1d4a3c_100%)]';

const NOISE_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// Field/button primitives shared by AuthGate and ProfileSetup so every form
// across the flow renders pixel-identical inputs.
export const FIELD_CLASS =
  'w-full px-3.5 py-3 rounded-xl border border-[rgba(20,33,29,.16)] bg-white/70 text-body text-on-background ' +
  'placeholder:italic placeholder:font-serif placeholder:text-[#3d4d47] focus:outline-none focus:border-primary ' +
  'focus:ring-[3px] focus:ring-primary/10 transition-colors disabled:opacity-60';
export const SELECT_CLASS =
  'w-full px-3 py-2.5 rounded-xl border border-[rgba(20,33,29,.16)] bg-white/70 text-body font-semibold ' +
  'text-[#3d4d47] cursor-pointer focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10';
export const KICK_LABEL_CLASS = 'font-mono text-label font-medium tracking-[0.16em] uppercase text-on-surface-variant';
export const SECTION_KICK_CLASS = 'font-mono text-label font-medium tracking-[0.2em] uppercase text-primary';
export const OTP_CLASS =
  'w-full aspect-[3/4] max-h-[58px] rounded-2xl border border-[rgba(20,33,29,.16)] bg-white/70 text-center ' +
  'font-serif text-title text-on-background focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10';
export const BTN_CLASS =
  'w-full py-3.5 rounded-full bg-primary text-white font-bold text-body shadow-[0_14px_26px_-10px_rgba(14,90,77,.75)] ' +
  'hover:opacity-95 disabled:opacity-60 transition-opacity';
export const LINK_CLASS =
  'bg-transparent border-none p-0 font-semibold text-body text-primary underline decoration-1 underline-offset-2 ' +
  'cursor-pointer disabled:opacity-50 disabled:cursor-default';

interface AuthShellProps {
  kicker: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}

export const AuthShell: React.FC<AuthShellProps> = ({ kicker, title, sub, children }) => {
  return (
    <div id="auth-shell" className="@container/app isolate min-h-screen relative font-sans bg-[#e7ddcd] flex flex-col">
      {/* Mobile-only: the dark gradient plus a six-blob ambient wash covers
          the WHOLE page top-to-bottom (hero and the card area below it
          alike) — an immersive "gateway" look. A separate layer rather than
          a background utility on the root itself, since a background-image
          utility here would keep painting over the desktop parchment color
          below regardless of breakpoint (they're the same CSS property, and
          an unconditional bg-[...] utility and a container-scoped one on the
          same element don't reliably cascade in the intended order). The
          hero band below stays transparent on mobile so this shows through
          it uninterrupted, instead of the hero re-painting its own patch. */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none @min-[700px]/app:hidden ${GRADIENT}`} aria-hidden="true">
        <span className="absolute rounded-full" style={{ top: '-14%', left: '-16%', width: '74%', height: '44%', background: 'radial-gradient(circle,rgba(18,120,102,.6),transparent 66%)', filter: 'blur(30px)' }} />
        <span className="absolute rounded-full" style={{ top: '4%', right: '-20%', width: '76%', height: '40%', background: 'radial-gradient(circle,rgba(214,152,45,.46),transparent 66%)', filter: 'blur(32px)' }} />
        <span className="absolute rounded-full" style={{ top: '34%', left: '-10%', width: '88%', height: '40%', background: 'radial-gradient(circle,rgba(176,86,79,.46),transparent 70%)', filter: 'blur(34px)' }} />
        <span className="absolute rounded-full" style={{ bottom: '6%', right: '-18%', width: '82%', height: '38%', background: 'radial-gradient(circle,rgba(214,152,45,.5),transparent 68%)', filter: 'blur(34px)' }} />
        <span className="absolute rounded-full" style={{ bottom: '-30%', left: '-14%', width: '92%', height: '52%', background: 'radial-gradient(circle,rgba(176,86,79,.5),transparent 68%)', filter: 'blur(32px)' }} />
        <span className="absolute rounded-full" style={{ bottom: '-24%', right: '-20%', width: '88%', height: '48%', background: 'radial-gradient(circle,rgba(214,152,45,.46),transparent 68%)', filter: 'blur(32px)' }} />
        <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: NOISE_URL }} />
      </div>

      {/* Desktop-only: a subtler three-blob parchment wash + grid, filling
          the whole page (the hero band paints its own opaque gradient on
          top of this for its own height). */}
      <div className="hidden @min-[700px]/app:block absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <span className="absolute rounded-full" style={{ top: '-16%', left: '-16%', width: '66%', height: '48%', background: 'radial-gradient(circle,rgba(18,120,102,.5),transparent 68%)', filter: 'blur(32px)' }} />
        <span className="absolute rounded-full" style={{ top: '0%', right: '-20%', width: '66%', height: '46%', background: 'radial-gradient(circle,rgba(214,152,45,.5),transparent 68%)', filter: 'blur(34px)' }} />
        <span className="absolute rounded-full" style={{ bottom: '-18%', left: '6%', width: '80%', height: '44%', background: 'radial-gradient(circle,rgba(176,86,79,.34),transparent 70%)', filter: 'blur(36px)' }} />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgba(20,33,29,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(20,33,29,.05) 1px,transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="absolute inset-0 opacity-[0.48] mix-blend-multiply" style={{ backgroundImage: NOISE_URL }} />
      </div>

      {/* Dark hero band: crest/brand row + per-screen headline. Transparent
          on mobile (the full-page wash above shows through); its own opaque
          gradient + blob trio on desktop, where it must read as a distinct
          band above the parchment body. */}
      {/* On mobile the whole composition (hero + card) is centred in the
          viewport as one group — `my-auto` rather than `justify-center` so
          that a screen taller than the viewport (Setup) still scrolls from
          the top instead of having its top edge become unreachable. On
          desktop the dark band stays flush to the top edge, as its own
          layout requires. */}
      <div className="relative z-10 w-full my-auto @min-[700px]/app:my-0">

      <div className="relative overflow-hidden @min-[700px]/app:bg-[linear-gradient(168deg,#0d2620_0%,#123b32_48%,#1d4a3c_100%)]">
        <div className="hidden @min-[700px]/app:block absolute inset-0 pointer-events-none" aria-hidden="true">
          <span className="absolute rounded-full" style={{ top: '-26%', left: '-12%', width: '62%', height: '110%', background: 'radial-gradient(circle,rgba(18,120,102,.6),transparent 66%)', filter: 'blur(28px)' }} />
          <span className="absolute rounded-full" style={{ top: '-18%', right: '-16%', width: '66%', height: '112%', background: 'radial-gradient(circle,rgba(214,152,45,.46),transparent 66%)', filter: 'blur(30px)' }} />
          <span className="absolute rounded-full" style={{ bottom: '-42%', left: '22%', width: '66%', height: '98%', background: 'radial-gradient(circle,rgba(176,86,79,.38),transparent 70%)', filter: 'blur(32px)' }} />
          <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: NOISE_URL }} />
        </div>

        <div className="relative max-w-[1180px] mx-auto px-5 @min-[700px]/app:px-8 py-8 @min-[700px]/app:py-10 @min-[700px]/app:min-h-[420px] flex flex-col justify-center gap-4 @min-[700px]/app:gap-5">
          <div className="flex items-center gap-2.5">
            <img
              src={crestImage}
              alt="MakSci '07 crest"
              className="w-10 h-10 @min-[700px]/app:w-[46px] @min-[700px]/app:h-[46px] rounded-full object-cover bg-white flex-shrink-0"
              style={{ boxShadow: '0 0 0 3px rgba(255,255,255,.16)' }}
            />
            <div className="flex flex-col gap-0.5">
              <span className="font-sans text-label font-bold text-[#f2ece1]">Knights @ 20</span>
              <span className="font-mono text-label tracking-[0.16em] uppercase text-[#f6e6bf]/70">MakSci Batch &apos;07 Reunion</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 max-w-[520px]">
            <h1 className="font-serif font-normal text-display leading-[1.02] tracking-[-0.022em] text-[#f2ece1]">
              {title}
            </h1>
            <p className="max-w-[44ch] text-body leading-[1.62] text-[#f2ece1]/66">{sub}</p>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="relative flex justify-center px-5 @min-[700px]/app:px-8 py-6 @min-[700px]/app:py-9 pb-12">
        <div className="w-full @min-[700px]/app:max-w-[460px]">
          <div
            className="relative rounded-[24px] p-6 flex flex-col gap-4"
            style={{
              background: 'linear-gradient(158deg,rgba(255,255,255,.95),rgba(255,255,255,.86))',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,.85)',
              boxShadow: '0 20px 42px -18px rgba(14,44,37,.42)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className={SECTION_KICK_CLASS}>{kicker}</span>
              <span className="flex-1 min-w-[14px] h-px bg-[rgba(20,33,29,.16)]" />
            </div>
            {children}
          </div>
        </div>
      </div>

      </div>
    </div>
  );
};
