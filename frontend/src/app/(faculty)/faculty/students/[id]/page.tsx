'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getFacultyStudent360, createFacultyRemark } from '@/services/faculty.service';
import { FacultyStudent360Data, FacultyRemark } from '@/types';
import {
  Users,
  CalendarCheck,
  Building2,
  Clock,
  ArrowLeft,
  Mail,
  Phone,
  MessageSquarePlus,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Award,
  BookOpen,
  Calendar,
  Check,
  XCircle,
} from 'lucide-react';

export default function FacultyStudent360Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;

  const [data, setData] = useState<FacultyStudent360Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Remark form state
  const [remarkText, setRemarkText] = useState('');
  const [remarkCategory, setRemarkCategory] = useState<'ACADEMIC' | 'DISCIPLINE' | 'BEHAVIORAL' | 'ATTENDANCE' | 'GENERAL'>('ACADEMIC');
  const [remarkSubjectId, setRemarkSubjectId] = useState('');
  const [submittingRemark, setSubmittingRemark] = useState(false);
  const [remarkFeedback, setRemarkFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getFacultyStudent360(studentId);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to retrieve student profile');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Access denied or student not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarkText.trim()) return;

    try {
      setSubmittingRemark(true);
      setRemarkFeedback(null);

      const res = await createFacultyRemark(studentId, {
        category: remarkCategory,
        remark: remarkText.trim(),
        subjectId: remarkSubjectId || undefined,
      });

      if (res.success) {
        setRemarkFeedback({ type: 'success', message: 'Faculty remark recorded successfully' });
        setRemarkText('');
        // Reload data to reflect new remark
        loadData();
      } else {
        setRemarkFeedback({ type: 'error', message: res.message || 'Failed to record remark' });
      }
    } catch (err: any) {
      setRemarkFeedback({
        type: 'error',
        message: err?.response?.data?.message || err.message || 'Failed to add remark',
      });
    } finally {
      setSubmittingRemark(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-36 bg-slate-200/70 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-72 bg-slate-200/70 animate-pulse rounded-xl" />
          <div className="h-72 bg-slate-200/70 animate-pulse rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="p-12 text-center bg-white rounded-2xl border border-rose-200 space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold font-serif text-[#132238]">Access Denied or Not Found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {error || 'You are not assigned to teach the class cohort this student belongs to.'}
          </p>
          <div className="pt-2">
            <Link
              href="/faculty/students"
              className="inline-flex items-center text-xs font-semibold px-4 py-2.5 rounded-lg bg-[#2F7C7A] text-white hover:bg-[#286b69] transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Student Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { student, attendanceOverview, recentAttendance, remarks, teachers, recentAssignments } = data;
  const attPct = attendanceOverview?.overallPercentage ?? 0;

  return (
    <div className="space-y-8">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/faculty" className="hover:text-[#2F7C7A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/faculty/students" className="hover:text-[#2F7C7A] transition-colors">
              Student Directory
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">{student.nameEnglish || 'Student 360°'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238] flex items-center gap-2">
            <Users className="w-7 h-7 text-[#2F7C7A]" />
            Faculty Student 360° View
          </h1>
        </div>

        <Link
          href="/faculty/students"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#2F7C7A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Directory
        </Link>
      </div>

      {/* Student Profile Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2F7C7A] to-[#3ca09d] text-white flex items-center justify-center font-bold text-xl font-serif shadow-sm shrink-0">
              {student.nameEnglish ? student.nameEnglish[0] : 'S'}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold font-serif text-[#132238]">
                  {student.nameEnglish || student.userId?.name || 'Student Candidate'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-slate-100 text-slate-700 border border-slate-200">
                  {student.registrationNumber || 'No Reg'}
                </span>
              </div>
              {student.nameArabic && (
                <p className="text-sm font-serif text-slate-500 mt-0.5">{student.nameArabic}</p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                <span className="flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-[#2F7C7A]" />
                  <span>Class: <strong className="text-slate-800">{student.classId?.name}</strong></span>
                </span>
                {student.userId?.email && (
                  <span className="flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{student.userId.email}</span>
                  </span>
                )}
                {student.contactNumber && (
                  <span className="flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{student.contactNumber}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Attendance KPI Badge */}
          <div className="flex items-center space-x-4 bg-slate-50 border border-slate-200/80 rounded-xl p-4 self-start md:self-auto">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Attendance Rate</p>
              <p className="text-2xl font-bold font-mono text-[#132238] mt-0.5">{attPct}%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-[#2F7C7A] flex items-center justify-center">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Metrics & Log Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Summary */}
        <div className="bg-white rounded-2xl border border-[#E2E8E0] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-[#132238] flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-[#2F7C7A]" /> Attendance Overview
            </h3>
            <span className="text-[11px] font-mono text-slate-400">7 Periods Daily</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500">Total Periods</span>
              <p className="text-xl font-bold font-mono text-[#132238]">
                {attendanceOverview?.totalSessions ?? 0}
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200/70 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-emerald-700">Present</span>
              <p className="text-xl font-bold font-mono text-emerald-800">
                {attendanceOverview?.presentCount ?? 0}
              </p>
            </div>
            <div className="bg-rose-50 border border-rose-200/70 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-rose-700">Absent</span>
              <p className="text-xl font-bold font-mono text-rose-800">
                {attendanceOverview?.absentCount ?? 0}
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200/70 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-amber-700">Late / Leave</span>
              <p className="text-xl font-bold font-mono text-amber-800">
                {(attendanceOverview?.lateCount ?? 0) + (attendanceOverview?.leaveCount ?? 0)}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href={`/faculty/attendance?classId=${student.classId?._id}`}
              className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl bg-teal-50 text-[#2F7C7A] hover:bg-teal-100 font-semibold text-xs transition-all border border-teal-200"
            >
              <CalendarCheck className="w-3.5 h-3.5 mr-1.5" /> Open Class Attendance Roster
            </Link>
          </div>
        </div>

        {/* Recent Attendance Session Logs */}
        <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-2xs overflow-hidden lg:col-span-2">
          <div className="p-4 bg-slate-50/60 border-b border-[#E2E8E0] flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#132238] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2F7C7A]" /> Recent Session Records (Latest 10)
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Attributed by Subject</span>
          </div>

          {recentAttendance.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No recent attendance records logged for this candidate.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-center">Period</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAttendance.map((rec) => {
                    const isPresent = rec.status === 'PRESENT';
                    const isAbsent = rec.status === 'ABSENT';
                    const isLate = rec.status === 'LATE';

                    return (
                      <tr key={rec._id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono text-slate-700">
                          {new Date(rec.date).toLocaleDateString('en-GB')}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-[#132238]">
                          P{rec.period}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {rec.subjectId?.name || rec.subjectId?.subjectName || 'General Session'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isPresent
                                ? 'bg-emerald-100 text-emerald-800'
                                : isAbsent
                                ? 'bg-rose-100 text-rose-800'
                                : isLate
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {rec.remarks || '-'}
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

      {/* Remarks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Remark Form */}
        <div className="bg-white rounded-2xl border border-[#E2E8E0] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-[#132238] flex items-center gap-2">
              <MessageSquarePlus className="w-4 h-4 text-[#2F7C7A]" /> Add Faculty Remark
            </h3>
          </div>

          {remarkFeedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
                remarkFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <span>{remarkFeedback.message}</span>
              <button onClick={() => setRemarkFeedback(null)} className="text-slate-400 hover:text-slate-600 font-bold ml-2">✕</button>
            </div>
          )}

          <form onSubmit={handleAddRemark} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Category
              </label>
              <select
                value={remarkCategory}
                onChange={(e: any) => setRemarkCategory(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#132238] focus:outline-hidden focus:border-[#2F7C7A]"
              >
                <option value="ACADEMIC">ACADEMIC</option>
                <option value="DISCIPLINE">DISCIPLINE</option>
                <option value="BEHAVIORAL">BEHAVIORAL</option>
                <option value="ATTENDANCE">ATTENDANCE</option>
                <option value="GENERAL">GENERAL</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Remark / Observation
              </label>
              <textarea
                required
                rows={4}
                placeholder="Enter academic observation or feedback for this candidate..."
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#2F7C7A] focus:bg-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submittingRemark || !remarkText.trim()}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#2F7C7A] hover:bg-[#286b69] text-white font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
            >
              {submittingRemark ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving Remark...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Submit Remark
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing Remarks List */}
        <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-2xs overflow-hidden lg:col-span-2">
          <div className="p-4 bg-slate-50/60 border-b border-[#E2E8E0] flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#132238] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2F7C7A]" /> Faculty Remarks Log ({remarks.length})
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Authenticated Records</span>
          </div>

          {remarks.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No faculty remarks recorded yet for this student.
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {remarks.map((rmk) => (
                <div
                  key={rmk._id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800">
                      {rmk.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(rmk.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {rmk.remark}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>By: <strong className="text-slate-700">{rmk.authorName || rmk.facultyId?.nameEnglish || 'Faculty'}</strong></span>
                    {rmk.subjectId?.name && (
                      <span className="text-teal-700 font-semibold">{rmk.subjectId.name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Class Teachers & Assigned Cohort Teachers */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-[#132238] flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#2F7C7A]" /> Cohort Faculty & Teaching Allocations
        </h3>
        {teachers.length === 0 ? (
          <p className="text-xs text-slate-400">No other faculty assignments recorded for this class cohort.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {teachers.map((t, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="font-bold text-xs text-slate-900">{t.facultyName || 'Faculty Member'}</p>
                <p className="text-[11px] text-teal-700 font-semibold">{t.subjectName || 'Subject'}</p>
                {t.designation && (
                  <p className="text-[10px] text-slate-400">{t.designation}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
