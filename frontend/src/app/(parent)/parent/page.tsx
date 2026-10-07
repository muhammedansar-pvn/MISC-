'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getParentProfile, ParentProfileData, ParentStudent } from '@/services/parent.service';
import {
  Users,
  GraduationCap,
  CreditCard,
  FileCheck,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Calendar,
  BookOpen,
} from 'lucide-react';

export default function ParentDashboardPage() {
  const [profile, setProfile] = useState<ParentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError('');
        const res = await getParentProfile();
        const parentData = res.data?.parent || (res as any).parent;
        if (res.success && parentData) {
          setProfile(parentData);
        } else {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[Parent Dashboard] getParentProfile unsuccessful payload:', res);
          }
          setError(res.message || 'Unable to load profile.');
        }
      } catch (err: any) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[Parent Dashboard] Error accessing parent profile:', {
            endpoint: '/api/parents/me',
            status: err.response?.status,
            data: err.response?.data,
            message: err.message,
          });
        }
        setError(err.response?.data?.message || err.message || 'Failed to load parent portal data.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200/70 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-72 bg-slate-200/70 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-rose-200 text-rose-800 space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold">Error Accessing Parent Portal</h2>
        <p className="text-xs text-rose-600 max-w-md mx-auto">{error}</p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#2F7C7A] text-white hover:bg-[#256361] transition-colors cursor-pointer"
          >
            Retry Loading Portal
          </button>
        </div>
      </div>
    );
  }

  const students = profile?.studentIds || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#175C34] to-[#23804A] text-white p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-semibold tracking-wide backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Markaz Sanaviyya Guardian Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">
            Welcome, {profile?.name || 'Parent'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
            Manage examination registrations, monitor institutional progress, and securely review academic syllabuses and results for your linked children.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-[#E3EAE5] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Linked Children</span>
            <Users className="w-4 h-4 text-[#23804A]" />
          </div>
          <p className="text-2xl font-bold font-serif text-[#171D19]">{students.length}</p>
          <p className="text-[11px] text-slate-400">Enrolled candidates under guardian profile</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E3EAE5] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Curriculum & Syllabus</span>
            <BookOpen className="w-4 h-4 text-[#23804A]" />
          </div>
          <Link
            href="/parent/syllabus"
            className="inline-flex items-center text-xs font-bold text-[#23804A] hover:underline"
          >
            Explore Syllabus <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
          <p className="text-[11px] text-slate-400">View Kitab units & download study outlines</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E3EAE5] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Examinations & Fees</span>
            <FileCheck className="w-4 h-4 text-[#23804A]" />
          </div>
          <Link
            href="/parent/examinations"
            className="inline-flex items-center text-xs font-bold text-[#23804A] hover:underline"
          >
            Review Registered Exams <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
          <p className="text-[11px] text-slate-400">Verify fees & download official hall tickets</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E3EAE5] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Payment Records</span>
            <CreditCard className="w-4 h-4 text-[#23804A]" />
          </div>
          <Link
            href="/parent/payments"
            className="inline-flex items-center text-xs font-bold text-[#23804A] hover:underline"
          >
            Open Payment Ledger <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
          <p className="text-[11px] text-slate-400">View transaction receipts and history</p>
        </div>
      </div>

      {/* Linked Children Directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-serif text-[#171D19]">Linked Children</h2>
          <span className="text-xs font-semibold text-slate-500">{students.length} Total</span>
        </div>

        {students.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-[#E3EAE5] space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No linked student profiles found</p>
            <p className="text-xs text-slate-400">
              Please contact the council administration if your ward is not listed under your account.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {students.map((student: ParentStudent) => (
              <div
                key={student._id}
                className="bg-white rounded-xl border border-[#E3EAE5] p-6 shadow-2xs hover:border-[#23804A] transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-[#171D19]">{student.nameEnglish}</h3>
                    {student.nameArabic && (
                      <p className="text-sm font-serif text-slate-500 font-arabic">{student.nameArabic}</p>
                    )}
                    <span className="inline-block mt-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Reg: {student.registrationNumber || 'Under Generation'}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {student.status || 'ACTIVE'}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Class:</span>{' '}
                    <span className="font-semibold text-slate-800">
                      {student.classId?.name || 'Class Assigned'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/parent/syllabus?studentId=${student._id}`}
                      className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-[#23804A] transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 mr-1" /> Syllabus
                    </Link>
                    <Link
                      href={`/parent/examinations?studentId=${student._id}`}
                      className="inline-flex items-center text-xs font-bold text-[#23804A] hover:underline"
                    >
                      Exams <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
