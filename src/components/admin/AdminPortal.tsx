import React, { useState } from 'react';
import {
  ShieldCheck, Lock, Unlock, ClipboardList, Receipt,
  Bell, Users, RefreshCw, Sparkles, Calendar
} from 'lucide-react';
import { SurveyResponse, PlannedExpense, Announcement, RSVPRecord, EventDetails } from '../../types';
import { SurveyResponsesTab } from './SurveyResponsesTab';
import { OperatingFundsTab } from './OperatingFundsTab';
import { AnnouncementsManagerTab } from './AnnouncementsManagerTab';
import { RsvpSummaryTab } from './RsvpSummaryTab';
import { EventDetailsManagerTab } from './EventDetailsManagerTab';

interface AdminPortalProps {
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  onLogin: (passcode: string) => Promise<boolean>;
  responses: SurveyResponse[];
  expenses: PlannedExpense[];
  announcements: Announcement[];
  rsvps: RSVPRecord[];
  eventDetails: EventDetails;
  onSaveEventDetails: (details: EventDetails) => void;
  onDeleteResponse: (id: string) => void;
  onUpdatePaymentStatus: (id: string, status: SurveyResponse['pledgePaidStatus']) => void;
  onSaveExpense: (expense: PlannedExpense) => void;
  onDeleteExpense: (id: string) => void;
  onSaveAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
  onTogglePinAnnouncement: (id: string) => void;
  onResetDemoData: () => void;
  onExitAdmin: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isAdmin,
  setIsAdmin,
  onLogin,
  responses,
  expenses,
  announcements,
  rsvps,
  eventDetails,
  onSaveEventDetails,
  onDeleteResponse,
  onUpdatePaymentStatus,
  onSaveExpense,
  onDeleteExpense,
  onSaveAnnouncement,
  onDeleteAnnouncement,
  onTogglePinAnnouncement,
  onResetDemoData,
  onExitAdmin,
}) => {
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [adminTab, setAdminTab] = useState<'event' | 'responses' | 'funds' | 'announcements' | 'rsvp'>('event');

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
    <div id="admin-portal-container" className="max-w-5xl mx-auto py-5 px-4 space-y-4">

      {/* Top Admin Header Bar */}
      <div className="bg-surface-container-lowest text-on-surface rounded p-4 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-primary text-on-primary flex items-center justify-center font-bold flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-on-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-serif font-semibold text-on-surface">
                Makati Science Batch 2007 Admin
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-container/20 text-on-primary-container border border-primary-container/50">
                Committee
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Survey responses, operating ledger, announcements, and live RSVP roster.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all surveys, expenses, and announcements back to initial demo data?')) {
                onResetDemoData();
              }
            }}
            title="Reset to fresh demo state"
            className="px-3 py-1.5 rounded bg-background hover:bg-surface-container text-on-surface-variant text-xs font-semibold flex items-center gap-1 transition-colors border border-secondary/30"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAdmin(false)}
            className="px-3 py-1.5 rounded bg-secondary hover:opacity-90 text-on-secondary font-semibold text-xs shadow-soft transition-all flex items-center gap-1"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-outline-variant/30">
        <button
          type="button"
          onClick={() => setAdminTab('event')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            adminTab === 'event'
              ? 'bg-primary text-on-primary shadow-soft'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Date & Venue Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('responses')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            adminTab === 'responses'
              ? 'bg-primary text-on-primary shadow-soft'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Surveys ({responses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('funds')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            adminTab === 'funds'
              ? 'bg-primary text-on-primary shadow-soft'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Ledger & Expenses</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('announcements')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            adminTab === 'announcements'
              ? 'bg-primary text-on-primary shadow-soft'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Announcements ({announcements.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('rsvp')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            adminTab === 'rsvp'
              ? 'bg-primary text-on-primary shadow-soft'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>RSVP Roster ({rsvps.length})</span>
        </button>
      </div>

      {/* Render Active Admin Tab */}
      <div>
        {adminTab === 'event' && (
          <EventDetailsManagerTab
            eventDetails={eventDetails}
            onSaveEventDetails={onSaveEventDetails}
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
      </div>

    </div>
  );
};
