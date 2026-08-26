import React, { useRef, useState } from 'react';
import { GraduationCap, User as UserIcon, Phone, Upload, X, ArrowRight } from 'lucide-react';
import { UserProfile } from '../../types';
import { ApiError, updateProfile } from '../../api/client';

interface ProfileSetupProps {
  currentUser: UserProfile;
  onSaved: (user: UserProfile, hasSubmittedSurvey: boolean) => void;
}

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

const readFileAsDataUrl = (file: File): Promise<string> =>
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

const PhotoTile: React.FC<PhotoTileProps> = ({
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

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ currentUser, onSaved }) => {
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [mobileNumber, setMobileNumber] = useState(currentUser.mobileNumber);
  const [thenPhotoUrl, setThenPhotoUrl] = useState<string | null>(currentUser.thenPhotoUrl || null);
  const [nowPhotoUrl, setNowPhotoUrl] = useState<string | null>(currentUser.nowPhotoUrl || null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobileNumber.trim()) {
      setError('Please fill in your full name and mobile/WhatsApp number.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const { user, hasSubmittedSurvey } = await updateProfile({
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        thenPhotoUrl,
        nowPhotoUrl,
      });
      onSaved(user, hasSubmittedSurvey);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex items-center justify-center font-sans px-4 py-10">
      <div className="paper-grain" aria-hidden="true" />

      <div className="w-full max-w-md space-y-5">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded bg-primary text-on-primary flex items-center justify-center shadow-soft">
            <GraduationCap className="w-6 h-6 text-on-primary" />
          </div>
          <h1 className="font-serif font-semibold text-lg text-on-surface">
            Complete Your Profile
          </h1>
          <p className="text-xs text-on-surface-variant max-w-xs">
            One-time setup — confirm your details and add a "Then &amp; Now" photo for the batch.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface-container-lowest rounded p-6 border border-outline-variant/30 shadow-soft space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Full name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded border border-secondary/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Mobile / WhatsApp number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded border border-secondary/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-2">
              Then &amp; Now photos <span className="text-on-surface-variant font-normal">(optional)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <PhotoTile
                label="Then (Batch 2007)"
                hint="Upload a high school photo"
                photoUrl={thenPhotoUrl}
                applyThenFilter
                onPhotoSelected={setThenPhotoUrl}
                onClear={() => setThenPhotoUrl(null)}
              />
              <PhotoTile
                label="Now (Today)"
                hint="Upload a recent photo"
                photoUrl={nowPhotoUrl}
                onPhotoSelected={setNowPhotoUrl}
                onClear={() => setNowPhotoUrl(null)}
              />
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1.5">Max 4MB per photo. You can add these later too.</p>
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded bg-primary hover:opacity-90 disabled:opacity-60 text-on-primary font-semibold text-sm shadow-soft transition-all flex items-center justify-center gap-1.5"
          >
            <span>{isSubmitting ? 'Saving…' : 'Save & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
