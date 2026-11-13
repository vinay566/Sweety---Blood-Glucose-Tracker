import React, { useState, useEffect } from 'react';
import { Reading, ReadingSlot } from '../types';
import { X, AlertCircle } from 'lucide-react';

interface ReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { date: string; slot: ReadingSlot; value: number; notes: string }) => Promise<void>;
  initialReading?: Reading | null;
}

const SLOT_OPTIONS: { key: ReadingSlot; label: string }[] = [
  { key: 'morning_fasting', label: 'Morning fasting' },
  { key: 'after_breakfast', label: 'After breakfast' },
  { key: 'after_lunch', label: 'After lunch' },
  { key: 'after_dinner', label: 'After dinner' }
];

export function ReadingModal({ isOpen, onClose, onSubmit, initialReading }: ReadingModalProps) {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slot, setSlot] = useState<ReadingSlot>('morning_fasting');
  const [value, setValue] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialReading) {
      setDate(initialReading.date);
      setSlot(initialReading.slot);
      setValue(initialReading.value.toString());
      setNotes(initialReading.notes || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setSlot('morning_fasting');
      setValue('');
      setNotes('');
    }
    setError(null);
  }, [initialReading, isOpen]);

  if (!isOpen) return null;

  const validateFrontend = (): string | null => {
    if (value === undefined || value === null || value === '' || value.trim() === '') {
      return 'Please enter a glucose value.';
    }

    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num) || num < 40 || num > 600) {
      return 'Value must be between 40 and 600 mg/dL.';
    }

    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate > today) {
      return 'Date cannot be in the future.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateFrontend();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        date,
        slot,
        value: parseInt(value, 10),
        notes
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save reading.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center px-6 py-4 bg-teal-50/50 border-b border-teal-100">
          <h3 className="font-bold text-lg text-slate-800">
            {initialReading ? 'Edit Glucose Reading' : 'Add Glucose Reading'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-slate-50/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Reading Slot
            </label>
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value as ReadingSlot)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-slate-50/50"
            >
              {SLOT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Glucose Value (mg/dL)
            </label>
            <input
              type="number"
              min="40"
              max="600"
              step="1"
              placeholder="e.g. 110"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-slate-50/50"
              required
            />
            <p className="text-xs text-slate-400 mt-1">Whole number between 40 and 600 mg/dL</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add any notes (e.g. before workout, feeling dizzy)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-slate-50/50 resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-md shadow-teal-600/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving...' : initialReading ? 'Update Reading' : 'Add Reading'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
