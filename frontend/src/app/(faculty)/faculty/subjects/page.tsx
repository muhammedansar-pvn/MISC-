'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyAssignments } from '@/services/faculty.service';
import { FacultyAssignment } from '@/types';
import {
  Layers,
  Search,
  BookOpen,
  CalendarCheck,
  Award,
  FileText,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
} from 'lucide-react';

export default function FacultySubjectsPage() {
  const [assignments, setAssignments] = useState<FacultyAssignment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllocations() {
      try {
        setLoading(true);
        const res = await getMyAssignments();
        if (res.success && Array.isArray(res.data)) {
          setAssignments(res.data);
        }
      } catch (err) {
        console.error('Failed to load teaching allocations:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAllocations();
  }, []);

  // Distinct classes for filtering
  const distinctClassesMap = new Map<string, string>();
  assignments.forEach((a) => {
    if (a.classId) {
      distinctClassesMap.set(a.classId._id, a.classId.name);
    }
  });

  const filteredAssignments = assignments.filter((asgn) => {
    const q = searchQuery.toLowerCase();
    const subName = (asgn.subjectId?.name || asgn.subjectId?.subjectName || '').toLowerCase();
    const subCode = (asgn.subjectId?.code || asgn.subjectId?.subjectCode || '').toLowerCase();
    const clsName = (asgn.classId?.name || '').toLowerCase();

    const matchesSearch = !searchQuery || subName.includes(q) || subCode.includes(q) || clsName.includes(q);
    const matchesClass = selectedClassFilter === 'ALL' || asgn.classId?._id === selectedClassFilter;

    return matchesSearch && matchesClass;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-12 bg-slate-200/70 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-slate-200/70 animate-pulse rounded-xl" />
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
            <span className="text-slate-900 font-semibold">Teaching Allocations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238] flex items-center gap-2">
            <Layers className="w-7 h-7 text-[#2F7C7A]" />
            Faculty Teaching Allocations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Subjects and class cohorts assigned to you by administration. Fully scoped to attendance, marks, and homework.
          </p>
        </div>

        <Link
          href="/faculty"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#2F7C7A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assigned subjects or classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#2F7C7A]"
          />
        </div>

        <select
          value={selectedClassFilter}
          onChange={(e) => setSelectedClassFilter(e.target.value)}
          className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[#132238] focus:outline-hidden focus:border-[#2F7C7A]"
        >
          <option value="ALL">All Assigned Classes ({assignments.length})</option>
          {Array.from(distinctClassesMap.entries()).map(([cId, cName]) => (
            <option key={cId} value={cId}>
              {cName}
            </option>
          ))}
        </select>
      </div>

      {/* Allocations Grid */}
      {filteredAssignments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E2E8E0] space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No teaching allocations found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {assignments.length === 0
              ? 'You have not been assigned to teach any subjects in any classes yet.'
              : 'No teaching allocations match your filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssignments.map((asgn) => {
            const sub = asgn.subjectId;
            const cls = asgn.classId;
            const ay = asgn.academicYearId;

            return (
              <div
                key={asgn._id}
                className="bg-white rounded-xl border border-[#E2E8E0] p-5 shadow-2xs hover:border-[#2F7C7A] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {sub?.code || sub?.subjectCode || 'SUB'}
                    </span>
                    <div className="flex items-center space-x-1">
                      {asgn.isPrimary && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-[#2F7C7A] border border-teal-200">
                          Lead Faculty
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {sub?.type || 'THEORY'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-[#132238]">
                      {sub?.name || sub?.subjectName || 'Subject Paper'}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-[#2F7C7A]" />
                      <span className="font-semibold text-slate-700">{cls?.name || 'Assigned Class'}</span>
                    </div>
                    {ay && (
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Academic Year: {ay.yearName}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Credits: <strong className="text-slate-800">{sub?.credits ?? 3}</strong></span>
                    {sub?.category && (
                      <span className="font-medium text-slate-600">{sub.category}</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <Link
                    href={`/faculty/attendance?classId=${cls?._id}&subjectId=${sub?._id}`}
                    className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-teal-50 text-[#2F7C7A] hover:bg-teal-100 font-semibold transition-all border border-teal-200"
                  >
                    <CalendarCheck className="w-3.5 h-3.5 mr-1" /> Mark Attendance
                  </Link>

                  <Link
                    href={`/faculty/assignments?classId=${cls?._id}&subjectId=${sub?._id}`}
                    className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 font-semibold transition-all border border-slate-200"
                  >
                    <Award className="w-3.5 h-3.5 mr-1" /> Homework
                  </Link>

                  <Link
                    href={`/faculty/resources?classId=${cls?._id}&subjectId=${sub?._id}`}
                    className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 font-semibold transition-all border border-slate-200"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" /> Materials
                  </Link>

                  <Link
                    href={`/faculty/syllabus?subjectId=${sub?._id}`}
                    className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 font-semibold transition-all border border-slate-200"
                  >
                    <BookOpen className="w-3.5 h-3.5 mr-1" /> Syllabus
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
