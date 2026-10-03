'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Scale,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  AlertCircle,
  FileCheck2,
  Info,
} from 'lucide-react';
import { getMyDisciplineRecords } from '@/services/discipline.service';
import { DisciplineRecord, DisciplineSeverity } from '@/types';

export default function StudentDisciplinePage() {
  const [records, setRecords] = useState<DisciplineRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'RESOLVED' | 'PENDING'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  async function loadRecords(isManualRefresh = false) {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const res = await getMyDisciplineRecords();
      if (res.success && Array.isArray(res.data)) {
        setRecords(res.data);
      } else {
        setRecords([]);
      }
    } catch (err: any) {
      console.error('Failed to load discipline records:', err);
      setError(err?.message || 'Failed to retrieve conduct records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  const totalRecords = records.length;
  const resolvedCount = useMemo(() => records.filter((r) => r.resolved).length, [records]);
  const activeCount = useMemo(() => records.filter((r) => !r.resolved).length, [records]);
  const totalDemerits = useMemo(
    () => records.reduce((sum, r) => sum + (r.demeritPoints || 0), 0),
    [records]
  );

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'RESOLVED' && r.resolved) ||
        (statusFilter === 'PENDING' && !r.resolved);
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.incidentType.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.actionTaken && r.actionTaken.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [records, statusFilter, searchQuery]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '--';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderSeverityBadge = (severity: DisciplineSeverity) => {
    switch (severity) {
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">
            Low
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Medium
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            High
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Critical
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
            {severity}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/student" className="hover:text-[#23804A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Conduct</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#171D19]">
            Conduct & Discipline Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Official institutional conduct registry records, review statuses, and resolution notes.
          </p>
        </div>

        <button
          onClick={() => loadRecords(true)}
          disabled={loading || refreshing}
          className="p-2 rounded-lg border border-[#E3EAE5] bg-white text-slate-600 hover:text-[#23804A] hover:bg-slate-50 shadow-2xs transition-all disabled:opacity-50 self-start sm:self-auto"
          title="Refresh conduct records"
          aria-label="Refresh conduct records"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#23804A]' : ''}`} />
        </button>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Records */}
        <div className="bg-white p-5 rounded-xl border border-[#E3EAE5] shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Recorded Entries
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-[#171D19]">
            {loading ? '--' : totalRecords}
          </p>
          <p className="text-xs text-slate-400">Total incidents evaluated</p>
        </div>

        {/* Resolved Status */}
        <div className="bg-white p-5 rounded-xl border border-[#E3EAE5] shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Resolved Cases
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-700">
            {loading ? '--' : resolvedCount}
          </p>
          <p className="text-xs text-slate-400">{activeCount} pending faculty resolution</p>
        </div>

        {/* Cumulative Demerit Points */}
        <div className="bg-white p-5 rounded-xl border border-[#E3EAE5] shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Demerit Deductions
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-amber-700">
            {loading ? '--' : totalDemerits}
          </p>
          <p className="text-xs text-slate-400">Total points applied to conduct score</p>
        </div>
      </div>

      {/* Main Records Section */}
      <div className="bg-white rounded-xl border border-[#E3EAE5] shadow-2xs overflow-hidden">
        {/* Table / Controls Header */}
        <div className="p-5 border-b border-[#E3EAE5] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#171D19] flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-[#23804A]" />
              <span>Incident Registry & Action Logs</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical conduct logs recorded by the disciplinary committee and class teachers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search incident type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-[#E3EAE5] rounded-lg focus:outline-hidden focus:border-[#23804A] text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="inline-flex rounded-lg border border-[#E3EAE5] bg-slate-50 p-0.5 text-xs">
              {(['ALL', 'PENDING', 'RESOLVED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-white text-[#171D19] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'PENDING' ? 'Under Review' : 'Resolved'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <div className="w-8 h-8 rounded-full border-2 border-[#23804A] border-t-transparent animate-spin mx-auto mb-3" />
            Loading conduct records...
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Unable to retrieve records</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => loadRecords(true)}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#23804A] text-white hover:bg-[#1B6F41] transition-all"
            >
              Retry
            </button>
          </div>
        ) : filteredRecords.length === 0 ? (
          /* Empty State */
          <div className="p-12 sm:p-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#171D19]">No disciplinary records found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Your institutional conduct record is clean with no disciplinary incidents logged. Maintain your commitment to campus regulations and Islamic decorum.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E3EAE5] text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Incident Type</th>
                  <th className="p-3.5 text-center">Severity</th>
                  <th className="p-3.5 text-center">Demerits</th>
                  <th className="p-3.5">Resolution Status</th>
                  <th className="p-3.5">Action / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-mono text-slate-700 whitespace-nowrap">
                      {formatDate(item.incidentDate)}
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-slate-900">{item.incidentType}</p>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      {renderSeverityBadge(item.severity)}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-slate-700 whitespace-nowrap">
                      {item.demeritPoints > 0 ? (
                        <span className="text-amber-700">-{item.demeritPoints} pts</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {item.resolved ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 mr-1 text-amber-600" /> Under Review
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {item.resolutionRemarks ? (
                        <span className="text-slate-800">{item.resolutionRemarks}</span>
                      ) : item.actionTaken ? (
                        <span>{item.actionTaken}</span>
                      ) : (
                        <span className="text-slate-400 italic">No remarks recorded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Advisory Footer */}
      <div className="p-5 rounded-xl bg-slate-50 border border-[#E3EAE5] text-xs text-slate-600 flex items-start gap-4">
        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-[#23804A] flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-slate-800">
            Markaz Sanaviyya Code of Conduct & Inquiry Rights
          </h4>
          <p className="text-slate-500 leading-relaxed">
            All records in this registry are logged by designated faculty and reviewed by the institutional discipline committee. If you believe an entry requires clarification or resolution review, schedule a consultation with your assigned Usthad or class teacher.
          </p>
        </div>
      </div>
    </div>
  );
}
