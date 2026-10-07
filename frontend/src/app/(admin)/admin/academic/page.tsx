'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  Layers,
  FileText,
  Clock,
  Plus,
  RefreshCw,
  AlertCircle,
  Edit3,
  X,
  UserCheck,
} from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import SyllabusManager from '@/components/admin/academic/SyllabusManager';
import FacultyAssignmentsManager from '@/components/admin/academic/FacultyAssignmentsManager';
import {
  getAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  getClasses,
  createClass,
  updateClass,
  getSubjects,
  createSubject,
  updateSubject,
} from '@/services/academic.service';
import { AcademicYear, ClassModel, Subject } from '@/types';

type AcademicTab = 'academic-years' | 'classes' | 'subjects' | 'faculty-assignments' | 'syllabuses';

function AdminAcademicContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');

  const [activeTab, setActiveTab] = useState<AcademicTab>('academic-years');

  // Datasets
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classesList, setClassesList] = useState<ClassModel[]>([]);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [subjectClassFilter, setSubjectClassFilter] = useState<string>('ALL');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals & Forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Sync tab with URL search parameter
  useEffect(() => {
    if (tabParam === 'classes') {
      setActiveTab('classes');
    } else if (tabParam === 'subjects') {
      setActiveTab('subjects');
    } else if (tabParam === 'faculty-assignments') {
      setActiveTab('faculty-assignments');
    } else if (tabParam === 'syllabuses') {
      router.replace('/admin/academic/syllabus');
    } else if (tabParam === 'academic-years') {
      setActiveTab('academic-years');
    }
  }, [tabParam, router]);

  const fetchAllAcademicData = async () => {
    setLoading(true);
    setError('');
    try {
      const [ayRes, clsRes, sbjRes] = await Promise.all([
        getAcademicYears().catch(() => ({ success: false, data: [] })),
        getClasses().catch(() => ({ success: false, data: [] })),
        getSubjects().catch(() => ({ success: false, data: [] })),
      ]);

      setAcademicYears(ayRes.data || []);
      setClassesList(clsRes.data || []);
      setSubjectsList(sbjRes.data || []);
    } catch (err: any) {
      console.error('Failed to load academic datasets:', err);
      setError('Failed to retrieve academic management records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAcademicData();
  }, []);

  const handleTabChange = (tabId: AcademicTab) => {
    if (tabId === 'syllabuses') {
      router.push('/admin/academic/syllabus');
      return;
    }
    setActiveTab(tabId);
    if (tabId === 'academic-years') {
      router.replace('/admin/academic');
    } else {
      router.replace(`/admin/academic?tab=${tabId}`);
    }
  };

  const handleOpenModal = (item: any = null) => {
    setEditingItem(item);
    setFormError('');

    if (activeTab === 'academic-years') {
      setFormData({
        yearName: item?.yearName || '',
        yearCode: item?.yearCode || '',
        startDate: item?.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
        endDate: item?.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
        isCurrent: item?.isCurrent || false,
        status: item?.status || 'ACTIVE',
      });
    } else if (activeTab === 'classes') {
      setFormData({
        name: item?.name || '',
        code: item?.code || '',
        department: item?.department || 'General',
        academicYearId: item?.academicYearId?._id || item?.academicYearId || (academicYears[0]?._id || ''),
        workingDays: item?.workingDays && item.workingDays.length > 0
          ? item.workingDays
          : ['SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'],
        status: item?.status || 'ACTIVE',
      });
    } else if (activeTab === 'subjects') {
      const assignedClasses = (item?.classes || []).map((c: any) => c?._id || c);
      setFormData({
        subjectName: item?.subjectName || item?.name || '',
        subjectCode: item?.subjectCode || item?.code || '',
        category: item?.category || 'GENERAL',
        description: item?.description || '',
        classes: assignedClasses,
        status: item?.status || 'ACTIVE',
      });
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (activeTab === 'academic-years') {
        if (editingItem) await updateAcademicYear(editingItem._id, formData);
        else await createAcademicYear(formData);
      } else if (activeTab === 'classes') {
        if (editingItem) await updateClass(editingItem._id, formData);
        else await createClass(formData);
      } else if (activeTab === 'subjects') {
        if (editingItem) await updateSubject(editingItem._id, formData);
        else await createSubject(formData);
      }

      setFormLoading(false);
      setIsModalOpen(false);
      fetchAllAcademicData();
    } catch (err: any) {
      setFormLoading(false);
      setFormError(err.response?.data?.message || err.message || 'Operation failed. Please check form inputs.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E3EAE5] shadow-xs">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#171D19]">Academic Curriculum & Setup</h1>
          <p className="text-sm text-slate-500 mt-1">Configure Academic Years, Classes, Subjects, and Syllabuses for Markaz Sanaviyya</p>
        </div>
        {activeTab !== 'syllabuses' && activeTab !== 'faculty-assignments' && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-[#23804A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#1B6F41] cursor-pointer transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 mr-2" /> Add {activeTab === 'academic-years' ? 'Academic Year' : activeTab === 'classes' ? 'Class' : 'Subject'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-[#E3EAE5] pb-1 overflow-x-auto">
        {[
          { id: 'academic-years' as AcademicTab, label: 'Academic Years', icon: Calendar, count: academicYears.length },
          { id: 'classes' as AcademicTab, label: 'Classes', icon: Layers, count: classesList.length },
          { id: 'subjects' as AcademicTab, label: 'Subjects', icon: BookOpen, count: subjectsList.length },
          { id: 'faculty-assignments' as AcademicTab, label: 'Faculty Assignments', icon: UserCheck, count: null },
          { id: 'syllabuses' as AcademicTab, label: 'Syllabuses', icon: FileText, count: null },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-[#23804A] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#E3EAE5]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
        <Link
          href="/admin/academic/timetable"
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all bg-white text-slate-600 hover:bg-slate-100 border border-[#E3EAE5] whitespace-nowrap"
        >
          <Clock className="w-4 h-4" />
          <span>Class Timetable</span>
        </Link>
      </div>

      {/* Content Area */}
      {activeTab === 'syllabuses' ? (
        <SyllabusManager
          standalone={false}
          preloadedYears={academicYears}
          preloadedClasses={classesList}
          preloadedSubjects={subjectsList}
        />
      ) : activeTab === 'faculty-assignments' ? (
        <FacultyAssignmentsManager
          preloadedYears={academicYears}
          preloadedClasses={classesList}
          preloadedSubjects={subjectsList}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-[#E3EAE5] shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-[#23804A] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600">Loading academic records...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <p className="text-sm font-semibold text-rose-700">{error}</p>
              <button onClick={fetchAllAcademicData} className="px-4 py-2 bg-[#23804A] text-white font-bold text-xs rounded-lg uppercase cursor-pointer">
                <RefreshCw className="w-4 h-4 mr-2 inline" /> Retry
              </button>
            </div>
          ) : activeTab === 'academic-years' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FBFCFB] text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                  <tr>
                    <th className="px-6 py-4">Year Name</th>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Current Active</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3EAE5]">
                  {academicYears.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No academic years found.</td>
                    </tr>
                  ) : (
                    academicYears.map((ay) => (
                      <tr key={ay._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-[#171D19]">{ay.yearName}</td>
                        <td className="px-6 py-4 font-mono text-slate-600">{ay.yearCode}</td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {ay.startDate ? new Date(ay.startDate).toLocaleDateString() : 'N/A'} - {ay.endDate ? new Date(ay.endDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          {ay.isCurrent ? (
                            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
                              CURRENT YEAR
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={ay.status} /></td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleOpenModal(ay)} className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                            <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'classes' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FBFCFB] text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                  <tr>
                    <th className="px-6 py-4">Class Name</th>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Academic Year</th>
                    <th className="px-6 py-4">Working Days</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3EAE5]">
                  {classesList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-400">No classes registered yet.</td>
                    </tr>
                  ) : (
                    classesList.map((cls: any) => (
                      <tr key={cls._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-[#171D19]">{cls.name}</td>
                        <td className="px-6 py-4 font-mono text-slate-600">{cls.code}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-50 text-green-800 border border-green-200">
                            {cls.department || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {cls.academicYearId?.yearName || cls.academicYearId?.yearCode || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {['SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].map((day) => {
                              const activeDays: string[] = cls.workingDays && cls.workingDays.length > 0
                                ? cls.workingDays
                                : ['SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'];
                              const isScheduled = activeDays.includes(day);
                              return (
                                <span
                                  key={day}
                                  title={isScheduled ? `${day}: Scheduled` : `${day}: Off`}
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    isScheduled
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-400 border border-slate-200 line-through opacity-60'
                                  }`}
                                >
                                  {day.slice(0, 3)}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={cls.status} /></td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleOpenModal(cls)} className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                            <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div>
              {/* Subjects Header / Filter Bar */}
              <div className="p-4 border-b border-[#E3EAE5] bg-[#FBFCFB] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-[#23804A]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Filter by Class:</span>
                  <select
                    value={subjectClassFilter}
                    onChange={(e) => setSubjectClassFilter(e.target.value)}
                    className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#23804A]"
                  >
                    <option value="ALL">All Classes ({subjectsList.length})</option>
                    {classesList.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} ({cls.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-xs text-slate-500">
                  Showing{' '}
                  <span className="font-bold text-slate-800">
                    {
                      subjectsList.filter((sbj: any) => {
                        if (subjectClassFilter === 'ALL') return true;
                        const cList = (sbj.classes || []).map((c: any) => c?._id || c);
                        return cList.includes(subjectClassFilter);
                      }).length
                    }
                  </span>{' '}
                  of {subjectsList.length} subjects
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FBFCFB] text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                    <tr>
                      <th className="px-6 py-4">Subject Name</th>
                      <th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Class Assignment</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3EAE5]">
                    {subjectsList.filter((sbj: any) => {
                      if (subjectClassFilter === 'ALL') return true;
                      const cList = (sbj.classes || []).map((c: any) => c?._id || c);
                      return cList.includes(subjectClassFilter);
                    }).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                          {subjectClassFilter === 'ALL'
                            ? 'No subjects found.'
                            : 'No subjects assigned to the selected class.'}
                        </td>
                      </tr>
                    ) : (
                      subjectsList
                        .filter((sbj: any) => {
                          if (subjectClassFilter === 'ALL') return true;
                          const cList = (sbj.classes || []).map((c: any) => c?._id || c);
                          return cList.includes(subjectClassFilter);
                        })
                        .map((sbj: any) => (
                          <tr key={sbj._id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-bold text-[#171D19]">
                              {sbj.subjectName || sbj.name}
                            </td>
                            <td className="px-6 py-4 font-mono text-slate-600">
                              {sbj.subjectCode || sbj.code}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-full border">
                                {sbj.category || 'GENERAL'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {sbj.classes && sbj.classes.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                                  {sbj.classes.map((cls: any) => {
                                    const cName = cls?.name || cls?.code || 'Class';
                                    const cCode = cls?.code ? ` (${cls.code})` : '';
                                    return (
                                      <span
                                        key={cls?._id || cls}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                                      >
                                        {cName}{cCode}
                                      </span>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic">No classes assigned</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={sbj.status} />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleOpenModal(sbj)}
                                className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-[#E3EAE5] p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#171D19]">
                {editingItem ? 'Edit Record' : 'Create Record'} ({activeTab === 'academic-years' ? 'Academic Year' : activeTab === 'classes' ? 'Class' : 'Subject'})
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            {formError && <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded">{formError}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {activeTab === 'academic-years' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Year Name *</label>
                    <input type="text" required value={formData.yearName || ''} onChange={(e) => setFormData({ ...formData, yearName: e.target.value })} placeholder="2026-2027" className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Year Code *</label>
                    <input type="text" required value={formData.yearCode || ''} onChange={(e) => setFormData({ ...formData, yearCode: e.target.value })} placeholder="AY2026" className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Start Date *</label>
                      <input type="date" required value={formData.startDate || ''} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">End Date *</label>
                      <input type="date" required value={formData.endDate || ''} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="isCurrent" checked={formData.isCurrent || false} onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })} />
                    <label htmlFor="isCurrent" className="text-xs font-bold uppercase">Set as Current Academic Year</label>
                  </div>
                </>
              )}

              {activeTab === 'classes' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Class Name *</label>
                    <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Standard 10" className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Class Code *</label>
                    <input type="text" required value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="STD-10" className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Department</label>
                    <input
                      type="text"
                      value={formData.department || ''}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Sanaviyya, Shareea, Secondary, General"
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Academic Year *</label>
                    <select
                      required
                      value={formData.academicYearId || ''}
                      onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                    >
                      <option value="">Select Academic Year</option>
                      {academicYears.map((ay) => (
                        <option key={ay._id} value={ay._id}>{ay.yearName} ({ay.yearCode})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5">Scheduled Working Days</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {[
                        { day: 'SATURDAY', label: 'Sat' },
                        { day: 'SUNDAY', label: 'Sun' },
                        { day: 'MONDAY', label: 'Mon' },
                        { day: 'TUESDAY', label: 'Tue' },
                        { day: 'WEDNESDAY', label: 'Wed' },
                        { day: 'THURSDAY', label: 'Thu' },
                        { day: 'FRIDAY', label: 'Fri' },
                      ].map(({ day, label }) => {
                        const currentDays: string[] = formData.workingDays || [
                          'SATURDAY',
                          'SUNDAY',
                          'MONDAY',
                          'TUESDAY',
                          'WEDNESDAY',
                          'THURSDAY',
                        ];
                        const isChecked = currentDays.includes(day);
                        return (
                          <label key={day} className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...currentDays, day]
                                  : currentDays.filter((d) => d !== day);
                                setFormData({ ...formData, workingDays: updated });
                              }}
                              className="rounded text-[#23804A] focus:ring-[#23804A]"
                            />
                            <span>{label}</span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Unchecking a day will disable timetable period allocations for this class on that day.
                    </p>
                  </div>
                </>
              )}

              {activeTab === 'subjects' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Subject Name *</label>
                    <input type="text" required value={formData.subjectName || ''} onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })} placeholder="Arabic Grammar" className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Code *</label>
                      <input type="text" required value={formData.subjectCode || ''} onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })} placeholder="ARB-101" className="w-full px-3 py-2 border rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Category *</label>
                      <select value={formData.category || 'GENERAL'} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                        <option value="ISLAMIC_STUDIES">ISLAMIC_STUDIES</option>
                        <option value="CONTEMPORARY">CONTEMPORARY</option>
                        <option value="LANGUAGE">LANGUAGE</option>
                        <option value="GENERAL">GENERAL</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Description</label>
                    <textarea rows={2} value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Subject curriculum overview..." className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase text-slate-700">
                        Class Assignment (Cohorts)
                      </label>
                      <div className="space-x-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, classes: classesList.map((c) => c._id) })}
                          className="text-[#23804A] font-semibold hover:underline cursor-pointer"
                        >
                          Select All
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, classes: [] })}
                          className="text-slate-500 font-semibold hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Assign which class(es) will study this subject.
                    </p>
                    <div className="max-h-40 overflow-y-auto border border-slate-200 bg-slate-50/50 rounded-xl p-3 grid grid-cols-2 gap-2">
                      {classesList.length === 0 ? (
                        <p className="col-span-2 text-xs text-slate-400 italic">No classes available.</p>
                      ) : (
                        classesList.map((cls) => {
                          const isChecked = (formData.classes || []).includes(cls._id);
                          return (
                            <label
                              key={cls._id}
                              className={`flex items-center space-x-2 text-xs p-2 rounded-lg cursor-pointer border transition-colors ${
                                isChecked
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const current = formData.classes || [];
                                  const updated = e.target.checked
                                    ? [...current, cls._id]
                                    : current.filter((id: string) => id !== cls._id);
                                  setFormData({ ...formData, classes: updated });
                                }}
                                className="rounded text-[#23804A] focus:ring-[#23804A] h-3.5 w-3.5"
                              />
                              <span className="truncate">{cls.name} ({cls.code})</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Status</label>
                <select value={formData.status || 'ACTIVE'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  {activeTab === 'academic-years' && (
                    <>
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-xs font-bold cursor-pointer">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-5 py-2 bg-[#23804A] text-white rounded-lg text-xs font-bold uppercase cursor-pointer">
                  {formLoading ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminAcademicPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#23804A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading academic portal...</p>
        </div>
      }
    >
      <AdminAcademicContent />
    </Suspense>
  );
}
