import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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

  // Portalled for the same reason as UserDetailModal: its caller renders it
  // from inside a card that carries backdrop-filter, which would otherwise
  // become the containing block for this `fixed` scrim.
  return createPortal(
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
            <h2 className="font-serif text-heading text-on-surface">
              Delete {user.fullName}?
            </h2>
            <p className="text-body text-on-surface-variant mt-1.5 leading-relaxed">
              This permanently removes their account, survey response, RSVP, and every photo they
              uploaded, plus any albums they created — including other people's photos in those
              albums. This can't be undone.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-label font-semibold text-on-surface-variant mb-1">
              Confirm your superadmin password
            </label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Superadmin password"
              className="w-full px-3.5 py-2.5 rounded border border-secondary/30 text-on-surface text-body focus:outline-none focus:ring-1 focus:ring-error bg-background"
            />
          </div>

          {error && <p className="text-body text-error">{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeleting || !password}
              className="btn btn-danger flex-1"
            >
              {isDeleting ? 'Deleting…' : 'Delete permanently'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
