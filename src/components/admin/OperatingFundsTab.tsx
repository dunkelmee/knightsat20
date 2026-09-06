import React, { useState } from 'react';
import {
  HeartHandshake, Receipt, Scale, Plus, Edit2,
  Trash2, TrendingUp, AlertCircle, FileSpreadsheet, Check
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

      {/* 3 Main Operating Funds Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Total Pledges Card */}
        <div className="bg-surface-container-lowest rounded p-6 border border-primary-container/50 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-label font-bold text-on-primary-container uppercase tracking-wide">
            <span>Total Pledges (Q5 Auto-Computed)</span>
            <HeartHandshake className="w-4 h-4 text-primary" />
          </div>
          <div className="text-title font-bold text-primary">
            {formatPHP(totalPledges)}
          </div>
          <div className="text-body text-on-surface-variant flex justify-between pt-1 border-t border-outline-variant/20">
            <span>Paid: <strong className="text-success">{formatPHP(collectedPledges)}</strong></span>
            <span>Pending: <strong className="text-primary">{formatPHP(pendingPledges)}</strong></span>
          </div>
        </div>

        {/* Total Planned Expenses Card */}
        <div className="bg-surface-container-lowest rounded p-6 border border-error-container shadow-soft space-y-2">
          <div className="flex items-center justify-between text-label font-bold text-on-error-container uppercase tracking-wide">
            <span>Total Planned Expenses</span>
            <Receipt className="w-4 h-4 text-error" />
          </div>
          <div className="text-title font-bold text-error">
            {formatPHP(totalExpenses)}
          </div>
          <p className="text-body text-on-surface-variant pt-1 border-t border-outline-variant/20">
            {expenses.length} budgeted ledger items
          </p>
        </div>

        {/* Net Running Balance Card */}
        <div className={`rounded p-6 border shadow-soft space-y-2 ${
          runningBalance >= 0
            ? 'bg-inverse-surface text-inverse-on-surface border-inverse-surface'
            : 'bg-error text-on-error border-error'
        }`}>
          <div className={`flex items-center justify-between text-label font-bold uppercase tracking-wide ${runningBalance >= 0 ? 'text-success' : 'text-on-error'}`}>
            <span>Net Running Balance</span>
            <Scale className="w-4 h-4" />
          </div>
          <div className={`text-title font-bold ${runningBalance >= 0 ? 'text-success' : 'text-on-error'}`}>
            {formatPHP(runningBalance)}
          </div>
          <p className={`text-body pt-1 border-t ${runningBalance >= 0 ? 'text-inverse-on-surface/70 border-inverse-on-surface/20' : 'text-on-error/80 border-on-error/20'}`}>
            {runningBalance >= 0 ? 'Surplus Balance' : 'Budget Shortfall / Needs More Pledges'}
          </p>
        </div>

      </div>

      {/* Expense Management Header & Actions */}
      <div className="bg-surface-container-lowest rounded p-5 border border-outline-variant/30 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-heading font-bold text-on-surface flex items-center gap-2">
            <Receipt className="w-5 h-5 text-error" />
            <span>Planned Expenses Ledger</span>
          </h3>
          <p className="text-body text-on-surface-variant">
            Add supplier estimates, banquet quotas, and event operating costs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportPledgesAndExpensesToCSV(responses, expenses)}
            className="px-3.5 py-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-body font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-on-surface-variant" />
            <span>Export Financial Ledger</span>
          </button>

          <button
            id="btn-add-expense-modal"
            type="button"
            onClick={() => {
              setEditingExpense(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded bg-error hover:opacity-90 text-on-error text-body font-bold shadow-soft transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Planned Expense</span>
          </button>
        </div>
      </div>

      {/* Expenses Table — desktop/large screens only, see the card list below for mobile */}
      <div className="hidden lg:block bg-surface-container-lowest rounded border border-outline-variant/30 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body text-on-surface-variant">
            <thead className="bg-inverse-surface text-inverse-on-surface uppercase text-label tracking-wider">
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
                  <td className="py-3.5 px-4 font-bold text-on-surface">
                    {exp.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-label font-semibold">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-error text-heading">
                    {formatPHP(exp.amount)}
                  </td>
                  <td className="py-3.5 px-4 text-on-surface-variant">
                    {exp.targetDate || 'TBD'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-label font-bold ${
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
                        className="p-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
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
                        className="p-1.5 rounded bg-error-container hover:opacity-80 text-on-error-container"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-surface-container-low font-bold text-on-surface border-t border-outline-variant/30">
              <tr>
                <td className="py-3.5 px-4" colSpan={2}>
                  Total Planned Expenses
                </td>
                <td className="py-3.5 px-4 text-error text-heading">
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
        {expenses.length === 0 ? (
          <div className="py-8 text-center text-body text-on-surface-variant bg-surface-container-lowest rounded border border-outline-variant/30">
            No planned expenses yet.
          </div>
        ) : (
          expenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-surface-container-lowest rounded p-4 border border-outline-variant/30 shadow-soft space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-heading text-on-surface">{exp.name}</div>
                <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-label font-bold ${
                  exp.status === 'Paid' ? 'bg-success-container text-on-success-container' :
                  exp.status === 'Approved' ? 'bg-tertiary-container/25 text-on-tertiary-container' :
                  exp.status === 'Quoted' ? 'bg-secondary-container text-on-secondary-container' :
                  'bg-surface-container text-on-surface-variant'
                }`}>
                  {exp.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-label font-semibold">
                  {exp.category}
                </span>
                <span className="text-label text-on-surface-variant">{exp.targetDate || 'TBD'}</span>
              </div>

              <div className="font-bold text-error text-heading pt-2 border-t border-outline-variant/20">
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
                  className="p-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
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
                  className="p-1.5 rounded bg-error-container hover:opacity-80 text-on-error-container"
                  title="Delete expense"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}

        {expenses.length > 0 && (
          <div className="bg-surface-container-low rounded p-4 border border-outline-variant/30 font-bold text-on-surface flex items-center justify-between text-body">
            <span>Total Planned Expenses</span>
            <span className="text-error text-heading">{formatPHP(totalExpenses)}</span>
          </div>
        )}
      </div>

      {/* Category Breakdown Cards */}
      <div className="bg-surface-container-lowest rounded p-6 border border-outline-variant/30 shadow-soft space-y-4">
        <h4 className="text-label font-bold text-on-surface-variant uppercase tracking-wide">
          Expense Category Allocations
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(categoryTotals).map(([cat, amount]) => (
            <div key={cat} className="p-3 bg-surface-container-low rounded border border-outline-variant/30 space-y-1">
              <div className="text-label text-on-surface-variant font-medium truncate" title={cat}>
                {cat}
              </div>
              <div className="text-heading font-bold text-on-surface">
                {formatPHP(amount)}
              </div>
              <div className="text-label text-outline">
                {totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0}% of budget
              </div>
            </div>
          ))}
        </div>
      </div>

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
