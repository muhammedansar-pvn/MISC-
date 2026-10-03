'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { getMyMentees, updateMenteeMonitoring, addMentorshipNote } from '@/services/mentor.service';
import { MentorAssignment } from '@/types';
import {
  HeartHandshake,
  Search,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Plus,
  MessageSquare,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

function FacultyMentorshipContent() {
  const [mentees, setMentees] = useState<MentorAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Note entry state
  const [newNote, setNewNote] = useState('');
  const [noteCategory, setNoteCategory] = useState('GENERAL');
  const [savingNote, setSavingNote] = useState(false);

  // Status message
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadMentees();
  }, []);

  async function loadMentees() {
    try {
      setLoading(true);
      const res = await getMyMentees();
      if (res.success && Array.isArray(res.data)) {
        setMentees(res.data);
      }
    } catch (err) {
      console.error('Failed to load mentees:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateCategory = async (assignmentId: string, category: string) => {
    try {
      setSuccessMsg(null);
      setErrorMsg(null);
      const res = await updateMenteeMonitoring(assignmentId, { monitoringCategory: category });
      if (res.success) {
        setMentees((prev) =>
          prev.map((m) => (m._id === assignmentId ? { ...m, monitoringCategory: category } : m))
        );
        setSuccessMsg('Monitoring category updated successfully.');
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(res.message || 'Failed to update category');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating category');
    }
  };

  const handleAddNote = async (studentId: string) => {
    if (!newNote.trim()) return;
    try {
      setSavingNote(true);
      setSuccessMsg(null);
      setErrorMsg(null);
      const res = await addMentorshipNote(studentId, {
        note: newNote.trim(),
        category: noteCategory,
      });

      if (res.success && res.data) {
        const updated = res.data;
        setMentees((prev) =>
          prev.map((m) => (m._id === updated._id ? updated : m))
        );
        setNewNote('');
        setSuccessMsg('Mentorship observation recorded successfully.');
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(res.message || 'Failed to add note');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error adding note');
    } finally {
      setSavingNote(false);
    }
  };

  const filteredMentees = mentees.filter((m) => {
    const student = m.studentId as any;
    const name = student?.nameEnglish || '';
    const regNo = student?.registrationNumber || '';
    const matchesSearch =
      !searchQuery ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      regNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' || m.monitoringCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'NEED_ATTENTION':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
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
            <span className="text-slate-900 font-semibold">Mentorship Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#171D19]">
            Assigned Student Mentees
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Nurture, guide, and monitor the holistic progress of your assigned student mentees.
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
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E3EAE5] shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Mentees</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{mentees.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E3EAE5] shadow-2xs">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Need Attention</span>
          <p className="text-2xl font-bold text-amber-700 mt-1">
            {mentees.filter((m) => m.monitoringCategory === 'NEED_ATTENTION').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E3EAE5] shadow-2xs">
          <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Critical Focus</span>
          <p className="text-2xl font-bold text-red-700 mt-1">
            {mentees.filter((m) => m.monitoringCategory === 'CRITICAL').length}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-[#E3EAE5] shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search mentee by name or registration number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#23804A]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-48 py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#23804A] bg-white text-slate-700 font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="NORMAL">Normal</option>
            <option value="NEED_ATTENTION">Need Attention</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Mentees List */}
      <div className="space-y-4">
        {filteredMentees.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-[#E3EAE5] space-y-3">
            <HeartHandshake className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No mentee assignments found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You currently have no students assigned under your mentorship care.
            </p>
          </div>
        ) : (
          filteredMentees.map((assignment) => {
            const student = assignment.studentId as any;
            const studentId = student?._id || assignment.studentId;
            const isExpanded = expandedStudentId === studentId;
            const classObj = student?.classId;
            const history = assignment.notesHistory || [];

            return (
              <div
                key={assignment._id}
                className="bg-white rounded-xl border border-[#E3EAE5] shadow-2xs overflow-hidden transition-all"
              >
                {/* Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-100/60 text-[#23804A] flex items-center justify-center font-bold text-sm shrink-0">
                      {student?.nameEnglish ? student.nameEnglish.charAt(0) : 'S'}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base text-[#171D19]">
                          {student?.nameEnglish || 'Student'}
                        </h3>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                          {student?.registrationNumber || 'REG-NA'}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadge(
                            assignment.monitoringCategory
                          )}`}
                        >
                          {assignment.monitoringCategory || 'NORMAL'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Class: <span className="font-semibold text-slate-700">{classObj?.name || 'Class'}</span>
                        {student?.house && <> • House: <span className="font-semibold text-slate-700">{student.house}</span></>}
                        {student?.disciplineScore !== undefined && (
                          <> • Conduct Score: <span className="font-semibold text-emerald-700">{student.disciplineScore}/100</span></>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end md:self-auto">
                    {/* Category Switcher */}
                    <select
                      value={assignment.monitoringCategory || 'NORMAL'}
                      onChange={(e) => handleUpdateCategory(assignment._id, e.target.value)}
                      className="text-xs py-1.5 px-2.5 border border-slate-200 rounded-lg font-semibold bg-white text-slate-700"
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="NEED_ATTENTION">Need Attention</option>
                      <option value="CRITICAL">Critical</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setExpandedStudentId(isExpanded ? null : studentId)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                      <span>Notes ({history.length})</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Notes Section */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-slate-100 space-y-5 bg-slate-50/40">
                    {/* New Note Form */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                        <Plus className="w-3.5 h-3.5 text-[#23804A]" />
                        <span>Record Mentorship Observation</span>
                      </span>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          value={noteCategory}
                          onChange={(e) => setNoteCategory(e.target.value)}
                          className="text-xs py-2 px-3 border border-slate-200 rounded-lg bg-white font-medium text-slate-700 sm:w-44"
                        >
                          <option value="GENERAL">General</option>
                          <option value="ACADEMIC">Academic</option>
                          <option value="BEHAVIORAL">Behavioral</option>
                          <option value="SPIRITUAL">Spiritual</option>
                          <option value="PROGRESS">Progress Check</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Enter observation, guidance note, or follow-up recommendation..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#23804A]"
                        />

                        <button
                          type="button"
                          onClick={() => handleAddNote(studentId)}
                          disabled={savingNote || !newNote.trim()}
                          className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-[#23804A] hover:bg-[#1B6F41] rounded-lg transition-colors disabled:opacity-50"
                        >
                          {savingNote ? 'Saving...' : 'Save Note'}
                        </button>
                      </div>
                    </div>

                    {/* Historical Notes Timeline */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Observation & Guidance History
                      </span>
                      {history.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No previous mentorship notes recorded.</p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {history.slice().reverse().map((h, hIdx) => (
                            <div
                              key={hIdx}
                              className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between text-slate-400">
                                <span className="font-semibold text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                  {h.category || 'GENERAL'}
                                </span>
                                <span className="flex items-center space-x-1 text-[11px]">
                                  <Clock className="w-3 h-3" />
                                  <span>{h.createdAt ? new Date(h.createdAt).toLocaleDateString() : 'Recent'}</span>
                                </span>
                              </div>
                              <p className="text-slate-800 leading-relaxed font-medium">{h.note}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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

export default function FacultyMentorshipPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 text-xs">
          Loading faculty mentorship workspace...
        </div>
      }
    >
      <FacultyMentorshipContent />
    </Suspense>
  );
}
