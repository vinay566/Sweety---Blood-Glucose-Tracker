import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { getReadings, createReading, updateReading, deleteReading } from '../services/api';
import { Reading, ReadingSlot } from '../types';
import { ReadingModal } from '../components/ReadingModal';
import { formatSlotLabel } from '../utils/formatters';
import { Plus, Edit3, Trash2, Calendar, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export function Readings() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);

  const fetchReadingsList = async (pageNum = 1) => {
    try {
      setLoading(true);
      const data = await getReadings(pageNum, 15);
      setReadings(data.readings);
      setPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages || 1);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch readings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadingsList(1);
  }, []);

  const handleOpenAdd = () => {
    setEditingReading(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (reading: Reading) => {
    setEditingReading(reading);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this reading?')) return;
    try {
      await deleteReading(id);
      await fetchReadingsList(page);
    } catch (err: any) {
      alert(err.message || 'Failed to delete reading');
    }
  };

  const handleModalSubmit = async (data: { date: string; slot: ReadingSlot; value: number; notes: string }) => {
    if (editingReading) {
      await updateReading(editingReading.id, data);
    } else {
      await createReading(data);
    }
    await fetchReadingsList(page);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-teal-100/60 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Glucose Readings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage all your blood glucose logs and records.</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-teal-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5" />
            <span>Add Reading</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Table view */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Slot</th>
                  <th className="py-4 px-6">Value</th>
                  <th className="py-4 px-6">Notes</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {readings.length > 0 ? (
                  readings.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-800 flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        <span>{r.date}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium border border-teal-100">
                          {formatSlotLabel(r.slot)}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-800">
                        {r.value} <span className="text-xs font-normal text-slate-400">mg/dL</span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 max-w-xs truncate">
                        {r.notes || '—'}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No glucose readings found. Click "Add Reading" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 bg-slate-50/50 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchReadingsList(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fetchReadingsList(page + 1)}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <ReadingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          initialReading={editingReading}
        />
      </div>
    </Layout>
  );
}
