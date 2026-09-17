import React from 'react';

export const RoleBadge = ({ role }) => {
  const getBadgeStyle = (roleType) => {
    switch (roleType?.toUpperCase()) {
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
