'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle2,
  X,
  GraduationCap,
  BookOpen,
  Building2,
  Calendar,
} from 'lucide-react';
import {
  getFacultyAssignments,
  createFacultyAssignment,
  deleteFacultyAssignment,
} from '@/services/academic.service';
import { getFacultyMembers } from '@/services/faculty.service';
import {
  AcademicYear,
  ClassModel,
  Subject,
  FacultyProfile,
  FacultyAssignment,
} from '@/types';

interface FacultyAssignmentsManagerProps {
  preloadedYears?: AcademicYear[];
  preloadedClasses?: ClassModel[];
  preloadedSubjects?: Subject[];
}

export default function FacultyAssignmentsManager({
  preloadedYears = [],
  preloadedClasses = [],
  preloadedSubjects = [],
}: FacultyAssignmentsManagerProps) {
  // Datasets
  const [assignments, setAssignments] = useState<FacultyAssignment[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Create Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formYearId, setFormYearId] = useState<string>('');
  const [formClassId, setFormClassId] = useState<string>('');
  const [formSubjectId, setFormSubjectId] = useState<string>('');
  const [formFacultyId, setFormFacultyId] = useState<string>('');
  const [formNotes, setFormNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Set default academic year when preloadedYears arrive
  useEffect(() => {
    if (preloadedYears.length > 0 && !selectedYearId) {
      const currentYear = preloadedYears.find((y) => y.isCurrent) || preloadedYears[0];
      setSelectedYearId(currentYear._id);
      setFormYearId(currentYear._id);
    }
  }, [preloadedYears, selectedYearId]);

  // Load faculty list
  useEffect(() => {
    const loadFaculty = async () => {
      try {
        const res = await getFacultyMembers({ limit: 200 } as any);
        if (res.success && Array.isArray(res.data)) {
          setFacultyList(res.data);
        }
      } catch (err) {
        console.error('Failed to load faculty members:', err);
      }
    };
    loadFaculty();
  }, []);

  // Fetch assignments when year or filter changes
  const fetchAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { limit: 100 };
      if (selectedYearId) params.academicYearId = selectedYearId;
      if (selectedClassFilter) params.classId = selectedClassFilter;

      const res = await getFacultyAssignments(params);
      if (res.success && Array.isArray(res.data)) {
        setAssignments(res.data);
      } else {
        setAssignments([]);
      }
    } catch (err: any) {
      console.error('Failed to retrieve faculty assignments:', err);
      setError(err?.response?.data?.message || 'Failed to load faculty assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [selectedYearId, selectedClassFilter]);

  // Filter classes available for chosen year
  const availableClassesForYear = (yearId: string) => {
    if (!yearId) return preloadedClasses;
    return preloadedClasses.filter((c) => {
      const yId = typeof c.academicYearId === 'object' ? c.academicYearId?._id : c.academicYearId;
      return yId === yearId;
    });
  };

  // Open modal handler
  const handleOpenModal = () => {
    setFormError('');
    setFormYearId(selectedYearId || (preloadedYears[0]?._id ?? ''));
    setFormClassId('');
    setFormSubjectId('');
    setFormFacultyId('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  // Submit assignment creation
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formYearId || !formClassId || !formSubjectId || !formFacultyId) {
      setFormError('Please select Academic Year, Class, Subject, and Faculty.');
      return;
    }

    setFormLoading(true);
    try {
      const res = await createFacultyAssignment({
        academicYearId: formYearId,
        classId: formClassId,
        subjectId: formSubjectId,
        facultyId: formFacultyId,
        notes: formNotes.trim(),
        status: 'ACTIVE',
      });

      if (res.success) {
        setSuccessMsg('Faculty allocated successfully.');
        setIsModalOpen(false);
        fetchAssignments();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setFormError(res.message || 'Failed to assign faculty');
      }
    } catch (err: any) {
      console.error('Assignment error:', err);
      setFormError(err?.response?.data?.message || 'Assignment failed. Check for duplicate allocations.');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete assignment
  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to unassign this faculty member from this subject?')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await deleteFacultyAssignment(id);
      if (res.success) {
        setSuccessMsg('Faculty assignment removed successfully.');
        setAssignments((prev) => prev.filter((a) => a._id !== id));
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      console.error('Failed to delete assignment:', err);
      alert(err?.response?.data?.message || 'Failed to remove assignment');
    } finally {
      setDeletingId(null);
    }
  };

  // Search filter
  const filteredAssignments = assignments.filter((asgn) => {
    const q = searchQuery.toLowerCase();
    const facultyName = (asgn.facultyId?.nameEnglish || '').toLowerCase();
    const facultyIdCode = (asgn.facultyId?.facultyId || '').toLowerCase();
    const subjectName = (asgn.subjectId?.name || asgn.subjectId?.subjectName || '').toLowerCase();
    const subjectCode = (asgn.subjectId?.code || asgn.subjectId?.subjectCode || '').toLowerCase();
    const className = (asgn.classId?.name || '').toLowerCase();
    const classCode = (asgn.classId?.code || '').toLowerCase();

    return (
      !searchQuery ||
      facultyName.includes(q) ||
      facultyIdCode.includes(q) ||
      subjectName.includes(q) ||
      subjectCode.includes(q) ||
      className.includes(q) ||
      classCode.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
      {successMsg && (
        <div className="flex items-center space-x-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Control Bar: Filters & Actions */}
      <div className="bg-white p-5 rounded-2xl border border-[#E3EAE5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Academic Year Filter */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-hidden focus:border-[#23804A]"
            >
              <option value="">All Academic Years</option>
              {preloadedYears.map((ay) => (
                <option key={ay._id} value={ay._id}>
                  {ay.yearName} ({ay.yearCode}) {ay.isCurrent ? '• Current' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-hidden focus:border-[#23804A]"
            >
              <option value="">All Classes</option>
              {availableClassesForYear(selectedYearId).map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.code})
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search faculty, subject, or class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#23804A]"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <button
            onClick={fetchAssignments}
            title="Refresh allocations"
            className="p-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#23804A]' : ''}`} />
          </button>
          <button
            onClick={handleOpenModal}
            className="flex items-center space-x-2 px-4 py-2 bg-[#23804A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1B6F41] shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Faculty</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-[#E3EAE5] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#23804A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Loading teaching allocations...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No faculty assignments found</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {searchQuery || selectedClassFilter
                ? 'No allocations match your selected filters. Try clearing the filters.'
                : 'No faculty members have been explicitly assigned to teach subjects for this academic year yet.'}
            </p>
            <button
              onClick={handleOpenModal}
              className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-[#23804A] bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Allocation</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FBFCFB] text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#E3EAE5]">
                <tr>
                  <th className="px-6 py-4">Faculty Member</th>
                  <th className="px-6 py-4">Class / Cohort</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Academic Year</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EAE5]">
                {filteredAssignments.map((asgn) => {
                  const faculty = asgn.facultyId;
                  const cls = asgn.classId;
                  const subject = asgn.subjectId;
                  const year = asgn.academicYearId;

                  return (
                    <tr key={asgn._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Faculty Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-[#23804A]/10 text-[#23804A] font-bold flex items-center justify-center text-xs shrink-0">
                            {faculty?.nameEnglish ? faculty.nameEnglish.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {faculty?.nameEnglish || 'Faculty Member'}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center space-x-2">
                              <span>{faculty?.designation || 'Usthad'}</span>
                              {faculty?.facultyId && (
                                <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                  {faculty.facultyId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{cls?.name || 'Class'}</div>
                        <div className="text-xs text-slate-500 flex items-center space-x-1.5 mt-0.5">
                          <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {cls?.code || 'CLS'}
                          </span>
                          {cls?.department && (
                            <span className="text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                              {cls.department}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#23804A]" />
                          <span>{subject?.name || subject?.subjectName || 'Subject'}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                          <span className="font-mono text-[11px]">{subject?.code || subject?.subjectCode}</span>
                          {subject?.category && (
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {subject.category}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Academic Year */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700 text-xs">
                          {year?.yearName || 'Academic Year'}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {year?.yearCode} {year?.isCurrent ? '• Active' : ''}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ACTIVE
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteAssignment(asgn._id)}
                          disabled={deletingId === asgn._id}
                          className="inline-flex items-center text-xs text-rose-600 hover:text-rose-800 p-1.5 rounded-lg border border-transparent hover:border-rose-200 hover:bg-rose-50 transition-all cursor-pointer disabled:opacity-50"
                          title="Unassign faculty from subject"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          <span>{deletingId === asgn._id ? 'Removing...' : 'Unassign'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 border border-[#E3EAE5] shadow-xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-[#23804A]" />
                <h3 className="font-bold text-base text-[#171D19]">Assign Faculty to Class & Subject</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              {/* Academic Year Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Academic Year <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formYearId}
                  onChange={(e) => {
                    setFormYearId(e.target.value);
                    setFormClassId(''); // Reset class when year changes
                  }}
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-hidden focus:border-[#23804A]"
                >
                  <option value="">Select Academic Year...</option>
                  {preloadedYears.map((ay) => (
                    <option key={ay._id} value={ay._id}>
                      {ay.yearName} ({ay.yearCode}) {ay.isCurrent ? '• Current' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class Selection (filtered by chosen Academic Year) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Class / Cohort <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formClassId}
                  onChange={(e) => setFormClassId(e.target.value)}
                  required
                  disabled={!formYearId}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-hidden focus:border-[#23804A] disabled:opacity-50"
                >
                  <option value="">
                    {formYearId ? 'Select Class...' : 'Select an Academic Year first...'}
                  </option>
                  {availableClassesForYear(formYearId).map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} ({cls.code}) {cls.department ? `[${cls.department}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-hidden focus:border-[#23804A]"
                >
                  <option value="">Select Subject...</option>
                  {preloadedSubjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name} ({sub.code}) - {sub.category || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Faculty Member Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Faculty Member <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formFacultyId}
                  onChange={(e) => setFormFacultyId(e.target.value)}
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-hidden focus:border-[#23804A]"
                >
                  <option value="">Select Faculty Usthad...</option>
                  {facultyList.map((fac) => (
                    <option key={fac._id} value={fac._id}>
                      {fac.nameEnglish || 'Usthad'} ({fac.designation || 'Faculty Member'})
                      {fac.facultyId ? ` [${fac.facultyId}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Primary teacher, Second semester rotation..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-hidden focus:border-[#23804A]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#23804A] hover:bg-[#1B6F41] rounded-xl shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? 'Assigning...' : 'Assign Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
