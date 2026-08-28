import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { AdminUserSummary } from '../../types';

interface DeleteUserModalProps {
  user: AdminUserSummary;
  isDeleting: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: (password: string) => void;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  user,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    onConfirm(password);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-inverse-surface/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={isDeleting ? undefined : onCancel}
    >
      <div
        className="w-full max-w-sm bg-surface-container-lowest rounded p-6 border border-outline-variant/30 shadow-soft space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-error-container flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-on-error-container" />
          </div>
          <div className="min-w-0">
            <h2 className="font-serif font-semibold text-base text-on-surface">
              Delete {user.fullName}?
            </h2>
            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              This permanently removes their account, survey response, RSVP, and every photo they
              uploaded, plus any albums they created — including other people's photos in those
              albums. This can't be undone.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Confirm your superadmin password
            </label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Superadmin password"
              className="w-full px-3.5 py-2.5 rounded border border-secondary/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-error bg-background"
            />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded border border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-semibold text-sm disabled:opacity-60 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeleting || !password}
              className="flex-1 py-2.5 rounded bg-error hover:opacity-90 disabled:opacity-60 text-on-error font-semibold text-sm shadow-soft transition-all"
            >
              {isDeleting ? 'Deleting…' : 'Delete permanently'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
