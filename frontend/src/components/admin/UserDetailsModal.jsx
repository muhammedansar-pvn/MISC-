'use client';

import React from 'react';
import { X, User, Mail, Phone, Building, Calendar, Hash, Shield } from 'lucide-react';
import RoleBadge from './RoleBadge';
import StatusBadge from './StatusBadge';

export const UserDetailsModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-[#E2E8E0] overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8E0] bg-[#F7F8F5]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#2F7C7A]/10 text-[#2F7C7A] flex items-center justify-center font-bold text-lg">
              {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#132238]">{user.name || 'User Profile'}</h3>
              <p className="text-xs text-slate-500">System User Information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">ACCOUNT ROLE</span>
              <RoleBadge role={user.role} />
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 block mb-1">STATUS</span>
              <StatusBadge status={user.status} />
            </div>
          </div>

          <div className="space-y-3 pt-2 text-sm text-slate-700">
            <div className="flex items-start space-x-3">
              <Mail className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Email Address</p>
                <p className="font-medium text-[#132238]">{user.email || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Hash className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Username</p>
                <p className="font-mono text-slate-900">{user.username || 'Not set yet'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Mobile Number</p>
                <p className="font-medium text-[#132238]">{user.mobile || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Building className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Department / Office</p>
                <p className="font-medium text-[#132238]">{user.department || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Created Date</p>
                <p className="font-medium text-[#132238]">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-[#E2E8E0]">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
