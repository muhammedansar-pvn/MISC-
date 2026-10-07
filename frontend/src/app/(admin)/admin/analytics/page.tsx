'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  GraduationCap,
  Building2,
  CalendarCheck,
  Award,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  CreditCard,
  RefreshCw,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  BookOpen,
} from 'lucide-react';
import { getAdminAnalytics, AdminAnalyticsData } from '@/services/analytics.service';
import { KpiCard } from '@/components/analytics/KpiCard';
import { AttendanceTrendChart } from '@/components/analytics/AttendanceTrendChart';
import { DistributionBarChart } from '@/components/analytics/DistributionBarChart';
import { AttentionAlerts } from '@/components/analytics/AttentionAlerts';
import { ExportButton } from '@/components/analytics/ExportButton';

export default function AdminAnalyticsDashboardPage() {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'academics' | 'demographics'>('overview');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminAnalytics({
        classId: selectedClass || undefined,
        academicYearId: selectedAcademicYear || undefined,
      });
      setData(res);
    } catch (err: any) {
      console.error('Failed to load admin analytics:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedAcademicYear]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleResetFilters = () => {
    setSelectedClass('');
    setSelectedAcademicYear('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#2F7C7A] uppercase tracking-wider mb-1">
            <span>MISC Intelligence</span>
            <span>•</span>
            <span>Institution Overview</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#132238] tracking-tight">
            Institutional Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry on student attendance, academic benchmarks, exam registrations, and risk indicators.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExportButton
            reportType="STUDENT_ATTENDANCE"
            classId={selectedClass}
            academicYearId={selectedAcademicYear}
            label="Export Attendance"
            fileName={`misc-attendance-report-${new Date().toISOString().split('T')[0]}.csv`}
          />
          <ExportButton
            reportType="EXAM_REGISTRATIONS"
            label="Export Exam Ledger"
            fileName={`misc-exam-ledger-${new Date().toISOString().split('T')[0]}.csv`}
          />
          <button
            onClick={fetchAnalytics}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#2F7C7A]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5 text-[#2F7C7A]" />
            <span>Filter Cohort:</span>
          </div>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
          >
            <option value="">All Classes</option>
            {data?.availableFilters?.classes?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>

          {/* Academic Year Filter */}
          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
          >
            <option value="">All Academic Years</option>
            {data?.availableFilters?.academicYears?.map((y) => (
              <option key={y._id} value={y._id}>
                {y.yearCode || y.name}
              </option>
            ))}
          </select>

          {(selectedClass || selectedAcademicYear) && (
            <button
              onClick={handleResetFilters}
              className="text-[#2F7C7A] hover:underline font-semibold text-xs ml-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'attendance', label: 'Attendance' },
            { id: 'academics', label: 'Academics & Exams' },
            { id: 'demographics', label: 'Demographics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-[#132238] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-[#2F7C7A] animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#132238]">Loading Institutional Intelligence...</p>
          <p className="text-xs text-slate-400 mt-1">Aggregating live student, attendance, and exam databases.</p>
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
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Students"
              value={data.kpis.totalStudents}
              subtitle={`${data.kpis.activeStudents} active enrolled`}
              icon={GraduationCap}
              variant="teal"
              badge="Enrolled"
            />
            <KpiCard
              title="Average Attendance"
              value={`${data.kpis.averageStudentAttendance}%`}
              subtitle={data.kpis.averageStudentAttendance >= 75 ? 'Above 75% regulatory requirement' : 'Requires improvement'}
              icon={CalendarCheck}
              variant={data.kpis.averageStudentAttendance >= 75 ? 'emerald' : 'rose'}
              badge={data.kpis.averageStudentAttendance >= 75 ? 'Healthy' : 'Deficit'}
            />
            <KpiCard
              title="Faculty Strength"
              value={data.kpis.totalFaculty}
              subtitle={`Ratio: ${data.kpis.facultyStudentRatio}`}
              icon={Users}
              variant="navy"
              badge="Instructors"
            />
            <KpiCard
              title="Upcoming Exams"
              value={data.kpis.upcomingExamsCount}
              subtitle={`${data.academics.examsCount} total examinations in system`}
              icon={FileCheck}
              variant="amber"
              badge="Active"
            />
          </div>

          {/* Requires Attention Alert Panel */}
          <AttentionAlerts
            lowAttendanceStudents={data.requiresAttention.lowAttendanceStudents}
            failingStudents={data.requiresAttention.failingStudents}
            unmarkedClasses={data.requiresAttention.unmarkedClasses}
            pendingExamsCount={data.kpis.pendingResultsCount}
            profileLinkPrefix="/admin/students"
          />

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AttendanceTrendChart
                  data={data.attendance.monthlyTrends}
                  title="Monthly Attendance Trajectory"
                  subtitle="Average attendance across all recorded sessions"
                />

                <DistributionBarChart
                  title="Class Attendance Benchmark"
                  subtitle="Comparison of attendance rates across academic classes"
                  items={data.attendance.classWiseComparison.map((c) => ({
                    label: c.className,
                    value: c.percentage,
                    percentage: c.percentage,
                    secondaryValue: `${c.attended}/${c.total} attended`,
                  }))}
                />
              </div>

              {/* Finance & Exam Ledger Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span>Exam Fee Revenue</span>
                    <CreditCard className="w-4 h-4 text-[#2F7C7A]" />
                  </div>
                  <p className="text-2xl font-bold text-[#132238]">
                    ₹{data.academics.feeCollection.collectedAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-emerald-600 font-medium">
                    ✓ {data.academics.feeCollection.collectedCount} successful payments verified
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span>Pending Exam Fees</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-[#132238]">
                    ₹{data.academics.feeCollection.pendingAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-amber-700 font-medium">
                    {data.academics.feeCollection.pendingCount} unpaid candidate registrations
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span>Academic Pass Rate</span>
                    <Award className="w-4 h-4 text-[#2F7C7A]" />
                  </div>
                  <p className="text-2xl font-bold text-[#132238]">
                    {data.academics.passRate}%
                  </p>
                  <p className="text-xs text-slate-500">
                    {data.academics.passedCount} passed · {data.academics.failedCount} failed
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE ANALYTICS */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Total Sessions</p>
                  <p className="text-2xl font-bold text-[#132238] mt-1">{data.attendance.totalRecords}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                  <p className="text-xs font-semibold text-emerald-700 uppercase">Present Marks</p>
                  <p className="text-2xl font-bold text-emerald-900 mt-1">{data.attendance.statusBreakdown.present}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                  <p className="text-xs font-semibold text-amber-700 uppercase">Late Arrivals</p>
                  <p className="text-2xl font-bold text-amber-900 mt-1">{data.attendance.statusBreakdown.late}</p>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center">
                  <p className="text-xs font-semibold text-rose-700 uppercase">Absences</p>
                  <p className="text-2xl font-bold text-rose-900 mt-1">{data.attendance.statusBreakdown.absent}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AttendanceTrendChart
                  data={data.attendance.monthlyTrends}
                  title="Monthly Institution Attendance Rate"
                  subtitle="Percentage of attendance marked across all departments"
                />

                <DistributionBarChart
                  title="Class-by-Class Attendance"
                  subtitle="All active cohorts in current view"
                  items={data.attendance.classWiseComparison.map((c) => ({
                    label: c.className,
                    value: c.percentage,
                    percentage: c.percentage,
                    secondaryValue: `${c.attended}/${c.total} attended`,
                  }))}
                />
              </div>
            </div>
          )}

          {/* TAB 3: ACADEMICS & EXAMS */}
          {activeTab === 'academics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Grade Distribution */}
                <DistributionBarChart
                  title="Exam Grade Distribution"
                  subtitle="Overall academic grades awarded across evaluated exams"
                  emptyMessage="No grade evaluations published yet."
                  items={data.academics.gradeDistribution.map((g) => ({
                    label: `Grade ${g._id}`,
                    value: g.count,
                    secondaryValue: `${g.count} candidates`,
                  }))}
                />

                {/* Top Performers */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#132238]">Top Performing Candidates</h3>
                      <p className="text-xs text-slate-400">Leading examination results</p>
                    </div>
                    <Award className="w-5 h-5 text-amber-500" />
                  </div>

                  {data.academics.topPerformers.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">
                      No published examination results recorded yet.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {data.academics.topPerformers.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[11px]">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900">{p.studentName}</p>
                              <p className="text-[11px] text-slate-400">
                                {p.registrationNumber} · {p.className}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                              {p.percentage}% ({p.grade})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEMOGRAPHICS */}
          {activeTab === 'demographics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DistributionBarChart
                  title="Students by Class Enrollment"
                  subtitle="Total registered students per class cohort"
                  items={data.students.byClass.map((c) => ({
                    label: c.className,
                    value: c.total,
                    secondaryValue: `${c.active} active`,
                  }))}
                />

                <DistributionBarChart
                  title="Students by House"
                  subtitle="Distribution across academic houses"
                  items={data.students.byHouse.map((h) => ({
                    label: `${h.house} House`,
                    value: h.count,
                    secondaryValue: `${h.count} students`,
                  }))}
                />
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
