import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Upload, Pin, Sparkles } from 'lucide-react';
import { Announcement } from '../../types';

interface AddAnnouncementModalProps {
  onClose: () => void;
  onSaveAnnouncement: (announcement: Announcement) => void;
  existingAnnouncement?: Announcement | null;
}

export const AddAnnouncementModal: React.FC<AddAnnouncementModalProps> = ({
  onClose,
  onSaveAnnouncement,
  existingAnnouncement,
}) => {
  const [title, setTitle] = useState(existingAnnouncement?.title || '');
  const [caption, setCaption] = useState(existingAnnouncement?.caption || '');
  const [tag, setTag] = useState<Announcement['tag']>(existingAnnouncement?.tag || 'General');
  const [author, setAuthor] = useState(existingAnnouncement?.author || 'Batch 2007 Core Committee');
  const [imageUrl, setImageUrl] = useState(existingAnnouncement?.imageUrl || '');
  const [isPinned, setIsPinned] = useState(existingAnnouncement?.isPinned || false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const presets = [
    { label: 'High School Alumni', url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Venue & Celebration', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Finance & Transparency', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Dinner & Toast', url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setError('Image file is too large (max 4MB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
          setError('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !caption.trim()) {
      setError('Please provide both Title and Caption.');
      return;
    }

    const ann: Announcement = {
      id: existingAnnouncement ? existingAnnouncement.id : `ann-${Date.now()}`,
      title: title.trim(),
      caption: caption.trim(),
      tag,
      author: author.trim() || 'Batch 2007 Core Committee',
      imageUrl: imageUrl.trim() || undefined,
      date: existingAnnouncement ? existingAnnouncement.date : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      isPinned,
      likesCount: existingAnnouncement?.likesCount || 0,
    };

    onSaveAnnouncement(ann);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-lg max-w-xl w-full p-6 sm:p-8 shadow-soft border border-outline-variant/30 space-y-6 my-8 max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
          <div>
            <h2 className="text-lg font-serif font-bold text-on-surface">
              {existingAnnouncement ? 'Edit Announcement' : 'Create Batch Announcement'}
            </h2>
            <p className="text-xs text-on-surface-variant">
              Broadcast updates to all MSHS Batch 2007 visitors
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-outline hover:text-on-surface hover:bg-surface-container"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-error-container text-on-error-container text-xs font-medium rounded border border-error-container">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">
              Title <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 📢 Save the Date: Venue Finalist Selection"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded border border-secondary/30 text-on-surface text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                Category Tag
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded border border-secondary/30 text-on-surface text-xs font-semibold focus:outline-none"
              >
                <option value="Important">Important</option>
                <option value="Survey">Survey</option>
                <option value="Venue">Venue</option>
                <option value="Finance">Finance</option>
                <option value="General">General</option>
                <option value="Volunteer">Volunteer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                Author / Department
              </label>
              <input
                type="text"
                placeholder="e.g. Logistics Team / Finance Comm"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2.5 rounded border border-secondary/30 text-on-surface text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">
              Caption & Body Content <span className="text-error">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Write the announcement description or update message here..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-3 rounded border border-secondary/30 text-xs text-on-surface leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Image Upload & Presets */}
          <div className="space-y-2 p-4 bg-surface-container-low rounded border border-outline-variant/30">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide">
              Cover Image (Upload or Pick Preset)
            </label>

            {imageUrl && (
              <div className="relative h-32 w-full rounded overflow-hidden mb-3 border border-outline-variant/40">
                <img
                  src={imageUrl}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1 rounded-full bg-inverse-surface/80 text-inverse-on-surface hover:bg-error"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded bg-surface-container-lowest border border-secondary/30 hover:bg-surface-container text-on-surface-variant text-xs font-semibold flex items-center gap-1.5 shadow-soft"
              >
                <Upload className="w-3.5 h-3.5 text-secondary" />
                <span>Upload From Device</span>
              </button>

              <input
                type="url"
                placeholder="Or paste image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 min-w-[180px] px-3 py-2 rounded border border-secondary/30 text-xs text-on-surface bg-surface-container-lowest"
              />
            </div>

            {/* Quick presets */}
            <div className="pt-2">
              <div className="text-[11px] text-on-surface-variant mb-1">Or pick a themed preset:</div>
              <div className="flex flex-wrap gap-1.5">
                {presets.map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setImageUrl(p.url)}
                    className="text-[10px] px-2 py-1 bg-surface-container-lowest border border-outline-variant/40 hover:border-secondary rounded text-on-surface-variant"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pin toggle */}
          <div className="flex items-center justify-between p-3 rounded bg-primary-container/15 border border-primary-container/40">
            <div className="flex items-center gap-2">
              <Pin className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-on-primary-container">Pin Announcement to Top</span>
            </div>
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded border border-secondary/30 text-on-surface-variant text-xs font-semibold hover:bg-surface-container"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded bg-primary hover:opacity-90 text-on-primary text-xs font-bold shadow-soft"
            >
              {existingAnnouncement ? 'Save Announcement' : 'Publish Announcement'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
