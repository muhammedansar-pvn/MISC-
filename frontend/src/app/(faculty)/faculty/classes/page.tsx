'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getClasses } from '@/services/academic.service';
import { ClassModel } from '@/types';
import {
  Building2,
  Search,
  BookOpen,
  CheckSquare,
  ArrowRight,
  ArrowLeft,
  Users,
} from 'lucide-react';

export default function FacultyClassesPage() {
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClasses() {
      try {
        setLoading(true);
        const res = await getClasses();
        if (res.success && Array.isArray(res.data)) {
          setClasses(res.data);
        }
      } catch (err) {
        console.error('Failed to load faculty classes:', err);
      } finally {
        setLoading(false);
      }
    }

    loadClasses();
  }, []);

  const filteredClasses = classes.filter((cls) => {
    const q = searchQuery.toLowerCase();
    const name = (cls.name || cls.className || '').toLowerCase();
    const code = (cls.code || '').toLowerCase();
    return !searchQuery || name.includes(q) || code.includes(q);
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-12 bg-slate-200/70 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-slate-200/70 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

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
            <span className="text-slate-900 font-semibold">Assigned Classes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Authorized Classes & Cohorts
          </h1>
        </div>

        <Link
          href="/faculty"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#2F7C7A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter classes by title, section, or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#2F7C7A]"
        />
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E2E8E0] space-y-3">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No classes found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No class records match your search or have been authorized in this academic curriculum.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => {
            const academicYear = (cls.academicYearId as any);

            return (
              <div
                key={cls._id}
                className="bg-white rounded-xl border border-[#E2E8E0] p-5 shadow-2xs hover:border-[#2F7C7A] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {cls.code || 'CLS'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {cls.status || 'ACTIVE'}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-[#132238]">{cls.name || cls.className}</h3>
                  <p className="text-xs text-slate-500">
                    Session: {academicYear?.yearName || academicYear?.yearCode || 'Active Session'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Link
                    href={`/faculty/syllabus?classId=${cls._id}`}
                    className="inline-flex items-center font-medium text-slate-600 hover:text-[#2F7C7A] transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 mr-1" /> Syllabus
                  </Link>
                  <Link
                    href={`/faculty/marks`}
                    className="inline-flex items-center font-semibold text-[#2F7C7A] hover:underline"
                  >
                    <CheckSquare className="w-3.5 h-3.5 mr-1" /> Evaluate <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
