'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getFacultyById } from '@/services/faculty.service';
import { getStudents } from '@/services/student.service';
import { markClassAttendance, getClassAttendanceRecords } from '@/services/attendance.service';
import { StudentProfile, ClassModel } from '@/types';
import {
  CalendarCheck,
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  Check,
  Building2,
  RotateCcw,
} from 'lucide-react';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'EXCUSED';

export default function FacultyAttendanceMarkingPage() {
  const { user } = useAuth();

  // Assigned classes state
  const [assignedClasses, setAssignedClasses] = useState<ClassModel[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  // Date and Period state
  const todayIso = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);

  // Class roster and marks state
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [attendanceMarks, setAttendanceMarks] = useState<Record<string, AttendanceStatus>>({});
  const [isExistingRecord, setIsExistingRecord] = useState<boolean>(false);

  // Loading and submission states
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [loadingRoster, setLoadingRoster] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // 1. Load authenticated faculty's assigned classes
  useEffect(() => {
    async function loadFacultyProfile() {
      try {
        setLoadingInitial(true);
        const profileRes = await getFacultyById('profile');
        if (profileRes.success && profileRes.data) {
          const classes = (profileRes.data.assignedClasses || []) as unknown as ClassModel[];
          setAssignedClasses(classes);
          if (classes.length > 0) {
            setSelectedClassId(classes[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load faculty assigned classes:', err);
      } finally {
        setLoadingInitial(false);
      }
    }

    loadFacultyProfile();
  }, [user]);

  // 2. Load students roster and existing attendance marks for the selected class, date, and period
  const loadRosterAndMarks = useCallback(async () => {
    if (!selectedClassId) return;

    try {
      setLoadingRoster(true);
      setFeedback(null);

      // Fetch enrolled students and existing records in parallel
      const [studentsRes, recordsRes] = await Promise.allSettled([
        getStudents({ classId: selectedClassId, limit: 100 }),
        getClassAttendanceRecords({
          classId: selectedClassId,
          date: selectedDate,
          period: selectedPeriod,
        }),
      ]);

      let roster: StudentProfile[] = [];
      if (studentsRes.status === 'fulfilled' && studentsRes.value.success && Array.isArray(studentsRes.value.data)) {
        roster = studentsRes.value.data;
        setStudents(roster);
      } else {
        setStudents([]);
      }

      // Map existing records by studentId
      const existingMap: Record<string, AttendanceStatus> = {};
      let hasExisting = false;

      if (recordsRes.status === 'fulfilled' && recordsRes.value.success && Array.isArray(recordsRes.value.data)) {
        const records = recordsRes.value.data;
        if (records.length > 0) {
          hasExisting = true;
          records.forEach((rec: any) => {
            const sId = rec.studentId?._id || rec.studentId;
            if (sId) {
              existingMap[sId.toString()] = rec.status;
            }
          });
        }
      }

      setIsExistingRecord(hasExisting);

      // Populate attendance marks: default to PRESENT if not previously recorded
      const initialMarks: Record<string, AttendanceStatus> = {};
      roster.forEach((student) => {
        const sId = student._id.toString();
        if (existingMap[sId]) {
          initialMarks[sId] = existingMap[sId];
        } else {
          initialMarks[sId] = 'PRESENT';
        }
      });

      setAttendanceMarks(initialMarks);
    } catch (err) {
      console.error('Error loading class roster and attendance marks:', err);
    } finally {
      setLoadingRoster(false);
    }
  }, [selectedClassId, selectedDate, selectedPeriod]);

  useEffect(() => {
    loadRosterAndMarks();
  }, [loadRosterAndMarks]);

  // Set individual student status
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMarks((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Bulk actions: Mark All Present / Mark All Absent
  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      updated[s._id.toString()] = status;
    });
    setAttendanceMarks(updated);
  };

  // Submit attendance marks
  const handleSubmitAttendance = async () => {
    if (!selectedClassId) {
      setFeedback({ type: 'error', message: 'Please select a valid class' });
      return;
    }

    if (students.length === 0) {
      setFeedback({ type: 'error', message: 'No students in class roster to mark' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);

      const recordsPayload = students.map((s) => ({
        studentId: s._id.toString(),
        status: attendanceMarks[s._id.toString()] || 'PRESENT',
      }));

      const res = await markClassAttendance({
        classId: selectedClassId,
        date: selectedDate,
        period: selectedPeriod,
        records: recordsPayload,
      });

      if (res.success) {
        setIsExistingRecord(true);
        setFeedback({
          type: 'success',
          message: `Period ${selectedPeriod} attendance recorded successfully (${res.data?.totalMarked ?? recordsPayload.length} students marked).`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Failed to submit attendance',
        });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit attendance marks';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // Quick stats
  const presentCount = Object.values(attendanceMarks).filter((s) => s === 'PRESENT').length;
  const absentCount = Object.values(attendanceMarks).filter((s) => s === 'ABSENT').length;
  const lateCount = Object.values(attendanceMarks).filter((s) => s === 'LATE').length;
  const leaveCount = Object.values(attendanceMarks).filter((s) => s === 'LEAVE' || s === 'EXCUSED').length;

  if (loadingInitial) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-60 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-28 bg-slate-200/70 animate-pulse rounded-xl" />
        <div className="h-96 bg-slate-200/70 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (assignedClasses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Link href="/faculty" className="hover:text-[#2F7C7A] transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Attendance Marking</span>
        </div>

        <div className="p-12 text-center bg-white rounded-2xl border border-[#E2E8E0] space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold font-serif text-[#132238]">No Assigned Classes Found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Your faculty account does not have any assigned classes or cohorts. Please contact the institution administrator to assign classes to your profile before marking attendance.
          </p>
          <div className="pt-2">
            <Link
              href="/faculty"
              className="inline-flex items-center text-xs font-semibold px-4 py-2.5 rounded-lg bg-[#2F7C7A] text-white hover:bg-[#286b69] transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedClass = assignedClasses.find((c) => c._id === selectedClassId) || assignedClasses[0];

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/faculty" className="hover:text-[#2F7C7A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Attendance Marking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238] flex items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-[#2F7C7A]" />
            7-Period Attendance Marking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official period attendance roster for authorized classes. Changes update atomically.
          </p>
        </div>

        <Link
          href="/faculty"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#2F7C7A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Control Bar: Class, Date, Period Selectors */}
      <div className="p-5 bg-white rounded-2xl border border-[#E2E8E0] shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Class Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Assigned Class / Cohort
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[#132238] focus:outline-hidden focus:border-[#2F7C7A] focus:bg-white transition-all"
            >
              {assignedClasses.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name || (cls as any).className} ({cls.code || 'CLS'})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Date Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#2F7C7A]" /> Attendance Date
            </label>
            <input
              type="date"
              max={todayIso}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[#132238] focus:outline-hidden focus:border-[#2F7C7A] focus:bg-white transition-all font-mono"
            />
          </div>

          {/* 3. Class Summary Info */}
          <div className="flex flex-col justify-end">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#2F7C7A]" />
                <span className="font-semibold text-slate-700">Enrolled Students:</span>
              </div>
              <span className="font-mono font-bold text-[#132238] px-2 py-0.5 rounded bg-white border border-slate-200">
                {students.length}
              </span>
            </div>
          </div>
        </div>

        {/* Period Selector Tabs (Periods 1 - 7) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#2F7C7A]" /> Select Period (1 - 7)
            </label>
            {isExistingRecord ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check className="w-3 h-3 mr-1" /> Editing Saved Marks
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3 h-3 mr-1" /> New Period Entry
              </span>
            )}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((periodNum) => {
              const active = selectedPeriod === periodNum;
              return (
                <button
                  key={periodNum}
                  type="button"
                  onClick={() => setSelectedPeriod(periodNum)}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all border ${
                    active
                      ? 'bg-[#2F7C7A] text-white border-[#2F7C7A] shadow-sm shadow-[#2F7C7A]/20 scale-102'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span className="hidden sm:inline">Period </span>
                  <span>{periodNum}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Roster Table Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-2xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 bg-slate-50/60 border-b border-[#E2E8E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-xs">
            <span className="font-bold text-[#132238] uppercase tracking-wider font-mono">
              {selectedClass.name || (selectedClass as any).className} • Period {selectedPeriod}
            </span>
            <span className="text-slate-300">|</span>
            <div className="flex items-center space-x-2 text-[11px] font-medium">
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                {presentCount} Present
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                {absentCount} Absent
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                {lateCount} Late
              </span>
              {leaveCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                  {leaveCount} Leave
                </span>
              )}
            </div>
          </div>

          {/* Quick Bulk Actions */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleMarkAll('PRESENT')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center"
            >
              <Check className="w-3 h-3 mr-1" /> All Present
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('ABSENT')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all flex items-center"
            >
              <XCircle className="w-3 h-3 mr-1" /> All Absent
            </button>
            <button
              type="button"
              onClick={loadRosterAndMarks}
              title="Reset to saved marks"
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        {loadingRoster ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading student class roster & attendance marks...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No students found in this class</p>
            <p className="text-xs text-slate-400">
              There are currently no active students assigned to this class cohort.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 w-32">Reg Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-6 text-center w-72">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student, idx) => {
                  const sId = student._id.toString();
                  const currentStatus = attendanceMarks[sId] || 'PRESENT';

                  return (
                    <tr key={sId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {student.registrationNumber || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#132238]">
                          {student.nameEnglish || (student.userId as any)?.name || 'Student'}
                        </div>
                        {student.nameArabic && (
                          <div className="text-[11px] text-slate-400 font-serif">
                            {student.nameArabic}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
                          {/* PRESENT Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(sId, 'PRESENT')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                              currentStatus === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-700'
                            }`}
                          >
                            P
                          </button>

                          {/* ABSENT Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(sId, 'ABSENT')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                              currentStatus === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-rose-700'
                            }`}
                          >
                            A
                          </button>

                          {/* LATE Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(sId, 'LATE')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                              currentStatus === 'LATE'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-amber-700'
                            }`}
                          >
                            L
                          </button>

                          {/* LEAVE Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(sId, 'LEAVE')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                              currentStatus === 'LEAVE' || currentStatus === 'EXCUSED'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-indigo-700'
                            }`}
                          >
                            LV
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer / Submit Action Bar */}
        <div className="p-4 bg-slate-50 border-t border-[#E2E8E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Clicking Save will update attendance for <span className="font-bold text-slate-700">{students.length} students</span> for Period {selectedPeriod} on {selectedDate}.
          </div>

          <button
            type="button"
            disabled={submitting || students.length === 0}
            onClick={handleSubmitAttendance}
            className={`inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${
              submitting || students.length === 0
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-[#2F7C7A] hover:bg-[#286b69] shadow-[#2F7C7A]/20'
            }`}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving Period {selectedPeriod}...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save & Submit Period {selectedPeriod} Attendance
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
