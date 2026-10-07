'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  Edit3,
  X,
  User as UserIcon,
  CheckCircle,
  Mail,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Eye,
  ShieldAlert,
  Trash2,
  Calendar,
  Phone,
  BookOpen,
  Building2,
  AlertTriangle,
  MoreVertical,
  Filter,
  Check,
} from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import {
  getStudents,
  registerStudentFull,
  updateStudent,
  updateStudentStatus,
  deleteStudent,
} from '@/services/student.service';
import { getInstitutions } from '@/services/institution.service';
import { getClasses } from '@/services/academic.service';
import { verifyEmailOtp, resendEmailOtp } from '@/services/auth.service';
import { bulkAssignStudents, BulkAssignStudentsResponse } from '@/services/admin.service';
import { StudentProfile, Institution, ClassModel, User } from '@/types';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [classesList, setClassesList] = useState<ClassModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('');

  // Dropdown Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Form Modal State
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [regSuccessData, setRegSuccessData] = useState<any>(null);
  const [modalOtp, setModalOtp] = useState(['', '', '', '', '', '']);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpResending, setOtpResending] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [otpVerified, setOtpVerified] = useState(false);
  const modalOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Student Lifecycle Management States
  const [viewingStudent, setViewingStudent] = useState<StudentProfile | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentProfile | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Bulk Assign Class State
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [bulkAssignModalOpen, setBulkAssignModalOpen] = useState(false);
  const [targetClassId, setTargetClassId] = useState('');
  const [bulkAssignSubmitting, setBulkAssignSubmitting] = useState(false);
  const [bulkAssignResult, setBulkAssignResult] = useState<BulkAssignStudentsResponse | null>(null);
  const [bulkAssignError, setBulkAssignError] = useState('');

  // Close More Menu on outside click

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    if (activeMenuId) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [activeMenuId]);

  useEffect(() => {
    if (!regSuccessData || otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [regSuccessData, otpTimer]);

  const [formData, setFormData] = useState<any>({
    email: '',
    name: '',
    username: '',
    mobile: '',
    nameEnglish: '',
    nameArabic: '',
    placeEnglish: '',
    placeArabic: '',
    dateOfBirth: '2006-01-01',
    admissionYear: new Date().getFullYear(),
    classId: '',
    institutionId: '',
    contactNumber: '',
    fatherName: '',
    motherName: '',
    parentEmail: '',
    parentMobile: '',
    relationship: 'FATHER',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [stdRes, instRes, clsRes] = await Promise.all([
        getStudents().catch(() => ({ success: false, data: [] })),
        getInstitutions().catch(() => ({ success: false, data: [] })),
        getClasses().catch(() => ({ success: false, data: [] })),
      ]);

      setStudents(stdRes.data || []);
      setInstitutions(instRes.data || []);
      setClassesList(clsRes.data || []);
    } catch (err: any) {
      console.error('Failed to load student records:', err);
      setError('Failed to retrieve student records from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (std: StudentProfile | null = null) => {
    setFormError('');
    setRegSuccessData(null);
    setIsModalOpen(true);

    if (std) {
      setEditingStudent(std);
      setSelectedUser((std.userId as unknown as User) || null);
      setFormData({
        email: (std.userId as any)?.email || '',
        name: (std.userId as any)?.name || std.nameEnglish || '',
        username: (std.userId as any)?.username || '',
        mobile: (std.userId as any)?.mobile || std.contactNumber || '',
        nameEnglish: std.nameEnglish || (std.userId as any)?.name || '',
        nameArabic: std.nameArabic || '',
        placeEnglish: std.placeEnglish || '',
        placeArabic: std.placeArabic || '',
        dateOfBirth: std.dateOfBirth ? new Date(std.dateOfBirth).toISOString().split('T')[0] : '2006-01-01',
        admissionYear: std.admissionYear || new Date().getFullYear(),
        classId: (std.classId as any)?._id || std.classId || '',
        institutionId: (std.institutionId as any)?._id || std.institutionId || '',
        contactNumber: std.contactNumber || (std.userId as any)?.mobile || '',
        fatherName: std.fatherName || '',
        motherName: std.motherName || '',
      });
      setFormLoading(false);
    } else {
      setEditingStudent(null);
      setSelectedUser(null);
      setFormData({
        email: '',
        name: '',
        username: '',
        mobile: '',
        nameEnglish: '',
        nameArabic: '',
        placeEnglish: '',
        placeArabic: '',
        dateOfBirth: '2006-01-01',
        admissionYear: new Date().getFullYear(),
        classId: classesList[0]?._id || '',
        contactNumber: '',
        fatherName: '',
        motherName: '',
        parentEmail: '',
        parentMobile: '',
        relationship: 'FATHER',
      });
      setFormLoading(false);
    }
  };

  const handleModalOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...modalOtp];
    newOtp[index] = value.slice(-1);
    setModalOtp(newOtp);
    if (value && index < 5 && modalOtpRefs.current[index + 1]) {
      modalOtpRefs.current[index + 1]?.focus();
    }
  };

  const handleModalOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !modalOtp[index] && index > 0 && modalOtpRefs.current[index - 1]) {
      modalOtpRefs.current[index - 1]?.focus();
    }
  };

  const handleModalOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) return;
    const digits = pastedData.split('');
    setModalOtp(digits);
    modalOtpRefs.current[5]?.focus();
  };

  const handleModalVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setOtpSuccess('');

    const targetEmail =
      regSuccessData?.email ||
      (regSuccessData?.student?.userId as any)?.email ||
      formData.email;

    const fullOtp = modalOtp.join('');
    if (fullOtp.length !== 6) {
      setOtpError('Please enter the complete 6-digit verification code.');
      return;
    }

    setOtpVerifying(true);
    try {
      const res: any = await verifyEmailOtp({
        email: targetEmail.trim().toLowerCase(),
        otp: fullOtp,
      });
      setOtpVerifying(false);
      if (res.success) {
        setOtpVerified(true);
        setOtpSuccess(res.message || 'Email verified successfully! Student account is now active.');
        fetchData();
      } else {
        setOtpError(res.message || 'Verification failed.');
      }
    } catch (err: any) {
      setOtpVerifying(false);
      const data = err.response?.data;
      if (data?.alreadyVerified) {
        setOtpVerified(true);
        setOtpSuccess(data.message || 'Email is already verified.');
        fetchData();
      } else {
        setOtpError(data?.message || 'Verification failed. Please check the code.');
      }
    }
  };

  const handleModalResendOtp = async () => {
    if (otpTimer > 0 || otpResending) return;
    const targetEmail =
      regSuccessData?.email ||
      (regSuccessData?.student?.userId as any)?.email ||
      formData.email;

    setOtpError('');
    setOtpSuccess('');
    setOtpResending(true);
    try {
      const res: any = await resendEmailOtp({ email: targetEmail.trim().toLowerCase() });
      setOtpResending(false);
      if (res.success) {
        if (res.alreadyVerified) {
          setOtpVerified(true);
          setOtpSuccess('Account is already verified.');
        } else {
          setOtpSuccess(res.message || 'A new verification code has been dispatched.');
          setOtpTimer(60);
        }
      } else {
        setOtpError(res.message || 'Failed to resend code.');
      }
    } catch (err: any) {
      setOtpResending(false);
      setOtpError(err.response?.data?.message || 'Failed to resend verification code.');
    }
  };

  const handleNavigateToVerify = () => {
    const targetEmail =
      regSuccessData?.email ||
      (regSuccessData?.student?.userId as any)?.email ||
      formData.email;
    setIsModalOpen(false);
    setRegSuccessData(null);
    router.push(`/verify-email?email=${encodeURIComponent(targetEmail.trim().toLowerCase())}`);
  };

  const handleToggleStudentStatus = async (std: StudentProfile) => {
    const currentStatus = (std.userId as any)?.status || std.status || 'ACTIVE';
    const targetStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateStudentStatus(std._id, targetStatus);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update student status');
    }
  };

  const handleConfirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteStudent(studentToDelete._id, false);
      setDeleteLoading(false);
      setStudentToDelete(null);
      fetchData();
    } catch (err: any) {
      setDeleteLoading(false);
      setDeleteError(err.response?.data?.message || 'Failed to deactivate/delete student');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (editingStudent) {
        const res: any = await updateStudent(editingStudent._id, formData);
        setFormLoading(false);
        if (res.success && (res.requiresEmailVerification || res.data?.requiresEmailVerification)) {
          setRegSuccessData({
            student: res.data?.student || res.data,
            email: res.data?.email || formData.email,
            maskedEmail: res.data?.maskedEmail,
            verificationId: res.data?.verificationId,
            isEmailUpdate: true,
          });
          setModalOtp(['', '', '', '', '', '']);
          setOtpError('');
          setOtpSuccess('');
          setOtpTimer(60);
          setOtpVerified(false);
          fetchData();
        } else {
          setIsModalOpen(false);
          fetchData();
        }
      } else {
        const res = await registerStudentFull(formData);
        setFormLoading(false);
        if (res.success && res.data) {
          setRegSuccessData(res.data);
          setModalOtp(['', '', '', '', '', '']);
          setOtpError('');
          setOtpSuccess('');
          setOtpTimer(60);
          setOtpVerified(false);
          fetchData();
        } else {
          setIsModalOpen(false);
          fetchData();
        }
      }
    } catch (err: any) {
      setFormLoading(false);
      setFormError(err.response?.data?.message || 'Failed to save student profile.');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setClassFilter('');
    setInstitutionFilter('');
  };

  const hasActiveFilters = Boolean(search || statusFilter || classFilter || institutionFilter);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      // 1. Search Query
      if (search.trim()) {
        const q = search.toLowerCase();
        const name = ((s.userId as any)?.name || s.nameEnglish || '').toLowerCase();
        const email = ((s.userId as any)?.email || '').toLowerCase();
        const reg = (s.registrationNumber || '').toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !reg.includes(q)) return false;
      }

      // 2. Status Filter
      if (statusFilter) {
        const userStatus = ((s.userId as any)?.status || s.status || 'ACTIVE').toUpperCase();
        if (userStatus !== statusFilter.toUpperCase()) return false;
      }

      // 3. Class Filter
      if (classFilter) {
        const cId = (s.classId as any)?._id || s.classId;
        if (cId !== classFilter) return false;
      }

      // 4. Campus / Institution Filter
      if (institutionFilter) {
        const instId = (s.institutionId as any)?._id || s.institutionId;
        if (instId !== institutionFilter) return false;
      }

      return true;
    });
  }, [students, search, statusFilter, classFilter, institutionFilter]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E3EAE5] shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <span>Admin</span>
            <span>/</span>
            <span>User Management</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Students</span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171D19]">Students</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-[#EAF2EC] text-[#23804A] rounded-full border border-green-100">
              {students.length} Enrolled
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage student accounts, profiles and enrollment.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-[#23804A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#1B6F41] transition-colors cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Student
        </button>
      </div>

      {/* 2. Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3EAE5] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, email, or registration number..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E3EAE5] text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#23804A] bg-slate-50/50 focus:bg-white transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="min-w-[130px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium border border-[#E3EAE5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#23804A] bg-white text-slate-700 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING_SETUP">Pending Setup</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Class / Cohort Filter */}
            <div className="min-w-[140px]">
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium border border-[#E3EAE5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#23804A] bg-white text-slate-700 cursor-pointer"
              >
                <option value="">All Classes</option>
                {classesList.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} ({cls.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Campus / Institution Filter */}
            {institutions.length > 0 && (
              <div className="min-w-[140px]">
                <select
                  value={institutionFilter}
                  onChange={(e) => setInstitutionFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium border border-[#E3EAE5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#23804A] bg-white text-slate-700 cursor-pointer"
                >
                  <option value="">All Campuses</option>
                  {institutions.map((inst) => (
                    <option key={inst._id} value={inst._id}>
                      {inst.institutionName || inst.name} {inst.institutionCode || (inst as any).code ? `(${inst.institutionCode || (inst as any).code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear Filters Action */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center text-xs text-rose-600 hover:text-rose-700 hover:underline font-semibold px-2 py-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5 mr-1" /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Toolbar Subtext / Filter Count Indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800">{filtered.length}</strong> of{' '}
            <strong className="text-slate-800">{students.length}</strong> students
          </span>
          {hasActiveFilters && (
            <span className="text-[11px] text-[#23804A] bg-green-50 px-2.5 py-0.5 rounded-full font-medium border border-green-100">
              Filters applied
            </span>
          )}
        </div>
      </div>

      {/* Bulk Action Bar (Visible when students are selected) */}
      {selectedStudentIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-[#171D19] text-white rounded-2xl shadow-md animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center space-x-3 text-xs">
            <span className="font-bold bg-[#23804A] text-white px-2.5 py-1 rounded-md">
              {selectedStudentIds.length} Selected
            </span>
            <span className="text-slate-300 hidden sm:inline">
              Choose an action to apply to the selected students
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setBulkAssignModalOpen(true);
                setBulkAssignResult(null);
                setBulkAssignError('');
                setTargetClassId(classesList[0]?._id || '');
              }}
              className="px-3.5 py-1.5 bg-[#23804A] hover:bg-[#1B6F41] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Assign to Class</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedStudentIds([])}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* 3. Students Table Card */}
      <div className="bg-white rounded-2xl border border-[#E3EAE5] shadow-xs overflow-hidden">
        {loading ? (
          /* Loading Skeleton */
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="h-4 w-40 bg-slate-200 animate-pulse rounded" />
              <div className="h-4 w-20 bg-slate-200 animate-pulse rounded" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-32 bg-slate-200 animate-pulse rounded" />
                    <div className="h-2.5 w-44 bg-slate-200 animate-pulse rounded" />
                  </div>
                </div>
                <div className="h-5 w-24 bg-slate-200 animate-pulse rounded hidden sm:block" />
                <div className="h-6 w-28 bg-slate-200 animate-pulse rounded hidden md:block" />
                <div className="h-5 w-20 bg-slate-200 animate-pulse rounded" />
                <div className="h-7 w-24 bg-slate-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-rose-800">Failed to load student records</h3>
              <p className="text-xs text-rose-600 max-w-md mx-auto">{error}</p>
            </div>
            <button
              onClick={fetchData}
              className="inline-flex items-center px-4 py-2 bg-[#23804A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#1B6F41] transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
            </button>
          </div>
        ) : filtered.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#171D19]">No student profiles found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'No students match your selected search query and filter combination. Try clearing your filters.'
                : 'Get started by creating a student profile to link registered student accounts.'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5 mr-1" /> Clear all filters
              </button>
            ) : (
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center px-4 py-2 bg-[#23804A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#1B6F41] transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 mr-2" /> Add First Student
              </button>
            )}
          </div>
        ) : (
          /* Populated Table */
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FBFCFB] text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#E3EAE5]">
                <tr>
                  <th className="w-10 px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selectedStudentIds.length === filtered.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudentIds(filtered.map((s) => s._id));
                        } else {
                          setSelectedStudentIds([]);
                        }
                      }}
                      className="rounded border-slate-300 text-[#23804A] focus:ring-[#23804A] cursor-pointer"
                      title="Select all students"
                    />
                  </th>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Registration Number</th>
                  <th className="px-5 py-3.5">Class / Cohort</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EAE5]">
                {filtered.map((std) => {
                  const studentName = (std.userId as any)?.name || std.nameEnglish || 'N/A';
                  const studentEmail = (std.userId as any)?.email || 'No email attached';
                  const initial = studentName.charAt(0).toUpperCase();
                  const className = (std.classId as any)?.name || (std.classId as any)?.code || (std.classId as any)?.className || 'General Cohort';
                  const batchYear = std.admissionYear ? `Batch of ${std.admissionYear}` : 'No cohort year';
                  const status = (std.userId as any)?.status || std.status || 'ACTIVE';
                  const isSelected = selectedStudentIds.includes(std._id);

                  return (
                    <tr key={std._id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-green-50/40' : ''}`}>
                      <td className="w-10 px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudentIds((prev) => [...prev, std._id]);
                            } else {
                              setSelectedStudentIds((prev) => prev.filter((id) => id !== std._id));
                            }
                          }}
                          className="rounded border-slate-300 text-[#23804A] focus:ring-[#23804A] cursor-pointer"
                        />
                      </td>
                      {/* Column 1: Student */}
                      <td className="px-5 py-3.5">

                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-[#EAF2EC] border border-green-100 text-[#23804A] flex items-center justify-center font-bold text-xs shrink-0">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-[#171D19] truncate">{studentName}</p>
                            <p className="text-xs text-slate-500 font-normal truncate">{studentEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Registration Number */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold text-[#23804A] bg-green-50/70 px-2.5 py-1 rounded-md border border-green-100/80 inline-block">
                          {std.registrationNumber || 'Pending'}
                        </span>
                      </td>

                      {/* Column 3: Class / Cohort (Two-line clean hierarchy) */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="font-semibold text-xs text-slate-800">{className}</p>
                        <p className="text-[11px] text-slate-400 font-normal">{batchYear}</p>
                      </td>

                      {/* Column 4: Account Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <StatusBadge status={status} />
                      </td>

                      {/* Column 5: Actions (View, Edit, More ⋮) */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end space-x-1.5">
                          {/* View Button */}
                          <button
                            onClick={() => setViewingStudent(std)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenModal(std)}
                            className="px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-[#23804A] border border-green-200/80 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Edit Student"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#23804A]" />
                            <span>Edit</span>
                          </button>

                          {/* More (⋮) Menu */}
                          <div
                            className="relative inline-block text-left"
                            ref={activeMenuId === std._id ? menuRef : null}
                          >
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === std._id ? null : std._id)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                              title="More actions"
                              aria-expanded={activeMenuId === std._id}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenuId === std._id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-[#E3EAE5] py-1.5 z-30 focus:outline-none animate-in fade-in zoom-in-95 duration-100">
                                {/* Toggle Status */}
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    handleToggleStudentStatus(std);
                                  }}
                                  className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                                    status === 'ACTIVE'
                                      ? 'text-amber-700 hover:bg-amber-50'
                                      : 'text-emerald-700 hover:bg-emerald-50'
                                  }`}
                                >
                                  {status === 'ACTIVE' ? (
                                    <>
                                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Deactivate Student</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Activate Student</span>
                                    </>
                                  )}
                                </button>

                                <div className="my-1 border-t border-slate-100" />

                                {/* Delete / Archive */}
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setDeleteError('');
                                    setStudentToDelete(std);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Deactivate / Archive</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Clean Footer Area */}
        {!loading && !error && filtered.length > 0 && (
          <div className="px-6 py-4 bg-[#FBFCFB] border-t border-[#E3EAE5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{filtered.length}</strong> of{' '}
              <strong className="text-slate-800">{students.length}</strong> registered students
            </span>
            <span className="text-slate-400 text-[11px]">
              MISC Academic Directorate
            </span>
          </div>
        )}
      </div>

      {/* Form Modal (Create / Edit & Verification) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl border border-[#E3EAE5] p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#171D19]">
                {regSuccessData
                  ? regSuccessData.isEmailUpdate
                    ? 'Verify New Email Address'
                    : 'Registration Complete'
                  : editingStudent
                  ? 'Edit Student Profile'
                  : 'Register New Student'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setRegSuccessData(null);
                  setModalOtp(['', '', '', '', '', '']);
                  setOtpError('');
                  setOtpSuccess('');
                  setOtpVerified(false);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded font-medium">
                {formError}
              </div>
            )}

            {/* OTP / Account Setup Confirmation Screen */}
            {regSuccessData ? (
              <div className="space-y-5 py-3">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-bold text-[#171D19]">
                    {regSuccessData.isEmailUpdate
                      ? 'Student Email Updated'
                      : 'Student Registered Successfully'}
                  </h4>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-xs font-mono font-bold text-[#23804A]">
                    Reg No: {regSuccessData.student?.registrationNumber || 'Assigned'}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-[#23804A] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Email Verification Dispatched</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        A 6-digit verification code has been dispatched to{' '}
                        <span className="font-mono font-bold text-slate-800">
                          {regSuccessData.maskedEmail || regSuccessData.email || formData.email}
                        </span>
                        .
                      </p>
                    </div>
                  </div>

                  {regSuccessData.verificationId && (
                    <div className="flex items-start gap-2.5 pt-1 border-t border-slate-200">
                      <KeyRound className="w-4 h-4 text-[#23804A] mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">Verification Session ID</p>
                        <p className="font-mono text-[11px] text-slate-500 break-all">
                          {regSuccessData.verificationId}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {otpError && (
                  <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded font-medium">
                    {otpError}
                  </div>
                )}

                {otpSuccess && (
                  <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs rounded font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{otpSuccess}</span>
                  </div>
                )}

                {/* Inline OTP Verification */}
                {!otpVerified ? (
                  <form onSubmit={handleModalVerifyOtp} className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#171D19]">
                      <ShieldCheck className="w-4 h-4 text-[#23804A]" />
                      <span>Enter Student Verification OTP</span>
                    </div>

                    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleModalOtpPaste}>
                      {modalOtp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            modalOtpRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleModalOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleModalOtpKeyDown(idx, e)}
                          className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#23804A] focus:border-transparent transition-all shadow-xs"
                        />
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleModalResendOtp}
                        disabled={otpTimer > 0 || otpResending}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#23804A] hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${otpResending ? 'animate-spin' : ''}`} />
                        {otpTimer > 0 ? `Resend code in ${otpTimer}s` : 'Resend Code'}
                      </button>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={handleNavigateToVerify}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-300 bg-white text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                          <span>Open Verification Page</span>
                        </button>

                        <button
                          type="submit"
                          disabled={otpVerifying || modalOtp.join('').length !== 6}
                          className="px-5 py-2 bg-[#23804A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1B6F41] disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          {otpVerifying ? 'Verifying...' : 'Verify OTP'}
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
                    <p className="text-xs font-bold text-emerald-800">
                      Email address verified successfully.
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      {regSuccessData?.isEmailUpdate
                        ? 'Email has been updated successfully.'
                        : 'A secure password setup link has been dispatched to the student’s email to complete their account onboarding.'}
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setRegSuccessData(null);
                      setModalOtp(['', '', '', '', '', '']);
                      setOtpError('');
                      setOtpSuccess('');
                      setOtpVerified(false);
                    }}
                    className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-200 cursor-pointer"
                  >
                    Done & Return to Roster
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-1">
                {/* Account Credentials Section (Only in New Registration Mode) */}
                {!editingStudent && (
                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#171D19]">
                      <UserIcon className="w-4 h-4 text-[#23804A]" />
                      <span>1. Portal Account Credentials</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                          Student Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="student@markaz.in"
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                          Mobile Number
                        </label>
                        <input
                          type="text"
                          value={formData.mobile}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              mobile: e.target.value,
                              contactNumber: formData.contactNumber || e.target.value,
                            })
                          }
                          placeholder="+91 9876543210"
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                          Username (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          placeholder="e.g. ansar2026"
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Account & Contact Credentials in Edit Mode */}
                {editingStudent && (
                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-[#171D19] uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-[#23804A]" /> Account Credentials & Email
                      </span>
                      {selectedUser && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
                          {selectedUser.role}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] text-xs"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Changing email will require OTP re-verification for security.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                          Primary Contact Number
                        </label>
                        <input
                          type="text"
                          value={formData.contactNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contactNumber: e.target.value,
                              mobile: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Personal Information */}
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#171D19]">
                    <UserIcon className="w-4 h-4 text-[#23804A]" />
                    <span>2. Personal Information</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                        Full Name (English) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nameEnglish}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nameEnglish: e.target.value,
                            name: formData.name || e.target.value,
                          })
                        }
                        placeholder="MUHAMMED ANSAR"
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] text-xs uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                        Name (Arabic)
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={formData.nameArabic}
                        onChange={(e) => setFormData({ ...formData, nameArabic: e.target.value })}
                        placeholder="محمد أنصار"
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] text-xs font-arabic"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                        Native Place (English)
                      </label>
                      <input
                        type="text"
                        value={formData.placeEnglish}
                        onChange={(e) => setFormData({ ...formData, placeEnglish: e.target.value })}
                        placeholder="Kozhikode, Kerala"
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                        Native Place (Arabic)
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={formData.placeArabic}
                        onChange={(e) => setFormData({ ...formData, placeArabic: e.target.value })}
                        placeholder="كوزيكود، كيرالا"
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] text-xs font-arabic"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Enrollment Information */}
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#171D19]">
                    <Building2 className="w-4 h-4 text-[#23804A]" />
                    <span>3. Academic Enrollment</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                        Class / Standard *
                      </label>
                      <select
                        required
                        value={formData.classId}
                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] text-xs bg-white"
                      >
                        <option value="">Select Enrolled Class</option>
                        {classesList.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                        Campus / Institution
                      </label>
                      <select
                        value={formData.institutionId}
                        onChange={(e) => setFormData({ ...formData, institutionId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] text-xs bg-white"
                      >
                        <option value="">Select Campus (Optional)</option>
                        {institutions.map((inst) => (
                          <option key={inst._id} value={inst._id}>
                            {inst.institutionName || inst.name} {inst.institutionCode || (inst as any).code ? `(${inst.institutionCode || (inst as any).code})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                        Admission Year *
                      </label>
                      <input
                        type="number"
                        required
                        min={2000}
                        max={2100}
                        value={formData.admissionYear}
                        onChange={(e) =>
                          setFormData({ ...formData, admissionYear: parseInt(e.target.value) || new Date().getFullYear() })
                        }
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Family Information */}
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#171D19]">
                    <UserIcon className="w-4 h-4 text-[#23804A]" />
                    <span>4. Family Information</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                        Father's Name
                      </label>
                      <input
                        type="text"
                        value={formData.fatherName}
                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                        placeholder="Father's full name"
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                        Mother's Name
                      </label>
                      <input
                        type="text"
                        value={formData.motherName}
                        onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                        placeholder="Mother's full name"
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] text-xs"
                      />
                    </div>
                  </div>

                  {/* Parent / Guardian Account Creation (Password-free OTP Authentication) */}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Parent / Guardian Portal (Password-Free OTP Access)
                      </h4>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        OTP Authentication
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                          Parent Email
                        </label>
                        <input
                          type="email"
                          value={formData.parentEmail || ''}
                          onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                          placeholder="parent@example.com"
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                          Parent Mobile
                        </label>
                        <input
                          type="text"
                          value={formData.parentMobile || ''}
                          onChange={(e) => setFormData({ ...formData, parentMobile: e.target.value })}
                          placeholder="9876543210"
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                          Relationship
                        </label>
                        <select
                          value={formData.relationship || 'FATHER'}
                          onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] text-xs bg-white"
                        >
                          <option value="FATHER">Father</option>
                          <option value="MOTHER">Mother</option>
                          <option value="GUARDIAN">Guardian</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setRegSuccessData(null);
                    }}
                    className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-5 py-2.5 bg-[#23804A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1B6F41] disabled:opacity-50 cursor-pointer shadow-sm transition-all"
                  >
                    {formLoading
                      ? 'Processing...'
                      : editingStudent
                      ? 'Update Profile'
                      : 'Register Student & Dispatch Setup Email'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* View Student Details Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-xl border border-[#E3EAE5] p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#EAF2EC] text-[#23804A] flex items-center justify-center font-bold text-sm">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#171D19]">Student Profile Details</h3>
                  <p className="text-xs text-slate-500 font-mono">{viewingStudent.registrationNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name (English)</p>
                  <p className="font-bold text-[#171D19] text-sm">{viewingStudent.nameEnglish || 'N/A'}</p>
                </div>
                {viewingStudent.nameArabic && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Name (Arabic)</p>
                    <p className="font-bold text-[#171D19] text-sm font-arabic">{viewingStudent.nameArabic}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Email</p>
                  <p className="text-slate-700 font-medium">{(viewingStudent.userId as any)?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Number</p>
                  <p className="text-slate-700 font-mono">{viewingStudent.contactNumber || (viewingStudent.userId as any)?.mobile || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Class / Cohort</p>
                  <p className="font-semibold text-slate-800">{(viewingStudent.classId as any)?.name || (viewingStudent.classId as any)?.className || 'General Cohort'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Admission Year</p>
                  <p className="font-semibold text-slate-800">{viewingStudent.admissionYear}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Father's Name</p>
                  <p className="text-slate-700">{viewingStudent.fatherName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mother's Name</p>
                  <p className="text-slate-700">{viewingStudent.motherName || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-xl border border-green-100">
                <span className="text-[11px] font-bold text-[#171D19]">Account Status:</span>
                <StatusBadge status={(viewingStudent.userId as any)?.status || viewingStudent.status || 'ACTIVE'} />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete / Deactivate Student Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-[#E3EAE5] p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#171D19]">Deactivate / Archive Student</h3>
                  <p className="text-xs text-slate-500">Confirm student lifecycle action</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setStudentToDelete(null);
                  setDeleteError('');
                }}
                disabled={deleteLoading}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student Record</p>
                <p className="font-bold text-[#171D19] text-sm">{studentToDelete.nameEnglish}</p>
                <p className="text-slate-500 font-mono">Reg No: {studentToDelete.registrationNumber}</p>
                <p className="text-slate-500">Email: {(studentToDelete.userId as any)?.email || 'N/A'}</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  Preservation Notice:
                </p>
                <p className="text-[11px] leading-relaxed">
                  Deactivating this student account will disable login access and archive the profile. All historical exam marks, results, and payment records remain preserved and will not be destroyed.
                </p>
              </div>

              {deleteError && (
                <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs rounded-r-lg font-semibold">
                  {deleteError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => {
                  setStudentToDelete(null);
                  setDeleteError('');
                }}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDeleteStudent}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center cursor-pointer shadow-xs"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                    DEACTIVATING...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Deactivate Student
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Bulk Assign Class Modal */}
      {bulkAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#171D19] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-green-400" />
                <h3 className="font-serif font-bold text-base">Bulk Assign Students to Class</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBulkAssignModalOpen(false);
                  if (bulkAssignResult && bulkAssignResult.updatedCount > 0) {
                    fetchData();
                    setSelectedStudentIds([]);
                  }
                }}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {bulkAssignResult ? (
                /* Result Summary State */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                    <div className="flex items-center font-bold gap-1.5 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Assignment Completed</span>
                    </div>
                    <p>
                      Successfully assigned <strong>{bulkAssignResult.updatedCount}</strong> student(s) to <strong>{bulkAssignResult.className}</strong>.
                    </p>
                  </div>

                  {bulkAssignResult.skipped && bulkAssignResult.skipped.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-2">
                      <div className="flex items-center font-bold gap-1.5 text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>{bulkAssignResult.skipped.length} Student(s) Skipped</span>
                      </div>
                      <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-amber-100 font-mono text-[11px]">
                        {bulkAssignResult.skipped.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between pt-1">
                            <span className="truncate max-w-[240px] text-slate-700">ID: {item.studentId}</span>
                            <span className="font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px]">
                              {item.reason.replace(/_/g, ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setBulkAssignModalOpen(false);
                        fetchData();
                        setSelectedStudentIds([]);
                      }}
                      className="px-4 py-2 bg-[#23804A] hover:bg-[#1B6F41] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      Done & Refresh Roster
                    </button>
                  </div>
                </div>
              ) : (
                /* Initial Confirmation State */
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    You have selected <strong className="text-[#171D19] font-bold">{selectedStudentIds.length}</strong> student(s). Select the target class cohort below to assign or transfer them.
                  </p>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Target Class Cohort
                    </label>
                    <select
                      value={targetClassId}
                      onChange={(e) => setTargetClassId(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-[#171D19] focus:outline-hidden focus:border-[#23804A] cursor-pointer"
                    >
                      {classesList.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                          {cls.name || (cls as any).className} ({cls.code || 'CLS'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {bulkAssignError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{bulkAssignError}</span>
                    </div>
                  )}

                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                    <p className="font-semibold text-amber-900">Confirmation Note:</p>
                    <p className="text-[11px] text-amber-700">
                      Students already enrolled in this class will be safely skipped without interruption.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      disabled={bulkAssignSubmitting}
                      onClick={() => setBulkAssignModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={bulkAssignSubmitting || !targetClassId}
                      onClick={async () => {
                        try {
                          setBulkAssignSubmitting(true);
                          setBulkAssignError('');
                          const res = await bulkAssignStudents({
                            classId: targetClassId,
                            studentIds: selectedStudentIds,
                          });
                          if (res.success && res.data) {
                            setBulkAssignResult(res.data);
                          } else {
                            setBulkAssignError(res.message || 'Failed to assign students to class');
                          }
                        } catch (err: any) {
                          setBulkAssignError(
                            err.response?.data?.message || err.message || 'Failed to bulk assign students'
                          );
                        } finally {
                          setBulkAssignSubmitting(false);
                        }
                      }}
                      className="px-5 py-2 bg-[#23804A] hover:bg-[#1B6F41] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {bulkAssignSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Assigning...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm Assignment</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

