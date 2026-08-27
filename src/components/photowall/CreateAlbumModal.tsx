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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-surface-container-lowest rounded p-6 border border-outline-variant/30 shadow-soft space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-semibold text-base text-on-surface">New Album</h2>
          <button type="button" onClick={onClose} className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Batch Trips & Reunions"
              className="w-full px-3 py-2.5 rounded border border-secondary/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Description <span className="font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 rounded border border-secondary/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
            />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container font-semibold text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded bg-primary hover:opacity-90 disabled:opacity-60 text-on-primary font-semibold text-sm shadow-soft transition-all"
            >
              {isSubmitting ? 'Creating…' : 'Create Album'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
