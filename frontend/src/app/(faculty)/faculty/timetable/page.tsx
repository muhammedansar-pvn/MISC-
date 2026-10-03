'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getFacultyMyTimetable } from '@/services/faculty.service';
import { FacultyTimetableEntry } from '@/types';
import {
  Clock,
  Calendar,
  Building2,
  BookOpen,
  CalendarCheck,
  ArrowLeft,
  CalendarDays,
} from 'lucide-react';

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function FacultyTimetablePage() {
  const [timetable, setTimetable] = useState<FacultyTimetableEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<string>('MONDAY');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');

  useEffect(() => {
    async function loadTimetable() {
      try {
        setLoading(true);
        const res = await getFacultyMyTimetable();
        if (res.success && Array.isArray(res.data)) {
          setTimetable(res.data);
        }

        // Set default selected day to today
        const DAYS_MAP = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const todayDay = DAYS_MAP[new Date().getDay()];
        if (DAYS_OF_WEEK.includes(todayDay)) {
          setSelectedDay(todayDay);
        }
      } catch (err) {
        console.error('Failed to load faculty timetable:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTimetable();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-14 bg-slate-200/70 animate-pulse rounded-xl" />
        <div className="h-96 bg-slate-200/70 animate-pulse rounded-2xl" />
      </div>
    );
  }

  // Filter for single day view
  const dayEntries = timetable
    .filter((entry) => entry.dayOfWeek === selectedDay)
    .sort((a, b) => a.periodNumber - b.periodNumber);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/faculty" className="hover:text-[#23804A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Faculty Timetable</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#171D19] flex items-center gap-2">
            <Clock className="w-7 h-7 text-[#23804A]" />
            Weekly Teaching Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            7-period weekly schedule across assigned classes and subject modules.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {/* View mode toggle */}
          <div className="inline-flex rounded-xl bg-white border border-slate-200 p-1 shadow-2xs">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'week'
                  ? 'bg-[#23804A] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly Matrix
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'day'
                  ? 'bg-[#23804A] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily View
            </button>
          </div>

          <Link
            href="/faculty"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#23804A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Dashboard
          </Link>
        </div>
      </div>

      {timetable.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E3EAE5] space-y-4 shadow-xs">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold font-serif text-[#171D19]">No Timetable Allocations Found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Your schedule does not have any active period allocations yet. Timetable sessions are configured by the institution administrator.
          </p>
        </div>
      ) : viewMode === 'day' ? (
        /* Daily List View */
        <div className="space-y-6">
          {/* Day Selector Pills */}
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const active = selectedDay === day;
              const countForDay = timetable.filter((t) => t.dayOfWeek === day).length;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center space-x-2 ${
                    active
                      ? 'bg-[#23804A] text-white border-[#23804A] shadow-sm shadow-[#23804A]/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{day}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {countForDay}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Day's Periods */}
          {dayEntries.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
              No classes scheduled on {selectedDay}.
            </div>
          ) : (
            <div className="space-y-3">
              {dayEntries.map((period) => (
                <div
                  key={period._id}
                  className="bg-white rounded-xl border border-[#E3EAE5] p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#23804A] transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-200 text-[#23804A] font-bold text-sm flex items-center justify-center font-mono shrink-0">
                      P{period.periodNumber}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#171D19]">
                        {period.subjectId?.name || period.subjectId?.subjectName || 'Subject Paper'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="flex items-center space-x-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Class: <strong className="text-slate-700">{period.classId?.name}</strong></span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono">{period.startTime} - {period.endTime}</span>
                        </span>
                        {period.roomNumber && (
                          <span>Room: <strong className="text-slate-700">{period.roomNumber}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/faculty/attendance?classId=${period.classId?._id}&subjectId=${period.subjectId?._id}&period=${period.periodNumber}`}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#23804A] hover:bg-[#1B6F41] text-white text-xs font-semibold shadow-2xs transition-all self-end sm:self-auto"
                  >
                    <CalendarCheck className="w-3.5 h-3.5 mr-1.5" /> Mark Period {period.periodNumber}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Weekly Matrix View */
        <div className="bg-white rounded-2xl border border-[#E3EAE5] shadow-2xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-28">Day</th>
                {[1, 2, 3, 4, 5, 6, 7].map((pNum) => (
                  <th key={pNum} className="py-3 px-3 text-center">
                    Period {pNum}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DAYS_OF_WEEK.map((day) => {
                const dayPeriods = timetable.filter((t) => t.dayOfWeek === day);

                return (
                  <tr key={day} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800 bg-slate-50/50 border-r border-slate-200">
                      {day}
                    </td>

                    {[1, 2, 3, 4, 5, 6, 7].map((pNum) => {
                      const entry = dayPeriods.find((e) => e.periodNumber === pNum);

                      return (
                        <td key={pNum} className="py-3 px-2 border-r border-slate-100 last:border-r-0 align-top">
                          {entry ? (
                            <div className="bg-green-50/80 border border-green-200/80 rounded-lg p-2.5 space-y-1 group hover:border-[#23804A] transition-all">
                              <p className="font-bold text-[11px] text-[#171D19] truncate" title={entry.subjectId?.name || ''}>
                                {entry.subjectId?.name || entry.subjectId?.subjectName || 'Subject'}
                              </p>
                              <p className="text-[10px] text-green-800 font-semibold truncate">
                                {entry.classId?.name}
                              </p>
                              <p className="text-[9px] font-mono text-slate-500">
                                {entry.startTime}-{entry.endTime}
                              </p>
                              <div className="pt-1">
                                <Link
                                  href={`/faculty/attendance?classId=${entry.classId?._id}&subjectId=${entry.subjectId?._id}&period=${entry.periodNumber}`}
                                  className="text-[10px] text-[#23804A] font-bold hover:underline flex items-center"
                                >
                                  Mark &rarr;
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <div className="h-16 rounded-lg bg-slate-50/40 border border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-[10px]">
                              -
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
