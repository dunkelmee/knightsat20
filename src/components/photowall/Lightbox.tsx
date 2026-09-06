import React, { useEffect, useRef, useState } from 'react';
import { X, Trash2, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { Photo } from '../../types';
import { Avatar, AvatarStack } from '../Avatar';
import { PhotoEditor } from './PhotoEditor';

interface LightboxProps {
  photos: Photo[];
  index: number;
  canDelete: boolean;
  /** True only for the uploader — captions and tags are theirs to edit. */
  canEdit: boolean;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onDelete: () => void;
  onSavePhoto: (payload: { caption: string | null; taggedUserIds: string[] }) => Promise<void>;
}

// Horizontal travel (px) before a touch counts as a swipe rather than a tap or
// a vertical scroll.
const SWIPE_THRESHOLD = 50;

export const Lightbox: React.FC<LightboxProps> = ({
  photos,
  index,
  canDelete,
  canEdit,
  onIndexChange,
  onClose,
  onDelete,
  onSavePhoto,
}) => {
  const photo = photos[index];
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  // Moving to another photo abandons an open edit rather than carrying the
  // half-typed caption across.
  useEffect(() => setIsEditing(false), [index]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditing) setIsEditing(false);
        else onClose();
        return;
      }
      // Don't page the album while someone is typing a caption or searching.
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      if (e.key === 'ArrowLeft' && index > 0) onIndexChange(index - 1);
      else if (e.key === 'ArrowRight' && index < photos.length - 1) onIndexChange(index + 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [index, photos.length, isEditing, onIndexChange, onClose]);

  if (!photo) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    // Paging away mid-edit would throw the half-typed caption out, so an open
    // editor takes the gesture off the table entirely.
    if (isEditing) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    // Ignore mostly-vertical drags so scrolling/dismissing gestures don't page.
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return;

    if (dx < 0 && hasNext) onIndexChange(index + 1);
    else if (dx > 0 && hasPrev) onIndexChange(index - 1);
  };

  return (
    // The overlay itself scrolls: the editor makes the content taller than a
    // phone screen, and a plain centred flexbox clips the overflow with no way
    // to reach it. `min-h-full` on the inner wrapper keeps a short photo
    // centred while letting a tall one grow and scroll, padding intact.
    <div
      className="fixed inset-0 z-50 bg-black/85 overflow-y-auto overscroll-contain"
      onClick={onClose}
    >
      <div
        className="min-h-full flex items-center justify-center p-4"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-2xl w-full space-y-3" onClick={(e) => e.stopPropagation()}>
        <div
          className="relative rounded overflow-hidden bg-black"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          // Let the browser keep vertical gestures; horizontal ones are ours.
          style={{ touchAction: 'pan-y' }}
        >
          <img
            src={photo.fullUrl}
            alt={photo.caption || 'Batch photo'}
            // Yields room to the form while editing so the fields and the Save
            // bar are on screen without hunting for them.
            className={`w-full object-contain select-none ${isEditing ? 'max-h-[38vh]' : 'max-h-[75vh]'}`}
            draggable={false}
          />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {photos.length > 1 && (
            <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/60 font-mono text-label tracking-[0.1em] text-white/80">
              {index + 1} / {photos.length}
            </span>
          )}

          {hasPrev && (
            <button
              type="button"
              onClick={() => onIndexChange(index - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
              title="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {hasNext && (
            <button
              type="button"
              onClick={() => onIndexChange(index + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
              title="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {isEditing ? (
          <PhotoEditor
            photo={photo}
            onCancel={() => setIsEditing(false)}
            onSave={async (payload) => {
              await onSavePhoto(payload);
              setIsEditing(false);
            }}
          />
        ) : (
          <div className="space-y-2 px-1">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-white text-body min-w-0">
                <span className="w-6 h-6 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-bold flex-shrink-0" style={{ fontSize: 9 }}>
                  {photo.uploaderInitials}
                </span>
                {photo.caption ? (
                  <span className="text-white/90">{photo.caption}</span>
                ) : (
                  <span className="text-white/50 italic">No caption</span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white/15 text-white text-body font-semibold hover:bg-white/25"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}

                {canDelete && (
                  <button
                    type="button"
                    onClick={onDelete}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-error-container text-on-error-container text-body font-semibold hover:opacity-90"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>

            {photo.tags.length > 0 && (
              <div className="flex items-center gap-2 min-w-0">
                <AvatarStack people={photo.tags} size={20} ringColor="rgba(0,0,0,.6)" />
                <span className="text-body text-white/70 truncate">
                  with {photo.tags.map((p) => p.fullName).join(', ')}
                </span>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
