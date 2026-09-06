import React, { useEffect, useRef, useState } from 'react';
import { Search, Users, MapPin, SlidersHorizontal, X } from 'lucide-react';
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
    <div className="relative flex-1 aspect-square overflow-hidden bg-surface-container-high">
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
      ) : (
        // No upload yet — the card keeps its shape with the person's initials
        // on the era's colour: aged tan for Then, rich green for Now.
        <div
          className="w-full h-full flex items-center justify-center font-serif text-title text-white/90"
          style={{
            background: then
              ? 'linear-gradient(150deg,#cbb896,#9a8a70)'
              : 'linear-gradient(150deg,#4a7a6c,#22443b)',
          }}
        >
          {initials}
        </div>
      )}
    </div>
  );
};

const DirectoryCardSkeleton: React.FC = () => (
  <div className="bg-surface-container-lowest rounded p-3 shadow-soft animate-pulse">
    <div className="flex gap-2">
      <div className="flex-1 aspect-square rounded bg-surface-container-high" />
      <div className="flex-1 aspect-square rounded bg-surface-container-high" />
    </div>
    <div className="h-3.5 w-2/3 rounded bg-surface-container-high mt-2.5" />
    <div className="h-2.5 w-1/2 rounded bg-surface-container-high mt-1.5" />
  </div>
);

const STATUS_DOT: Record<DirectoryStatus, string> = {
  attending: '#1f7a4d',
  faculty: '#6b5a9e',
  missing: '#b0564f',
};

