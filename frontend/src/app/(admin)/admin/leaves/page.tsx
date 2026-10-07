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
  Check,
  X,
  Filter,
  GraduationCap,
  ShieldAlert,
} from 'lucide-react';
import { getLeaves, approveLeave, rejectLeave } from '@/services/leave.service';
import { LeaveApplication, LeaveStatus } from '@/types';

export default function AdminLeavesOversightPage() {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'ALL' | LeaveStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Review modal state
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);
  const [reviewErrorMsg, setReviewErrorMsg] = useState<string | null>(null);

  async function loadLeaves(isManual = false) {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const params: any = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      const res = await getLeaves(params);
      if (res.success && Array.isArray(res.data)) {
        setLeaves(res.data);
      } else {
        setLeaves([]);
      }
    } catch (err: any) {
      console.error('Failed to load leaves for admin:', err);
      setError(err?.message || 'Failed to load leave records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadLeaves();
  }, [statusFilter]);

  const handleOpenReview = (leave: LeaveApplication, action: 'APPROVE' | 'REJECT') => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setReviewRemarks('');
    setReviewErrorMsg(null);
  };

  const handleConfirmReview = async () => {
    if (!selectedLeave || !reviewAction) return;

    try {
      setSubmittingReview(true);
      setReviewErrorMsg(null);

      let res;
      if (reviewAction === 'APPROVE') {
        res = await approveLeave(selectedLeave._id, reviewRemarks.trim());
      } else {
        res = await rejectLeave(selectedLeave._id, reviewRemarks.trim());
      }

      if (res.success) {
        setReviewSuccessMsg(
          reviewAction === 'APPROVE'
            ? 'Leave request approved successfully. Attendance records synced.'
            : 'Leave request rejected.'
        );
        setSelectedLeave(null);
        setReviewAction(null);
        setTimeout(() => setReviewSuccessMsg(null), 4000);
        await loadLeaves();
      } else {
        setReviewErrorMsg(res.message || 'Failed to update leave request.');
      }
    } catch (err: any) {
      setReviewErrorMsg(err?.response?.data?.message || err?.message || 'Error processing review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredLeaves = useMemo(() => {
    return leaves.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const studentObj = typeof item.studentId === 'object' ? item.studentId : null;
      const studentName = studentObj?.nameEnglish || '';
      const regNo = studentObj?.registrationNumber || '';

      const matchesSearch =
        !q ||
        item.reason.toLowerCase().includes(q) ||
        studentName.toLowerCase().includes(q) ||
        regNo.toLowerCase().includes(q) ||
        (item.reviewRemarks && item.reviewRemarks.toLowerCase().includes(q));

      return matchesSearch;
    });
  }, [leaves, searchQuery]);

  const totalCount = leaves.length;
  const approvedCount = useMemo(() => leaves.filter((l) => l.status === 'APPROVED').length, [leaves]);
  const pendingCount = useMemo(() => leaves.filter((l) => l.status === 'PENDING').length, [leaves]);
  const rejectedCount = useMemo(() => leaves.filter((l) => l.status === 'REJECTED').length, [leaves]);

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
            <Link href="/admin" className="hover:text-[#132238] transition-colors">
              Admin
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Leave Oversight</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Institution Leave Management & Oversight
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Monitor and oversee student leave applications across all academic batches, classes, and sections.
          </p>
        </div>

        <button
          onClick={() => loadLeaves(true)}
          disabled={loading || refreshing}
          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#132238] hover:bg-slate-50 shadow-2xs transition-all disabled:opacity-50 self-start sm:self-auto"
          title="Refresh leave requests"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#2F7C7A]' : ''}`} />
        </button>
      </div>

      {/* Review Success Banner */}
      {reviewSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{reviewSuccessMsg}</span>
          </div>
          <button onClick={() => setReviewSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Applications
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-[#132238]">
            {loading ? '--' : totalCount}
          </p>
          <p className="text-xs text-slate-400">Institution-wide requests</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
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
          <p className="text-xs text-slate-400">Awaiting faculty or admin action</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
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
          <p className="text-xs text-slate-400">Excused attendance synced</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
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
          <p className="text-xs text-slate-400">Declined leave requests</p>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Controls */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#132238] flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#2F7C7A]" />
              <span>Leave Applications</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review history, student details, and administrative remarks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student, reg no, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] text-slate-800 placeholder-slate-400 w-64"
              />
            </div>

            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-white text-[#132238] shadow-2xs'
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
            <div className="w-8 h-8 rounded-full border-2 border-[#2F7C7A] border-t-transparent animate-spin mx-auto mb-3" />
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
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#2F7C7A] text-white hover:bg-[#256361] transition-all"
            >
              Try Again
            </button>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="p-12 sm:p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No leave applications found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              There are currently no leave applications matching the selected filter criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLeaves.map((leave) => {
              const studentObj = typeof leave.studentId === 'object' ? leave.studentId : null;
              const studentName = studentObj?.nameEnglish || 'Student';
              const regNo = studentObj?.registrationNumber || '';
              const approverName =
                typeof leave.approvedBy === 'object' && leave.approvedBy
                  ? leave.approvedBy.nameEnglish || 'Staff Reviewer'
                  : null;

              return (
                <div key={leave._id} className="p-5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {renderStatusBadge(leave.status)}
                        <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-600" />
                          {studentName} {regNo && <span className="font-mono text-slate-500">({regNo})</span>}
                        </span>
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
                          <span className="font-semibold text-slate-900 block mb-0.5">Review Remarks:</span>
                          <p className="italic text-slate-600">{leave.reviewRemarks}</p>
                        </div>
                      )}
                    </div>

                    <div className="text-right sm:shrink-0 flex flex-col items-end space-y-2">
                      <div className="text-xs text-slate-500 space-y-0.5">
                        {approverName && (
                          <p className="flex items-center justify-end gap-1 text-slate-700 font-medium">
                            <UserCheck className="w-3.5 h-3.5 text-[#2F7C7A]" />
                            Reviewed by: <span className="font-bold">{approverName}</span>
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400">
                          Applied: {formatDate(leave.createdAt)}
                        </p>
                      </div>

                      {leave.status === 'PENDING' && (
                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            onClick={() => handleOpenReview(leave, 'APPROVE')}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-all"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleOpenReview(leave, 'REJECT')}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs transition-all"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Confirmation Modal */}
      {selectedLeave && reviewAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F8FAF9]">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    reviewAction === 'APPROVE'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {reviewAction === 'APPROVE' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#132238]">
                    {reviewAction === 'APPROVE' ? 'Approve Leave Request' : 'Reject Leave Request'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Administrative Action
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedLeave(null);
                  setReviewAction(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {reviewErrorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{reviewErrorMsg}</span>
                </div>
              )}

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p>
                  <span className="font-semibold text-slate-800">Student: </span>
                  {typeof selectedLeave.studentId === 'object'
                    ? selectedLeave.studentId?.nameEnglish
                    : 'Student'}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Period: </span>
                  {formatDate(selectedLeave.dateRange?.startDate)} to{' '}
                  {formatDate(selectedLeave.dateRange?.endDate)} (
                  {calculateDays(selectedLeave.dateRange?.startDate, selectedLeave.dateRange?.endDate)})
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Reason: </span>
                  {selectedLeave.reason}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrative Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter remarks or instructions for the student/parent..."
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] text-slate-800 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLeave(null);
                    setReviewAction(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReview}
                  disabled={submittingReview}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all ${
                    reviewAction === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submittingReview ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full mr-1.5" />
                      Processing...
                    </>
                  ) : reviewAction === 'APPROVE' ? (
                    'Confirm Approval'
                  ) : (
                    'Confirm Rejection'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
