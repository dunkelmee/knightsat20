import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

export const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Could not read file'));
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });

interface PhotoTileProps {
  label: string;
  hint: string;
  photoUrl: string | null | undefined;
  onPhotoSelected: (dataUrl: string) => void;
  onClear: () => void;
  applyThenFilter?: boolean;
}

export const PhotoTile: React.FC<PhotoTileProps> = ({
  label,
  hint,
  photoUrl,
  onPhotoSelected,
  onClear,
  applyThenFilter,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      setError('File too large (max 4MB).');
      return;
    }
    setError('');
    const dataUrl = await readFileAsDataUrl(file);
    onPhotoSelected(dataUrl);
  };

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-semibold text-on-surface-variant text-center">{label}</div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative w-full aspect-square rounded border border-tertiary/20 bg-surface-container-low overflow-hidden flex flex-col items-center justify-center gap-1.5 hover:border-tertiary/40 transition-colors"
      >
        {photoUrl ? (
          <img
            src={photoUrl}
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
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      {photoUrl && (
        <button
          type="button"
          onClick={onClear}
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
