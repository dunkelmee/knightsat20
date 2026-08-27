/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Header
} from './components/Header';
import {
  PendingBanner
} from './components/PendingBanner';
import {
  SurveySection
} from './components/SurveySection';
import {
  BatchBoardSection
} from './components/BatchBoardSection';
import {
  PublicDashboardSection
} from './components/PublicDashboardSection';
import {
  DirectorySection
} from './components/DirectorySection';
import {
  PhotoWallSection
} from './components/photowall/PhotoWallSection';
import {
  AdminPortal
} from './components/admin/AdminPortal';
import {
  SuperadminPortal
} from './components/superadmin/SuperadminPortal';
import {
  ProfileEditModal
} from './components/ProfileEditModal';
import {
  AuthGate
} from './components/auth/AuthGate';
import {
  ProfileSetup
} from './components/auth/ProfileSetup';
import {
  MobileNav, NAV_TABS, ADMIN_NAV_TABS
} from './components/nav/AppNav';
import {
  SurveyResponse,
  SurveyResponseCreate,
  PlannedExpense,
  Announcement,
  RSVPRecord,
  PublicRSVP,
  ScoutedVenue,
  EventDetails,
  DashboardStats,
  UserProfile
} from './types';
import * as api from './api/client';

const DEFAULT_EVENT_DETAILS: EventDetails = {
  status: 'Pending',
  date: 'Pending / For finalization',
  venue: 'Pending / For finalization',
};

const DEFAULT_STATS: DashboardStats = {
  totalSurveys: 0,
  totalPledges: 0,
  totalExpenses: 0,
  runningBalance: 0,
  attendingCount: 0,
  likelyCount: 0,
  undecidedCount: 0,
  declinedCount: 0,
  estimatedHeadcount: 0,
  pledgingCount: 0,
  monthTally: {},
  venueTally: {},
};

