import React, { useEffect, useRef, useState } from 'react';
import { ClipboardList, BarChart3, Lock, Unlock, GraduationCap, LogOut, LayoutGrid, Pencil } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onEditProfile: () => void;
}

const getInitials = (fullName: string): string =>
  fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const TABS = [
  { id: 'survey', label: 'Survey', icon: ClipboardList },
  { id: 'board', label: 'Batch Board', icon: LayoutGrid },
  { id: 'dashboard', label: 'Funds', icon: BarChart3 },
] as const;

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  setIsAdmin,
  currentUser,
  onLogout,
  onEditProfile,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <header id="header-main" className="sticky top-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/40 text-on-surface shadow-soft">
      {/* Main navigation header */}
      <div id="header-nav-container" className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-5">
        <div className="relative flex items-center justify-between gap-3">
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

          {/* Profile avatar & menu — Edit Profile, Admin Portal, Log out */}
          {currentUser && (
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                id="btn-profile-avatar"
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                title={currentUser.fullName}
                className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant/40 shadow-soft flex items-center justify-center bg-primary-container text-on-primary-container font-semibold text-xs hover:opacity-90 transition-opacity"
              >
                {currentUser.nowPhotoUrl ? (
                  <img
                    src={currentUser.nowPhotoUrl}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getInitials(currentUser.fullName)}</span>
                )}
              </button>

              {menuOpen && (
                <div
                  id="profile-menu"
                  className="absolute right-0 top-full mt-2 w-52 bg-surface-container-lowest border border-outline-variant/40 rounded shadow-soft overflow-hidden z-50"
                >
                  <div className="px-3 py-2.5 border-b border-outline-variant/40">
                    <p className="text-xs font-semibold text-on-surface truncate">{currentUser.fullName}</p>
                    <p className="text-[11px] text-on-surface-variant truncate">{currentUser.email}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onEditProfile();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    id="btn-admin-menu-item"
                    type="button"
                    onClick={() => {
                      if (isAdmin) {
                        setIsAdmin(false);
                      } else {
                        setActiveTab('admin');
                      }
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                  >
                    {isAdmin ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{isAdmin ? 'Admin Mode Active' : 'Admin Portal'}</span>
                  </button>

                  <button
                    id="btn-logout"
                    type="button"
                    onClick={() => {
                      onLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-error hover:bg-error-container/30 transition-colors border-t border-outline-variant/40"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation Tabs — desktop: plain links centered on the brand row */}
          <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-7">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 pb-0.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === id
                    ? 'text-primary border-primary'
                    : 'text-on-surface-variant border-transparent hover:text-on-surface'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Navigation Tabs — mobile: full-width segmented control below the brand row */}
        <nav id="main-navigation" className="md:hidden grid grid-cols-3 gap-1.5 bg-surface-container-low p-1.5 rounded border border-outline-variant/30">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`nav-tab-${id}`}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`py-3 px-2 rounded text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === id
                  ? 'bg-primary text-on-primary shadow-soft'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};
