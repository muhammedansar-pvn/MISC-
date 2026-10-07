'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, KeyRound, ArrowLeft, ArrowRight, RefreshCw, ShieldCheck } from 'lucide-react';
import { parentRequestOtp, parentVerifyOtp } from '@/services/auth.service';
import { setToken, setUser } from '@/utils/token';

function ParentLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams?.get('redirect') || searchParams?.get('from');

  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setUnverifiedEmail(null);
    setLoading(true);

    try {
      const res = await parentRequestOtp({ email: email.trim().toLowerCase() });
      setLoading(false);

      if (res.success) {
        setMaskedEmail((res as any).email || email);
        setStep('OTP');
        setResendCooldown(30);
        setSuccessMsg(res.message || 'Login verification code sent to your email.');
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } else {
        setError(res.message || 'Failed to send OTP.');
      }
    } catch (err: any) {
      setLoading(false);
      const data = err.response?.data;
      if (data?.requiresEmailVerification) {
        setUnverifiedEmail(email.trim().toLowerCase());
        setError('Your parent email is not yet verified. Please verify your email first.');
      } else {
        setError(data?.message || err.message || 'Failed to send login code. Please try again.');
      }
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Paste handling
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const next = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          next[i] = pasted[i] || '';
        }
        setOtpDigits(next);
        const nextFocus = Math.min(pasted.length, 5);
        otpInputRefs.current[nextFocus]?.focus();
      }
      return;
    }

    const digit = value.replace(/\D/g, '');
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await parentVerifyOtp({
        email: email.trim().toLowerCase(),
        otp: fullOtp,
      });

      setLoading(false);

      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);

        // Notify session listeners
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth:login'));
        }

        const destination = from && from.startsWith('/') && !from.startsWith('//') ? from : '/parent';
        router.replace(destination);
      } else {
        setError(res.message || 'Invalid or expired OTP code.');
      }
    } catch (err: any) {
      setLoading(false);
      const data = err.response?.data;
      setError(data?.message || err.message || 'OTP verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await parentRequestOtp({ email: email.trim().toLowerCase() });
      setLoading(false);
      if (res.success) {
        setResendCooldown(30);
        setSuccessMsg('A new verification code has been sent.');
      } else {
        setError(res.message || 'Failed to resend OTP.');
      }
    } catch (err: any) {
      setLoading(false);
      const data = err.response?.data;
      setError(data?.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-[#E2E8E0] shadow-xs">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2F7C7A]/10 text-[#2F7C7A] mb-2">
          {step === 'EMAIL' ? <Mail className="w-8 h-8" /> : <KeyRound className="w-8 h-8" />}
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#132238] tracking-tight">
          Parent Portal Sign In
        </h2>
        <p className="text-sm text-[#475569]">
          {step === 'EMAIL'
            ? 'Sign in password-free using your registered parent email address.'
            : `Enter the 6-digit one-time code sent to ${maskedEmail || email}.`}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-lg space-y-2">
          <div>
            <p className="font-semibold">Authentication Error</p>
            <p>{error}</p>
          </div>
          {unverifiedEmail && (
            <div>
              <Link
                href={`/auth/parent/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2F7C7A] hover:underline bg-white px-3 py-1.5 rounded-lg border border-[#2F7C7A]/20 shadow-2xs transition-colors"
              >
                Verify Parent Email Now &rarr;
              </Link>
            </div>
          )}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-sm rounded-lg">
          <p className="font-semibold">Code Dispatched</p>
          <p>{successMsg}</p>
        </div>
      )}

      {step === 'EMAIL' ? (
        <form className="mt-8 space-y-6" onSubmit={handleRequestOtp}>
          <div>
            <label
              htmlFor="parent-email"
              className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-2"
            >
              Registered Parent Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="parent-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="father@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E2E8E0] bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
              />
            </div>
            <p className="text-xs text-[#64748B] mt-2">
              Markaz Sanaviyya parent accounts are 100% password-free. We verify identity via one-time email OTP.
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-[#2F7C7A] text-white py-3.5 px-4 rounded-xl font-bold hover:bg-[#256361] focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:ring-offset-2 transition-all disabled:opacity-50 text-xs tracking-wider uppercase shadow-xs cursor-pointer flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>SENDING ONE-TIME CODE...</span>
              ) : (
                <>
                  <span>SEND LOGIN OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#132238]">
                6-Digit Login Code
              </label>
              <button
                type="button"
                onClick={() => {
                  setStep('EMAIL');
                  setOtpDigits(['', '', '', '', '', '']);
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-xs text-[#2F7C7A] hover:underline cursor-pointer flex items-center space-x-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Change email</span>
              </button>
            </div>

            <div className="flex justify-between gap-2 my-4">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-12 h-14 text-center font-mono text-2xl font-bold rounded-xl border border-[#E2E8E0] bg-white text-[#132238] focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-[#64748B] pt-2">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-[#2F7C7A]" />
                <span>Valid for 10 minutes</span>
              </span>
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleResend}
                className="text-[#2F7C7A] hover:underline disabled:text-gray-400 font-semibold cursor-pointer flex items-center space-x-1"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                </span>
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || otpDigits.join('').length !== 6}
              className="w-full bg-[#2F7C7A] text-white py-3.5 px-4 rounded-xl font-bold hover:bg-[#256361] focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:ring-offset-2 transition-all disabled:opacity-50 text-xs tracking-wider uppercase shadow-xs cursor-pointer flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>VERIFYING & SIGNING IN...</span>
              ) : (
                <>
                  <span>VERIFY & SIGN IN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <div className="text-center pt-4 border-t border-[#E2E8E0]">
        <Link
          href="/login"
          className="text-xs font-semibold text-[#475569] hover:text-[#2F7C7A] transition-colors cursor-pointer"
        >
          Staff / Student Login Portal &rarr;
        </Link>
      </div>
    </div>
  );
}

export default function ParentLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md w-full bg-white p-12 rounded-2xl border border-[#E2E8E0] text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Loading parent portal sign-in...</p>
        </div>
      }
    >
      <ParentLoginForm />
    </Suspense>
  );
}
