'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  CheckSquare,
  AlertTriangle,
  RefreshCw,
  Layers,
  BookOpen,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { getFacultyAnalytics, FacultyAnalyticsData } from '@/services/analytics.service';
import { KpiCard } from '@/components/analytics/KpiCard';
import { AttendanceTrendChart } from '@/components/analytics/AttendanceTrendChart';
import { DistributionBarChart } from '@/components/analytics/DistributionBarChart';

export default function FacultyAnalyticsPage() {
  const [data, setData] = useState<FacultyAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getFacultyAnalytics();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load faculty analytics:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load faculty analytics');
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
            <span>Faculty Portal</span>
            <span>•</span>
            <span>Teaching Intelligence</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#132238] tracking-tight">
            Academic Performance & Class Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Scoped telemetry for your assigned classes, attendance tracking, and student intervention signals.
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
          <p className="text-sm font-semibold text-[#132238]">Loading Faculty Analytics...</p>
          <p className="text-xs text-slate-400 mt-1">Aggregating assigned class and student rosters.</p>
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
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Assigned Classes"
              value={data.kpis.assignedClassesCount}
              subtitle={`${data.kpis.assignedSubjectsCount} subjects taught`}
              icon={Layers}
              variant="teal"
              badge="Allocations"
            />
            <KpiCard
              title="Total Enrolled Students"
              value={data.kpis.totalAssignedStudents}
              subtitle="Across your assigned classes"
              icon={Users}
              variant="navy"
              badge="Students"
            />
            <KpiCard
              title="Cohort Attendance Rate"
              value={`${data.kpis.myAverageAttendance}%`}
              subtitle={data.kpis.myAverageAttendance >= 75 ? 'Meets 75% minimum criteria' : 'Attendance attention needed'}
              icon={CalendarCheck}
              variant={data.kpis.myAverageAttendance >= 75 ? 'emerald' : 'rose'}
              badge={data.kpis.myAverageAttendance >= 75 ? 'Healthy' : 'At Risk'}
            />
            <KpiCard
              title="Pending Marks Entry"
              value={data.kpis.pendingMarksToSubmit}
              subtitle="Schedules awaiting mark evaluation"
              icon={CheckSquare}
              variant="amber"
              badge="Evaluation"
            />
          </div>

          {/* At-Risk Students Warning Banner */}
          {data.requiresAttention.lowAttendanceStudents.length > 0 && (
            <div className="bg-white rounded-2xl border border-rose-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-rose-950 uppercase tracking-wider">
                    Attendance Intervention Required (&lt;75%)
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                  {data.requiresAttention.lowAttendanceStudents.length} Students At Risk
                </span>
              </div>
              <p className="text-xs text-slate-500">
                The following students in your assigned cohorts are currently falling below the 75% attendance criteria. Click on any student to view their 360 profile.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {data.requiresAttention.lowAttendanceStudents.map((s) => (
                  <Link
                    key={s.studentId}
                    href={`/faculty/students/${s.studentId}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 hover:bg-rose-50 border border-rose-100 transition-all group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-[#2F7C7A] transition-colors">
                        {s.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {s.registrationNumber} · {s.className}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-rose-600 bg-white px-2 py-0.5 rounded border border-rose-200">
                        {s.attendancePercentage}%
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#2F7C7A]" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AttendanceTrendChart
              data={data.attendanceTrend}
              title="Class Attendance Trend"
              subtitle="Monthly aggregate across your teaching sessions"
            />

            <DistributionBarChart
              title="Class-by-Class Attendance Rate"
              subtitle="Performance across each of your assigned classes"
              items={data.classes.map((c) => ({
                label: c.className,
                value: c.attendancePercentage,
                percentage: c.attendancePercentage,
                secondaryValue: `${c.studentCount} students`,
              }))}
            />
          </div>

          {/* Assigned Classes Roster List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#132238]">Assigned Cohorts & Teaching Classes</h3>
                <p className="text-xs text-slate-400">Current active assignments</p>
              </div>
              <Link
                href="/faculty/classes"
                className="text-xs font-semibold text-[#2F7C7A] hover:underline"
              >
                View Class Rosters →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.classes.map((c) => (
                <div
                  key={c.classId}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-white transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{c.className}</h4>
                      <p className="text-[11px] font-mono text-slate-400">{c.classCode}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-[#2F7C7A] border border-teal-100">
                      {c.attendancePercentage}% Attended
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                    <span>Enrolled: <strong className="text-slate-800">{c.studentCount}</strong></span>
                    <span>Sessions Marked: <strong className="text-slate-800">{c.totalMarked}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
