import React, { useState } from 'react';
import { User as UserIcon, Phone, MapPin, Sparkles, X } from 'lucide-react';
import { UserProfile } from '../types';
import { ApiError, updateDirectoryProfile, updateProfile } from '../api/client';
import { PhotoTile } from './PhotoTile';
import { SectionFieldKey, YEAR_SECTIONS } from '../utils/sections';

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
  const [sections, setSections] = useState<Record<SectionFieldKey, string>>({
    sectionYear1: currentUser.sectionYear1 || '',
    sectionYear2: currentUser.sectionYear2 || '',
    sectionYear3: currentUser.sectionYear3 || '',
    sectionHs: currentUser.sectionHs || '',
  });
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
          sectionYear1: sections.sectionYear1 || null,
          sectionYear2: sections.sectionYear2 || null,
          sectionYear3: sections.sectionYear3 || null,
          sectionHs: sections.sectionHs || null,
          showInDirectory,
        }),
      ]);
      onSaved({
        ...user,
        currentCity: currentCity.trim() || null,
        currentRole: currentRole.trim() || null,
        sectionYear1: sections.sectionYear1 || null,
        sectionYear2: sections.sectionYear2 || null,
        sectionYear3: sections.sectionYear3 || null,
        sectionHs: sections.sectionHs || null,
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
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-surface-container-lowest rounded-xl p-6 shadow-soft space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-heading text-on-surface">Edit Profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant/60 hover:text-on-surface transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label font-semibold text-on-surface-variant mb-1">
              Full name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border-b-[1.5px] border-on-surface/30 bg-transparent text-on-surface text-body focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-label font-semibold text-on-surface-variant mb-1">
              Mobile / WhatsApp number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border-b-[1.5px] border-on-surface/30 bg-transparent text-on-surface text-body focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-label font-semibold text-on-surface-variant mb-2">
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
            <p className="text-label text-on-surface-variant mt-1.5">
              Photos upload and resize automatically as soon as you pick them. Your "Now" photo is
              also used as your profile avatar.
            </p>
          </div>

          <div className="pt-3 border-t border-dashed border-on-surface/15 space-y-3">
            <p className="text-label font-semibold text-on-surface-variant uppercase tracking-wide">
              Directory listing
            </p>

            <div>
              <label className="block text-label font-semibold text-on-surface-variant mb-1">City</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                  placeholder="e.g. Makati"
                  className="w-full pl-9 pr-3 py-2 border-b-[1.5px] border-on-surface/30 bg-transparent text-on-surface text-body focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-label font-semibold text-on-surface-variant mb-1">
                What are you currently up to?
              </label>
              <div className="relative">
                <Sparkles className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  placeholder="e.g. UX Director, married with 2 kids"
                  className="w-full pl-9 pr-3 py-2 border-b-[1.5px] border-on-surface/30 bg-transparent text-on-surface text-body focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-label font-semibold text-on-surface-variant mb-2">
                High school section <span className="text-on-surface-variant font-normal">(optional)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {YEAR_SECTIONS.map(({ key, label, options }) => (
                  <div key={key}>
                    <label className="block text-label font-semibold text-on-surface-variant mb-1">
                      {label}
                    </label>
                    <select
                      value={sections[key]}
                      onChange={(e) => setSections((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="w-full px-2.5 py-2 rounded-xl border border-outline-variant/40 text-on-surface text-body font-semibold focus:outline-none focus:ring-1 focus:ring-primary bg-white/50"
                    >
                      <option value="">Not set</option>
                      {options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showInDirectory}
                onChange={(e) => setShowInDirectory(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-body text-on-surface-variant">Show me in the Directory</span>
            </label>
          </div>

          {error && <p className="text-body text-error">{error}</p>}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-on-surface/20 text-on-surface-variant hover:bg-black/5 font-semibold text-body transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-primary hover:opacity-90 disabled:opacity-60 text-on-primary font-bold text-body shadow-soft transition-all"
            >
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
