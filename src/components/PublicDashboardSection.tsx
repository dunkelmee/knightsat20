import React, { useState } from 'react';
import { Calendar, MapPin, PiggyBank } from 'lucide-react';
import { PlannedExpense, DashboardStats, EventDetails } from '../types';
import { formatPHP } from '../utils/pledgeParser';

interface PublicDashboardSectionProps {
  stats: DashboardStats;
  expenses: PlannedExpense[];
  eventDetails?: EventDetails;
}

type FundsTab = 'ledger' | 'preferences' | 'schedule';

const STATUS_STYLE: Record<PlannedExpense['status'], { bg: string; fg: string; bd: string }> = {
  Paid: { bg: 'rgba(31,122,77,.14)', fg: '#166b41', bd: 'rgba(31,122,77,.32)' },
  Approved: { bg: 'rgba(14,90,77,.1)', fg: '#0e5a4d', bd: 'rgba(14,90,77,.28)' },
  Quoted: { bg: 'rgba(214,152,45,.16)', fg: '#8f6112', bd: 'rgba(214,152,45,.36)' },
  Estimated: { bg: 'rgba(20,33,29,.07)', fg: 'rgba(20,33,29,.55)', bd: 'rgba(20,33,29,.16)' },
};

export const PublicDashboardSection: React.FC<PublicDashboardSectionProps> = ({
  stats,
  expenses,
  eventDetails,
}) => {
  const [activeTab, setActiveTab] = useState<FundsTab>('schedule');

  // Financial computations — pledge totals are server-computed aggregates (no
  // survey PII leaves the backend); expense totals come straight from the
  // already-fetched (PII-free) expense list so they match the ledger below.
  const totalPledges = stats.totalPledges;
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const runningBalance = totalPledges - totalExpenses;

  // Preferred months tally
  // (explicit tuple cast: TS's Object.entries<T> inference doesn't see through
  // the intersection type React.FC wraps destructured props in)
  const sortedMonths = (Object.entries(stats.monthTally) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Preferred venue types tally
  const sortedVenues = (Object.entries(stats.venueTally) as [string, number][])
    .sort((a, b) => b[1] - a[1]);

  const isFinalized = eventDetails?.status === 'Finalized';

  const voteBars = (
    title: string,
    icon: React.ReactNode,
    rows: [string, number][],
    barColor: string,
    emptyMsg: string,
  ) => (
    <div className="rounded-2xl bg-white/55 backdrop-blur-xl border border-white/85 shadow-soft p-4.5 space-y-3.5">
      <span className="font-serif text-heading text-on-surface flex items-center gap-1.5">{icon}{title}</span>
      {rows.length === 0 ? (
        <p className="text-center py-6 px-3 rounded-xl border-[1.5px] border-dashed border-on-surface/20 text-body text-on-surface-variant">
          {emptyMsg}
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map(([label, count]) => {
            const pct = stats.totalSurveys > 0 ? Math.round((count / stats.totalSurveys) * 100) : 0;
            return (
              <div key={label} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-2.5">
                  {/* Sans: these are survey answers (a month, a venue type),
                      not headings — only the card title above is serif. */}
                  <span className="text-body font-semibold text-on-surface">{label}</span>
                  <span className="font-mono text-label text-on-surface-variant/70">{count} · {pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-black/[0.07] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const scheduleCard = (
    <div className="rounded bg-surface-container-lowest shadow-soft p-5 space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-serif text-heading text-on-surface">Official schedule</span>
        <span
          className="px-3 py-1 rounded-full font-mono text-label font-semibold tracking-wide uppercase"
          style={{
            background: isFinalized ? 'rgba(31,122,77,.14)' : 'rgba(176,86,79,.12)',
            color: isFinalized ? '#166b41' : '#98443e',
            border: `1px solid ${isFinalized ? 'rgba(31,122,77,.32)' : 'rgba(176,86,79,.32)'}`,
          }}
        >
          {isFinalized ? 'Finalized' : 'Pending'}
        </span>
      </div>
      {eventDetails ? (
        <div className="flex flex-col">
          {[
            { k: 'Date', v: eventDetails.date },
            { k: 'Venue', v: eventDetails.venue },
            ...(isFinalized && eventDetails.time ? [{ k: 'Time', v: eventDetails.time }] : []),
            ...(eventDetails.dressCode ? [{ k: 'Attire', v: eventDetails.dressCode }] : []),
          ].map((row) => (
            <div key={row.k} className="flex flex-wrap items-baseline justify-between gap-3 py-2.5 border-b border-dashed border-on-surface/15 last:border-0">
              <span className="font-mono text-label tracking-[0.16em] uppercase text-on-surface-variant/60">{row.k}</span>
              {/* Sans, not serif: these are field values ("Pending / For
                  finalization", a venue name), not headings — the display
                  serif is reserved for headings and figures. */}
              <span className="text-body font-semibold text-on-surface text-right">{row.v}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center py-8 px-3 rounded-xl border-[1.5px] border-dashed border-on-surface/20 text-body text-on-surface-variant">
          Hindi pa announced ang schedule. The committee will slip the date, venue, and call time in here.
        </p>
      )}
    </div>
  );

  const ledgerEmptyState = (
    <div className="text-center py-10 px-5 rounded border-[1.5px] border-dashed border-on-surface/25 bg-white/40 space-y-2.5">
      <PiggyBank className="w-6 h-6 mx-auto text-on-surface-variant/60" />
      <h4 className="font-serif text-title leading-[1.14] text-on-surface">No budget line-items yet</h4>
      <p className="text-body text-on-surface-variant max-w-[40ch] mx-auto">
        The committee hasn't logged any planned expenses yet. Once budget items are added, they'll show up here.
      </p>
    </div>
  );

  return (
    <div id="public-dashboard-container" className="max-w-5xl @min-[700px]/app:max-w-[1180px] mx-auto py-6 px-4 @min-[700px]/app:px-8 space-y-5">

      {/* Balance hero */}
      <div className="relative overflow-hidden rounded-3xl p-5.5" style={{ background: 'linear-gradient(150deg,#14211d,#0b1a16)' }}>
        <div className="absolute -top-[40%] -right-[10%] w-[56%] h-[180%] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(18,120,102,.5),transparent 68%)' }} />
        <div className="relative flex flex-wrap gap-5 items-end justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-label tracking-[0.16em] uppercase text-[#f6e6bf]/60">Net running balance</span>
            <span className="font-serif text-display leading-none text-[#f6e6bf]">{formatPHP(runningBalance)}</span>
            <span className="text-label text-white/55">{runningBalance >= 0 ? 'Projected budget surplus' : 'Pledges needed for full budget'}</span>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <div className="min-w-[128px] p-3.5 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/15 flex flex-col gap-1">
              <span className="font-mono text-label tracking-[0.14em] uppercase text-white/50">Total pledges</span>
              <span className="font-serif text-heading text-[#7fd8c4]">{formatPHP(totalPledges)}</span>
              <span className="text-label text-white/40">From {stats.pledgingCount} responses</span>
            </div>
            <div className="min-w-[128px] p-3.5 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/15 flex flex-col gap-1">
              <span className="font-mono text-label tracking-[0.14em] uppercase text-white/50">Planned expenses</span>
              <span className="font-serif text-heading text-[#f6e6bf]">{formatPHP(totalExpenses)}</span>
              <span className="text-label text-white/40">Across {expenses.length} receipts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-nowrap gap-1.5">
        {([
          { key: 'schedule' as const, label: 'Schedule' },
          { key: 'preferences' as const, label: 'Preferences' },
          { key: 'ledger' as const, label: 'Ledger' },
        ]).map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 rounded-full text-label font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-on-surface text-background'
                : 'bg-white/50 text-on-surface-variant border border-white/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ledger panel */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          {expenses.length === 0 ? ledgerEmptyState : (
            <>
              <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(232px,1fr))' }}>
                {expenses.map((e) => {
                  const st = STATUS_STYLE[e.status];
                  return (
                    <div key={e.id} className="p-4 bg-surface-container-lowest shadow-soft flex flex-col gap-2" style={{ borderTop: `3px solid ${st.fg}` }}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-mono text-label tracking-[0.14em] uppercase text-on-surface-variant/60">{e.category}</span>
                        <span className="px-2.5 py-0.5 rounded-full font-mono text-label font-semibold tracking-wide uppercase" style={{ background: st.bg, color: st.fg, border: `1px solid ${st.bd}` }}>
                          {e.status}
                        </span>
                      </div>
                      <span className="font-serif text-heading leading-tight text-on-surface">{e.name}</span>
                      {e.notes && <span className="text-body text-on-surface-variant/70 leading-relaxed">{e.notes}</span>}
                      <div className="flex items-baseline justify-between gap-2.5 pt-2 border-t border-dashed border-on-surface/15">
                        <span className="font-mono text-label tracking-[0.1em] text-on-surface-variant/50">RECEIPT</span>
                        <span className="font-serif text-heading text-on-surface">{formatPHP(e.amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="rounded-2xl bg-white/55 backdrop-blur-xl border border-white/85 shadow-soft p-4 flex flex-wrap items-baseline justify-between gap-2.5">
                <span className="font-mono text-label tracking-[0.16em] uppercase text-on-surface-variant/70">
                  Total planned expenses · {expenses.length} receipts
                </span>
                <span className="font-serif text-title text-on-surface">{formatPHP(totalExpenses)}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Preferences panel */}
      {activeTab === 'preferences' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {voteBars('Preferred months', <Calendar className="w-4 h-4 text-primary mr-1" />, sortedMonths, 'linear-gradient(90deg,#12786a,#0b4a3f)', 'No votes yet — month preferences appear once alumni start answering the survey.')}
          {voteBars('Preferred venue types', <MapPin className="w-4 h-4 text-primary mr-1" />, sortedVenues, 'linear-gradient(90deg,#d6982d,#a8762a)', 'No votes yet — venue preferences appear once alumni start answering the survey.')}
        </div>
      )}

      {/* Schedule panel */}
      {activeTab === 'schedule' && scheduleCard}

    </div>
  );
};
