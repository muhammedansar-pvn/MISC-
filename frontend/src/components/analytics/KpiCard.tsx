import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'teal' | 'navy' | 'emerald' | 'amber' | 'rose' | 'slate';
  badge?: string;
}

const variantStyles = {
  teal: {
    bg: 'bg-teal-50',
    iconColor: 'text-[#2F7C7A]',
    border: 'border-teal-100',
    badgeBg: 'bg-teal-100/70 text-[#2F7C7A]',
  },
  navy: {
    bg: 'bg-slate-100',
    iconColor: 'text-[#132238]',
    border: 'border-slate-200',
    badgeBg: 'bg-slate-200 text-[#132238]',
  },
  emerald: {
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
    border: 'border-emerald-100',
    badgeBg: 'bg-emerald-100 text-emerald-800',
  },
  amber: {
    bg: 'bg-amber-50',
    iconColor: 'text-amber-700',
    border: 'border-amber-100',
    badgeBg: 'bg-amber-100 text-amber-800',
  },
  rose: {
    bg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    border: 'border-rose-100',
    badgeBg: 'bg-rose-100 text-rose-800',
  },
  slate: {
    bg: 'bg-slate-50',
    iconColor: 'text-slate-600',
    border: 'border-slate-200',
    badgeBg: 'bg-slate-100 text-slate-700',
  },
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'teal',
  badge,
}) => {
  const styles = variantStyles[variant];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#132238] tracking-tight">{value}</p>
        </div>
        <div className={`p-3 rounded-xl border ${styles.bg} ${styles.border} ${styles.iconColor} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {(subtitle || badge) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle}</span>
          {badge && (
            <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${styles.badgeBg}`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
