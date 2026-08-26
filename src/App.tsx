/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  RsvpSection 
} from './components/RsvpSection';
import { 
  AnnouncementsSection 
} from './components/AnnouncementsSection';
import { 
  PublicDashboardSection 
} from './components/PublicDashboardSection';
import { 
  AdminPortal 
} from './components/admin/AdminPortal';
import { 
  SurveyResponse, 
  PlannedExpense, 
  Announcement, 
  RSVPRecord,
  EventDetails
} from './types';
import { 
  INITIAL_SURVEY_RESPONSES, 
  INITIAL_EXPENSES, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_RSVPS,
  INITIAL_EVENT_DETAILS
} from './data/initialData';
import { 
  ClipboardList, 
  Send, 
  Bell, 
  BarChart3, 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  GraduationCap 
} from 'lucide-react';

const STORAGE_KEYS = {
  SURVEYS: 'mshs_2007_surveys_v1',
  EXPENSES: 'mshs_2007_expenses_v1',
  ANNOUNCEMENTS: 'mshs_2007_announcements_v1',
  RSVPS: 'mshs_2007_rsvps_v1',
  EVENT_DETAILS: 'mshs_2007_event_details_v1',
};

export default function App() {
  // Navigation & Admin State
  const [activeTab, setActiveTab] = useState<string>('survey'); // Emphasis on survey first!
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Event Details State
  const [eventDetails, setEventDetails] = useState<EventDetails>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENT_DETAILS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_EVENT_DETAILS;
  });

  // Core Data with LocalStorage persistence & fallbacks
  const [responses, setResponses] = useState<SurveyResponse[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SURVEYS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SURVEY_RESPONSES;
  });

  const [expenses, setExpenses] = useState<PlannedExpense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_EXPENSES;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ANNOUNCEMENTS;
  });

  const [rsvps, setRsvps] = useState<RSVPRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RSVPS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_RSVPS;
  });

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(responses));
    } catch {}
  }, [responses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch {}
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    } catch {}
  }, [announcements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(rsvps));
    } catch {}
  }, [rsvps]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENT_DETAILS, JSON.stringify(eventDetails));
    } catch {}
  }, [eventDetails]);

  // Overall Financial Metric: Total Pledges
  const totalPledges = responses.reduce((acc, r) => acc + (r.computedPledgeAmount || 0), 0);

  // Handler: Save Event Details
  const handleSaveEventDetails = (newDetails: EventDetails) => {
    setEventDetails(newDetails);
  };

  // Handler: Survey Submitted
  const handleSurveySubmitted = (newResponse: SurveyResponse) => {
    setResponses(prev => [newResponse, ...prev]);

    // Auto-update RSVP if they responded with attendance intent
    if (newResponse.attendance === 'Yes, definitely!' || newResponse.attendance === 'Most likely, but still confirming') {
      const existingRsvpIndex = rsvps.findIndex(r => r.contactNumber === newResponse.contactNumber || r.fullName.toLowerCase() === newResponse.fullName.toLowerCase());
      
      const newRsvp: RSVPRecord = {
        id: existingRsvpIndex >= 0 ? rsvps[existingRsvpIndex].id : `rsvp-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        fullName: newResponse.fullName,
        contactNumber: newResponse.contactNumber,
        email: newResponse.email,
        status: newResponse.attendance === 'Yes, definitely!' ? 'Attending' : 'Maybe',
        bringingPlusOne: newResponse.bringingPlusOne === 'Yes, 1 +1',
        kidsCount: newResponse.bringingKids === 'Yes' && typeof newResponse.kidsCount === 'number' ? newResponse.kidsCount : 0,
        messageToBatch: newResponse.otherSuggestions ? newResponse.otherSuggestions.slice(0, 100) : undefined,
      };

      if (existingRsvpIndex >= 0) {
        const updated = [...rsvps];
        updated[existingRsvpIndex] = newRsvp;
        setRsvps(updated);
      } else {
        setRsvps(prev => [newRsvp, ...prev]);
      }
    }
  };

  // Handler: Direct RSVP Submitted
  const handleRsvpSubmitted = (newRsvp: RSVPRecord) => {
    setRsvps(prev => {
      const idx = prev.findIndex(r => r.id === newRsvp.id || r.contactNumber === newRsvp.contactNumber);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newRsvp;
        return updated;
      }
      return [newRsvp, ...prev];
    });
  };

  // Handler: Delete Survey Response
  const handleDeleteResponse = (id: string) => {
    setResponses(prev => prev.filter(r => r.id !== id));
  };

  // Handler: Update Payment Status
  const handleUpdatePaymentStatus = (id: string, status: SurveyResponse['pledgePaidStatus']) => {
    setResponses(prev => prev.map(r => r.id === id ? { ...r, pledgePaidStatus: status } : r));
  };

  // Handler: Save / Edit Expense
  const handleSaveExpense = (expense: PlannedExpense) => {
    setExpenses(prev => {
      const idx = prev.findIndex(e => e.id === expense.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = expense;
        return updated;
      }
      return [expense, ...prev];
    });
  };

  // Handler: Delete Expense
  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Handler: Save / Edit Announcement
  const handleSaveAnnouncement = (ann: Announcement) => {
    setAnnouncements(prev => {
      const idx = prev.findIndex(a => a.id === ann.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = ann;
        return updated;
      }
      return [ann, ...prev];
    });
  };

  // Handler: Delete Announcement
  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  // Handler: Toggle Pin Announcement
  const handleTogglePinAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isPinned: !a.isPinned } : a));
  };

  // Handler: Like Announcement
  const handleLikeAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, likesCount: a.likesCount + 1 } : a));
  };

  // Handler: Reset to Demo Data
  const handleResetDemoData = () => {
    setResponses(INITIAL_SURVEY_RESPONSES);
    setExpenses(INITIAL_EXPENSES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setRsvps(INITIAL_RSVPS);
    setEventDetails(INITIAL_EVENT_DETAILS);
    localStorage.removeItem(STORAGE_KEYS.SURVEYS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.ANNOUNCEMENTS);
    localStorage.removeItem(STORAGE_KEYS.RSVPS);
    localStorage.removeItem(STORAGE_KEYS.EVENT_DETAILS);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        responseCount={responses.length}
        totalPledges={totalPledges}
      />

      {/* Prominent Pending Date & Venue Banner */}
      <PendingBanner
        totalSurveys={responses.length}
        totalPledges={totalPledges}
        eventDetails={eventDetails}
        onTakeSurveyClick={() => {
          setActiveTab('survey');
          const el = document.getElementById('survey-form-container');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        
        {/* Tab 1: Survey Form (Highlighted as #1 Priority) */}
        {activeTab === 'survey' && (
          <SurveySection
            onSurveySubmitted={handleSurveySubmitted}
            onNavigateToRsvp={() => setActiveTab('rsvp')}
          />
        )}

        {/* Tab 2: RSVP Section */}
        {activeTab === 'rsvp' && (
          <RsvpSection
            rsvps={rsvps}
            onRsvpSubmitted={handleRsvpSubmitted}
            onNavigateToSurvey={() => setActiveTab('survey')}
          />
        )}

        {/* Tab 3: Announcements & Bulletin */}
        {activeTab === 'announcements' && (
          <AnnouncementsSection
            announcements={announcements}
            onLikeAnnouncement={handleLikeAnnouncement}
            onOpenAdminToPost={() => {
              setIsAdmin(true);
              setActiveTab('admin');
            }}
          />
        )}

        {/* Tab 4: Public Dashboard & Funds Transparency */}
        {activeTab === 'dashboard' && (
          <PublicDashboardSection
            responses={responses}
            expenses={expenses}
            rsvps={rsvps}
            eventDetails={eventDetails}
            onOpenAdmin={() => {
              setIsAdmin(true);
              setActiveTab('admin');
            }}
            onTakeSurvey={() => setActiveTab('survey')}
          />
        )}

        {/* Tab 5: Admin & Treasury Portal */}
        {activeTab === 'admin' && (
          <AdminPortal
            isAdmin={isAdmin}
            setIsAdmin={setIsAdmin}
            responses={responses}
            expenses={expenses}
            announcements={announcements}
            rsvps={rsvps}
            eventDetails={eventDetails}
            onSaveEventDetails={handleSaveEventDetails}
            onDeleteResponse={handleDeleteResponse}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
            onSaveExpense={handleSaveExpense}
            onDeleteExpense={handleDeleteExpense}
            onSaveAnnouncement={handleSaveAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onTogglePinAnnouncement={handleTogglePinAnnouncement}
            onResetDemoData={handleResetDemoData}
            onExitAdmin={() => setActiveTab('survey')}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#f2ece1] text-stone-700 border-t border-stone-300 text-xs py-10 px-4 sm:px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center font-bold shadow-sm">
              <GraduationCap className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <div className="font-bold text-stone-900 text-base">
                Makati Science High School • Batch 2007
              </div>
              <div className="text-xs text-stone-500">
                Official Reunion Planning & Operating Funds Hub
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
            <button
              type="button"
              onClick={() => { setActiveTab('survey'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hover:text-amber-800 transition-colors"
            >
              Planning Survey
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => { setActiveTab('rsvp'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hover:text-amber-800 transition-colors"
            >
              Quick RSVP
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => { setActiveTab('announcements'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hover:text-amber-800 transition-colors"
            >
              Announcements
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => { setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hover:text-amber-800 transition-colors"
            >
              Operating Funds
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => { setActiveTab('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hover:text-amber-900 transition-colors text-amber-800 font-bold"
            >
              Admin Portal
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-stone-300 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Excellence & Service • MakSci 2007 Forever</span>
          <span>Designed with care for the Makati Science High School Batch 2007 Reunion</span>
        </div>
      </footer>

    </div>
  );
}
