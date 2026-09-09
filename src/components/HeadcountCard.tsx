import React from 'react';
import { RSVPRecord } from '../types';
import { STATUS_EDGE } from '../utils/statusColors';

// Everything the card needs from an RSVP. Typed as a Pick rather than against
// PublicRSVP or RSVPRecord specifically, so the attendee hero (which holds the
// PII-free subset) and the organizer roster (which holds full records) can both
// pass their own list straight in.
type HeadcountRsvp = Pick<RSVPRecord, 'status' | 'bringingPlusOne' | 'plusOnesCount' | 'kidsCount'>;

interface HeadcountCardProps {
  rsvps: HeadcountRsvp[];
  // Which ground the card is standing on. `hero` and `surface` are both dark
  // green — the attendee hero and the back-office body — so the card is glass
  // and its ink is cream and gold. `paper` is the attendee page body: an
  // ordinary white card like every other one there, with ink to match, and a
  // halo of the hero's own colours as the one thing that marks it out.
  variant: 'hero' | 'surface' | 'paper';
  // Attendee only: the board also reports the fund and offers the RSVP CTA.
  batchFund?: string;
  action?: { label: string; onClick: () => void };
}

// Ring order, and the only place it is defined. Colours and labels come from
// STATUS_EDGE, so a hue and a word mean the same thing here as on the
// attendance wall: `onDark` on the two dark grounds, `edge` on paper — the
// same pair the wall itself switches between.
const RING: RSVPRecord['status'][] = ['Attending', 'Most likely', 'Maybe', 'Decline'];

// The hero's three ambient blobs (see TabHero's HeroBlobs). The literal
// gradient stops behind them are all deep green and would glow nearly
// monochrome; these are what actually give the hero its colour.
const HERO_GLOW = 'linear-gradient(168deg,#12786a,#d6982d,#b0564f)';

const R = 57;
const CIRCUMFERENCE = 2 * Math.PI * R;

