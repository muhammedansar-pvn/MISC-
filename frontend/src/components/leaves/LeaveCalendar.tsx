'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Calendar as CalendarIcon,
  UserCheck,
  X,
  FileText,
  AlertCircle,
  Info,
  CalendarCheck2,
} from 'lucide-react';
import { LeaveApplication, LeaveStatus } from '@/types';

interface LeaveCalendarProps {
  leaves: LeaveApplication[];
  onRequestLeave?: (startDate?: string, endDate?: string) => void;
  selectedStudentName?: string;
  canApply?: boolean;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_NAMES = [
  { short: 'Mon', full: 'Monday' },
  { short: 'Tue', full: 'Tuesday' },
  { short: 'Wed', full: 'Wednesday' },
  { short: 'Thu', full: 'Thursday' },
  { short: 'Fri', full: 'Friday' },
  { short: 'Sat', full: 'Saturday' },
  { short: 'Sun', full: 'Sunday' },
];

function toISODateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeISODate(dateStr?: string): string {
  if (!dateStr) return '';
  return dateStr.slice(0, 10);
}

export default function LeaveCalendar({
  leaves,
  onRequestLeave,
  selectedStudentName,
  canApply: canApplyProp,
}: LeaveCalendarProps) {
  const canApply = canApplyProp !== false && typeof onRequestLeave === 'function';
  const today = useMemo(() => new Date(), []);
  const todayISO = useMemo(() => toISODateString(today), [today]);

  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());

