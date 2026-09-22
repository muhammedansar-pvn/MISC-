'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getSyllabuses, getSubjects } from '@/services/academic.service';
import { getStudentProfile } from '@/services/student.service';
import { Syllabus, Subject, StudentProfile } from '@/types';
import {
  BookOpen,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  GraduationCap,
  Layers,
  CheckCircle2,
} from 'lucide-react';

function SyllabusContent() {
  const searchParams = useSearchParams();
  const initialSubjectId = searchParams?.get('subjectId') || '';

  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profileRes, subjectsRes] = await Promise.allSettled([
          getStudentProfile(),
          getSubjects(),
        ]);

        let classId: string | undefined;
        if (profileRes.status === 'fulfilled' && profileRes.value.success && profileRes.value.data) {
          setProfile(profileRes.value.data);
          const cId = (profileRes.value.data.classId as any)?._id || profileRes.value.data.classId;
          if (typeof cId === 'string') classId = cId;
        }

        if (subjectsRes.status === 'fulfilled' && subjectsRes.value.success && Array.isArray(subjectsRes.value.data)) {
          setSubjects(subjectsRes.value.data);
        }

        // Fetch syllabuses (optionally filtered by student's classId if available)
        const params: any = {};
        if (classId) params.classId = classId;
        const syllabusRes = await getSyllabuses(params);
        if (syllabusRes.success && Array.isArray(syllabusRes.data)) {
          setSyllabuses(syllabusRes.data);
          if (syllabusRes.data.length > 0) {
            setExpandedId(syllabusRes.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load syllabuses:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredSyllabuses = syllabuses.filter((s) => {
    const subjectId = (s.subjectId as any)?._id || s.subjectId;
    const matchesSubject = !selectedSubjectId || subjectId === selectedSubjectId;
    const subjectName = (s.subjectId as any)?.subjectName || (s.subjectId as any)?.name || '';
    const matchesSearch =
      !searchQuery ||
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subjectName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSubject && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-12 bg-slate-200/70 animate-pulse rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200/70 animate-pulse rounded-xl" />
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
            <Link href="/student" className="hover:text-[#2F7C7A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Syllabus Explorer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Curriculum Syllabus & Units
          </h1>
        </div>

        <div className="text-xs text-slate-500 bg-white px-3.5 py-2 rounded-lg border border-[#E2E8E0] self-start sm:self-auto">
          Enrolled: <span className="font-semibold text-slate-800">{(profile?.classId as any)?.className || 'General Curriculum'}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-[#E2E8E0] shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search syllabus by title, topic, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full md:w-56 py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white text-slate-700 font-medium"
          >
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name} ({sub.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Syllabus List */}
      <div className="space-y-4">
        {filteredSyllabuses.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-[#E2E8E0] space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No syllabus entries found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No official syllabus matched your selected filter. Try clearing your search query or choosing another subject.
            </p>
          </div>
        ) : (
          filteredSyllabuses.map((syl) => {
            const isExpanded = expandedId === syl._id;
            const subject = (syl.subjectId as any);

            return (
              <div
                key={syl._id}
                className="bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleExpand(syl._id)}
                  className="w-full p-5 text-left flex items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-800">
                        {subject?.code || 'SUBJECT'}
                      </span>
                      <h3 className="font-bold text-base text-[#132238]">
                        {syl.title}
                      </h3>
                      {syl.version && (
                        <span className="text-[11px] font-semibold text-[#2F7C7A] bg-[#E6F2F1] px-2 py-0.5 rounded">
                          v{syl.version}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Subject: {subject?.name || 'General Curriculum'}
                    </p>
                  </div>

                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-slate-100 space-y-6">
                    {syl.description && (
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Module Overview
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg">
                          {syl.description}
                        </p>
                      </div>
                    )}

                    {/* Units & Topics */}
                    {syl.units && syl.units.length > 0 ? (
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                          <Layers className="w-4 h-4 text-[#2F7C7A]" />
                          <span>Course Units & Topics</span>
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {syl.units.map((unit, uIdx) => (
                            <div
                              key={uIdx}
                              className="p-4 rounded-lg bg-slate-50/80 border border-slate-200/80 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#132238]">
                                  Unit {uIdx + 1}: {unit.title || unit.unitTitle || `Topic Module`}
                                </span>
                              </div>
                              {unit.topics && (
                                <p className="text-xs text-slate-600 leading-relaxed">
                                  {Array.isArray(unit.topics) ? unit.topics.join(', ') : unit.topics}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No detailed unit subdivisions listed.</p>
                    )}

                    {syl.fileUrl && (
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500">Official Syllabus Document:</span>
                        <a
                          href={syl.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#2F7C7A] hover:bg-[#286b69] text-white text-xs font-semibold"
                        >
                          View Document
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

export default function StudentSyllabusPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 text-xs">
          Loading syllabus explorer...
        </div>
      }
    >
      <SyllabusContent />
    </Suspense>
  );
}
