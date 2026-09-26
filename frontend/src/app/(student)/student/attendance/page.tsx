'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Fingerprint,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Info,
  Layers,
  CalendarDays,
  History,
  ShieldCheck,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  getStudentAttendanceOverview,
  getStudentMonthlyAttendance,
  getStudentAttendanceHistory,
} from '@/services/attendance.service';
import {
  AttendanceOverview,
  AttendanceSessionRecord,
  SubjectAttendance,
  MonthlyAttendanceHistory,
} from '@/types';

// Generate recent 12 months for selector
function getRecentMonths() {
  const months: { label: string; value: string }[] = [];
  const date = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    months.push({ label, value });
  }
  return months;
}

export default function StudentAttendancePage() {
  const monthOptions = useMemo(() => getRecentMonths(), []);
  const [selectedMonth, setSelectedMonth] = useState<string>(monthOptions[0]?.value || '');

  // API states
  const [overview, setOverview] = useState<AttendanceOverview | null>(null);
  const [sessionRecords, setSessionRecords] = useState<AttendanceSessionRecord[]>([]);
  const [subjectAttendances, setSubjectAttendances] = useState<SubjectAttendance[]>([]);
  const [historyRecords, setHistoryRecords] = useState<MonthlyAttendanceHistory[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state for daily session table
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'LATE'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch Attendance Data
  async function loadAttendanceData(month: string, isManualRefresh = false) {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Attempt to load from service endpoints
      const [overviewRes, monthlyRes, historyRes] = await Promise.allSettled([
        getStudentAttendanceOverview(),
        getStudentMonthlyAttendance({ month }),
        getStudentAttendanceHistory(),
      ]);

      // Process Overview
      if (overviewRes.status === 'fulfilled' && overviewRes.value.success && overviewRes.value.data) {
        setOverview(overviewRes.value.data);
      } else {
        setOverview(null);
      }

      // Process Monthly Sessions & Subjects
      if (monthlyRes.status === 'fulfilled' && monthlyRes.value.success && monthlyRes.value.data) {
        const monthlyData = monthlyRes.value.data;
        setSessionRecords(Array.isArray(monthlyData.records) ? monthlyData.records : []);
        setSubjectAttendances(Array.isArray(monthlyData.subjects) ? monthlyData.subjects : []);

        // Fallback to monthly overview if general overview was missing
        if (!overview && monthlyData.overview) {
          setOverview(monthlyData.overview);
        }
      } else {
        setSessionRecords([]);
        setSubjectAttendances([]);
      }

      // Process History
      if (historyRes.status === 'fulfilled' && historyRes.value.success && Array.isArray(historyRes.value.data)) {
        setHistoryRecords(historyRes.value.data);
      } else {
        setHistoryRecords([]);
      }
    } catch (err: any) {
      console.warn('Attendance sync service currently unavailable:', err?.message || err);
      // Clean fallback: clear to empty state per specification (no fake data)
      setOverview(null);
      setSessionRecords([]);
      setSubjectAttendances([]);
      setHistoryRecords([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAttendanceData(selectedMonth);
  }, [selectedMonth]);

  // Filtered session records
  const filteredRecords = useMemo(() => {
    return sessionRecords.filter((record) => {
      const matchesStatus = statusFilter === 'ALL' || record.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        record.session.toLowerCase().includes(q) ||
        (record.subject && record.subject.toLowerCase().includes(q)) ||
        record.date.toLowerCase().includes(q) ||
        record.day.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [sessionRecords, statusFilter, searchQuery]);

  // Helper for attendance status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Present
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 mr-1 text-rose-600" /> Absent
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 mr-1 text-amber-600" /> Late
          </span>
        );
      case 'LEAVE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CalendarDays className="w-3 h-3 mr-1 text-blue-600" /> Approved Leave
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const selectedMonthLabel =
    monthOptions.find((m) => m.value === selectedMonth)?.label || selectedMonth;

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/student" className="hover:text-[#2F7C7A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Attendance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Attendance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            View your attendance records synced from the biometric attendance system.
          </p>
        </div>

        {/* Month Selector & Action */}
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="py-2 pl-3 pr-8 text-xs font-semibold text-slate-800 bg-white border border-[#E2E8E0] rounded-lg shadow-2xs focus:outline-hidden focus:border-[#2F7C7A] appearance-none cursor-pointer"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => loadAttendanceData(selectedMonth, true)}
            disabled={loading || refreshing}
            className="p-2 rounded-lg border border-[#E2E8E0] bg-white text-slate-600 hover:text-[#2F7C7A] hover:bg-slate-50 shadow-2xs transition-all disabled:opacity-50"
            title="Refresh records from biometric sync"
            aria-label="Refresh attendance"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#2F7C7A]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Biometric Information Banner */}
      <div className="bg-white rounded-xl border border-[#E2E8E0] p-5 shadow-2xs">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center shrink-0 border border-[#2F7C7A]/20">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-[#132238]">
                Attendance is automatically recorded
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Biometric Sync
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Attendance records are captured automatically from the institution's biometric fingerprint terminals at campus entry and scheduled class periods. Manual check-ins, student submissions, and self-marking are disabled to preserve academic audit compliance.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Attendance Overview (Four Summary Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Attendance */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overall Attendance
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center">
              <Fingerprint className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#132238]">
              {loading ? (
                <span className="text-slate-300">...</span>
              ) : overview?.overallPercentage != null ? (
                `${overview.overallPercentage}%`
              ) : (
                '--'
              )}
            </span>
            {overview?.overallPercentage != null && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  overview.overallPercentage >= 85
                    ? 'bg-emerald-100 text-emerald-800'
                    : overview.overallPercentage >= 75
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {overview.overallPercentage >= 85 ? 'Good' : overview.overallPercentage >= 75 ? 'Caution' : 'Low'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {overview?.totalDays ? `${overview.totalDays} sessions evaluated` : 'Biometric cumulative aggregate'}
          </p>
        </div>

        {/* Present */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Present
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700">
            {loading ? (
              <span className="text-slate-300">...</span>
            ) : overview?.presentDays != null ? (
              overview.presentDays
            ) : (
              '--'
            )}
          </div>
          <p className="text-xs text-slate-400">Verified biometric check-ins</p>
        </div>

        {/* Absent */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Absent
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-700">
            {loading ? (
              <span className="text-slate-300">...</span>
            ) : overview?.absentDays != null ? (
              overview.absentDays
            ) : (
              '--'
            )}
          </div>
          <p className="text-xs text-slate-400">Unrecorded / missing punches</p>
        </div>

        {/* Late */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Late
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-700">
            {loading ? (
              <span className="text-slate-300">...</span>
            ) : overview?.lateDays != null ? (
              overview.lateDays
            ) : (
              '--'
            )}
          </div>
          <p className="text-xs text-slate-400">Logged after period threshold</p>
        </div>
      </div>

      {/* 4. Monthly Attendance: Daily Attendance Table & Session-wise Records */}
      <div className="bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-5 border-b border-[#E2E8E0] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-4 h-4 text-[#2F7C7A]" />
              <h2 className="text-base font-bold text-[#132238]">
                Daily Session Attendance ({selectedMonthLabel})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Period-wise biometric scan logs recorded across academic working days.
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search date or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-[#E2E8E0] rounded-lg focus:outline-hidden focus:border-[#2F7C7A] text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="inline-flex rounded-lg border border-[#E2E8E0] bg-slate-50 p-0.5 text-xs">
              {(['ALL', 'PRESENT', 'ABSENT', 'LATE'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-white text-[#132238] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'PRESENT' ? 'Present' : st === 'ABSENT' ? 'Absent' : 'Late'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Section: Table or Specified Empty State */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <div className="w-8 h-8 rounded-full border-2 border-[#2F7C7A] border-t-transparent animate-spin mx-auto mb-3" />
            Loading biometric session records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 sm:p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
              <Fingerprint className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Attendance data not available yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Your attendance records will appear automatically after biometric attendance synchronization.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8E0] text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Day</th>
                  <th className="p-3.5">Session / Period</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Scan Time</th>
                  <th className="p-3.5 text-right">Terminal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-mono font-medium text-slate-900">
                      {rec.date}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {rec.day}
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">
                      {rec.session}
                    </td>
                    <td className="p-3.5 text-slate-700 font-semibold">
                      {rec.subject || 'General Session'}
                    </td>
                    <td className="p-3.5">
                      {renderStatusBadge(rec.status)}
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">
                      {rec.time || '--'}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-400 text-right">
                      {rec.device || 'Biometric Terminal'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Subject-wise Attendance Breakdown */}
      <div className="bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#E2E8E0]">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#2F7C7A]" />
            <h2 className="text-base font-bold text-[#132238]">
              Subject-wise Attendance
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown of biometric attendance tracked across individual curriculum subjects.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Loading subject breakdowns...
          </div>
        ) : subjectAttendances.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Layers className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No subject attendance recorded yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Subject-specific biometric analytics will appear here as subject periods are synchronized.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8E0] text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5 text-center">Total Sessions</th>
                  <th className="p-3.5 text-center">Present</th>
                  <th className="p-3.5 text-center">Absent</th>
                  <th className="p-3.5 text-center">Late</th>
                  <th className="p-3.5 text-right">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjectAttendances.map((sub, idx) => (
                  <tr key={sub.subjectId || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{sub.subjectName}</p>
                      {sub.subjectCode && (
                        <span className="font-mono text-[10px] text-slate-400">{sub.subjectCode}</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-center text-slate-700">
                      {sub.totalSessions}
                    </td>
                    <td className="p-3.5 font-mono text-center text-emerald-700 font-semibold">
                      {sub.presentCount}
                    </td>
                    <td className="p-3.5 font-mono text-center text-rose-700 font-semibold">
                      {sub.absentCount}
                    </td>
                    <td className="p-3.5 font-mono text-center text-amber-700 font-semibold">
                      {sub.lateCount}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900">
                          {sub.attendancePercentage != null ? `${sub.attendancePercentage}%` : '--'}
                        </span>
                        {sub.attendancePercentage != null && (
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                sub.attendancePercentage >= 85
                                  ? 'bg-emerald-500'
                                  : sub.attendancePercentage >= 75
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, sub.attendancePercentage))}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Attendance History */}
      <div className="bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#E2E8E0]">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-[#2F7C7A]" />
            <h2 className="text-base font-bold text-[#132238]">
              Attendance History
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidated monthly historical records stored in the academic registry.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Loading attendance history...
          </div>
        ) : historyRecords.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <History className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No historical records available</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Monthly historical summaries will be automatically compiled at the close of each academic billing/session cycle.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8E0] text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Month</th>
                  <th className="p-3.5 text-center">Sessions</th>
                  <th className="p-3.5 text-center">Present</th>
                  <th className="p-3.5 text-center">Absent</th>
                  <th className="p-3.5 text-center">Late</th>
                  <th className="p-3.5 text-right">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyRecords.map((hist, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">
                      {hist.month}
                    </td>
                    <td className="p-3.5 font-mono text-center text-slate-700">
                      {hist.totalSessions}
                    </td>
                    <td className="p-3.5 font-mono text-center text-emerald-700">
                      {hist.presentCount}
                    </td>
                    <td className="p-3.5 font-mono text-center text-rose-700">
                      {hist.absentCount}
                    </td>
                    <td className="p-3.5 font-mono text-center text-amber-700">
                      {hist.lateCount}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-right text-slate-900">
                      {hist.attendancePercentage != null ? `${hist.attendancePercentage}%` : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 7. Information Footer */}
      <div className="p-5 rounded-xl bg-slate-50 border border-[#E2E8E0] text-xs text-slate-600 flex flex-col sm:flex-row items-start gap-4">
        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-[#2F7C7A] flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-slate-800">
            Institutional Biometric Policy & Discrepancy Reporting
          </h4>
          <p className="text-slate-500 leading-relaxed">
            Attendance data is retrieved directly from campus biometric fingerprint scanners. If an official class presence was not captured due to a device synchronization latency, medical leave, or scheduled institutional duty, please reach out to your designated class mentor (Usthad) or the Markaz Sanaviyya Academic Administration for manual review and reconciliation.
          </p>
        </div>
      </div>
    </div>
  );
}
