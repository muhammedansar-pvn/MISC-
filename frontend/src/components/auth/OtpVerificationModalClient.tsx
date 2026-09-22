'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, RefreshCw, AlertCircle, ArrowLeft, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

interface OtpVerificationModalClientProps {
  verificationId: string;
  email?: string;
  onCancel: () => void;
}

export const OtpVerificationModalClient: React.FC<OtpVerificationModalClientProps> = ({
  verificationId: initialVerId,
  email: maskedEmail,
  onCancel,
}) => {
  const [verificationId, setVerificationId] = useState(initialVerId);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Timers
  const [expirySeconds, setExpirySeconds] = useState(600); // 10 minutes
  const [resendCooldown, setResendCooldown] = useState(60); // 60 seconds
  const [isResending, setIsResending] = useState(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const { verify2FA, resend2FA } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get('redirect') || searchParams?.get('from');

  // 10-minute OTP expiration timer
  useEffect(() => {
    if (expirySeconds <= 0) return;
    const timer = setInterval(() => {
      setExpirySeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [expirySeconds]);

  // 60-second resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleDigitChange = (index: number, value: string) => {
    if (/[^0-9]/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      inputRefs[5].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');

    if (fullOtp.length !== 6) {
      setError('Please enter a complete 6-digit OTP code.');
      return;
    }

    if (expirySeconds <= 0) {
      setError('OTP code has expired. Please click Resend Code for a new OTP.');
      return;
    }

    setError('');
    setLoading(true);

    const result = await verify2FA(verificationId, fullOtp);
    setLoading(false);

    if (result.success) {
      router.replace(redirectParam || result.redirectTo || '/admin');
    } else {
      setError(result.message || 'OTP verification failed');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setError('');
    setSuccessMsg('');
    setIsResending(true);

    const result = await resend2FA(verificationId);
    setIsResending(false);

    if (result.success) {
      setSuccessMsg('A new 6-digit verification code has been sent to your email.');
      if (result.verificationId) {
        setVerificationId(result.verificationId);
      }
      setExpirySeconds(600); // Reset 10 min countdown
      setResendCooldown(60); // Reset 60s cooldown
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs[0].current?.focus();
    } else {
      setError(result.message || 'Failed to resend OTP');
    }
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2F7C7A]/10 text-[#2F7C7A] mb-2">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#132238] tracking-tight">
          2-Step Verification
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          We have sent a 6-digit security code to{' '}
          <strong className="text-[#132238] font-mono">{maskedEmail || 'your email'}</strong>.
        </p>
      </div>

      {/* Countdown Banner */}
      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center space-x-2 text-slate-600">
          <Clock className="w-4 h-4 text-[#2F7C7A]" />
          <span>Code Expires In:</span>
        </div>
        <span
          className={`font-mono font-bold px-2 py-0.5 rounded ${
            expirySeconds < 60 ? 'bg-rose-100 text-rose-700' : 'bg-[#2F7C7A]/10 text-[#2F7C7A]'
          }`}
        >
          {formatTime(expirySeconds)}
        </span>
      </div>

      {/* Error & Success Feedback */}
      {error && (
        <div className="p-3.5 bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs rounded-r-lg flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs rounded-r-lg">
          <p className="font-bold">{successMsg}</p>
        </div>
      )}

      {/* OTP Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center mb-3">
            Enter 6-Digit OTP Code
          </label>

          <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-13 text-center text-xl font-bold font-mono border-2 border-[#E2E8E0] rounded-xl bg-white text-[#132238] focus:outline-none focus:border-[#2F7C7A] focus:ring-2 focus:ring-[#2F7C7A]/20 transition-all"
              />
            ))}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading || expirySeconds <= 0}
            className="w-full bg-[#2F7C7A] text-white py-3.5 px-4 rounded-xl font-bold hover:bg-[#256361] focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] transition-all disabled:opacity-50 text-xs tracking-wider uppercase shadow-xs flex items-center justify-center cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                VERIFYING CODE...
              </>
            ) : (
              'VERIFY & SIGN IN'
            )}
          </button>
        </div>
      </form>

      {/* Resend OTP & Back Controls */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Login
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isResending}
          className="text-[#2F7C7A] font-bold hover:underline disabled:opacity-50 disabled:hover:no-underline inline-flex items-center cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isResending ? 'animate-spin' : ''}`} />
          {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
        </button>
      </div>
    </div>
  );
};

export default OtpVerificationModalClient;
