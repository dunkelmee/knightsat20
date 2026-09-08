import React, { useState } from 'react';
import {
  Receipt, Plus, Edit2, Trash2, TrendingUp, AlertCircle, FileSpreadsheet, Check, PiggyBank
} from 'lucide-react';
import { SurveyResponse, PlannedExpense } from '../../types';
import { formatPHP } from '../../utils/pledgeParser';
import { exportPledgesAndExpensesToCSV } from '../../utils/exportUtils';
import { AddExpenseModal } from './AddExpenseModal';

interface OperatingFundsTabProps {
  responses: SurveyResponse[];
  expenses: PlannedExpense[];
  onSaveExpense: (expense: PlannedExpense) => void;
  onDeleteExpense: (id: string) => void;
}

export const OperatingFundsTab: React.FC<OperatingFundsTabProps> = ({
  responses,
  expenses,
  onSaveExpense,
  onDeleteExpense,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<PlannedExpense | null>(null);

  // Financial computations
  const totalPledges = responses.reduce((acc, r) => acc + (r.computedPledgeAmount || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const runningBalance = totalPledges - totalExpenses;

  const collectedPledges = responses
    .filter(r => r.pledgePaidStatus === 'Fully Paid')
    .reduce((acc, r) => acc + (r.computedPledgeAmount || 0), 0);

  const pendingPledges = totalPledges - collectedPledges;

  // Category distribution
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  return (
    <div id="operating-funds-tab" className="space-y-6">

      {/* Balance hero — the attendee Funds card (PublicDashboardSection),
          inverted. There it is a dark card on the parchment body; here it is
          a paper card on the green one, which is the same reversal the rest
          of the back office makes.

          Colours are literal rather than tokens on purpose. This card sits
          inside .back-office-surface, where the surface tokens are
          translucent white and on-surface is cream — reading them would
          paint dark-on-dark. The attendee original hardcodes for the mirror
          image of this reason. */}
      <div className="relative overflow-hidden rounded-3xl p-5.5" style={{ background: 'linear-gradient(150deg,#faf6ea,#e7ddcd)' }}>
        <div
          className="absolute -top-[40%] -right-[10%] w-[56%] h-[180%] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(18,120,102,.22),transparent 68%)' }}
        />
        <div className="relative flex flex-wrap gap-5 items-end justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="eyebrow text-[#4a544f]/75">Net running balance</span>
            <span className={`font-serif text-display leading-none ${runningBalance >= 0 ? 'text-[#0e5a4d]' : 'text-[#98443e]'}`}>
              {formatPHP(runningBalance)}
            </span>
            <span className="text-label text-[#4a544f]">
              {runningBalance >= 0 ? 'Projected budget surplus' : 'Budget shortfall — needs more pledges'}
            </span>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <div className="min-w-[128px] p-3.5 rounded-2xl bg-[#14211d]/[0.05] backdrop-blur-md border border-[#14211d]/10 flex flex-col gap-1">
              <span className="eyebrow text-[#4a544f]/70">Total pledges</span>
              <span className="font-serif text-heading text-[#0e5a4d]">{formatPHP(totalPledges)}</span>
              <span className="text-label text-[#4a544f]/80">
                {formatPHP(collectedPledges)} paid · {formatPHP(pendingPledges)} pending
              </span>
            </div>
            <div className="min-w-[128px] p-3.5 rounded-2xl bg-[#14211d]/[0.05] backdrop-blur-md border border-[#14211d]/10 flex flex-col gap-1">
              <span className="eyebrow text-[#4a544f]/70">Planned expenses</span>
              <span className="font-serif text-heading text-[#8f6112]">{formatPHP(totalExpenses)}</span>
              <span className="text-label text-[#4a544f]/80">
                {expenses.length} budgeted ledger item{expenses.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section header — the attendee Batch Board's Announcements heading
          (BatchBoardSection): serif `title`, a small primary icon, and a
          hairline rule running out to the edge. The controls sit in their own
          right-aligned row below rather than in the heading, so the rule can
          run the full width the way it does there. */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <span className="font-serif text-title leading-[1.04] text-on-surface flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            Planned Expenses
          </span>
          <span className="flex-1 min-w-[20px] h-px bg-on-surface/15" />
        </div>

        <p className="text-body text-on-surface-variant">
          Add supplier estimates, banquet quotas, and event operating costs
        </p>

        {/* Right-aligned action row, placed like the Photos tab's "New album"
            button. It keeps the shared .btn shape rather than that tab's pill,
            so the back office stays on one button rule. */}
        <div className="flex justify-end gap-2">
          {expenses.length > 0 && (
            <button
              type="button"
              onClick={() => exportPledgesAndExpensesToCSV(responses, expenses)}
              className="btn btn-secondary"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Financial Ledger</span>
            </button>
          )}

          <button
            id="btn-add-expense-modal"
            type="button"
            onClick={() => {
              setEditingExpense(null);
              setIsModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>New Planned Expense</span>
          </button>
        </div>
      </div>

      {/* Empty state — the shape of the attendee Funds tab's ledgerEmptyState
          (PublicDashboardSection), but on the back office's frosted card
          rather than that view's bg-white/40, which read as a bright panel
          against the green. Using the surface token rather than a literal
          white also picks up the backdrop-blur, since index.css applies the
          frost by surface utility. The border stays dashed: this is a
          placeholder, not a card with nothing in it. */}
      {expenses.length === 0 ? (
        <div className="text-center py-10 px-5 rounded border-[1.5px] border-dashed border-on-surface/25 bg-surface-container-lowest space-y-2.5">
          <PiggyBank className="w-6 h-6 mx-auto text-on-surface-variant/60" />
          <h4 className="font-serif text-title leading-[1.14] text-on-surface">No budget line-items yet</h4>
          <p className="text-body text-on-surface-variant max-w-[40ch] mx-auto">
            Add planned expenses here once the venue details are finalized.
          </p>
        </div>
      ) : (
        <>
        {/* Expenses Table — desktop/large screens only, see the card list below for mobile */}
        <div className="hidden lg:block bg-surface-container-lowest rounded border border-outline-variant/30 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body text-on-surface-variant">
              <thead className="bg-inverse-surface text-inverse-on-surface eyebrow">
                <tr>
                  <th className="py-3 px-4">Expense Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Amount (PHP)</th>
                  <th className="py-3 px-4">Target Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {expenses.map((exp, idx) => (
                  <tr key={exp.id} className={`hover:bg-surface-container-low transition-colors ${idx % 2 === 0 ? 'bg-surface-container-low/50' : ''}`}>
                    <td className="py-3.5 px-4 font-serif text-heading text-on-surface">
                      {exp.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant eyebrow">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-serif text-heading text-error">
                      {formatPHP(exp.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant">
                      {exp.targetDate || 'TBD'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full eyebrow ${
                        exp.status === 'Paid' ? 'bg-success-container text-on-success-container' :
                        exp.status === 'Approved' ? 'bg-tertiary-container/25 text-on-tertiary-container' :
                        exp.status === 'Quoted' ? 'bg-secondary-container text-on-secondary-container' :
                        'bg-surface-container text-on-surface-variant'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px] truncate text-on-surface-variant" title={exp.notes}>
                      {exp.notes || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExpense(exp);
                            setIsModalOpen(true);
                          }}
                          className="btn-icon"
                          title="Edit expense"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete expense "${exp.name}"?`)) {
                              onDeleteExpense(exp.id);
                            }
                          }}
                          className="btn-icon btn-icon-danger"
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-surface-container-low font-semibold text-on-surface border-t border-outline-variant/30">
                <tr>
                  <td className="py-3.5 px-4" colSpan={2}>
                    Total Planned Expenses
                  </td>
                  <td className="py-3.5 px-4 font-serif text-heading text-error">
                    {formatPHP(totalExpenses)}
                  </td>
                  <td colSpan={4} className="py-3.5 px-4 text-right text-body text-on-surface-variant font-normal">
                    Net Balance: <strong className={runningBalance >= 0 ? 'text-success' : 'text-primary'}>{formatPHP(runningBalance)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Expense Cards — mobile/tablet only, mirrors the table above */}
        <div className="lg:hidden space-y-3">
          {expenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-surface-container-lowest rounded p-4 border border-outline-variant/30 shadow-soft space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-serif text-heading text-on-surface">{exp.name}</div>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full eyebrow ${
                    exp.status === 'Paid' ? 'bg-success-container text-on-success-container' :
                    exp.status === 'Approved' ? 'bg-tertiary-container/25 text-on-tertiary-container' :
                    exp.status === 'Quoted' ? 'bg-secondary-container text-on-secondary-container' :
                    'bg-surface-container text-on-surface-variant'
                  }`}>
                    {exp.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant eyebrow">
                    {exp.category}
                  </span>
                  <span className="text-label text-on-surface-variant">{exp.targetDate || 'TBD'}</span>
                </div>

                <div className="font-serif text-heading text-error pt-2 border-t border-outline-variant/20">
                  {formatPHP(exp.amount)}
                </div>

                {exp.notes && (
                  <p className="text-label text-on-surface-variant truncate" title={exp.notes}>
                    {exp.notes}
                  </p>
                )}

                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingExpense(exp);
                      setIsModalOpen(true);
                    }}
                    className="btn-icon"
                    title="Edit expense"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete expense "${exp.name}"?`)) {
                        onDeleteExpense(exp.id);
                      }
                    }}
                    className="btn-icon btn-icon-danger"
                    title="Delete expense"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
          ))}

          {expenses.length > 0 && (
            <div className="bg-surface-container-low rounded p-4 border border-outline-variant/30 font-semibold text-on-surface flex items-center justify-between text-body">
              <span>Total Planned Expenses</span>
              <span className="font-serif text-heading text-error">{formatPHP(totalExpenses)}</span>
            </div>
          )}
        </div>
        </>
      )}

      {/* Category Breakdown Cards — nothing to break down until there is at
          least one expense. */}
      {expenses.length > 0 && (
        <div className="bg-surface-container-lowest rounded p-6 border border-outline-variant/30 shadow-soft space-y-4">
          <h4 className="text-heading text-on-surface">
            Expense Category Allocations
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(categoryTotals).map(([cat, amount]) => (
              <div key={cat} className="p-3 bg-surface-container-low rounded border border-outline-variant/30 space-y-1">
                <div className="eyebrow text-on-surface-variant truncate" title={cat}>
                  {cat}
                </div>
                <div className="font-serif text-heading text-on-surface">
                  {formatPHP(amount)}
                </div>
                <div className="text-label text-outline">
                  {totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0}% of budget
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <AddExpenseModal
          onClose={() => setIsModalOpen(false)}
          onSaveExpense={onSaveExpense}
          existingExpense={editingExpense}
        />
      )}

    </div>
  );
};
