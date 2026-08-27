import React from 'react';
import { SurveyResponse, PlannedExpense, Announcement, RSVPRecord, EventDetails, ScoutedVenue } from '../../types';
import { SurveyResponsesTab } from './SurveyResponsesTab';
import { OperatingFundsTab } from './OperatingFundsTab';
import { AnnouncementsManagerTab } from './AnnouncementsManagerTab';
import { RsvpSummaryTab } from './RsvpSummaryTab';
import { EventDetailsManagerTab } from './EventDetailsManagerTab';
import { AdminPhotoWallTab } from './AdminPhotoWallTab';

interface AdminPortalProps {
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
}

// The tab switcher itself lives in the shared AppNav (see nav/AppNav.tsx's
// ADMIN_NAV_TABS) — it replaces the attendee nav entirely while this view is
// active, rather than duplicating a second tab strip inside this component.
// This component is only ever reached once the account already has
// organizer access (see App.tsx) — no auth UI of its own.
export const AdminPortal: React.FC<AdminPortalProps> = ({
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
}) => {
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
