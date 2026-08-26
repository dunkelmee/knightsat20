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

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === 'admin2007') {
      setIsAdmin(true);
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  // Lock Screen if not authorized yet
  if (!isAdmin) {
    return (
      <div id="admin-lock-screen" className="max-w-sm mx-auto py-10 px-4">
        <div className="bg-white rounded-2xl p-6 border border-stone-200 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-700 text-white flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-6 h-6 text-amber-100" />
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold text-stone-900">
              Treasury & Admin
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
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
                className="w-full text-center px-3 py-2 rounded-lg border border-stone-300 text-stone-900 font-semibold tracking-wider text-sm focus:outline-none focus:ring-1 focus:ring-amber-600"
              />
              {passcodeError && (
                <p className="text-[11px] text-red-600 mt-1">Incorrect passcode. Please try again.</p>
              )}
            </div>

            <button
              id="btn-unlock-admin"
              type="submit"
              className="w-full py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlock Admin</span>
            </button>
          </form>

          <div className="pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onExitAdmin}
              className="text-xs text-stone-500 hover:text-stone-800 underline"
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
      <div className="bg-white text-stone-900 rounded-xl p-4 border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-700 text-white flex items-center justify-center font-bold flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-stone-900">
                Makati Science Batch 2007 Admin
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                Committee
              </span>
            </div>
            <p className="text-xs text-stone-500">
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
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors border border-stone-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAdmin(false)}
            className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-100 font-semibold text-xs shadow-xs transition-all flex items-center gap-1"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-stone-200">
        <button
          type="button"
          onClick={() => setAdminTab('event')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            adminTab === 'event'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Date & Venue Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('responses')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            adminTab === 'responses'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Surveys ({responses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('funds')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            adminTab === 'funds'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Ledger & Expenses</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('announcements')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            adminTab === 'announcements'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Announcements ({announcements.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('rsvp')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            adminTab === 'rsvp'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'text-stone-700 hover:bg-stone-100'
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
