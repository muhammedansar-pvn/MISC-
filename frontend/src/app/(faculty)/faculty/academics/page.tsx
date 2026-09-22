'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAcademicYears, getClasses, getSubjects } from '@/services/academic.service';
import { AcademicYear, ClassModel, Subject } from '@/types';
import {
  GraduationCap,
  Calendar,
  Building2,
  Layers,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export default function FacultyAcademicsPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAcademicData() {
      try {
        setLoading(true);
        const [yearsRes, classesRes, subjectsRes] = await Promise.allSettled([
          getAcademicYears(),
          getClasses(),
          getSubjects(),
        ]);

        if (yearsRes.status === 'fulfilled' && yearsRes.value.success && Array.isArray(yearsRes.value.data)) {
          setAcademicYears(yearsRes.value.data);
        }

        if (classesRes.status === 'fulfilled' && classesRes.value.success && Array.isArray(classesRes.value.data)) {
          setClasses(classesRes.value.data);
        }

        if (subjectsRes.status === 'fulfilled' && subjectsRes.value.success && Array.isArray(subjectsRes.value.data)) {
          setSubjects(subjectsRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load academic overview:', err);
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
        <div className="h-32 bg-slate-200/70 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200/70 animate-pulse rounded-xl" />
          <div className="h-64 bg-slate-200/70 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  const activeYear = academicYears.find((y) => y.isCurrent || y.status === 'ACTIVE') || academicYears[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/faculty" className="hover:text-[#2F7C7A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Academics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Academic Structure & Framework
          </h1>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <Link
            href="/faculty/classes"
            className="inline-flex items-center text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg shadow-2xs transition-all"
          >
            <Building2 className="w-3.5 h-3.5 mr-1.5" /> View Classes
          </Link>
          <Link
            href="/faculty/subjects"
            className="inline-flex items-center text-xs font-semibold text-white bg-[#2F7C7A] hover:bg-[#286b69] px-3.5 py-2 rounded-lg shadow-2xs transition-all"
          >
            <Layers className="w-3.5 h-3.5 mr-1.5" /> View Subjects
          </Link>
        </div>
      </div>

      {/* Session Overview Banner */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] p-6 sm:p-8 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#2F7C7A]">
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Current Session</span>
            </div>
            <h2 className="text-xl font-bold text-[#132238]">
              {activeYear?.yearName || activeYear?.yearCode || 'Academic Session'}
            </h2>
            <p className="text-xs text-slate-500">
              Code: <span className="font-mono font-medium">{activeYear?.yearCode || 'ACTIVE'}</span>
            </p>
          </div>

          <div className="space-y-2 pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center space-x-2 text-[#2F7C7A]">
              <Building2 className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Authorized Classes</span>
            </div>
            <h2 className="text-xl font-bold text-[#132238]">{classes.length} Classes</h2>
            <p className="text-xs text-slate-500">Authorized teaching cohorts</p>
          </div>

          <div className="space-y-2 pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center space-x-2 text-[#2F7C7A]">
              <Layers className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Curriculum Courses</span>
            </div>
            <h2 className="text-xl font-bold text-[#132238]">{subjects.length} Subjects</h2>
            <p className="text-xs text-slate-500">Approved syllabus frameworks</p>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Classes & Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes Preview */}
        <div className="bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-[#E2E8E0] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-[#2F7C7A]" />
              <h3 className="font-bold text-sm text-[#132238]">Authorized Classes</h3>
            </div>
            <Link
              href="/faculty/classes"
              className="text-xs font-semibold text-[#2F7C7A] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="p-5">
            {classes.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No classes registered in curriculum.
              </div>
            ) : (
              <div className="space-y-3">
                {classes.slice(0, 4).map((cls) => (
                  <div
                    key={cls._id}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-900">{cls.name || cls.className}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">Code: {cls.code}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {cls.status || 'ACTIVE'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Subjects Preview */}
        <div className="bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-[#E2E8E0] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#2F7C7A]" />
              <h3 className="font-bold text-sm text-[#132238]">Curriculum Subjects</h3>
            </div>
            <Link
              href="/faculty/subjects"
              className="text-xs font-semibold text-[#2F7C7A] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="p-5">
            {subjects.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No subjects registered in curriculum.
              </div>
            ) : (
              <div className="space-y-3">
                {subjects.slice(0, 4).map((sub) => (
                  <div
                    key={sub._id}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-900">{sub.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Code: {sub.code} • Credits: {sub.credits}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {sub.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