const DirectoryCard: React.FC<{ person: DirectoryPerson }> = ({ person }) => {
  const initials = getInitials(person.displayName);
  // 1st → 4th year section names only, in order; unset years are skipped so
  // no empty gap appears between separators.
  const sectionTags = YEAR_SECTIONS.map(({ key }) => person[key]).filter(
    (section): section is string => Boolean(section)
  );
  return (
    <div className="relative p-3 bg-surface-container-lowest shadow-soft flex flex-col gap-2.5">
      <span
        className="absolute top-2 right-2 z-10 w-2.5 h-2.5 rounded-full"
        style={{ background: STATUS_DOT[person.status], boxShadow: '0 0 0 2px #fdfaf2' }}
      />
      <div className="flex gap-2">
        <div className="flex-1 flex flex-col gap-1.5">
          <span className="font-mono text-label tracking-[0.16em] uppercase text-on-surface-variant/60">Then</span>
          <PhotoTile url={person.thenPhotoUrl} label="Then" then initials={initials} />
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <span className="font-mono text-label tracking-[0.16em] uppercase text-on-surface-variant/60">Now</span>
          <PhotoTile url={person.nowPhotoUrl} label="Now" initials={initials} />
        </div>
      </div>

      <div className="flex flex-col gap-1 pt-2 border-t border-dashed border-on-surface/15">
        <h4 className="font-serif font-medium text-heading leading-tight text-on-surface">{person.displayName}</h4>
        {/* One city/role line for every card, pinned whenever a city is set.
            A blank city is simply left out — no stand-in copy, which would
            read as a judgement on the batchmate rather than on the data. */}
        <p className="flex items-center gap-1 text-body text-on-surface-variant/70 truncate">
          {person.currentCity && (
            <>
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{person.currentCity}</span>
            </>
          )}
          {person.currentCity && person.currentRole && <span className="flex-shrink-0">•</span>}
          {person.currentRole && <span className="truncate">{person.currentRole}</span>}
          {/* Keeps the row's height when there is nothing at all to show, so
              cards in a grid stay aligned. */}
          {!person.currentCity && !person.currentRole && <span>&nbsp;</span>}
        </p>
        {sectionTags.length > 0 && (
          <span className="font-mono text-label tracking-[0.1em] uppercase text-on-surface-variant/60 truncate">
            {sectionTags.join(' · ')}
          </span>
        )}
      </div>
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

  const filterButtonClass = `flex items-center justify-center gap-2 py-2.5 rounded-full text-label font-semibold transition-colors ${
    activeSectionCount > 0
      ? 'bg-primary/10 border border-primary/45 text-primary'
      : 'bg-white/55 border border-white/85 text-on-surface'
  }`;
  const filterButtonContent = (
    <>
      <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
      Filter by section
      {activeSectionCount > 0 && (
        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-on-primary font-mono text-label font-bold flex items-center justify-center">
          {activeSectionCount}
        </span>
      )}
    </>
  );

  return (
    <div id="directory-container" className="max-w-5xl @min-[700px]/app:max-w-[1180px] mx-auto py-6 px-4 @min-[700px]/app:px-8 space-y-4">
      <div className="relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-white/55 backdrop-blur-md border border-white/85 shadow-soft">
        <Search className="w-3.5 h-3.5 text-on-surface-variant/60 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a batchmate…"
          className="w-full bg-transparent text-body font-serif italic text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
        />
      </div>

      {/* Status chips take the full row on mobile; on desktop they share the
          row with the section-filter button (60/40 split) */}
      <div className="flex flex-nowrap items-stretch gap-1.5">
        <div className="flex-1 @min-[700px]/app:flex-none @min-[700px]/app:w-[60%] min-w-0 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`flex-1 min-w-0 justify-center flex items-center gap-1.5 px-2 @min-[700px]/app:px-3 py-1.5 rounded-full text-label font-semibold whitespace-nowrap transition-all ${
                filter === key
                  ? 'bg-on-surface text-background'
                  : 'bg-white/50 text-on-surface-variant border border-white/80'
              }`}
            >
              {label} <span className="font-mono opacity-60">{counts[key === 'all' ? 'all' : key]}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIsFilterSheetOpen(true)}
          className={`hidden @min-[700px]/app:flex @min-[700px]/app:flex-[0_0_40%] min-w-0 ${filterButtonClass}`}
        >
          {filterButtonContent}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setIsFilterSheetOpen(true)}
        className={`flex @min-[700px]/app:hidden w-full ${filterButtonClass}`}
      >
        {filterButtonContent}
      </button>

      {isLoading ? (
        <div className="grid grid-cols-1 @min-[640px]/app:grid-cols-2 @min-[700px]/app:grid-cols-[repeat(auto-fit,minmax(208px,1fr))] gap-3.5 @min-[700px]/app:gap-[18px]">
          {Array.from({ length: 9 }).map((_, i) => (
            <DirectoryCardSkeleton key={i} />
          ))}
        </div>
      ) : people.length === 0 ? (
        <div className="text-center py-11 px-5 rounded border-[1.5px] border-dashed border-on-surface/25 bg-white/40 space-y-2.5">
          <Users className="w-6 h-6 mx-auto text-on-surface-variant/60" />
          <h3 className="font-serif text-title text-on-surface">Walang card sa box.</h3>
          <p className="text-body text-on-surface-variant max-w-[40ch] mx-auto">
            {query
              ? 'Try another section or city — or invite your barkada to complete their profiles.'
              : 'Try a different filter.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 @min-[640px]/app:grid-cols-2 @min-[700px]/app:grid-cols-[repeat(auto-fit,minmax(208px,1fr))] gap-3.5 @min-[700px]/app:gap-[18px]">
            {people.map((person) => (
              <DirectoryCard key={person.id} person={person} />
            ))}
          </div>

          {nextCursor && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="mx-auto block px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-white/90 text-body font-semibold text-primary shadow-soft disabled:opacity-60 transition-colors"
            >
              {isLoadingMore ? 'Loading…' : 'Pull more cards'}
            </button>
          )}
        </>
      )}

      {isFilterSheetOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-end justify-center p-3"
          onClick={() => setIsFilterSheetOpen(false)}
        >
          <div
            className="w-full max-w-md max-h-[80vh] overflow-y-auto bg-surface-container-lowest rounded-t-2xl rounded-b-md p-4.5 shadow-soft space-y-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-label tracking-[0.2em] uppercase" style={{ color: '#b0564f' }}>
                Filter by section
              </span>
              <span className="flex-1 h-px" style={{ background: 'rgba(176,86,79,.3)' }} />
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(false)}
                className="text-on-surface-variant/60 hover:text-on-surface"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {YEAR_SECTIONS.map(({ key, label, options }) => (
                <div key={key} className="space-y-1.5">
                  <p className="font-mono text-label tracking-[0.16em] uppercase text-on-surface-variant/60">{label}</p>
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
                          className={`px-3 py-1.5 rounded-full text-label font-semibold transition-colors ${
                            isActive
                              ? 'bg-primary/10 border border-primary/50 text-primary'
                              : 'bg-black/[0.025] border border-outline-variant/40 text-on-surface-variant'
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

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setSectionFilters(EMPTY_SECTION_FILTERS)}
                className="flex-1 py-3 rounded-xl border border-on-surface/20 text-on-surface-variant hover:bg-black/5 font-semibold text-body transition-all"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(false)}
                className="flex-[2] py-3 rounded-xl bg-primary hover:opacity-90 text-on-primary font-bold text-body shadow-soft transition-all"
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
