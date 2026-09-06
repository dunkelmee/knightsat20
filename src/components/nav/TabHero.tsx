import React, { useEffect, useRef, useState } from 'react';
import { LogOut, Pencil, ArrowLeftRight } from 'lucide-react';
import { EventDetails, PublicRSVP, SurveyResponse, UserProfile } from '../../types';
import { formatPHP } from '../../utils/pledgeParser';
import { DesktopNav, NavTab } from './AppNav';
import { TicketModal } from '../TicketModal';
import crestImage from '../../assets/maksci-07-crest.png';

interface TabHeroProps {
  navTabs: NavTab[];
  navActiveKey: string;
  onNavSelect: (key: string) => void;
  activeTab: string;
  adminViewActive: boolean;
  canAccessOrganizerView: boolean;
  onToggleAdminView: () => void;
  currentUser: UserProfile;
  onLogout: () => void;
  onEditProfile: () => void;
  totalPledges: number;
  totalSurveys: number;
  eventDetails: EventDetails;
  mySurveyResponse: SurveyResponse | null;
  rsvps: PublicRSVP[];
  onNavigateToSurvey: () => void;
}

// The hero wash, as a class rather than an inline style so it can be turned
// off at the desktop breakpoint (inline styles can't carry a media query).
const GRADIENT = 'bg-[linear-gradient(168deg,#0d2620_0%,#123b32_48%,#1d4a3c_100%)]';

const getInitials = (fullName: string): string =>
  fullName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

const HERO_COPY: Record<string, { title: string; sub: string }> = {
  survey: {
    title: 'Reunion Planning Survey',
    sub: 'Editable anytime. Help us choose the best date, venue style, and batch fund target.',
  },
  directory: {
    title: 'The Batch of 2007',
    sub: 'Search by name, section, or city and see who you have not talked to in twenty years.',
  },
  photos: {
    title: 'Photo Wall',
    sub: 'Halungkatin ang mga lumang USB drives and create and fill albums together. We’ll project this live on reunion day.',
  },
  dashboard: {
    title: 'Operating Funds',
    sub: 'Para transparent. You can see here the running pledge amount. The committee publishes expenses in the ledger.',
  },
  admin: {
    title: 'Organizer Portal',
    sub: 'Manage the event, ledger, and announcements behind the scenes.',
  },
};

