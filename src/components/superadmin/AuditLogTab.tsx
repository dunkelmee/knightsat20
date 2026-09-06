import React, { useEffect, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { AuditLogEntry } from '../../types';
import { fetchAuditLogs } from '../../api/client';

export const AuditLogTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setLogs(await fetchAuditLogs());
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return <div className="text-center py-10 text-body text-on-surface-variant">Loading activity…</div>;
  }

  return (
    <div className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 shadow-soft space-y-3">
      <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
        <ScrollText className="w-4 h-4 text-primary" />
        <h3 className="text-heading font-serif font-semibold text-on-surface">
          Activity Log ({logs.length})
        </h3>
      </div>

      {logs.length === 0 ? (
        <p className="text-body text-on-surface-variant text-center py-6">No actions recorded yet.</p>
      ) : (
        <div className="divide-y divide-outline-variant/20">
          {logs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
              <p className="text-body text-on-surface">{log.description}</p>
              <span className="flex-shrink-0 text-label text-outline whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString(undefined, {
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
