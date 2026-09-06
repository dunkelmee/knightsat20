import React, { useEffect, useState } from 'react';
import { ShieldCheck, ClipboardList, Users, ScrollText, LogOut } from 'lucide-react';
import { SurveyResponse } from '../../types';
import * as api from '../../api/client';
import { SurveyResponsesTab } from '../admin/SurveyResponsesTab';
import { UsersTab } from './UsersTab';
import { AuditLogTab } from './AuditLogTab';
import { DesktopNav, MobileNav, NavTab } from '../nav/AppNav';

interface SuperadminPortalProps {
  onLogout: () => void;
}

type SuperadminTab = 'responses' | 'users' | 'logs';

const TABS: NavTab[] = [
  { key: 'responses', label: 'Surveys', icon: ClipboardList },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'logs', label: 'Activity Log', icon: ScrollText },
];

// A completely separate, self-contained portal — the superadmin isn't a
// `User` row and never touches the attendee/organizer app (see App.tsx) —
// but it shares the same DesktopNav/MobileNav container-query nav so the
// tab bar looks and behaves identically at every resolution.
export const SuperadminPortal: React.FC<SuperadminPortalProps> = ({ onLogout }) => {
  const [tab, setTab] = useState<SuperadminTab>('responses');
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoadingResponses(true);
      setResponses(await api.fetchSurveyResponses());
      setIsLoadingResponses(false);
    })();
  }, []);

  const handleDeleteResponse = async (id: string) => {
    await api.deleteSurveyResponse(id);
    setResponses((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdatePaymentStatus = async (id: string, status: SurveyResponse['pledgePaidStatus']) => {
    const updated = await api.updatePaymentStatus(id, status);
    setResponses((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  return (
    <div className="@container/app min-h-screen bg-background text-on-background flex flex-col font-sans">
      <div className="paper-grain" aria-hidden="true" />

      <header className="sticky top-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/40 shadow-soft">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif font-semibold text-heading text-on-surface leading-none">Superadmin</h1>
            <p className="text-label text-on-surface-variant mt-0.5">Batch 2007 Reunion Hub</p>
          </div>

          {/* Desktop nav — same DesktopNav used by the attendee/organizer
              views, hidden below the 700px container-query breakpoint. */}
          <DesktopNav tabs={TABS} activeTab={tab} setActiveTab={(key) => setTab(key as SuperadminTab)} />

          <button
            type="button"
            onClick={onLogout}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container text-body font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out</span>
          </button>
        </div>
      </header>

      {/* Main content — extra bottom padding on mobile so it clears the
          floating bottom nav, same as the attendee/organizer views. */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-5 pb-24 @min-[700px]/app:pb-5">
        {tab === 'responses' && (
          isLoadingResponses ? (
            <div className="text-center py-10 text-body text-on-surface-variant">Loading responses…</div>
          ) : (
            <SurveyResponsesTab
              responses={responses}
              expenses={[]}
              onDeleteResponse={handleDeleteResponse}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
            />
          )
        )}

        {tab === 'users' && <UsersTab />}
        {tab === 'logs' && <AuditLogTab />}
      </main>

      {/* Floating bottom nav (mobile only — see AppNav.tsx) */}
      <MobileNav tabs={TABS} activeTab={tab} setActiveTab={(key) => setTab(key as SuperadminTab)} />
    </div>
  );
};
