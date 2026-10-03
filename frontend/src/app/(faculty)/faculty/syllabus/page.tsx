'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getSyllabuses, getSubjects, updateSyllabusProgress } from '@/services/academic.service';
import { Syllabus, Subject } from '@/types';
import {
  BookOpen,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Layers,
  FileText,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Save,
  Clock,
  CheckSquare,
} from 'lucide-react';

function FacultySyllabusContent() {
  const searchParams = useSearchParams();
  const initialSubjectId = searchParams?.get('subjectId') || '';

  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [subjectsRes, syllabusRes] = await Promise.allSettled([
          getSubjects(),
          getSyllabuses(),
        ]);

        if (subjectsRes.status === 'fulfilled' && subjectsRes.value.success && Array.isArray(subjectsRes.value.data)) {
          setSubjects(subjectsRes.value.data);
        }

        if (syllabusRes.status === 'fulfilled' && syllabusRes.value.success && Array.isArray(syllabusRes.value.data)) {
          setSyllabuses(syllabusRes.value.data);
          if (syllabusRes.value.data.length > 0) {
            setExpandedId(syllabusRes.value.data[0]._id);
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
    const subjectName = (s.subjectId as any)?.name || (s.subjectId as any)?.subjectName || '';
    const matchesSearch =
      !searchQuery ||
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.kitabName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subjectName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSubject && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleToggleUnit = (syllabusIndex: number, unitIndex: number) => {
    const updated = [...syllabuses];
    const syl = updated[syllabusIndex];
    if (!syl.units || !syl.units[unitIndex]) return;

    const currentUnit = syl.units[unitIndex];
    const newStatus = !currentUnit.isCompleted;
    currentUnit.isCompleted = newStatus;
    if (newStatus) {
      currentUnit.completedAt = new Date().toISOString();
      if (Array.isArray(currentUnit.topics)) {
        currentUnit.topics.forEach((t: any) => {
          if (typeof t === 'object') {
            t.isCompleted = true;
          }
        });
      }
    }

    // Recalculate progress
    recomputeSyllabusProgress(syl);
    setSyllabuses(updated);
  };

  const handleToggleTopic = (syllabusIndex: number, unitIndex: number, topicIndex: number) => {
    const updated = [...syllabuses];
    const syl = updated[syllabusIndex];
    if (!syl.units || !syl.units[unitIndex]) return;

    const unit = syl.units[unitIndex];
    if (Array.isArray(unit.topics) && unit.topics[topicIndex]) {
      const topic: any = unit.topics[topicIndex];
      if (topic && typeof topic === 'object') {
        topic.isCompleted = !topic.isCompleted;
      }
    }

    recomputeSyllabusProgress(syl);
    setSyllabuses(updated);
  };

  const handleHoursChange = (
    syllabusIndex: number,
    unitIndex: number,
    field: 'completedHours' | 'plannedHours',
    val: number
  ) => {
    const updated = [...syllabuses];
    const syl = updated[syllabusIndex];
    if (!syl.units || !syl.units[unitIndex]) return;
    syl.units[unitIndex][field] = Math.max(0, val);
    setSyllabuses(updated);
  };

  const recomputeSyllabusProgress = (syl: Syllabus) => {
    if (!syl.units || syl.units.length === 0) {
      syl.completionPercentage = 0;
      return;
    }

    let allTopics: any[] = [];
    syl.units.forEach((u) => {
      if (Array.isArray(u.topics) && u.topics.length > 0) {
        allTopics.push(...u.topics);
      }
    });

    if (allTopics.length > 0) {
      const completedTopics = allTopics.filter((t) => t.isCompleted === true).length;
      syl.completionPercentage = Math.round((completedTopics / allTopics.length) * 100);
    } else {
      const completedUnits = syl.units.filter((u) => u.isCompleted === true).length;
      syl.completionPercentage = Math.round((completedUnits / syl.units.length) * 100);
    }
  };

  const handleSaveProgress = async (syl: Syllabus) => {
    try {
      setSavingId(syl._id);
      setSuccessMessage(null);
      setErrorMessage(null);

      const res = await updateSyllabusProgress(syl._id, {
        units: syl.units,
        completionPercentage: syl.completionPercentage || 0,
      });

      if (res.success) {
        setSuccessMessage(`Teaching progress for "${syl.title || syl.kitabName}" saved successfully.`);
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(res.message || 'Failed to save syllabus progress');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while saving progress');
    } finally {
      setSavingId(null);
    }
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
            <Link href="/faculty" className="hover:text-[#23804A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Syllabus & Teaching Progress</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#171D19]">
            Curriculum Syllabuses & Teaching Progress
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track and record teaching milestones, chapters covered, and completion progress for your assigned courses.
          </p>
        </div>

        <Link
          href="/faculty"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#23804A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center space-x-2">
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-[#E3EAE5] shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search syllabus by title, kitab, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#23804A]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full md:w-56 py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#23804A] bg-white text-slate-700 font-medium"
          >
            <option value="">All Assigned Subjects</option>
            {subjects.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name || (sub as any).subjectName} ({sub.code || (sub as any).subjectCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Syllabus Accordion */}
      <div className="space-y-4">
        {filteredSyllabuses.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-[#E3EAE5] space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No syllabus documents found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No syllabus frameworks match your selected criteria or assignments.
            </p>
          </div>
        ) : (
          filteredSyllabuses.map((syl, sylIdx) => {
            const isExpanded = expandedId === syl._id;
            const subject = (syl.subjectId as any);
            const classObj = (syl.classId as any);
            const progress = syl.completionPercentage || 0;

            return (
              <div
                key={syl._id}
                className="bg-white rounded-xl border border-[#E3EAE5] shadow-2xs overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleExpand(syl._id)}
                  className="w-full p-5 text-left flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-800">
                        {subject?.code || subject?.subjectCode || 'COURSE'}
                      </span>
                      <h3 className="font-bold text-base text-[#171D19]">
                        {syl.title || syl.kitabName}
                      </h3>
                      {syl.version && (
                        <span className="text-[11px] font-semibold text-[#23804A] bg-[#EAF2EC] px-2 py-0.5 rounded">
                          v{syl.version}
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {syl.examType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Subject: <span className="font-semibold text-slate-700">{subject?.name || subject?.subjectName || 'Course'}</span>
                      {classObj && <> • Class: <span className="font-semibold text-slate-700">{classObj.name || classObj.code}</span></>}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 self-end md:self-auto">
                    {/* Progress Bar Badge */}
                    <div className="w-36 text-right space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-500">Progress</span>
                        <span className="text-[#23804A]">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#23804A] h-full rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {/* Expanded Details & Progress Editor */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-3 border-t border-slate-100 space-y-6">
                    {/* Units & Topics Progress Tracking */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                          <Layers className="w-4 h-4 text-[#23804A]" />
                          <span>Curriculum Units & Teaching Milestones</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSaveProgress(syl)}
                          disabled={savingId === syl._id}
                          className="inline-flex items-center px-3.5 py-1.5 text-xs font-bold text-white bg-[#23804A] hover:bg-[#1B6F41] rounded-lg shadow-2xs transition-colors disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5 mr-1.5" />
                          {savingId === syl._id ? 'Saving...' : 'Save Teaching Progress'}
                        </button>
                      </div>

                      {syl.units && syl.units.length > 0 ? (
                        <div className="space-y-3">
                          {syl.units.map((unit, uIdx) => (
                            <div
                              key={uIdx}
                              className={`p-4 rounded-xl border transition-all ${
                                unit.isCompleted
                                  ? 'bg-emerald-50/40 border-emerald-200'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center space-x-3">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleUnit(sylIdx, uIdx)}
                                    className="text-slate-400 hover:text-[#23804A] transition-colors"
                                  >
                                    {unit.isCompleted ? (
                                      <CheckCircle2 className="w-5 h-5 text-[#23804A]" />
                                    ) : (
                                      <Circle className="w-5 h-5" />
                                    )}
                                  </button>
                                  <span className={`text-xs font-bold ${unit.isCompleted ? 'text-emerald-900 line-through' : 'text-slate-900'}`}>
                                    Unit {unit.unitNumber || uIdx + 1}: {unit.title || (unit as any).unitTitle}
                                  </span>
                                </div>

                                <div className="flex items-center space-x-4 text-xs text-slate-500 pl-8 sm:pl-0">
                                  <div className="flex items-center space-x-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Hours:</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={unit.completedHours || 0}
                                      onChange={(e) =>
                                        handleHoursChange(sylIdx, uIdx, 'completedHours', parseInt(e.target.value) || 0)
                                      }
                                      className="w-12 px-1.5 py-0.5 text-xs text-center border border-slate-200 rounded font-semibold text-slate-700"
                                    />
                                    <span>/</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={unit.plannedHours || 0}
                                      onChange={(e) =>
                                        handleHoursChange(sylIdx, uIdx, 'plannedHours', parseInt(e.target.value) || 0)
                                      }
                                      className="w-12 px-1.5 py-0.5 text-xs text-center border border-slate-200 rounded font-semibold text-slate-700"
                                    />
                                    <span>hrs</span>
                                  </div>
                                </div>
                              </div>

                              {/* Topics breakdown if present */}
                              {Array.isArray(unit.topics) && unit.topics.length > 0 && (
                                <div className="mt-3 pl-8 space-y-1.5 border-t border-slate-100 pt-2.5">
                                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Sub-topics & Lessons:
                                  </span>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {unit.topics.map((topic: any, tIdx: number) => {
                                      const title = typeof topic === 'string' ? topic : topic.title;
                                      const isDone = typeof topic === 'object' ? topic.isCompleted : unit.isCompleted;

                                      return (
                                        <div
                                          key={tIdx}
                                          onClick={() => handleToggleTopic(sylIdx, uIdx, tIdx)}
                                          className={`flex items-center space-x-2 text-xs p-2 rounded-lg cursor-pointer transition-colors ${
                                            isDone ? 'bg-emerald-100/40 text-emerald-800' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                          }`}
                                        >
                                          {isDone ? (
                                            <CheckSquare className="w-3.5 h-3.5 text-[#23804A] shrink-0" />
                                          ) : (
                                            <div className="w-3.5 h-3.5 rounded border border-slate-300 shrink-0" />
                                          )}
                                          <span className={isDone ? 'line-through' : ''}>{title}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No structured unit subdivisions listed.</p>
                      )}
                    </div>

                    {syl.fileUrl && (
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500">Official Syllabus Document:</span>
                        <a
                          href={syl.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#23804A] hover:bg-[#1B6F41] text-white text-xs font-semibold"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1.5" /> View Document
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

export default function FacultySyllabusPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 text-xs">
          Loading faculty syllabus explorer...
        </div>
      }
    >
      <FacultySyllabusContent />
    </Suspense>
  );
}
