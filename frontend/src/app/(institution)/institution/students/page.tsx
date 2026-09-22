'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStudents, registerStudent, updateStudent } from '@/services/student.service';
import { getClasses } from '@/services/academic.service';
import { StudentProfile, ClassModel } from '@/types';
import {
  GraduationCap,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Phone,
  MapPin,
  Building2,
  ArrowLeft,
} from 'lucide-react';

export default function InstitutionStudentsPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [viewStudent, setViewStudent] = useState<StudentProfile | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editStudent, setEditStudent] = useState<StudentProfile | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    userId: '',
    nameEnglish: '',
    nameArabic: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    admissionYear: new Date().getFullYear(),
    classId: '',
    contactNumber: '',
    placeEnglish: '',
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [stuRes, clsRes] = await Promise.allSettled([
        getStudents(),
        getClasses(),
      ]);

      if (stuRes.status === 'fulfilled' && stuRes.value.success && Array.isArray(stuRes.value.data)) {
        setStudents(stuRes.value.data);
      }
      if (clsRes.status === 'fulfilled' && clsRes.value.success && Array.isArray(clsRes.value.data)) {
        setClasses(clsRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load students data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Create Student
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.userId.trim() || !/^[0-9a-fA-F]{24}$/.test(formData.userId.trim())) {
      setFormError('A valid 24-character hexadecimal User Account ID is required.');
      return;
    }

    if (!formData.nameEnglish.trim() || !formData.fatherName.trim() || !formData.motherName.trim() || !formData.dateOfBirth) {
      setFormError('Candidate full name, father name, mother name, and date of birth are required.');
      return;
    }

    try {
      setFormLoading(true);
      const res = await registerStudent({
        userId: formData.userId.trim(),
        nameEnglish: formData.nameEnglish.trim(),
        nameArabic: formData.nameArabic.trim() || undefined,
        fatherName: formData.fatherName.trim(),
        motherName: formData.motherName.trim(),
        dateOfBirth: formData.dateOfBirth,
        admissionYear: Number(formData.admissionYear),
        classId: formData.classId || undefined,
        contactNumber: formData.contactNumber.trim() || undefined,
        placeEnglish: formData.placeEnglish.trim() || undefined,
      });

      if (res.success) {
        setFormSuccess('Candidate student profile registered successfully.');
        await loadData();
        setTimeout(() => {
          setShowCreateModal(false);
          setFormSuccess(null);
          resetForm();
        }, 1200);
      } else {
        setFormError(res.message || 'Failed to register student.');
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'An error occurred.');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Update Student
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    setFormError(null);
    setFormSuccess(null);

    try {
      setFormLoading(true);
      const res = await updateStudent(editStudent._id, {
        nameEnglish: formData.nameEnglish.trim() || undefined,
        nameArabic: formData.nameArabic.trim() || undefined,
        fatherName: formData.fatherName.trim() || undefined,
        motherName: formData.motherName.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        admissionYear: Number(formData.admissionYear),
        classId: formData.classId || undefined,
        contactNumber: formData.contactNumber.trim() || undefined,
        placeEnglish: formData.placeEnglish.trim() || undefined,
      });

      if (res.success) {
        setFormSuccess('Student profile updated successfully.');
        await loadData();
        setTimeout(() => {
          setEditStudent(null);
          setFormSuccess(null);
          resetForm();
        }, 1200);
      } else {
        setFormError(res.message || 'Failed to update student.');
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Update failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (stu: StudentProfile) => {
    setEditStudent(stu);
    setFormData({
      userId: typeof stu.userId === 'string' ? stu.userId : (stu.userId as any)?._id || '',
      nameEnglish: stu.nameEnglish || '',
      nameArabic: stu.nameArabic || '',
      fatherName: stu.fatherName || '',
      motherName: stu.motherName || '',
      dateOfBirth: stu.dateOfBirth ? stu.dateOfBirth.substring(0, 10) : '',
      admissionYear: stu.admissionYear || new Date().getFullYear(),
      classId: typeof stu.classId === 'string' ? stu.classId : (stu.classId as any)?._id || '',
      contactNumber: stu.contactNumber || '',
      placeEnglish: stu.placeEnglish || '',
    });
    setFormError(null);
    setFormSuccess(null);
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      nameEnglish: '',
      nameArabic: '',
      fatherName: '',
      motherName: '',
      dateOfBirth: '',
      admissionYear: new Date().getFullYear(),
      classId: '',
      contactNumber: '',
      placeEnglish: '',
    });
  };

  const filteredStudents = students.filter((stu) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = (stu.nameEnglish || '').toLowerCase().includes(q) ||
      (stu.registrationNumber || '').toLowerCase().includes(q) ||
      (stu.fatherName || '').toLowerCase().includes(q) ||
      (stu.placeEnglish || '').toLowerCase().includes(q);

    const sClassId = typeof stu.classId === 'string' ? stu.classId : (stu.classId as any)?._id;
    const classMatch = !selectedClassId || sClassId === selectedClassId;
    const statusMatch = statusFilter === 'ALL' || (stu.status || 'ACTIVE') === statusFilter;

    return nameMatch && classMatch && statusMatch;
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
            <span className="text-slate-900 font-semibold">Students</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#132238]">
            Enrolled Candidates
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage candidates belonging to your campus cohort and submit new enrollments.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              resetForm();
              setFormError(null);
              setFormSuccess(null);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center space-x-2 bg-[#2F7C7A] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#256664] transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8E0] shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, reg number, place..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-800"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-700 w-full sm:w-44"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name || cls.className}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-700 w-full sm:w-32"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No student profiles found</p>
            <p className="text-xs text-slate-400 mt-1">
              {students.length === 0
                ? 'No students are currently enrolled under this institution.'
                : 'No students match your filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8F5] border-b border-[#E2E8E0] text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Reg Number</th>
                  <th className="p-4">Candidate Name</th>
                  <th className="p-4">Class Cohort</th>
                  <th className="p-4">Admission Year</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((stu) => {
                  const cls = (stu.classId as any);
                  return (
                    <tr key={stu._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-800">
                        {stu.registrationNumber || 'PENDING'}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{stu.nameEnglish}</div>
                        {stu.placeEnglish && (
                          <span className="text-[11px] text-slate-400">{stu.placeEnglish}</span>
                        )}
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {cls?.name || cls?.className || '—'}
                      </td>
                      <td className="p-4 font-mono text-slate-600">
                        {stu.admissionYear || '—'}
                      </td>
                      <td className="p-4 text-slate-600">
                        {stu.contactNumber || '—'}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {stu.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => setViewStudent(stu)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-[#2F7C7A] transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(stu)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-4 h-4" />
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

      {/* View Student Modal */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#2F7C7A] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#132238]">{viewStudent.nameEnglish}</h3>
                  <p className="text-[11px] font-mono text-slate-500">Reg: {viewStudent.registrationNumber || 'PENDING'}</p>
                </div>
              </div>
              <button
                onClick={() => setViewStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Father's Name</span>
                <p className="font-medium text-slate-800 mt-0.5">{viewStudent.fatherName || '—'}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Mother's Name</span>
                <p className="font-medium text-slate-800 mt-0.5">{viewStudent.motherName || '—'}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Date of Birth</span>
                <p className="font-mono text-slate-800 mt-0.5">
                  {viewStudent.dateOfBirth ? new Date(viewStudent.dateOfBirth).toLocaleDateString('en-GB') : '—'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Admission Year</span>
                <p className="font-mono text-slate-800 mt-0.5">{viewStudent.admissionYear || '—'}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Class Cohort</span>
                <p className="font-medium text-slate-800 mt-0.5">
                  {(viewStudent.classId as any)?.name || (viewStudent.classId as any)?.className || '—'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Contact Number</span>
                <p className="font-medium text-slate-800 mt-0.5">{viewStudent.contactNumber || '—'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Place / Residence</span>
                <p className="font-medium text-slate-800 mt-0.5">{viewStudent.placeEnglish || '—'}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewStudent(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Student Modal */}
      {(showCreateModal || editStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-[#2F7C7A]" />
                <h3 className="font-bold text-sm text-[#132238]">
                  {editStudent ? 'Edit Student Profile' : 'Register New Student'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditStudent(null);
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

            <form onSubmit={editStudent ? handleUpdateSubmit : handleCreateSubmit} className="space-y-4 text-xs">
              {!editStudent && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    User Account ID (24-char Hex ObjectId) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 64b8f... (User ID created for student)"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Student authentication account must exist or be provided by administrator.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Name (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Student Full Name"
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
                  <label className="block font-bold text-slate-700 mb-1">Father's Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Father Name"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mother's Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Mother Name"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Admission Year *</label>
                  <input
                    type="number"
                    min={2000}
                    max={2100}
                    required
                    value={formData.admissionYear}
                    onChange={(e) => setFormData({ ...formData, admissionYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Class Cohort</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name || cls.className}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Number</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Place / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Kozhikode"
                    value={formData.placeEnglish}
                    onChange={(e) => setFormData({ ...formData, placeEnglish: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditStudent(null);
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
                  {formLoading ? 'Saving...' : editStudent ? 'Save Changes' : 'Register Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
