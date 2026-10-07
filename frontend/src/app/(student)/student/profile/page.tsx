'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getStudentProfile,
  updateMyProfile,
  uploadStudentPhoto,
  deleteStudentPhoto,
  linkParent,
  getLinkedParent,
  resendParentVerificationOtp,
} from '@/services/student.service';
import { getFileUrl } from '@/utils/fileUrl';
import { verifyEmailOtp, resendEmailOtp } from '@/services/auth.service';
import { setUser } from '@/utils/token';
import { StudentProfile } from '@/types';
import {
  User,
  Building2,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Users,
  ShieldCheck,
  ArrowLeft,
  FileText,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Edit2,
  X,
  ExternalLink,
  PlusCircle,
  Camera,
  Trash2,
  Upload,
  Loader2,
} from 'lucide-react';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Linked Parent State
  const [linkedParent, setLinkedParent] = useState<{
    id?: string;
    name: string;
    email: string;
    relationType: string;
    mobile?: string;
    contactNumber?: string;
    emailVerified: boolean;
    status: string;
  } | null>(null);
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [parentForm, setParentForm] = useState({
    parentName: '',
    parentEmail: '',
    relationType: 'FATHER',
    parentMobile: '',
  });
  const [parentSubmitting, setParentSubmitting] = useState(false);
  const [parentModalError, setParentModalError] = useState('');
  const [parentModalSuccess, setParentModalSuccess] = useState('');
  const [parentResendCooldown, setParentResendCooldown] = useState(0);
  const [parentResending, setParentResending] = useState(false);
  const [parentCardFeedback, setParentCardFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Email Change Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailChangeStep, setEmailChangeStep] = useState<'INPUT' | 'OTP'>('INPUT');
  const [newEmailInput, setNewEmailInput] = useState('');
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState('');

  // OTP Verification State inside Modal
  const [verificationData, setVerificationData] = useState<{
    email: string;
    maskedEmail: string;
    verificationId?: string;
  } | null>(null);
  const [modalOtp, setModalOtp] = useState<string[]>(['', '', '', '', '', '']);
  const modalOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpResending, setOtpResending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  // Profile Photo Management State
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Profile Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    nameEnglish: '',
    nameArabic: '',
    contactNumber: '',
    dateOfBirth: '',
    placeEnglish: '',
    placeArabic: '',
    fatherName: '',
    motherName: '',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoFeedback({ type: 'error', message: 'Only JPEG, PNG, and WebP images are allowed.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoFeedback({ type: 'error', message: 'Photo file size exceeds the 5MB maximum limit.' });
      return;
    }

    try {
      setPhotoUploading(true);
      setPhotoFeedback(null);
      const res = await uploadStudentPhoto(file);
      if (res.success && res.data) {
        setProfile(res.data);
        setPhotoFeedback({ type: 'success', message: 'Profile photo updated successfully!' });
      } else {
        setPhotoFeedback({ type: 'error', message: res.message || 'Failed to upload profile photo.' });
      }
    } catch (err: any) {
      setPhotoFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to upload photo.',
      });
    } finally {
      setPhotoUploading(false);
    }
  };

  const handlePhotoRemove = async () => {
    if (!profile?.photo) return;
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;

    try {
      setPhotoUploading(true);
      setPhotoFeedback(null);
      const res = await deleteStudentPhoto();
      if (res.success && res.data) {
        setProfile(res.data);
        setPhotoFeedback({ type: 'success', message: 'Profile photo removed.' });
      } else {
        setPhotoFeedback({ type: 'error', message: res.message || 'Failed to remove photo.' });
      }
    } catch (err: any) {
      setPhotoFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to remove photo.',
      });
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleOpenEditModal = () => {
    if (!profile) return;
    setEditForm({
      nameEnglish: profile.nameEnglish || '',
      nameArabic: profile.nameArabic || '',
      contactNumber: profile.contactNumber || (profile.userId as any)?.mobile || '',
      dateOfBirth: profile.dateOfBirth ? String(profile.dateOfBirth).split('T')[0] : '',
      placeEnglish: profile.placeEnglish || '',
      placeArabic: profile.placeArabic || '',
      fatherName: profile.fatherName || '',
      motherName: profile.motherName || '',
    });
    setEditError(null);
    setEditSuccess(null);
    setIsEditModalOpen(true);
  };

  const handleSaveEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.nameEnglish.trim()) {
      setEditError('Student name (English) is required.');
      return;
    }
    if (!editForm.dateOfBirth) {
      setEditError('Date of birth is required.');
      return;
    }
    if (!editForm.fatherName.trim()) {
      setEditError("Father's name is required.");
      return;
    }
    if (!editForm.motherName.trim()) {
      setEditError("Mother's name is required.");
      return;
    }

    try {
      setEditSubmitting(true);
      setEditError(null);
      setEditSuccess(null);

      const payload = {
        nameEnglish: editForm.nameEnglish.trim(),
        nameArabic: editForm.nameArabic.trim(),
        contactNumber: editForm.contactNumber.trim(),
        dateOfBirth: editForm.dateOfBirth,
        placeEnglish: editForm.placeEnglish.trim(),
        placeArabic: editForm.placeArabic.trim(),
        fatherName: editForm.fatherName.trim(),
        motherName: editForm.motherName.trim(),
      };

      const res = await updateMyProfile(payload);
      if (res.success && res.data) {
        setProfile(res.data);
        if (user && editForm.nameEnglish.trim()) {
          setUser({ ...user, name: editForm.nameEnglish.trim() });
        }
        setEditSuccess('Profile details updated successfully!');
        setTimeout(() => {
          setIsEditModalOpen(false);
          setEditSuccess(null);
        }, 1200);
      } else {
        setEditError(res.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setEditError(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStudentProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setLinkedParent((res.data as any).parent || null);
      } else {
        setError(res.message || 'Student profile not found.');
      }
    } catch (err: any) {
      console.error('Failed to load student profile:', err);
      setError(err.response?.data?.message || 'Failed to retrieve profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Timer countdown for resend OTP cooldown
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Timer countdown for resend parent OTP cooldown
  useEffect(() => {
    if (parentResendCooldown <= 0) return;
    const interval = setInterval(() => {
      setParentResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [parentResendCooldown]);

  const handleOpenParentModal = () => {
    setParentForm({
      parentName: linkedParent?.name || profile?.fatherName || '',
      parentEmail: linkedParent?.email || '',
      relationType: linkedParent?.relationType || 'FATHER',
      parentMobile: linkedParent?.mobile || linkedParent?.contactNumber || '',
    });
    setParentModalError('');
    setParentModalSuccess('');
    setIsParentModalOpen(true);
  };

  const handleSubmitParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setParentModalError('');
    setParentModalSuccess('');

    if (!parentForm.parentName.trim()) {
      setParentModalError('Parent name is required.');
      return;
    }
    if (!parentForm.parentEmail.trim() || !parentForm.parentEmail.includes('@')) {
      setParentModalError('Please enter a valid parent email address.');
      return;
    }

    setParentSubmitting(true);
    try {
      const res: any = await linkParent({
        parentName: parentForm.parentName.trim(),
        parentEmail: parentForm.parentEmail.trim().toLowerCase(),
        relationType: parentForm.relationType,
        parentMobile: parentForm.parentMobile.trim() || undefined,
      });
      setParentSubmitting(false);

      if (res.success) {
        setLinkedParent(res.parent || {
          name: parentForm.parentName.trim(),
          email: parentForm.parentEmail.trim().toLowerCase(),
          relationType: parentForm.relationType,
          mobile: parentForm.parentMobile.trim(),
          emailVerified: !!res.alreadyVerified,
          status: res.alreadyVerified ? 'ACTIVE' : 'PENDING_EMAIL_VERIFICATION',
        });
        setParentModalSuccess(res.message || 'Parent details saved successfully.');
        setTimeout(() => {
          setIsParentModalOpen(false);
          fetchProfile();
        }, 1500);
      } else {
        setParentModalError(res.message || 'Failed to save parent details.');
      }
    } catch (err: any) {
      setParentSubmitting(false);
      setParentModalError(err.response?.data?.message || err.message || 'Failed to save parent details.');
    }
  };

  const handleResendParentOtp = async () => {
    if (parentResendCooldown > 0 || parentResending) return;
    setParentResending(true);
    setParentCardFeedback(null);
    try {
      const res: any = await resendParentVerificationOtp();
      setParentResending(false);
      if (res.success) {
        setParentResendCooldown(60);
        setParentCardFeedback({
          type: 'success',
          message: res.message || 'A new verification code has been dispatched to your parent email.',
        });
      } else {
        setParentCardFeedback({ type: 'error', message: res.message || 'Failed to resend code.' });
      }
    } catch (err: any) {
      setParentResending(false);
      setParentCardFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to resend verification code.',
      });
    }
  };

  const handleOpenEmailModal = (initialEmail?: string) => {
    setNewEmailInput(initialEmail || '');
    setEmailChangeStep('INPUT');
    setEmailChangeError('');
    setOtpError('');
    setOtpSuccess('');
    setModalOtp(['', '', '', '', '', '']);
    setIsEmailModalOpen(true);
  };

  const handleResumePendingVerification = (pendingEmail: string) => {
    setVerificationData({
      email: pendingEmail,
      maskedEmail: pendingEmail.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => `${a}${'*'.repeat(Math.max(b.length, 3))}${c}`),
    });
    setEmailChangeStep('OTP');
    setEmailChangeError('');
    setOtpError('');
    setOtpSuccess('');
    setModalOtp(['', '', '', '', '', '']);
    setIsEmailModalOpen(true);
    setTimeout(() => modalOtpRefs.current[0]?.focus(), 150);
  };

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setEmailChangeError('Please enter a valid email address');
      return;
    }

    const currentEmail = (profile?.userId as any)?.email || user?.email;
    if (cleanEmail === currentEmail?.toLowerCase()) {
      setEmailChangeError('New email must be different from your current email');
      return;
    }

    setEmailChangeLoading(true);
    setEmailChangeError('');

    try {
      const res = await updateMyProfile({ email: cleanEmail });
      if (res.success) {
        setVerificationData({
          email: res.data?.email || cleanEmail,
          maskedEmail: res.data?.maskedEmail || cleanEmail,
          verificationId: res.data?.verificationId,
        });
        setEmailChangeStep('OTP');
        setOtpTimer(30);
        setModalOtp(['', '', '', '', '', '']);
        // Refresh profile in background to reflect pendingEmail
        await fetchProfile();
        setTimeout(() => modalOtpRefs.current[0]?.focus(), 150);
      } else {
        setEmailChangeError(res.message || 'Failed to initiate email change.');
      }
    } catch (err: any) {
      setEmailChangeError(err.response?.data?.message || 'Failed to initiate email change.');
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const handleModalOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    const newOtp = [...modalOtp];
    newOtp[index] = clean ? clean[clean.length - 1] : '';
    setModalOtp(newOtp);
    setOtpError('');

    if (clean && index < 5) {
      modalOtpRefs.current[index + 1]?.focus();
    }
  };

  const handleModalOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !modalOtp[index] && index > 0) {
      modalOtpRefs.current[index - 1]?.focus();
    }
  };

  const handleModalOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!paste) return;
    const newOtp = ['', '', '', '', '', ''];
    for (let i = 0; i < paste.length; i++) {
      newOtp[i] = paste[i];
    }
    setModalOtp(newOtp);
    const targetIdx = Math.min(paste.length, 5);
    modalOtpRefs.current[targetIdx]?.focus();
  };

  const handleModalResendOtp = async () => {
    if (!verificationData?.email || otpTimer > 0 || otpResending) return;
    setOtpResending(true);
    setOtpError('');
    setOtpSuccess('');

    try {
      const res = await resendEmailOtp({ email: verificationData.email });
      if (res.success) {
        setOtpTimer(30);
        setOtpSuccess('Verification code resent successfully to ' + (verificationData.maskedEmail || verificationData.email));
      } else {
        setOtpError(res.message || 'Failed to resend verification code.');
      }
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Failed to resend verification code.');
    } finally {
      setOtpResending(false);
    }
  };

  const handleModalVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = modalOtp.join('');
    if (code.length !== 6 || !verificationData?.email) return;

    setOtpVerifying(true);
    setOtpError('');
    setOtpSuccess('');

    try {
      const res = await verifyEmailOtp({ email: verificationData.email, otp: code });
      if (res.success) {
        setOtpSuccess('Email verified successfully! Your account email is now updated.');
        if (user) {
          setUser({ ...user, email: verificationData.email, emailVerified: true });
        }
        await fetchProfile();
        setTimeout(() => {
          setIsEmailModalOpen(false);
          setEmailChangeStep('INPUT');
          setNewEmailInput('');
          setModalOtp(['', '', '', '', '', '']);
          setOtpSuccess('');
          setOtpError('');
        }, 1800);
      } else {
        setOtpError(res.message || 'Invalid or expired OTP code.');
      }
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Failed to verify OTP code.');
    } finally {
      setOtpVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-64 bg-slate-200/70 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200/70 animate-pulse rounded-xl" />
          <div className="h-64 bg-slate-200/70 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  const institution = (profile?.institutionId as any);
  const enrolledClass = (profile?.classId as any);
  const userAccount = (profile?.userId as any);
  const displayEmail = userAccount?.email || user?.email || 'N/A';
  const pendingEmail = userAccount?.pendingEmail;

  return (
    <div className="space-y-8">
      {/* Header Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/student" className="hover:text-[#23804A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">My Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#171D19]">
            Student Academic Profile
          </h1>
        </div>

        <Link
          href="/student"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#23804A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
        </Link>
      </div>

      {error || !profile ? (
        <div className="p-6 rounded-2xl bg-white border border-[#E3EAE5] shadow-2xs text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Student Profile Not Linked</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your user account is logged in as <span className="font-semibold text-slate-800">{user?.email}</span>, but your official student record has not been linked by your institution yet.
          </p>
          <div className="pt-2">
            <Link
              href="/student"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#23804A] text-white text-xs font-semibold"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Photo feedback notice if present */}
          {photoFeedback && (
            <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
              photoFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-center gap-2">
                {photoFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span className="font-medium">{photoFeedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setPhotoFeedback(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Identity Hero Card */}
          <div className="bg-white rounded-2xl border border-[#E3EAE5] p-6 sm:p-8 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1 min-w-0">
                {/* Photo & Actions */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="relative group">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-[#EAF2EC] to-[#DCEBE0] text-[#23804A] border-2 border-[#D8E5DA] flex items-center justify-center font-bold font-serif text-3xl shrink-0 overflow-hidden shadow-xs relative">
                      {profile.photo ? (
                        <img
                          src={getFileUrl(profile.photo)}
                          alt={profile.nameEnglish || 'Student'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        profile.nameEnglish?.[0]?.toUpperCase() || 'S'
                      )}

                      {photoUploading && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-2xs gap-1">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span className="text-[10px] font-semibold">Updating...</span>
                        </div>
                      )}
                    </div>

                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handlePhotoSelect}
                    />
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      disabled={photoUploading}
                      onClick={() => photoInputRef.current?.click()}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#23804A] hover:text-[#1B6F41] bg-[#23804A]/5 hover:bg-[#23804A]/10 border border-[#23804A]/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      title="Upload or replace photo (Max 5MB: JPG, PNG, WebP)"
                    >
                      <Camera className="w-3 h-3" />
                      <span>{profile.photo ? 'Change' : 'Upload'}</span>
                    </button>
                    {profile.photo && (
                      <button
                        type="button"
                        disabled={photoUploading}
                        onClick={handlePhotoRemove}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        title="Remove profile photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#171D19]">
                      {profile.nameEnglish}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Active Student
                    </span>
                  </div>

                  {profile.nameArabic && (
                    <p className="font-arabic text-lg text-[#23804A]" dir="rtl">
                      {profile.nameArabic}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 pt-1">
                    <div className="flex items-center space-x-1.5 font-mono">
                      <span className="text-slate-400">Reg No:</span>
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {profile.registrationNumber}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <GraduationCap className="w-4 h-4 text-[#23804A]" />
                      <span>
                        {enrolledClass?.name || enrolledClass?.code || enrolledClass?.className || 'Sanaviyya'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Building2 className="w-4 h-4 text-[#23804A]" />
                      <span className="truncate max-w-xs">Markaz Sanaviyya</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Profile CTA Button */}
              <div className="self-start sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#23804A] hover:bg-[#1B6F41] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Personal Details</span>
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Academic & Institutional Info */}
            <div className="bg-white rounded-xl border border-[#E3EAE5] p-6 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#E3EAE5] pb-3">
                <GraduationCap className="w-5 h-5 text-[#23804A]" />
                <h3 className="font-bold text-sm text-[#171D19]">Academic Enrollment Details</h3>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <dt className="text-slate-400 font-medium">Class / Program</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {enrolledClass?.name || enrolledClass?.className || 'Sanaviyya Standard'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Class Code</dt>
                  <dd className="font-mono font-bold text-slate-900 mt-0.5">
                    {enrolledClass?.code || 'STD'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Institution</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    Markaz Sanaviyya
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Institute Code</dt>
                  <dd className="font-mono font-bold text-slate-900 mt-0.5">
                    SANAVIYYA
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Admission Year</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {profile.admissionYear || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Registration Number</dt>
                  <dd className="font-mono font-bold text-[#23804A] mt-0.5">
                    {profile.registrationNumber}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Personal & Biographic Info */}
            <div className="bg-white rounded-xl border border-[#E3EAE5] p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E3EAE5] pb-3">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-[#23804A]" />
                  <h3 className="font-bold text-sm text-[#171D19]">Personal & Guardian Details</h3>
                </div>
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#23804A] hover:text-[#1B6F41] hover:underline cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <dt className="text-slate-400 font-medium">Date of Birth</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {profile.dateOfBirth
                      ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Father's Name</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {profile.fatherName || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Mother's Name</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {profile.motherName || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Place of Origin (English)</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {profile.placeEnglish || 'N/A'}
                  </dd>
                </div>
                {profile.placeArabic && (
                  <div>
                    <dt className="text-slate-400 font-medium">Place of Origin (Arabic)</dt>
                    <dd className="font-arabic font-bold text-slate-900 mt-0.5" dir="rtl">
                      {profile.placeArabic}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-slate-400 font-medium">Contact Phone</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {profile.contactNumber || (user as any)?.phone || 'N/A'}
                  </dd>
                </div>

                {/* Email with Change Action */}
                <div className="sm:col-span-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <dt className="text-slate-500 font-semibold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#23804A]" /> Registered User Email
                    </dt>
                    <button
                      type="button"
                      onClick={() => handleOpenEmailModal()}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#23804A] hover:text-[#1B6F41] hover:underline cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" /> Change Email
                    </button>
                  </div>
                  <dd className="font-bold text-slate-900 truncate">
                    {displayEmail}
                  </dd>

                  {/* Pending Email Alert Banner */}
                  {pendingEmail && (
                    <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-semibold text-amber-800">Pending Email Verification: </span>
                        <span className="font-mono font-bold text-amber-950">{pendingEmail}</span>
                        <p className="text-[10px] text-amber-700 mt-0.5">
                          A 6-digit OTP code was sent to this address. It remains inactive until verified.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleResumePendingVerification(pendingEmail)}
                        className="px-3 py-1 bg-[#23804A] text-white rounded-lg text-xs font-bold hover:bg-[#1B6F41] transition-colors shrink-0 cursor-pointer shadow-xs"
                      >
                        Enter OTP Code
                      </button>
                    </div>
                  )}
                </div>
              </dl>
            </div>
          </div>

          {/* Parent Portal Account & Linking Card */}
          <div className="bg-white rounded-xl border border-[#E3EAE5] p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3EAE5] pb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#23804A]" />
                <div>
                  <h3 className="font-bold text-sm text-[#171D19]">Parent Portal Account & Linking</h3>
                  <p className="text-[11px] text-slate-500">
                    Parent access for attendance alerts, leave monitoring, and academic progress
                  </p>
                </div>
              </div>

              {linkedParent ? (
                <button
                  type="button"
                  onClick={handleOpenParentModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#23804A] bg-[#23804A]/10 hover:bg-[#23804A]/20 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Parent Details
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenParentModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#23804A] hover:bg-[#1B6F41] transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add / Verify Parent
                </button>
              )}
            </div>

            {parentCardFeedback && (
              <div
                className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between gap-2 ${
                  parentCardFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <span>{parentCardFeedback.message}</span>
                <button
                  type="button"
                  onClick={() => setParentCardFeedback(null)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {linkedParent ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{linkedParent.name}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold uppercase">
                    {linkedParent.relationType || 'FATHER'}
                  </span>
                  {linkedParent.emailVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Account
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      <AlertCircle className="w-3 h-3 text-amber-600" /> Pending Email Verification
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-medium">Registered Parent Email:</span>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">{linkedParent.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Contact Mobile:</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {linkedParent.mobile || linkedParent.contactNumber || 'Not provided'}
                    </p>
                  </div>
                </div>

                {!linkedParent.emailVerified && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                    <div className="flex items-start gap-2 text-xs text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Parent Verification Required</p>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          An OTP verification code was sent to <strong className="font-mono">{linkedParent.email}</strong>. The parent account remains inactive until verified.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Link
                        href={`/auth/parent/verify-email?email=${encodeURIComponent(linkedParent.email)}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2F7C7A] text-white rounded-lg text-xs font-bold hover:bg-[#256361] transition-colors shadow-2xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Verify Parent Email
                      </Link>
                      <button
                        type="button"
                        onClick={handleResendParentOtp}
                        disabled={parentResendCooldown > 0 || parentResending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${parentResending ? 'animate-spin' : ''}`} />
                        {parentResendCooldown > 0
                          ? `Resend in ${parentResendCooldown}s`
                          : 'Resend Verification Code'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-2.5">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <div>
                  <p className="text-xs font-bold text-slate-800">No Parent Account Linked</p>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-0.5">
                    Link your father, mother, or guardian to enable automated attendance notifications, fee receipts, and academic tracking on the MISC Parent Portal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenParentModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#23804A] hover:bg-[#1B6F41] transition-colors shadow-2xs cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add Parent Details
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add / Edit Parent Modal */}
      {isParentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#2F7C7A] flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#171D19]">
                    {linkedParent ? 'Update Parent Details' : 'Add & Verify Parent'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Markaz Sanaviyya Parent Portal Linking
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsParentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitParent} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">Parent Linking Policy</p>
                <p>
                  A 6-digit verification code will be sent to the parent's email. If the parent already has an active account, your profile will be linked directly.
                </p>
              </div>

              {parentModalError && (
                <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded font-medium">
                  {parentModalError}
                </div>
              )}

              {parentModalSuccess && (
                <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs rounded font-medium">
                  {parentModalSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                  Parent / Guardian Name *
                </label>
                <input
                  type="text"
                  required
                  value={parentForm.parentName}
                  onChange={(e) => setParentForm({ ...parentForm, parentName: e.target.value })}
                  placeholder="e.g. Abdullah Ahmed"
                  className="w-full text-xs px-3 py-2 border rounded-xl border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                  Relationship *
                </label>
                <select
                  value={parentForm.relationType}
                  onChange={(e) => setParentForm({ ...parentForm, relationType: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-xl border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A] bg-white"
                >
                  <option value="FATHER">Father</option>
                  <option value="MOTHER">Mother</option>
                  <option value="GUARDIAN">Guardian</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                  Parent Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={parentForm.parentEmail}
                  onChange={(e) => setParentForm({ ...parentForm, parentEmail: e.target.value })}
                  placeholder="parent@example.com"
                  className="w-full text-xs px-3 py-2 border rounded-xl border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Must be different from your student email address.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                  Contact Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  value={parentForm.parentMobile}
                  onChange={(e) => setParentForm({ ...parentForm, parentMobile: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full text-xs px-3 py-2 border rounded-xl border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsParentModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={parentSubmitting}
                  className="px-4 py-2 bg-[#23804A] hover:bg-[#1B6F41] text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {parentSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {linkedParent ? 'Save Changes' : 'Send Verification Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Change & OTP Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-[#23804A] flex items-center justify-center font-bold">
                  {emailChangeStep === 'INPUT' ? <Mail className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#171D19]">
                    {emailChangeStep === 'INPUT' ? 'Change Account Email' : 'Verify New Email OTP'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {emailChangeStep === 'INPUT' ? 'Markaz Sanaviyya Student Portal' : 'Enter 6-digit security code'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step 1: Input New Email */}
            {emailChangeStep === 'INPUT' && (
              <form onSubmit={handleRequestEmailChange} className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">Email Verification Policy</p>
                  <p>
                    Your current email will remain active until you verify the new address. A 6-digit verification code will be sent immediately to the new email.
                  </p>
                </div>

                {emailChangeError && (
                  <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded font-medium">
                    {emailChangeError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                    New Student Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] text-xs bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Current active email: <span className="font-semibold text-slate-700">{displayEmail}</span>
                  </p>
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={emailChangeLoading || !newEmailInput.trim()}
                    className="px-5 py-2 bg-[#23804A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1B6F41] disabled:opacity-50 cursor-pointer shadow-sm transition-all"
                  >
                    {emailChangeLoading ? 'Sending OTP...' : 'Send Verification OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {emailChangeStep === 'OTP' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-green-50/60 rounded-xl border border-green-100 text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-[#171D19]">Verification Code Sent</p>
                  <p className="text-slate-600">
                    We sent a 6-digit code to{' '}
                    <strong className="font-mono text-[#23804A]">
                      {verificationData?.maskedEmail || verificationData?.email}
                    </strong>
                    . Enter it below to finalize your new email.
                  </p>
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

                <form onSubmit={handleModalVerifyOtp} className="space-y-4">
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

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleModalResendOtp}
                      disabled={otpTimer > 0 || otpResending}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#23804A] hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${otpResending ? 'animate-spin' : ''}`} />
                      {otpTimer > 0 ? `Resend code in ${otpTimer}s` : 'Resend Code'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setEmailChangeStep('INPUT')}
                      className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer"
                    >
                      Change Email Address
                    </button>
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setIsEmailModalOpen(false)}
                      className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={otpVerifying || modalOtp.join('').length !== 6}
                      className="px-5 py-2 bg-[#23804A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1B6F41] disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
                    >
                      {otpVerifying ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Personal Details Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  Edit Personal Details
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your personal biographic and contact information
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Informational Security Notice */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold">Administrative Protected Records:</span> Academic enrollments, Class, Registration Number, and Institution are managed exclusively by the institution administration.
              </div>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded font-medium">
                {editError}
              </div>
            )}

            {editSuccess && (
              <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs rounded font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{editSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* English Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Full Name (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.nameEnglish}
                    onChange={(e) => setEditForm({ ...editForm, nameEnglish: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A] focus:border-transparent transition-all"
                    placeholder="e.g. Muhammed Ansar"
                  />
                </div>

                {/* Arabic Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Full Name (Arabic)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={editForm.nameArabic}
                    onChange={(e) => setEditForm({ ...editForm, nameArabic: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-arabic rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A] focus:border-transparent transition-all"
                    placeholder="محمد أنصار"
                  />
                </div>

                {/* Contact Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={editForm.contactNumber}
                    onChange={(e) => setEditForm({ ...editForm, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A] focus:border-transparent transition-all"
                    placeholder="+91 9876543210"
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A] focus:border-transparent transition-all"
                  />
                </div>

                {/* Father's Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Father's Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.fatherName}
                    onChange={(e) => setEditForm({ ...editForm, fatherName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A] focus:border-transparent transition-all"
                    placeholder="Father's full name"
                  />
                </div>

                {/* Mother's Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Mother's Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.motherName}
                    onChange={(e) => setEditForm({ ...editForm, motherName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A] focus:border-transparent transition-all"
                    placeholder="Mother's full name"
                  />
                </div>

                {/* Place English */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Place of Origin (English)
                  </label>
                  <input
                    type="text"
                    value={editForm.placeEnglish}
                    onChange={(e) => setEditForm({ ...editForm, placeEnglish: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A] focus:border-transparent transition-all"
                    placeholder="e.g. Kozhikode"
                  />
                </div>

                {/* Place Arabic */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Place of Origin (Arabic)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={editForm.placeArabic}
                    onChange={(e) => setEditForm({ ...editForm, placeArabic: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-arabic rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A] focus:border-transparent transition-all"
                    placeholder="كالكوت"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 bg-[#23804A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1B6F41] disabled:opacity-50 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {editSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
