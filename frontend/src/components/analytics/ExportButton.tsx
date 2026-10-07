'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { getExportReport } from '@/services/analytics.service';

interface ExportButtonProps {
  reportType?: string;
  classId?: string;
  academicYearId?: string;
  label?: string;
  fileName?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  reportType = 'STUDENT_ATTENDANCE',
  classId,
  academicYearId,
  label = 'Export CSV Report',
  fileName = 'misc-report.csv',
}) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const data = await getExportReport(reportType, { classId, academicYearId });

      if (!data || !data.rows || data.rows.length === 0) {
        alert('No data available to export for the selected filter.');
        return;
      }

      // Convert to CSV format
      const headerRow = data.columns.map((c) => `"${c.label}"`).join(',');
      const rows = data.rows.map((row) => {
        return data.columns
          .map((c) => {
            const val = row[c.key] !== undefined && row[c.key] !== null ? String(row[c.key]) : '';
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',');
      });

      const csvContent = [headerRow, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Export error:', err);
      alert('Failed to generate export file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#132238] transition-all shadow-2xs cursor-pointer disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2F7C7A]" />
      ) : (
        <Download className="w-3.5 h-3.5 text-[#2F7C7A]" />
      )}
      <span>{label}</span>
    </button>
  );
};