export default function App() {
  // Navigation & Admin State
  const [activeTab, setActiveTab] = useState<string>('survey'); // Emphasis on survey first!
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  // The superadmin is a wholly separate identity (env-configured email +
  // password, not a `User` row) — see AuthGate's superadmin-password step.
  // When true, the entire attendee/organizer app is bypassed in favor of
  // SuperadminPortal.
  const [isSuperadmin, setIsSuperadmin] = useState(false);

  // Admin view — activeTab === 'admin' is the signal that the admin view is
  // showing (in place of the attendee tabs, not alongside them); adminTab is
  // which admin sub-tab is selected, and lastAttendeeTab remembers where to
  // return to when switching back (see the avatar toggle in Header.tsx).
  const [adminTab, setAdminTab] = useState<string>('event');
  const [lastAttendeeTab, setLastAttendeeTab] = useState<string>('survey');
  useEffect(() => {
    if (activeTab !== 'admin') setLastAttendeeTab(activeTab);
  }, [activeTab]);

  // Site-wide login — the whole app is gated behind this (see AuthGate).
  // Organizer access now travels with the account (currentUser.isOrganizer,
  // granted only by the superadmin) rather than a separate in-app unlock.
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [hasSubmittedSurvey, setHasSubmittedSurvey] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  // Public data, backed by the FastAPI + Postgres API (see backend/)
  const [eventDetails, setEventDetails] = useState<EventDetails>(DEFAULT_EVENT_DETAILS);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [expenses, setExpenses] = useState<PlannedExpense[]>([]);
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [publicRsvps, setPublicRsvps] = useState<PublicRSVP[]>([]);

  // Organizer-only data (contains contact info) — only ever fetched once
  // currentUser.isOrganizer is true, so PII never reaches a non-organizer.
  const [adminResponses, setAdminResponses] = useState<SurveyResponse[]>([]);
  const [adminRsvps, setAdminRsvps] = useState<RSVPRecord[]>([]);
  const [scoutedVenues, setScoutedVenues] = useState<ScoutedVenue[]>([]);

  // Fetches everything the logged-in app needs; only ever called once a user
  // session exists, since every one of these endpoints now requires login.
  const loadAppData = async () => {
    const [details, anns, exps, dashStats, rsvpList] = await Promise.all([
      api.fetchEventDetails(),
      api.fetchAnnouncements(),
      api.fetchExpenses(),
      api.fetchDashboardStats(),
      api.fetchPublicRsvps(),
    ]);
    setEventDetails(details);
    setAnnouncements(anns);
    setExpenses(exps);
    setStats(dashStats);
    setPublicRsvps(rsvpList);
  };

  // Enters the main app for an already-onboarded user: loads app data and
  // picks the landing tab — the Batch Board (announcements + roster) if
  // they've already answered the survey (on this or an earlier login),
  // otherwise the Survey.
  const enterApp = async (user: UserProfile, submitted: boolean) => {
    await loadAppData();
    setHasSubmittedSurvey(submitted);
    setActiveTab(submitted ? 'board' : 'survey');
    setCurrentUser(user);
  };

  // Initial bootstrap: check for an existing login session (cookie from a
  // previous visit) before fetching anything else — every other endpoint
  // requires login, so there's nothing to fetch until we know who's asking.
  // Checked alongside the (mutually exclusive) superadmin session, since
  // that's a completely separate identity with no `users` row of its own.
  useEffect(() => {
    (async () => {
      const [authSession, superadminSession] = await Promise.all([
        api.fetchAuthSession(),
        api.fetchSuperadminSession(),
      ]);
      if (superadminSession.isSuperadmin) {
        setIsSuperadmin(true);
        setIsBootstrapped(true);
        return;
      }
      const { user, hasSubmittedSurvey: submitted } = authSession;
      if (user) {
        if (user.onboardingCompleted) {
          await enterApp(user, submitted);
        } else {
          // First login after registration — profile setup hasn't been
          // completed yet, so there's nothing else to fetch until it is.
          setHasSubmittedSurvey(submitted);
          setCurrentUser(user);
        }
      }
      setIsBootstrapped(true);
    })();
  }, []);

  // Handler: called by AuthGate once login/registration + OTP verification succeed.
  const handleAuthenticated = async (user: UserProfile, submitted: boolean) => {
    if (user.onboardingCompleted) {
      await enterApp(user, submitted);
    } else {
      setHasSubmittedSurvey(submitted);
      setCurrentUser(user);
    }
  };

  // Handler: called by AuthGate once the superadmin password step succeeds.
  const handleSuperadminAuthenticated = async () => {
    setIsSuperadmin(true);
  };

  // Handler: called by ProfileSetup once the one-time profile (name, mobile,
  // then/now photos) is saved — proceeds straight into the app.
  const handleProfileSaved = async (user: UserProfile, submitted: boolean) => {
    await enterApp(user, submitted);
  };

  // Handler: full logout — clears the server-side session (attendee or
  // superadmin, whichever is active) and all locally-held data.
  const handleLogout = async () => {
    await api.authLogout().catch(() => {});
    setCurrentUser(null);
    setHasSubmittedSurvey(false);
    setIsSuperadmin(false);
    setAdminResponses([]);
    setAdminRsvps([]);
    setScoutedVenues([]);
    setAdminTab('event');
    setActiveTab('survey');
  };

  // Load / clear organizer-only data whenever the account's organizer status changes.
  useEffect(() => {
    if (!currentUser?.isOrganizer) {
      setAdminResponses([]);
      setAdminRsvps([]);
      setScoutedVenues([]);
      return;
    }
    (async () => {
      const [responses, rsvps, venues] = await Promise.all([
        api.fetchSurveyResponses(),
        api.fetchAdminRsvps(),
        api.fetchScoutedVenues(),
      ]);
      setAdminResponses(responses);
      setAdminRsvps(rsvps);
      setScoutedVenues(venues);
    })();
  }, [currentUser?.isOrganizer]);

  // Handler: Save Event Details
  const handleSaveEventDetails = async (newDetails: EventDetails) => {
    setEventDetails(await api.updateEventDetails(newDetails));
  };

  // Handler: Survey Submitted
  const handleSurveySubmitted = async (newResponse: SurveyResponseCreate) => {
    const created = await api.createSurveyResponse(newResponse);
    setHasSubmittedSurvey(true);
    if (currentUser?.isOrganizer) setAdminResponses(prev => [created, ...prev]);

    // The backend may have auto-created/updated an RSVP from this submission
    // (see POST /api/survey-responses) — refresh the aggregates that depend on it.
    const [newStats, newPublicRsvps] = await Promise.all([
      api.fetchDashboardStats(),
      api.fetchPublicRsvps(),
    ]);
    setStats(newStats);
    setPublicRsvps(newPublicRsvps);
    if (currentUser?.isOrganizer) setAdminRsvps(await api.fetchAdminRsvps());
  };

  // Handler: Direct RSVP Submitted
  const handleRsvpSubmitted = async (newRsvp: RSVPRecord) => {
    const saved = await api.createOrUpdateRsvp(newRsvp);
    const publicVersion: PublicRSVP = {
      id: saved.id,
      submittedAt: saved.submittedAt,
      fullName: saved.fullName,
      status: saved.status,
      bringingPlusOne: saved.bringingPlusOne,
      kidsCount: saved.kidsCount,
      messageToBatch: saved.messageToBatch,
    };
    setPublicRsvps(prev => {
      const idx = prev.findIndex(r => r.id === publicVersion.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = publicVersion;
        return updated;
      }
      return [publicVersion, ...prev];
    });
    if (currentUser?.isOrganizer) {
      setAdminRsvps(prev => {
        const idx = prev.findIndex(r => r.id === saved.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [saved, ...prev];
      });
    }
  };

  // Handler: Delete Survey Response
  const handleDeleteResponse = async (id: string) => {
    await api.deleteSurveyResponse(id);
    setAdminResponses(prev => prev.filter(r => r.id !== id));
    setStats(await api.fetchDashboardStats());
  };

  // Handler: Update Payment Status
  const handleUpdatePaymentStatus = async (id: string, status: SurveyResponse['pledgePaidStatus']) => {
    const updated = await api.updatePaymentStatus(id, status);
    setAdminResponses(prev => prev.map(r => r.id === id ? updated : r));
  };

  // Handler: Save / Edit Expense
  const handleSaveExpense = async (expense: PlannedExpense) => {
    const exists = expenses.some(e => e.id === expense.id);
    const saved = exists
      ? await api.updateExpense(expense.id, expense)
      : await api.createExpense(expense);
    setExpenses(prev => {
      const idx = prev.findIndex(e => e.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
    setStats(await api.fetchDashboardStats());
  };

  // Handler: Delete Expense
  const handleDeleteExpense = async (id: string) => {
    await api.deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    setStats(await api.fetchDashboardStats());
  };

  // Handler: Save / Edit Announcement
  const handleSaveAnnouncement = async (ann: Announcement) => {
    const exists = announcements.some(a => a.id === ann.id);
    const saved = exists
      ? await api.updateAnnouncement(ann.id, ann)
      : await api.createAnnouncement(ann);
    setAnnouncements(prev => {
      const idx = prev.findIndex(a => a.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
  };

  // Handler: Delete Announcement
  const handleDeleteAnnouncement = async (id: string) => {
    await api.deleteAnnouncement(id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  // Handler: Toggle Pin Announcement
  const handleTogglePinAnnouncement = async (id: string) => {
    const updated = await api.togglePinAnnouncement(id);
    setAnnouncements(prev => prev.map(a => a.id === id ? updated : a));
  };

  // Handler: Like Announcement
  const handleLikeAnnouncement = async (id: string) => {
    const updated = await api.likeAnnouncement(id);
    setAnnouncements(prev => prev.map(a => a.id === id ? updated : a));
  };

  // Handler: Save / Edit Scouted Venue
  const handleSaveVenue = async (venue: ScoutedVenue) => {
    const exists = scoutedVenues.some(v => v.id === venue.id);
    const saved = exists
      ? await api.updateScoutedVenue(venue.id, venue)
      : await api.createScoutedVenue(venue);
    setScoutedVenues(prev => {
      const idx = prev.findIndex(v => v.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
  };

  // Handler: Delete Scouted Venue
  const handleDeleteVenue = async (id: string) => {
    await api.deleteScoutedVenue(id);
    setScoutedVenues(prev => prev.filter(v => v.id !== id));
  };

  if (!isBootstrapped) {
    return (
      <div className="min-h-screen bg-background text-on-background flex items-center justify-center font-sans">
        <div className="text-sm text-on-surface-variant">Loading Batch 2007 Reunion Hub…</div>
      </div>
    );
  }

  // The superadmin never touches the attendee/organizer app at all — a
  // completely separate, self-contained portal.
  if (isSuperadmin) {
    return <SuperadminPortal onLogout={handleLogout} />;
  }

  // The entire site is gated behind login — no announcements, dashboard, or
  // survey are reachable without an account.
  if (!currentUser) {
    return <AuthGate onAuthenticated={handleAuthenticated} onSuperadminAuthenticated={handleSuperadminAuthenticated} />;
  }

  // One-time profile setup (name/mobile confirmation + Then & Now photos)
  // right after the very first login, before anything else is reachable.
  if (!currentUser.onboardingCompleted) {
    return <ProfileSetup currentUser={currentUser} onSaved={handleProfileSaved} />;
  }

  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdminTab = (tab: string) => {
    setAdminTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Avatar menu link — jumps into the organizer view or back to wherever the
  // attendee was last. Only offered at all when the account has organizer
  // access (see Header.tsx); there's no passcode gate to fall back to anymore.
  const handleToggleAdminView = () => {
    navigateToTab(activeTab === 'admin' ? lastAttendeeTab : 'admin');
  };

  const adminViewActive = activeTab === 'admin';
  const navTabs = adminViewActive ? (currentUser.isOrganizer ? ADMIN_NAV_TABS : []) : NAV_TABS;
  const navActiveKey = adminViewActive ? adminTab : activeTab;
  const navOnSelect = adminViewActive ? navigateToAdminTab : navigateToTab;

  return (
    <div className="@container/app min-h-screen bg-background text-on-background flex flex-col font-sans selection:bg-primary-container selection:text-on-primary-container">

      {/* Paper-grain texture overlay */}
      <div className="paper-grain" aria-hidden="true" />

      {/* Header */}
      <Header
        navTabs={navTabs}
        navActiveKey={navActiveKey}
        onNavSelect={navOnSelect}
        adminViewActive={adminViewActive}
        canAccessOrganizerView={currentUser.isOrganizer}
        onToggleAdminView={handleToggleAdminView}
        currentUser={currentUser}
        onLogout={handleLogout}
        onEditProfile={() => setShowProfileEdit(true)}
      />

      {/* Edit-Profile Modal (full name & mobile number) */}
      {currentUser && (
        <ProfileEditModal
          isOpen={showProfileEdit}
          currentUser={currentUser}
          onClose={() => setShowProfileEdit(false)}
          onSaved={(user) => {
            setCurrentUser(user);
            setShowProfileEdit(false);
          }}
        />
      )}

      {/* Prominent Pending Date & Venue Banner — only on the Batch Board tab,
          which is the hero-carrying landing page once a survey's been
          answered. Survey/Funds/Directory/Photos all get their own headers. */}
      {activeTab === 'board' && (
        <PendingBanner
          totalSurveys={stats.totalSurveys}
          totalPledges={stats.totalPledges}
          eventDetails={eventDetails}
          onTakeSurveyClick={() => {
            setActiveTab('survey');
            const el = document.getElementById('survey-form-container');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* Main Content Body — extra bottom padding on mobile so content clears
          the floating bottom nav (see AppNav.tsx's MobileNav) */}
      <main className="flex-1 pb-24 @min-[700px]/app:pb-16">

        {/* Tab 1: Survey Form (Highlighted as #1 Priority) */}
        {activeTab === 'survey' && (
          <SurveySection
            submitterName={currentUser.fullName}
            onSurveySubmitted={handleSurveySubmitted}
            onNavigateToRsvp={() => setActiveTab('board')}
          />
        )}

        {/* Tab 2: Batch Board — Announcements + Attendee Roster, combined */}
        {activeTab === 'board' && (
          <BatchBoardSection
            announcements={announcements}
            onLikeAnnouncement={handleLikeAnnouncement}
            onOpenAdminToPost={() => setActiveTab('admin')}
            rsvps={publicRsvps}
            onRsvpSubmitted={handleRsvpSubmitted}
          />
        )}

        {/* Tab 3: Directory — Then & Now roster */}
        {activeTab === 'directory' && <DirectorySection />}

        {/* Tab 4: Photo Wall — collaborative albums */}
        {activeTab === 'photos' && <PhotoWallSection currentUser={currentUser} isOrganizer={currentUser.isOrganizer} />}

        {/* Tab 5: Public Dashboard & Funds Transparency */}
        {activeTab === 'dashboard' && (
          <PublicDashboardSection
            stats={stats}
            expenses={expenses}
            eventDetails={eventDetails}
          />
        )}

        {/* Tab 6: Organizer Portal — replaces the attendee tabs entirely
            while active (see Header.tsx's avatar-menu toggle). Only ever
            reachable when the account has organizer access — there's no
            passcode fallback anymore. */}
        {activeTab === 'admin' && (
          currentUser.isOrganizer ? (
            <AdminPortal
              adminTab={adminTab}
              responses={adminResponses}
              expenses={expenses}
              announcements={announcements}
              rsvps={adminRsvps}
              eventDetails={eventDetails}
              scoutedVenues={scoutedVenues}
              onSaveEventDetails={handleSaveEventDetails}
              onDeleteResponse={handleDeleteResponse}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
              onSaveExpense={handleSaveExpense}
              onDeleteExpense={handleDeleteExpense}
              onSaveAnnouncement={handleSaveAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
              onTogglePinAnnouncement={handleTogglePinAnnouncement}
              onSaveVenue={handleSaveVenue}
              onDeleteVenue={handleDeleteVenue}
            />
          ) : (
            <div className="max-w-sm mx-auto py-16 px-4 text-center text-sm text-on-surface-variant">
              You don't have organizer access.
            </div>
          )
        )}

      </main>

      {/* Footer */}
      <footer className="relative bg-surface-container text-on-surface-variant border-t border-outline-variant/40 text-xs py-6 px-4 sm:px-6 mt-12">
        <div className="max-w-7xl mx-auto text-center flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2">
          <span>Excellence & Service • MakSci 2007 Forever</span>
          <span>Designed with love for the Makati Science High School Batch 2007 Reunion</span>
        </div>
      </footer>

      {/* Floating bottom nav (mobile only — see AppNav.tsx) */}
      <MobileNav tabs={navTabs} activeTab={navActiveKey} setActiveTab={navOnSelect} />

    </div>
  );
}
