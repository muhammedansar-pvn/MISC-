'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Layers,
  BookOpen,
  FileText,
  Clock,
  Plus,
  RefreshCw,
  AlertCircle,
  Edit3,
  Trash2,
  X,
  Filter,
  UserCheck,
  Building2,
  CalendarDays,
} from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import {
  getAcademicYears,
  getClasses,
  getSubjects,
} from '@/services/academic.service';
import { getFacultyMembers } from '@/services/faculty.service';
import {
  getTimetables,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
} from '@/services/timetable.service';
import {
  AcademicYear,
  ClassModel,
  Subject,
  FacultyProfile,
  TimetableEntry,
  TimetablePayload,
  DayOfWeek,
} from '@/types';

const DAYS: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

const DEFAULT_TIMINGS: Record<number, { start: string; end: string }> = {
  1: { start: '08:30', end: '09:15' },
  2: { start: '09:15', end: '10:00' },
  3: { start: '10:15', end: '11:00' },
  4: { start: '11:00', end: '11:45' },
  5: { start: '11:45', end: '12:30' },
  6: { start: '13:30', end: '14:15' },
  7: { start: '14:15', end: '15:00' },
};

interface TimetableManagerProps {
  standalone?: boolean;
}

export default function TimetableManager({ standalone = true }: TimetableManagerProps) {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classesList, setClassesList] = useState<ClassModel[]>([]);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyProfile[]>([]);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);

  // Filters
  const [selectedYearId, setSelectedYearId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDayFilter, setSelectedDayFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimetableEntry | null>(null);
  const [formData, setFormData] = useState<TimetablePayload>({
    academicYearId: '',
    classId: '',
    dayOfWeek: 'MONDAY',
    periodNumber: 1,
    startTime: '08:30',
    endTime: '09:15',
    subjectId: '',
    facultyId: '',
    room: '',
    status: 'ACTIVE',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load Reference Data
  useEffect(() => {
    const loadReferences = async () => {
      setLoading(true);
      setError('');
      try {
        const [yearsRes, classesRes, subjectsRes, facultyRes] = await Promise.all([
          getAcademicYears().catch(() => ({ success: false, data: [] })),
          getClasses().catch(() => ({ success: false, data: [] })),
          getSubjects().catch(() => ({ success: false, data: [] })),
          getFacultyMembers().catch(() => ({ success: false, data: [] })),
        ]);

        const years = yearsRes.data || [];
        const classes = classesRes.data || [];
        setAcademicYears(years);
        setClassesList(classes);
        setSubjectsList(subjectsRes.data || []);
        setFacultyList(facultyRes.data || []);

        // Default selections
        if (years.length > 0 && !selectedYearId) {
          const currentYear = years.find((y) => y.isCurrent) || years[0];
          setSelectedYearId(currentYear._id);
        }
        if (classes.length > 0 && !selectedClassId) {
          setSelectedClassId(classes[0]._id);
        }
      } catch (err: any) {
        console.error('Failed to load references:', err);
        setError('Failed to load reference data.');
      } finally {
        setLoading(false);
      }
    };

    loadReferences();
  }, []);

  // Fetch Timetable Entries when Class or Year changes
  const fetchEntries = async () => {
    if (!selectedClassId) {
      setEntries([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const params: any = { classId: selectedClassId };
      if (selectedYearId) params.academicYearId = selectedYearId;
      const res = await getTimetables(params);
      setEntries(res.data || []);
    } catch (err: any) {
      console.error('Failed to load timetable entries:', err);
      setError('Failed to load timetable records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchEntries();
    }
  }, [selectedClassId, selectedYearId]);

  const handleOpenModal = (entry: TimetableEntry | null = null, defaultDay?: DayOfWeek, defaultPeriod?: number) => {
    setEditingItem(entry);
    setFormError('');

    const initialPeriod = entry?.periodNumber || defaultPeriod || 1;
    const defaultTiming = DEFAULT_TIMINGS[initialPeriod] || { start: '08:30', end: '09:15' };

    setFormData({
      academicYearId: (entry?.academicYearId as any)?._id || (entry?.academicYearId as string) || selectedYearId || academicYears[0]?._id || '',
      classId: (entry?.classId as any)?._id || (entry?.classId as string) || selectedClassId || classesList[0]?._id || '',
      dayOfWeek: entry?.dayOfWeek || defaultDay || 'MONDAY',
      periodNumber: initialPeriod,
      startTime: entry?.startTime || defaultTiming.start,
      endTime: entry?.endTime || defaultTiming.end,
      subjectId: (entry?.subjectId as any)?._id || (entry?.subjectId as string) || subjectsList[0]?._id || '',
      facultyId: (entry?.facultyId as any)?._id || (entry?.facultyId as string) || facultyList[0]?._id || '',
      room: entry?.room || '',
      status: entry?.status || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handlePeriodChange = (periodNum: number) => {
    const defaultTiming = DEFAULT_TIMINGS[periodNum] || { start: '08:30', end: '09:15' };
    setFormData((prev) => ({
      ...prev,
      periodNumber: periodNum,
      startTime: prev.startTime || defaultTiming.start,
      endTime: prev.endTime || defaultTiming.end,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.academicYearId) {
      setFormError('Academic Year is required.');
      return;
    }
    if (!formData.classId) {
      setFormError('Class is required.');
      return;
    }
    if (!formData.subjectId) {
      setFormError('Subject is required.');
      return;
    }
    if (!formData.facultyId) {
      setFormError('Faculty is required.');
      return;
    }

    setFormLoading(true);
    try {
      if (editingItem) {
        await updateTimetableEntry(editingItem._id, formData);
      } else {
        await createTimetableEntry(formData);
      }
      setFormLoading(false);
      setIsModalOpen(false);
      fetchEntries();
    } catch (err: any) {
      setFormLoading(false);
      setFormError(err.response?.data?.message || err.message || 'Failed to save timetable entry.');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this period entry?')) return;
    setDeleteLoading(true);
    try {
      await deleteTimetableEntry(id);
      fetchEntries();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete timetable entry.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered Entries
  const filteredEntries = useMemo(() => {
    if (!selectedDayFilter) return entries;
    return entries.filter((e) => e.dayOfWeek === selectedDayFilter);
  }, [entries, selectedDayFilter]);

  // Group by Day for Weekly view
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
    return map;
  }, [entries]);

  const selectedClass = classesList.find((c) => c._id === selectedClassId);

  return (
    <div className="space-y-6">
      {/* Standalone Header */}
      {standalone && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs">
            <div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
                <Link href="/admin" className="hover:text-[#2F7C7A] transition-colors">
                  Dashboard
                </Link>
                <span>/</span>
                <Link href="/admin/academic" className="hover:text-[#2F7C7A] transition-colors">
                  Academic Management
                </Link>
                <span>/</span>
                <span className="text-slate-900 font-semibold">Timetable</span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-[#132238]">Class Timetable Management</h1>
              <p className="text-sm text-slate-500 mt-1">
                Configure weekly period sessions, session timings, subject assignments, and faculty allocations across classes.
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              disabled={!selectedClassId}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361] cursor-pointer transition-all shadow-xs disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Period Entry
            </button>
          </div>

          {/* Academic Modules Navigation Tabs */}
          <div className="flex space-x-2 border-b border-[#E2E8E0] pb-1 overflow-x-auto">
            <Link
              href="/admin/academic"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all bg-white text-slate-600 hover:bg-slate-100 border border-[#E2E8E0] whitespace-nowrap"
            >
              <Calendar className="w-4 h-4" />
              <span>Academic Years</span>
            </Link>
            <Link
              href="/admin/academic?tab=classes"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all bg-white text-slate-600 hover:bg-slate-100 border border-[#E2E8E0] whitespace-nowrap"
            >
              <Layers className="w-4 h-4" />
              <span>Classes</span>
            </Link>
            <Link
              href="/admin/academic?tab=subjects"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all bg-white text-slate-600 hover:bg-slate-100 border border-[#E2E8E0] whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4" />
              <span>Subjects</span>
            </Link>
            <Link
              href="/admin/academic/syllabus"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all bg-white text-slate-600 hover:bg-slate-100 border border-[#E2E8E0] whitespace-nowrap"
            >
              <FileText className="w-4 h-4" />
              <span>Syllabus</span>
            </Link>
            <div className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all bg-[#2F7C7A] text-white shadow-xs whitespace-nowrap">
              <Clock className="w-4 h-4" />
              <span>Class Timetable</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white">
                {entries.length}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8E0] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Select Class & Schedule Filters
          </span>
          {selectedDayFilter && (
            <button
              onClick={() => setSelectedDayFilter('')}
              className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
            >
              Show all days
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Academic Year</label>
            <select
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2F7C7A] bg-white font-medium text-slate-800"
            >
              <option value="">All Academic Years</option>
              {academicYears.map((ay) => (
                <option key={ay._id} value={ay._id}>
                  {ay.yearName} ({ay.yearCode}) {ay.isCurrent ? '• Current' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Select Class *</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2F7C7A] bg-white font-bold text-slate-900"
            >
              <option value="">Select a Class to manage timetable</option>
              {classesList.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Filter by Day</label>
            <select
              value={selectedDayFilter}
              onChange={(e) => setSelectedDayFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2F7C7A] bg-white font-medium text-slate-800"
            >
              <option value="">All Days (Mon - Sun)</option>
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading timetable entries...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              onClick={fetchEntries}
              className="px-4 py-2 bg-[#2F7C7A] text-white font-bold text-xs rounded-lg uppercase cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 mr-2 inline" /> Retry
            </button>
          </div>
        ) : !selectedClassId ? (
          <div className="p-12 text-center space-y-2">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No class selected</p>
            <p className="text-xs text-slate-400">Please select a class from the dropdown above to view and manage its timetable.</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No timetable entries published</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              There are no period entries registered for {selectedClass?.name || 'this class'}
              {selectedDayFilter ? ` on ${selectedDayFilter}` : ''}.
            </p>
            <button
              onClick={() => handleOpenModal(null, selectedDayFilter ? (selectedDayFilter as DayOfWeek) : 'MONDAY')}
              className="inline-flex items-center px-4 py-2 bg-[#2F7C7A] text-white text-xs font-bold rounded-xl uppercase tracking-wider hover:bg-[#256361] cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add First Period
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="px-5 py-4">Day</th>
                  <th className="px-5 py-4">Period</th>
                  <th className="px-5 py-4">Timing</th>
                  <th className="px-5 py-4">Subject</th>
                  <th className="px-5 py-4">Faculty / Usthad</th>
                  <th className="px-5 py-4">Room</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {filteredEntries.map((entry) => {
                  const subject = entry.subjectId as any;
                  const faculty = entry.facultyId as any;
                  return (
                    <tr key={entry._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800">
                          {entry.dayOfWeek}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900 font-mono text-xs">
                          Period {entry.periodNumber}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
                        {entry.startTime} - {entry.endTime}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-[#132238]">
                          {subject?.subjectName || subject?.name || 'Unassigned'}
                        </span>
                        {(subject?.subjectCode || subject?.code) && (
                          <span className="block text-[11px] font-mono text-slate-400">
                            {subject.subjectCode || subject.code}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-800">
                          {faculty?.nameEnglish || faculty?.name || 'Unassigned'}
                        </span>
                        {faculty?.nameArabic && (
                          <span className="block text-xs font-arabic text-slate-500" dir="rtl">
                            {faculty.nameArabic}
                          </span>
                        )}
                        {faculty?.designation && (
                          <span className="block text-[11px] text-slate-400">
                            {faculty.designation}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600">
                        {entry.room ? (
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-medium text-slate-700">
                            {entry.room}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not set</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={entry.status} />
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleOpenModal(entry)}
                          className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry._id)}
                          disabled={deleteLoading}
                          className="px-2.5 py-1.5 border border-rose-200 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Period Entry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-[#E2E8E0] p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#132238]">
                  {editingItem ? 'Edit Timetable Period' : 'Add Timetable Period'}
                </h3>
                <p className="text-xs text-slate-500">
                  Assign a subject, teacher, and session timing for {selectedClass?.name || 'this class'}.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Academic Year *</label>
                  <select
                    required
                    value={formData.academicYearId}
                    onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
                  >
                    <option value="">Select Year</option>
                    {academicYears.map((ay) => (
                      <option key={ay._id} value={ay._id}>
                        {ay.yearName} ({ay.yearCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Class *</label>
                  <select
                    required
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
                  >
                    <option value="">Select Class</option>
                    {classesList.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} ({cls.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Day of Week *</label>
                  <select
                    required
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value as DayOfWeek })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2F7C7A] font-semibold"
                  >
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Period Number (1-7) *</label>
                  <select
                    required
                    value={formData.periodNumber}
                    onChange={(e) => handlePeriodChange(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2F7C7A] font-mono font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <option key={num} value={num}>
                        Period {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Start Time *</label>
                  <input
                    type="text"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="08:30"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">End Time *</label>
                  <input
                    type="text"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    placeholder="09:15"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Subject *</label>
                <select
                  required
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
                >
                  <option value="">Select Subject</option>
                  {subjectsList.map((sbj: any) => (
                    <option key={sbj._id} value={sbj._id}>
                      {sbj.subjectName || sbj.name} ({sbj.subjectCode || sbj.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Faculty / Teacher *</label>
                <select
                  required
                  value={formData.facultyId}
                  onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
                >
                  <option value="">Select Faculty</option>
                  {facultyList.map((fac: any) => (
                    <option key={fac._id} value={fac._id}>
                      {fac.nameEnglish || fac.name} {fac.designation ? `(${fac.designation})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Room / Hall (Optional)</label>
                  <input
                    type="text"
                    value={formData.room || ''}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="e.g. Hall 1, Room 204"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Status</label>
                  <select
                    value={formData.status || 'ACTIVE'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold cursor-pointer text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-[#2F7C7A] text-white rounded-xl text-xs font-bold uppercase cursor-pointer hover:bg-[#256361] disabled:opacity-50 transition-colors shadow-xs"
                >
                  {formLoading ? 'Saving...' : editingItem ? 'Update Period' : 'Create Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
