'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getExams, getExamSchedules, getMarkEntries, submitMarkEntry } from '@/services/exam.service';
import { Exam, ExamSchedule, MarkEntry } from '@/types';
import {
  CheckSquare,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Save,
  ArrowLeft,
  Calendar,
  Layers,
  Building2,
  Users,
} from 'lucide-react';

function FacultyMarksContent() {
  const searchParams = useSearchParams();
  const initialScheduleId = searchParams?.get('examScheduleId') || '';

  const [exams, setExams] = useState<Exam[]>([]);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(initialScheduleId);
  const [markEntries, setMarkEntries] = useState<MarkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);

  // Form State
  const [studentIdInput, setStudentIdInput] = useState('');
  const [marksInput, setMarksInput] = useState('');
  const [isAbsentInput, setIsAbsentInput] = useState(false);
  const [statusInput, setStatusInput] = useState<'DRAFT' | 'SUBMITTED'>('SUBMITTED');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Initial load
  useEffect(() => {
    async function loadMetadata() {
      try {
        setLoading(true);
        const [examsRes, schedulesRes] = await Promise.allSettled([
          getExams(),
          getExamSchedules(),
        ]);

        if (examsRes.status === 'fulfilled' && examsRes.value.success && Array.isArray(examsRes.value.data)) {
          setExams(examsRes.value.data);
          if (examsRes.value.data.length > 0) {
            setSelectedExamId(examsRes.value.data[0]._id);
          }
        }

        if (schedulesRes.status === 'fulfilled' && schedulesRes.value.success && Array.isArray(schedulesRes.value.data)) {
          setSchedules(schedulesRes.value.data);
          if (initialScheduleId) {
            const matched = schedulesRes.value.data.find((s) => s._id === initialScheduleId);
            if (matched) {
              const examId = (matched.examId as any)?._id || matched.examId;
              if (examId) setSelectedExamId(examId);
              setSelectedScheduleId(initialScheduleId);
            }
          } else if (schedulesRes.value.data.length > 0) {
            setSelectedScheduleId(schedulesRes.value.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load marks workspace:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMetadata();
  }, [initialScheduleId]);

  // Load mark entries when schedule changes
  useEffect(() => {
    if (!selectedScheduleId) {
      setMarkEntries([]);
      return;
    }

    async function loadEntries() {
      try {
        setLoadingEntries(true);
        setFormError(null);
        setFormSuccess(null);
        const res = await getMarkEntries({ examScheduleId: selectedScheduleId });
        if (res.success && Array.isArray(res.data)) {
          setMarkEntries(res.data);
        } else {
          setMarkEntries([]);
        }
      } catch (err) {
        console.error('Failed to load mark entries:', err);
        setMarkEntries([]);
      } finally {
        setLoadingEntries(false);
      }
    }

    loadEntries();
  }, [selectedScheduleId]);

  const activeSchedule = schedules.find((s) => s._id === selectedScheduleId);
  const activeExam = exams.find((e) => e._id === selectedExamId);
  const scheduleSubject = (activeSchedule?.subjectId as any);
  const scheduleClass = (activeSchedule?.classId as any);

  // Handle Mark Entry Submission
  const handleSubmitMark = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!selectedScheduleId || !activeSchedule) {
      setFormError('Please select an active examination schedule.');
      return;
    }

    if (!studentIdInput.trim()) {
      setFormError('Student ID (24-character hexadecimal ObjectId) is required.');
      return;
    }

    // Validate 24 hex chars
    if (!/^[0-9a-fA-F]{24}$/.test(studentIdInput.trim())) {
      setFormError('Student ID must be a valid 24-character hex ID.');
      return;
    }

    const marksNum = parseFloat(marksInput);
    if (!isAbsentInput && (isNaN(marksNum) || marksNum < 0)) {
      setFormError('Marks obtained must be a valid non-negative number.');
      return;
    }

    if (!isAbsentInput && activeSchedule.maxMarks && marksNum > activeSchedule.maxMarks) {
      setFormError(`Marks obtained cannot exceed schedule maximum marks (${activeSchedule.maxMarks}).`);
      return;
    }

    try {
      setSubmitting(true);
      const examId = (activeSchedule.examId as any)?._id || activeSchedule.examId;
      const subjectId = (activeSchedule.subjectId as any)?._id || activeSchedule.subjectId;

      const payload = {
        examId,
        examScheduleId: activeSchedule._id,
        studentId: studentIdInput.trim(),
        subjectId,
        marksObtained: isAbsentInput ? 0 : marksNum,
        isAbsent: isAbsentInput,
        status: statusInput,
      };

      const res = await submitMarkEntry(payload);
      if (res.success) {
        setFormSuccess('Mark entry successfully recorded.');
        setStudentIdInput('');
        setMarksInput('');
        setIsAbsentInput(false);

        // Reload mark entries
        const reloadRes = await getMarkEntries({ examScheduleId: activeSchedule._id });
        if (reloadRes.success && Array.isArray(reloadRes.data)) {
          setMarkEntries(reloadRes.data);
        }
      } else {
        setFormError(res.message || 'Failed to submit mark entry.');
      }
    } catch (err: any) {
      console.error('Error submitting marks:', err);
      setFormError(err.response?.data?.message || 'Error recording marks.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-32 bg-slate-200/70 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200/70 animate-pulse rounded-xl" />
          <div className="lg:col-span-2 h-64 bg-slate-200/70 animate-pulse rounded-xl" />
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
            <Link href="/faculty" className="hover:text-[#2F7C7A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Mark Entry Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Candidate Mark Entry & Evaluation
          </h1>
        </div>

        <Link
          href="/faculty/examinations"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#2F7C7A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Schedules
        </Link>
      </div>

      {/* Schedule Selection Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8E0] shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">1. Select Examination Term</label>
            <select
              value={selectedExamId}
              onChange={(e) => {
                setSelectedExamId(e.target.value);
                // auto-select first schedule of that exam
                const firstMatching = schedules.find((s) => {
                  const exId = (s.examId as any)?._id || s.examId;
                  return exId === e.target.value;
                });
                if (firstMatching) setSelectedScheduleId(firstMatching._id);
              }}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-800"
            >
              {exams.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.title || exam.name} ({exam.examCode || exam.code || 'EXAM'})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">2. Select Scheduled Paper</label>
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-800"
            >
              {schedules
                .filter((s) => {
                  if (!selectedExamId) return true;
                  const exId = (s.examId as any)?._id || s.examId;
                  return exId === selectedExamId;
                })
                .map((sch) => {
                  const sub = (sch.subjectId as any);
                  const cls = (sch.classId as any);
                  return (
                    <option key={sch._id} value={sch._id}>
                      {sub?.name || 'Subject'} ({cls?.name || cls?.className || 'Class'}) • Max: {sch.maxMarks}
                    </option>
                  );
                })}
            </select>
          </div>
        </div>

        {/* Selected Schedule Banner */}
        {activeSchedule && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Subject Paper:</span>
              <p className="font-bold text-slate-800 mt-0.5">{scheduleSubject?.name || 'Subject'}</p>
            </div>
            <div>
              <span className="text-slate-400">Class Cohort:</span>
              <p className="font-bold text-slate-800 mt-0.5">{scheduleClass?.name || scheduleClass?.className || 'Class'}</p>
            </div>
            <div>
              <span className="text-slate-400">Maximum Marks:</span>
              <p className="font-mono font-bold text-[#132238] text-sm mt-0.5">{activeSchedule.maxMarks}</p>
            </div>
            <div>
              <span className="text-slate-400">Passing Threshold:</span>
              <p className="font-mono font-bold text-emerald-700 mt-0.5">
                {activeSchedule.passMarks || activeSchedule.passingMarks || '-'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Workspace: Entry Form & Existing Records */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="bg-white rounded-xl border border-[#E2E8E0] p-5 sm:p-6 shadow-2xs space-y-4 h-fit">
          <div className="flex items-center space-x-2 border-b border-[#E2E8E0] pb-3">
            <CheckSquare className="w-5 h-5 text-[#2F7C7A]" />
            <h2 className="font-bold text-sm text-[#132238]">Record Candidate Marks</h2>
          </div>

          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmitMark} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Student ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="24-char ObjectId (e.g. from existing entry)"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] font-mono text-xs"
                required
              />
              <p className="text-[10px] text-slate-400">
                Click a student from the evaluated list below to auto-fill.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Marks Scored (Max: {activeSchedule?.maxMarks || 100}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max={activeSchedule?.maxMarks || 100}
                placeholder="Enter score"
                value={marksInput}
                onChange={(e) => setMarksInput(e.target.value)}
                disabled={isAbsentInput}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] font-mono text-xs disabled:bg-slate-100"
                required={!isAbsentInput}
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="isAbsentCheck"
                checked={isAbsentInput}
                onChange={(e) => setIsAbsentInput(e.target.checked)}
                className="rounded text-[#2F7C7A] focus:ring-0"
              />
              <label htmlFor="isAbsentCheck" className="text-xs text-slate-700 font-medium">
                Mark candidate as ABSENT
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Submission Status</label>
              <select
                value={statusInput}
                onChange={(e) => setStatusInput(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-800 text-xs"
              >
                <option value="SUBMITTED">SUBMITTED (Ready for Admin Verification)</option>
                <option value="DRAFT">DRAFT (Saved as Working Draft)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#2F7C7A] hover:bg-[#286b69] text-white font-semibold text-xs transition-all shadow-2xs disabled:opacity-50"
            >
              {submitting ? (
                <span>Recording Marks...</span>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" /> Submit Evaluation
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Existing Evaluated Records */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-[#E2E8E0] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#2F7C7A]" />
                <h3 className="font-bold text-sm text-[#132238]">
                  Evaluated Marks for this Paper ({markEntries.length})
                </h3>
              </div>
            </div>

            {loadingEntries ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Loading evaluation records...
              </div>
            ) : markEntries.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                <CheckSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700">No marks recorded yet for this paper.</p>
                <p className="text-[11px] max-w-sm mx-auto">
                  Use the entry form on the left to record and submit student marks.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#E2E8E0] text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="p-3.5">Candidate Student</th>
                      <th className="p-3.5">Registration</th>
                      <th className="p-3.5">Score</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {markEntries.map((entry) => {
                      const student = (entry.studentId as any);
                      const sId = student?._id || entry.studentId;
                      const isVerified = entry.status === 'VERIFIED';

                      return (
                        <tr key={entry._id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900">
                            {student?.name || 'Student Candidate'}
                          </td>
                          <td className="p-3.5 font-mono text-slate-600">
                            {student?.registrationNumber || 'N/A'}
                          </td>
                          <td className="p-3.5 font-mono font-bold text-slate-900 text-sm">
                            {entry.isAbsent ? (
                              <span className="text-rose-600 font-bold text-xs">ABSENT</span>
                            ) : (
                              <span>
                                {entry.marksObtained} <span className="text-xs text-slate-400">/ {activeSchedule?.maxMarks}</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isVerified
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {entry.status || 'RECORDED'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => {
                                if (sId) setStudentIdInput(typeof sId === 'string' ? sId : sId._id);
                                setMarksInput(entry.marksObtained?.toString() || '');
                                setIsAbsentInput(!!entry.isAbsent);
                              }}
                              className="text-xs font-semibold text-[#2F7C7A] hover:underline"
                            >
                              Edit Score
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
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
