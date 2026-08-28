import React, { useRef, useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { ApiError, deleteProfilePhoto, uploadProfilePhoto } from '../api/client';
import { resizeProfilePhoto } from '../utils/imageResize';

// The browser resizes/recompresses the photo before it ever reaches the
// server, so this just guards against picking an absurdly large source file.
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;

interface PhotoTileProps {
  slot: 'then' | 'now';
  label: string;
  hint: string;
  photoUrl: string | null | undefined;
  onPhotoChanged: (url: string | null) => void;
  applyThenFilter?: boolean;
}

export const PhotoTile: React.FC<PhotoTileProps> = ({
  slot,
  label,
  hint,
  photoUrl,
  onPhotoChanged,
  applyThenFilter,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_SOURCE_BYTES) {
      setError('File too large (max 15MB).');
      return;
    }

    setError('');
    setIsBusy(true);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    try {
      const resized = await resizeProfilePhoto(file);
      const url = await uploadProfilePhoto(slot, resized);
      onPhotoChanged(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed. Please try again.');
    } finally {
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
      setIsBusy(false);
    }
  };

  const handleClear = async () => {
    setError('');
    setIsBusy(true);
    try {
      await deleteProfilePhoto(slot);
      onPhotoChanged(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove photo.');
    } finally {
      setIsBusy(false);
    }
  };

  const displayUrl = previewUrl || photoUrl;

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-semibold text-on-surface-variant text-center">{label}</div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isBusy}
        className="relative w-full aspect-square rounded border border-tertiary/20 bg-surface-container-low overflow-hidden flex flex-col items-center justify-center gap-1.5 hover:border-tertiary/40 transition-colors disabled:cursor-wait"
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={label}
            className="w-full h-full object-cover"
            style={applyThenFilter ? { filter: 'sepia(0.55) contrast(0.95) saturate(0.85)' } : undefined}
          />
        ) : (
          <>
            <Upload className="w-5 h-5 text-outline" />
            <span className="text-[10px] text-on-surface-variant px-2 text-center">{hint}</span>
          </>
        )}
        {isBusy && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
      {displayUrl && !isBusy && (
        <button
          type="button"
          onClick={handleClear}
          className="w-full text-[10px] text-on-surface-variant hover:text-error flex items-center justify-center gap-1"
        >
          <X className="w-3 h-3" />
          <span>Remove</span>
        </button>
      )}
      {error && <p className="text-[10px] text-error text-center">{error}</p>}
    </div>
  );
};
