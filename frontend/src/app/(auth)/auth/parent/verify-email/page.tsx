'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, ArrowRight, RefreshCw, CheckCircle2, KeyRound, AlertCircle, Users } from 'lucide-react';
import { parentRequestOtp, parentVerifyOtp } from '@/services/auth.service';

const getDecodedEmail = (raw?: string | null): string => {
  if (!raw) return '';
  try {
    if (raw.includes('%')) {
      return decodeURIComponent(raw).trim();
    }
    return raw.trim();
  } catch {
    return raw.trim();
  }
};

function ParentVerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('email');
      if (p) return getDecodedEmail(p);
    }
    return getDecodedEmail(searchParams?.get('email'));
  });
  const [verificationId, setVerificationId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('verificationId') || '';
    }
    return searchParams?.get('verificationId') || '';
  });
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isVerified, setIsVerified] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const rawEmail = searchParams?.get('email');
    if (rawEmail) {
      const decoded = getDecodedEmail(rawEmail);
      if (decoded && decoded !== email) {
        setEmail(decoded);
      }
    }
    const vid = searchParams?.get('verificationId');
    if (vid) {
      setVerificationId(vid);
    }
    const codeParam = searchParams?.get('code') || searchParams?.get('otp');
    if (codeParam) {
      const digitsOnly = codeParam.replace(/\D/g, '').slice(0, 6);
      if (digitsOnly.length === 6) {
        setOtp(digitsOnly.split(''));
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    const firstEmptyIndex = otp.findIndex((d) => !d);
    const targetIdx = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
    inputRefs.current[targetIdx]?.focus();
  }, []);

  const isOtpComplete =
    otp.length === 6 &&
    otp.every((digit) => typeof digit === 'string' && /^\d$/.test(digit));

  const handleOtpChange = (index: number, value: string) => {
    const digitsOnly = value.replace(/\D/g, '');

    // Case 1: Pasted or autofilled multi-digit string (e.g. 5 or 6 digits)
    if (digitsOnly.length >= 5) {
      const fullCode = digitsOnly.slice(0, 6);
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = fullCode[i] || '';
      }
      setOtp(newOtp);
      const focusIdx = Math.min(fullCode.length - 1, 5);
      inputRefs.current[focusIdx]?.focus();
      return;
    }

    // Case 2: User typed into an already-filled box (e.g. value became "69" or "96")
    if (digitsOnly.length > 1) {
      const newChar = digitsOnly.slice(-1);
      const newOtp = [...otp];
      newOtp[index] = newChar;
      setOtp(newOtp);
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      return;
    }

    // Case 3: Single digit or cleared
    const newOtp = [...otp];
    newOtp[index] = digitsOnly;
    setOtp(newOtp);

    if (digitsOnly && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (otp[index]) {
        // Clear current box
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous box and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Delete') {
      e.preventDefault();
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const rawPasted = e.clipboardData.getData('text');
    if (!rawPasted) return;

    // Remove spaces, hyphens, and any non-digit chars
    const digitsOnly = rawPasted.replace(/\D/g, '').slice(0, 6);
    if (!digitsOnly) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = digitsOnly[i] || '';
    }
    setOtp(newOtp);

    const focusIdx = Math.min(Math.max(digitsOnly.length - 1, 0), 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) {
      setError('Please provide a valid parent email address.');
      return;
    }

    if (!isOtpComplete) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    const fullOtp = otp.join('');
    setLoading(true);

    try {
      const payload: any = {
        email: targetEmail,
        otp: fullOtp,
        purpose: 'EMAIL_VERIFICATION',
      };
      if (verificationId) {
        payload.verificationId = verificationId;
      }

      const response: any = await parentVerifyOtp(payload);
      setLoading(false);

      if (response.success) {
        setIsVerified(true);
        setSuccessMsg(response.message || 'Parent email verified successfully! Your account is active.');
      } else {
        setError(response.message || 'Verification failed. Please check the code and try again.');
      }
    } catch (err: any) {
      setLoading(false);
      const data = err.response?.data;
      if (data?.alreadyVerified) {
        setIsVerified(true);
        setSuccessMsg('Your parent email is already verified! Redirecting to login...');
        setTimeout(() => {
          router.replace('/login/parent');
        }, 2000);
      } else {
        setError(data?.message || err.message || 'Verification failed. Please check the code and try again.');
      }
    }
  };

  const handleResend = async () => {
    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) {
      setError('Please enter your parent email address to receive a verification code.');
      return;
    }

    if (timer > 0 || resending) return;

    setError('');
    setSuccessMsg('');
    setResending(true);

    try {
      const response: any = await parentRequestOtp({
        email: targetEmail,
        purpose: 'EMAIL_VERIFICATION',
      });
      setResending(false);

      if (response.success) {
        if (response.alreadyVerified) {
          setIsVerified(true);
          setSuccessMsg('This parent account is already verified! Redirecting to login...');
          setTimeout(() => {
            router.replace('/login/parent');
          }, 2000);
        } else {
          setSuccessMsg(response.message || 'A new verification code has been sent to your parent email.');
          setTimer(60);
          setOtp(['', '', '', '', '', '']);
          if (response.verificationId) {
            setVerificationId(response.verificationId);
          }
          inputRefs.current[0]?.focus();
        }
      } else {
        setError(response.message || 'Failed to resend code.');
      }
    } catch (err: any) {
      setResending(false);
      const data = err.response?.data;
      if (data?.alreadyVerified) {
        setIsVerified(true);
        setSuccessMsg('This parent account is already verified! Redirecting to login...');
        setTimeout(() => {
          router.replace('/login/parent');
        }, 2000);
      } else {
        setError(data?.message || err.message || 'Failed to send a new code. Please try again later.');
      }
    }
  };

  return (
    <div className="w-full max-w-[500px] mx-auto">
      <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-sm overflow-hidden">
        {/* Top Accent Bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#132238] via-[#2F7C7A] to-[#23804A]" />

        <div className="p-6 sm:p-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2F7C7A]/10 text-[#2F7C7A] mb-1">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#F0F7F6] text-[#2F7C7A] border border-[#2F7C7A]/20">
                Parent Onboarding
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#132238] tracking-tight">
              Verify Parent Email
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              {isVerified
                ? 'Your parent account has been activated.'
                : 'Confirm your parent email address to activate access and link with your student.'}
            </p>
          </div>

          {/* Success State */}
          {isVerified ? (
            <div className="space-y-6 pt-2">
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <div>
                  <h3 className="font-bold text-base text-emerald-950">
                    Parent Email Verified Successfully!
                  </h3>
                  <p className="text-xs text-emerald-700 mt-1">
                    Your parent account is now active and linked to your student's profile. You can sign in using password-free email OTP codes.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/login/parent"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-[#2F7C7A] text-white rounded-xl text-sm font-bold shadow-xs hover:bg-[#256361] transition-colors"
                >
                  Continue to Parent Portal <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="text-center">
                  <Link
                    href="/"
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Return to Homepage
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Target Email Banner */}
              <div className="p-4 bg-[#F0F7F6]/60 rounded-xl border border-[#2F7C7A]/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#2F7C7A]" /> Verification Code Sent To:
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(!isEditingEmail)}
                    className="text-[11px] font-bold text-[#2F7C7A] hover:underline cursor-pointer"
                  >
                    {isEditingEmail ? 'Done' : 'Change Email'}
                  </button>
                </div>

                {isEditingEmail ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
                  />
                ) : (
                  <p className="font-mono font-bold text-sm text-[#132238] truncate">
                    {email || 'No email provided'}
                  </p>
                )}
              </div>

              {/* Alert Messages */}
              {error && (
                <div className="p-3.5 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Verification Error</p>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs rounded-lg flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Notice</p>
                    <p>{successMsg}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-center text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                    Enter 6-Digit Parent Verification Code
                  </label>
                  <div className="flex justify-center gap-1.5 sm:gap-2.5">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={digit}
                        autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        onPaste={handlePaste}
                        onFocus={(e) => e.target.select()}
                        aria-label={`Digit ${idx + 1} of 6`}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center font-mono font-bold text-lg sm:text-2xl text-[#132238] rounded-xl border border-[#E2E8E0] bg-white shadow-2xs focus:border-[#2F7C7A] focus:ring-2 focus:ring-[#2F7C7A]/20 focus:outline-none transition-all"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isOtpComplete}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#2F7C7A] text-white rounded-xl text-sm font-bold shadow-xs hover:bg-[#256361] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Parent Code...
                    </>
                  ) : (
                    <>
                      Verify Parent Email <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Resend Action */}
              <div className="text-center pt-2 space-y-3">
                <p className="text-xs text-slate-500">
                  Didn't receive the verification code?
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={timer > 0 || resending}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2F7C7A] hover:text-[#256361] disabled:text-slate-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {timer > 0 ? `Resend Code in ${timer}s` : 'Resend Verification Code'}
                </button>
              </div>

              {/* Back Link */}
              <div className="pt-4 border-t border-slate-100 text-center">
                <Link
                  href="/login/parent"
                  className="text-xs font-semibold text-slate-500 hover:text-[#2F7C7A] transition-colors"
                >
                  &larr; Already verified? Sign in to Parent Portal
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ParentVerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 text-sm">
          Loading parent verification...
        </div>
      }
    >
      <ParentVerifyEmailContent />
    </Suspense>
  );
}
