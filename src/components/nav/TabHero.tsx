import React, { useEffect, useRef, useState } from 'react';
import { LogOut, Pencil, ArrowLeftRight } from 'lucide-react';
import { EventDetails, SurveyResponse, UserProfile } from '../../types';
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
  eventDetails: EventDetails;
  mySurveyResponse: SurveyResponse | null;
  onNavigateToSurvey: () => void;
}

// The hero wash, as a class rather than an inline style so it can be turned
// off at the desktop breakpoint (inline styles can't carry a media query).
const GRADIENT = 'bg-[linear-gradient(168deg,#0d2620_0%,#123b32_48%,#1d4a3c_100%)]';

// The organizer half of the app reverses the palette — paper chrome over the
// green body painted by index.css's [data-app-view="back-office"] layers. Same
// gradient geometry, warm-paper stops, so the two views read as one product.
const GRADIENT_ORGANIZER = 'bg-[linear-gradient(168deg,#faf6ea_0%,#f2ece1_48%,#e7ddcd_100%)]';

// The three ambient blobs, rendered both by the desktop backdrop (which spans
// the crest row and hero together) and by the mobile hero. Organizer runs them
// at roughly a third of the alpha: on paper they only need to tint the ground,
// where on the dark hero they colour it.
const HeroBlobs: React.FC<{ backOffice: boolean }> = ({ backOffice }) => {
  const [green, gold, terracotta] = backOffice ? [0.2, 0.22, 0.16] : [0.6, 0.44, 0.36];
  return (
    <>
      <span className="absolute rounded-full" style={{ top: '-26%', left: '-12%', width: '62%', height: '110%', background: `radial-gradient(circle,rgba(18,120,102,${green}),transparent 66%)`, filter: 'blur(26px)' }} />
      <span className="absolute rounded-full" style={{ top: '-20%', right: '-16%', width: '66%', height: '110%', background: `radial-gradient(circle,rgba(214,152,45,${gold}),transparent 66%)`, filter: 'blur(30px)' }} />
      <span className="absolute rounded-full" style={{ bottom: '-40%', left: '22%', width: '66%', height: '96%', background: `radial-gradient(circle,rgba(176,86,79,${terracotta}),transparent 70%)`, filter: 'blur(32px)' }} />
    </>
  );
};

const getInitials = (fullName: string): string =>
  fullName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

