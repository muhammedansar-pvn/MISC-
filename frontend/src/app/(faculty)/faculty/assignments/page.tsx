'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getAssignments,
  createAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
  AssignmentItem,
  AssignmentSubmissionItem,
} from '@/services/assignment.service';
import { getMyAssignments } from '@/services/faculty.service';
import { FacultyAssignment } from '@/types';
import {
  Award,
  Plus,
  Calendar,
  Building2,
  BookOpen,
  Trash2,
  FileText,
  Users,
  X,
  Upload,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Check,
  Edit3,
} from 'lucide-react';

export default function FacultyAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [facultyAllocs, setFacultyAllocs] = useState<FacultyAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedClassId, setSelectedClassId] = useState('ALL');

  // Create Assignment Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [modalClassId, setModalClassId] = useState('');
  const [modalSubjectId, setModalSubjectId] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newMaxMarks, setNewMaxMarks] = useState<number>(100);
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Submissions Modal State
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState<AssignmentItem | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmissionItem[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Inline Grading State per submission: { [submissionId]: { marks: number, feedback: string, saving: boolean, success: boolean, error: string | null } }
  const [gradingState, setGradingState] = useState<{
    [subId: string]: { marks: string; feedback: string; saving: boolean; success: boolean; error: string | null };
  }>({});

  // Load faculty allocations & assignments
  const loadData = async () => {
    try {
      setLoading(true);
      const [allocsRes, asgnRes] = await Promise.allSettled([
        getMyAssignments(),
        getAssignments(),
      ]);

      if (allocsRes.status === 'fulfilled' && allocsRes.value.success && Array.isArray(allocsRes.value.data)) {
        const allocs = allocsRes.value.data;
        setFacultyAllocs(allocs);
        if (allocs.length > 0) {
          setModalClassId(allocs[0].classId._id);
          setModalSubjectId(allocs[0].subjectId._id);
        }
      }

      if (asgnRes.status === 'fulfilled' && asgnRes.value.success && Array.isArray(asgnRes.value.data)) {
        setAssignments(asgnRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load assignments data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Distinct classes from allocations
  const distinctClassesMap = new Map<string, { _id: string; name: string }>();
  facultyAllocs.forEach((a) => {
    if (a.classId) {
      distinctClassesMap.set(a.classId._id, a.classId);
    }
  });
  const distinctClasses = Array.from(distinctClassesMap.values());

  // Available subjects for the modal's selected class
  const modalSubjects = facultyAllocs
    .filter((a) => a.classId?._id === modalClassId)
    .map((a) => a.subjectId)
    .filter(Boolean);

  const handleModalClassChange = (cId: string) => {
    setModalClassId(cId);
    const subjs = facultyAllocs.filter((a) => a.classId?._id === cId).map((a) => a.subjectId);
    if (subjs.length > 0 && subjs[0]) {
      setModalSubjectId(subjs[0]._id);
    } else {
      setModalSubjectId('');
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalClassId || !modalSubjectId || !newTitle || !newDueDate) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const formData = new FormData();
      formData.append('title', newTitle.trim());
      formData.append('description', newDescription.trim());
      formData.append('classId', modalClassId);
      formData.append('subjectId', modalSubjectId);
      formData.append('dueDate', newDueDate);
      formData.append('maxMarks', String(newMaxMarks || 100));

      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append('attachments', files[i]);
        }
      }

      const res = await createAssignment(formData);
      if (res.success) {
        setIsCreateModalOpen(false);
        setNewTitle('');
        setNewDescription('');
        setNewDueDate('');
        setNewMaxMarks(100);
        setFiles(null);
        loadData();
      } else {
        setFormError(res.message || 'Failed to create assignment');
      }
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      const res = await deleteAssignment(id);
      if (res.success) {
        setAssignments((prev) => prev.filter((a) => a._id !== id));
      } else {
        alert(res.message || 'Failed to delete assignment');
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Failed to delete assignment');
    }
  };

  const handleViewSubmissions = async (asgn: AssignmentItem) => {
    setSelectedAssignmentForSubmissions(asgn);
    try {
      setLoadingSubmissions(true);
      const res = await getAssignmentSubmissions(asgn._id);
      if (res.success && Array.isArray(res.data)) {
        setSubmissions(res.data);
        // Initialize grading state
        const initialGrading: any = {};
        res.data.forEach((sub) => {
          initialGrading[sub._id] = {
            marks: sub.marks !== undefined && sub.marks !== null ? String(sub.marks) : '',
            feedback: sub.feedback || '',
            saving: false,
            success: false,
            error: null,
          };
        });
        setGradingState(initialGrading);
      } else {
        setSubmissions([]);
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGradeSubmit = async (submissionId: string) => {
    if (!selectedAssignmentForSubmissions) return;
    const current = gradingState[submissionId];
    if (!current || current.marks === '') {
      setGradingState((prev) => ({
        ...prev,
        [submissionId]: { ...prev[submissionId], error: 'Please enter marks before saving' },
      }));
      return;
    }

    const marksNum = Number(current.marks);
    const maxMarks = selectedAssignmentForSubmissions.maxMarks || 100;
    if (isNaN(marksNum) || marksNum < 0 || marksNum > maxMarks) {
      setGradingState((prev) => ({
        ...prev,
        [submissionId]: { ...prev[submissionId], error: `Marks must be between 0 and ${maxMarks}` },
      }));
      return;
    }

    try {
      setGradingState((prev) => ({
        ...prev,
        [submissionId]: { ...prev[submissionId], saving: true, error: null, success: false },
      }));

      const res = await gradeSubmission(selectedAssignmentForSubmissions._id, submissionId, {
        marks: marksNum,
        feedback: current.feedback,
      });

      if (res.success && res.data) {
        setSubmissions((prev) =>
          prev.map((s) => (s._id === submissionId ? (res.data as AssignmentSubmissionItem) : s))
        );
        setGradingState((prev) => ({
          ...prev,
          [submissionId]: { ...prev[submissionId], saving: false, success: true, error: null },
        }));
        setTimeout(() => {
          setGradingState((prev) => ({
            ...prev,
            [submissionId]: { ...prev[submissionId], success: false },
          }));
        }, 2500);
      } else {
        setGradingState((prev) => ({
          ...prev,
          [submissionId]: { ...prev[submissionId], saving: false, error: res.message || 'Failed to save grade' },
        }));
      }
    } catch (err: any) {
      setGradingState((prev) => ({
        ...prev,
        [submissionId]: {
          ...prev[submissionId],
          saving: false,
          error: err?.response?.data?.message || err.message || 'Failed to save grade',
        },
      }));
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (selectedClassId === 'ALL') return true;
    return a.classId?._id === selectedClassId;
  });

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
            <span className="text-slate-900 font-semibold">Homework & Assignments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#171D19] flex items-center gap-2">
            <Award className="w-7 h-7 text-[#23804A]" />
            Homework & Tasks Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Post and manage homework assignments for your assigned class cohorts, evaluate student submissions, and award marks.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-[#23804A] hover:bg-[#1B6F41] text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Assignment
          </button>
          <Link
            href="/faculty"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#23804A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#E3EAE5] shadow-2xs">
        <div className="flex items-center space-x-3 text-xs">
          <span className="font-bold text-[#171D19] uppercase tracking-wider">Filter Cohort:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[#171D19] focus:outline-hidden focus:border-[#23804A]"
          >
            <option value="ALL">All Assigned Classes ({assignments.length})</option>
            {distinctClasses.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredAssignments.length} Assignments
        </span>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200/70 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E3EAE5] space-y-3">
          <Award className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-base font-bold text-slate-700">No Assignments Found</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven&apos;t created any assignments for this class yet. Click &ldquo;Create Assignment&rdquo; to post a new task.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((asgn) => {
            const isOverdue = new Date(asgn.dueDate) < new Date();

            return (
              <div
                key={asgn._id}
                className="bg-white rounded-2xl border border-[#E3EAE5] p-5 shadow-2xs hover:border-[#23804A] transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#EAF2EC] text-[#23804A] font-semibold text-xs border border-[#23804A]/20">
                        <Building2 className="w-3 h-3 mr-1" />
                        {asgn.classId?.name}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-50 text-green-700 font-semibold text-xs border border-green-200">
                        <BookOpen className="w-3 h-3 mr-1" />
                        {asgn.subjectId?.name || asgn.subjectId?.subjectName}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold text-xs border border-amber-200">
                        Max: {asgn.maxMarks || 100} Marks
                      </span>
                      {isOverdue ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold text-[10px] uppercase border border-rose-200">
                          Due Date Passed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10px] uppercase border border-emerald-200">
                          Active
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-[#171D19]">{asgn.title}</h3>
                    {asgn.description && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{asgn.description}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleViewSubmissions(asgn)}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-50 text-[#23804A] hover:bg-green-100 font-semibold text-xs transition-all border border-green-200"
                    >
                      <Users className="w-3.5 h-3.5 mr-1.5" /> Submissions & Grading
                    </button>
                    <button
                      onClick={() => handleDelete(asgn._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      title="Delete assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due: <strong className="text-slate-700">{new Date(asgn.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                    </span>
                    {asgn.attachments && asgn.attachments.length > 0 && (
                      <span className="flex items-center space-x-1 text-green-700 font-semibold">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{asgn.attachments.length} Attachment(s)</span>
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">
                    Posted: {new Date(asgn.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Assignment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base font-serif text-[#171D19] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#23804A]" /> Create Class Assignment
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Class Cohort *
                  </label>
                  <select
                    value={modalClassId}
                    onChange={(e) => handleModalClassChange(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[#171D19] focus:outline-hidden focus:border-[#23804A]"
                  >
                    {distinctClasses.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Subject Module *
                  </label>
                  <select
                    value={modalSubjectId}
                    onChange={(e) => setModalSubjectId(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[#171D19] focus:outline-hidden focus:border-[#23804A]"
                  >
                    {modalSubjects.map((sub: any) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name || sub.subjectName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Surah Al-Baqarah Verses 1-20 Tafsir Essay"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#23804A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Instructions / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed guidelines, reading references, or questions..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#23804A] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Submission Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#23804A] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Max Marks *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newMaxMarks}
                    onChange={(e) => setNewMaxMarks(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#23804A] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Attachments (PDF, Documents, Images)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#EAF2EC] file:text-[#23804A] hover:file:bg-green-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#23804A] hover:bg-[#1B6F41] text-white text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Creating Assignment...' : 'Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions & Grading Modal */}
      {selectedAssignmentForSubmissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base font-serif text-[#171D19]">
                  Student Submissions & Evaluation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedAssignmentForSubmissions.title} • {selectedAssignmentForSubmissions.classId?.name} • Max: {selectedAssignmentForSubmissions.maxMarks || 100} Marks
                </p>
              </div>
              <button
                onClick={() => setSelectedAssignmentForSubmissions(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {loadingSubmissions ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-6 h-6 border-2 border-[#23804A] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Loading student submissions...</p>
                </div>
              ) : submissions.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No submissions recorded yet</p>
                  <p className="text-xs text-slate-400">
                    No students in this class cohort have submitted work for this assignment yet.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 space-y-3">
                  {submissions.map((sub) => {
                    const currentGrading = gradingState[sub._id] || {
                      marks: sub.marks !== undefined && sub.marks !== null ? String(sub.marks) : '',
                      feedback: sub.feedback || '',
                      saving: false,
                      success: false,
                      error: null,
                    };

                    const maxMarks = selectedAssignmentForSubmissions.maxMarks || 100;

                    return (
                      <div key={sub._id} className="pt-4 first:pt-0 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs">
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-bold text-slate-900 text-sm">
                                {sub.studentId?.nameEnglish || 'Student Candidate'}
                              </p>
                              <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {sub.studentId?.registrationNumber || 'REG'}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  sub.status === 'GRADED'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : sub.status === 'LATE'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-green-50 text-green-700 border border-green-200'
                                }`}
                              >
                                {sub.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              Submitted: {new Date(sub.submittedAt).toLocaleDateString('en-GB')} at {new Date(sub.submittedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            {sub.submittedFile?.fileUrl && (
                              <a
                                href={sub.submittedFile.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-50 text-[#23804A] hover:bg-green-100 font-semibold text-xs border border-green-200 transition-all"
                              >
                                <ExternalLink className="w-3.5 h-3.5 mr-1" /> View File ({sub.submittedFile.fileName})
                              </a>
                            )}
                            {sub.link && (
                              <a
                                href={sub.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-all"
                              >
                                <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Link
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Grading Box */}
                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                          <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="w-full sm:w-48">
                              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                                Awarded Marks (Max: {maxMarks}) *
                              </label>
                              <div className="flex items-center space-x-1">
                                <input
                                  type="number"
                                  min={0}
                                  max={maxMarks}
                                  placeholder="0"
                                  value={currentGrading.marks}
                                  onChange={(e) =>
                                    setGradingState((prev) => ({
                                      ...prev,
                                      [sub._id]: { ...prev[sub._id], marks: e.target.value, error: null },
                                    }))
                                  }
                                  className="w-24 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[#171D19] focus:outline-hidden focus:border-[#23804A]"
                                />
                                <span className="text-xs text-slate-400 font-semibold">/ {maxMarks}</span>
                              </div>
                            </div>

                            <div className="w-full flex-1">
                              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                                Teacher Feedback & Remarks
                              </label>
                              <input
                                type="text"
                                placeholder="Commend strengths, point out corrections, or guidance..."
                                value={currentGrading.feedback}
                                onChange={(e) =>
                                    setGradingState((prev) => ({
                                      ...prev,
                                      [sub._id]: { ...prev[sub._id], feedback: e.target.value },
                                    }))
                                }
                                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:border-[#23804A]"
                              />
                            </div>

                            <div className="self-end pt-1">
                              <button
                                onClick={() => handleGradeSubmit(sub._id)}
                                disabled={currentGrading.saving}
                                className={`inline-flex items-center px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-2xs disabled:opacity-50 ${
                                  currentGrading.success ? 'bg-emerald-600' : 'bg-[#23804A] hover:bg-[#1B6F41]'
                                }`}
                              >
                                {currentGrading.saving ? (
                                  'Saving...'
                                ) : currentGrading.success ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 mr-1" /> Saved!
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {sub.status === 'GRADED' ? 'Update Grade' : 'Save Grade'}
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {currentGrading.error && (
                            <p className="text-[11px] text-rose-600 font-medium">{currentGrading.error}</p>
                          )}
                          {sub.status === 'GRADED' && sub.gradedBy && (
                            <p className="text-[10px] text-slate-400 italic">
                              Evaluated by {sub.gradedBy?.nameEnglish || 'Usthad'} on {sub.gradedAt ? new Date(sub.gradedAt).toLocaleDateString('en-GB') : 'Recorded'}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedAssignmentForSubmissions(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
