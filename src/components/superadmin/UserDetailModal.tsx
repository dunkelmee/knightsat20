import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ImageOff } from 'lucide-react';
import { AdminUserSummary, UserProfile } from '../../types';
import { ApiError, fetchSuperadminUser } from '../../api/client';
import { YEAR_SECTIONS } from '../../utils/sections';

interface UserDetailModalProps {
  user: AdminUserSummary;
  onClose: () => void;
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col gap-0.5 min-w-0">
    <span className="eyebrow text-on-surface-variant">{label}</span>
    <span className="text-body text-on-surface break-words">{children}</span>
  </div>
);

const Photo: React.FC<{ label: string; url?: string | null }> = ({ label, url }) => (
  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
    <span className="eyebrow text-on-surface-variant">{label}</span>
    <div className="h-28 sm:h-40 rounded overflow-hidden bg-surface-container border border-outline-variant/30 grid place-items-center">
      {url ? (
        <img src={url} alt={label} className="w-full h-full object-cover" />
      ) : (
        <ImageOff className="w-5 h-5 text-outline" />
      )}
    </div>
  </div>
);

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
  // The users list stays lean because it renders every account at once, so the
  // rest of the profile is fetched when the row is actually opened.
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchSuperadminUser(user.id);
        if (!cancelled) setProfile(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Could not load this profile.');
        }
      }
    })();
    // A superadmin clicking down a list can outpace the requests; without this
    // a slow earlier fetch would land after a later one and show the wrong
    // person.
    return () => { cancelled = true; };
  }, [user.id]);

  // The page behind a modal should not scroll under it.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  const sections = profile
    ? YEAR_SECTIONS.map((y) => ({ label: y.label, value: profile[y.key] })).filter((s) => s.value)
    : [];

  const badge = 'eyebrow px-2.5 py-0.5 rounded-full';

  // Rendered through a portal, NOT inline. UsersTab renders this from inside
  // its card, and in the back office that card carries backdrop-filter (see
  // the frosted-glass rule in index.css). An ancestor with backdrop-filter —
  // like transform and filter — becomes the containing block for its
  // `position: fixed` descendants, so inline this scrim's `inset-0` sized
  // itself to the card rather than the viewport and the dialog was clipped to
  // a sliver inside it. document.body has no such ancestor, so `fixed` means
  // the viewport again.
  return createPortal(
    // Shell, spacing, header and footer all mirror ResponseDetailModal — the
    // organizer view's own read-only inspector — so the two read as the same
    // kind of dialog rather than two takes on one.
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-lg max-w-lg w-full p-6 sm:p-8 shadow-soft border border-outline-variant/30 space-y-6 my-8 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-outline-variant/30">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif text-heading text-on-surface">{user.fullName}</h2>
              {user.isOrganizer && (
                <span className={`${badge} bg-primary-container/20 text-on-primary-container`}>Organizer</span>
              )}
              {!user.onboardingCompleted && (
                <span className={`${badge} bg-secondary-container text-on-secondary-container`}>Setup pending</span>
              )}
              {profile && !profile.showInDirectory && (
                <span className={`${badge} bg-surface-container text-on-surface-variant`}>Hidden from directory</span>
              )}
            </div>
            <p className="text-body text-on-surface-variant mt-0.5 truncate">{user.email}</p>
          </div>

          <button type="button" onClick={onClose} className="btn-icon btn-icon-ghost" title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="space-y-5 text-body">
          {error ? (
            <p className="p-3 bg-error-container text-on-error-container rounded border border-error-container">
              {error}
            </p>
          ) : !profile ? (
            <p className="text-on-surface-variant py-6 text-center">Loading profile…</p>
          ) : (
            <>
              <div className="flex gap-3">
                <Photo label="Then" url={profile.thenPhotoUrl} />
                <Photo label="Now" url={profile.nowPhotoUrl} />
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <Field label="Mobile number">{profile.mobileNumber || '—'}</Field>
                <Field label="Registered">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </Field>
                <Field label="Current city">{profile.currentCity || '—'}</Field>
                <Field label="Current role">{profile.currentRole || '—'}</Field>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="eyebrow text-on-surface-variant">Sections</span>
                {sections.length === 0 ? (
                  <span className="text-on-surface-variant">No sections recorded.</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {sections.map((s) => (
                      <span
                        key={s.label}
                        className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-semibold"
                      >
                        {s.label}: {s.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-outline-variant/30">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>

      </div>
    </div>,
    document.body,
  );
};
