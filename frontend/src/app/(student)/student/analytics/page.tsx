'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck,
  RefreshCw,
  BookOpen,
  ChevronRight,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';
import { getStudentAnalytics, StudentAnalyticsData } from '@/services/analytics.service';
import { KpiCard } from '@/components/analytics/KpiCard';
import { AttendanceTrendChart } from '@/components/analytics/AttendanceTrendChart';
import { DistributionBarChart } from '@/components/analytics/DistributionBarChart';

export default function StudentAnalyticsPage() {
  const [data, setData] = useState<StudentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStudentAnalytics();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load student analytics:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load personal analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#2F7C7A] uppercase tracking-wider mb-1">
            <span>Student Portal</span>
            <span>•</span>
            <span>Academic Intelligence</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#132238] tracking-tight">
            My Academic Progress & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Personal telemetry for attendance thresholds, examination marks, and upcoming registration requirements.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#2F7C7A]' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading && !data ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-[#2F7C7A] animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#132238]">Loading Personal Progress Data...</p>
          <p className="text-xs text-slate-400 mt-1">Fetching your attendance records and exam history.</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-sm font-bold">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      ) : data ? (
        <>
          {/* Profile Card Summary Banner */}
          <div className="bg-[#132238] text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-serif text-lg font-bold">
                {data.studentProfile.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">{data.studentProfile.name}</h2>
                <p className="text-xs text-slate-300">
                  Roll / Reg: <span className="font-mono font-bold text-teal-300">{data.studentProfile.registrationNumber}</span> · {data.studentProfile.className} ({data.studentProfile.classCode})
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">
                <span className="text-slate-400 block text-[10px]">Academic Year</span>
                <span className="font-bold text-white">{data.studentProfile.academicYear}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">
                <span className="text-slate-400 block text-[10px]">House</span>
                <span className="font-bold text-teal-300">{data.studentProfile.house}</span>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Overall Attendance"
              value={`${data.attendance.percentage}%`}
              subtitle={data.attendance.isAtRisk ? 'Below 75% regulatory requirement' : 'Good standing (Eligible for exams)'}
              icon={CalendarCheck}
              variant={data.attendance.isAtRisk ? 'rose' : 'emerald'}
              badge={data.attendance.isAtRisk ? 'Deficit' : 'Safe'}
            />
            <KpiCard
              title="Sessions Attended"
              value={`${data.attendance.presentCount + data.attendance.lateCount} / ${data.attendance.totalRecorded}`}
              subtitle={`${data.attendance.absentCount} unexcused absences`}
              icon={CheckCircle2}
              variant="teal"
              badge="Sessions"
            />
            <KpiCard
              title="Academic Average"
              value={data.academics.cumulativePercentage > 0 ? `${data.academics.cumulativePercentage}%` : 'N/A'}
              subtitle={`${data.academics.passedSubjectsCount} passed subjects`}
              icon={Award}
              variant="navy"
              badge="Exams"
            />
            <KpiCard
              title="Upcoming Exams"
              value={data.actionable.upcomingExams.length}
              subtitle={`${data.actionable.pendingPayments.length} pending exam fees`}
              icon={FileCheck}
              variant="amber"
              badge="Schedules"
            />
          </div>

          {/* Critical Attendance Warning if < 75% */}
          {data.attendance.isAtRisk && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start space-x-3 text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-rose-950">
                  Critical Attendance Warning: {data.attendance.percentage}%
                </h3>
                <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                  Your overall attendance has fallen below the institutional 75% requirement. You must attend upcoming classes or consult your mentor to remain eligible for examination hall tickets and semester credits.
                </p>
                <div className="mt-3">
                  <Link
                    href="/student/attendance"
                    className="inline-flex items-center text-xs font-bold text-rose-900 bg-white px-3 py-1.5 rounded-lg border border-rose-300 hover:bg-rose-100/50 transition-colors"
                  >
                    View Detailed Attendance Calendar →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Actionable Tasks & Upcoming Exams */}
          {data.actionable.upcomingExams.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#132238]">Upcoming Examinations & Readiness</h3>
                  <p className="text-xs text-slate-400">Scheduled exams and hall ticket eligibility</p>
                </div>
                <Link
                  href="/student/examinations/registration"
                  className="text-xs font-semibold text-[#2F7C7A] hover:underline"
                >
                  Exam Registration Portal →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.actionable.upcomingExams.map((exam) => (
                  <div
                    key={exam.examId}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{exam.title}</h4>
                        <p className="text-xs text-slate-400">
                          Period: {new Date(exam.startDate).toLocaleDateString('en-IN')} – {new Date(exam.endDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                        ₹{exam.fee}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500">Status:</span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            exam.isRegistered
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {exam.isRegistered ? 'REGISTERED' : 'NOT REGISTERED'}
                        </span>
                      </div>

                      {exam.isRegistered ? (
                        <span className="text-slate-500 font-mono text-[11px]">
                          Roll: {exam.rollNumber}
                        </span>
                      ) : (
                        <Link
                          href="/student/examinations/registration"
                          className="px-2.5 py-1 rounded bg-[#2F7C7A] text-white font-semibold text-[11px] hover:bg-[#256462] transition-colors"
                        >
                          Register Now
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AttendanceTrendChart
              data={data.attendance.monthlyTrend}
              title="My Attendance Trajectory"
              subtitle="Monthly percentage attendance record"
            />

            <DistributionBarChart
              title="Subject-wise Attendance Rates"
              subtitle="Breakdown of attendance per enrolled subject"
              items={data.attendance.bySubject.map((s) => ({
                label: s.subjectName,
                value: s.percentage,
                percentage: s.percentage,
                secondaryValue: `${s.present + s.late}/${s.total} sessions`,
              }))}
            />
          </div>

          {/* Examination History */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#132238]">Examination Performance History</h3>
                <p className="text-xs text-slate-400">Official grades and scorecards</p>
              </div>
              <Link
                href="/student/results"
                className="text-xs font-semibold text-[#2F7C7A] hover:underline"
              >
                Full Results & Transcripts →
              </Link>
            </div>

            {data.academics.examHistory.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No evaluated exam results recorded in the system yet.
              </div>
            ) : (
              <div className="space-y-3">
                {data.academics.examHistory.map((res, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{res.examTitle}</h4>
                      <p className="text-slate-400 mt-0.5">
                        Marks: <strong className="text-slate-700">{res.totalMarksObtained} / {res.totalMaxMarks}</strong>
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-sm text-[#132238] bg-white px-3 py-1 rounded-lg border border-slate-200">
                        {res.percentage}%
                      </span>
                      <span
                        className={`font-bold px-2.5 py-1 rounded-lg text-xs ${
                          res.resultStatus === 'PASSED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {res.grade} ({res.resultStatus})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
