import React, { useState } from 'react';
import {
  Bell, Heart, Users,
  MessageSquare, UserPlus, Search, Sparkles, Megaphone, UsersRound,
} from 'lucide-react';
import { Announcement, PublicRSVP } from '../types';

interface BatchBoardSectionProps {
  announcements: Announcement[];
  onLikeAnnouncement: (id: string) => void;
  onOpenAdminToPost: () => void;
  rsvps: PublicRSVP[];
}

const getInitials = (fullName: string): string =>
  fullName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

// Profile photo when the person has one, initials on the status colour
// otherwise — including when the image itself fails to load.
const CardAvatar: React.FC<{ url?: string | null; fullName: string; bg: string }> = ({ url, fullName, bg }) => {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className="w-6.5 h-6.5 rounded-full grid place-items-center font-bold text-label text-white flex-shrink-0 overflow-hidden"
      style={{ background: bg }}
    >
      {url && !failed ? (
        <img
          src={url}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        getInitials(fullName)
      )}
    </span>
  );
};

// Card treatment per RSVP status — mirrors the four survey attendance answers
// (see _RSVP_STATUS_BY_ATTENDANCE in backend/app/routers/survey_responses.py):
// green = definite, purple = most likely, yellow = undecided, red = declined.
const STATUS_EDGE: Record<PublicRSVP['status'], { edge: string; avBg: string; label: string }> = {
  Attending: { edge: '#1f7a4d', avBg: '#0e5a4d', label: 'Attending' },
  'Most likely': { edge: '#7a68b0', avBg: '#6b5a9e', label: 'Most likely' },
  Maybe: { edge: '#d6982d', avBg: '#8f6112', label: 'Maybe' },
  Decline: { edge: '#c2564f', avBg: '#98443e', label: "Can't join" },
};

