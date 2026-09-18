import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { verifyEmailOtp, resendEmailOtp } from '../services/authService';

export const EmailVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isVerified, setIsVerified] = useState(false);

  const inputRefs = useRef([]);

  // Timer effect for 60s cooldown
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Take last digit if multiple entered
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split('');
    setOtp(digits);
    if (inputRefs.current[5]) {
      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!email) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await verifyEmailOtp({ email, otp: fullOtp });
      setLoading(false);

      if (response.success) {
        setIsVerified(true);
        setSuccessMsg(response.message || 'Email verified successfully!');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } else {
        setError(response.message || 'Verification failed.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Verification failed. Please check the code and try again.');
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending || !email) return;

    setError('');
    setSuccessMsg('');
    setResending(true);

    try {
      const response = await resendEmailOtp({ email });
      setResending(false);
      if (response.success) {
        setSuccessMsg(response.message || 'A new verification code has been sent to your email.');
        setTimer(60);
      } else {
        setError(response.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setResending(false);
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-xl border border-[#E2E8E0] shadow-sm">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#2F7C7A]/10 text-[#2F7C7A] mb-1">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#132238] tracking-tight">
            Verify Your Email
          </h2>
          <p className="text-xs text-[#475569]">
            We sent a 6-digit verification code to
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F7F8F5] rounded-full border border-[#E2E8E0] text-xs font-semibold text-[#132238]">
            <Mail className="w-3.5 h-3.5 text-[#2F7C7A]" />
            {email || 'your email'}
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded">
            <p className="font-semibold">Verification Error</p>
            <p>{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs rounded flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Success</p>
              <p>{successMsg}</p>
            </div>
          </div>
        )}

        {isVerified ? (
          <div className="text-center py-4 space-y-4">
            <p className="text-sm text-slate-600">Redirecting to login portal...</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full bg-[#2F7C7A] text-white py-3 px-4 rounded font-bold hover:bg-[#256361] transition-all text-xs tracking-wider uppercase"
            >
              PROCEED TO LOGIN <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!location.state?.email && (
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  className="w-full px-3 py-2.5 rounded border border-[#E2E8E0] bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F7C7A]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#132238] text-center mb-3">
                Enter 6-Digit Code
              </label>
              <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-lg font-bold rounded border border-[#E2E8E0] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all shadow-sm"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-[#2F7C7A] text-white py-3.5 px-4 rounded font-bold hover:bg-[#256361] focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:ring-offset-2 transition-all disabled:opacity-50 text-xs tracking-wider uppercase shadow-sm"
              >
                {loading ? 'VERIFYING CODE...' : 'VERIFY EMAIL'}
              </button>

              <div className="flex items-center justify-between text-xs text-[#64748B] pt-2">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={timer > 0 || resending}
                  className="inline-flex items-center gap-1 font-semibold text-[#2F7C7A] hover:underline disabled:text-slate-400 disabled:no-underline"
                >
                  <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="text-center pt-3 border-t border-[#E2E8E0]">
          <Link to="/login" className="text-xs font-semibold text-[#64748B] hover:text-[#132238]">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
