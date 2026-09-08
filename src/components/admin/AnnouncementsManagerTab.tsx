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

      {/* Section header — same treatment as the Ledger tab's Planned Expenses
          section, which in turn takes it from the attendee Batch Board's
          Announcements heading: serif `title`, a small primary icon, and a
          hairline rule running out to the edge, with the action in its own
          right-aligned row below. */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <span className="font-serif text-title leading-[1.04] text-on-surface flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Announcements
          </span>
          <span className="flex-1 min-w-[20px] h-px bg-on-surface/15" />
        </div>

        <p className="text-body text-on-surface-variant">
          Publish official updates, venue surveys, budget reports, and upload photos
        </p>

        <div className="flex justify-end gap-2">
          <button
            id="btn-create-announcement-modal"
            type="button"
            onClick={() => {
              setEditingAnnouncement(null);
              setIsModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        </div>
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
                  <span className="eyebrow px-2 py-0.5 rounded bg-tertiary-container/25 text-on-tertiary-container">
                    {ann.tag}
                  </span>
                  {ann.isPinned && (
                    <span className="eyebrow px-2 py-0.5 rounded bg-primary-container/20 text-on-primary-container flex items-center gap-1">
                      <Pin className="w-3 h-3 fill-current" />
                      <span>Pinned</span>
                    </span>
                  )}
                </div>
                <span className="text-label text-outline">{ann.date}</span>
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
                <h4 className="font-serif text-heading text-on-surface">{ann.title}</h4>
                <p className="text-body text-on-surface-variant mt-1 line-clamp-3 leading-relaxed">
                  {ann.caption}
                </p>
              </div>

              <div className="text-label text-outline">
                Author: <span className="text-on-surface-variant font-semibold">{ann.author}</span> • Likes: {ann.likesCount}
              </div>
            </div>

            {/* Admin actions */}
            <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20 text-body">
              <button
                type="button"
                onClick={() => onTogglePin(ann.id)}
                // A stateful toggle rather than a plain action, so it keeps an
                // accent when active — but it takes the shared button geometry
                // instead of inventing its own padding and border.
                className={`btn btn-secondary btn-sm ${
                  ann.isPinned ? 'bg-primary-container/20 text-on-primary-container border-primary-container/50' : ''
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
                  className="btn-icon"
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
                  className="btn-icon btn-icon-danger"
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
