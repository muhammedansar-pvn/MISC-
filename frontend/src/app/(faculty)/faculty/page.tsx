'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getFacultyDashboardStats } from '@/services/faculty.service';
import { getExams, getExamSchedules, getMarkEntries } from '@/services/exam.service';
import { Exam, ExamSchedule, MarkEntry, FacultyDashboardStats } from '@/types';
import {
  GraduationCap,
  Calendar,
  CheckSquare,
  Building2,
  Layers,
  FileText,
  User,
  ShieldCheck,
  Clock,
  Sparkles,
  AlertCircle,
  CalendarCheck,
  Award,
  Users,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export default function FacultyDashboardPage() {
  const { user } = useAuth();

  const [dashboardStats, setDashboardStats] = useState<FacultyDashboardStats | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [markEntries, setMarkEntries] = useState<MarkEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [statsRes, exmRes, schRes, mrkRes] = await Promise.allSettled([
          getFacultyDashboardStats(),
          getExams(),
          getExamSchedules(),
          getMarkEntries(),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value.success && statsRes.value.data) {
          setDashboardStats(statsRes.value.data as FacultyDashboardStats);
        }

        if (exmRes.status === 'fulfilled' && exmRes.value.success && Array.isArray(exmRes.value.data)) {
          setExams(exmRes.value.data);
        }

        if (schRes.status === 'fulfilled' && schRes.value.success && Array.isArray(schRes.value.data)) {
          setSchedules(schRes.value.data);
        }

        if (mrkRes.status === 'fulfilled' && mrkRes.value.success && Array.isArray(mrkRes.value.data)) {
          setMarkEntries(mrkRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load faculty dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-slate-200/70 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200/70 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200/70 animate-pulse rounded-xl" />
          <div className="h-64 bg-slate-200/70 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  const verifiedMarksCount = markEntries.filter((m) => m.status === 'VERIFIED').length;
  const draftMarksCount = markEntries.filter((m) => m.status === 'DRAFT' || m.status === 'SUBMITTED').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#132238] via-[#1a3354] to-[#2F7C7A] text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-teal-300 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Markaz Integrated Studies Council • Sanaviyya Academic Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
              Welcome, {user?.name || user?.username || 'Faculty Member'}!
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Sanaviyya Faculty Workspace: 7-period manual attendance, teaching allocations, dynamic student rosters, and homework assignments.
            </p>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center space-x-1">
                <span className="text-slate-400">Email:</span>
                <span className="text-white font-medium">{user?.email}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="text-slate-400">Role:</span>
                <span className="text-teal-300 font-bold uppercase">{user?.role || 'FACULTY'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="text-slate-400">Today:</span>
                <span className="text-amber-300 font-bold uppercase">{dashboardStats?.todayDayOfWeek || 'TODAY'}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/faculty/attendance"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#2F7C7A] hover:bg-[#286b69] text-white text-xs font-semibold shadow-sm transition-all"
            >
              <CalendarCheck className="w-4 h-4 mr-2" /> Mark Attendance
            </Link>
            <Link
              href="/faculty/timetable"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 transition-all"
            >
              <Clock className="w-4 h-4 mr-2" /> My Timetable
            </Link>
          </div>
        </div>

        {/* Decorative background geometry */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-white/5 to-transparent pointer-events-none" />
      </div>

      {/* Action Items Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-[#2F7C7A]" />
            <h2 className="text-sm font-bold font-serif uppercase tracking-wider text-[#132238]">
              Daily Action Items & Reminders
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Assigned Cohorts: {dashboardStats?.assignedClassesCount ?? 0}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Action Card 1: Today's Unmarked Attendance */}
          <Link
            href="/faculty/attendance"
            className="block relative p-5 rounded-xl border bg-white shadow-2xs border-[#E2E8E0] space-y-3 transition-all hover:border-[#2F7C7A] hover:shadow-sm cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    (dashboardStats?.unmarkedAttendanceCount || 0) > 0
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 group-hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:bg-emerald-100'
                  }`}
                >
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#132238] group-hover:text-[#2F7C7A] transition-colors">
                    Today&apos;s Attendance Marking
                  </h3>
                  <p className="text-xs text-slate-500">
                    {(dashboardStats?.unmarkedAttendanceCount || 0) > 0
                      ? 'Scheduled periods awaiting attendance today'
                      : 'All scheduled class periods marked for today'}
                  </p>
                </div>
              </div>
              {(dashboardStats?.unmarkedAttendanceCount || 0) > 0 ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                  Action Needed
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Up to Date
                </span>
              )}
            </div>

            <div className="flex items-baseline space-x-2 pt-1">
              <span className="text-2xl font-bold font-mono text-[#132238]">
                {dashboardStats?.unmarkedAttendanceCount ?? 0}
              </span>
              <span className="text-xs text-slate-500">
                periods pending manual marking today
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
              <span>Open 7-period subject attendance workspace &rarr;</span>
              <span className="font-semibold text-[#2F7C7A] group-hover:underline">/faculty/attendance</span>
            </div>
          </Link>

          {/* Action Card 2: Homework & Active Assignments */}
          <Link
            href="/faculty/assignments"
            className="block relative p-5 rounded-xl border bg-white shadow-2xs border-[#E2E8E0] space-y-3 transition-all hover:border-[#2F7C7A] hover:shadow-sm cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#132238] group-hover:text-[#2F7C7A] transition-colors">
                    Active Homework & Tasks
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage homework and view student submissions
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200">
                Manage
              </span>
            </div>

            <div className="flex items-baseline space-x-2 pt-1">
              <span className="text-2xl font-bold font-mono text-[#132238]">
                {dashboardStats?.pendingAssignmentsCount ?? 0}
              </span>
              <span className="text-xs text-slate-500">
                active assignments currently in progress
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
              <span>Create homework or review submissions &rarr;</span>
              <span className="font-semibold text-[#2F7C7A] group-hover:underline">/faculty/assignments</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Classes</span>
            <div className="w-8 h-8 rounded-lg bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#132238]">
            {dashboardStats?.assignedClassesCount ?? 0}
          </div>
          <p className="text-xs text-slate-400">Class cohorts assigned to you</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Teaching Allocations</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#132238]">
            {dashboardStats?.assignedSubjectsCount ?? 0}
          </div>
          <p className="text-xs text-slate-400">Subjects taught across cohorts</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrolled Students</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#132238]">
            {dashboardStats?.totalStudentsCount ?? 0}
          </div>
          <p className="text-xs text-slate-400">Active students in your classes</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today&apos;s Periods</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#132238]">
            {dashboardStats?.todayClassesCount ?? 0}
          </div>
          <p className="text-xs text-slate-400">Scheduled teaching periods today</p>
        </div>
      </div>

      {/* Today's Timetable Schedule Matrix */}
      {dashboardStats?.todayTimetable && dashboardStats.todayTimetable.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-[#E2E8E0] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#2F7C7A]" />
              <h3 className="font-bold text-sm text-[#132238]">
                Today&apos;s Schedule ({dashboardStats.todayDayOfWeek})
              </h3>
            </div>
            <Link
              href="/faculty/timetable"
              className="text-xs font-semibold text-[#2F7C7A] hover:underline"
            >
              Full Weekly Timetable &rarr;
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {dashboardStats.todayTimetable.map((period: any) => (
              <div
                key={period._id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#2F7C7A] font-bold text-xs flex items-center justify-center font-mono">
                    P{period.periodNumber}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#132238]">
                      {period.subjectId?.name || period.subjectId?.subjectName || 'Subject Paper'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Class: <span className="font-semibold text-slate-700">{period.classId?.name}</span> • Time: <span className="font-mono text-slate-700">{period.startTime} - {period.endTime}</span>
                      {period.roomNumber && ` • Room: ${period.roomNumber}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-auto">
                  <Link
                    href={`/faculty/attendance?classId=${period.classId?._id}&subjectId=${period.subjectId?._id}&period=${period.periodNumber}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#2F7C7A] hover:bg-[#286b69] text-white text-xs font-semibold shadow-2xs transition-all"
                  >
                    <CalendarCheck className="w-3.5 h-3.5 mr-1.5" /> Mark Period {period.periodNumber}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-serif text-[#132238]">Faculty Academic Operations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/faculty/attendance"
            className="group p-5 bg-white rounded-xl border border-[#E2E8E0] hover:border-[#2F7C7A] hover:shadow-sm transition-all flex items-start space-x-4"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#132238] group-hover:text-teal-700 transition-colors">
                7-Period Attendance Marking
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Mark daily subject-level student attendance across 7 daily sessions.
              </p>
            </div>
          </Link>

          <Link
            href="/faculty/students"
            className="group p-5 bg-white rounded-xl border border-[#E2E8E0] hover:border-[#2F7C7A] hover:shadow-sm transition-all flex items-start space-x-4"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#132238] group-hover:text-indigo-700 transition-colors">
                Student Directory & 360°
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                View student academic profiles, attendance history, and add remarks.
              </p>
            </div>
          </Link>

          <Link
            href="/faculty/timetable"
            className="group p-5 bg-white rounded-xl border border-[#E2E8E0] hover:border-[#2F7C7A] hover:shadow-sm transition-all flex items-start space-x-4"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#132238] group-hover:text-amber-700 transition-colors">
                Weekly Timetable Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Explore periods 1 to 7 scheduled across classes for the week.
              </p>
            </div>
          </Link>

          <Link
            href="/faculty/assignments"
            className="group p-5 bg-white rounded-xl border border-[#E2E8E0] hover:border-[#2F7C7A] hover:shadow-sm transition-all flex items-start space-x-4"
          >
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#132238] group-hover:text-rose-700 transition-colors">
                Homework & Assignments
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Post class assignments with attachments and inspect student submissions.
              </p>
            </div>
          </Link>

          <Link
            href="/faculty/subjects"
            className="group p-5 bg-white rounded-xl border border-[#E2E8E0] hover:border-[#2F7C7A] hover:shadow-sm transition-all flex items-start space-x-4"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#132238] group-hover:text-blue-700 transition-colors">
                Teaching Allocations
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Review assigned classes, subjects, credits, and syllabus details.
              </p>
            </div>
          </Link>

          <Link
            href="/faculty/resources"
            className="group p-5 bg-white rounded-xl border border-[#E2E8E0] hover:border-[#2F7C7A] hover:shadow-sm transition-all flex items-start space-x-4"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#132238] group-hover:text-purple-700 transition-colors">
                Study Materials & Resources
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload and share class-specific notes, chapters, and reference docs.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
