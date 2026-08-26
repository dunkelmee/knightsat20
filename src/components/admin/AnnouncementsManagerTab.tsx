import React, { useState } from 'react';
import { Bell, Plus, Edit2, Trash2, Pin, PinOff, Heart, Eye } from 'lucide-react';
import { Announcement } from '../../types';
import { AddAnnouncementModal } from './AddAnnouncementModal';

interface AnnouncementsManagerTabProps {
  announcements: Announcement[];
  onSaveAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const AnnouncementsManagerTab: React.FC<AnnouncementsManagerTabProps> = ({
  announcements,
  onSaveAnnouncement,
  onDeleteAnnouncement,
  onTogglePin,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  return (
    <div id="announcements-manager-tab" className="space-y-6">

      {/* Header & Add Button */}
      <div className="bg-surface-container-lowest rounded p-5 border border-outline-variant/30 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <Bell className="w-5 h-5 text-tertiary" />
            <span>Announcements & Bulletin Manager</span>
          </h3>
          <p className="text-xs text-on-surface-variant">
            Publish official updates, venue surveys, budget reports, and upload photos
          </p>
        </div>

        <button
          id="btn-create-announcement-modal"
          type="button"
          onClick={() => {
            setEditingAnnouncement(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 rounded bg-primary hover:opacity-90 text-on-primary text-xs font-bold shadow-soft transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`bg-surface-container-lowest rounded p-5 border shadow-soft flex flex-col justify-between space-y-4 ${
              ann.isPinned ? 'border-primary-container ring-1 ring-primary-container/40' : 'border-outline-variant/30'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-tertiary-container/25 text-on-tertiary-container">
                    {ann.tag}
                  </span>
                  {ann.isPinned && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-container/20 text-on-primary-container flex items-center gap-1">
                      <Pin className="w-3 h-3 fill-current" />
                      <span>Pinned</span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-outline">{ann.date}</span>
              </div>

              {ann.imageUrl && (
                <div className="h-36 w-full rounded overflow-hidden bg-surface-container">
                  <img
                    src={ann.imageUrl}
                    alt={ann.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <h4 className="font-serif font-bold text-on-surface text-sm">{ann.title}</h4>
                <p className="text-xs text-on-surface-variant mt-1 line-clamp-3 leading-relaxed">
                  {ann.caption}
                </p>
              </div>

              <div className="text-[11px] text-outline">
                Author: <span className="text-on-surface-variant font-medium">{ann.author}</span> • Likes: {ann.likesCount}
              </div>
            </div>

            {/* Admin actions */}
            <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20 text-xs">
              <button
                type="button"
                onClick={() => onTogglePin(ann.id)}
                className={`px-2.5 py-1 rounded border text-xs font-semibold flex items-center gap-1.5 ${
                  ann.isPinned
                    ? 'bg-primary-container/20 text-on-primary-container border-primary-container/50'
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:bg-surface-container'
                }`}
              >
                {ann.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                <span>{ann.isPinned ? 'Unpin' : 'Pin to Top'}</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAnnouncement(ann);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                  title="Edit announcement"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete announcement "${ann.title}"?`)) {
                      onDeleteAnnouncement(ann.id);
                    }
                  }}
                  className="p-1.5 rounded bg-error-container hover:opacity-80 text-on-error-container"
                  title="Delete announcement"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {isModalOpen && (
        <AddAnnouncementModal
          onClose={() => setIsModalOpen(false)}
          onSaveAnnouncement={onSaveAnnouncement}
          existingAnnouncement={editingAnnouncement}
        />
      )}

    </div>
  );
};
