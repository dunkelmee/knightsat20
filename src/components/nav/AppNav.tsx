import React from 'react';
import { ClipboardList, LayoutGrid, Users, Image, BarChart3 } from 'lucide-react';

// Single source of truth for the five alumni-facing tabs — both the mobile
// floating bottom bar and the desktop in-header tabs render from this same
// array so they can't drift apart (see DIRECTORY_AND_PHOTOWALL.md section 3).
export const NAV_TABS = [
  { key: 'board', label: 'Batch Board', icon: LayoutGrid },
  { key: 'survey', label: 'Survey', icon: ClipboardList },
  { key: 'directory', label: 'Directory', icon: Users },
  { key: 'photos', label: 'Photos', icon: Image },
  { key: 'dashboard', label: 'Funds', icon: BarChart3 },
] as const;

export type NavTabKey = (typeof NAV_TABS)[number]['key'];

interface AppNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// Desktop placement — rendered inline in Header.tsx, between the brand block
// and the profile avatar. Hidden below the 700px container-query breakpoint.
export const DesktopNav: React.FC<AppNavProps> = ({ activeTab, setActiveTab }) => (
  <nav aria-label="Primary" className="hidden @min-[700px]/app:flex items-center gap-1">
    {NAV_TABS.map(({ key, label, icon: Icon }) => {
      const active = activeTab === key;
      return (
        <button
          key={key}
          type="button"
          aria-current={active ? 'page' : undefined}
          onClick={() => setActiveTab(key)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            active
              ? 'bg-primary-container/15 text-primary'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span>{label}</span>
        </button>
      );
    })}
  </nav>
);

// Mobile placement — a floating bottom bar fixed to the viewport, rendered
// once at the app-shell level (App.tsx) rather than inside Header, so it
// isn't clipped by the header's own stacking context. Hidden at/above 700px.
export const MobileNav: React.FC<AppNavProps> = ({ activeTab, setActiveTab }) => (
  <nav
    aria-label="Primary"
    className="@min-[700px]/app:hidden fixed left-3 right-3 bottom-3 z-40 h-[62px] rounded-[20px] bg-surface-container-lowest border border-outline-variant/40 shadow-soft flex items-stretch justify-around px-1.5"
  >
    {NAV_TABS.map(({ key, label, icon: Icon }) => {
      const active = activeTab === key;
      return (
        <button
          key={key}
          type="button"
          aria-current={active ? 'page' : undefined}
          onClick={() => setActiveTab(key)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-2xl"
        >
          <span
            className={`flex items-center justify-center rounded-full transition-all motion-reduce:transition-none ${
              active
                ? 'w-14 h-14 -translate-y-5 bg-primary-container text-on-primary shadow-soft border-4 border-surface'
                : 'w-11 h-11 text-outline'
            }`}
          >
            <Icon className={active ? 'w-[26px] h-[26px]' : 'w-[23px] h-[23px]'} />
          </span>
          <span
            className={`text-[9px] font-bold tracking-wide uppercase transition-all motion-reduce:transition-none ${
              active ? 'text-primary -translate-y-3.5' : 'text-transparent h-0 overflow-hidden'
            }`}
          >
            {label}
          </span>
        </button>
      );
    })}
  </nav>
);
