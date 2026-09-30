'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  getFacultyExamSchedules,
  getExamScheduleRoster,
  submitRosterMarks,
  createMarkCorrectionRequest,
  ExamScheduleRosterResponse,
} from '@/services/exam.service';
import { ExamSchedule } from '@/types';
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Save,
  ArrowLeft,
  Users,
  Award,
  TrendingUp,
  FileCheck,
  ShieldAlert,
  Send,
} from 'lucide-react';

interface RosterRowState {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  admissionNumber: string;
  markEntryId: string | null;
  marksObtained: string;
  isAbsent: boolean;
  status: 'NOT_ENTERED' | 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'PUBLISHED';
  remarks: string;
}

function FacultyMarksContent() {
  const searchParams = useSearchParams();
  const initialScheduleId = searchParams?.get('examScheduleId') || '';

  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(initialScheduleId);
  const [rosterData, setRosterData] = useState<ExamScheduleRosterResponse | null>(null);
  const [rows, setRows] = useState<RosterRowState[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Correction request modal state
  const [correctionTarget, setCorrectionTarget] = useState<RosterRowState | null>(null);
  const [correctionNewMarks, setCorrectionNewMarks] = useState<string>('');
  const [correctionReason, setCorrectionReason] = useState<string>('');
  const [submittingCorrection, setSubmittingCorrection] = useState(false);

  // Initial load: Fetch only schedules assigned to this faculty
  useEffect(() => {
    async function loadFacultySchedules() {
      try {
        setLoading(true);
        const res = await getFacultyExamSchedules();
        if (res.success && Array.isArray(res.data)) {
          setSchedules(res.data);
          if (initialScheduleId) {
            const match = res.data.find((s) => s._id === initialScheduleId);
            if (match) setSelectedScheduleId(initialScheduleId);
            else if (res.data.length > 0) setSelectedScheduleId(res.data[0]._id);
          } else if (res.data.length > 0) {
            setSelectedScheduleId(res.data[0]._id);
          }
        }
      } catch (err: any) {
        console.error('Failed to load faculty schedules:', err);
        setErrorMsg('Failed to load your assigned examination schedules.');
      } finally {
        setLoading(false);
      }
    }

    loadFacultySchedules();
  }, [initialScheduleId]);

  // Load roster when schedule changes
  useEffect(() => {
    if (!selectedScheduleId) {
      setRosterData(null);
      setRows([]);
      return;
    }

    async function loadRoster() {
      try {
        setLoadingRoster(true);
        setErrorMsg(null);
        setSuccessMsg(null);
        const res = await getExamScheduleRoster(selectedScheduleId);
        if (res.success && res.data) {
          setRosterData(res.data);
          setRows(
            res.data.roster.map((r) => ({
              studentId: r.studentId,
              studentName: r.studentName,
              registrationNumber: r.registrationNumber,
              admissionNumber: r.admissionNumber,
              markEntryId: r.markEntryId,
              marksObtained: r.marksObtained !== null && r.marksObtained !== undefined ? r.marksObtained.toString() : '',
              isAbsent: r.isAbsent,
              status: r.status,
              remarks: r.remarks || '',
            }))
          );
        }
      } catch (err: any) {
        console.error('Failed to load schedule roster:', err);
        setErrorMsg(err.response?.data?.message || 'Failed to load candidate roster.');
      } finally {
        setLoadingRoster(false);
      }
    }

    loadRoster();
  }, [selectedScheduleId]);

  const activeSchedule = schedules.find((s) => s._id === selectedScheduleId);
  const maxMarks = activeSchedule?.maxMarks || 100;
  const passMarks = activeSchedule?.passMarks || 40;

  // Handle Mark Change
  const handleMarkChange = (index: number, val: string) => {
    const updated = [...rows];
    updated[index].marksObtained = val;
    setRows(updated);
  };

  // Handle Absent Toggle
  const handleAbsentToggle = (index: number, checked: boolean) => {
    const updated = [...rows];
    updated[index].isAbsent = checked;
    if (checked) {
      updated[index].marksObtained = '0';
    }
    setRows(updated);
  };

  // Submit/Save Marks
  const handleSaveMarks = async (targetStatus: 'DRAFT' | 'SUBMITTED') => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedScheduleId) return;

    // Validate marks
    for (const r of rows) {
      if (!r.isAbsent && r.marksObtained !== '') {
        const val = parseFloat(r.marksObtained);
        if (isNaN(val) || val < 0) {
          setErrorMsg(`Invalid mark for candidate ${r.studentName}. Must be a non-negative number.`);
          return;
        }
        if (val > maxMarks) {
          setErrorMsg(`Mark for candidate ${r.studentName} cannot exceed maximum marks (${maxMarks}).`);
          return;
        }
      }
    }

    const payloadMarks = rows
      .filter((r) => r.isAbsent || r.marksObtained !== '')
      .map((r) => ({
        studentId: r.studentId,
        marksObtained: r.isAbsent ? 0 : parseFloat(r.marksObtained),
        isAbsent: r.isAbsent,
        remarks: r.remarks,
      }));

    if (payloadMarks.length === 0) {
      setErrorMsg('Please enter marks for at least one student before saving.');
      return;
    }

    try {
      setSaving(true);
      const res = await submitRosterMarks(selectedScheduleId, {
        status: targetStatus,
        marks: payloadMarks,
      });

      if (res.success) {
        setSuccessMsg(
          targetStatus === 'SUBMITTED'
            ? `Marks successfully submitted for ${res.data?.totalProcessed || payloadMarks.length} candidate(s). Ready for administrative verification.`
            : `Draft marks saved for ${res.data?.totalProcessed || payloadMarks.length} candidate(s).`
        );

        // Reload roster to reflect new statuses
        const reload = await getExamScheduleRoster(selectedScheduleId);
        if (reload.success && reload.data) {
          setRosterData(reload.data);
          setRows(
            reload.data.roster.map((r) => ({
              studentId: r.studentId,
              studentName: r.studentName,
              registrationNumber: r.registrationNumber,
              admissionNumber: r.admissionNumber,
              markEntryId: r.markEntryId,
              marksObtained: r.marksObtained !== null && r.marksObtained !== undefined ? r.marksObtained.toString() : '',
              isAbsent: r.isAbsent,
              status: r.status,
              remarks: r.remarks || '',
            }))
          );
        }
      }
    } catch (err: any) {
      console.error('Save roster marks error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to record marks.');
    } finally {
      setSaving(false);
    }
  };

  // Correction request submission
  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionTarget || !correctionTarget.markEntryId) return;

    const num = parseFloat(correctionNewMarks);
    if (isNaN(num) || num < 0 || num > maxMarks) {
      alert(`New mark must be between 0 and ${maxMarks}`);
      return;
    }

    try {
      setSubmittingCorrection(true);
      const res = await createMarkCorrectionRequest({
        markEntryId: correctionTarget.markEntryId,
        newMarks: num,
        reason: correctionReason,
      });

      if (res.success) {
        alert('Correction request submitted for administrative review.');
        setCorrectionTarget(null);
        setCorrectionNewMarks('');
        setCorrectionReason('');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit correction request');
    } finally {
      setSubmittingCorrection(false);
    }
  };

  // Statistical calculations
  const totalStudents = rows.length;
  const enteredRows = rows.filter((r) => r.isAbsent || r.marksObtained !== '');
  const enteredCount = enteredRows.length;
  const scoredRows = rows.filter((r) => !r.isAbsent && r.marksObtained !== '' && !isNaN(parseFloat(r.marksObtained)));
  const scoredValues = scoredRows.map((r) => parseFloat(r.marksObtained));

  const averageScore = scoredValues.length > 0
    ? Math.round((scoredValues.reduce((a, b) => a + b, 0) / scoredValues.length) * 10) / 10
    : 0;
  const highestScore = scoredValues.length > 0 ? Math.max(...scoredValues) : 0;
  const lowestScore = scoredValues.length > 0 ? Math.min(...scoredValues) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-28 bg-slate-200/70 animate-pulse rounded-2xl" />
        <div className="h-96 bg-slate-200/70 animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/faculty" className="hover:text-[#2F7C7A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Mark Entry Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Class Candidate Mark Entry
          </h1>
        </div>

        <Link
          href="/faculty/examinations"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#2F7C7A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Schedules
        </Link>
      </div>

      {/* Schedule Selector Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8E0] shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Select Your Authorized Examination Paper
            </label>
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="w-full py-2.5 px-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-800"
            >
              {schedules.length === 0 ? (
                <option value="">No assigned exam papers found</option>
              ) : (
                schedules.map((sch) => {
                  const exam = (sch.examId as any);
                  const sub = (sch.subjectId as any);
                  const cls = (sch.classId as any);
                  return (
                    <option key={sch._id} value={sch._id}>
                      {exam?.title || 'Exam'} • {sub?.subjectName || sub?.name || 'Subject'} ({cls?.name || cls?.className || 'Class'}) — Max: {sch.maxMarks}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          {activeSchedule && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400">Class:</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {(activeSchedule.classId as any)?.name || (activeSchedule.classId as any)?.className || 'Class'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Maximum Marks:</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{maxMarks}</p>
              </div>
              <div>
                <span className="text-slate-400">Passing Threshold:</span>
                <p className="font-mono font-bold text-emerald-700 mt-0.5">{passMarks}</p>
              </div>
            </div>
          )}
        </div>

        {/* Live Evaluation Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Roster Total</span>
            <p className="text-lg font-bold text-slate-900">{totalStudents}</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Marks Entered</span>
            <p className="text-lg font-bold text-[#2F7C7A]">
              {enteredCount} <span className="text-xs font-normal text-slate-400">/ {totalStudents}</span>
            </p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Class Average</span>
            <p className="text-lg font-bold text-slate-800 font-mono">{averageScore}</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Highest Score</span>
            <p className="text-lg font-bold text-emerald-700 font-mono">{highestScore}</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Lowest Score</span>
            <p className="text-lg font-bold text-rose-700 font-mono">{lowestScore}</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Student Roster Table */}
      <div className="bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#E2E8E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-[#2F7C7A]" />
            <h3 className="font-bold text-sm text-[#132238]">
              Candidate Roster Evaluation ({rows.length})
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleSaveMarks('DRAFT')}
              disabled={saving || loadingRoster || rows.length === 0}
              className="inline-flex items-center px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-all shadow-2xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" /> Save Draft
            </button>
            <button
              onClick={() => handleSaveMarks('SUBMITTED')}
              disabled={saving || loadingRoster || rows.length === 0}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#2F7C7A] hover:bg-[#286b69] text-white font-semibold text-xs transition-all shadow-2xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" /> Submit Marks
            </button>
          </div>
        </div>

        {loadingRoster ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Loading candidate roster...
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <CheckSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No candidates enrolled in this class cohort.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8E0] text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5 w-12 text-center">#</th>
                  <th className="p-3.5">Candidate Name</th>
                  <th className="p-3.5">Registration</th>
                  <th className="p-3.5 w-40">Marks Scored (Max: {maxMarks})</th>
                  <th className="p-3.5 w-32 text-center">Absent?</th>
                  <th className="p-3.5 w-28">Status</th>
                  <th className="p-3.5 text-right w-32">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, idx) => {
                  const isLocked = row.status === 'VERIFIED' || row.status === 'PUBLISHED';
                  const isSubmitted = row.status === 'SUBMITTED';

                  return (
                    <tr
                      key={row.studentId}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        row.isAbsent ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="p-3.5 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {row.studentName}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {row.registrationNumber}
                      </td>
                      <td className="p-3.5">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={maxMarks}
                          placeholder="Score"
                          value={row.marksObtained}
                          onChange={(e) => handleMarkChange(idx, e.target.value)}
                          disabled={row.isAbsent || isLocked || saving}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] font-mono text-xs font-bold text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </td>
                      <td className="p-3.5 text-center">
                        <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={row.isAbsent}
                            onChange={(e) => handleAbsentToggle(idx, e.target.checked)}
                            disabled={isLocked || saving}
                            className="rounded text-[#2F7C7A] focus:ring-0 w-3.5 h-3.5 disabled:opacity-50"
                          />
                          <span className={`text-[11px] font-semibold ${row.isAbsent ? 'text-rose-600' : 'text-slate-500'}`}>
                            Absent
                          </span>
                        </label>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.status === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.status === 'PUBLISHED'
                              ? 'bg-blue-100 text-blue-800'
                              : row.status === 'SUBMITTED'
                              ? 'bg-amber-100 text-amber-800'
                              : row.status === 'DRAFT'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-slate-50 text-slate-400 border border-slate-200'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {isLocked ? (
                          <button
                            onClick={() => {
                              setCorrectionTarget(row);
                              setCorrectionNewMarks(row.marksObtained || '0');
                              setCorrectionReason('');
                            }}
                            className="text-xs font-semibold text-amber-700 hover:underline inline-flex items-center space-x-1"
                          >
                            <ShieldAlert className="w-3 h-3" />
                            <span>Request Edit</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Editable</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark Correction Modal */}
      {correctionTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Submit Mark Correction Request
              </h3>
            </div>

            <p className="text-xs text-slate-600">
              Marks for <span className="font-bold">{correctionTarget.studentName}</span> are currently{' '}
              <span className="font-bold text-emerald-700">{correctionTarget.status}</span>.
              Direct modifications are locked. Please provide the corrected score and justification for administrative review.
            </p>

            <form onSubmit={handleSubmitCorrection} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Current Score</label>
                <input
                  type="text"
                  value={correctionTarget.marksObtained || '0'}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono text-xs text-slate-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Requested New Score (Max: {maxMarks}) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max={maxMarks}
                  value={correctionNewMarks}
                  onChange={(e) => setCorrectionNewMarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs focus:outline-hidden focus:border-[#2F7C7A]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason for Correction *</label>
                <textarea
                  rows={3}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="Explain why this mark must be changed (e.g., retotalling, re-evaluation)..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-[#2F7C7A]"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCorrectionTarget(null)}
                  disabled={submittingCorrection}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCorrection}
                  className="px-4 py-2 rounded-lg bg-[#2F7C7A] hover:bg-[#286b69] text-white font-semibold shadow-2xs"
                >
                  {submittingCorrection ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FacultyMarksPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 text-xs">
          Loading faculty mark entry workspace...
        </div>
      }
    >
      <FacultyMarksContent />
    </Suspense>
  );
}
