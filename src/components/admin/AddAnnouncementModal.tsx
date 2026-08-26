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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {existingAnnouncement ? 'Edit Announcement' : 'Create Batch Announcement'}
            </h2>
            <p className="text-xs text-slate-500">
              Broadcast updates to all MSHS Batch 2007 visitors
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 📢 Save the Date: Venue Finalist Selection"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Category Tag
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none"
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Author / Department
              </label>
              <input
                type="text"
                placeholder="e.g. Logistics Team / Finance Comm"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Caption & Body Content <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Write the announcement description or update message here..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Image Upload & Presets */}
          <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Cover Image (Upload or Pick Preset)
            </label>

            {imageUrl && (
              <div className="relative h-32 w-full rounded-xl overflow-hidden mb-3 border border-slate-300">
                <img
                  src={imageUrl}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1 rounded-full bg-slate-950/80 text-white hover:bg-red-600"
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
                className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload From Device</span>
              </button>

              <input
                type="url"
                placeholder="Or paste image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
              />
            </div>

            {/* Quick presets */}
            <div className="pt-2">
              <div className="text-[11px] text-slate-500 mb-1">Or pick a themed preset:</div>
              <div className="flex flex-wrap gap-1.5">
                {presets.map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setImageUrl(p.url)}
                    className="text-[10px] px-2 py-1 bg-white border border-slate-300 hover:border-blue-400 rounded-md text-slate-700"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pin toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2">
              <Pin className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-bold text-amber-900">Pin Announcement to Top</span>
            </div>
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
            >
              {existingAnnouncement ? 'Save Announcement' : 'Publish Announcement'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
