import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { getReport } from '../services/api';
import { ReportSummary } from '../types';
import { formatSlotLabel } from '../utils/formatters';
import { FileText, Calendar, TrendingUp, TrendingDown, Activity, AlertCircle, Award } from 'lucide-react';

type ReportType = 'daily' | 'mtd' | 'monthly';

export function Reports() {
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const data = await getReport(reportType, selectedDate);
      setReport(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType, selectedDate]);

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-teal-100/60 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Glucose Reports</h1>
            <p className="text-sm text-slate-500 mt-1">Analyze daily, month-to-date, and monthly blood glucose summaries.</p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200">
              <Calendar className="w-4 h-4 text-teal-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setReportType('daily')}
            className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
              reportType === 'daily'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            Daily Report
          </button>
          <button
            onClick={() => setReportType('mtd')}
            className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
              reportType === 'mtd'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            Month-to-Date (MTD)
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
              reportType === 'monthly'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            Monthly (Previous Month)
          </button>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Report Content */}
        {report && report.count > 0 ? (
          <div className="space-y-6">
            {/* Date Range Badge */}
            <div className="bg-teal-50/60 border border-teal-100 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-bold text-teal-900 uppercase">{reportType} Report</span>
              </div>
              <span className="text-sm font-semibold text-teal-700 bg-white px-3 py-1 rounded-xl shadow-xs border border-teal-200">
                Range: {report.dateRange}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Number of Readings</p>
                  <p className="text-3xl font-extrabold text-slate-800 mt-2">{report.count}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Reading</p>
                  <p className="text-3xl font-extrabold text-teal-600 mt-2">
                    {report.average} <span className="text-sm font-normal text-slate-400">mg/dL</span>
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
                    {report.highest} <span className="text-sm font-normal text-slate-400">mg/dL</span>
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
                    {report.lowest} <span className="text-sm font-normal text-slate-400">mg/dL</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <TrendingDown className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Individual Readings Table */}
            {report.readings && report.readings.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-lg text-slate-800">Readings Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6">Slot</th>
                        <th className="py-4 px-6">Value</th>
                        <th className="py-4 px-6">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {report.readings.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 font-medium text-slate-800">{r.date}</td>
                          <td className="py-4 px-6">
                            <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium border border-teal-100">
                              {formatSlotLabel(r.slot)}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-800">
                            {r.value} <span className="text-xs font-normal text-slate-400">mg/dL</span>
                          </td>
                          <td className="py-4 px-6 text-slate-500">{r.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Friendly Empty State */
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">No readings found</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                There are no recorded blood glucose readings for this report timeframe. Add readings to generate analytics.
              </p>
            </div>
            <a
              href="/readings"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-teal-600/20 transition-all"
            >
              Add Readings
            </a>
          </div>
        )}
      </div>
    </Layout>
  );
}
