'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getFacultyMembers, createFaculty, updateFaculty } from '@/services/faculty.service';
import { FacultyProfile } from '@/types';
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Building2,
  ArrowLeft,
} from 'lucide-react';

export default function InstitutionFacultyPage() {
  const [faculty, setFaculty] = useState<FacultyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [designationFilter, setDesignationFilter] = useState('ALL');

  // Modals
  const [viewFaculty, setViewFaculty] = useState<FacultyProfile | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editFaculty, setEditFaculty] = useState<FacultyProfile | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    userId: '',
    facultyId: '',
    nameEnglish: '',
    nameArabic: '',
    designation: 'Lecturer',
    islamicQualification: '',
    academicQualification: '',
    joiningYear: new Date().getFullYear(),
    previousExperience: '',
    contactNumber: '',
    placeEnglish: '',
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadFacultyData();
  }, []);

  async function loadFacultyData() {
    try {
      setLoading(true);
      const res = await getFacultyMembers();
      if (res.success && Array.isArray(res.data)) {
        setFaculty(res.data);
      }
    } catch (err) {
      console.error('Failed to load faculty directory:', err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Create Faculty
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.userId.trim() || !/^[0-9a-fA-F]{24}$/.test(formData.userId.trim())) {
      setFormError('A valid 24-character hexadecimal User Account ID is required.');
      return;
    }

    if (!formData.facultyId.trim()) {
      setFormError('Faculty Staff Code ID is required.');
      return;
    }

    if (!formData.nameEnglish.trim()) {
      setFormError('Faculty full name is required.');
      return;
    }

    try {
      setFormLoading(true);
      const res = await createFaculty({
        userId: formData.userId.trim(),
        facultyId: formData.facultyId.trim(),
        nameEnglish: formData.nameEnglish.trim(),
        nameArabic: formData.nameArabic.trim() || undefined,
        designation: formData.designation.trim() || 'Lecturer',
        islamicQualification: formData.islamicQualification.trim() || undefined,
        academicQualification: formData.academicQualification.trim() || undefined,
        joiningYear: Number(formData.joiningYear),
        previousExperience: formData.previousExperience.trim() || undefined,
        contactNumber: formData.contactNumber.trim() || undefined,
        placeEnglish: formData.placeEnglish.trim() || undefined,
      });

      if (res.success) {
        setFormSuccess('Faculty member registered successfully.');
        await loadFacultyData();
        setTimeout(() => {
          setShowCreateModal(false);
          setFormSuccess(null);
          resetForm();
        }, 1200);
      } else {
        setFormError(res.message || 'Failed to register faculty member.');
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'An error occurred.');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Update Faculty
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFaculty) return;
    setFormError(null);
    setFormSuccess(null);

    try {
      setFormLoading(true);
      const res = await updateFaculty(editFaculty._id, {
        nameEnglish: formData.nameEnglish.trim() || undefined,
        nameArabic: formData.nameArabic.trim() || undefined,
        designation: formData.designation.trim() || undefined,
        islamicQualification: formData.islamicQualification.trim() || undefined,
        academicQualification: formData.academicQualification.trim() || undefined,
        joiningYear: Number(formData.joiningYear),
        previousExperience: formData.previousExperience.trim() || undefined,
        contactNumber: formData.contactNumber.trim() || undefined,
        placeEnglish: formData.placeEnglish.trim() || undefined,
      });

      if (res.success) {
        setFormSuccess('Faculty record updated successfully.');
        await loadFacultyData();
        setTimeout(() => {
          setEditFaculty(null);
          setFormSuccess(null);
          resetForm();
        }, 1200);
      } else {
        setFormError(res.message || 'Failed to update faculty member.');
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Update failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (fac: FacultyProfile) => {
    setEditFaculty(fac);
    setFormData({
      userId: typeof fac.userId === 'string' ? fac.userId : (fac.userId as any)?._id || '',
      facultyId: fac.facultyId || '',
      nameEnglish: fac.nameEnglish || '',
      nameArabic: fac.nameArabic || '',
      designation: fac.designation || 'Lecturer',
      islamicQualification: fac.islamicQualification || '',
      academicQualification: fac.academicQualification || '',
      joiningYear: fac.joiningYear || new Date().getFullYear(),
      previousExperience: fac.previousExperience || '',
      contactNumber: fac.contactNumber || '',
      placeEnglish: fac.placeEnglish || '',
    });
    setFormError(null);
    setFormSuccess(null);
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      facultyId: '',
      nameEnglish: '',
      nameArabic: '',
      designation: 'Lecturer',
      islamicQualification: '',
      academicQualification: '',
      joiningYear: new Date().getFullYear(),
      previousExperience: '',
      contactNumber: '',
      placeEnglish: '',
    });
  };

  const designations = Array.from(new Set(faculty.map((f) => f.designation).filter(Boolean)));

  const filteredFaculty = faculty.filter((fac) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = (fac.nameEnglish || '').toLowerCase().includes(q) ||
      (fac.facultyId || '').toLowerCase().includes(q) ||
      (fac.designation || '').toLowerCase().includes(q) ||
      (fac.academicQualification || '').toLowerCase().includes(q);

    const desigMatch = designationFilter === 'ALL' || fac.designation === designationFilter;

    return nameMatch && desigMatch;
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
            <span className="text-slate-900 font-semibold">Faculty</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#132238]">
            Faculty & Instructors Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage academic instructors and teaching staff affiliated with your campus.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setFormError(null);
            setFormSuccess(null);
            setShowCreateModal(true);
          }}
          className="inline-flex items-center space-x-2 bg-[#2F7C7A] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#256664] transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8E0] shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by faculty name, staff code, qualification..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-800"
          />
        </div>

        <select
          value={designationFilter}
          onChange={(e) => setDesignationFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-700 w-full sm:w-48"
        >
          <option value="ALL">All Designations</option>
          {designations.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Faculty Data Table */}
      <div className="bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredFaculty.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No faculty members found</p>
            <p className="text-xs text-slate-400 mt-1">
              {faculty.length === 0
                ? 'No faculty members currently registered under this institution.'
                : 'No faculty members match your filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8F5] border-b border-[#E2E8E0] text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Staff Code</th>
                  <th className="p-4">Instructor Name</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">Qualifications</th>
                  <th className="p-4">Joining Year</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFaculty.map((fac) => (
                  <tr key={fac._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-800">
                      {fac.facultyId || '—'}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{fac.nameEnglish}</div>
                      {fac.contactNumber && (
                        <span className="text-[11px] text-slate-400">{fac.contactNumber}</span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-slate-700">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {fac.designation || 'Lecturer'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {fac.islamicQualification || fac.academicQualification || '—'}
                    </td>
                    <td className="p-4 font-mono text-slate-600">
                      {fac.joiningYear || '—'}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {fac.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => setViewFaculty(fac)}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-[#2F7C7A] transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(fac)}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
                        title="Edit Record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Faculty Modal */}
      {viewFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#132238]">{viewFaculty.nameEnglish}</h3>
                  <p className="text-[11px] font-mono text-slate-500">Staff Code: {viewFaculty.facultyId || '—'}</p>
                </div>
              </div>
              <button
                onClick={() => setViewFaculty(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Designation</span>
                <p className="font-bold text-slate-800 mt-0.5">{viewFaculty.designation || 'Lecturer'}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Joining Year</span>
                <p className="font-mono text-slate-800 mt-0.5">{viewFaculty.joiningYear || '—'}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Islamic Qualification</span>
                <p className="font-medium text-slate-800 mt-0.5">{viewFaculty.islamicQualification || '—'}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Academic Qualification</span>
                <p className="font-medium text-slate-800 mt-0.5">{viewFaculty.academicQualification || '—'}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Contact Number</span>
                <p className="font-medium text-slate-800 mt-0.5">{viewFaculty.contactNumber || '—'}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Place / Native</span>
                <p className="font-medium text-slate-800 mt-0.5">{viewFaculty.placeEnglish || '—'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Prior Experience</span>
                <p className="font-medium text-slate-800 mt-0.5 leading-relaxed">{viewFaculty.previousExperience || '—'}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewFaculty(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Faculty Modal */}
      {(showCreateModal || editFaculty) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#2F7C7A]" />
                <h3 className="font-bold text-sm text-[#132238]">
                  {editFaculty ? 'Edit Faculty Record' : 'Add Faculty Member'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditFaculty(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={editFaculty ? handleUpdateSubmit : handleCreateSubmit} className="space-y-4 text-xs">
              {!editFaculty && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      User Account ID (24-char Hex ObjectId) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 64b8f... (User ID for faculty)"
                      value={formData.userId}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Staff Code ID (Faculty ID) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FAC-2026-01"
                      value={formData.facultyId}
                      onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Instructor Name (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Faculty Full Name"
                    value={formData.nameEnglish}
                    onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Name (Arabic)</label>
                  <input
                    type="text"
                    placeholder="الاسم بالعربية"
                    value={formData.nameArabic}
                    onChange={(e) => setFormData({ ...formData, nameArabic: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Lecturer, Usthad"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Joining Year</label>
                  <input
                    type="number"
                    min={1990}
                    max={2100}
                    value={formData.joiningYear}
                    onChange={(e) => setFormData({ ...formData, joiningYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Islamic Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. Sanad in Hadith, Kamil"
                    value={formData.islamicQualification}
                    onChange={(e) => setFormData({ ...formData, islamicQualification: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Academic Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. MA Arabic, BA English"
                    value={formData.academicQualification}
                    onChange={(e) => setFormData({ ...formData, academicQualification: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Telephone</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Native / Place</label>
                  <input
                    type="text"
                    placeholder="e.g. Malappuram"
                    value={formData.placeEnglish}
                    onChange={(e) => setFormData({ ...formData, placeEnglish: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Prior Experience</label>
                <textarea
                  rows={2}
                  placeholder="Details of previous institutional teaching experience..."
                  value={formData.previousExperience}
                  onChange={(e) => setFormData({ ...formData, previousExperience: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditFaculty(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-[#2F7C7A] text-white font-semibold rounded-lg hover:bg-[#256664] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? 'Saving...' : editFaculty ? 'Save Changes' : 'Register Instructor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