  // Date selection state for requesting leave (single date or range)
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);

  // Selected date for inspecting existing leaves
  const [inspectDate, setInspectDate] = useState<string | null>(null);
  const [dateWarning, setDateWarning] = useState<string | null>(null);

  // Quick navigation handlers
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToPrevYear = () => setCurrentYear((y) => y - 1);
  const goToNextYear = () => setCurrentYear((y) => y + 1);

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setInspectDate(todayISO);
  };

  // Map leaves by date for fast O(1) cell lookup
  const leavesByDate = useMemo(() => {
    const map = new Map<string, LeaveApplication[]>();

    leaves.forEach((leave) => {
      if (!leave.dateRange?.startDate || !leave.dateRange?.endDate) return;
      const start = normalizeISODate(leave.dateRange.startDate);
      const end = normalizeISODate(leave.dateRange.endDate);

      if (!start || !end) return;

      const startDateObj = new Date(start + 'T00:00:00');
      const endDateObj = new Date(end + 'T00:00:00');

      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) return;

      const cur = new Date(startDateObj);
      while (cur <= endDateObj) {
        const curISO = toISODateString(cur);
        const existing = map.get(curISO) || [];
        existing.push(leave);
        map.set(curISO, existing);
        cur.setDate(cur.getDate() + 1);
      }
    });

    return map;
  }, [leaves]);

  // Calendar cells computation (Monday-first grid)
  const calendarCells = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    // Monday-based offset: 0 for Monday, 6 for Sunday
    const startDayIndex = (firstDay.getDay() + 6) % 7;

    const cells: Array<{
      dateISO: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isWeekend: boolean;
    }> = [];

    // 1. Leading days from previous month
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(currentYear, currentMonth - 1, dayNum);
      const iso = toISODateString(prevDate);
      const dayOfWeek = prevDate.getDay();
      cells.push({
        dateISO: iso,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: iso === todayISO,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    // 2. Days in current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const curDate = new Date(currentYear, currentMonth, d);
      const iso = toISODateString(curDate);
      const dayOfWeek = curDate.getDay();
      cells.push({
        dateISO: iso,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: iso === todayISO,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    // 3. Trailing days to finish 7-day grid rows (35 or 42 cells)
    const totalCurrentCells = cells.length;
    const requiredRows = Math.ceil(totalCurrentCells / 7);
    const targetCellCount = Math.max(requiredRows * 7, 35);
    const trailingDaysNeeded = targetCellCount - totalCurrentCells;

    for (let d = 1; d <= trailingDaysNeeded; d++) {
      const nextDate = new Date(currentYear, currentMonth + 1, d);
      const iso = toISODateString(nextDate);
      const dayOfWeek = nextDate.getDay();
      cells.push({
        dateISO: iso,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: iso === todayISO,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    return cells;
  }, [currentYear, currentMonth, todayISO]);

  // Handle cell click (select date range or select inspect date)
  const handleCellClick = (dateISO: string) => {
    setInspectDate(dateISO);
    setDateWarning(null);

    // If application is not enabled (e.g. Student portal), purely inspect date
    if (!canApply) return;

    // Check if clicked date is in the past
    if (dateISO < todayISO) {
      setDateWarning('Leave can only be requested from today onwards.');
      setTimeout(() => setDateWarning(null), 4000);
      return;
    }

    // Range selection logic for valid today/future dates
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(dateISO);
      setRangeEnd(null);
    } else {
      // rangeStart exists, rangeEnd is null
      if (dateISO >= rangeStart) {
        setRangeEnd(dateISO);
      } else {
        setRangeEnd(rangeStart);
        setRangeStart(dateISO);
      }
    }
  };

  const handleClearSelection = () => {
    setRangeStart(null);
    setRangeEnd(null);
  };

  const handleRequestSelected = () => {
    if (!canApply || !onRequestLeave) return;

    if (rangeStart && rangeEnd) {
      onRequestLeave(rangeStart, rangeEnd);
    } else if (rangeStart) {
      onRequestLeave(rangeStart, rangeStart);
    } else if (inspectDate && inspectDate >= todayISO) {
      onRequestLeave(inspectDate, inspectDate);
    } else {
      onRequestLeave(todayISO, todayISO);
    }
  };

  // Leaves for the currently inspected date
  const inspectedLeaves = useMemo(() => {
    if (!inspectDate) return [];
    return leavesByDate.get(inspectDate) || [];
  }, [inspectDate, leavesByDate]);

  const formatDateDisplay = (isoStr: string) => {
    const d = new Date(isoStr + 'T00:00:00');
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start + 'T00:00:00').getTime();
    const e = new Date(end + 'T00:00:00').getTime();
    if (isNaN(s) || isNaN(e)) return '1 day';
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? `${diff} day${diff > 1 ? 's' : ''}` : '1 day';
  };

  return (
    <div className="space-y-6">
      {/* Calendar Card Container */}
      <div className="bg-white rounded-2xl border border-[#E3EAE5] shadow-xs overflow-hidden">
        {/* Calendar Top Navigation Header */}
        <div className="px-5 py-4 bg-[#F8FAF9] border-b border-[#E3EAE5] flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Month / Year Navigator */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center rounded-lg border border-[#E3EAE5] bg-white shadow-2xs p-0.5">
              <button
                onClick={goToPrevYear}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
                title="Previous Year"
                aria-label="Previous Year"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToPrevMonth}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
                title="Previous Month"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-lg sm:text-xl font-bold font-serif text-[#132238] min-w-[170px] text-center tracking-tight">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>

            <div className="flex items-center rounded-lg border border-[#E3EAE5] bg-white shadow-2xs p-0.5">
              <button
                onClick={goToNextMonth}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
                title="Next Month"
                aria-label="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={goToNextYear}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
                title="Next Year"
                aria-label="Next Year"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E3EAE5] bg-white text-slate-700 hover:bg-slate-50 hover:text-[#2F7C7A] shadow-2xs transition-all"
            >
              Today
            </button>
          </div>

          {/* Quick Action / Request Button (Parent Only) */}
          {canApply && (
            <div className="flex items-center space-x-2.5">
              {rangeStart && (
                <div className="hidden sm:flex items-center space-x-2 text-xs bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1.5 rounded-lg">
                  <CalendarCheck2 className="w-3.5 h-3.5 text-[#2F7C7A]" />
                  <span className="font-semibold">
                    {rangeEnd && rangeStart !== rangeEnd
                      ? `${formatDateDisplay(rangeStart)} → ${formatDateDisplay(rangeEnd)} (${calculateDays(rangeStart, rangeEnd)})`
                      : formatDateDisplay(rangeStart)}
                  </span>
                  <button
                    onClick={handleClearSelection}
                    className="text-teal-600 hover:text-teal-900 p-0.5 ml-1"
                    title="Clear date selection"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <button
                onClick={handleRequestSelected}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-[#2F7C7A] hover:bg-[#256361] text-white font-semibold text-xs shadow-xs transition-all tracking-wide cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                REQUEST LEAVE
              </button>
            </div>
          )}
        </div>

        {/* Date Policy Warning Alert */}
        {dateWarning && (
          <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-medium">{dateWarning}</span>
            </div>
            <button onClick={() => setDateWarning(null)} className="text-amber-600 hover:text-amber-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 7-Column Weekday Headers (Monday First) */}
        <div className="grid grid-cols-7 border-b border-[#E3EAE5] bg-slate-50/70 text-center">
          {WEEKDAY_NAMES.map((wd, index) => {
            const isFridayOrSunday = index === 4 || index === 6;
            return (
              <div
                key={wd.short}
                className={`py-2.5 text-xs font-bold uppercase tracking-wider ${
                  isFridayOrSunday ? 'text-teal-800 bg-teal-50/40' : 'text-slate-600'
                }`}
                title={wd.full}
              >
                <span className="sm:hidden">{wd.short.slice(0, 2)}</span>
                <span className="hidden sm:inline">{wd.short}</span>
              </div>
            );
          })}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[#E3EAE5] bg-[#E3EAE5]">
          {calendarCells.map((cell) => {
            const cellLeaves = leavesByDate.get(cell.dateISO) || [];
            const hasLeaves = cellLeaves.length > 0;

            const hasApproved = cellLeaves.some((l) => l.status === 'APPROVED');
            const hasPending = cellLeaves.some((l) => l.status === 'PENDING');
            const hasRejected = cellLeaves.some((l) => l.status === 'REJECTED');

            // Selection calculation
            const isRangeStart = rangeStart === cell.dateISO;
            const isRangeEnd = rangeEnd === cell.dateISO;
            const isSingleSelected = rangeStart === cell.dateISO && !rangeEnd;
            const isInRange =
              rangeStart &&
              rangeEnd &&
              cell.dateISO >= rangeStart &&
              cell.dateISO <= rangeEnd;
            const isInspected = inspectDate === cell.dateISO;
            const isPast = cell.dateISO < todayISO;

            return (
              <div
                key={cell.dateISO}
                onClick={() => handleCellClick(cell.dateISO)}
                title={isPast && canApply ? 'Past date - leave can only be requested from today onwards' : undefined}
                className={`min-h-[85px] sm:min-h-[105px] p-1.5 sm:p-2 bg-white transition-all cursor-pointer relative flex flex-col justify-between group select-none ${
                  !cell.isCurrentMonth
                    ? 'bg-slate-50/80 text-slate-300'
                    : isPast && canApply
                    ? 'bg-slate-50/60 text-slate-500'
                    : 'text-slate-800'
                } ${
                  isInRange
                    ? 'bg-teal-50/60 ring-1 ring-inset ring-[#2F7C7A]/40'
                    : isInspected
                    ? 'ring-2 ring-inset ring-[#132238]/70 bg-slate-50/40'
                    : 'hover:bg-slate-50/80'
                }`}
              >
                {/* Day Header Row */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold font-mono ${
                      cell.isToday
                        ? 'bg-[#132238] text-white font-bold shadow-2xs'
                        : isRangeStart || isRangeEnd || isSingleSelected
                        ? 'bg-[#2F7C7A] text-white font-bold'
                        : cell.isCurrentMonth
                        ? 'text-slate-800 group-hover:text-[#2F7C7A]'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {cell.isToday && (
                    <span className="hidden sm:inline-block text-[9px] font-bold uppercase tracking-wider text-[#2F7C7A] bg-teal-50 px-1 rounded-sm border border-teal-200">
                      Today
                    </span>
                  )}
                </div>

                {/* Status Badges Inside Day Cell */}
                <div className="mt-1 space-y-1 overflow-hidden">
                  {cellLeaves.slice(0, 2).map((leave) => {
                    let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
                    let dotClass = 'bg-slate-400';
                    let label: string = leave.status;

                    if (leave.status === 'APPROVED') {
                      badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                      dotClass = 'bg-emerald-500';
                      label = 'Approved';
                    } else if (leave.status === 'PENDING') {
                      badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                      dotClass = 'bg-amber-500';
                      label = 'Pending';
                    } else if (leave.status === 'REJECTED') {
                      badgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
                      dotClass = 'bg-rose-500';
                      label = 'Rejected';
                    }

                    return (
                      <div
                        key={leave._id}
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate flex items-center space-x-1 ${badgeClass}`}
                        title={`${label}: ${leave.reason}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
                        <span className="truncate hidden sm:inline">{label}</span>
                        <span className="sm:hidden font-mono uppercase text-[9px]">
                          {label[0]}
                        </span>
                      </div>
                    );
                  })}

                  {cellLeaves.length > 2 && (
                    <div className="text-[9px] font-bold text-slate-500 text-right pr-1">
                      +{cellLeaves.length - 2} more
                    </div>
                  )}
                </div>

                {/* Sub-indicator dot bar for quick mobile scanning */}
                <div className="sm:hidden flex items-center justify-center space-x-1 pt-1">
                  {hasApproved && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  {hasPending && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                  {hasRejected && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend Footer */}
        <div className="px-5 py-3.5 bg-[#F8FAF9] border-t border-[#E3EAE5] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-slate-700">Calendar Legend:</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Approved Leave</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Pending Review</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Rejected</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#132238]" />
              <span>Today</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            Tip: Click any date to view leave details or select a multi-day range.
          </div>
        </div>
      </div>

      {/* Selected Date Details Panel (Appears when date is inspected or selected) */}
      {inspectDate && (
        <div className="bg-white rounded-xl border border-[#E3EAE5] shadow-2xs p-5 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2F7C7A]/10 text-[#2F7C7A] flex items-center justify-center shrink-0">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#132238]">
                  Date Overview: {formatDateDisplay(inspectDate)}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {inspectedLeaves.length > 0
                    ? `${inspectedLeaves.length} leave application${
                        inspectedLeaves.length > 1 ? 's' : ''
                      } associated with this date`
                    : 'No leave applications on this date'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto">
              {canApply && onRequestLeave && inspectDate >= todayISO && (
                <button
                  onClick={() => onRequestLeave(inspectDate, inspectDate)}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#2F7C7A] text-white hover:bg-[#256361] font-semibold text-xs shadow-2xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Apply for this Date
                </button>
              )}
              <button
                onClick={() => setInspectDate(null)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List of leaves for this day */}
          {inspectedLeaves.length > 0 ? (
            <div className="divide-y divide-slate-100 mt-3">
              {inspectedLeaves.map((leave) => {
                const approverName =
                  typeof leave.approvedBy === 'object' && leave.approvedBy
                    ? leave.approvedBy.nameEnglish || 'Assigned Usthad'
                    : null;

                const studentObj =
                  typeof leave.studentId === 'object' ? leave.studentId : null;
                const studentName =
                  studentObj?.nameEnglish || selectedStudentName || null;

                return (
                  <div key={leave._id} className="py-3 first:pt-2 last:pb-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {leave.status === 'APPROVED' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                              Approved
                            </span>
                          ) : leave.status === 'PENDING' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 mr-1 text-amber-600" />
                              Pending Review
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3 h-3 mr-1 text-rose-600" />
                              Rejected
                            </span>
                          )}

                          {studentName && (
                            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                              {studentName}
                            </span>
                          )}

                          {leave.leaveType && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                              {leave.leaveType.replace('_', ' ')}
                            </span>
                          )}

                          <span className="text-xs font-mono font-medium text-slate-600">
                            {normalizeISODate(leave.dateRange?.startDate)} →{' '}
                            {normalizeISODate(leave.dateRange?.endDate)}
                          </span>
                        </div>

                        <p className="text-xs font-medium text-slate-800 pt-1">
                          <span className="font-semibold text-slate-900">Reason:</span>{' '}
                          {leave.reason}
                        </p>

                        {leave.reviewRemarks && (
                          <div className="mt-1 text-xs bg-slate-50 border border-slate-200/80 rounded-md p-2 text-slate-700">
                            <span className="font-semibold text-slate-900 block mb-0.5">
                              Faculty Remarks:
                            </span>
                            <p className="italic text-slate-600">{leave.reviewRemarks}</p>
                          </div>
                        )}
                      </div>

                      <div className="text-right sm:shrink-0 text-xs text-slate-500">
                        {approverName && (
                          <p className="flex items-center justify-end gap-1 text-slate-700 font-medium">
                            <UserCheck className="w-3.5 h-3.5 text-[#2F7C7A]" />
                            Reviewed by: <span className="font-bold">{approverName}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
              <Info className="w-4 h-4 text-slate-400" />
              <span>You have not applied for leave on this date. Click &quot;Apply for this Date&quot; to submit a new application.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
