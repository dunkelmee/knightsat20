import React, { useEffect, useRef, useState } from 'react';
import { GraduationCap, LogOut, Pencil, ShieldCheck, ArrowLeftRight } from 'lucide-react';
import { UserProfile } from '../types';
import { DesktopNav, NavTab } from './nav/AppNav';

interface HeaderProps {
  navTabs: NavTab[];
  navActiveKey: string;
  onNavSelect: (key: string) => void;
  adminViewActive: boolean;
  canAccessOrganizerView: boolean;
  onToggleAdminView: () => void;
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

export const Header: React.FC<HeaderProps> = ({
  navTabs,
  navActiveKey,
  onNavSelect,
  adminViewActive,
  canAccessOrganizerView,
  onToggleAdminView,
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
      <div id="header-nav-container" className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          {/* Logo & School Name */}
          <div
            id="brand-logo-button"
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => onNavSelect(adminViewActive ? 'event' : 'survey')}
          >
            <div className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-soft flex-shrink-0">
              <GraduationCap className="w-4 h-4 text-on-primary" />
            </div>
            <div>
              <h1 className="font-serif font-semibold text-base sm:text-lg text-on-surface tracking-tight leading-none">
                Makati Science High School '07 Reunion
              </h1>
              <span className="inline-block mt-1 px-1.5 py-0.5 text-[11px] font-semibold rounded bg-primary-container text-on-primary-container border border-primary-container">
                Knights @ 20
              </span>
            </div>
          </div>

          {/* Spacer pushes the desktop nav + avatar to the far end */}
          <div className="flex-1" />

          {/* Desktop nav — attendee tabs, or the admin tabs in place of them
              once the admin view is active (see AppNav.tsx) — hidden below
              the 700px container-query breakpoint */}
          <DesktopNav tabs={navTabs} activeTab={navActiveKey} setActiveTab={onNavSelect} />

          {/* Profile avatar & menu — Edit Profile, view switch, Log out */}
          {currentUser && (
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                id="btn-profile-avatar"
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                title={currentUser.fullName}
                className="relative w-9 h-9 rounded-full overflow-hidden border border-outline-variant/40 shadow-soft flex items-center justify-center bg-primary-container text-on-primary-container font-semibold text-xs hover:opacity-90 transition-opacity"
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
                {adminViewActive && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-on-primary flex items-center justify-center border-2 border-surface-container-lowest">
                    <ShieldCheck className="w-2.5 h-2.5" />
                  </span>
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

                  {canAccessOrganizerView && (
                    <button
                      id="btn-toggle-admin-view"
                      type="button"
                      onClick={() => {
                        onToggleAdminView();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>{adminViewActive ? 'To attendee view' : 'To organizer view'}</span>
                    </button>
                  )}

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
        </div>
      </div>
    </header>
  );
};