export const BatchBoardSection: React.FC<BatchBoardSectionProps> = ({
  announcements,
  onLikeAnnouncement,
  onOpenAdminToPost,
  rsvps,
}) => {
  // Announcements state
  const [selectedTag, setSelectedTag] = useState<string>('All');

  // Roster state — cards come from the survey only (see
  // _sync_rsvp_from_survey in backend/app/routers/survey_responses.py).
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Attending' | 'Most likely' | 'Maybe'>('All');
  const [showAllRsvps, setShowAllRsvps] = useState(false);
  const ROSTER_PREVIEW_COUNT = 6;

  const tags = ['All', 'Survey', 'Venue', 'Finance', 'Important', 'General'];

  const filteredAnnouncements = announcements.filter(a => {
    if (selectedTag === 'All') return true;
    return a.tag.toLowerCase() === selectedTag.toLowerCase();
  });

  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const isFiltering = searchQuery.trim() !== '' || statusFilter !== 'All';

  const filteredRsvps = rsvps.filter(r => {
    const matchesSearch = r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.messageToBatch && r.messageToBatch.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' ? true : r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const visibleRsvps = showAllRsvps ? filteredRsvps : filteredRsvps.slice(0, ROSTER_PREVIEW_COUNT);
  const hiddenRsvpCount = filteredRsvps.length - visibleRsvps.length;

  return (
    <div id="batch-board-container" className="max-w-5xl @min-[700px]/app:max-w-[1180px] mx-auto py-6 px-4 @min-[700px]/app:px-8">
      {/* Desktop splits the board into the mock's two rails — announcements at
          60% of the width, the attendance wall at 40% — while mobile keeps the
          single stacked column. */}
      <div className="flex flex-col gap-7 @min-[700px]/app:flex-row @min-[700px]/app:items-start @min-[700px]/app:gap-[26px]">

      {/* ============ ANNOUNCEMENTS ============ */}
      <section id="announcements-section" className="space-y-4 @min-[700px]/app:flex-[0_0_60%] @min-[700px]/app:min-w-0">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <span className="font-serif text-title leading-[1.04] text-on-surface flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Announcements
          </span>
          <span className="flex-1 min-w-[20px] h-px bg-on-surface/15" />
          {/* Mobile: tag chips sit inline next to the heading */}
          {announcements.length > 0 && (
            <div className="flex @min-[700px]/app:hidden items-center gap-1.5 overflow-x-auto scrollbar-none -mx-4 px-4">
              {tags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`flex-shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-label font-semibold transition-all border ${
                    selectedTag === tag
                      ? 'bg-on-surface text-background border-on-surface shadow-soft'
                      : 'bg-white/50 text-on-surface-variant border-white/80 backdrop-blur-md'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop: tag chips get their own row below the heading */}
        {announcements.length > 0 && (
          <div className="hidden @min-[700px]/app:flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {tags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`flex-shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-label font-semibold transition-all border ${
                  selectedTag === tag
                    ? 'bg-on-surface text-background border-on-surface shadow-soft'
                    : 'bg-white/50 text-on-surface-variant border-white/80 backdrop-blur-md'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {announcements.length === 0 ? (
          <div className="text-center py-11 px-5 rounded border-[1.5px] border-dashed border-on-surface/25 bg-white/40 space-y-2.5">
            <Megaphone className="w-6 h-6 mx-auto text-on-surface-variant/60" />
            <h3 className="font-serif text-title text-on-surface">No announcements yet</h3>
            <p className="text-body text-on-surface-variant max-w-[40ch] mx-auto leading-relaxed">
              The organizing committee hasn&apos;t posted anything yet. Check back soon — updates on the date, venue, and finances will show up here first.
            </p>
          </div>
        ) : sortedAnnouncements.length === 0 ? (
          <div className="py-8 px-6 text-center rounded border-[1.5px] border-dashed border-on-surface/24 text-body text-on-surface-variant">
            Nothing pinned under &apos;{selectedTag}&apos; yet.
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-1 @min-[640px]/app:grid-cols-2 @min-[700px]/app:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            {sortedAnnouncements.map((item, i) => (
              <article
                key={item.id}
                id={`announcement-card-${item.id}`}
                className="relative flex flex-col gap-2 rounded p-4.5 shadow-soft"
                style={{
                  background: item.imageUrl ? '#fdfaf2' : (i % 3 === 0 ? '#fdfaf2' : i % 3 === 1 ? '#f8f3e4' : '#f9f2e2'),
                }}
              >
                <span
                  className="absolute -top-1.5 left-5 w-3.5 h-3.5 rounded-full shadow"
                  style={{ background: item.isPinned ? '#b0564f' : 'rgba(20,33,29,.3)' }}
                />

                {item.imageUrl && (
                  <div className="relative -mx-4.5 -mt-4.5 mb-1 h-40 overflow-hidden bg-surface-container">
                    <img src={item.imageUrl} alt={item.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                )}

                <span className="font-mono text-label tracking-[0.16em] uppercase" style={{ color: item.tag === 'Important' ? '#b0564f' : item.tag === 'Finance' ? '#8f6112' : '#0e5a4d' }}>
                  {item.tag} · {item.date}
                </span>
                <h3 className="font-serif text-heading leading-[1.15] text-on-surface text-balance">{item.title}</h3>
                <p className="text-body leading-relaxed text-on-surface-variant/85 whitespace-pre-line">{item.caption}</p>

                <div className="flex items-center gap-3 mt-0.5">
                  <button
                    type="button"
                    onClick={() => onLikeAnnouncement(item.id)}
                    aria-pressed={item.likedByMe}
                    title={item.likedByMe ? 'Unlike' : 'Like'}
                    className="text-label font-semibold flex items-center gap-1"
                    style={{ color: '#98443e' }}
                  >
                    <Heart className="w-3.5 h-3.5" fill={item.likedByMe ? 'currentColor' : 'none'} /> {item.likesCount || 0}
                  </button>
                  <span className="ml-auto text-label text-on-surface-variant/60">{item.author}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ============ ATTENDANCE WALL ============ */}
      <section id="roster-section" className="space-y-4 @min-[700px]/app:flex-[1_1_40%] @min-[700px]/app:min-w-0">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <span className="font-serif text-title leading-[1.04] text-on-surface flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Attendance wall
          </span>
          <span className="flex-1 min-w-[20px] h-px bg-on-surface/15" />
        </div>

        {/* Search + status filter */}
        {rsvps.length > 0 && (
          <div className="flex flex-col @min-[640px]/app:flex-row @min-[640px]/app:flex-wrap @min-[640px]/app:items-center @min-[700px]/app:flex-col @min-[700px]/app:items-stretch gap-2">
            <div className="relative w-full @min-[640px]/app:flex-1 @min-[640px]/app:w-56 @min-[700px]/app:flex-none @min-[700px]/app:w-full">
              <Search className="w-3.5 h-3.5 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Find a batchmate…"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowAllRsvps(false); }}
                className="w-full pl-8 pr-3 py-2 rounded-full border border-outline-variant/40 text-body text-on-surface focus:outline-none focus:ring-1 focus:ring-primary bg-white/60"
              />
            </div>
            <div className="flex items-center @min-[640px]/app:flex-wrap gap-1">
              {(['All', 'Attending', 'Most likely', 'Maybe'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => { setStatusFilter(filter); setShowAllRsvps(false); }}
                  className={`flex-1 min-w-0 @min-[640px]/app:flex-none @min-[700px]/app:flex-1 px-2 @min-[640px]/app:px-3 py-1.5 rounded-full text-label font-semibold whitespace-nowrap transition-all ${
                    statusFilter === filter
                      ? 'bg-on-surface text-background'
                      : 'bg-white/50 text-on-surface-variant border border-white/80'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Roster grid */}
        {rsvps.length === 0 ? (
          <div className="text-center py-11 px-5 rounded border-[1.5px] border-dashed border-on-surface/25 bg-white/40 space-y-2.5">
            <UsersRound className="w-6 h-6 mx-auto text-on-surface-variant/60" />
            <h3 className="font-serif text-title text-on-surface">Walang card sa stack.</h3>
            <p className="text-body text-on-surface-variant max-w-[38ch] mx-auto">
              Maging una — answer the survey and your card lands on top.
            </p>
          </div>
        ) : filteredRsvps.length === 0 ? (
          <div className="text-center py-8 text-body text-on-surface-variant">
            {isFiltering ? 'No batchmates found matching your search or filter.' : `No batchmates found matching "${searchQuery}".`}
          </div>
        ) : (
          <>
            <div className="grid gap-5 grid-cols-1 @min-[640px]/app:grid-cols-2 @min-[700px]/app:grid-cols-1">
              {visibleRsvps.map((r) => {
                // Fall back for any legacy status string the API may still hold.
                const st = STATUS_EDGE[r.status] ?? STATUS_EDGE.Maybe;
                // plusOnesCount is the real party size; the boolean is the
                // fallback for cards written before the count existed.
                const adults = r.plusOnesCount ?? (r.bringingPlusOne ? 1 : 0);
                const kids = r.kidsCount ?? 0;
                const companions = [
                  adults ? `${adults} adult${adults > 1 ? 's' : ''}` : '',
                  kids ? `${kids} kid${kids > 1 ? 's' : ''}` : '',
                ].filter(Boolean).join(' · ');
                return (
                  <div
                    key={r.id}
                    className="p-4 rounded bg-surface-container-lowest shadow-soft flex flex-col gap-2"
                    style={{ borderTop: `3px solid ${st.edge}` }}
                  >
                    <div className="flex items-center gap-2.5">
                      <CardAvatar url={r.photoUrl} fullName={r.fullName} bg={st.avBg} />
                      <span className="flex-1 font-serif font-medium text-heading text-on-surface truncate">{r.fullName}</span>
                      <span className="font-mono text-label tracking-[0.1em] uppercase" style={{ color: st.avBg }}>
                        {st.label}
                      </span>
                    </div>
                    {r.messageToBatch && (
                      <span className="font-sans italic text-body leading-relaxed text-on-surface-variant/85 flex items-start gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 mt-1 flex-shrink-0 text-outline" />
                        <span className="line-clamp-3">&ldquo;{r.messageToBatch}&rdquo;</span>
                      </span>
                    )}
                    <span className="font-mono text-label tracking-[0.1em] uppercase text-on-surface-variant/60 flex items-center gap-1">
                      {companions && <UserPlus className="w-3 h-3" />}
                      {companions}{companions ? ' · ' : ''}
                      {new Date(r.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>

            {hiddenRsvpCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAllRsvps(true)}
                className="mx-auto block px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-white/90 text-body font-semibold text-primary shadow-soft"
              >
                View {hiddenRsvpCount} more batchmate{hiddenRsvpCount === 1 ? '' : 's'}
              </button>
            )}
          </>
        )}
      </section>

      </div>
    </div>
  );
};
