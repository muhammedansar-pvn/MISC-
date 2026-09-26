import React from 'react';

export const RoleBadge = ({ role }) => {
  const getBadgeStyle = (roleType) => {
    switch (roleType?.toUpperCase()) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PRINCIPAL':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HOD':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'ASATITHA':
      case 'FACULTY':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'PARENT':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'STUDENT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'INSTITUTION':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(
        role
      )}`}
    >
      {role || 'N/A'}
    </span>
  );
};

export default RoleBadge;