const HERO_COPY: Record<string, { title: React.ReactNode; sub: string }> = {
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

// The organizer view is a single attendee tab ('admin') carrying six tabs of
// its own, so its hero copy is keyed by the ADMIN_NAV_TABS key rather than by
// activeTab — which is why this is a second map instead of more entries above.
// HERO_COPY.admin stays as the fallback for the no-organizer-access state.
const ADMIN_HERO_COPY: Record<string, { title: React.ReactNode; sub: string }> = {
  event: {
    title: 'Event Planning',
    sub: 'Set the date, venue, and dress code. Whatever you save here publishes straight to the attendee banner.',
  },
  responses: {
    title: 'Survey Responses',
    sub: 'Every submission, the pledge parsed out of it, and who still has to pay.',
  },
  funds: {
    title: 'Operating Ledger',
    sub: 'Pledges in, planned expenses out, and what the batch fund actually has left.',
  },
  announcements: {
    title: 'Bulletin',
    sub: 'Write, tag, and pin the announcements that land on the batch board.',
  },
  rsvp: {
    title: 'RSVP Roster',
    sub: 'Confirmed heads, guests and kids, and the batchmates still deciding.',
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
  eventDetails,
  mySurveyResponse,
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

  // Chrome palette. Everything below reads from these rather than testing
  // adminViewActive inline, so the two variants stay legible side by side.
  const org = adminViewActive;
  const gradient = org ? GRADIENT_ORGANIZER : GRADIENT;
  // Paper chrome sits directly against the green body, so it needs a hairline
  // to separate them. The dark chrome never did — it met the parchment body
  // with a full tonal jump.
  const chromeEdge = org ? 'border-b border-outline-variant' : '';
  const textPrimary = org ? 'text-on-surface' : 'text-[#f2ece1]';
  const textMuted = org ? 'text-on-surface-variant' : 'text-[#f6e6bf]/70';
  const glassChip = org
    ? 'bg-[#14211d]/[0.05] border-[#14211d]/10'
    : 'bg-white/[0.12] border-white/20';

  const boardCopy = {
    // Two lines by construction, not by luck. Left to wrap on its own the
    // break moves with the viewport and lands mid-phrase; the comma is where
    // the line wants to turn. Each half is its own block rather than a <br>,
    // so if a very narrow screen forces one of them to wrap further, it wraps
    // inside its own half instead of rejoining the other.
    title: (
      <>
        <span className="block">Dalawang dekada na,</span>
        <span className="block italic">musta na u?</span>
      </>
    ),
    sub: isFinalized
      ? 'The official date and venue have been confirmed by the committee. Please submit your RSVP and pledge.'
      : 'Please share your preferred schedule, venue style, and batch fund pledge so we can finalize the arrangements.',
  };
  // The no-access state still renders the organizer shell, but none of the six
  // tabs — naming one of them in the hero above "You don't have organizer
  // access." would be a lie, so it keeps the generic portal copy.
  const copy = adminViewActive && canAccessOrganizerView
    ? (ADMIN_HERO_COPY[navActiveKey] || HERO_COPY.admin)
    : activeTab === 'board'
      ? boardCopy
      : (HERO_COPY[activeTab] || HERO_COPY.admin);

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
      <div className={`hidden @min-[700px]/app:block absolute inset-0 overflow-hidden pointer-events-none ${gradient} ${chromeEdge}`} aria-hidden="true">
        <HeroBlobs backOffice={org} />
      </div>

      <div className={`sticky top-0 z-30 @min-[700px]/app:static @min-[700px]/app:z-10 @min-[700px]/app:pt-[22px] @min-[700px]/app:bg-transparent @min-[700px]/app:border-b-0 ${
        org ? `bg-surface-container ${chromeEdge}` : 'bg-[#0d2620]'
      }`}>
        <div className="relative w-full max-w-[1180px] mx-auto px-5 @min-[700px]/app:px-8 py-3.5 @min-[700px]/app:py-0 flex items-center gap-3">
        <img
          src={crestImage}
          alt="MakSci '07 crest"
          className="w-11 h-11 @min-[700px]/app:w-[52px] @min-[700px]/app:h-[52px] rounded-full object-cover bg-white flex-shrink-0"
          style={{ boxShadow: org ? '0 0 0 3px rgba(20,33,29,.07)' : '0 0 0 3px rgba(255,255,255,.16)' }}
        />
        <div className="flex flex-col gap-0.5">
          <span className={`font-sans text-label font-bold ${textPrimary}`}>Knights @ 20</span>
          <span className={`font-mono text-label tracking-[0.16em] uppercase ${textMuted}`}>MakSci Batch '07 Reunion</span>
        </div>

        <DesktopNav tabs={navTabs} activeTab={navActiveKey} setActiveTab={onNavSelect} backOffice={org} />

        <div className="relative flex-shrink-0 ml-auto" ref={menuRef}>
          <button
            id="btn-profile-avatar"
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            title={currentUser.fullName}
            className={`flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full backdrop-blur-md border ${glassChip}`}
          >
            <span className="relative w-6.5 h-6.5 rounded-full overflow-hidden flex items-center justify-center font-bold text-label text-white flex-shrink-0" style={{ background: 'linear-gradient(150deg,#d6982d,#b0564f)' }}>
              {currentUser.nowPhotoUrl ? (
                <img src={currentUser.nowPhotoUrl} alt={currentUser.fullName} className="w-full h-full object-cover" />
              ) : (
                <span>{getInitials(currentUser.fullName)}</span>
              )}
            </span>
            <span className={`font-sans text-body font-semibold ${textPrimary}`}>{firstName}</span>
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

      <div className={`relative @min-[700px]/app:bg-none @min-[700px]/app:border-b-0 ${gradient} ${chromeEdge}`}>
        {/* Ambient color blobs — mobile only; on desktop they come from the
            shared backdrop that also covers the crest row (see above). */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none @min-[700px]/app:hidden" aria-hidden="true">
          <HeroBlobs backOffice={org} />
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
            <h1 className={`max-w-[22ch] font-serif text-display leading-[1.02] tracking-[-0.022em] ${org ? 'text-on-surface' : 'text-[#f2ece1]'}`}>
              {copy.title}
            </h1>
            <p className={`max-w-[46ch] text-body leading-[1.62] ${org ? 'text-on-surface-variant' : 'text-[#f2ece1]/66'}`}>{copy.sub}</p>
          </div>

          {/* The headcount card used to live here; it now sits above the
              announcements on the board itself (BatchBoardSection). */}
          {activeTab === 'board' && (
            <div className="flex-none">
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
