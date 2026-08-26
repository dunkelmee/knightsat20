import React, { useState } from 'react';
import {
  Bell, Pin, Calendar, User, Heart,
  Share2, Check
} from 'lucide-react';
import { Announcement } from '../types';

interface AnnouncementsSectionProps {
  announcements: Announcement[];
  onLikeAnnouncement: (id: string) => void;
  onOpenAdminToPost: () => void;
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({
  announcements,
  onLikeAnnouncement,
  onOpenAdminToPost,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const tags = ['All', 'Survey', 'Venue', 'Finance', 'Important', 'General'];

  const filtered = announcements.filter(a => {
    if (selectedTag === 'All') return true;
    return a.tag.toLowerCase() === selectedTag.toLowerCase();
  });

  const sortedAnnouncements = [...filtered].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handleShare = (id: string) => {
    setCopiedId(id);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="announcements-container" className="max-w-4xl mx-auto py-5 px-4 space-y-5">

      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/30">
        <h2 className="text-base sm:text-lg font-serif font-semibold text-on-surface flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <span>Announcements & Updates</span>
        </h2>

        {/* Tag Filters */}
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
      </div>

      {/* Announcements Grid */}
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
              {/* Cover Image if any */}
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

    </div>
  );
};
