'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  Calendar,
  CalendarDays,
  GraduationCap,
  BookOpen,
  UserCheck,
  Building2,
  AlertCircle,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getMyTimetable } from '@/services/timetable.service';
import { StudentTimetableData, TimetableEntry, DayOfWeek } from '@/types';

const WEEKDAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'SATURDAY', label: 'Saturday', short: 'Sat' },
  { key: 'SUNDAY', label: 'Sunday', short: 'Sun' },
  { key: 'MONDAY', label: 'Monday', short: 'Mon' },
  { key: 'TUESDAY', label: 'Tuesday', short: 'Tue' },
  { key: 'WEDNESDAY', label: 'Wednesday', short: 'Wed' },
  { key: 'THURSDAY', label: 'Thursday', short: 'Thu' },
];

const getTodayKey = (): DayOfWeek => {
  const dayIndex = new Date().getDay();
  // 0 is Sunday, 1 is Monday ... 6 is Saturday
  const map: Record<number, DayOfWeek> = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY',
  };
  return map[dayIndex] || 'SATURDAY';
};

export default function StudentTimetablePage() {
  const [data, setData] = useState<StudentTimetableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'today' | 'weekly'>('today');
  const [selectedWeeklyDay, setSelectedWeeklyDay] = useState<DayOfWeek>(getTodayKey() === 'FRIDAY' ? 'SATURDAY' : getTodayKey());

  const todayKey = getTodayKey();

  useEffect(() => {
    async function loadTimetable() {
      try {
        setLoading(true);
        setError('');
        const res = await getMyTimetable();
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(res.message || 'Unable to retrieve your timetable');
        }
      } catch (err: any) {
        console.error('Failed to load student timetable:', err);
        setError('Failed to load your class timetable. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadTimetable();
  }, []);

  const entries = data?.entries || [];

  // Group entries by Day
  const entriesByDay = useMemo(() => {
    const map: Record<DayOfWeek, TimetableEntry[]> = {
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
      SATURDAY: [],
      SUNDAY: [],
    };
    entries.forEach((e) => {
      if (map[e.dayOfWeek]) {
        map[e.dayOfWeek].push(e);
      }
    });
    // Sort each day by periodNumber
    Object.keys(map).forEach((d) => {
      map[d as DayOfWeek].sort((a, b) => a.periodNumber - b.periodNumber);
    });
    return map;
  }, [entries]);

  const todayEntries = entriesByDay[todayKey] || [];
  const selectedDayEntries = entriesByDay[selectedWeeklyDay] || [];

  // Determine current active period for today
  const currentPeriodNumber = useMemo(() => {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    for (const entry of todayEntries) {
      if (!entry.startTime || !entry.endTime) continue;
      const [startH, startM] = entry.startTime.split(':').map((n) => parseInt(n, 10));
      const [endH, endM] = entry.endTime.split(':').map((n) => parseInt(n, 10));
      if (isNaN(startH) || isNaN(endH)) continue;
      const startTotal = startH * 60 + (startM || 0);
      const endTotal = endH * 60 + (endM || 0);

      if (currentMins >= startTotal && currentMins <= endTotal) {
        return entry.periodNumber;
      }
    }
    return null;
  }, [todayEntries]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-12 bg-slate-200/70 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-slate-200/70 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E3EAE5] shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/student" className="hover:text-[#23804A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Class Timetable</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171D19]">Class Timetable</h1>
          <p className="text-xs text-slate-500 mt-1">
            View your daily period sessions, timings, assigned subjects, and faculty details.
          </p>
        </div>

        {/* Enrolled Class & Year Info */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {data?.class && (
            <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-[#EAF2EC] text-[#23804A] text-xs font-bold gap-1.5 shadow-2xs">
              <GraduationCap className="w-4 h-4" />
              <span>{data.class.name || data.class.code}</span>
            </span>
          )}
          {data?.academicYear && (
            <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{data.academicYear.yearName || data.academicYear.yearCode}</span>
            </span>
          )}
        </div>
      </div>

      {/* View Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E3EAE5] shadow-xs">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setViewMode('today')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'today'
                ? 'bg-white text-[#23804A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Today&apos;s Schedule</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-mono font-bold uppercase">
              {todayKey.slice(0, 3)}
            </span>
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'weekly'
                ? 'bg-white text-[#23804A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Weekly Timetable</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium px-2">
          Sanaviyya Unified Curriculum • 7 Daily Sessions
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State: No timetable at all */}
      {entries.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E3EAE5] shadow-xs text-center space-y-3">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-800">
            No timetable has been published for your class yet.
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your class schedule is currently being finalized by the administration. Please check back soon or consult your Usthad.
          </p>
        </div>
      ) : viewMode === 'today' ? (
        /* ================= TODAY VIEW ================= */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#23804A] animate-pulse" />
              <h2 className="text-base font-bold text-[#171D19]">
                Today&apos;s Sessions — {todayKey}
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {todayEntries.length} {todayEntries.length === 1 ? 'Period' : 'Periods'} Scheduled
            </span>
          </div>

          {todayKey === 'FRIDAY' || todayEntries.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-[#E3EAE5] shadow-xs text-center space-y-2">
              <Sparkles className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-bold text-sm text-slate-800">No classes scheduled for today!</p>
              <p className="text-xs text-slate-500">
                Today is {todayKey}. Switch to the Weekly Timetable tab to review your upcoming schedule.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayEntries.map((period) => {
                const subject = period.subjectId as any;
                const faculty = period.facultyId as any;
                const isCurrent = currentPeriodNumber === period.periodNumber;

                return (
                  <div
                    key={period._id}
                    className={`bg-white rounded-2xl p-5 border transition-all ${
                      isCurrent
                        ? 'border-[#23804A] ring-2 ring-[#23804A]/20 shadow-md'
                        : 'border-[#E3EAE5] shadow-2xs hover:shadow-sm'
                    } space-y-3`}
                  >
                    {/* Header: Period & Time */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          Period {period.periodNumber}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Ongoing Now
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-xs font-semibold text-[#23804A]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{period.startTime} - {period.endTime}</span>
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <h3 className="font-bold text-base text-[#171D19] leading-tight">
                        {subject?.subjectName || subject?.name || 'Subject'}
                      </h3>
                      {(subject?.subjectCode || subject?.code) && (
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {subject.subjectCode || subject.code} • {subject.category || 'Curriculum'}
                        </p>
                      )}
                    </div>

                    {/* Faculty / Usthad */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-[#EAF2EC] text-[#23804A] flex items-center justify-center shrink-0">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">
                            {faculty?.nameEnglish || faculty?.name || 'Usthad / Teacher'}
                          </p>
                          {faculty?.nameArabic && (
                            <p className="text-[11px] font-arabic text-slate-500 truncate" dir="rtl">
                              {faculty.nameArabic}
                            </p>
                          )}
                        </div>
                      </div>

                      {period.room && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-medium shrink-0">
                          {period.room}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ================= WEEKLY VIEW ================= */
        <div className="space-y-5">
          {/* Day Selector Buttons for Mobile / Tablet */}
          <div className="flex space-x-2 overflow-x-auto pb-1">
            {WEEKDAYS.map(({ key, label, short }) => {
              const count = (entriesByDay[key] || []).length;
              const isSelected = selectedWeeklyDay === key;
              const isToday = todayKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedWeeklyDay(key)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#23804A] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#E3EAE5]'
                  }`}
                >
                  <span>{label}</span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Day Timetable List */}
          <div className="bg-white rounded-2xl border border-[#E3EAE5] shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#171D19]">
                  {selectedWeeklyDay} Schedule
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedDayEntries.length} {selectedDayEntries.length === 1 ? 'period' : 'periods'} scheduled for {selectedWeeklyDay.toLowerCase()}.
                </p>
              </div>
              {todayKey === selectedWeeklyDay && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Today
                </span>
              )}
            </div>

            {selectedDayEntries.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">No periods scheduled on {selectedWeeklyDay}</p>
                <p className="text-[11px] text-slate-400">Classes for this day are either off or not yet assigned.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEntries.map((period) => {
                  const subject = period.subjectId as any;
                  const faculty = period.facultyId as any;
                  return (
                    <div
                      key={period._id}
                      className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start sm:items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Slot</span>
                          <span className="text-base font-bold text-[#171D19] font-mono leading-none">
                            {period.periodNumber}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-sm text-[#171D19]">
                              {subject?.subjectName || subject?.name || 'Subject'}
                            </h4>
                            {(subject?.subjectCode || subject?.code) && (
                              <span className="text-[11px] font-mono font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {subject.subjectCode || subject.code}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500 mt-1">
                            <span className="font-semibold text-slate-700">
                              {faculty?.nameEnglish || faculty?.name || 'Usthad / Teacher'}
                            </span>
                            {period.room && (
                              <span>• Room: <strong className="text-slate-700">{period.room}</strong></span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                        <Clock className="w-3.5 h-3.5 text-[#23804A]" />
                        <span className="text-xs font-bold text-slate-800">
                          {period.startTime} - {period.endTime}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
