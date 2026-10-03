'use client';

import React, { useState } from 'react';
import { KeyRound, X, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { resetUserPassword } from '../../services/admin.service';

export const UserPasswordResetModal = ({ isOpen, onClose, onSuccess, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !user) return null;

  const handleClose = () => {
    setError('');
    setSuccessMsg('');
    onClose();
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await resetUserPassword(user._id);
      const msg = res?.message || `Password reset link has been emailed to ${user.email}.`;
      setSuccessMsg(msg);
      setLoading(false);
      setTimeout(() => {
        if (onSuccess) onSuccess(msg);
        handleClose();
      }, 1500);
    } catch (err) {
      setLoading(false);
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (status === 403) {
        setError('Permission denied. Administrator authorization is required.');
      } else if (status === 404) {
        setError('User account not found.');
      } else if (status === 429) {
        setError('Too many password reset requests. Please wait 15 minutes before trying again.');
      } else {
        setError(data?.message || 'Failed to initiate password reset.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-[#E3EAE5] overflow-hidden transition-all my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3EAE5] bg-[#FBFCFB]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-100 text-[#23804A] flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#171D19]">Reset Password</h3>
              <p className="text-xs text-slate-500">Send password recovery link</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-all disabled:opacity-40 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {successMsg ? (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2.5">
              <CheckCircle className="w-9 h-9 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-emerald-900">{successMsg}</p>
              <p className="text-xs text-emerald-700">The user can now follow the instructions in the email to set their new password.</p>
            </div>
          ) : (
            <>
              {/* Account summary box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Account</p>
                <p className="text-sm font-bold text-[#171D19]">{user.name || 'User'}</p>
                <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-xs">{user.email}</span>
                </div>
                <div className="pt-1 flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 border border-green-200 uppercase">
                    {user.role}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 uppercase">
                    {user.status}
                  </span>
                </div>
              </div>

              {/* Confirmation prompt */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-800">
                  Send password reset link to <strong className="text-[#23804A]">{user.email}</strong>?
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  A secure, single-use password reset link valid for <strong>24 hours</strong> will be emailed. Any previous unused reset links for this user will be invalidated.
                </p>
              </div>

              {/* Error feedback */}
              {error && (
                <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs rounded-r-lg font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleClose}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResetPassword}
                  className="px-4 py-2 bg-[#23804A] hover:bg-[#1B6F41] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center cursor-pointer shadow-xs"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                      Sending Link...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPasswordResetModal;
