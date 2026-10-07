'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getSyllabuses, getSubjects } from '@/services/academic.service';
import { getStudentProfile } from '@/services/student.service';
import { Syllabus, Subject, StudentProfile } from '@/types';
import { getFileUrl } from '@/utils/fileUrl';
import {
  BookOpen,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  Layers,
  Paperclip,
  ExternalLink,
  Download,
} from 'lucide-react';

function SyllabusContent() {
  const searchParams = useSearchParams();
  const initialSubjectId = searchParams?.get('subjectId') || '';

  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId);
  const [selectedExamType, setSelectedExamType] = useState<string>('');
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
          const rawSubs = subjectsRes.value.data;
          const filtered = classId
            ? rawSubs.filter((s: any) => !s.classes || s.classes.length === 0 || s.classes.some((c: any) => (c?._id || c) === classId))
            : rawSubs;
          setSubjects(filtered);
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

  const filteredSyllabuses = syllabuses.filter((s: any) => {
    const subjectId = (s.subjectId as any)?._id || s.subjectId;
    const matchesSubject = !selectedSubjectId || subjectId === selectedSubjectId;
    const matchesExamType = !selectedExamType || s.examType === selectedExamType;

    const subjectName = (s.subjectId as any)?.subjectName || (s.subjectId as any)?.name || '';
    const subjectCode = (s.subjectId as any)?.subjectCode || (s.subjectId as any)?.code || '';
    const kitabName = s.kitabName || s.title || '';

    const matchesSearch =
      !searchQuery ||
      kitabName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(s.units) && s.units.some((u: any) => u.title?.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesSubject && matchesExamType && matchesSearch;
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
            <Link href="/student" className="hover:text-[#23804A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Syllabus Explorer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#171D19]">
            Curriculum Syllabus & Units
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access official Kitab syllabuses, unit breakdowns, and download curriculum documents.
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-white px-3.5 py-2 rounded-xl border border-[#E3EAE5] self-start sm:self-auto shadow-xs">
          Enrolled Class:{' '}
          <span className="font-semibold text-slate-800">
            {(profile?.classId as any)?.name || (profile?.classId as any)?.code || (profile?.classId as any)?.className || 'Markaz Sanaviyya'}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-[#E3EAE5] shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Kitab name, unit, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23804A]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full md:w-48 py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23804A] bg-white text-slate-700 font-medium"
          >
            <option value="">All Subjects</option>
            {subjects.map((sub: any) => (
              <option key={sub._id} value={sub._id}>
                {sub.subjectName || sub.name} ({sub.subjectCode || sub.code})
              </option>
            ))}
          </select>

          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            className="w-full md:w-40 py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23804A] bg-white text-slate-700 font-medium"
          >
            <option value="">All Exam Types</option>
            <option value="HALF_YEARLY">Half Yearly</option>
            <option value="ANNUAL">Annual</option>
          </select>
        </div>
      </div>

      {/* Syllabus List */}
      <div className="space-y-4">
        {filteredSyllabuses.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-[#E3EAE5] space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No syllabus entries found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No official syllabus matched your selected filter. Try clearing your search query or choosing another subject.
            </p>
          </div>
        ) : (
          filteredSyllabuses.map((syl: any) => {
            const isExpanded = expandedId === syl._id;
            const subject = syl.subjectId as any;
            const classObj = syl.classId as any;
            const resolvedFileUrl = getFileUrl(syl.fileUrl);

            return (
              <div
                key={syl._id}
                className="bg-white rounded-xl border border-[#E3EAE5] shadow-xs overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleExpand(syl._id)}
                  className="w-full p-5 text-left flex items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-800">
                        {subject?.subjectCode || subject?.code || 'SUBJECT'}
                      </span>
                      {classObj && (
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {classObj.name || classObj.code}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          syl.examType === 'ANNUAL'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {syl.examType === 'ANNUAL' ? 'Annual' : 'Half Yearly'}
                      </span>
                      {syl.fileUrl && (
                        <span className="inline-flex items-center text-[11px] font-semibold text-[#23804A] bg-[#EAF2EC] px-2 py-0.5 rounded gap-1">
                          <Paperclip className="w-3 h-3" /> Document
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-[#171D19]">
                      {syl.kitabName || syl.title}
                    </h3>

                    <p className="text-xs text-slate-500">
                      Subject: <span className="font-medium text-slate-700">{subject?.subjectName || subject?.name || 'General Curriculum'}</span>
                      {syl.academicYearId && (
                        <> • Academic Year: <span className="font-medium text-slate-700">{syl.academicYearId?.yearName || syl.academicYearId?.yearCode || 'Current'}</span></>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium text-slate-500 hidden sm:inline-block">
                      {Array.isArray(syl.units) ? syl.units.length : 0} Units
                    </span>
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-slate-100 space-y-5">
                    {/* Units & Chapters */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                        <Layers className="w-4 h-4 text-[#23804A]" />
                        <span>Curriculum Units ({Array.isArray(syl.units) ? syl.units.length : 0})</span>
                      </span>

                      {syl.units && syl.units.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {syl.units.map((unit: any, uIdx: number) => (
                            <div
                              key={uIdx}
                              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5"
                            >
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#EAF2EC] text-[#23804A] shrink-0 mt-0.5">
                                Unit {unit.unitNumber || uIdx + 1}
                              </span>
                              <span className="text-xs font-semibold text-[#171D19] leading-tight">
                                {unit.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No specific units defined for this syllabus.</p>
                      )}
                    </div>

                    {/* Official Syllabus Document File */}
                    {syl.fileUrl && (
                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#EAF2EC] text-[#23804A] flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              {syl.fileName || 'Official Syllabus Document'}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Attached document for {syl.kitabName || syl.title} ({syl.examType === 'ANNUAL' ? 'Annual' : 'Half Yearly'})
                            </p>
                          </div>
                        </div>

                        <a
                          href={resolvedFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#23804A] hover:bg-[#1B6F41] text-white text-xs font-bold transition-all shadow-xs gap-1.5 cursor-pointer self-start sm:self-auto"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download / Open PDF</span>
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
