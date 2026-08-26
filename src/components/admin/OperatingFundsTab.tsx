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
        <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800 uppercase tracking-wide">
            <span>Total Pledges (Q5 Auto-Computed)</span>
            <HeartHandshake className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">
            {formatPHP(totalPledges)}
          </div>
          <div className="text-xs text-slate-500 flex justify-between pt-1 border-t border-slate-100">
            <span>Paid: <strong className="text-emerald-700">{formatPHP(collectedPledges)}</strong></span>
            <span>Pending: <strong className="text-amber-700">{formatPHP(pendingPledges)}</strong></span>
          </div>
        </div>

        {/* Total Planned Expenses Card */}
        <div className="bg-white rounded-2xl p-6 border border-rose-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-rose-800 uppercase tracking-wide">
            <span>Total Planned Expenses</span>
            <Receipt className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600">
            {formatPHP(totalExpenses)}
          </div>
          <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">
            {expenses.length} budgeted ledger items
          </p>
        </div>

        {/* Net Running Balance Card */}
        <div className={`rounded-2xl p-6 border shadow-sm space-y-2 ${
          runningBalance >= 0 
            ? 'bg-slate-900 text-white border-slate-800' 
            : 'bg-amber-950 text-white border-amber-800'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wide">
            <span>Net Running Balance</span>
            <Scale className="w-4 h-4" />
          </div>
          <div className={`text-3xl font-extrabold ${runningBalance >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {formatPHP(runningBalance)}
          </div>
          <p className="text-xs text-slate-300 pt-1 border-t border-slate-800">
            {runningBalance >= 0 ? 'Surplus Balance' : 'Budget Shortfall / Needs More Pledges'}
          </p>
        </div>

      </div>

      {/* Expense Management Header & Actions */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-600" />
            <span>Planned Expenses Ledger</span>
          </h3>
          <p className="text-xs text-slate-500">
            Add supplier estimates, banquet quotas, and event operating costs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportPledgesAndExpensesToCSV(responses, expenses)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Financial Ledger</span>
          </button>

          <button
            id="btn-add-expense-modal"
            type="button"
            onClick={() => {
              setEditingExpense(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Planned Expense</span>
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
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
            <tbody className="divide-y divide-slate-100">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {exp.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-semibold">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-rose-600 text-sm">
                    {formatPHP(exp.amount)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {exp.targetDate || 'TBD'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      exp.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                      exp.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                      exp.status === 'Quoted' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-500" title={exp.notes}>
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
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
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
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
              <tr>
                <td className="py-3.5 px-4" colSpan={2}>
                  Total Planned Expenses
                </td>
                <td className="py-3.5 px-4 text-rose-600 text-sm">
                  {formatPHP(totalExpenses)}
                </td>
                <td colSpan={4} className="py-3.5 px-4 text-right text-xs text-slate-500 font-normal">
                  Net Balance: <strong className={runningBalance >= 0 ? 'text-emerald-700' : 'text-amber-700'}>{formatPHP(runningBalance)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          Expense Category Allocations
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(categoryTotals).map(([cat, amount]) => (
            <div key={cat} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[11px] text-slate-500 font-medium truncate" title={cat}>
                {cat}
              </div>
              <div className="text-base font-extrabold text-slate-900">
                {formatPHP(amount)}
              </div>
              <div className="text-[10px] text-slate-400">
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
