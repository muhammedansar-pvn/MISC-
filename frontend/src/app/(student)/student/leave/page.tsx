'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Search,
  AlertCircle,
  FileText,
  UserCheck,
  Calendar,
  Ban,
  ShieldAlert,
} from 'lucide-react';
import { getStudentLeaves } from '@/services/leave.service';
import { LeaveApplication, LeaveStatus } from '@/types';
import LeaveCalendar from '@/components/leaves/LeaveCalendar';

export default function StudentLeavePage() {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'CALENDAR' | 'LIST'>('CALENDAR');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LeaveStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  async function loadLeaves(isManualRefresh = false) {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const res = await getStudentLeaves();
      if (res.success && Array.isArray(res.data)) {
        setLeaves(res.data);
      } else {
        setLeaves([]);
      }
    } catch (err: any) {
      console.error('Failed to load leave applications:', err);
      setError(err?.message || 'Failed to load leave records. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadLeaves();
  }, []);

  const totalCount = leaves.length;
  const approvedCount = useMemo(
    () => leaves.filter((l) => l.status === 'APPROVED').length,
    [leaves]
  );
  const pendingCount = useMemo(
    () => leaves.filter((l) => l.status === 'PENDING').length,
    [leaves]
  );
  const rejectedCount = useMemo(
    () => leaves.filter((l) => l.status === 'REJECTED').length,
    [leaves]
  );

  const filteredLeaves = useMemo(() => {
    return leaves.filter((item) => {
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.reason.toLowerCase().includes(q) ||
        (item.reviewRemarks && item.reviewRemarks.toLowerCase().includes(q)) ||
        (typeof item.approvedBy === 'object' &&
          item.approvedBy?.nameEnglish &&
          item.approvedBy.nameEnglish.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [leaves, statusFilter, searchQuery]);

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

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    if (isNaN(s) || isNaN(e)) return '';
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? `${diff} day${diff > 1 ? 's' : ''}` : '1 day';
  };

  const renderStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Approved
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 mr-1 text-amber-600" /> Pending Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 mr-1 text-rose-600" /> Rejected
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <Ban className="w-3 h-3 mr-1 text-slate-500" /> Cancelled
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
            <span className="text-slate-900 font-semibold">Leaves</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#171D19]">
            Leave Records & Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            View submitted leave applications, track faculty approval progress, and review official remarks.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => loadLeaves(true)}
            disabled={loading || refreshing}
            className="p-2 rounded-lg border border-[#E3EAE5] bg-white text-slate-600 hover:text-[#23804A] hover:bg-slate-50 shadow-2xs transition-all disabled:opacity-50"
            title="Refresh leave requests"
            aria-label="Refresh leave requests"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#23804A]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Institutional Policy Notice */}
      <div className="p-4 rounded-xl bg-[#F0F7F6] border border-[#2F7C7A]/20 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#2F7C7A] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <span className="font-bold text-[#132238] block sm:inline mr-1">
            Institutional Leave Policy:
          </span>
          In accordance with institution rules, students cannot submit leave applications directly.
          All official leave requests must be submitted by a registered parent or guardian via the
          Parent Portal. You can monitor your leave records and faculty review status on this page.
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E3EAE5] shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Applications
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-[#171D19]">
            {loading ? '--' : totalCount}
          </p>
          <p className="text-xs text-slate-400">All submissions on record</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E3EAE5] shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Approved
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700">
            {loading ? '--' : approvedCount}
          </p>
          <p className="text-xs text-slate-400">Excused leave synced</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E3EAE5] shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Review
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-amber-700">
            {loading ? '--' : pendingCount}
          </p>
          <p className="text-xs text-slate-400">Awaiting faculty action</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E3EAE5] shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rejected
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-rose-700">
            {loading ? '--' : rejectedCount}
          </p>
          <p className="text-xs text-slate-400">Declined requests</p>
        </div>
      </div>

      {/* View Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="inline-flex rounded-xl border border-[#E3EAE5] bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('CALENDAR')}
            className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'CALENDAR'
                ? 'bg-[#132238] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('LIST')}
            className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'LIST'
                ? 'bg-[#132238] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>List & History ({leaves.length})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Excused attendance & leave record calendar</span>
        </div>
      </div>

      {/* Main Content: Calendar View vs List View */}
      {viewMode === 'CALENDAR' ? (
        <LeaveCalendar
          leaves={leaves}
          canApply={false}
        />
      ) : (
        /* Main List Section */
        <div className="bg-white rounded-xl border border-[#E3EAE5] shadow-2xs overflow-hidden">
          {/* Filter Controls */}
          <div className="p-5 border-b border-[#E3EAE5] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#171D19] flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#23804A]" />
                <span>Leave Application History</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review history and decision remarks from assigned Faculty.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search reason or remarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-[#E3EAE5] rounded-lg focus:outline-hidden focus:border-[#23804A] text-slate-800 placeholder-slate-400"
                />
              </div>

              <div className="inline-flex rounded-lg border border-[#E3EAE5] bg-slate-50 p-0.5 text-xs">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      statusFilter === st
                        ? 'bg-white text-[#171D19] shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {st === 'ALL'
                      ? 'All'
                      : st === 'PENDING'
                      ? 'Pending'
                      : st === 'APPROVED'
                      ? 'Approved'
                      : 'Rejected'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content States */}
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <div className="w-8 h-8 rounded-full border-2 border-[#23804A] border-t-transparent animate-spin mx-auto mb-3" />
              Loading leave applications...
            </div>
          ) : error ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Failed to load leave records</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
              <button
                onClick={() => loadLeaves(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#23804A] text-white hover:bg-[#1B6F41] transition-all"
              >
                Try Again
              </button>
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="p-12 sm:p-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No leave applications on record</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                In accordance with institutional guidelines, all student leave applications must be submitted by a registered parent or guardian through the Parent Portal.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredLeaves.map((leave) => {
                const approverName =
                  typeof leave.approvedBy === 'object' && leave.approvedBy
                    ? leave.approvedBy.nameEnglish || 'Assigned Usthad'
                    : null;

                return (
                  <div key={leave._id} className="p-5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {renderStatusBadge(leave.status)}
                          {leave.leaveType && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                              {leave.leaveType.replace('_', ' ')}
                            </span>
                          )}
                          <span className="text-xs font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {formatDate(leave.dateRange?.startDate)} — {formatDate(leave.dateRange?.endDate)}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            ({calculateDays(leave.dateRange?.startDate, leave.dateRange?.endDate)})
                          </span>
                        </div>

                        <div className="pt-1">
                          <p className="text-sm font-semibold text-slate-900 leading-snug">
                            {leave.reason}
                          </p>
                        </div>

                        {leave.reviewRemarks && (
                          <div className="mt-2 text-xs bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-slate-700">
                            <span className="font-semibold text-slate-900 block mb-0.5">Faculty Remarks:</span>
                            <p className="italic text-slate-600">{leave.reviewRemarks}</p>
                          </div>
                        )}
                      </div>

                      <div className="text-right sm:shrink-0 text-xs text-slate-500 space-y-1">
                        {approverName && (
                          <p className="flex items-center justify-end gap-1 text-slate-700 font-medium">
                            <UserCheck className="w-3.5 h-3.5 text-[#23804A]" />
                            Reviewed by: <span className="font-bold">{approverName}</span>
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400">
                          Applied: {formatDate(leave.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
