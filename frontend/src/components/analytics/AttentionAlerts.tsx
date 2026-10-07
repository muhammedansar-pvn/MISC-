'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, FileWarning, CreditCard, ChevronRight } from 'lucide-react';

interface LowAttendanceStudent {
  studentId: string;
  studentName?: string;
  name?: string;
  registrationNumber?: string;
  className?: string;
  percentage?: number;
  attendancePercentage?: number;
}

interface StrugglingStudent {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  className: string;
  percentage: number;
  grade: string;
  resultStatus: string;
}

interface UnmarkedClass {
  classId: string;
  className: string;
  classCode: string;
}

interface AttentionAlertsProps {
  lowAttendanceStudents?: LowAttendanceStudent[];
  failingStudents?: StrugglingStudent[];
  unmarkedClasses?: UnmarkedClass[];
  pendingExamsCount?: number;
  profileLinkPrefix?: string; // e.g. "/faculty/students" or "/admin/students"
}

export const AttentionAlerts: React.FC<AttentionAlertsProps> = ({
  lowAttendanceStudents = [],
  failingStudents = [],
  unmarkedClasses = [],
  pendingExamsCount = 0,
  profileLinkPrefix = '/admin/students',
}) => {
  const hasAlerts =
    lowAttendanceStudents.length > 0 ||
    failingStudents.length > 0 ||
    unmarkedClasses.length > 0 ||
    pendingExamsCount > 0;

  if (!hasAlerts) {
    return (
      <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 flex items-center space-x-3 text-emerald-800">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          ✓
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
            All Systems Healthy
          </h4>
          <p className="text-xs text-emerald-700 mt-0.5">
            No critical attendance deficits, unmarked sessions, or pending result actions detected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alert Header Banner */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-center space-x-3 text-amber-900">
        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950">
            Action Required & Attention Needed
          </h4>
          <p className="text-xs text-amber-800 mt-0.5">
            The following cohort risks require administrative or faculty intervention.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Low Attendance Card */}
        {lowAttendanceStudents.length > 0 && (
          <div className="bg-white rounded-2xl border border-rose-200/70 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                  Attendance Deficit (&lt;75%)
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                {lowAttendanceStudents.length} Students
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {lowAttendanceStudents.map((s, idx) => {
                const sName = s.studentName || s.name || 'Student';
                const sPct = s.percentage !== undefined ? s.percentage : (s.attendancePercentage || 0);

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-rose-50/40 hover:bg-rose-50 text-xs transition-colors border border-rose-100/50"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{sName}</p>
                      <p className="text-[11px] text-slate-400">
                        {s.registrationNumber} · {s.className}
                      </p>
                    </div>
                    <div className="text-right flex items-center space-x-2">
                      <span className="font-bold text-rose-600 bg-white px-2 py-0.5 rounded border border-rose-200 text-xs">
                        {sPct}%
                      </span>
                      {s.studentId && (
                        <Link
                          href={`${profileLinkPrefix}/${s.studentId}`}
                          className="text-slate-400 hover:text-[#2F7C7A] transition-colors p-1"
                          title="View Student Profile"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Unmarked Attendance Classes Card */}
        {unmarkedClasses.length > 0 && (
          <div className="bg-white rounded-2xl border border-amber-200/70 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Unmarked Sessions
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                {unmarkedClasses.length} Classes
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Classes where daily attendance records have not been submitted yet:
            </p>
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {unmarkedClasses.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-amber-50/40 text-xs border border-amber-100/50"
                >
                  <span className="font-semibold text-slate-800">{c.className}</span>
                  <span className="font-mono text-[11px] text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200">
                    {c.classCode}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Academic / Result Risks Card */}
        {failingStudents.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileWarning className="w-4 h-4 text-slate-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Academic Remediation
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                {failingStudents.length} Students
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Students needing academic mentorship or re-evaluation support:
            </p>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {failingStudents.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs border border-slate-200/50"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{s.studentName}</p>
                    <p className="text-[11px] text-slate-400">
                      {s.registrationNumber} · {s.className}
                    </p>
                  </div>
                  <span className="font-bold text-rose-600 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                    {s.percentage}% ({s.grade})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
