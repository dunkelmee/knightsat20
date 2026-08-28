import React, { useState } from 'react';
import { User as UserIcon, Phone, MapPin, Sparkles, X } from 'lucide-react';
import { UserProfile } from '../types';
import { ApiError, updateDirectoryProfile, updateProfile } from '../api/client';
import { PhotoTile } from './PhotoTile';

interface ProfileEditModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  onClose: () => void;
  onSaved: (user: UserProfile) => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onSaved,
}) => {
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [mobileNumber, setMobileNumber] = useState(currentUser.mobileNumber);
  const [thenPhotoUrl, setThenPhotoUrl] = useState<string | null>(currentUser.thenPhotoUrl || null);
  const [nowPhotoUrl, setNowPhotoUrl] = useState<string | null>(currentUser.nowPhotoUrl || null);
  const [currentCity, setCurrentCity] = useState(currentUser.currentCity || '');
  const [currentRole, setCurrentRole] = useState(currentUser.currentRole || '');
  const [showInDirectory, setShowInDirectory] = useState(currentUser.showInDirectory);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobileNumber.trim()) {
      setError('Please fill in your full name and mobile/WhatsApp number.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const [{ user }] = await Promise.all([
        updateProfile({
          fullName: fullName.trim(),
          mobileNumber: mobileNumber.trim(),
        }),
        updateDirectoryProfile({
          currentCity: currentCity.trim() || null,
          currentRole: currentRole.trim() || null,
          sectionHs: null,
          showInDirectory,
        }),
      ]);
      onSaved({
        ...user,
        currentCity: currentCity.trim() || null,
        currentRole: currentRole.trim() || null,
        sectionHs: null,
        showInDirectory,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="profile-edit-modal-overlay"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-surface-container-lowest rounded p-6 border border-outline-variant/30 shadow-soft space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-semibold text-base text-on-surface">Edit Profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                slot="then"
                label="Then (Batch 2007)"
                hint="Upload a high school photo"
                photoUrl={thenPhotoUrl}
                applyThenFilter
                onPhotoChanged={setThenPhotoUrl}
              />
              <PhotoTile
                slot="now"
                label="Now (Today)"
                hint="Upload a recent photo"
                photoUrl={nowPhotoUrl}
                onPhotoChanged={setNowPhotoUrl}
              />
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1.5">
              Photos upload and resize automatically as soon as you pick them. Your "Now" photo is
              also used as your profile avatar.
            </p>
          </div>

          <div className="pt-1 border-t border-outline-variant/30 space-y-3">
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">
              Directory listing
            </p>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">City</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                  placeholder="e.g. Makati"
                  className="w-full pl-9 pr-3 py-2.5 rounded border border-secondary/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                What are you currently up to?
              </label>
              <div className="relative">
                <Sparkles className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  placeholder="e.g. UX Director, married with 2 kids"
                  className="w-full pl-9 pr-3 py-2.5 rounded border border-secondary/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showInDirectory}
                onChange={(e) => setShowInDirectory(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-xs text-on-surface-variant">Show me in the Directory</span>
            </label>
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded border border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-semibold text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded bg-primary hover:opacity-90 disabled:opacity-60 text-on-primary font-semibold text-sm shadow-soft transition-all"
            >
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
