import React, { useState, useEffect } from 'react';
import { sendOtp, verifyOtp } from '../../services/authService';

export const OtpVerificationModal = ({ isOpen, onClose, identifier, purpose, onVerified }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await verifyOtp({ identifier, otp: otpCode, purpose });
      setLoading(false);
      setSuccessMsg(res.message || 'OTP Verified Successfully');
      if (onVerified) onVerified(res);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'OTP verification failed');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await sendOtp({ identifier, purpose });
      setLoading(false);
      setSuccessMsg(res.message || 'New OTP sent successfully');
      setCooldown(60);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-[#132238]">Security Verification</h3>
          <p className="text-sm text-[#475569]">
            Enter the 6-digit code sent to <span className="font-semibold text-[#132238]">{identifier}</span>
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-sm text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center space-x-2 sm:space-x-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-10 h-12 text-center text-lg font-bold border border-[#E2E8E0] rounded focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent bg-slate-50"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2F7C7A] text-white py-3 rounded font-bold hover:bg-[#256361] transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'VERIFY OTP'}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-[#475569] pt-2 border-t border-[#E2E8E0]">
          <button
            type="button"
            onClick={onClose}
            className="hover:text-[#132238] font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={cooldown > 0 || loading}
            onClick={handleResend}
            className="font-bold text-[#2F7C7A] hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationModal;
