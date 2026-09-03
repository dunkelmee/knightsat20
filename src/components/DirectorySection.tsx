import React, { useEffect, useRef, useState } from 'react';
import { Search, Users, Ban, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { DirectoryCounts, DirectoryPerson, DirectoryStatus } from '../types';
import { fetchDirectory } from '../api/client';
import { SectionFieldKey, YEAR_SECTIONS } from '../utils/sections';

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
  { key: 'missing', label: 'Tentative' },
  { key: 'faculty', label: 'Faculty' },
];

const EMPTY_SECTION_FILTERS: Record<SectionFieldKey, string> = {
  sectionYear1: '',
  sectionYear2: '',
  sectionYear3: '',
  sectionHs: '',
};

// Maps each section field to the query param the /api/directory endpoint expects.
const YEAR_PARAM: Record<SectionFieldKey, 'y1' | 'y2' | 'y3' | 'y4'> = {
  sectionYear1: 'y1',
  sectionYear2: 'y2',
  sectionYear3: 'y3',
  sectionHs: 'y4',
};

const PhotoTile: React.FC<{ url: string | null | undefined; label: string; then?: boolean; initials: string }> = ({
  url,
  label,
  then,
  initials,
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative flex-1 aspect-square rounded-md overflow-hidden border border-tertiary/20 bg-surface-container-high">
      {url ? (
        <>
          {!loaded && <div className="absolute inset-0 animate-pulse bg-surface-container-high" />}
          <img
            src={url}
            alt={label}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={then ? { filter: 'sepia(0.55) contrast(0.95) saturate(0.85)' } : undefined}
          />
        </>
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
};

const DirectoryCardSkeleton: React.FC = () => (
  <div className="bg-surface-container-lowest rounded p-2.5 border border-outline-variant/30 shadow-soft animate-pulse">
    <div className="flex gap-1.5">
      <div className="flex-1 aspect-square rounded-md bg-surface-container-high" />
      <div className="flex-1 aspect-square rounded-md bg-surface-container-high" />
    </div>
    <div className="h-3.5 w-2/3 rounded bg-surface-container-high mt-2.5" />
    <div className="h-2.5 w-1/2 rounded bg-surface-container-high mt-1.5" />
  </div>
);

const DirectoryCard: React.FC<{ person: DirectoryPerson }> = ({ person }) => {
  const initials = getInitials(person.displayName);
  const sectionTags = YEAR_SECTIONS.map(({ key, short }) => (person[key] ? `${short}: ${person[key]}` : null)).filter(
    (tag): tag is string => Boolean(tag)
  );
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
        <p className="flex items-center gap-1 text-[11px] italic text-outline mt-0.5 truncate">
          {person.lastSeenCity ? (
            <>
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{person.lastSeenCity}</span>
            </>
          ) : (
            <span>Last seen — unknown</span>
          )}
          {person.lastSeenCity && person.currentRole && <span className="flex-shrink-0">•</span>}
          {person.currentRole && <span className="truncate">{person.currentRole}</span>}
        </p>
      ) : (
        <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
          {[person.currentCity, person.currentRole].filter(Boolean).join(' • ') || ' '}
        </p>
      )}
      {sectionTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {sectionTags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded-full bg-tertiary-container/25 text-on-tertiary-container text-[9px] font-bold"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export const DirectorySection: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | DirectoryStatus>('all');
  const [sectionFilters, setSectionFilters] = useState<Record<SectionFieldKey, string>>(EMPTY_SECTION_FILTERS);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [people, setPeople] = useState<DirectoryPerson[]>([]);
  const [counts, setCounts] = useState<DirectoryCounts>({ all: 0, attending: 0, missing: 0, faculty: 0 });
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const requestId = useRef(0);

  const sectionParams = () => {
    const params: { y1?: string; y2?: string; y3?: string; y4?: string } = {};
    YEAR_SECTIONS.forEach(({ key }) => {
      const value = sectionFilters[key];
      if (value) params[YEAR_PARAM[key]] = value;
    });
    return params;
  };
  const activeSectionCount = Object.values(sectionFilters).filter(Boolean).length;

  useEffect(() => {
    const id = ++requestId.current;
    setIsLoading(true);
    const timeout = setTimeout(async () => {
      const result = await fetchDirectory({ q: query.trim() || undefined, filter, ...sectionParams() });
      if (id !== requestId.current) return;
      setPeople(result.people);
      setCounts(result.counts);
      setTotal(result.total);
      setNextCursor(result.nextCursor);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filter, sectionFilters]);

  const handleLoadMore = async () => {
    if (!nextCursor) return;
    setIsLoadingMore(true);
    const result = await fetchDirectory({
      q: query.trim() || undefined,
      filter,
      ...sectionParams(),
      cursor: nextCursor,
    });
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

      <button
        type="button"
        onClick={() => setIsFilterSheetOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-primary-container text-on-surface text-xs font-semibold hover:bg-primary-container/10 transition-colors"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
        Filter by section
        {activeSectionCount > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
            {activeSectionCount}
          </span>
        )}
      </button>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <DirectoryCardSkeleton key={i} />
          ))}
        </div>
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

      {isFilterSheetOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 flex items-end justify-center p-3"
          onClick={() => setIsFilterSheetOpen(false)}
        >
          <div
            className="w-full max-w-md max-h-[80vh] overflow-y-auto bg-surface-container-lowest rounded-t-2xl p-4 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-9 h-1 rounded-full bg-outline-variant mx-auto mb-3" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif font-semibold text-sm text-on-surface">Filter by section</h3>
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(false)}
                className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {YEAR_SECTIONS.map(({ key, label, options }) => (
                <div key={key}>
                  <p className="text-xs font-semibold text-on-surface-variant mb-1.5">{label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {options.map((opt) => {
                      const isActive = sectionFilters[key] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setSectionFilters((prev) => ({ ...prev, [key]: prev[key] === opt ? '' : opt }))
                          }
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                            isActive
                              ? 'bg-primary border-primary text-on-primary'
                              : 'border-secondary/30 text-on-surface-variant hover:border-primary hover:text-on-surface'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setSectionFilters(EMPTY_SECTION_FILTERS)}
                className="flex-1 py-2.5 rounded border border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-semibold text-xs transition-all"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(false)}
                className="flex-1 py-2.5 rounded bg-primary hover:opacity-90 text-on-primary font-semibold text-xs shadow-soft transition-all"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
