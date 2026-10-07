'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  AlertTriangle,
  CreditCard,
  FileCheck,
  RefreshCw,
  BookOpen,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { getParentAnalytics, ParentAnalyticsData } from '@/services/analytics.service';
import { KpiCard } from '@/components/analytics/KpiCard';
import { DistributionBarChart } from '@/components/analytics/DistributionBarChart';

export default function ParentAnalyticsPage() {
  const [data, setData] = useState<ParentAnalyticsData | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (studentId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getParentAnalytics(studentId || undefined);
      setData(res);
      if (res.selectedChild && !selectedStudentId) {
        setSelectedStudentId(res.selectedChild._id);
      }
    } catch (err: any) {
      console.error('Failed to load parent analytics:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load child analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedStudentId || undefined);
  }, [selectedStudentId]);

  const handleSelectChild = (id: string) => {
    setSelectedStudentId(id);
  };

  const child = data?.selectedChild;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#2F7C7A] uppercase tracking-wider mb-1">
            <span>Parent Portal</span>
            <span>•</span>
            <span>Guardian Intelligence</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#132238] tracking-tight">
            Child Academic & Attendance Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Live progress overview for your enrolled child at Markaz Sanaviyya.
          </p>
        </div>

        {/* Child Selector (if parent has multiple children) */}
        <div className="flex items-center space-x-3">
          {data?.children && data.children.length > 1 && (
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <span className="text-slate-500 font-semibold">Select Ward:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => handleSelectChild(e.target.value)}
                className="bg-transparent font-bold text-[#132238] focus:outline-none cursor-pointer"
              >
                {data.children.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.nameEnglish} ({c.className})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => fetchAnalytics(selectedStudentId)}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#2F7C7A]' : ''}`} />
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-[#2F7C7A] animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#132238]">Loading Ward Progress Telemetry...</p>
          <p className="text-xs text-slate-400 mt-1">Fetching live attendance registers and official marks.</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-sm font-bold">{error}</p>
          <button
            onClick={() => fetchAnalytics(selectedStudentId)}
            className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      ) : child ? (
        <>
          {/* Child Identity Card */}
          <div className="bg-[#132238] text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-serif text-lg font-bold">
                {child.nameEnglish.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">{child.nameEnglish}</h2>
                <p className="text-xs text-slate-300">
                  Registration Number:{' '}
                  <span className="font-mono font-bold text-teal-300">{child.registrationNumber}</span> ·{' '}
                  {child.className} ({child.classCode})
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15">
                <span className="text-slate-400 block text-[10px]">House</span>
                <span className="font-bold text-teal-300">{child.house}</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15">
                <span className="text-slate-400 block text-[10px]">Guardian</span>
                <span className="font-bold text-white">{data?.parentName}</span>
              </div>
            </div>
          </div>

          {/* Child KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Attendance Standing"
              value={`${child.attendance.percentage}%`}
              subtitle={child.attendance.isAtRisk ? 'Below 75% institutional requirement' : 'Good standing'}
              icon={CalendarCheck}
              variant={child.attendance.isAtRisk ? 'rose' : 'emerald'}
              badge={child.attendance.isAtRisk ? 'Deficit' : 'Safe'}
            />
            <KpiCard
              title="Recorded Sessions"
              value={`${child.attendance.present + child.attendance.late} / ${child.attendance.totalSessions}`}
              subtitle={`${child.attendance.absent} absences recorded`}
              icon={CheckCircle2}
              variant="teal"
              badge="Sessions"
            />
            <KpiCard
              title="Exam Evaluations"
              value={child.academics.examResults.length}
              subtitle="Published exam report cards"
              icon={Award}
              variant="navy"
              badge="Results"
            />
            <KpiCard
              title="Exam Registrations"
              value={child.academics.examRegistrations.length}
              subtitle={child.alerts.unpaidFees ? 'Action: Fee payment required' : 'All registrations complete'}
              icon={FileCheck}
              variant={child.alerts.unpaidFees ? 'amber' : 'teal'}
              badge={child.alerts.unpaidFees ? 'Pending Fee' : 'Complete'}
            />
          </div>

          {/* Critical Warnings */}
          {child.attendance.isAtRisk && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start space-x-3 text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-rose-950">
                  Attendance Deficit Warning: {child.attendance.percentage}%
                </h3>
                <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                  Your ward&apos;s current attendance is below the mandatory 75% threshold. Regular class participation is required to ensure eligibility for upcoming final examination hall tickets.
                </p>
              </div>
            </div>
          )}

          {child.alerts.unpaidFees && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between gap-4 text-amber-900">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-950">
                    Pending Examination Fee
                  </h3>
                  <p className="text-xs text-amber-800 mt-0.5">
                    An examination registration fee payment is currently pending verification.
                  </p>
                </div>
              </div>
              <Link
                href="/parent/examinations"
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition-colors shrink-0"
              >
                Pay Exam Fee →
              </Link>
            </div>
          )}

          {/* Subject Attendance Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DistributionBarChart
              title="Subject-wise Class Attendance"
              subtitle="Attendance breakdown across academic courses"
              emptyMessage="No subject attendance records found for this ward yet."
              items={child.attendance.subjectBreakdown.map((s) => ({
                label: s.subjectName,
                value: s.percentage,
                percentage: s.percentage,
                secondaryValue: `${s.present + s.late}/${s.total} sessions`,
              }))}
            />

            {/* Exam Registrations & Hall Ticket Status */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#132238]">Examinations & Hall Ticket Status</h3>
                  <p className="text-xs text-slate-400">Current registration records</p>
                </div>
                <Link
                  href="/parent/examinations"
                  className="text-xs font-semibold text-[#2F7C7A] hover:underline"
                >
                  Manage Exams →
                </Link>
              </div>

              {child.academics.examRegistrations.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No active examination registrations found for this ward.
                </p>
              ) : (
                <div className="space-y-3">
                  {child.academics.examRegistrations.map((reg, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{reg.examTitle}</p>
                        <p className="text-slate-400 text-[11px]">
                          Roll No: <span className="font-mono font-semibold text-slate-700">{reg.rollNumber}</span> · Fee: ₹{reg.fee}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            reg.hallTicketStatus === 'HALL_TICKET_ISSUED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {reg.hallTicketStatus}
                        </span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            reg.paymentStatus === 'SUCCESS'
                              ? 'bg-teal-50 text-[#2F7C7A] border border-teal-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {reg.paymentStatus === 'SUCCESS' ? 'FEE PAID' : 'FEE UNPAID'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Academic Exam Results */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#132238]">Examination Performance History</h3>
              <p className="text-xs text-slate-400">Official scorecard evaluations</p>
            </div>

            {child.academics.examResults.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No published exam results available for this ward yet.
              </p>
            ) : (
              <div className="space-y-3">
                {child.academics.examResults.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{r.examTitle}</h4>
                      <p className="text-slate-400 mt-0.5">
                        Grade: <strong className="text-slate-800">{r.grade}</strong> · Result: {r.resultStatus}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[#132238] bg-white px-3 py-1 rounded-lg border border-slate-200">
                      {r.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-sm">
          No student profiles linked to this parent guardian.
        </div>
      )}
    </div>
  );
}