export const HeadcountCard: React.FC<HeadcountCardProps> = ({
  rsvps,
  variant,
  batchFund,
  action,
}) => {
  const counts = RING.map((status) => rsvps.filter((r) => r.status === status).length);
  const totalResponses = counts.reduce((a, b) => a + b, 0);

  // Guests come from everyone still in play, not just the confirmed: a "most
  // likely" answer bringing five already has its own head in the expected
  // count, so counting the party only for 'Attending' would silently drop
  // those five. This is the one definition of the number, which is what keeps
  // the board and the roster from disagreeing.
  const inPlay = rsvps.filter((r) => r.status !== 'Decline');
  const guests = inPlay.reduce(
    (acc, r) => acc + (r.plusOnesCount ?? (r.bringingPlusOne ? 1 : 0)) + (r.kidsCount || 0),
    0,
  );
  const expected = inPlay.length + guests;

  const onPaper = variant === 'paper';
  const ink = {
    arc: (status: RSVPRecord['status']) =>
      onPaper ? STATUS_EDGE[status].edge : STATUS_EDGE[status].onDark,
    track: onPaper ? 'rgba(20,33,29,.09)' : 'rgba(255,255,255,.12)',
    figure: onPaper ? 'text-primary' : 'text-[#f6e6bf]',
    caption: onPaper ? 'text-on-surface-variant' : 'text-[#f6e6bf]/62',
    value: onPaper ? 'text-on-surface' : 'text-[#f2ece1]',
    divider: onPaper ? 'border-on-surface/18' : 'border-white/22',
    cta: onPaper ? 'bg-primary text-on-primary' : 'bg-[#f6e6bf] text-[#0d2620]',
  };

  // Arcs are laid end to end around the ring by advancing the dash offset.
  let offset = 0;
  const arcs = counts.map((n, i) => {
    if (n === 0) return null;
    const length = (n / totalResponses) * CIRCUMFERENCE;
    const arc = (
      <circle
        key={RING[i]}
        cx="64"
        cy="64"
        r={R}
        fill="none"
        stroke={ink.arc(RING[i])}
        strokeWidth="14"
        strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
        strokeDashoffset={-offset}
      />
    );
    offset += length;
    return arc;
  });

  const card = (
    <div
      className={`relative rounded-2xl p-4 flex flex-col gap-3.5 ${
        variant === 'hero'
          ? 'backdrop-blur-xl bg-white/10 border border-white/20'
          : variant === 'surface'
            ? 'backdrop-blur-xl bg-surface-container-lowest border border-outline-variant/30 shadow-soft'
            : 'bg-surface-container-low border border-outline-variant/50 shadow-soft'
      }`}
    >
      {/* Capped, not stretched. In the hero and back office this card is about
          46ch wide anyway so the cap never bites; on the board it spans the
          full page, and without it the counts would fly to the far right edge
          leaving a gulf between each label and its number. */}
      <div className="flex items-center gap-4 @min-[700px]/app:gap-[18px] max-w-[46ch]">
        <div className="relative flex-none w-28 h-28 @min-[700px]/app:w-32 @min-[700px]/app:h-32">
          {/* -rotate-90 puts the first arc at 12 o'clock instead of 3. */}
          <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90" aria-hidden="true">
            <circle cx="64" cy="64" r={R} fill="none" stroke={ink.track} strokeWidth="14" />
            {arcs}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-px">
            {/* lining-nums is load-bearing: Playfair defaults to oldstyle
                figures, where 3/4/5/7/9 descend and 6/8 ascend, so the ink's
                centre would shift with whichever digits are showing and the
                number would wobble inside the ring as replies come in. The
                -0.076em nudge corrects Playfair's lopsided em box. */}
            <span className={`font-serif text-display leading-none lining-nums tabular-nums -translate-y-[0.076em] ${ink.figure}`}>
              {totalResponses}
            </span>
            <span className={`eyebrow ${ink.caption}`}>responses</span>
          </div>
        </div>

        {/* Rows sit tight: `leading-none` on the count is what actually does
            it. The count is text-heading, whose 1.2 line-height adds ~3px of
            half-leading above and below every row before any gap is applied,
            so trimming the line box buys more than shrinking the gap does. */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {RING.map((status, i) => {
            const st = STATUS_EDGE[status];
            return (
              <div key={status} className={`flex items-center gap-2 ${counts[i] === 0 ? 'opacity-45' : ''}`}>
                <span className="flex-none w-2.5 h-2.5 rounded-[3px]" style={{ background: ink.arc(status) }} />
                <span className="flex-1 min-w-0 eyebrow truncate" style={{ color: ink.arc(status) }}>
                  {st.label}
                </span>
                <span className={`font-serif text-heading leading-none lining-nums tabular-nums ${ink.value}`}>
                  {counts[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`flex flex-wrap items-center gap-3 pt-2.5 border-t border-dashed ${ink.divider}`}>
        <div className="flex flex-col gap-0.5">
          <span className={`eyebrow ${ink.caption}`}>Guests &amp; kids</span>
          <span className={`font-serif text-heading lining-nums tabular-nums ${ink.value}`}>{guests}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className={`eyebrow ${ink.caption}`}>Expected headcount</span>
          <span className={`font-serif text-heading lining-nums tabular-nums ${ink.value}`}>{expected}</span>
        </div>
        {batchFund && (
          <div className="flex flex-col gap-0.5">
            <span className={`eyebrow ${ink.caption}`}>Batch fund</span>
            <span className={`font-serif text-heading ${ink.value}`}>{batchFund}</span>
          </div>
        )}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className={`ml-auto max-[380px]:w-full rounded-full font-sans text-body font-bold px-5 py-3 @min-[700px]/app:px-3.5 @min-[700px]/app:py-2.5 ${ink.cta}`}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );

  if (!onPaper) return card;

  // The halo is a blurred copy of the hero's palette sitting behind the card,
  // as a SIBLING rather than a ::before with a negative z-index. A negative
  // z-index child would have to escape the card's own box to sit behind its
  // background, and the app root is `isolate`, so it would land beneath the
  // desk-wash layers instead of just beneath the card. Painting order does
  // the job on its own: the halo is declared first, the card is positioned,
  // so the card paints over it.
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-[7px] rounded-[23px] blur-[16px] opacity-45"
        style={{ background: HERO_GLOW }}
      />
      {card}
    </div>
  );
};
