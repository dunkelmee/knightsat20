import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldOff, Users } from 'lucide-react';
import { AdminUserSummary } from '../../types';
import { fetchSuperadminUsers, updateUserOrganizerStatus } from '../../api/client';

export const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return <div className="text-center py-10 text-xs text-on-surface-variant">Loading users…</div>;
  }

  return (
    <div className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 shadow-soft space-y-3">
      <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="text-sm sm:text-base font-serif font-semibold text-on-surface">
          All Users ({users.length})
        </h3>
      </div>

      {users.length === 0 ? (
        <p className="text-xs text-on-surface-variant text-center py-6">No registered users yet.</p>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="p-3 rounded bg-surface-container-low/70 border border-outline-variant/30 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-semibold text-xs text-on-surface truncate">{user.fullName}</span>
                  {user.isOrganizer && (
                    <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary-container/15 text-primary">
                      ORGANIZER
                    </span>
                  )}
                  {!user.onboardingCompleted && (
                    <span className="flex-shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                      Setup pending
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-on-surface-variant mt-0.5 truncate">{user.email}</div>
                <div className="text-[10px] text-outline mt-0.5">
                  Registered {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggle(user)}
                title={user.isOrganizer ? 'Revoke organizer access' : 'Grant organizer access'}
                className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold transition-colors ${
                  user.isOrganizer
                    ? 'bg-error-container text-on-error-container hover:opacity-80'
                    : 'bg-primary text-on-primary hover:opacity-90'
                }`}
              >
                {user.isOrganizer ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>{user.isOrganizer ? 'Revoke' : 'Grant'}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
