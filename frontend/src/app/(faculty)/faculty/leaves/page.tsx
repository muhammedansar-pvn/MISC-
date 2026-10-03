'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { getLeaves, approveLeave, rejectLeave } from '@/services/leave.service';
import { LeaveApplication } from '@/types';
import {
  FileCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  User,
  Check,
  X,
  Search,
  Filter,
} from 'lucide-react';

function FacultyLeavesContent() {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [searchQuery, setSearchQuery] = useState('');

  // Review modal state
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadLeaves();
  }, [statusFilter]);

  async function loadLeaves() {
    try {
      setLoading(true);
      const params = statusFilter === 'ALL' ? {} : { status: statusFilter };
      const res = await getLeaves(params);
      if (res.success && Array.isArray(res.data)) {
        setLeaves(res.data);
      }
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenReview = (leave: LeaveApplication, action: 'APPROVE' | 'REJECT') => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setReviewRemarks('');
  };

  const handleConfirmReview = async () => {
    if (!selectedLeave || !reviewAction) return;

    try {
      setSubmittingReview(true);
      setSuccessMsg(null);
      setErrorMsg(null);

      let res;
      if (reviewAction === 'APPROVE') {
        res = await approveLeave(selectedLeave._id, reviewRemarks.trim());
      } else {
        res = await rejectLeave(selectedLeave._id, reviewRemarks.trim());
      }

      if (res.success) {
        setSuccessMsg(
          reviewAction === 'APPROVE'
            ? 'Leave approved successfully. Attendance has been marked as LEAVE for the scheduled periods.'
            : 'Leave application rejected.'
        );
        setSelectedLeave(null);
        setReviewAction(null);
        setTimeout(() => setSuccessMsg(null), 4000);
        await loadLeaves();
      } else {
        setErrorMsg(res.message || 'Failed to review leave application');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error processing leave review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredLeaves = leaves.filter((l) => {
    const student = l.studentId as any;
    const name = student?.nameEnglish || '';
    const regNo = student?.registrationNumber || '';
    const matchesSearch =
      !searchQuery ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.reason.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-12 bg-slate-200/70 animate-pulse rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200/70 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/faculty" className="hover:text-[#23804A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Leave Applications</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#171D19]">
            Student Leave Applications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review, approve, or reject student absence requests. Approved leaves automatically synchronize with attendance logs.
          </p>
        </div>

        <Link
          href="/faculty"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#23804A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-[#E3EAE5] shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leaves by student name, reg number, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#23804A]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-44 py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#23804A] bg-white text-slate-700 font-medium"
          >
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="ALL">All Applications</option>
          </select>
        </div>
      </div>

      {/* Leaves List */}
      <div className="space-y-4">
        {filteredLeaves.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-[#E3EAE5] space-y-2">
            <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No leave requests found</p>
            <p className="text-xs text-slate-400">
              There are currently no leave applications matching your selected criteria.
            </p>
          </div>
        ) : (
          filteredLeaves.map((leave) => {
            const student = leave.studentId as any;
            const appliedBy = leave.appliedBy as any;
            const isPending = leave.status === 'PENDING';

            return (
              <div
                key={leave._id}
                className="p-5 bg-white rounded-xl border border-[#E3EAE5] shadow-2xs space-y-3.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {student?.nameEnglish ? student.nameEnglish.charAt(0) : 'S'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-sm text-[#171D19]">
                          {student?.nameEnglish || 'Student'}
                        </h3>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                          {student?.registrationNumber || 'REG-NA'}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(leave.status)}`}>
                          {leave.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Applied by: <span className="text-slate-600 font-medium">{appliedBy?.name || 'Parent'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center space-x-4 text-xs font-semibold text-slate-700">
                    <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-[#23804A]" />
                      <span>
                        {new Date(leave.dateRange.startDate).toLocaleDateString()} – {new Date(leave.dateRange.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Reason for Absence:</span>
                  <p className="bg-slate-50/60 p-3 rounded-lg border border-slate-100 leading-relaxed font-medium">
                    {leave.reason}
                  </p>
                </div>

                {/* Action Buttons for Pending */}
                {isPending && (
                  <div className="flex items-center justify-end space-x-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenReview(leave, 'REJECT')}
                      className="inline-flex items-center px-3.5 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      <span>Reject</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenReview(leave, 'APPROVE')}
                      className="inline-flex items-center px-4 py-1.5 text-xs font-bold text-white bg-[#23804A] hover:bg-[#1B6F41] rounded-lg shadow-2xs transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      <span>Approve Leave</span>
                    </button>
                  </div>
                )}

                {/* Remarks if reviewed */}
                {leave.reviewRemarks && (
                  <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    Review remarks: <span className="font-medium text-slate-700">{leave.reviewRemarks}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      {selectedLeave && reviewAction && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-base text-[#171D19]">
              {reviewAction === 'APPROVE' ? 'Approve Leave Application' : 'Reject Leave Application'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {reviewAction === 'APPROVE'
                ? 'Approving this request will mark the student as LEAVE across all scheduled periods during the approved date range.'
                : 'Please specify the rationale or instructions for rejecting this absence request.'}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Review Remarks (Optional)
              </label>
              <textarea
                rows={3}
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                placeholder="Enter remarks or approval notes..."
                className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#23804A]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedLeave(null);
                  setReviewAction(null);
                }}
                disabled={submittingReview}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReview}
                disabled={submittingReview}
                className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-2xs transition-colors ${
                  reviewAction === 'APPROVE'
                    ? 'bg-[#23804A] hover:bg-[#1B6F41]'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {submittingReview
                  ? 'Submitting...'
                  : reviewAction === 'APPROVE'
                  ? 'Confirm Approval'
                  : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FacultyLeavesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 text-xs">
          Loading leave applications...
        </div>
      }
    >
      <FacultyLeavesContent />
    </Suspense>
  );
}
