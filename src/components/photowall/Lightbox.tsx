import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { Photo } from '../../types';

interface LightboxProps {
  photo: Photo;
  canDelete: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ photo, canDelete, onClose, onDelete }) => (
  <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4" onClick={onClose}>
    <div className="max-w-2xl w-full space-y-3" onClick={(e) => e.stopPropagation()}>
      <div className="relative rounded overflow-hidden bg-black">
        <img src={photo.fullUrl} alt={photo.caption || 'Batch photo'} className="w-full max-h-[75vh] object-contain" />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-white text-xs">
          <span className="w-6 h-6 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center text-[10px] font-bold flex-shrink-0">
            {photo.uploaderInitials}
          </span>
          {photo.caption ? <span className="text-white/90">{photo.caption}</span> : <span className="text-white/50 italic">No caption</span>}
        </div>

        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-error-container text-on-error-container text-xs font-semibold hover:opacity-90"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  </div>
);
