'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getInstitutions } from '@/services/institution.service';
import { getStudents } from '@/services/student.service';
import { getFacultyMembers } from '@/services/faculty.service';
import { getClasses } from '@/services/academic.service';
import { getExamSchedules, getExamRegistrations } from '@/services/exam.service';
import { getPayments } from '@/services/payment.service';
import {
  Institution,
  StudentProfile,
  FacultyProfile,
  ClassModel,
  ExamSchedule,
  ExamRegistration,
  PaymentRecord,
} from '@/types';
import {
  Building2,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Clock,
  Award,
} from 'lucide-react';

export default function InstitutionDashboardPage() {
  const { user } = useAuth();

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [faculty, setFaculty] = useState<FacultyProfile[]>([]);
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [registrations, setRegistrations] = useState<ExamRegistration[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [instRes, stuRes, facRes, clsRes, schRes, regRes, payRes] = await Promise.allSettled([
          getInstitutions(),
          getStudents(),
          getFacultyMembers(),
          getClasses(),
          getExamSchedules(),
          getExamRegistrations(),
          getPayments(),
        ]);

        if (instRes.status === 'fulfilled' && instRes.value.success && Array.isArray(instRes.value.data) && instRes.value.data.length > 0) {
          setInstitution(instRes.value.data[0]);
        }

        if (stuRes.status === 'fulfilled' && stuRes.value.success && Array.isArray(stuRes.value.data)) {
          setStudents(stuRes.value.data);
        }

        if (facRes.status === 'fulfilled' && facRes.value.success && Array.isArray(facRes.value.data)) {
          setFaculty(facRes.value.data);
        }

        if (clsRes.status === 'fulfilled' && clsRes.value.success && Array.isArray(clsRes.value.data)) {
          setClasses(clsRes.value.data);
        }

        if (schRes.status === 'fulfilled' && schRes.value.success && Array.isArray(schRes.value.data)) {
          setSchedules(schRes.value.data);
        }

        if (regRes.status === 'fulfilled' && regRes.value.success && Array.isArray(regRes.value.data)) {
          setRegistrations(regRes.value.data);
        }

        if (payRes.status === 'fulfilled' && payRes.value.success && Array.isArray(payRes.value.data)) {
          setPayments(payRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load institution dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-44 bg-slate-200/70 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200/70 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-200/70 animate-pulse rounded-xl" />
          <div className="h-72 bg-slate-200/70 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  const instName = institution?.institutionName || institution?.name || user?.name || 'Affiliated Institution';
  const instCode = institution?.institutionCode || 'N/A';
  const instType = institution?.type || 'DIRECT';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#132238] via-[#1a3354] to-[#2F7C7A] text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-semibold backdrop-blur-xs border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>Institutional Academic Portal</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              {instName}
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Institutional coordination dashboard for student enrollment, faculty records, class cohorts, and centralized board examinations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-4 py-2.5 rounded-xl text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-teal-200 tracking-wider block">
                Code
              </span>
              <span className="font-mono font-bold text-sm sm:text-base">{instCode}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-4 py-2.5 rounded-xl text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-teal-200 tracking-wider block">
                Affiliation
              </span>
              <span className="font-bold text-sm sm:text-base uppercase">{instType}</span>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Students */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Students</span>
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#2F7C7A] flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-bold text-[#132238]">{students.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Enrolled candidates</p>
          </div>
          <Link
            href="/institution/students"
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#2F7C7A] hover:underline"
          >
            <span>Manage Students</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 2: Faculty */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faculty</span>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-bold text-[#132238]">{faculty.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Academic instructors</p>
          </div>
          <Link
            href="/institution/faculty"
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-700 hover:underline"
          >
            <span>Faculty Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 3: Classes */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Classes</span>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-bold text-[#132238]">{classes.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Assigned cohort divisions</p>
          </div>
          <Link
            href="/institution/classes"
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-700 hover:underline"
          >
            <span>Class Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 4: Exam Schedules & Registrations */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Papers</span>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-bold text-[#132238]">{schedules.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">{registrations.length} registered candidates</p>
          </div>
          <Link
            href="/institution/examinations"
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 hover:underline"
          >
            <span>Exam Schedules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/institution/students"
          className="bg-white p-6 rounded-xl border border-[#E2E8E0] hover:border-[#2F7C7A] transition-all duration-200 group shadow-2xs hover:shadow-sm"
        >
          <div className="w-10 h-10 rounded-lg bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-base text-[#132238] mb-1">Student Management</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Search, inspect, and register candidate profiles enrolled in your campus.
          </p>
          <span className="mt-4 inline-flex items-center text-xs font-semibold text-[#2F7C7A] group-hover:translate-x-1 transition-transform">
            Go to Students <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </span>
        </Link>

        <Link
          href="/institution/examinations"
          className="bg-white p-6 rounded-xl border border-[#E2E8E0] hover:border-[#2F7C7A] transition-all duration-200 group shadow-2xs hover:shadow-sm"
        >
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <FileCheck className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-base text-[#132238] mb-1">Exam Registrations</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Review timetables and register your candidates for upcoming board evaluations.
          </p>
          <span className="mt-4 inline-flex items-center text-xs font-semibold text-teal-700 group-hover:translate-x-1 transition-transform">
            Exam Center <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </span>
        </Link>

        <Link
          href="/institution/results"
          className="bg-white p-6 rounded-xl border border-[#E2E8E0] hover:border-[#2F7C7A] transition-all duration-200 group shadow-2xs hover:shadow-sm"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-base text-[#132238] mb-1">Results & Moderation</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            View declared candidate scores, board grades, and performance transcripts.
          </p>
          <span className="mt-4 inline-flex items-center text-xs font-semibold text-amber-700 group-hover:translate-x-1 transition-transform">
            View Results <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </span>
        </Link>
      </div>

      {/* Bottom Grid: Recent Students & Upcoming Exam Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Enrolled Students Overview */}
        <div className="bg-white rounded-xl border border-[#E2E8E0] p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#E2E8E0] pb-4 mb-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-[#2F7C7A]" />
              <h2 className="font-bold text-base text-[#132238]">Recently Enrolled Students</h2>
            </div>
            <Link
              href="/institution/students"
              className="text-xs font-semibold text-[#2F7C7A] hover:underline"
            >
              View all ({students.length})
            </Link>
          </div>

          {students.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium">No students registered yet for this campus.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {students.slice(0, 5).map((stu) => {
                const cls = (stu.classId as any);
                return (
                  <div key={stu._id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-900">{stu.nameEnglish || 'Candidate'}</p>
                      <p className="text-[11px] text-slate-500">
                        Reg: <span className="font-mono">{stu.registrationNumber || 'Pending'}</span> • {cls?.name || cls?.className || 'General'}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {stu.status || 'ACTIVE'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Upcoming Exam Papers */}
        <div className="bg-white rounded-xl border border-[#E2E8E0] p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#E2E8E0] pb-4 mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-[#2F7C7A]" />
              <h2 className="font-bold text-base text-[#132238]">Active Examination Timetables</h2>
            </div>
            <Link
              href="/institution/examinations"
              className="text-xs font-semibold text-[#2F7C7A] hover:underline"
            >
              View all ({schedules.length})
            </Link>
          </div>

          {schedules.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium">No examination schedules currently active.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {schedules.slice(0, 5).map((sch) => {
                const sub = (sch.subjectId as any);
                const cls = (sch.classId as any);
                const ex = (sch.examId as any);
                return (
                  <div key={sch._id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-900">{sub?.name || 'Subject Paper'}</p>
                      <p className="text-[11px] text-slate-500">
                        {ex?.name || 'Examination'} • {cls?.name || cls?.className || 'Class'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-mono text-slate-600 block">
                        {sch.examDate ? new Date(sch.examDate).toLocaleDateString('en-GB') : 'TBA'}
                      </span>
                      <span className="text-[10px] text-[#2F7C7A] font-semibold">
                        Max: {sch.maxMarks}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
