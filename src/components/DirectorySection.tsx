import React, { useEffect, useRef, useState } from 'react';
import { Search, Users, Ban } from 'lucide-react';
import { DirectoryCounts, DirectoryPerson, DirectoryStatus } from '../types';
import { fetchDirectory } from '../api/client';

const getInitials = (fullName: string): string =>
  fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const FILTERS: { key: 'all' | DirectoryStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'attending', label: 'Attending' },
  { key: 'missing', label: 'Missing' },
  { key: 'faculty', label: 'Faculty' },
];

const PhotoTile: React.FC<{ url: string | null | undefined; label: string; then?: boolean; initials: string }> = ({
  url,
  label,
  then,
  initials,
}) => (
  <div className="relative flex-1 aspect-square rounded-md overflow-hidden border border-tertiary/20 bg-surface-container-high">
    {url ? (
      <img
        src={url}
        alt={label}
        className="w-full h-full object-cover"
        style={then ? { filter: 'sepia(0.55) contrast(0.95) saturate(0.85)' } : undefined}
      />
    ) : then ? (
      <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-sm font-serif font-semibold">
        {initials}
      </div>
    ) : (
      <div className="w-full h-full flex items-center justify-center text-outline">
        <Ban className="w-5 h-5" />
      </div>
    )}
    <span className="absolute left-1.5 bottom-1.5 px-1.5 py-0.5 rounded bg-inverse-surface/70 text-inverse-on-surface text-[8px] font-bold tracking-widest uppercase">
      {label}
    </span>
  </div>
);

const DirectoryCard: React.FC<{ person: DirectoryPerson }> = ({ person }) => {
  const initials = getInitials(person.displayName);
  return (
    <div className="bg-surface-container-lowest rounded p-2.5 border border-outline-variant/30 shadow-soft">
      <div className="relative flex gap-1.5">
        <span
          className={`absolute top-1.5 right-1.5 z-10 w-2.5 h-2.5 rounded-full border-2 border-surface-container-lowest ${
            person.status === 'attending' ? 'bg-success' : person.status === 'faculty' ? 'bg-tertiary' : 'bg-error'
          }`}
        />
        <PhotoTile url={person.thenPhotoUrl} label="Then" then initials={initials} />
        <PhotoTile url={person.nowPhotoUrl} label="Now" initials={initials} />
      </div>

      <h4 className="font-serif font-semibold text-sm text-on-surface mt-2.5">{person.displayName}</h4>
      {person.status === 'missing' && !person.nowPhotoUrl ? (
        <p className="text-[11px] italic text-outline mt-0.5">
          {person.lastSeenCity ? `Last seen in ${person.lastSeenCity}` : 'Last seen — unknown'}
        </p>
      ) : (
        <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
          {[person.currentCity, person.currentRole].filter(Boolean).join(' · ') || ' '}
        </p>
      )}
    </div>
  );
};

export const DirectorySection: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | DirectoryStatus>('all');
  const [people, setPeople] = useState<DirectoryPerson[]>([]);
  const [counts, setCounts] = useState<DirectoryCounts>({ all: 0, attending: 0, missing: 0, faculty: 0 });
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;
    setIsLoading(true);
    const timeout = setTimeout(async () => {
      const result = await fetchDirectory({ q: query.trim() || undefined, filter });
      if (id !== requestId.current) return;
      setPeople(result.people);
      setCounts(result.counts);
      setTotal(result.total);
      setNextCursor(result.nextCursor);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, filter]);

  const handleLoadMore = async () => {
    if (!nextCursor) return;
    setIsLoadingMore(true);
    const result = await fetchDirectory({ q: query.trim() || undefined, filter, cursor: nextCursor });
    setPeople((prev) => [...prev, ...result.people]);
    setNextCursor(result.nextCursor);
    setIsLoadingMore(false);
  };

  return (
    <div id="directory-container" className="max-w-5xl mx-auto py-5 px-4 space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-serif font-semibold text-on-surface">The Batch of 2007</h2>
        <p className="text-xs text-on-surface-variant mt-1">
          Reconnect with {total} batchmate{total === 1 ? '' : 's'}. Search by name, section, or city.
        </p>
      </div>

      <div className="relative">
        <Search className="w-3.5 h-3.5 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a batchmate…"
          className="w-full pl-9 pr-4 py-2.5 rounded-full bg-surface-container-high text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === key
                ? 'bg-primary text-on-primary shadow-soft'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {label} ({counts[key === 'all' ? 'all' : key]})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-xs text-on-surface-variant">Loading batchmates…</div>
      ) : people.length === 0 ? (
        <div className="text-center py-10 px-4 space-y-2.5">
          <div className="w-10 h-10 rounded-full bg-primary-container/20 text-on-primary-container flex items-center justify-center mx-auto border border-primary-container/50">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-on-surface">
            {query ? `No batchmates match "${query}"` : 'No batchmates found'}
          </h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            {query ? 'Try a section or city instead.' : 'Try a different filter.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {people.map((person) => (
              <DirectoryCard key={person.id} person={person} />
            ))}
          </div>

          {nextCursor && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="block w-full sm:max-w-xs sm:mx-auto py-2.5 rounded-full border border-outline-variant/40 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-60 transition-colors"
            >
              {isLoadingMore ? 'Loading…' : 'Load more batchmates'}
            </button>
          )}
        </>
      )}
    </div>
  );
};
