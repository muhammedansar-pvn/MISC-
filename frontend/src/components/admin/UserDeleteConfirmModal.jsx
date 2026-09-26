'use client';

import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, CheckCircle, ShieldOff } from 'lucide-react';
import { deleteUser, updateUserStatus } from '../../services/admin.service';

export const UserDeleteConfirmModal = ({ isOpen, onClose, onSuccess, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !user) return null;

  const handleClose = () => {
    setError('');
    setSuccessMsg('');
    onClose();
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await deleteUser(user._id);
      setSuccessMsg(res?.message || `User ${user.name || user.email} deleted successfully.`);
      setLoading(false);
      setTimeout(() => {
        if (onSuccess) onSuccess(user._id);
        handleClose();
      }, 1000);
    } catch (err) {
      setLoading(false);
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (status === 403) {
        setError('Permission denied. Administrator authorization is required.');
      } else if (status === 404) {
        setError('User not found or has already been deleted.');
      } else {
        setError(data?.message || 'Failed to delete user.');
      }
    }
  };

  const handleDeactivate = async () => {
    setLoading(true);
    setError('');
    try {
      await updateUserStatus(user._id, 'INACTIVE');
      setSuccessMsg(`User ${user.name || user.email} status updated to INACTIVE.`);
      setLoading(false);
      setTimeout(() => {
        if (onSuccess) onSuccess(user._id);
        handleClose();
      }, 1000);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to deactivate user.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-[#E2E8E0] overflow-hidden transition-all my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8E0] bg-[#F7F8F5]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#132238]">Delete User Confirmation</h3>
              <p className="text-xs text-slate-500">Confirm account deletion</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-all disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {successMsg ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-emerald-900">{successMsg}</p>
            </div>
          ) : (
            <>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Details</p>
                <p className="text-sm font-bold text-[#132238]">{user.name || 'Unassigned User'}</p>
                <p className="text-xs text-slate-600 font-mono">{user.email}</p>
                <div className="pt-1 flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase">
                    {user.role}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 uppercase">
                    {user.status}
                  </span>
                </div>
              </div>

              {user.role === 'STUDENT' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    Student Lifecycle Notice:
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    This account is linked to a StudentProfile. Deactivating or deleting this user will synchronize their academic profile status while safely preserving historical exam results and payment records.
                  </p>
                </div>
              )}

              <p className="text-xs font-semibold text-slate-700">
                Are you sure you want to delete this user?
              </p>

              {error && (
                <div className="p-3.5 bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs rounded-r-lg font-semibold">
                  {error}
                </div>
              )}

              {/* Actions */}
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
                  onClick={handleDeactivate}
                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center cursor-pointer"
                >
                  <ShieldOff className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  Deactivate
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center cursor-pointer shadow-xs"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                      DELETING...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Delete User
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

export default UserDeleteConfirmModal;
