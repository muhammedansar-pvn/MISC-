'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStudentProfile } from '@/services/student.service';
import { getSubjects, getAcademicYears } from '@/services/academic.service';
import { StudentProfile, Subject, AcademicYear } from '@/types';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export default function StudentAcademicsPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAcademicData() {
      try {
        setLoading(true);
        const [profileRes, subjectsRes, yearsRes] = await Promise.allSettled([
          getStudentProfile(),
          getSubjects(),
          getAcademicYears(),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value.success && profileRes.value.data) {
          setProfile(profileRes.value.data);
        }

        if (subjectsRes.status === 'fulfilled' && subjectsRes.value.success && Array.isArray(subjectsRes.value.data)) {
          setSubjects(subjectsRes.value.data);
        }

        if (yearsRes.status === 'fulfilled' && yearsRes.value.success && Array.isArray(yearsRes.value.data)) {
          setAcademicYears(yearsRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load academic details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAcademicData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-40 bg-slate-200/70 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200/70 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const enrolledClass = (profile?.classId as any);
  const institution = (profile?.institutionId as any);
  const activeAcademicYear = academicYears.find((y) => y.isCurrent || y.status === 'ACTIVE') || academicYears[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/student" className="hover:text-[#2F7C7A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Academics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Academic Structure & Curriculum
          </h1>
        </div>

        <Link
          href="/student/syllabus"
          className="inline-flex items-center text-xs font-semibold text-white px-4 py-2 rounded-lg bg-[#2F7C7A] hover:bg-[#286b69] shadow-2xs transition-all self-start sm:self-auto"
        >
          <BookOpen className="w-3.5 h-3.5 mr-1.5" /> View Detailed Syllabus
        </Link>
      </div>

      {/* Program Summary Banner */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] p-6 sm:p-8 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#2F7C7A]">
              <GraduationCap className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Enrolled Class</span>
            </div>
            <h2 className="text-xl font-bold text-[#132238]">
              {enrolledClass?.name || enrolledClass?.className || 'Sanaviyya Standard'}
            </h2>
            <p className="text-xs text-slate-500">
              Code: {enrolledClass?.code || 'STD'} • Admission Year: {profile?.admissionYear || 'Current'}
            </p>
          </div>

          <div className="space-y-2 pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center space-x-2 text-[#2F7C7A]">
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Academic Year</span>
            </div>
            <h2 className="text-xl font-bold text-[#132238]">
              {activeAcademicYear?.yearName || activeAcademicYear?.yearCode || 'Academic Session'}
            </h2>
            <p className="text-xs text-slate-500">
              Status: <span className="text-emerald-700 font-semibold">{activeAcademicYear?.status || 'Active'}</span>
            </p>
          </div>

          <div className="space-y-2 pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center space-x-2 text-[#2F7C7A]">
              <Building2 className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Institution</span>
            </div>
            <h2 className="text-xl font-bold text-[#132238] truncate">
              Markaz Sanaviyya
            </h2>
            <p className="text-xs text-slate-500">
              Institute Code: <span className="font-mono font-medium">SANAVIYYA</span>
            </p>
          </div>
        </div>
      </div>

      {/* Curriculum Subjects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-serif text-[#132238]">Curriculum Subjects</h2>
            <p className="text-xs text-slate-500">
              Official subjects and syllabus modules authorized under this academic structure.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            {subjects.length} Subjects
          </span>
        </div>

        {subjects.length === 0 ? (
          <div className="p-8 rounded-xl bg-white border border-[#E2E8E0] text-center text-xs text-slate-500">
            No subjects listed for this academic curriculum yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((sub: any) => (
              <div
                key={sub._id}
                className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs hover:border-[#2F7C7A] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {sub.subjectCode || sub.code || 'SUB'}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <h3 className="font-bold text-sm text-[#132238]">{sub.subjectName || sub.name}</h3>
                  <p className="text-xs text-slate-500">
                    Category: <span className="font-semibold text-slate-700">{sub.category || 'GENERAL'}</span>
                  </p>
                </div>


                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Curriculum Module</span>
                  <Link
                    href={`/student/syllabus?subjectId=${sub._id}`}
                    className="inline-flex items-center font-semibold text-[#2F7C7A] hover:underline"
                  >
                    Syllabus <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
