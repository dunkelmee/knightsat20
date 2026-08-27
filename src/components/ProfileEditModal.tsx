import React, { useState } from 'react';
import { User as UserIcon, Phone, MapPin, Briefcase, GraduationCap, X } from 'lucide-react';
import { UserProfile } from '../types';
import { ApiError, updateDirectoryProfile, updateProfile } from '../api/client';

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
  const [currentCity, setCurrentCity] = useState(currentUser.currentCity || '');
  const [currentRole, setCurrentRole] = useState(currentUser.currentRole || '');
  const [sectionHs, setSectionHs] = useState(currentUser.sectionHs || '');
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
      // then/now photos aren't editable here — pass the existing values
      // through unchanged, since the backend overwrites both on every save.
      const [{ user }] = await Promise.all([
        updateProfile({
          fullName: fullName.trim(),
          mobileNumber: mobileNumber.trim(),
          thenPhotoUrl: currentUser.thenPhotoUrl ?? null,
          nowPhotoUrl: currentUser.nowPhotoUrl ?? null,
        }),
        updateDirectoryProfile({
          currentCity: currentCity.trim() || null,
          currentRole: currentRole.trim() || null,
          sectionHs: sectionHs.trim() || null,
          showInDirectory,
        }),
      ]);
      onSaved({
        ...user,
        currentCity: currentCity.trim() || null,
        currentRole: currentRole.trim() || null,
        sectionHs: sectionHs.trim() || null,
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
        className="w-full max-w-sm bg-surface-container-lowest rounded p-6 border border-outline-variant/30 shadow-soft space-y-4"
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

          <div className="pt-1 border-t border-outline-variant/30 space-y-3">
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">
              Directory listing
            </p>

            <div className="grid grid-cols-2 gap-3">
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
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Role</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    placeholder="e.g. UX Director"
                    className="w-full pl-9 pr-3 py-2.5 rounded border border-secondary/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                HS Section <span className="font-normal">(optional)</span>
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={sectionHs}
                  onChange={(e) => setSectionHs(e.target.value)}
                  placeholder="e.g. IV-Curie"
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
