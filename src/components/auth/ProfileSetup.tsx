import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { UserProfile } from '../../types';
import { ApiError, updateDirectoryProfile, updateProfile } from '../../api/client';
import { PhotoTile } from '../PhotoTile';
import { SectionFieldKey, YEAR_SECTIONS } from '../../utils/sections';
import { AuthShell, FIELD_CLASS, SELECT_CLASS, BTN_CLASS, KICK_LABEL_CLASS } from './AuthShell';

interface ProfileSetupProps {
  currentUser: UserProfile;
  onSaved: (user: UserProfile, hasSubmittedSurvey: boolean) => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ currentUser, onSaved }) => {
  const [step, setStep] = useState<'form' | 'done'>('form');
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

  // Stashed until "Enter the hub" is clicked on the confirmation screen —
  // saving completes here, but the parent only switches into the main app
  // once the user acknowledges the welcome screen below.
  const [savedResult, setSavedResult] = useState<{ user: UserProfile; hasSubmittedSurvey: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobileNumber.trim()) {
      setError('Please fill in your full name and mobile/WhatsApp number.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const [{ user, hasSubmittedSurvey }] = await Promise.all([
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
      const mergedUser: UserProfile = {
        ...user,
        currentCity: currentCity.trim() || null,
        currentRole: currentRole.trim() || null,
        sectionYear1: sections.sectionYear1 || null,
        sectionYear2: sections.sectionYear2 || null,
        sectionYear3: sections.sectionYear3 || null,
        sectionHs: sections.sectionHs || null,
        showInDirectory,
      };
      setSavedResult({ user: mergedUser, hasSubmittedSurvey });
      setStep('done');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnterHub = () => {
    if (savedResult) onSaved(savedResult.user, savedResult.hasSubmittedSurvey);
  };

  if (step === 'done') {
    // First name only, from the name just saved (falling back to whatever is
    // still in the form) — same idiom as the avatar greeting in TabHero.
    const firstName = (savedResult?.user.fullName || fullName).trim().split(/\s+/)[0] || '';
    return (
      <AuthShell
        kicker="All set up"
        title="Ayan, you&rsquo;re in."
        sub="Your profile was saved successfully! Next stop: submit the RSVP."
      >
        <div className="flex flex-col items-center gap-[15px] text-center py-1">
          <span className="w-14 h-14 rounded-2xl grid place-items-center bg-[rgba(31,122,77,.14)] border border-[rgba(31,122,77,.34)]">
            <Check className="w-6 h-6 text-[#166b41]" />
          </span>
          <span className="font-serif text-title leading-[1.1] text-on-background">Welcome, {firstName}!</span>
          <p className="max-w-[32ch] text-body leading-[1.6] text-on-background/64">
            Answer the survey and stay updated with announcements from the org committee. You can also
            upload old photos which we can show on reunion day.
          </p>
          <div className="w-full pt-[13px] border-t border-dashed border-[rgba(20,33,29,.22)]">
            <button type="button" onClick={handleEnterHub} className={BTN_CLASS}>
              Submit RSVP
            </button>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      kicker="Your profile"
      title="Complete your profile"
      sub="Confirm your details and add a &ldquo;Then &amp; Now&rdquo; photo for the batch."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-[17px]">
        <label className="flex flex-col gap-2">
          <span className={KICK_LABEL_CLASS}>Full name</span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Juan dela Cruz (IV-Curie)"
            className={FIELD_CLASS}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={KICK_LABEL_CLASS}>Mobile / WhatsApp number</span>
          <input
            type="tel"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="e.g. 09171234567"
            className={FIELD_CLASS}
          />
        </label>

        <div className="flex flex-col gap-2.5">
          <span className={KICK_LABEL_CLASS}>
            Then &amp; now photos <span className="normal-case tracking-normal text-on-surface-variant/70">optional</span>
          </span>
          {/* Grid, not flex: PhotoTile has no width of its own, so as flex
              items the two tiles size to their own text content ("Upload a
              high school photo" being wider than "Upload a recent photo")
              and, being aspect-square, end up different heights. Equal grid
              columns keep them identical — same approach as
              ProfileEditModal. */}
          <div className="grid grid-cols-2 gap-2.5">
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
          <p className="text-label leading-[1.5] text-on-surface-variant">
            Photos upload and resize automatically as soon as you pick them. Your &ldquo;Now&rdquo; photo is
            also used as your profile avatar.
          </p>
        </div>

        <div className="flex flex-col gap-[15px] pt-4 border-t border-dashed border-[rgba(20,33,29,.22)]">
          <span className="font-mono text-label font-medium tracking-[0.2em] uppercase text-primary">
            Directory listing
          </span>

          <label className="flex flex-col gap-2">
            <span className={KICK_LABEL_CLASS}>City</span>
            <input
              type="text"
              value={currentCity}
              onChange={(e) => setCurrentCity(e.target.value)}
              placeholder="e.g. Makati"
              className={FIELD_CLASS}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className={KICK_LABEL_CLASS}>What are you currently up to?</span>
            <input
              type="text"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              placeholder="e.g. UX Director, married with 2 kids"
              className={FIELD_CLASS}
            />
          </label>

          <div className="flex flex-col gap-2.5">
            <span className={KICK_LABEL_CLASS}>
              High school section
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {YEAR_SECTIONS.map(({ key, label, options }) => (
                <label key={key} className="flex flex-col gap-1">
                  <span className="font-mono text-label font-medium tracking-[0.14em] uppercase text-on-surface-variant">
                    {label}
                  </span>
                  <select
                    value={sections[key]}
                    onChange={(e) => setSections((prev) => ({ ...prev, [key]: e.target.value }))}
                    className={SELECT_CLASS}
                  >
                    <option value="">Not set</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowInDirectory((v) => !v)}
            className="flex items-center gap-2.5 text-left px-3.5 py-3 rounded-2xl text-body font-semibold transition-colors"
            style={{
              background: showInDirectory ? 'rgba(14,90,77,.09)' : 'rgba(20,33,29,.05)',
              border: `1.5px solid ${showInDirectory ? 'rgba(14,90,77,.4)' : 'rgba(20,33,29,.16)'}`,
              color: showInDirectory ? '#0e5a4d' : '#4a544f',
            }}
          >
            <span
              className="w-[18px] h-[18px] flex-shrink-0 rounded-[5px] grid place-items-center"
              style={{
                border: `1.5px solid ${showInDirectory ? '#0e5a4d' : 'rgba(20,33,29,.32)'}`,
                background: showInDirectory ? '#0e5a4d' : 'transparent',
              }}
            >
              {showInDirectory && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </span>
            Show me in the Directory
          </button>
        </div>

        {error && <p className="text-body text-error">{error}</p>}

        <button type="submit" disabled={isSubmitting} className={BTN_CLASS}>
          {isSubmitting ? 'Saving…' : 'Save & Continue'}
        </button>
      </form>
    </AuthShell>
  );
};
