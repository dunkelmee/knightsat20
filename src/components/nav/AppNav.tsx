import React from 'react';
import {
  ClipboardList, LayoutGrid, Users, Image, BarChart3,
  Calendar, Receipt, Bell, Images,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavTab {
  key: string;
  label: string;
  icon: LucideIcon;
}

// Single source of truth for the five alumni-facing tabs — both the mobile
// floating bottom bar and the desktop in-header tabs render from this same
// array so they can't drift apart (see DIRECTORY_AND_PHOTOWALL.md section 3).
export const NAV_TABS: NavTab[] = [
  { key: 'board', label: 'Batch Board', icon: LayoutGrid },
  { key: 'survey', label: 'Survey', icon: ClipboardList },
  { key: 'directory', label: 'Directory', icon: Users },
  { key: 'photos', label: 'Photos', icon: Image },
  { key: 'dashboard', label: 'Funds', icon: BarChart3 },
];

// Shown in the exact same nav slots (mobile bottom bar / desktop header)
// once an admin switches into the admin view — replaces NAV_TABS entirely
// rather than living alongside it.
export const ADMIN_NAV_TABS: NavTab[] = [
  { key: 'event', label: 'Event Planning', icon: Calendar },
  { key: 'responses', label: 'Surveys', icon: ClipboardList },
  { key: 'funds', label: 'Ledger', icon: Receipt },
  { key: 'announcements', label: 'Announcements', icon: Bell },
  { key: 'rsvp', label: 'RSVP Roster', icon: Users },
  { key: 'photowall', label: 'Photo Wall', icon: Images },
];

interface AppNavProps {
  tabs: NavTab[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// Desktop placement — rendered inline in TabHero.tsx's dark hero band,
// between the brand block and the profile chip. Hidden below the 700px
// container-query breakpoint. Colors are tuned for the dark hero background
// (cream active pill, translucent-cream inactive text) rather than a light
// surface, since the hero replaced the old light header bar.
export const DesktopNav: React.FC<AppNavProps> = ({ tabs, activeTab, setActiveTab }) => {
  if (tabs.length === 0) return null;
  return (
    <nav
      aria-label="Primary"
      // `mx-auto` only centres the pill group in the space LEFT OVER between
      // the brand block and the profile chip, and the brand is much the wider
      // of the two — so the group lands visibly right of the page's centre
      // line. Above 1040px there's room to take it out of flow and centre it
      // on the row itself; below that the flow version still fits better than
      // an absolute one, which would run under the brand.
      className="hidden @min-[700px]/app:flex mx-auto @min-[1040px]/app:mx-0 @min-[1040px]/app:absolute @min-[1040px]/app:left-1/2 @min-[1040px]/app:top-1/2 @min-[1040px]/app:-translate-x-1/2 @min-[1040px]/app:-translate-y-1/2 items-center gap-1 p-1.5 rounded-full bg-white/[0.11] backdrop-blur-xl border border-white/20"
    >
      {tabs.map(({ key, label, icon: Icon }) => {
        const active = activeTab === key;
        return (
          <button
            key={key}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-3 @min-[1040px]/app:px-4 py-2.5 rounded-full text-label font-semibold whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              active ? 'text-[#0d2620]' : 'text-white/70 hover:text-white'
            }`}
            style={active ? { background: '#f6e6bf' } : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
};

// Mobile placement — a floating bottom bar fixed to the viewport, rendered
// once at the app-shell level (App.tsx) rather than inside Header, so it
// isn't clipped by the header's own stacking context. Hidden at/above 700px.
export const MobileNav: React.FC<AppNavProps> = ({ tabs, activeTab, setActiveTab }) => {
  if (tabs.length === 0) return null;
  return (
    <nav
      aria-label="Primary"
      className="@min-[700px]/app:hidden fixed left-3 right-3 bottom-3 z-40 h-[62px] rounded-[26px] bg-surface-container-lowest/85 backdrop-blur-xl border border-white/60 shadow-soft flex items-stretch justify-around px-1.5"
    >
      {tabs.map(({ key, label, icon: Icon }) => {
        const active = activeTab === key;
        return (
          <button
            key={key}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => setActiveTab(key)}
            className="flex-1 flex flex-col items-center justify-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-2xl"
          >
            <span
              className="flex items-center justify-center rounded-full transition-all motion-reduce:transition-none"
              style={
                active
                  ? {
                      width: 34, height: 34, borderRadius: '50%',
                      background: 'linear-gradient(155deg,#f6e6bf,#e6cf98)',
                      border: '1px solid rgba(255,255,255,.9)',
                      boxShadow: '0 8px 16px -8px rgba(14,44,37,.5)',
                      color: '#0b4a3f',
                    }
                  : { width: 30, height: 30, color: 'var(--color-outline)' }
              }
            >
              <Icon className={active ? 'w-[18px] h-[18px]' : 'w-[17px] h-[17px]'} />
            </span>
            <span
              className={`font-sans text-nav font-bold tracking-wide uppercase transition-colors motion-reduce:transition-none ${
                active ? 'text-primary' : 'text-on-surface-variant/50'
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
