import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { PersonRef, Photo } from '../../types';
import { ApiError, searchPeople } from '../../api/client';
import { Avatar } from '../Avatar';

interface PhotoEditorProps {
  photo: Photo;
  onCancel: () => void;
  onSave: (payload: { caption: string | null; taggedUserIds: string[] }) => Promise<void>;
}

const SEARCH_DEBOUNCE_MS = 250;
const MAX_CAPTION = 300;

export const PhotoEditor: React.FC<PhotoEditorProps> = ({ photo, onCancel, onSave }) => {
  const [caption, setCaption] = useState(photo.caption ?? '');
  const [tagged, setTagged] = useState<PersonRef[]>(photo.tags);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PersonRef[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  // Guards against a slow early request overwriting a later one's results.
  const searchSeq = useRef(0);

  useEffect(() => {
    const seq = ++searchSeq.current;
    const timer = setTimeout(async () => {
      try {
        const people = await searchPeople(query.trim());
        if (seq === searchSeq.current) setResults(people);
      } catch {
        if (seq === searchSeq.current) setResults([]);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const taggedIds = new Set(tagged.map((p) => p.id));
  const suggestions = results.filter((p) => !taggedIds.has(p.id));

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      await onSave({
        caption: caption.trim() || null,
        taggedUserIds: tagged.map((p) => p.id),
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded p-3.5 space-y-3">
      <div className="space-y-1.5">
        <label htmlFor="photo-caption" className="font-mono text-label tracking-[0.14em] uppercase text-on-surface-variant/70">
          Caption
        </label>
        <input
          id="photo-caption"
          type="text"
          value={caption}
          maxLength={MAX_CAPTION}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Say something about this photo…"
          className="w-full px-3 py-2 rounded border border-outline-variant/50 bg-surface text-body text-on-surface"
        />
      </div>

      <div className="space-y-1.5">
        <span className="font-mono text-label tracking-[0.14em] uppercase text-on-surface-variant/70">
          Who's in this photo
        </span>

        {tagged.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tagged.map((person) => (
              <span
                key={person.id}
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full bg-surface-container-high text-body text-on-surface"
              >
                <Avatar url={person.nowPhotoUrl} initials={person.initials} fullName={person.fullName} size={20} />
                <span>{person.fullName}</span>
                <button
                  type="button"
                  onClick={() => setTagged((prev) => prev.filter((p) => p.id !== person.id))}
                  className="text-on-surface-variant hover:text-error"
                  title={`Remove ${person.fullName}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search batchmates…"
            className="w-full pl-8 pr-3 py-2 rounded border border-outline-variant/50 bg-surface text-body text-on-surface"
          />
        </div>

        {suggestions.length > 0 && (
          <ul className="max-h-44 overflow-y-auto rounded border border-outline-variant/40 divide-y divide-outline-variant/25">
            {suggestions.map((person) => (
              <li key={person.id}>
                <button
                  type="button"
                  onClick={() => {
                    setTagged((prev) => [...prev, person]);
                    setQuery('');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left hover:bg-surface-container-high"
                >
                  <Avatar url={person.nowPhotoUrl} initials={person.initials} fullName={person.fullName} size={28} />
                  <span className="text-body text-on-surface">{person.fullName}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {query.trim() !== '' && suggestions.length === 0 && (
          <p className="text-body text-on-surface-variant/70">No batchmates match “{query.trim()}”.</p>
        )}
      </div>

      {error && <p className="text-body text-error">{error}</p>}

      {/* Sticky so Save stays reachable while scrolling a long list of
          batchmates — on a phone it would otherwise sit below the fold. */}
      <div className="sticky bottom-0 -mx-3.5 -mb-3.5 px-3.5 py-3 bg-surface-container-lowest border-t border-outline-variant/30 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-3.5 py-2 rounded-full text-body font-semibold text-on-surface-variant disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 rounded-full bg-primary text-on-primary text-body font-bold shadow-soft disabled:opacity-60"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
};
