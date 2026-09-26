'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { StudentProfile, Institution, ClassModel, User } from '@/types';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [classesList, setClassesList] = useState<ClassModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

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

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const name = ((s.userId as any)?.name || s.nameEnglish || '').toLowerCase();
    const email = ((s.userId as any)?.email || '').toLowerCase();
    const reg = (s.registrationNumber || '').toLowerCase();
    return name.includes(q) || email.includes(q) || reg.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-serif font-bold text-[#132238]">Student Profiles Directory</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
              {students.length} Profiles
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Link registered student accounts with institutional academic profiles</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Student Profile
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8E0] shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, email, or registration number..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2E8E0] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading student profiles...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button onClick={fetchData} className="px-4 py-2 bg-[#2F7C7A] text-white font-bold text-xs rounded-lg uppercase cursor-pointer">
              <RefreshCw className="w-4 h-4 mr-2 inline" /> Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-[#132238]">No student profiles found</h3>
            <p className="text-sm text-slate-500">Create a student profile to link registered student accounts.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#E2E8E0]">
                <tr>
                  <th className="px-6 py-4">Student Name & Account</th>
                  <th className="px-6 py-4">Reg. Number</th>
                  <th className="px-6 py-4">Class / Cohort</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {filtered.map((std) => (
                  <tr key={std._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#132238]">
                      {(std.userId as any)?.name || std.nameEnglish || 'N/A'}
                      <p className="text-xs text-slate-400 font-normal">{(std.userId as any)?.email || 'No email'}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-[#2F7C7A] font-semibold">{std.registrationNumber}</td>
                    <td className="px-6 py-4 text-xs text-slate-700">
                      <p className="font-medium text-slate-800">F: {std.fatherName || 'N/A'}</p>
                      <p className="text-slate-400">M: {std.motherName || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">{(std.classId as any)?.name || (std.classId as any)?.className || 'General Cohort'}</p>
                      <p className="text-slate-400">Batch of {std.admissionYear || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={(std.userId as any)?.status || 'ACTIVE'} /></td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button
                        onClick={() => setViewingStudent(std)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5 inline mr-1 text-slate-500" /> View
                      </button>
                      <button
                        onClick={() => handleOpenModal(std)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        title="Edit Student"
                      >
                        <Edit3 className="w-3.5 h-3.5 inline mr-1 text-emerald-600" /> Edit
                      </button>
                      <button
                        onClick={() => handleToggleStudentStatus(std)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          ((std.userId as any)?.status || std.status) === 'ACTIVE'
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                        title={((std.userId as any)?.status || std.status) === 'ACTIVE' ? 'Deactivate Student' : 'Activate Student'}
                      >
                        {((std.userId as any)?.status || std.status) === 'ACTIVE' ? (
                          <><ShieldAlert className="w-3.5 h-3.5 inline mr-1 text-amber-600" /> Deactivate</>
                        ) : (
                          <><ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-emerald-600" /> Activate</>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setDeleteError('');
                          setStudentToDelete(std);
                        }}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        title="Delete/Archive Student"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-1 text-rose-600" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl border border-[#E2E8E0] p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#132238]">
                {regSuccessData
                  ? (regSuccessData.isEmailUpdate ? 'Verify New Email Address' : 'Registration Complete')
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
                  <h4 className="text-lg font-bold text-[#132238]">
                    {regSuccessData.isEmailUpdate
                      ? 'Student Email Updated'
                      : 'Student Registered Successfully'}
                  </h4>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200 rounded-full text-xs font-mono font-bold text-[#2F7C7A]">
                    Reg No: {regSuccessData.student?.registrationNumber || 'Assigned'}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-[#2F7C7A] mt-0.5 shrink-0" />
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
                      <KeyRound className="w-4 h-4 text-[#2F7C7A] mt-0.5 shrink-0" />
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
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#132238]">
                      <ShieldCheck className="w-4 h-4 text-[#2F7C7A]" />
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
                          className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all shadow-xs"
                        />
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleModalResendOtp}
                        disabled={otpTimer > 0 || otpResending}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F7C7A] hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer"
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
                          className="px-5 py-2 bg-[#2F7C7A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#256361] disabled:opacity-50 transition-colors cursor-pointer"
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
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#132238]">
                      <UserIcon className="w-4 h-4 text-[#2F7C7A]" />
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
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A] text-xs"
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
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A] text-xs"
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
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A] text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Account & Contact Credentials in Edit Mode */}
                {editingStudent && (
                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-[#132238] uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-[#2F7C7A]" /> Account Credentials & Email
                      </span>
                      {selectedUser && (
                        <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full font-bold text-[10px]">
                          {selectedUser.role}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A] text-xs bg-white"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                          Changing this email will send a 6-digit OTP and require verification.
                        </p>
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
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A] text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Personal Information Section */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#132238] border-b pb-1">
                    {!editingStudent ? '2. Personal Information' : 'Personal Information'}
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
                        onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value })}
                        placeholder="Full Name in English"
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                        Name in Arabic
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={formData.nameArabic}
                        onChange={(e) => setFormData({ ...formData, nameArabic: e.target.value })}
                        placeholder="الاسم الكامل"
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A] text-xs font-arabic"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                        Place of Birth (English)
                      </label>
                      <input
                        type="text"
                        value={formData.placeEnglish}
                        onChange={(e) => setFormData({ ...formData, placeEnglish: e.target.value })}
                        placeholder="e.g. Calicut"
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A] text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Family Details Section */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#132238] border-b pb-1">
                    {!editingStudent ? '3. Family & Guardian Details' : 'Family Details'}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                        Father's Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fatherName}
                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                        placeholder="Father's Name"
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                        Mother's Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.motherName}
                        onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                        placeholder="Mother's Name"
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                        Guardian Contact
                      </label>
                      <input
                        type="text"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                        placeholder="+91 9876543210"
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A] text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Enrollment Section */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#132238] border-b pb-1">
                    {!editingStudent ? '4. Academic Enrollment' : 'Academic Enrollment'}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                        Class / Level
                      </label>
                      <select
                        value={formData.classId}
                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A] text-xs cursor-pointer"
                      >
                        <option value="">-- Select Class --</option>
                        {classesList.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name || c.className}
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
                        min="2000"
                        max="2100"
                        required
                        value={formData.admissionYear}
                        onChange={(e) =>
                          setFormData({ ...formData, admissionYear: parseInt(e.target.value, 10) || '' })
                        }
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A] text-xs"
                      />
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
                    className="px-5 py-2.5 bg-[#2F7C7A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#256361] disabled:opacity-50 cursor-pointer shadow-sm transition-all"
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
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-xl border border-[#E2E8E0] p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-teal-50 text-[#2F7C7A] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#132238]">Student Profile Details</h3>
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
                  <p className="font-bold text-[#132238] text-sm">{viewingStudent.nameEnglish || 'N/A'}</p>
                </div>
                {viewingStudent.nameArabic && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Name (Arabic)</p>
                    <p className="font-bold text-[#132238] text-sm">{viewingStudent.nameArabic}</p>
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

              <div className="flex items-center justify-between p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                <span className="text-[11px] font-bold text-[#132238]">Account Status:</span>
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
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-[#E2E8E0] p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#132238]">Deactivate / Archive Student</h3>
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
                <p className="font-bold text-[#132238] text-sm">{studentToDelete.nameEnglish}</p>
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
    </div>
  );
}
