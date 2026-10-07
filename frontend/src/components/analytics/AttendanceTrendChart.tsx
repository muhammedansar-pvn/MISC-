'use client';

import React, { useState } from 'react';

interface TrendPoint {
  month: string;
  percentage: number;
  total?: number;
}

interface AttendanceTrendChartProps {
  data: TrendPoint[];
  title?: string;
  subtitle?: string;
}

export const AttendanceTrendChart: React.FC<AttendanceTrendChartProps> = ({
  data,
  title = 'Attendance Trend',
  subtitle = 'Historical attendance rates over time',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center text-slate-400">
        <p className="text-sm">No historical attendance trend data available yet.</p>
      </div>
    );
  }

  const height = 180;
  const width = 500;
  const paddingX = 40;
  const paddingY = 25;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * (width - paddingX * 2);
    // Percentage 0 to 100
    const clampedPct = Math.min(100, Math.max(0, d.percentage || 0));
    const y = height - paddingY - (clampedPct / 100) * (height - paddingY * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="text-sm font-bold text-[#132238]">{title}</h3>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4 text-xs font-medium text-slate-500">
          <span className="flex items-center">
            <span className="w-3 h-1 bg-[#2F7C7A] rounded-full mr-1.5 inline-block"></span>
            Attendance %
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-0.5 border-t border-dashed border-rose-400 mr-1.5 inline-block"></span>
            75% Min. Threshold
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 select-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2F7C7A" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2F7C7A" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#E2E8F0"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={height - paddingY - 0.5 * (height - paddingY * 2)}
            x2={width - paddingX}
            y2={height - paddingY - 0.5 * (height - paddingY * 2)}
            stroke="#F1F5F9"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#F1F5F9"
            strokeWidth="1"
          />

          {/* 75% Threshold line */}
          <line
            x1={paddingX}
            y1={height - paddingY - 0.75 * (height - paddingY * 2)}
            x2={width - paddingX}
            y2={height - paddingY - 0.75 * (height - paddingY * 2)}
            stroke="#F87171"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Area fill */}
          {areaD && <path d={areaD} fill="url(#attendanceGradient)" />}

          {/* Line stroke */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#2F7C7A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data point dots */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? 6 : 4}
                className="cursor-pointer transition-all"
                fill={p.percentage >= 75 ? '#2F7C7A' : '#EF4444'}
                stroke="#FFFFFF"
                strokeWidth="2"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              {/* X-axis labels */}
              <text
                x={p.x}
                y={height - 6}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-medium"
              >
                {p.month}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover info tooltip */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#132238] text-white text-xs px-3 py-1.5 rounded-lg shadow-lg pointer-events-none flex items-center space-x-2"
          >
            <span className="font-semibold">{points[hoveredIdx].month}:</span>
            <span className={points[hoveredIdx].percentage >= 75 ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
              {points[hoveredIdx].percentage}%
            </span>
            {points[hoveredIdx].total !== undefined && (
              <span className="text-slate-300 text-[11px]">({points[hoveredIdx].total} sessions)</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
