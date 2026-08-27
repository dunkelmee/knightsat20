import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { SurveyResponse, PlannedExpense, Announcement, RSVPRecord, EventDetails, ScoutedVenue } from '../../types';
import { SurveyResponsesTab } from './SurveyResponsesTab';
import { OperatingFundsTab } from './OperatingFundsTab';
import { AnnouncementsManagerTab } from './AnnouncementsManagerTab';
import { RsvpSummaryTab } from './RsvpSummaryTab';
import { EventDetailsManagerTab } from './EventDetailsManagerTab';
import { AdminPhotoWallTab } from './AdminPhotoWallTab';

interface AdminPortalProps {
  isAdmin: boolean;
  onLogin: (passcode: string) => Promise<boolean>;
  adminTab: string;
  responses: SurveyResponse[];
  expenses: PlannedExpense[];
  announcements: Announcement[];
  rsvps: RSVPRecord[];
  eventDetails: EventDetails;
  scoutedVenues: ScoutedVenue[];
  onSaveEventDetails: (details: EventDetails) => void;
  onDeleteResponse: (id: string) => void;
  onUpdatePaymentStatus: (id: string, status: SurveyResponse['pledgePaidStatus']) => void;
  onSaveExpense: (expense: PlannedExpense) => void;
  onDeleteExpense: (id: string) => void;
  onSaveAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
  onTogglePinAnnouncement: (id: string) => void;
  onSaveVenue: (venue: ScoutedVenue) => void;
  onDeleteVenue: (id: string) => void;
  onExitAdmin: () => void;
}

// The tab switcher itself lives in the shared AppNav (see nav/AppNav.tsx's
// ADMIN_NAV_TABS) — it replaces the attendee nav entirely while this view is
// active, rather than duplicating a second tab strip inside this component.
export const AdminPortal: React.FC<AdminPortalProps> = ({
  isAdmin,
  onLogin,
  adminTab,
  responses,
  expenses,
  announcements,
  rsvps,
  eventDetails,
  scoutedVenues,
  onSaveEventDetails,
  onDeleteResponse,
  onUpdatePaymentStatus,
  onSaveExpense,
  onDeleteExpense,
  onSaveAnnouncement,
  onDeleteAnnouncement,
  onTogglePinAnnouncement,
  onSaveVenue,
  onDeleteVenue,
  onExitAdmin,
}) => {
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onLogin(passcode.trim());
    setPasscodeError(!success);
  };

  // Lock Screen if not authorized yet
  if (!isAdmin) {
    return (
      <div id="admin-lock-screen" className="max-w-sm mx-auto py-10 px-4">
        <div className="bg-surface-container-lowest rounded p-6 border border-outline-variant/30 text-center space-y-4 shadow-soft">
          <div className="w-12 h-12 rounded bg-primary text-on-primary flex items-center justify-center mx-auto shadow-soft">
            <Lock className="w-6 h-6 text-on-primary" />
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-serif font-semibold text-on-surface">
              Treasury & Admin
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Makati Science Batch 2007 Committee
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-3">
            <div>
              <input
                id="input-admin-passcode"
                type="password"
                placeholder="Enter passcode"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (passcodeError) setPasscodeError(false);
                }}
                className="w-full text-center px-3 py-2 rounded border border-secondary/30 text-on-surface font-semibold tracking-wider text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {passcodeError && (
                <p className="text-[11px] text-error mt-1">Incorrect passcode. Please try again.</p>
              )}
            </div>

            <button
              id="btn-unlock-admin"
              type="submit"
              className="w-full py-2 rounded bg-primary hover:opacity-90 text-on-primary font-semibold text-xs shadow-soft transition-all flex items-center justify-center gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlock Admin</span>
            </button>
          </form>

          <div className="pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onExitAdmin}
              className="text-xs text-on-surface-variant hover:text-on-surface underline"
            >
              Back to Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-portal-container" className="max-w-5xl mx-auto py-5 px-4">
      {adminTab === 'event' && (
        <EventDetailsManagerTab
          eventDetails={eventDetails}
          onSaveEventDetails={onSaveEventDetails}
          scoutedVenues={scoutedVenues}
          onSaveVenue={onSaveVenue}
          onDeleteVenue={onDeleteVenue}
        />
      )}

      {adminTab === 'responses' && (
        <SurveyResponsesTab
          responses={responses}
          expenses={expenses}
          onDeleteResponse={onDeleteResponse}
          onUpdatePaymentStatus={onUpdatePaymentStatus}
        />
      )}

      {adminTab === 'funds' && (
        <OperatingFundsTab
          responses={responses}
          expenses={expenses}
          onSaveExpense={onSaveExpense}
          onDeleteExpense={onDeleteExpense}
        />
      )}

      {adminTab === 'announcements' && (
        <AnnouncementsManagerTab
          announcements={announcements}
          onSaveAnnouncement={onSaveAnnouncement}
          onDeleteAnnouncement={onDeleteAnnouncement}
          onTogglePin={onTogglePinAnnouncement}
        />
      )}

      {adminTab === 'rsvp' && (
        <RsvpSummaryTab
          rsvps={rsvps}
          responses={responses}
        />
      )}

      {adminTab === 'photowall' && <AdminPhotoWallTab />}
    </div>
  );
};
