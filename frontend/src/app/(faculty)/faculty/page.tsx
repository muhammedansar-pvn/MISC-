'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getClasses, getSubjects } from '@/services/academic.service';
import { getExams, getExamSchedules, getMarkEntries } from '@/services/exam.service';
import { ClassModel, Subject, Exam, ExamSchedule, MarkEntry } from '@/types';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  CheckSquare,
  Building2,
  Layers,
  FileText,
  User,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export default function FacultyDashboardPage() {
  const { user } = useAuth();

  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [markEntries, setMarkEntries] = useState<MarkEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [clsRes, subRes, exmRes, schRes, mrkRes] = await Promise.allSettled([
          getClasses(),
          getSubjects(),
          getExams(),
          getExamSchedules(),
          getMarkEntries(),
        ]);

        if (clsRes.status === 'fulfilled' && clsRes.value.success && Array.isArray(clsRes.value.data)) {
          setClasses(clsRes.value.data);
        }

        if (subRes.status === 'fulfilled' && subRes.value.success && Array.isArray(subRes.value.data)) {
          setSubjects(subRes.value.data);
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
              <span>Markaz Integrated Studies Council • Academic Division</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
              Welcome, {user?.name || user?.username || 'Faculty Instructor'}!
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Academic Faculty Portal for course syllabus review, timetable oversight, and official candidate mark evaluation.
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
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/faculty/marks"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#2F7C7A] hover:bg-[#286b69] text-white text-xs font-semibold shadow-sm transition-all"
            >
              <CheckSquare className="w-4 h-4 mr-2" /> Mark Entry Workspace
            </Link>
            <Link
              href="/faculty/profile"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 transition-all"
            >
              <User className="w-4 h-4 mr-2" /> My Profile
            </Link>
          </div>
        </div>

        {/* Decorative background geometry */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-white/5 to-transparent pointer-events-none" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Authorized Classes</span>
            <div className="w-8 h-8 rounded-lg bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#132238]">{classes.length}</div>
          <p className="text-xs text-slate-400">Institutional class cohorts</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Curriculum Subjects</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#132238]">{subjects.length}</div>
          <p className="text-xs text-slate-400">Teaching modules and courses</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exam Schedules</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#132238]">{schedules.length}</div>
          <p className="text-xs text-slate-400">Timetabled examination papers</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mark Evaluations</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#132238]">{markEntries.length}</div>
          <p className="text-xs text-slate-400">{verifiedMarksCount} verified • {draftMarksCount} pending</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-serif text-[#132238]">Academic Faculty Operations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/faculty/marks"
            className="group p-5 bg-white rounded-xl border border-[#E2E8E0] hover:border-[#2F7C7A] hover:shadow-sm transition-all flex items-start space-x-4"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#132238] group-hover:text-emerald-700 transition-colors">
                Mark Entry & Evaluation
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter, validate, and submit official candidate marks by schedule and student.
              </p>
            </div>
          </Link>

          <Link
            href="/faculty/classes"
            className="group p-5 bg-white rounded-xl border border-[#E2E8E0] hover:border-[#2F7C7A] hover:shadow-sm transition-all flex items-start space-x-4"
          >
            <div className="w-10 h-10 rounded-lg bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#132238] group-hover:text-[#2F7C7A] transition-colors">
                Assigned Classes
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Review class divisions, cohort sections, and associated academic sessions.
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
                Curriculum Subjects
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Browse curriculum course codes, credit allocations, and paper types.
              </p>
            </div>
          </Link>

          <Link
            href="/faculty/syllabus"
            className="group p-5 bg-white rounded-xl border border-[#E2E8E0] hover:border-[#2F7C7A] hover:shadow-sm transition-all flex items-start space-x-4"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#132238] group-hover:text-indigo-700 transition-colors">
                Syllabus Explorer
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Inspect subject course units, topics, learning goals, and document files.
              </p>
            </div>
          </Link>

          <Link
            href="/faculty/examinations"
            className="group p-5 bg-white rounded-xl border border-[#E2E8E0] hover:border-[#2F7C7A] hover:shadow-sm transition-all flex items-start space-x-4"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#132238] group-hover:text-amber-700 transition-colors">
                Exam Schedules
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                View timetables, session times, max marks, and pass marks for terms.
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
                Academic Resources
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Download guidelines, teaching materials, and official council publications.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Two Column Bottom Section: Timetable & Recent Mark Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Examination Timetable Preview */}
        <div className="bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-[#E2E8E0] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#2F7C7A]" />
              <h3 className="font-bold text-sm text-[#132238]">Upcoming Examination Schedules</h3>
            </div>
            <Link
              href="/faculty/examinations"
              className="text-xs font-semibold text-[#2F7C7A] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="p-5">
            {schedules.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No examination schedules available.
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.slice(0, 4).map((sch) => {
                  const subject = (sch.subjectId as any);
                  const exam = (sch.examId as any);
                  return (
                    <div
                      key={sch._id}
                      className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-900">
                          {subject?.name || 'Subject Paper'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {exam?.title || 'Exam Term'} • {sch.startTime} - {sch.endTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          Max: {sch.maxMarks}
                        </span>
                        <p className="text-[10px] text-slate-400">
                          Pass: {sch.passMarks || sch.passingMarks || '-'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Evaluated Mark Entries */}
        <div className="bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-[#E2E8E0] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-[#2F7C7A]" />
              <h3 className="font-bold text-sm text-[#132238]">Recent Mark Evaluations</h3>
            </div>
            <Link
              href="/faculty/marks"
              className="text-xs font-semibold text-[#2F7C7A] hover:underline"
            >
              Mark Workspace
            </Link>
          </div>
          <div className="p-5">
            {markEntries.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No mark entries recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {markEntries.slice(0, 4).map((entry) => {
                  const student = (entry.studentId as any);
                  const subject = (entry.subjectId as any);
                  const isVerified = entry.status === 'VERIFIED';
                  return (
                    <div
                      key={entry._id}
                      className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-900">
                          {student?.name || student?.registrationNumber || 'Candidate'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {subject?.name || 'Subject'} • Score: <span className="font-mono font-bold text-slate-800">{entry.marksObtained}</span>
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {entry.status || 'RECORDED'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
