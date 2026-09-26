'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getStudentProfile, updateMyProfile } from '@/services/student.service';
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
} from 'lucide-react';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStudentProfile();
      if (res.success && res.data) {
        setProfile(res.data);
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
            <Link href="/student" className="hover:text-[#2F7C7A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">My Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Student Academic Profile
          </h1>
        </div>

        <Link
          href="/student"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#2F7C7A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
        </Link>
      </div>

      {error || !profile ? (
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8E0] shadow-2xs text-center space-y-4">
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
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#2F7C7A] text-white text-xs font-semibold"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Identity Hero Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8E0] p-6 sm:p-8 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#132238] to-[#2F7C7A] text-white flex items-center justify-center font-bold font-serif text-3xl shrink-0 shadow-md">
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt={profile.nameEnglish || 'Student'}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  profile.nameEnglish?.[0]?.toUpperCase() || 'S'
                )}
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#132238]">
                    {profile.nameEnglish}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active Student
                  </span>
                </div>

                {profile.nameArabic && (
                  <p className="font-arabic text-lg text-[#2F7C7A]" dir="rtl">
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
                    <GraduationCap className="w-4 h-4 text-[#2F7C7A]" />
                    <span>
                      {enrolledClass?.name || enrolledClass?.code || enrolledClass?.className || 'Sanaviyya'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Building2 className="w-4 h-4 text-[#2F7C7A]" />
                    <span className="truncate max-w-xs">Markaz Sanaviyya</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Academic & Institutional Info */}
            <div className="bg-white rounded-xl border border-[#E2E8E0] p-6 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#E2E8E0] pb-3">
                <GraduationCap className="w-5 h-5 text-[#2F7C7A]" />
                <h3 className="font-bold text-sm text-[#132238]">Academic Enrollment Details</h3>
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
                  <dd className="font-mono font-bold text-[#2F7C7A] mt-0.5">
                    {profile.registrationNumber}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Personal & Biographic Info */}
            <div className="bg-white rounded-xl border border-[#E2E8E0] p-6 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#E2E8E0] pb-3">
                <User className="w-5 h-5 text-[#2F7C7A]" />
                <h3 className="font-bold text-sm text-[#132238]">Personal & Guardian Details</h3>
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
                      <Mail className="w-3.5 h-3.5 text-[#2F7C7A]" /> Registered User Email
                    </dt>
                    <button
                      type="button"
                      onClick={() => handleOpenEmailModal()}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2F7C7A] hover:text-[#256361] hover:underline cursor-pointer"
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
                        className="px-3 py-1 bg-[#2F7C7A] text-white rounded-lg text-xs font-bold hover:bg-[#256361] transition-colors shrink-0 cursor-pointer shadow-xs"
                      >
                        Enter OTP Code
                      </button>
                    </div>
                  )}
                </div>
              </dl>
            </div>
          </div>
        </>
      )}

      {/* Email Change & OTP Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#2F7C7A] flex items-center justify-center font-bold">
                  {emailChangeStep === 'INPUT' ? <Mail className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#132238]">
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
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A] text-xs bg-white"
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
                    className="px-5 py-2 bg-[#2F7C7A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#256361] disabled:opacity-50 cursor-pointer shadow-sm transition-all"
                  >
                    {emailChangeLoading ? 'Sending OTP...' : 'Send Verification OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {emailChangeStep === 'OTP' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-100 text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-[#132238]">Verification Code Sent</p>
                  <p className="text-slate-600">
                    We sent a 6-digit code to{' '}
                    <strong className="font-mono text-[#2F7C7A]">
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
                        className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all shadow-xs"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleModalResendOtp}
                      disabled={otpTimer > 0 || otpResending}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F7C7A] hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer"
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
                      className="px-5 py-2 bg-[#2F7C7A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#256361] disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
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
    </div>
  );
}
