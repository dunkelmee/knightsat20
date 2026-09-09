import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Album } from '../../types';
import { ApiError, createAlbum } from '../../api/client';

interface CreateAlbumModalProps {
  onClose: () => void;
  onCreated: (album: Album) => void;
}

export const CreateAlbumModal: React.FC<CreateAlbumModalProps> = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Give the album a title.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const album = await createAlbum({ title: title.trim(), description: description.trim() || undefined });
      onCreated(album);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-surface-container-low rounded-xl p-6 shadow-soft space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-heading text-on-surface">New Album</h2>
          <button type="button" onClick={onClose} className="text-on-surface-variant/60 hover:text-on-surface">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label font-semibold text-on-surface-variant mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Batch Trips & Reunions"
              className="w-full py-2 border-b-[1.5px] border-on-surface/30 bg-transparent text-on-surface text-body focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-label font-semibold text-on-surface-variant mb-1.5">
              Description <span className="font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-white/50 text-on-surface text-body focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {error && <p className="text-body text-error">{error}</p>}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-on-surface/20 text-on-surface-variant hover:bg-black/5 font-semibold text-body transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-primary hover:opacity-90 disabled:opacity-60 text-on-primary font-bold text-body shadow-soft transition-all"
            >
              {isSubmitting ? 'Creating…' : 'Create Album'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
