import React from 'react';

export const StatCard = ({ title, value, icon: Icon, colorBg, colorText, subtitle }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-[#E2E8E0] shadow-sm flex items-center justify-between transition-all hover:shadow-md">
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
        <p className="text-3xl font-extrabold text-[#132238] tracking-tight">{value !== undefined ? value : '-'}</p>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`w-12 h-12 rounded-xl ${colorBg || 'bg-[#2F7C7A]/10'} ${colorText || 'text-[#2F7C7A]'} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
