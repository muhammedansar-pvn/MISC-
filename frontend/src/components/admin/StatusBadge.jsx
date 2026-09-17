import React from 'react';

export const StatusBadge = ({ status }) => {
  const getBadgeStyle = (statusType) => {
    switch (statusType?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'INVITED':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'PENDING_SETUP':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'SUSPENDED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getFormatLabel = (statusType) => {
    switch (statusType?.toUpperCase()) {
      case 'PENDING_SETUP':
        return 'PENDING SETUP';
      default:
        return statusType || 'N/A';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(
        status
      )}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'ACTIVE'
            ? 'bg-emerald-500'
            : status === 'INVITED'
            ? 'bg-sky-500'
            : status === 'PENDING_SETUP'
            ? 'bg-amber-500'
            : 'bg-rose-500'
        }`}
      />
      {getFormatLabel(status)}
    </span>
  );
};

export default StatusBadge;
