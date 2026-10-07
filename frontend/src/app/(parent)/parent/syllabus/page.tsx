'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  Layers,
  Paperclip,
  Download,
  Users,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { getParentStudents, getLinkedStudentSyllabus, ParentStudent } from '@/services/parent.service';
import { getSubjects } from '@/services/academic.service';
import { Syllabus, Subject } from '@/types';
import { getFileUrl } from '@/utils/fileUrl';

function ParentSyllabusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStudentId = searchParams?.get('studentId') || '';

  const [students, setStudents] = useState<ParentStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId);
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingSyllabus, setLoadingSyllabus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load students and subjects on mount
  useEffect(() => {
    async function initData() {
      try {
        setLoadingStudents(true);
        setError(null);

        const [studentsRes, subjectsRes] = await Promise.allSettled([
          getParentStudents(),
          getSubjects(),
        ]);

        let studentList: ParentStudent[] = [];
        if (studentsRes.status === 'fulfilled' && studentsRes.value.success) {
          studentList = studentsRes.value.data?.students || (studentsRes.value as any).students || [];
          setStudents(studentList);
        }

        if (subjectsRes.status === 'fulfilled' && subjectsRes.value.success && Array.isArray(subjectsRes.value.data)) {
          setSubjects(subjectsRes.value.data);
        }

        // Determine active student
        if (studentList.length > 0) {
          if (initialStudentId && studentList.some((s) => s._id === initialStudentId)) {
            setSelectedStudentId(initialStudentId);
          } else {
            setSelectedStudentId(studentList[0]._id);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load linked students');
      } finally {
        setLoadingStudents(false);
      }
    }

    initData();
  }, [initialStudentId]);

  // Load syllabus whenever selectedStudentId changes
  useEffect(() => {
    if (!selectedStudentId) {
      setSyllabuses([]);
      return;
    }

    async function loadSyllabusForStudent() {
      try {
        setLoadingSyllabus(true);
        setError(null);
        const res = await getLinkedStudentSyllabus(selectedStudentId);
        if (res.success) {
          const sylData = res.data?.syllabuses || res.data?.data || [];
          setSyllabuses(Array.isArray(sylData) ? sylData : []);
          if (Array.isArray(sylData) && sylData.length > 0) {
            setExpandedId(sylData[0]._id);
          } else {
            setExpandedId(null);
          }
        } else {
          setError(res.message || 'Failed to load student syllabus');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to load student syllabus');
      } finally {
        setLoadingSyllabus(false);
      }
    }

    loadSyllabusForStudent();
  }, [selectedStudentId]);

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    router.push(`/parent/syllabus?studentId=${id}`);
  };

  const selectedStudent = useMemo(
    () => students.find((s) => s._id === selectedStudentId),
    [students, selectedStudentId]
  );

  const filteredSyllabuses = useMemo(() => {
    return syllabuses.filter((s: any) => {
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
        (Array.isArray(s.units) &&
          s.units.some((u: any) => u.title?.toLowerCase().includes(searchQuery.toLowerCase())));

      return matchesSubject && matchesExamType && matchesSearch;
    });
  }, [syllabuses, selectedSubjectId, selectedExamType, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const availableSubjectsForStudent = useMemo(() => {
    const studentClassId = (selectedStudent?.classId as any)?._id || selectedStudent?.classId;
    if (!studentClassId) return subjects;
    return subjects.filter((sub: any) => {
      if (!sub.classes || sub.classes.length === 0) return true;
      return sub.classes.some((c: any) => (c?._id || c) === studentClassId);
    });
  }, [subjects, selectedStudent]);

  if (loadingStudents) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-16 bg-slate-200/70 animate-pulse rounded-xl" />
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/parent" className="hover:text-[#23804A] transition-colors">
              Overview
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Curriculum & Syllabus</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#171D19]">
            Curriculum & Kitab Syllabus
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review academic curricula, unit topics, and official study outlines for your linked children.
          </p>
        </div>

        {students.length > 1 && (
          <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-xl border border-[#E3EAE5] shadow-xs">
            <Users className="w-4 h-4 text-[#23804A]" />
            <span className="text-xs text-slate-500">Child:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.nameEnglish}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Child Switcher Pills (If multiple children) */}
      {students.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {students.map((student) => {
            const isSelected = student._id === selectedStudentId;
            return (
              <button
                key={student._id}
                onClick={() => handleStudentChange(student._id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-[#23804A] text-white border-[#23804A] shadow-xs'
                    : 'bg-white text-slate-600 border-[#E3EAE5] hover:border-slate-300'
                }`}
              >
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span>{student.nameEnglish}</span>
                {student.classId?.name && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {student.classId.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Child Profile Information Banner */}
      {selectedStudent && (
        <div className="bg-white rounded-xl border border-[#E3EAE5] p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#EAF2EC] text-[#23804A] flex items-center justify-center font-bold font-serif text-lg shrink-0">
              {selectedStudent.nameEnglish.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-[#171D19]">{selectedStudent.nameEnglish}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedStudent.status || 'ACTIVE'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
                <span>
                  Reg: <strong className="text-slate-700">{selectedStudent.registrationNumber || 'Pending'}</strong>
                </span>
                <span>•</span>
                <span>
                  Class:{' '}
                  <strong className="text-slate-700">
                    {selectedStudent.classId?.name || selectedStudent.classId?.code || 'Not Assigned'}
                  </strong>
                </span>
                {selectedStudent.institutionId?.name && (
                  <>
                    <span>•</span>
                    <span>
                      Institution: <strong className="text-slate-700">{selectedStudent.institutionId.name}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (selectedStudentId) {
                setLoadingSyllabus(true);
                getLinkedStudentSyllabus(selectedStudentId)
                  .then((res) => {
                    const sylData = res.data?.syllabuses || res.data?.data || [];
                    setSyllabuses(Array.isArray(sylData) ? sylData : []);
                  })
                  .finally(() => setLoadingSyllabus(false));
              }
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:text-[#23804A] hover:bg-slate-50 transition-colors self-end sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSyllabus ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-[#E3EAE5] shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Kitab name, subject, or unit topic..."
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
            {availableSubjectsForStudent.map((sub: any) => (
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

      {/* Syllabus Cards */}
      {loadingSyllabus ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200/70 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredSyllabuses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E3EAE5] space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No syllabus published for this student's class yet.</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedSubjectId || selectedExamType
              ? 'No syllabus matched your filter criteria. Try resetting the filters.'
              : 'The council academic board will publish the approved Kitab syllabuses and unit outlines once assigned.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSyllabuses.map((syl: any) => {
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
                          <Paperclip className="w-3 h-3" /> Document Attached
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

                {/* Expanded Units Details */}
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
                              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-2"
                            >
                              <div className="flex items-start gap-2">
                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#EAF2EC] text-[#23804A] shrink-0 mt-0.5">
                                  Unit {unit.unitNumber || uIdx + 1}
                                </span>
                                <span className="text-xs font-semibold text-[#171D19] leading-tight">
                                  {unit.title}
                                </span>
                              </div>
                              {unit.plannedHours && (
                                <p className="text-[10px] text-slate-400">
                                  Planned: {unit.plannedHours} hours
                                </p>
                              )}
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
                              Official curriculum outline for {syl.kitabName || syl.title} ({syl.examType === 'ANNUAL' ? 'Annual' : 'Half Yearly'})
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
          })}
        </div>
      )}
    </div>
  );
}

export default function ParentSyllabusPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 text-xs">
          Loading curriculum & syllabus explorer...
        </div>
      }
    >
      <ParentSyllabusContent />
    </Suspense>
  );
}
