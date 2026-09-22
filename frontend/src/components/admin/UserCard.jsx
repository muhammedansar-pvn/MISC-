'use client';

import React from 'react';
import { Mail, Phone, Eye, Edit3, ShieldAlert, ShieldCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';

const getRoleDisplayLabel = (role) => {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
      return 'ADMINISTRATOR';
    case 'INSTITUTION':
      return 'INSTITUTION ADMIN';
    case 'FACULTY':
      return 'FACULTY MEMBER';
    case 'STUDENT':
      return 'STUDENT';
    default:
      return role || 'USER';
  }
};

const getRoleBadgeStyle = (role) => {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'INSTITUTION':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'FACULTY':
      return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'STUDENT':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

const getAvatarBg = (role) => {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
      return 'bg-[#2F7C7A] text-white';
    case 'INSTITUTION':
      return 'bg-blue-600 text-white';
    case 'FACULTY':
      return 'bg-teal-600 text-white';
    case 'STUDENT':
      return 'bg-amber-600 text-white';
    default:
      return 'bg-slate-700 text-white';
  }
};

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

export const UserCard = ({ user, onDetails, onEdit, onToggleStatus }) => {
  const isSuspended = user.status === 'SUSPENDED';

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8E0] p-4.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 w-full min-w-0 h-full">
      {/* Header Info */}
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className={`w-11 h-11 rounded-full ${getAvatarBg(user.role)} flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0`}>
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-[#132238] text-sm truncate leading-snug" title={user.name}>
                {user.name || 'Unassigned User'}
              </h4>
              <p className="text-xs text-slate-500 truncate" title={user.department}>
                {user.department || user.username || 'MISC Central'}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <StatusBadge status={user.status} />
          </div>
        </div>

        {/* Inner Detail Box */}
        <div className="mt-4 bg-[#F8FAF9] border border-slate-200/70 rounded-xl p-3 space-y-2 text-xs min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Role</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border truncate ${getRoleBadgeStyle(user.role)}`}>
              {getRoleDisplayLabel(user.role)}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-slate-600 min-w-0">
            <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate text-xs" title={user.email}>{user.email}</span>
          </div>

          <div className="flex items-center space-x-2 text-slate-600 min-w-0">
            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="font-mono text-xs text-slate-700 truncate">{user.mobile || '+91 98765 43210'}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 min-w-0">
        <button
          onClick={() => onDetails && onDetails(user)}
          className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center min-w-0"
        >
          <Eye className="w-3.5 h-3.5 mr-1 text-slate-500 flex-shrink-0" />
          <span className="truncate">Details</span>
        </button>

        <button
          onClick={() => onEdit && onEdit(user)}
          className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/70 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center min-w-0"
        >
          <Edit3 className="w-3.5 h-3.5 mr-1 text-emerald-600 flex-shrink-0" />
          <span className="truncate">Edit</span>
        </button>

        <button
          onClick={() => onToggleStatus && onToggleStatus(user)}
          className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center border min-w-0 ${
            isSuspended
              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
          }`}
        >
          {isSuspended ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600 flex-shrink-0" />
              <span className="truncate">Activate</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-600 flex-shrink-0" />
              <span className="truncate">Suspend</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UserCard;
