'use client';

import React from 'react';

interface BarItem {
  label: string;
  value: number;
  secondaryValue?: string | number;
  percentage?: number;
  color?: string;
}

interface DistributionBarChartProps {
  title: string;
  subtitle?: string;
  items: BarItem[];
  emptyMessage?: string;
}

export const DistributionBarChart: React.FC<DistributionBarChartProps> = ({
  title,
  subtitle,
  items,
  emptyMessage = 'No distribution data available.',
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center text-slate-400">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  const maxValue = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[#132238]">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="space-y-3.5">
        {items.map((item, idx) => {
          const barWidth = Math.min(100, Math.max(5, (item.value / maxValue) * 100));
          const pct = item.percentage !== undefined ? item.percentage : item.value;
          const isAtRisk = pct < 75;

          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 truncate max-w-[200px]" title={item.label}>
                  {item.label}
                </span>
                <div className="flex items-center space-x-2 shrink-0">
                  {item.secondaryValue !== undefined && (
                    <span className="text-slate-400 text-[11px]">{item.secondaryValue}</span>
                  )}
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${
                      item.color
                        ? item.color
                        : isAtRisk
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-teal-50 text-[#2F7C7A]'
                    }`}
                  >
                    {item.percentage !== undefined ? `${pct}%` : item.value}
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isAtRisk ? 'bg-rose-400' : 'bg-[#2F7C7A]'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
