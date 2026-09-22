'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getStudentProfile } from '@/services/student.service';
import { getExamRegistrations, getExamResults } from '@/services/exam.service';
import { getPayments } from '@/services/payment.service';
import { StudentProfile, ExamRegistration, ExamResult, PaymentRecord } from '@/types';
import {
  GraduationCap,
  Calendar,
  Award,
  CreditCard,
  User,
  BookOpen,
  ArrowRight,
  FileCheck,
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [registrations, setRegistrations] = useState<ExamRegistration[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const [profileRes, regRes, resRes, payRes] = await Promise.allSettled([
          getStudentProfile(),
          getExamRegistrations(),
          getExamResults(),
          getPayments(),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value.success && profileRes.value.data) {
          setProfile(profileRes.value.data);
        }

        if (regRes.status === 'fulfilled' && regRes.value.success && Array.isArray(regRes.value.data)) {
          setRegistrations(regRes.value.data);
        }

        if (resRes.status === 'fulfilled' && resRes.value.success && Array.isArray(resRes.value.data)) {
          setResults(resRes.value.data);
        }

        if (payRes.status === 'fulfilled' && payRes.value.success && Array.isArray(payRes.value.data)) {
          setPayments(payRes.value.data);
        }
      } catch (err: any) {
        console.error('Error loading student dashboard:', err);
        setError('Failed to load some dashboard details. Please refresh or try again.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-slate-200/70 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
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

  const institution = (profile?.institutionId as any);
  const enrolledClass = (profile?.classId as any);
  const activeRegWithHallTicket = registrations.find(
    (r) => r.registrationStatus === 'HALL_TICKET_ISSUED'
  );
  const latestResult = results.length > 0 ? results[0] : null;

  return (
    <div className="space-y-8">
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#132238] via-[#1a3354] to-[#2F7C7A] text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-emerald-300 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Markaz Integrated Studies Council</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
              Welcome, {profile?.nameEnglish || user?.name || user?.username || 'Student'}!
            </h1>
            {profile?.nameArabic && (
              <p className="font-arabic text-lg text-emerald-200 leading-normal" dir="rtl">
                {profile.nameArabic}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-300 pt-1">
              {profile?.registrationNumber && (
                <span className="flex items-center space-x-1 font-mono">
                  <span className="text-slate-400">Reg No:</span>
                  <span className="text-white font-bold">{profile.registrationNumber}</span>
                </span>
              )}
              {enrolledClass?.className && (
                <span className="flex items-center space-x-1">
                  <span className="text-slate-400">Class:</span>
                  <span className="text-white font-medium">
                    {enrolledClass.className} {enrolledClass.section ? `(${enrolledClass.section})` : ''}
                  </span>
                </span>
              )}
              {institution?.name && (
                <span className="flex items-center space-x-1 truncate max-w-xs">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{institution.name}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/student/profile"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 transition-all"
            >
              <User className="w-4 h-4 mr-2" /> View Profile
            </Link>
            <Link
              href="/student/results"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#2F7C7A] hover:bg-[#286b69] text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Award className="w-4 h-4 mr-2" /> View Results
            </Link>
          </div>
        </div>

        {/* Decorative background geometry */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-white/5 to-transparent pointer-events-none" />
      </div>

      {/* Notice if Profile not yet linked */}
      {!profile && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Student Profile Association Pending</p>
            <p className="text-amber-800 text-xs mt-0.5">
              Your user account is verified as a STUDENT. However, your detailed student profile is awaiting assignment by your institution or council administrator.
            </p>
          </div>
        </div>
      )}

      {/* Hall Ticket Announcement Banner (if available) */}
      {activeRegWithHallTicket && (
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-400/30">
              <FileCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm sm:text-base">Hall Ticket Available</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-[10px] uppercase tracking-wider font-bold text-emerald-200">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Roll Number: <span className="font-mono font-bold text-white">{activeRegWithHallTicket.rollNumber}</span> • Exam: {(activeRegWithHallTicket.examId as any)?.title || 'Scheduled Exam'}
              </p>
            </div>
          </div>
          <Link
            href="/student/examinations/registrations"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors shrink-0"
          >
            View Hall Ticket <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Class / Section</span>
            <div className="w-8 h-8 rounded-lg bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-[#132238]">
            {enrolledClass?.className || 'General'} {enrolledClass?.section ? `- ${enrolledClass.section}` : ''}
          </div>
          <p className="text-xs text-slate-400">
            Admission Year: {profile?.admissionYear || 'Current'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exam Registrations</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#132238]">{registrations.length}</div>
          <p className="text-xs text-slate-400">
            {activeRegWithHallTicket ? 'Hall ticket generated' : 'Registered for upcoming terms'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Published Results</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#132238]">{results.length}</div>
          <p className="text-xs text-slate-400">
            {latestResult ? `Latest Grade: ${latestResult.grade}` : 'No published exams yet'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fee Transactions</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#132238]">{payments.length}</div>
          <p className="text-xs text-slate-400">
            {payments.filter((p) => p.status === 'SUCCESS').length} verified transactions
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-serif text-[#132238]">Academic & Examination Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/student/academics"
            className="group p-5 bg-white rounded-xl border border-[#E2E8E0] hover:border-[#2F7C7A] hover:shadow-sm transition-all flex items-start space-x-4"
          >
            <div className="w-10 h-10 rounded-lg bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#132238] group-hover:text-[#2F7C7A] transition-colors">
                Academic Overview
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                View enrolled course structure, academic calendar, and class curriculum.
              </p>
            </div>
          </Link>

          <Link
            href="/student/syllabus"
            className="group p-5 bg-white rounded-xl border border-[#E2E8E0] hover:border-[#2F7C7A] hover:shadow-sm transition-all flex items-start space-x-4"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#132238] group-hover:text-blue-700 transition-colors">
                Syllabus Explorer
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Browse detailed syllabuses, unit topics, and learning objectives by subject.
              </p>
            </div>
          </Link>

          <Link
            href="/student/resources"
            className="group p-5 bg-white rounded-xl border border-[#E2E8E0] hover:border-[#2F7C7A] hover:shadow-sm transition-all flex items-start space-x-4"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#132238] group-hover:text-amber-700 transition-colors">
                Academic Resources
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Download guidelines, course materials, and published reference documents.
              </p>
            </div>
          </Link>

          <Link
            href="/student/examinations"
            className="group p-5 bg-white rounded-xl border border-[#E2E8E0] hover:border-[#2F7C7A] hover:shadow-sm transition-all flex items-start space-x-4"
          >
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#132238] group-hover:text-rose-700 transition-colors">
                Exam Schedules
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Check upcoming exam dates, session timings, and subject timetable.
              </p>
            </div>
          </Link>

          <Link
            href="/student/results"
            className="group p-5 bg-white rounded-xl border border-[#E2E8E0] hover:border-[#2F7C7A] hover:shadow-sm transition-all flex items-start space-x-4"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#132238] group-hover:text-emerald-700 transition-colors">
                Results & Marks
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Access official grades, marks obtained, percentages, and performance status.
              </p>
            </div>
          </Link>

          <Link
            href="/student/payments"
            className="group p-5 bg-white rounded-xl border border-[#E2E8E0] hover:border-[#2F7C7A] hover:shadow-sm transition-all flex items-start space-x-4"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#132238] group-hover:text-indigo-700 transition-colors">
                Payments & Receipts
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Review fee payment transactions, status, and verification receipts.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Two Column Section: Recent Results & Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Results */}
        <div className="bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-[#E2E8E0] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-[#2F7C7A]" />
              <h3 className="font-bold text-sm text-[#132238]">Recent Examination Results</h3>
            </div>
            <Link
              href="/student/results"
              className="text-xs font-semibold text-[#2F7C7A] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="p-5">
            {results.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No examination results published yet.
              </div>
            ) : (
              <div className="space-y-3">
                {results.slice(0, 3).map((res) => {
                  const exam = (res.examId as any);
                  const isPassed = res.resultStatus === 'PASSED' || res.resultStatus === 'PASS';
                  return (
                    <div
                      key={res._id}
                      className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-900">{exam?.title || 'Examination'}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Score: {res.totalMarksObtained} / {res.totalMaxMarks} ({res.percentage}%)
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200">
                          {res.grade}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPassed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {res.resultStatus}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Examination Registrations */}
        <div className="bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-[#E2E8E0] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-[#2F7C7A]" />
              <h3 className="font-bold text-sm text-[#132238]">Active Exam Registrations</h3>
            </div>
            <Link
              href="/student/examinations/registrations"
              className="text-xs font-semibold text-[#2F7C7A] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="p-5">
            {registrations.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No active exam registrations on file.
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.slice(0, 3).map((reg) => {
                  const exam = (reg.examId as any);
                  const isHallTicket = reg.registrationStatus === 'HALL_TICKET_ISSUED';
                  return (
                    <div
                      key={reg._id}
                      className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-900">{exam?.title || 'Exam Registration'}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Roll No: {reg.rollNumber || 'Assigned soon'}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isHallTicket
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {reg.registrationStatus || 'REGISTERED'}
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
