import React from 'react';
import { Sparkles, ShieldCheck, ClipboardList, Send, Bell, BarChart3, KeyRound, Lock, Unlock, GraduationCap, Users } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  responseCount: number;
  totalPledges: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  setIsAdmin,
  responseCount,
}) => {
  return (
    <header id="header-main" className="sticky top-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/40 text-on-surface shadow-soft">
      {/* Top Announcement & Admin Bar */}
      <div id="header-top-bar" className="bg-surface-container-low text-xs py-2 px-4 sm:px-6 text-on-surface-variant border-b border-outline-variant/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-primary font-bold tracking-wide">MSHS BATCH 2007</span>
            <span className="hidden sm:inline text-on-surface-variant">• Makati Science High School</span>
            <span className="hidden md:inline text-on-surface-variant">• Official Planning Portal</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-on-surface-variant text-xs hidden sm:inline">
              <strong className="text-on-surface font-bold">{responseCount}</strong> Survey Responses
            </span>

            {/* Standalone Distinct Admin Button */}
            <button
              id="btn-admin-header-badge"
              type="button"
              onClick={() => {
                if (isAdmin) {
                  setIsAdmin(false);
                } else {
                  setActiveTab('admin');
                }
              }}
              className={`text-xs px-3 py-1 rounded font-semibold transition-all flex items-center gap-1.5 shadow-soft border ${
                isAdmin
                  ? 'bg-primary text-on-primary border-primary hover:opacity-90'
                  : 'bg-secondary text-on-secondary border-secondary hover:opacity-90'
              }`}
              title="Restricted committee management portal"
            >
              {isAdmin ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-on-primary" />
                  <span>Admin Mode Active</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-on-secondary" />
                  <span>Admin Portal</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div id="header-nav-container" className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & School Name */}
          <div
            id="brand-logo-button"
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => setActiveTab('survey')}
          >
            <div className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-soft flex-shrink-0">
              <GraduationCap className="w-4 h-4 text-on-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-semibold text-base sm:text-lg text-on-surface tracking-tight leading-none">
                  Makati Science High School
                </h1>
                <span className="px-1.5 py-0.5 text-[11px] font-semibold rounded bg-primary-container text-on-primary-container border border-primary-container">
                  Batch 2007
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Reunion Hub
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav id="main-navigation" className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              id="nav-tab-survey"
              type="button"
              onClick={() => setActiveTab('survey')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'survey'
                  ? 'bg-primary text-on-primary shadow-soft'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Survey</span>
            </button>

            <button
              id="nav-tab-rsvp"
              type="button"
              onClick={() => setActiveTab('rsvp')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'rsvp'
                  ? 'bg-primary text-on-primary shadow-soft'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Attendee Roster</span>
            </button>

            <button
              id="nav-tab-announcements"
              type="button"
              onClick={() => setActiveTab('announcements')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'announcements'
                  ? 'bg-primary text-on-primary shadow-soft'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Updates</span>
            </button>

            <button
              id="nav-tab-dashboard"
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-primary text-on-primary shadow-soft'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Funds</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
