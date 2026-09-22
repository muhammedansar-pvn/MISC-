'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getClasses } from '@/services/academic.service';
import { ClassModel } from '@/types';
import {
  BookOpen,
  Search,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
  Users,
  CheckCircle2,
} from 'lucide-react';

export default function InstitutionClassesPage() {
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    async function loadClassesData() {
      try {
        setLoading(true);
        const res = await getClasses();
        if (res.success && Array.isArray(res.data)) {
          setClasses(res.data);
        }
      } catch (err) {
        console.error('Failed to load institution classes:', err);
      } finally {
        setLoading(false);
      }
    }

    loadClassesData();
  }, []);

  const filteredClasses = classes.filter((cls) => {
    const q = searchQuery.toLowerCase();
    const name = (cls.name || cls.className || '').toLowerCase();
    const stream = ((cls as any).stream || cls.code || '').toLowerCase();
    const nameMatch = name.includes(q) || stream.includes(q);
    const statusMatch = statusFilter === 'ALL' || (cls.status || 'ACTIVE') === statusFilter;
    return nameMatch && statusMatch;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/institution/dashboard" className="hover:text-[#2F7C7A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Classes</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#132238]">
            Authorized Class Cohorts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active class divisions and instructional cohort streams assigned to your campus.
          </p>
        </div>

        <Link
          href="/institution/dashboard"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8E0] shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search class by title, stream code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-800"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-700 w-full sm:w-40"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>

      {/* Class Cohorts Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8E0] p-16 text-center text-slate-500 shadow-2xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No class divisions found</p>
          <p className="text-xs text-slate-400 mt-1">
            {classes.length === 0
              ? 'No classes are currently assigned to this institution.'
              : 'No classes match your search query.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => {
            const ay = (cls.academicYearId as any);
            return (
              <div
                key={cls._id}
                className="bg-white rounded-xl border border-[#E2E8E0] p-5 shadow-2xs hover:shadow-sm hover:border-[#2F7C7A] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#2F7C7A] flex items-center justify-center font-bold text-sm shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {cls.status || 'ACTIVE'}
                    </span>
                  </div>

                  <h2 className="font-bold text-base text-[#132238] leading-snug">
                    {cls.name || cls.className}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Stream: <span className="font-mono font-semibold text-slate-700">{(cls as any).stream || cls.code || 'Integrated'}</span>
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Academic Year:</span>
                      <span className="font-medium text-slate-800">{ay?.yearName || ay?.name || 'Current Session'}</span>
                    </div>
                    {(cls as any).section && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Section:</span>
                        <span className="font-medium text-slate-800">{(cls as any).section}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/institution/students?classId=${cls._id}`}
                    className="text-xs font-semibold text-[#2F7C7A] hover:underline inline-flex items-center"
                  >
                    <span>View Candidates</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                  <Link
                    href="/institution/academics"
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Curriculum
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
