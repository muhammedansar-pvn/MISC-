'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getAssignments,
  submitAssignment,
  AssignmentItem,
  AssignmentSubmissionItem,
} from '@/services/assignment.service';
import { getStudentProfile } from '@/services/student.service';
import { StudentProfile } from '@/types';
import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  ExternalLink,
  Download,
  Building2,
  Lock,
  ArrowRight,
  Filter,
} from 'lucide-react';

export default function StudentAssignmentsPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PENDING' | 'SUBMITTED' | 'GRADED'>('ALL');

  // Submit Modal state
  const [activeAssignmentForSubmit, setActiveAssignmentForSubmit] = useState<AssignmentItem | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionLink, setSubmissionLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, asgnRes] = await Promise.allSettled([
        getStudentProfile(),
        getAssignments(),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value.success && profileRes.value.data) {
        setProfile(profileRes.value.data);
      }

      if (asgnRes.status === 'fulfilled' && asgnRes.value.success && Array.isArray(asgnRes.value.data)) {
        setAssignments(asgnRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load student assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenSubmitModal = (asgn: AssignmentItem) => {
    setActiveAssignmentForSubmit(asgn);
    setSubmissionFile(null);
    setSubmissionLink(asgn.mySubmission?.link || '');
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignmentForSubmit) return;

    if (!submissionFile && !submissionLink.trim()) {
      setSubmitError('Please provide either a file upload or a submission link.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const formData = new FormData();
      if (submissionFile) {
        formData.append('file', submissionFile);
      }
      if (submissionLink.trim()) {
        formData.append('link', submissionLink.trim());
      }

      const res = await submitAssignment(activeAssignmentForSubmit._id, formData);
      if (res.success) {
        setSubmitSuccess('Homework submitted successfully!');
        setTimeout(() => {
          setActiveAssignmentForSubmit(null);
          loadData();
        }, 1200);
      } else {
        setSubmitError(res.message || 'Failed to submit assignment');
      }
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || err.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter((asgn) => {
    const sub = asgn.mySubmission;
    if (selectedFilter === 'PENDING') return !sub || sub.status === 'PENDING';
    if (selectedFilter === 'SUBMITTED') return sub && (sub.status === 'SUBMITTED' || sub.status === 'LATE');
    if (selectedFilter === 'GRADED') return sub && sub.status === 'GRADED';
    return true;
  });

  const pendingCount = assignments.filter((a) => !a.mySubmission || a.mySubmission.status === 'PENDING').length;
  const gradedCount = assignments.filter((a) => a.mySubmission?.status === 'GRADED').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-28 bg-slate-200/70 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-slate-200/70 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const enrolledClass = profile?.classId as any;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/student" className="hover:text-[#2F7C7A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Assignments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238] flex items-center gap-2">
            <Award className="w-7 h-7 text-[#2F7C7A]" />
            Homework & Assignments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official class homework tasks, submission tracking, and teacher evaluations.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            {pendingCount} Pending
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            {gradedCount} Evaluated
          </span>
        </div>
      </div>

      {/* Program Context Banner */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Enrolled Class Cohort</p>
            <h2 className="text-base font-bold text-[#132238]">
              {enrolledClass?.name || 'Sanaviyya Standard'}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'PENDING', 'SUBMITTED', 'GRADED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFilter === tab
                  ? 'bg-[#2F7C7A] text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab === 'ALL'
                ? `All (${assignments.length})`
                : tab === 'PENDING'
                ? `Pending (${pendingCount})`
                : tab === 'SUBMITTED'
                ? `Submitted (${assignments.length - pendingCount - gradedCount})`
                : `Graded (${gradedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E2E8E0] space-y-3">
          <Award className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-base font-bold text-slate-700">No Assignments in this category</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You are all caught up! No homework or tasks currently match your selected filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAssignments.map((asgn) => {
            const isOverdue = new Date(asgn.dueDate) < new Date();
            const sub = asgn.mySubmission;
            const isGraded = sub?.status === 'GRADED';
            const isSubmitted = sub && (sub.status === 'SUBMITTED' || sub.status === 'LATE');
            const maxMarks = asgn.maxMarks || 100;

            return (
              <div
                key={asgn._id}
                className="bg-white rounded-2xl border border-[#E2E8E0] p-5 shadow-2xs hover:border-[#2F7C7A] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Tags */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {asgn.subjectId?.name || asgn.subjectId?.subjectName || 'Subject'}
                      </span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        Max: {maxMarks} Marks
                      </span>
                    </div>

                    {isGraded ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Graded
                      </span>
                    ) : isSubmitted ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> {sub.status === 'LATE' ? 'Submitted Late' : 'Submitted'}
                      </span>
                    ) : isOverdue ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertCircle className="w-3 h-3 mr-1" /> Overdue
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3 mr-1" /> Pending
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-base text-[#132238]">{asgn.title}</h3>
                    {asgn.description && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-3">
                        {asgn.description}
                      </p>
                    )}
                  </div>

                  {/* Teacher & Attachments */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Teacher:</span>
                      <span className="font-semibold text-slate-800">{asgn.facultyId?.nameEnglish || 'Usthad'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Due Date:</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {new Date(asgn.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {asgn.attachments && asgn.attachments.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                          Teacher Reference Materials:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {asgn.attachments.map((att, idx) => (
                            <a
                              key={idx}
                              href={att.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 py-1 rounded bg-white border border-slate-200 hover:border-[#2F7C7A] text-[11px] font-medium text-slate-700 transition-all"
                            >
                              <Download className="w-3 h-3 mr-1 text-[#2F7C7A]" />
                              <span className="truncate max-w-[140px]">{att.fileName}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* If Graded: Scorecard Box */}
                  {isGraded && (
                    <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-emerald-900">Score Awarded</span>
                        <span className="text-base font-bold text-emerald-800 font-mono">
                          {sub.marks} <span className="text-xs text-emerald-600 font-normal">/ {maxMarks}</span>
                        </span>
                      </div>
                      {sub.feedback && (
                        <p className="text-xs text-emerald-950 italic border-t border-emerald-200/60 pt-1.5">
                          &ldquo;{sub.feedback}&rdquo;
                        </p>
                      )}
                      {sub.gradedBy && (
                        <p className="text-[10px] text-emerald-700">
                          Evaluated by {sub.gradedBy.nameEnglish || 'Usthad'} on {sub.gradedAt ? new Date(sub.gradedAt).toLocaleDateString('en-GB') : 'Recorded'}
                        </p>
                      )}
                    </div>
                  )}

                  {/* If Submitted: Submission Info */}
                  {isSubmitted && !isGraded && (
                    <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 space-y-1 text-xs">
                      <p className="text-blue-900 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        Submitted on {new Date(sub.submittedAt).toLocaleDateString('en-GB')} at {new Date(sub.submittedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {sub.submittedFile?.fileName && (
                        <a
                          href={sub.submittedFile.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-700 hover:underline inline-flex items-center mt-1"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" /> View My File ({sub.submittedFile.fileName})
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {isGraded ? (
                    <div className="flex items-center text-xs text-slate-400 space-x-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Evaluated & Locked</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenSubmitModal(asgn)}
                      className="inline-flex items-center px-4 py-2 rounded-xl bg-[#2F7C7A] hover:bg-[#286b69] text-white text-xs font-bold shadow-2xs transition-all w-full justify-center"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      {isSubmitted ? 'Revise Submission' : 'Submit Homework'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Assignment Modal */}
      {activeAssignmentForSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base font-serif text-[#132238] flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#2F7C7A]" /> Submit Assignment
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeAssignmentForSubmit.title}
                </p>
              </div>
              <button
                onClick={() => setActiveAssignmentForSubmit(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                {submitSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Upload Answer File (PDF, Word Document, Image)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSubmissionFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#E6F2F1] file:text-[#2F7C7A] hover:file:bg-teal-100"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Supported formats: PDF, DOCX, TXT, PNG, JPG (Max 25MB).
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Or Submission URL / Reference Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#2F7C7A]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveAssignmentForSubmit(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#2F7C7A] hover:bg-[#286b69] text-white text-xs font-bold shadow-2xs disabled:opacity-50"
                >
                  {submitting ? 'Uploading Work...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
