import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { getStats, getReadings, createReading, getReport } from '../services/api';
import { Reading, ReadingSlot } from '../types';
import { ReadingModal } from '../components/ReadingModal';
import { formatSlotLabel } from '../utils/formatters';
import { Plus, TrendingUp, TrendingDown, Activity, Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function Dashboard() {
  const [stats, setStats] = useState<{ total: number; highest: number | null; lowest: number | null; average: number | null }>({
    total: 0,
    highest: null,
    lowest: null,
    average: null
  });
  const [readings, setReadings] = useState<Reading[]>([]);
  const [todayReport, setTodayReport] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, readingsData, todayData] = await Promise.all([
        getStats(),
        getReadings(1, 10),
        getReport('daily', new Date().toISOString().split('T')[0])
      ]);
      setStats(statsData);
      setReadings(readingsData.readings);
      setTodayReport(todayData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddReading = async (data: { date: string; slot: ReadingSlot; value: number; notes: string }) => {
    await createReading(data);
    await fetchData();
  };

  // Prepare data for Recharts (reverse readings chronologically)
  const chartData = [...readings]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(r => ({
      date: `${r.date} (${formatSlotLabel(r.slot).split(' ')[0]})`,
      value: r.value,
      slot: formatSlotLabel(r.slot)
    }));

  const slotsList: ReadingSlot[] = ['morning_fasting', 'after_breakfast', 'after_lunch', 'after_dinner'];
  const todayReadingsMap = new Map<string, number>();
  if (todayReport && todayReport.readings) {
    todayReport.readings.forEach((r: Reading) => {
      todayReadingsMap.set(r.slot, r.value);
    });
  }

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-teal-100/60 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Blood Glucose Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Monitor your daily readings, trends, and health statistics.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Readings</p>
              <p className="text-3xl font-extrabold text-slate-800 mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Glucose</p>
              <p className="text-3xl font-extrabold text-teal-600 mt-2">
                {stats.average !== null ? `${stats.average}` : '—'} <span className="text-sm font-normal text-slate-400">mg/dL</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Highest Reading</p>
              <p className="text-3xl font-extrabold text-rose-600 mt-2">
                {stats.highest !== null ? `${stats.highest}` : '—'} <span className="text-sm font-normal text-slate-400">mg/dL</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lowest Reading</p>
              <p className="text-3xl font-extrabold text-blue-600 mt-2">
                {stats.lowest !== null ? `${stats.lowest}` : '—'} <span className="text-sm font-normal text-slate-400">mg/dL</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Today's 4 Reading Slots Overview */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Today's Reading Slots ({new Date().toLocaleDateString()})</h2>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {todayReport?.count || 0} / 4 Recorded
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {slotsList.map((slotKey) => {
              const val = todayReadingsMap.get(slotKey);
              const hasVal = val !== undefined;
              const displayLabel = formatSlotLabel(slotKey);
              return (
                <div
                  key={slotKey}
                  className={`p-4 rounded-2xl border transition-all ${
                    hasVal ? 'bg-teal-50/40 border-teal-200' : 'bg-slate-50/50 border-slate-200 border-dashed'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-slate-600">{displayLabel}</span>
                    {hasVal ? (
                      <CheckCircle2 className="w-5 h-5 text-teal-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  {hasVal ? (
                    <div>
                      <span className="text-2xl font-extrabold text-teal-800">{val}</span>
                      <span className="text-xs text-teal-600 ml-1 font-medium">mg/dL</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 underline mt-2 block"
                    >
                      + Add reading
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart and Recent Readings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trend Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Glucose Trend Chart</h2>
            {chartData.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis domain={[40, 600]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                      formatter={(value: any) => [`${value} mg/dL`, 'Glucose']}
                    />
                    <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={3} dot={{ fill: '#0d9488', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
                <Activity className="w-8 h-8 opacity-40" />
                <p className="text-sm">No glucose readings available for chart.</p>
              </div>
            )}
          </div>

          {/* Recent Readings List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4 flex flex-col">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Recent Readings</h2>
              <a href="/readings" className="text-xs font-semibold text-teal-600 hover:underline">
                View all
              </a>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-72 pr-1">
              {readings.length > 0 ? (
                readings.slice(0, 5).map((r) => (
                  <div key={r.id} className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">{r.date}</p>
                      <p className="text-sm font-medium text-slate-800">{formatSlotLabel(r.slot)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-teal-700">{r.value}</span>
                      <span className="text-xs text-slate-400 ml-0.5">mg/dL</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-sm">No readings added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <ReadingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddReading}
        />
      </div>
    </Layout>
  );
}
