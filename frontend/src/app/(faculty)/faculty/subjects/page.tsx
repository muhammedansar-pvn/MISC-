'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSubjects } from '@/services/academic.service';
import { Subject } from '@/types';
import {
  Layers,
  Search,
  BookOpen,
  CheckSquare,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export default function FacultySubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubjects() {
      try {
        setLoading(true);
        const res = await getSubjects();
        if (res.success && Array.isArray(res.data)) {
          setSubjects(res.data);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSubjects();
  }, []);

  const filteredSubjects = subjects.filter((sub) => {
    const q = searchQuery.toLowerCase();
    const name = (sub.name || '').toLowerCase();
    const code = (sub.code || '').toLowerCase();
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
            <span className="text-slate-900 font-semibold">Curriculum Subjects</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Curriculum Courses & Teaching Modules
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
          placeholder="Search subjects by course name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#2F7C7A]"
        />
      </div>

      {/* Subjects Grid */}
      {filteredSubjects.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E2E8E0] space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No subjects found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No curriculum subjects match your search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((sub) => (
            <div
              key={sub._id}
              className="bg-white rounded-xl border border-[#E2E8E0] p-5 shadow-2xs hover:border-[#2F7C7A] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {sub.code || 'SUB'}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {sub.type || 'THEORY'}
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#132238]">{sub.name}</h3>
                <p className="text-xs text-slate-500">
                  Credit Hours: <span className="font-bold text-slate-800">{sub.credits}</span> • Status: <span className="text-emerald-700 font-semibold">{sub.status || 'Active'}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link
                  href={`/faculty/syllabus?subjectId=${sub._id}`}
                  className="inline-flex items-center font-medium text-slate-600 hover:text-[#2F7C7A] transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1" /> View Syllabus
                </Link>
                <Link
                  href="/faculty/marks"
                  className="inline-flex items-center font-semibold text-[#2F7C7A] hover:underline"
                >
                  <CheckSquare className="w-3.5 h-3.5 mr-1" /> Enter Marks <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
