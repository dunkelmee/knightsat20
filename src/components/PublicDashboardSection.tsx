import React from 'react';
import {
  HeartHandshake, Receipt, Scale, TrendingUp,
  Calendar, MapPin, Sparkles, ShieldCheck, CheckCircle2, Clock
} from 'lucide-react';
import { PlannedExpense, DashboardStats, EventDetails } from '../types';
import { formatPHP } from '../utils/pledgeParser';

interface PublicDashboardSectionProps {
  stats: DashboardStats;
  expenses: PlannedExpense[];
  eventDetails?: EventDetails;
  onOpenAdmin: () => void;
  onTakeSurvey: () => void;
}

export const PublicDashboardSection: React.FC<PublicDashboardSectionProps> = ({
  stats,
  expenses,
  eventDetails,
  onOpenAdmin,
  onTakeSurvey,
}) => {
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

  return (
    <div id="public-dashboard-container" className="max-w-5xl mx-auto py-6 px-4 space-y-6">

      {/* Sleek Top Banner */}
      <div className="bg-surface-container-lowest text-on-surface rounded p-4 sm:p-5 border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-serif font-semibold tracking-tight text-on-surface">
            Batch Operating Funds & Ledger
          </h2>
          <p className="text-on-surface-variant text-xs max-w-lg">
            Live auto-calculated summary of total pledges from survey responses and planned budget line-items.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onTakeSurvey}
            className="px-4 py-2 rounded bg-primary hover:opacity-90 text-on-primary font-semibold text-xs shadow-soft transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pledge in Survey</span>
          </button>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="px-3.5 py-2 rounded bg-background border border-secondary text-secondary hover:bg-surface-container font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
            <span>Treasury Admin</span>
          </button>
        </div>
      </div>

      {/* 3 Core Financial Metric Cards (Sleek proportions) */}
      <div id="financial-metric-cards" className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Total Pledges */}
        <div className="bg-surface-container-lowest rounded p-4 border border-outline-variant/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">
              Total Pledges
            </span>
            <HeartHandshake className="w-4 h-4 text-primary" />
          </div>

          <div className="text-xl sm:text-2xl font-semibold text-primary">
            {formatPHP(totalPledges)}
          </div>

          <p className="text-[11px] text-on-surface-variant">
            From {stats.pledgingCount} alumni responses
          </p>
        </div>

        {/* Total Planned Expenses */}
        <div className="bg-surface-container-lowest rounded p-4 border border-outline-variant/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">
              Planned Expenses
            </span>
            <Receipt className="w-4 h-4 text-on-surface-variant" />
          </div>

          <div className="text-xl sm:text-2xl font-semibold text-on-surface">
            {formatPHP(totalExpenses)}
          </div>

          <p className="text-[11px] text-on-surface-variant">
            Across {expenses.length} budget items
          </p>
        </div>

        {/* Net Running Balance */}
        <div className="bg-surface-container-lowest rounded p-4 border border-outline-variant/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">
              Net Running Balance
            </span>
            <TrendingUp className="w-4 h-4 text-on-surface-variant" />
          </div>

          <div className={`text-xl sm:text-2xl font-semibold ${
            runningBalance >= 0 ? 'text-success' : 'text-error'
          }`}>
            {formatPHP(runningBalance)}
          </div>

          <p className="text-[11px] text-on-surface-variant">
            {runningBalance >= 0 ? 'Projected budget surplus' : 'Pledges needed for full budget'}
          </p>
        </div>

      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* Left: Planned Budget Line-Items Table */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <h3 className="text-sm sm:text-base font-semibold text-on-surface flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-primary" />
              <span>Budget Ledger</span>
            </h3>
            <span className="text-[11px] font-medium text-on-surface-variant">
              {expenses.length} Items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-outline-variant/30 text-on-surface-variant font-semibold">
                  <th className="py-2">Item</th>
                  <th className="py-2">Category</th>
                  <th className="py-2 text-right">Estimated</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {expenses.map((e, idx) => (
                  <tr key={e.id} className={`hover:bg-surface-container-low transition-colors ${idx % 2 === 0 ? 'bg-surface-container-low/50' : ''}`}>
                    <td className="py-2.5">
                      <div className="font-semibold text-on-surface">{e.name}</div>
                      {e.notes && <div className="text-[11px] text-on-surface-variant">{e.notes}</div>}
                    </td>
                    <td className="py-2.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-semibold text-on-surface">
                      {formatPHP(e.amount)}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        e.status === 'Paid' ? 'bg-success-container text-on-success-container' :
                        e.status === 'Committed' ? 'bg-primary-container/20 text-on-primary-container' : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Survey Voting Insights */}
        <div className="lg:col-span-5 space-y-4">

          {/* Top Preferred Months */}
          <div className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 space-y-3">
            <h3 className="text-sm sm:text-base font-semibold text-on-surface flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Preferred Months (Survey Q3)</span>
            </h3>

            <div className="space-y-2">
              {sortedMonths.map(([month, count]) => {
                const pct = stats.totalSurveys > 0 ? Math.round((count / stats.totalSurveys) * 100) : 0;
                return (
                  <div key={month} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-on-surface">{month}</span>
                      <span className="text-on-surface-variant">{count} votes ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Preferred Venue Styles */}
          <div className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 space-y-3">
            <h3 className="text-sm sm:text-base font-semibold text-on-surface flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Preferred Venue Types (Survey Q4)</span>
            </h3>

            <div className="space-y-2">
              {sortedVenues.map(([venue, count]) => {
                const pct = stats.totalSurveys > 0 ? Math.round((count / stats.totalSurveys) * 100) : 0;
                return (
                  <div key={venue} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-on-surface">{venue}</span>
                      <span className="text-on-surface-variant">{count} votes ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official Schedule & Venue Status Card */}
          {eventDetails && (
            <div className="bg-primary-container/10 rounded p-4 border border-primary-container/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>Official Schedule Status</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  eventDetails.status === 'Finalized'
                    ? 'bg-success-container text-on-success-container border border-success-container'
                    : 'bg-primary-container/20 text-on-primary-container border border-primary-container/50'
                }`}>
                  {eventDetails.status === 'Finalized' ? '✓ Finalized' : '⏳ Pending / Planning'}
                </span>
              </div>

              <div className="text-xs space-y-1 text-on-surface-variant bg-surface-container-lowest p-3 rounded border border-outline-variant/30 shadow-soft">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-on-surface-variant text-[11px]">Date:</span>
                  <span className="font-semibold text-on-surface text-right">{eventDetails.date}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-on-surface-variant text-[11px]">Venue:</span>
                  <span className="font-semibold text-on-surface text-right">{eventDetails.venue}</span>
                </div>
                {eventDetails.status === 'Finalized' && eventDetails.time && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-on-surface-variant text-[11px]">Time:</span>
                    <span className="font-semibold text-on-surface text-right">{eventDetails.time}</span>
                  </div>
                )}
                {eventDetails.dressCode && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-on-surface-variant text-[11px]">Attire:</span>
                    <span className="font-semibold text-on-surface text-right">{eventDetails.dressCode}</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