export const TabHero: React.FC<TabHeroProps> = ({
  navTabs,
  navActiveKey,
  onNavSelect,
  activeTab,
  adminViewActive,
  canAccessOrganizerView,
  onToggleAdminView,
  currentUser,
  onLogout,
  onEditProfile,
  totalPledges,
  totalSurveys,
  eventDetails,
  mySurveyResponse,
  rsvps,
  onNavigateToSurvey,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const firstName = currentUser.fullName.trim().split(/\s+/)[0] || '';
  const isFinalized = eventDetails.status === 'Finalized';

  const boardCopy = {
    title: 'Dalawang dekada na, musta na u?',
    sub: isFinalized
      ? 'The official date and venue have been confirmed by the committee. Please submit your RSVP and pledge.'
      : 'Please share your preferred schedule, venue style, and batch fund pledge so we can finalize the arrangements.',
  };
  const copy = activeTab === 'board' ? boardCopy : (HERO_COPY[activeTab] || HERO_COPY.admin);

  // Headcount — computed from the live RSVP roster (see BatchBoardSection),
  // only shown on the Board tab.
  const attendingList = rsvps.filter(r => r.status === 'Attending');
  const maybeList = rsvps.filter(r => r.status === 'Most likely' || r.status === 'Maybe');
  // Guests come from everyone still in play, not just the confirmed: a "most
  // likely" answer bringing five guests already has its own head in
  // totalHeadcount, so counting the party only for 'Attending' silently
  // dropped those five from the estimate.
  const expectedList = [...attendingList, ...maybeList];
  const plusOnesTotal = expectedList.reduce((acc, r) => acc + (r.plusOnesCount ?? (r.bringingPlusOne ? 1 : 0)), 0);
  const kidsTotal = expectedList.reduce((acc, r) => acc + (r.kidsCount || 0), 0);
  const guestsTotal = plusOnesTotal + kidsTotal;
  const totalHeadcount = attendingList.length + guestsTotal + maybeList.length;
  const pctOf = (n: number) => totalHeadcount > 0 ? `${Math.round((n / totalHeadcount) * 100)}%` : '0%';

  return (
    <>
      {/* Crest / brand / nav / avatar row — a sibling of the hero body (not
          nested inside it) so it can stay sticky across the ENTIRE page
          scroll, not just while the (short) hero itself is in view. Pinned
          on mobile; static and part of the normal flow on desktop, where
          the pill nav already sits inline. */}
      <div className="contents @min-[700px]/app:block @min-[700px]/app:relative">

      {/* Desktop-only backdrop for the crest row + hero together. Mobile keeps
          the flat band on the row and the gradient on the hero below, which is
          why this is hidden there — and why the hero's own gradient/blobs are
          switched off above the breakpoint, so the wash is painted once. */}
      <div className={`hidden @min-[700px]/app:block absolute inset-0 overflow-hidden pointer-events-none ${GRADIENT}`} aria-hidden="true">
        <span className="absolute rounded-full" style={{ top: '-26%', left: '-12%', width: '62%', height: '110%', background: 'radial-gradient(circle,rgba(18,120,102,.6),transparent 66%)', filter: 'blur(26px)' }} />
        <span className="absolute rounded-full" style={{ top: '-20%', right: '-16%', width: '66%', height: '110%', background: 'radial-gradient(circle,rgba(214,152,45,.44),transparent 66%)', filter: 'blur(30px)' }} />
        <span className="absolute rounded-full" style={{ bottom: '-40%', left: '22%', width: '66%', height: '96%', background: 'radial-gradient(circle,rgba(176,86,79,.36),transparent 70%)', filter: 'blur(32px)' }} />
      </div>

      <div className="sticky top-0 z-30 @min-[700px]/app:static @min-[700px]/app:z-10 @min-[700px]/app:pt-[22px] bg-[#0d2620] @min-[700px]/app:bg-transparent">
        <div className="relative w-full max-w-[1180px] mx-auto px-5 @min-[700px]/app:px-8 py-3.5 @min-[700px]/app:py-0 flex items-center gap-3">
        <img
          src={crestImage}
          alt="MakSci '07 crest"
          className="w-11 h-11 @min-[700px]/app:w-[52px] @min-[700px]/app:h-[52px] rounded-full object-cover bg-white flex-shrink-0"
          style={{ boxShadow: '0 0 0 3px rgba(255,255,255,.16)' }}
        />
        <div className="flex flex-col gap-0.5">
          <span className="font-sans text-label font-bold text-[#f2ece1]">Knights @ 20</span>
          <span className="font-mono text-label tracking-[0.16em] uppercase text-[#f6e6bf]/70">MakSci Batch '07 Reunion</span>
        </div>

        <DesktopNav tabs={navTabs} activeTab={navActiveKey} setActiveTab={onNavSelect} />

        <div className="relative flex-shrink-0 ml-auto" ref={menuRef}>
          <button
            id="btn-profile-avatar"
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            title={currentUser.fullName}
            className="flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full bg-white/[0.12] backdrop-blur-md border border-white/20"
          >
            <span className="relative w-6.5 h-6.5 rounded-full overflow-hidden flex items-center justify-center font-bold text-label text-white flex-shrink-0" style={{ background: 'linear-gradient(150deg,#d6982d,#b0564f)' }}>
              {currentUser.nowPhotoUrl ? (
                <img src={currentUser.nowPhotoUrl} alt={currentUser.fullName} className="w-full h-full object-cover" />
              ) : (
                <span>{getInitials(currentUser.fullName)}</span>
              )}
            </span>
            <span className="font-sans text-body font-semibold text-[#f2ece1]">{firstName}</span>
          </button>

          {menuOpen && (
            <div
              id="profile-menu"
              className="absolute right-0 top-full mt-2 w-52 bg-surface-container-lowest rounded shadow-soft overflow-hidden z-50"
            >
              <div className="px-3 py-2.5 border-b border-outline-variant/40">
                <p className="text-body font-semibold text-on-surface truncate">{currentUser.fullName}</p>
                <p className="text-body text-on-surface-variant truncate">{currentUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => { onEditProfile(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-body text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
              {canAccessOrganizerView && (
                <button
                  id="btn-toggle-admin-view"
                  type="button"
                  onClick={() => { onToggleAdminView(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-body text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>{adminViewActive ? 'To attendee view' : 'To organizer view'}</span>
                </button>
              )}
              <button
                id="btn-logout"
                type="button"
                onClick={() => { onLogout(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-body text-error hover:bg-error-container/30 transition-colors border-t border-outline-variant/40"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
        </div>
      </div>

      <div className={`relative @min-[700px]/app:bg-none ${GRADIENT}`}>
        {/* Ambient color blobs — mobile only; on desktop they come from the
            shared backdrop that also covers the crest row (see above). */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none @min-[700px]/app:hidden" aria-hidden="true">
          <span className="absolute rounded-full" style={{ top: '-26%', left: '-12%', width: '62%', height: '110%', background: 'radial-gradient(circle,rgba(18,120,102,.6),transparent 66%)', filter: 'blur(26px)' }} />
          <span className="absolute rounded-full" style={{ top: '-20%', right: '-16%', width: '66%', height: '110%', background: 'radial-gradient(circle,rgba(214,152,45,.44),transparent 66%)', filter: 'blur(30px)' }} />
          <span className="absolute rounded-full" style={{ bottom: '-40%', left: '22%', width: '66%', height: '96%', background: 'radial-gradient(circle,rgba(176,86,79,.36),transparent 70%)', filter: 'blur(32px)' }} />
        </div>

        {/* Title / subtitle / (Board-only) headcount card */}
        <div
          className={`relative w-full max-w-[1180px] mx-auto px-5 @min-[700px]/app:px-8 pt-5 @min-[700px]/app:pt-6 pb-4 @min-[700px]/app:pb-[30px] @min-[700px]/app:min-h-[130px] flex flex-col gap-4 ${
            activeTab === 'board'
              ? '@min-[700px]/app:gap-[18px]'
              : '@min-[700px]/app:flex-row @min-[700px]/app:items-end @min-[700px]/app:gap-[46px]'
          }`}
        >
          <div className={`min-w-0 flex flex-col gap-2.5 ${activeTab === 'board' ? 'flex-none' : 'flex-1 @min-[700px]/app:basis-[300px]'}`}>
            <h1 className="max-w-[22ch] font-serif text-display leading-[1.02] tracking-[-0.022em] text-[#f2ece1]">
              {copy.title}
            </h1>
            <p className="max-w-[46ch] text-body leading-[1.62] text-[#f2ece1]/66">{copy.sub}</p>
          </div>

          {activeTab === 'board' && (
            <div className="flex-none w-full @min-[700px]/app:max-w-[46ch] flex flex-col gap-2.5">
              <div className="p-4 @min-[700px]/app:p-3.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex flex-col gap-3">
                <span className="font-mono text-label tracking-[0.14em] uppercase text-[#f6e6bf]/62">Total Headcount</span>
                {/* Grid, not flex: the figure spans all three label rows and
                    self-centers within them, so it stays vertically centred
                    against the stack it sums up no matter how many digits it
                    has or how the label lines wrap.

                    lining-nums is load-bearing, not cosmetic. Playfair
                    Display defaults to OLDSTYLE figures, where 3/4/5/7/9
                    descend below the baseline, 6/8 ascend and 0/1/2 sit at
                    x-height. That makes the ink's centre move by up to
                    0.17em depending on which digits are showing, so no
                    fixed alignment can hold: a centred "5" hangs low, and
                    the figure would visibly jump as RSVPs come in. Lining
                    figures give every digit the same cap-top-to-baseline
                    extent; tabular-nums keeps the width stable too.

                    With that fixed, one constant nudge finishes the job.
                    Centring aligns the LINE BOX, but Playfair's em box is
                    lopsided (ascender 1.087em, descender 0.26em), which
                    drops the baseline low inside it. Measured at 46px:
                    baseline 42px, ink 11-42px, so ink centre 26.5px vs box
                    centre 23px = 3.5px, i.e. 0.076em. In em so it scales
                    with the responsive font size. */}
                <div className="grid grid-cols-[auto_1fr_auto] items-start gap-x-4 @min-[700px]/app:gap-x-3">
                  <span className="row-start-1 row-span-3 col-start-1 self-center -translate-y-[0.076em] font-serif text-display leading-none lining-nums tabular-nums text-[#f6e6bf]">{totalHeadcount}</span>
                  <span className="row-start-1 col-start-2 self-center font-sans text-label font-semibold text-[#f2ece1]/82">{attendingList.length} alumni</span>
                  <span className="row-start-2 col-start-2 mt-1 font-sans text-label font-semibold text-[#f0c674]">+{guestsTotal} guests &amp; kids</span>
                  <span className="row-start-3 col-start-2 mt-1 font-sans text-label font-semibold text-[#e9a49d]">{maybeList.length} still deciding</span>
                  <button
                    type="button"
                    onClick={onNavigateToSurvey}
                    className="row-start-1 row-span-3 col-start-3 self-center ml-auto rounded-full bg-[#f6e6bf] text-[#0d2620] font-bold font-sans px-5 py-3 @min-[700px]/app:px-3.5 @min-[700px]/app:py-2.5 text-body"
                  >
                    {mySurveyResponse ? 'Edit RSVP' : 'Submit RSVP'}
                  </button>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-white/[0.14]">
                  <div className="h-full" style={{ width: pctOf(attendingList.length), background: 'linear-gradient(90deg,#7fd8c4,#2f9c85)' }} />
                  <div className="h-full" style={{ width: pctOf(guestsTotal), background: 'linear-gradient(90deg,#f0c674,#d6982d)' }} />
                  <div className="h-full" style={{ width: pctOf(maybeList.length), background: 'rgba(233,164,157,.75)' }} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-dashed border-white/22">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-label tracking-[0.14em] uppercase text-[#f6e6bf]/62">Batch fund</span>
                    <span className="font-serif text-heading text-[#f2ece1]">{formatPHP(totalPledges)}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-label tracking-[0.14em] uppercase text-[#f6e6bf]/62">Responses</span>
                    <span className="font-serif text-heading text-[#f2ece1]">{totalSurveys}</span>
                  </div>
                  <span className="text-label text-[#f2ece1]/50">
                    {totalHeadcount === 0 ? 'Waiting for the first RSVP' : ''}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTicketOpen(true)}
                className="self-center @min-[700px]/app:self-start flex items-center justify-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-md font-sans text-body font-bold tracking-[0.02em] text-[#f6e6bf]"
                style={{ background: 'rgba(246,230,191,.14)', border: '1px dashed rgba(246,230,191,.55)' }}
              >
                View my ticket
              </button>
            </div>
          )}
        </div>
      </div>

      </div>

      {ticketOpen && (
        <TicketModal
          eventDetails={eventDetails}
          mySurveyResponse={mySurveyResponse}
          currentUser={currentUser}
          onClose={() => setTicketOpen(false)}
          onNavigateToSurvey={() => { setTicketOpen(false); onNavigateToSurvey(); }}
        />
      )}
    </>
  );
};
