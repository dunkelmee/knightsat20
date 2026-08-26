import React, { useState } from 'react';
import { X, Receipt, Plus } from 'lucide-react';
import { PlannedExpense } from '../../types';

interface AddExpenseModalProps {
  onClose: () => void;
  onSaveExpense: (expense: PlannedExpense) => void;
  existingExpense?: PlannedExpense | null;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  onClose,
  onSaveExpense,
  existingExpense,
}) => {
  const [name, setName] = useState(existingExpense?.name || '');
  const [category, setCategory] = useState<PlannedExpense['category']>(
    existingExpense?.category || 'Venue & Banquet'
  );
  const [amount, setAmount] = useState<string>(existingExpense ? String(existingExpense.amount) : '');
  const [targetDate, setTargetDate] = useState(existingExpense?.targetDate || '');
  const [status, setStatus] = useState<PlannedExpense['status']>(existingExpense?.status || 'Estimated');
  const [notes, setNotes] = useState(existingExpense?.notes || '');
  const [error, setError] = useState('');

  const categories: PlannedExpense['category'][] = [
    'Venue & Banquet',
    'Audio Visual & Lights',
    'Souvenirs & T-Shirts',
    'Photo & Video',
    'Prizes & Tokens',
    'Decorations & Program',
    'Administrative & Misc',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an expense item name.');
      return;
    }
    const numAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please provide a valid numeric amount greater than 0.');
      return;
    }

    const expense: PlannedExpense = {
      id: existingExpense ? existingExpense.id : `exp-${Date.now()}`,
      name: name.trim(),
      category,
      amount: numAmount,
      targetDate: targetDate || undefined,
      status,
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    onSaveExpense(expense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-lg max-w-lg w-full p-6 sm:p-8 shadow-soft border border-outline-variant/30 space-y-6 my-8">

        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-error-container text-on-error-container flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-on-surface">
                {existingExpense ? 'Edit Planned Expense' : 'Add Planned Expense Item'}
              </h2>
              <p className="text-xs text-on-surface-variant">
                Operating budget line item & cost tracking
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-outline hover:text-on-surface hover:bg-surface-container"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-error-container text-on-error-container text-xs font-medium rounded border border-error-container">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">
              Expense Name / Description <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Venue Banquet Reservation Deposit (70 pax)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded border border-secondary/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded border border-secondary/30 text-on-surface text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                Estimated Amount (₱) <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">₱</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  required
                  placeholder="25000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 rounded border border-secondary/30 text-on-surface text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                Target Payment Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded border border-secondary/30 text-on-surface text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded border border-secondary/30 text-on-surface text-xs font-semibold focus:outline-none"
              >
                <option value="Estimated">Estimated</option>
                <option value="Quoted">Quoted</option>
                <option value="Approved">Approved</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">
              Notes & Supplier Details <span className="text-outline font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Quotation received from Supplier X, inclusive of setup crew and VAT."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded border border-secondary/30 text-xs text-on-surface focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded border border-secondary/30 text-on-surface-variant text-xs font-semibold hover:bg-surface-container"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded bg-error hover:opacity-90 text-on-error text-xs font-bold shadow-soft"
            >
              {existingExpense ? 'Save Changes' : 'Add Expense to Ledger'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
