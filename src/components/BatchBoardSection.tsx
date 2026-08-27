import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Bell, Pin, User, Heart, Share2, Check, Send, Users, CheckCircle2,
  MessageSquare, UserPlus, Clock, Plus, Minus, Search,
  ChevronDown, ChevronUp, Sparkles, Megaphone, UsersRound,
} from 'lucide-react';
import { Announcement, PublicRSVP, RSVPRecord } from '../types';

interface BatchBoardSectionProps {
  announcements: Announcement[];
  onLikeAnnouncement: (id: string) => void;
  onOpenAdminToPost: () => void;
  rsvps: PublicRSVP[];
  onRsvpSubmitted: (rsvp: RSVPRecord) => void;
}

export const BatchBoardSection: React.FC<BatchBoardSectionProps> = ({
  announcements,
  onLikeAnnouncement,
  onOpenAdminToPost,
  rsvps,
  onRsvpSubmitted,
}) => {
  // Announcements state
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Roster state
  const [showExpressForm, setShowExpressForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Attending' | 'Maybe'>('All');

  // Roster express-RSVP form state
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<RSVPRecord['status']>('Attending');
  const [plusOnesCount, setPlusOnesCount] = useState<number>(0);
  const [kidsCount, setKidsCount] = useState<number>(0);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [messageToBatch, setMessageToBatch] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

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

  const handleShare = (id: string) => {
    setCopiedId(id);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Roster computations
  const attendingList = rsvps.filter(r => r.status === 'Attending');
  const maybeList = rsvps.filter(r => r.status === 'Maybe');

  const plusOnesTotal = attendingList.reduce((acc, r) => acc + (r.bringingPlusOne ? 1 : 0), 0);
  const kidsTotal = attendingList.reduce((acc, r) => acc + (r.kidsCount || 0), 0);
  const totalHeadcount = attendingList.length + plusOnesTotal + kidsTotal;

  const isFiltering = searchQuery.trim() !== '' || statusFilter !== 'All';

  const filteredRsvps = rsvps.filter(r => {
    const matchesSearch = r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.messageToBatch && r.messageToBatch.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' ? true : r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your name.');
      return;
    }
    setError('');

    const newRsvp: RSVPRecord = {
      id: `rsvp-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      fullName: fullName.trim(),
      contactNumber: contactNumber.trim() || undefined,
      email: email.trim() || undefined,
      status,
      bringingPlusOne: status === 'Attending' ? plusOnesCount > 0 : false,
      kidsCount: status === 'Attending' ? kidsCount : 0,
      dietaryRestrictions: dietaryRestrictions.trim() || undefined,
      messageToBatch: messageToBatch.trim() || undefined,
    };

    if (status === 'Attending') {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}
    }

    onRsvpSubmitted(newRsvp);
    setIsSubmitted(true);
  };

  return (
    <div id="batch-board-container" className="max-w-5xl mx-auto py-5 px-4 space-y-8">

      {/* ============ ANNOUNCEMENTS & UPDATES ============ */}
      <section id="announcements-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/30">
          <h2 className="text-base sm:text-lg font-serif font-semibold text-on-surface flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <span>Announcements & Updates</span>
          </h2>

          {announcements.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {tags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    selectedTag === tag
                      ? 'bg-primary text-on-primary shadow-soft'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-outline-variant/30'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {announcements.length === 0 ? (
          <div className="text-center py-10 px-4 bg-surface-container-lowest rounded border border-dashed border-outline-variant/40 space-y-2.5">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 text-on-primary-container flex items-center justify-center mx-auto border border-primary-container/50">
              <Megaphone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-on-surface">No announcements yet</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              The organizing committee hasn&apos;t posted anything yet. Check back soon — updates on the date, venue, and finances will show up here first.
            </p>
            <button
              type="button"
              onClick={onOpenAdminToPost}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-semibold border border-outline-variant/30 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Committee: Post an Update</span>
            </button>
          </div>
        ) : sortedAnnouncements.length === 0 ? (
          <div className="text-center py-8 text-xs text-on-surface-variant">
            No announcements tagged &quot;{selectedTag}&quot; yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedAnnouncements.map((item) => (
              <article
                key={item.id}
                id={`announcement-card-${item.id}`}
                className={`bg-surface-container-lowest rounded overflow-hidden border shadow-soft hover:shadow-soft transition-all flex flex-col justify-between ${
                  item.isPinned ? 'border-primary-container ring-1 ring-primary-container/50' : 'border-outline-variant/30'
                }`}
              >
                <div>
                  {item.imageUrl && (
                    <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-surface-container">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {item.isPinned && (
                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-primary text-on-primary text-[10px] font-semibold flex items-center gap-1 shadow-soft">
                          <Pin className="w-2.5 h-2.5" />
                          <span>PINNED</span>
                        </div>
                      )}
                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-inverse-surface/80 backdrop-blur-xs text-inverse-on-surface text-[10px] font-medium uppercase tracking-wider">
                        {item.tag}
                      </span>
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    {!item.imageUrl && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-tertiary-container/25 text-on-tertiary-container border border-tertiary-container/50 uppercase">
                          {item.tag}
                        </span>
                        {item.isPinned && (
                          <span className="text-[11px] font-medium text-primary flex items-center gap-1">
                            <Pin className="w-3 h-3" /> Pinned
                          </span>
                        )}
                      </div>
                    )}

                    <h3 className="text-sm sm:text-base font-serif font-semibold text-on-surface leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-on-surface-variant text-xs leading-relaxed whitespace-pre-line">
                      {item.caption}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-1.5 flex items-center justify-between border-t border-outline-variant/20 text-[11px] text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-on-surface-variant flex items-center gap-1">
                      <User className="w-3 h-3 text-outline" />
                      {item.author}
                    </span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onLikeAnnouncement(item.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded hover:bg-error-container/40 text-on-surface-variant hover:text-error transition-colors font-medium text-xs"
                    >
                      <Heart className="w-3.5 h-3.5 text-error" />
                      <span>{item.likesCount || 0}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShare(item.id)}
                      className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                      title="Share announcement link"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="border-t border-outline-variant/30" />

      {/* ============ ATTENDEE ROSTER & GUEST LIST ============ */}
      <section id="roster-section" className="space-y-5">

        {/* Section Title */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h2 className="text-sm sm:text-base font-serif font-semibold text-on-surface">
            Attendee Roster & Guest List
          </h2>
        </div>

        <div className="border-t border-outline-variant/30" />

        {/* Sleek Minimalist Headcount Strip */}
        <div id="rsvp-headcount-cards" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-surface-container-lowest rounded p-3.5 border border-outline-variant/30 shadow-soft">
            <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium mb-0.5">
              <span>Attending Alumni</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            </div>
            <div className="text-2xl font-semibold text-on-surface">
              {attendingList.length}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded p-3.5 border border-outline-variant/30 shadow-soft">
            <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium mb-0.5">
              <span>Plus-Ones & Kids</span>
              <UserPlus className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="text-2xl font-semibold text-on-surface">
              +{plusOnesTotal + kidsTotal}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded p-3.5 border border-outline-variant/30 shadow-soft">
            <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium mb-0.5">
              <span>Total Headcount</span>
              <Users className="w-3.5 h-3.5 text-on-surface-variant" />
            </div>
            <div className="text-2xl font-semibold text-on-surface">
              {totalHeadcount}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded p-3.5 border border-outline-variant/30 shadow-soft">
            <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium mb-0.5">
              <span>Tentative (Maybe)</span>
              <Clock className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="text-2xl font-semibold text-on-surface">
              {maybeList.length}
            </div>
          </div>
        </div>

        {/* Express Status Update / Message Accordion */}
        <div className="bg-surface-container-lowest rounded border border-outline-variant/30 shadow-soft overflow-hidden">
          <button
            type="button"
            onClick={() => setShowExpressForm(!showExpressForm)}
            className="w-full p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-primary-container/20 text-on-primary-container flex items-center justify-center border border-primary-container/50">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-on-surface">
                  Post a Quick Shoutout / Message (Quick Form)
                </div>
                <div className="text-[11px] text-on-surface-variant">
                  Want to leave a quick message or shoutout for the batch without the 10-question survey? Click here.
                </div>
              </div>
            </div>
            <div className="text-outline">
              {showExpressForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showExpressForm && (
            <div className="p-4 sm:p-5 border-t border-outline-variant/20 bg-surface-container-low">
              {isSubmitted ? (
                <div className="text-center py-5 space-y-2.5">
                  <div className="w-9 h-9 bg-success-container text-on-success-container rounded-full flex items-center justify-center mx-auto border border-success-container">
                    <Check className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-on-surface">
                    Thanks, {fullName}!
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Your shoutout and status have been posted to the board below.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFullName('');
                      setContactNumber('');
                      setEmail('');
                      setMessageToBatch('');
                      setPlusOnesCount(0);
                      setKidsCount(0);
                    }}
                    className="px-3.5 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-semibold border border-outline-variant/30"
                  >
                    Submit Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-3">
                  {error && (
                    <div className="p-2 rounded bg-error-container text-on-error-container text-xs font-medium border border-error-container">
                      {error}
                    </div>
                  )}

                  {/* Status Radio */}
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                      Attendance Status <span className="text-error">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { val: 'Attending', label: 'Attending 🎉' },
                        { val: 'Maybe', label: 'Maybe 🤔' },
                        { val: 'Decline', label: 'Can’t join 😢' },
                      ].map((s) => (
                        <label
                          key={s.val}
                          className={`p-2 rounded border text-center text-xs cursor-pointer transition-all ${
                            status === s.val
                              ? 'border-primary bg-primary-container/15 text-on-surface font-semibold ring-1 ring-primary'
                              : 'border-outline-variant/30 hover:border-outline-variant text-on-surface-variant bg-surface-container-lowest'
                          }`}
                        >
                          <input
                            type="radio"
                            name="rsvpStatus"
                            checked={status === s.val}
                            onChange={() => setStatus(s.val as any)}
                            className="sr-only"
                          />
                          <span>{s.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                      Your Name <span className="text-error">*</span>
                    </label>
                    <input
                      id="input-rsvp-name"
                      type="text"
                      required
                      placeholder="e.g. Juan dela Cruz (IV-Curie)"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded border border-secondary/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-surface-container-lowest"
                    />
                  </div>

                  {/* Companions */}
                  {status === 'Attending' && (
                    <div className="p-3 bg-surface-container-low rounded border border-outline-variant/30 space-y-2.5">
                      <div className="text-xs font-semibold text-on-surface-variant">Companions (0 if attending alone)</div>

                      <div className="grid grid-cols-2 gap-2.5">
                        {/* Plus Ones */}
                        <div className="bg-surface-container-lowest p-2 rounded border border-outline-variant/30 flex items-center justify-between">
                          <span className="text-xs font-medium text-on-surface-variant">Adult (+1s)</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPlusOnesCount(Math.max(0, plusOnesCount - 1))}
                              className="w-6 h-6 rounded bg-surface-container font-semibold text-xs hover:bg-surface-container-high flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center text-xs font-semibold">{plusOnesCount}</span>
                            <button
                              type="button"
                              onClick={() => setPlusOnesCount(plusOnesCount + 1)}
                              className="w-6 h-6 rounded bg-surface-container font-semibold text-xs hover:bg-surface-container-high flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Kids */}
                        <div className="bg-surface-container-lowest p-2 rounded border border-outline-variant/30 flex items-center justify-between">
                          <span className="text-xs font-medium text-on-surface-variant">Kids</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setKidsCount(Math.max(0, kidsCount - 1))}
                              className="w-6 h-6 rounded bg-surface-container font-semibold text-xs hover:bg-surface-container-high flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center text-xs font-semibold">{kidsCount}</span>
                            <button
                              type="button"
                              onClick={() => setKidsCount(kidsCount + 1)}
                              className="w-6 h-6 rounded bg-surface-container font-semibold text-xs hover:bg-surface-container-high flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                      Message / Shoutout for Batch 2007:
                    </label>
                    <textarea
                      id="input-rsvp-message"
                      rows={2}
                      placeholder="Leave a short greeting or message for batchmates..."
                      value={messageToBatch}
                      onChange={(e) => setMessageToBatch(e.target.value)}
                      className="w-full px-3 py-1.5 rounded border border-secondary/30 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary bg-surface-container-lowest"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowExpressForm(false)}
                      className="px-3.5 py-1.5 rounded text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                    >
                      Cancel
                    </button>
                    <button
                      id="btn-submit-rsvp"
                      type="submit"
                      className="px-5 py-2 rounded bg-primary hover:opacity-90 text-on-primary font-semibold text-xs shadow-soft transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Save to Roster</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Main Attendee Roster & Shoutouts Card */}
        <div className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 space-y-4 shadow-soft">

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="text-sm sm:text-base font-serif font-semibold text-on-surface">
                Live Roster ({filteredRsvps.length})
              </h3>
            </div>

            {rsvps.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {/* Search Input */}
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-outline absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search batchmate..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded border border-secondary/30 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary bg-surface-container-low"
                  />
                </div>

                {/* Status Filter Chips */}
                <div className="flex items-center gap-1">
                  {(['All', 'Attending', 'Maybe'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setStatusFilter(filter)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                        statusFilter === filter
                          ? 'bg-primary text-on-primary shadow-soft'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Roster Grid */}
          {rsvps.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-primary-container/20 text-on-primary-container flex items-center justify-center mx-auto border border-primary-container/50">
                <UsersRound className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-on-surface">No batchmates on the roster yet</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                Be the first! Answer the survey or post a quick shoutout above to join the guest list.
              </p>
              <button
                type="button"
                onClick={() => setShowExpressForm(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-primary hover:opacity-90 text-on-primary text-xs font-semibold shadow-soft transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Post a Quick Shoutout</span>
              </button>
            </div>
          ) : filteredRsvps.length === 0 ? (
            <div className="text-center py-8 text-xs text-on-surface-variant">
              {isFiltering
                ? `No batchmates found matching your search or filter.`
                : `No batchmates found matching "${searchQuery}".`}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredRsvps.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded bg-surface-container-low/70 hover:bg-surface-container-low border border-outline-variant/30 transition-all flex flex-col justify-between gap-2.5"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-serif font-semibold text-xs text-on-surface">
                          {r.fullName}
                        </div>
                        {(r.bringingPlusOne || (r.kidsCount && r.kidsCount > 0)) && (
                          <div className="text-[11px] text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                            <UserPlus className="w-3 h-3 text-outline" />
                            <span>
                              {r.bringingPlusOne ? '+1 Adult Guest' : ''}
                              {r.bringingPlusOne && r.kidsCount ? ' • ' : ''}
                              {r.kidsCount ? `${r.kidsCount} Kid${r.kidsCount > 1 ? 's' : ''}` : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded flex-shrink-0 ${
                        r.status === 'Attending' ? 'bg-success-container text-on-success-container border border-success-container' :
                        r.status === 'Maybe' ? 'bg-primary-container/20 text-on-primary-container border border-primary-container/50' : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        {r.status === 'Attending' ? '✓ Attending' : r.status === 'Maybe' ? '⏳ Maybe' : 'Can’t Join'}
                      </span>
                    </div>

                    {r.messageToBatch && (
                      <div className="text-xs text-on-surface-variant bg-surface-container-lowest p-2.5 rounded border border-outline-variant/20 shadow-soft flex items-start gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                        <p className="italic text-[11px] leading-relaxed">
                          &quot;{r.messageToBatch}&quot;
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-outline pt-1 border-t border-outline-variant/20">
                    <span>MakSci Batch 2007</span>
                    <span>{new Date(r.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
};
