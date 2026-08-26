import React from 'react';
import { 
  HeartHandshake, Receipt, Scale, TrendingUp, 
  Calendar, MapPin, Sparkles, ShieldCheck, CheckCircle2, Clock
} from 'lucide-react';
import { SurveyResponse, PlannedExpense, RSVPRecord, EventDetails } from '../types';
import { formatPHP } from '../utils/pledgeParser';

interface PublicDashboardSectionProps {
  responses: SurveyResponse[];
  expenses: PlannedExpense[];
  rsvps: RSVPRecord[];
  eventDetails?: EventDetails;
  onOpenAdmin: () => void;
  onTakeSurvey: () => void;
}

export const PublicDashboardSection: React.FC<PublicDashboardSectionProps> = ({
  responses,
  expenses,
  rsvps,
  eventDetails,
  onOpenAdmin,
  onTakeSurvey,
}) => {
  // Financial computations
  const totalPledges = responses.reduce((acc, r) => acc + (r.computedPledgeAmount || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const runningBalance = totalPledges - totalExpenses;

  // Preferred months tally
  const monthTally: Record<string, number> = {};
  responses.forEach(r => {
    r.preferredMonths.forEach(m => {
      monthTally[m] = (monthTally[m] || 0) + 1;
    });
  });
  const sortedMonths = Object.entries(monthTally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Preferred venue types tally
  const venueTally: Record<string, number> = {};
  responses.forEach(r => {
    const v = r.preferredVenueType || 'Hotel / function room';
    venueTally[v] = (venueTally[v] || 0) + 1;
  });
  const sortedVenues = Object.entries(venueTally).sort((a, b) => b[1] - a[1]);

  return (
    <div id="public-dashboard-container" className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      
      {/* Sleek Top Banner */}
      <div className="bg-white text-stone-900 rounded-xl p-4 sm:p-5 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-stone-900">
            Batch Operating Funds & Ledger
          </h2>
          <p className="text-stone-600 text-xs max-w-lg">
            Live auto-calculated summary of total pledges from survey responses and planned budget line-items.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onTakeSurvey}
            className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pledge in Survey</span>
          </button>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
            <span>Treasury Admin</span>
          </button>
        </div>
      </div>

      {/* 3 Core Financial Metric Cards (Sleek proportions) */}
      <div id="financial-metric-cards" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Total Pledges */}
        <div className="bg-white rounded-xl p-4 border border-stone-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">
              Total Pledges
            </span>
            <HeartHandshake className="w-4 h-4 text-amber-700" />
          </div>

          <div className="text-xl sm:text-2xl font-semibold text-amber-800">
            {formatPHP(totalPledges)}
          </div>

          <p className="text-[11px] text-stone-500">
            From {responses.filter(r => r.computedPledgeAmount > 0).length} alumni responses
          </p>
        </div>

        {/* Total Planned Expenses */}
        <div className="bg-white rounded-xl p-4 border border-stone-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">
              Planned Expenses
            </span>
            <Receipt className="w-4 h-4 text-stone-500" />
          </div>

          <div className="text-xl sm:text-2xl font-semibold text-stone-900">
            {formatPHP(totalExpenses)}
          </div>

          <p className="text-[11px] text-stone-500">
            Across {expenses.length} budget items
          </p>
        </div>

        {/* Net Running Balance */}
        <div className="bg-white rounded-xl p-4 border border-stone-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">
              Net Running Balance
            </span>
            <TrendingUp className="w-4 h-4 text-stone-500" />
          </div>

          <div className={`text-xl sm:text-2xl font-semibold ${
            runningBalance >= 0 ? 'text-emerald-800' : 'text-rose-700'
          }`}>
            {formatPHP(runningBalance)}
          </div>

          <p className="text-[11px] text-stone-500">
            {runningBalance >= 0 ? 'Projected budget surplus' : 'Pledges needed for full budget'}
          </p>
        </div>

      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left: Planned Budget Line-Items Table */}
        <div className="lg:col-span-7 bg-white rounded-xl p-4 sm:p-5 border border-stone-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="text-sm sm:text-base font-semibold text-stone-900 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-amber-700" />
              <span>Budget Ledger</span>
            </h3>
            <span className="text-[11px] font-medium text-stone-500">
              {expenses.length} Items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-semibold">
                  <th className="py-2">Item</th>
                  <th className="py-2">Category</th>
                  <th className="py-2 text-right">Estimated</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-2.5">
                      <div className="font-semibold text-stone-900">{e.name}</div>
                      {e.notes && <div className="text-[11px] text-stone-500">{e.notes}</div>}
                    </td>
                    <td className="py-2.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-semibold text-stone-900">
                      {formatPHP(e.amount)}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        e.status === 'Paid' ? 'bg-emerald-50 text-emerald-800' :
                        e.status === 'Committed' ? 'bg-amber-50 text-amber-800' : 'bg-stone-100 text-stone-700'
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
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 space-y-3">
            <h3 className="text-sm sm:text-base font-semibold text-stone-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-700" />
              <span>Preferred Months (Survey Q3)</span>
            </h3>

            <div className="space-y-2">
              {sortedMonths.map(([month, count]) => {
                const pct = responses.length > 0 ? Math.round((count / responses.length) * 100) : 0;
                return (
                  <div key={month} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-stone-800">{month}</span>
                      <span className="text-stone-500">{count} votes ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-700 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Preferred Venue Styles */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 space-y-3">
            <h3 className="text-sm sm:text-base font-semibold text-stone-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-700" />
              <span>Preferred Venue Types (Survey Q4)</span>
            </h3>

            <div className="space-y-2">
              {sortedVenues.map(([venue, count]) => {
                const pct = responses.length > 0 ? Math.round((count / responses.length) * 100) : 0;
                return (
                  <div key={venue} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-stone-800">{venue}</span>
                      <span className="text-stone-500">{count} votes ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-stone-800 rounded-full"
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
            <div className="bg-[#fcfaf7] rounded-xl p-4 border border-amber-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span>Official Schedule Status</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  eventDetails.status === 'Finalized'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {eventDetails.status === 'Finalized' ? '✓ Finalized' : '⏳ Pending / Planning'}
                </span>
              </div>

              <div className="text-xs space-y-1 text-stone-700 bg-white p-3 rounded-lg border border-stone-200 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-stone-500 text-[11px]">Date:</span>
                  <span className="font-semibold text-stone-900 text-right">{eventDetails.date}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-stone-500 text-[11px]">Venue:</span>
                  <span className="font-semibold text-stone-900 text-right">{eventDetails.venue}</span>
                </div>
                {eventDetails.status === 'Finalized' && eventDetails.time && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-stone-500 text-[11px]">Time:</span>
                    <span className="font-semibold text-stone-900 text-right">{eventDetails.time}</span>
                  </div>
                )}
                {eventDetails.dressCode && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-stone-500 text-[11px]">Attire:</span>
                    <span className="font-semibold text-stone-900 text-right">{eventDetails.dressCode}</span>
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
