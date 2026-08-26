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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <h2 className="text-base sm:text-lg font-semibold text-stone-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-700" />
          <span>Announcements & Updates</span>
        </h2>

        {/* Tag Filters */}
        <div className="flex flex-wrap items-center gap-1">
          {tags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                selectedTag === tag
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
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
            className={`bg-white rounded-xl overflow-hidden border shadow-xs hover:shadow-sm transition-all flex flex-col justify-between ${
              item.isPinned ? 'border-amber-300 ring-1 ring-amber-300/50' : 'border-stone-200'
            }`}
          >
            <div>
              {/* Cover Image if any */}
              {item.imageUrl && (
                <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-stone-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {item.isPinned && (
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-amber-500 text-stone-950 text-[10px] font-semibold flex items-center gap-1 shadow-xs">
                      <Pin className="w-2.5 h-2.5" />
                      <span>PINNED</span>
                    </div>
                  )}
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-stone-900/80 backdrop-blur-xs text-amber-200 text-[10px] font-medium uppercase tracking-wider">
                    {item.tag}
                  </span>
                </div>
              )}

              <div className="p-4 space-y-2">
                {!item.imageUrl && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 uppercase">
                      {item.tag}
                    </span>
                    {item.isPinned && (
                      <span className="text-[11px] font-medium text-amber-700 flex items-center gap-1">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                  </div>
                )}

                <h3 className="text-sm sm:text-base font-semibold text-stone-900 leading-snug">
                  {item.title}
                </h3>

                <p className="text-stone-700 text-xs leading-relaxed whitespace-pre-line">
                  {item.caption}
                </p>
              </div>
            </div>

            <div className="px-4 pb-4 pt-1.5 flex items-center justify-between border-t border-stone-100 text-[11px] text-stone-500">
              <div className="flex items-center gap-2">
                <span className="font-medium text-stone-700 flex items-center gap-1">
                  <User className="w-3 h-3 text-stone-400" />
                  {item.author}
                </span>
                <span>•</span>
                <span>{item.date}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onLikeAnnouncement(item.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 text-stone-600 hover:text-rose-600 transition-colors font-medium text-xs"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>{item.likesCount || 0}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShare(item.id)}
                  className="p-1 rounded hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
                  title="Share announcement link"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
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
