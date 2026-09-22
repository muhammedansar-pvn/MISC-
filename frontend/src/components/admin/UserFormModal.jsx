'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Edit3, CheckCircle, AlertCircle, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';
import { createUserInvitation, updateUser, verifyAdminUserOtp, resendAdminUserOtp } from '../../services/admin.service';

/**
 * @param {{ isOpen: boolean; onClose: () => void; onSuccess: () => void; userToEdit?: any }} props
 */
export const UserFormModal = ({ isOpen, onClose, onSuccess, userToEdit = null }) => {
  const isEditMode = !!userToEdit;

  // Step state: 'FORM' | 'OTP' | 'SUCCESS'
  const [step, setStep] = useState('FORM');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    role: 'FACULTY',
    department: '',
    mobile: '',
    status: 'ACTIVE',
  });

  // OTP state
  const [otp, setOtp] = useState('');
  const [verificationSession, setVerificationSession] = useState(null); // { verificationId, email, maskedEmail }
  const [resendCooldown, setResendCooldown] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  const resetFormState = () => {
    setFormData({
      name: '',
      email: '',
      username: '',
      role: 'FACULTY',
      department: '',
      mobile: '',
      status: 'ACTIVE',
    });
    setOtp('');
    setVerificationSession(null);
    setStep('FORM');
    setError('');
    setFieldErrors([]);
    setSuccessMessage('');
    setResendCooldown(0);
    setTimeLeft(600);
  };

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name || '',
        email: userToEdit.email || '',
        username: userToEdit.username || '',
        role: userToEdit.role || 'STUDENT',
        department: userToEdit.department || '',
        mobile: userToEdit.mobile || '',
        status: userToEdit.status || 'ACTIVE',
      });
      setStep('FORM');
    } else {
      resetFormState();
    }
  }, [userToEdit, isOpen]);

  // Resend cooldown timer effect
  useEffect(() => {
    let interval = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // OTP expiration countdown timer effect
  useEffect(() => {
    let interval = null;
    if (step === 'OTP' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timeLeft]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);
    setSuccessMessage('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and Email are required.');
      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        const res = await updateUser(userToEdit._id, formData);
        setSuccessMessage('User updated successfully.');
        setStep('SUCCESS');
        setLoading(false);
        setTimeout(() => {
          if (onSuccess) onSuccess(res?.data);
          handleClose();
        }, 1200);
      } else {
        const res = await createUserInvitation(formData);
        setLoading(false);
        if (res?.requiresOtp && res?.data?.verificationId) {
          setVerificationSession({
            verificationId: res.data.verificationId,
            email: res.data.email,
            maskedEmail: res.data.maskedEmail || res.data.email,
          });
          setStep('OTP');
          setResendCooldown(30);
          setTimeLeft(600);
        } else {
          setSuccessMessage(res?.message || 'User invitation sent successfully.');
          setStep('SUCCESS');
          setTimeout(() => {
            if (onSuccess) onSuccess(res?.data);
            handleClose();
          }, 1200);
        }
      }
    } catch (err) {
      setLoading(false);
      const data = err.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        setFieldErrors(data.errors);
      }
      let errorMsg = '';
      if (data?.error?.code) {
        switch (data.error.code) {
          case 'SMTP_AUTH_FAILED':
            errorMsg = 'Email service authentication failed. Please contact the administrator.';
            break;
          case 'SMTP_CONNECTION_FAILED':
            errorMsg = 'Unable to connect to the email service. Please try again later.';
            break;
          case 'SMTP_TIMEOUT':
            errorMsg = 'Email service timed out. Please try again later.';
            break;
          case 'SMTP_SEND_FAILED':
            errorMsg = 'Unable to send the verification email. Please try again later.';
            break;
          default:
            errorMsg = data.error.message || 'Unable to complete registration. Please try again later.';
        }
      } else if (data?.message) {
        errorMsg = data.message;
        if (typeof errorMsg === 'string' && (errorMsg.includes('E11000') || errorMsg.includes('duplicate key'))) {
          errorMsg = 'A user with this email address or username already exists.';
        }
      } else {
        errorMsg = 'Unable to complete registration. Please try again later.';
      }
      setError(errorMsg);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await verifyAdminUserOtp({
        email: verificationSession.email,
        verificationId: verificationSession.verificationId,
        otp: otp.trim(),
      });
      setLoading(false);
      setSuccessMessage("Registration successful. An account setup link has been sent to the user's email.");
      setStep('SUCCESS');
      setTimeout(() => {
        if (onSuccess) onSuccess(res?.data);
        handleClose();
      }, 1500);
    } catch (err) {
      setLoading(false);
      const errorMsg = err.response?.data?.message || 'OTP verification failed. Please try again.';
      setError(errorMsg);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setError('');
    setResending(true);

    try {
      const res = await resendAdminUserOtp({
        email: verificationSession.email,
        verificationId: verificationSession.verificationId,
      });
      setResending(false);
      setResendCooldown(30);
      setTimeLeft(600);
      if (res?.data?.verificationId) {
        setVerificationSession((prev) => ({
          ...prev,
          verificationId: res.data.verificationId,
        }));
      }
    } catch (err) {
      setResending(false);
      const data = err.response?.data;
      let errorMsg = '';
      if (data?.error?.code) {
        switch (data.error.code) {
          case 'SMTP_AUTH_FAILED':
            errorMsg = 'Email service authentication failed. Please contact the administrator.';
            break;
          case 'SMTP_CONNECTION_FAILED':
            errorMsg = 'Unable to connect to the email service. Please try again later.';
            break;
          case 'SMTP_TIMEOUT':
            errorMsg = 'Email service timed out. Please try again later.';
            break;
          case 'SMTP_SEND_FAILED':
            errorMsg = 'Unable to send the verification email. Please try again later.';
            break;
          default:
            errorMsg = data.error.message || 'Failed to resend OTP code.';
        }
      } else {
        errorMsg = data?.message || 'Failed to resend OTP code.';
      }
      setError(errorMsg);
    }
  };

  const handleClose = () => {
    resetFormState();
    onClose();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-[#E2E8E0] overflow-hidden transition-all my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8E0] bg-[#F7F8F5]">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEditMode ? 'bg-emerald-100 text-emerald-700' : 'bg-[#2F7C7A]/10 text-[#2F7C7A]'}`}>
              {step === 'OTP' ? <ShieldCheck className="w-5 h-5 text-[#2F7C7A]" /> : isEditMode ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#132238]">
                {step === 'OTP' ? 'Verify Email OTP' : isEditMode ? 'Edit System User' : 'Register / Invite User'}
              </h3>
              <p className="text-xs text-slate-500">
                {step === 'OTP'
                  ? `OTP sent to ${verificationSession?.maskedEmail || verificationSession?.email}`
                  : isEditMode
                  ? 'Update user profile details and access status'
                  : 'Register user and verify their email address'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {step === 'SUCCESS' ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="text-lg font-bold text-emerald-900">{successMessage || 'Action Completed Successfully'}</h4>
              <p className="text-sm text-emerald-700">
                {isEditMode ? (
                  <>Profile records for <span className="font-semibold">{formData.name}</span> have been saved.</>
                ) : (
                  <>An email with an account setup link has been delivered to <span className="font-semibold">{verificationSession?.email || formData.email}</span>.</>
                )}
              </p>
            </div>
          ) : step === 'OTP' ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {error && (
                <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm rounded-r-lg flex items-center font-bold">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="bg-[#F7F8F5] p-4 rounded-xl border border-[#E2E8E0] text-center space-y-2">
                <p className="text-sm text-slate-700">
                  Please enter the 6-digit verification code sent to <strong className="text-[#132238]">{verificationSession?.maskedEmail || verificationSession?.email}</strong>.
                </p>
                <div className="text-xs text-slate-500 font-medium">
                  {timeLeft > 0 ? (
                    <span>Code expires in: <strong className="text-[#2F7C7A]">{formatTime(timeLeft)}</strong></span>
                  ) : (
                    <span className="text-rose-600 font-bold">OTP has expired. Please request a new code.</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-1.5 text-center">
                  6-Digit Verification Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8E0] bg-white text-center font-mono text-2xl tracking-[0.5em] font-extrabold text-[#132238] focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('FORM')}
                  className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-[#2F7C7A] transition-all"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Registration Form
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || resending}
                  className="inline-flex items-center text-xs font-bold text-[#2F7C7A] hover:text-[#256361] disabled:opacity-50 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${resending ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-[#E2E8E0]">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6 || timeLeft <= 0}
                  className="px-5 py-2.5 bg-[#2F7C7A] text-white rounded-lg font-bold text-sm hover:bg-[#256361] focus:outline-none transition-all disabled:opacity-50 uppercase tracking-wider shadow-sm flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      VERIFYING...
                    </>
                  ) : (
                    'VERIFY & SEND SETUP LINK'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {error && (
                <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm rounded-r-lg space-y-1">
                  <div className="flex items-center font-bold">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                  {fieldErrors.length > 0 && (
                    <ul className="list-disc pl-6 text-xs space-y-0.5 text-rose-600 mt-1">
                      {fieldErrors.map((errItem, idx) => (
                        <li key={idx}>
                          <span className="font-semibold capitalize">{errItem.field}:</span> {errItem.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Ahmed Hassan"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8E0] bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ahmed.hassan@markaz.in"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8E0] bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="ahmed.hassan"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8E0] bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-1.5">
                    User Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8E0] bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                  >
                    <option value="FACULTY">Faculty Member</option>
                    <option value="STUDENT">Student</option>
                    <option value="INSTITUTION">Institution Representative</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-1.5">
                    Account Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8E0] bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="INVITED">INVITED</option>
                    <option value="PENDING_SETUP">PENDING SETUP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8E0] bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-1.5">
                    Department / Office
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. Islamic Studies & Shariah"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8E0] bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-[#E2E8E0]">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#2F7C7A] text-white rounded-lg font-bold text-sm hover:bg-[#256361] focus:outline-none transition-all disabled:opacity-50 uppercase tracking-wider shadow-sm flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {isEditMode ? 'SAVING...' : 'REGISTERING...'}
                    </>
                  ) : (
                    isEditMode ? 'SAVE CHANGES' : 'REGISTER USER'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;
