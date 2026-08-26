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
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>Announcements & Bulletin Manager</span>
          </h3>
          <p className="text-xs text-slate-500">
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
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
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
            className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between space-y-4 ${
              ann.isPinned ? 'border-amber-400 ring-1 ring-amber-400/30' : 'border-slate-200'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {ann.tag}
                  </span>
                  {ann.isPinned && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 flex items-center gap-1">
                      <Pin className="w-3 h-3 fill-amber-900" />
                      <span>Pinned</span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">{ann.date}</span>
              </div>

              {ann.imageUrl && (
                <div className="h-36 w-full rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={ann.imageUrl}
                    alt={ann.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-900 text-sm">{ann.title}</h4>
                <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                  {ann.caption}
                </p>
              </div>

              <div className="text-[11px] text-slate-400">
                Author: <span className="text-slate-600 font-medium">{ann.author}</span> • Likes: {ann.likesCount}
              </div>
            </div>

            {/* Admin actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => onTogglePin(ann.id)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${
                  ann.isPinned
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
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
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
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
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700"
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
