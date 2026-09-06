import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldOff, Trash2, Users } from 'lucide-react';
import { AdminUserSummary } from '../../types';
import { ApiError, deleteSuperadminUser, fetchSuperadminUsers, updateUserOrganizerStatus } from '../../api/client';
import { DeleteUserModal } from './DeleteUserModal';

export const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userPendingDelete, setUserPendingDelete] = useState<AdminUserSummary | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const load = async () => setUsers(await fetchSuperadminUsers());

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    })();
  }, []);

  const handleToggle = async (user: AdminUserSummary) => {
    const updated = await updateUserOrganizerStatus(user.id, !user.isOrganizer);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const openDeleteModal = (user: AdminUserSummary) => {
    setDeleteError('');
    setUserPendingDelete(user);
  };

  const handleConfirmDelete = async (password: string) => {
    if (!userPendingDelete) return;
    setDeleteError('');
    setDeletingId(userPendingDelete.id);
    try {
      await deleteSuperadminUser(userPendingDelete.id, password);
      setUsers((prev) => prev.filter((u) => u.id !== userPendingDelete.id));
      setUserPendingDelete(null);
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10 text-body text-on-surface-variant">Loading users…</div>;
  }

  return (
    <div className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 shadow-soft space-y-3">
      <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="text-heading font-serif font-semibold text-on-surface">
          All Users ({users.length})
        </h3>
      </div>

      {users.length === 0 ? (
        <p className="text-body text-on-surface-variant text-center py-6">No registered users yet.</p>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="p-3 rounded bg-surface-container-low/70 border border-outline-variant/30 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-semibold text-heading text-on-surface truncate">{user.fullName}</span>
                  {user.isOrganizer && (
                    <span className="flex-shrink-0 text-label font-bold px-1.5 py-0.5 rounded-full bg-primary-container/15 text-primary">
                      ORGANIZER
                    </span>
                  )}
                  {!user.onboardingCompleted && (
                    <span className="flex-shrink-0 text-label font-semibold px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                      Setup pending
                    </span>
                  )}
                </div>
                <div className="text-label text-on-surface-variant mt-0.5 truncate">{user.email}</div>
                <div className="text-label text-outline mt-0.5">
                  Registered {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>

              <div className="flex-shrink-0 flex flex-col items-stretch gap-1.5">
                <button
                  type="button"
                  onClick={() => handleToggle(user)}
                  title={user.isOrganizer ? 'Revoke organizer access' : 'Grant organizer access'}
                  className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-body font-semibold transition-colors ${
                    user.isOrganizer
                      ? 'bg-error-container text-on-error-container hover:opacity-80'
                      : 'bg-primary text-on-primary hover:opacity-90'
                  }`}
                >
                  {user.isOrganizer ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>{user.isOrganizer ? 'Revoke' : 'Grant'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => openDeleteModal(user)}
                  disabled={deletingId === user.id}
                  title="Delete user and all their data"
                  className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-body font-semibold border border-error text-error hover:bg-error-container/40 disabled:opacity-60 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{deletingId === user.id ? 'Deleting…' : 'Delete'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {userPendingDelete && (
        <DeleteUserModal
          user={userPendingDelete}
          isDeleting={deletingId === userPendingDelete.id}
          error={deleteError}
          onCancel={() => setUserPendingDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};
