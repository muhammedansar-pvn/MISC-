'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Calendar,
  Layers,
  FileText,
  Plus,
  RefreshCw,
  AlertCircle,
  Edit3,
  Trash2,
  X,
  Search,
  ExternalLink,
  Filter,
} from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
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
  getSyllabuses,
  createSyllabus,
  updateSyllabus,
  deleteSyllabus,
} from '@/services/academic.service';
import { AcademicYear, ClassModel, Subject, Syllabus } from '@/types';

type AcademicTab = 'academic-years' | 'classes' | 'subjects' | 'syllabuses';

export default function AdminAcademicPage() {
  const [activeTab, setActiveTab] = useState<AcademicTab>('academic-years');

  // Datasets
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classesList, setClassesList] = useState<ClassModel[]>([]);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [syllabusesList, setSyllabusesList] = useState<Syllabus[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Syllabus Filters
  const [sylSearch, setSylSearch] = useState('');
  const [sylYearFilter, setSylYearFilter] = useState('');
  const [sylClassFilter, setSylClassFilter] = useState('');
  const [sylSubjectFilter, setSylSubjectFilter] = useState('');
  const [sylStatusFilter, setSylStatusFilter] = useState('');

  // Modals & Forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAllAcademicData = async () => {
    setLoading(true);
    setError('');
    try {
      const [ayRes, clsRes, sbjRes, sylRes] = await Promise.all([
        getAcademicYears().catch(() => ({ success: false, data: [] })),
        getClasses().catch(() => ({ success: false, data: [] })),
        getSubjects().catch(() => ({ success: false, data: [] })),
        getSyllabuses().catch(() => ({ success: false, data: [] })),
      ]);

      setAcademicYears(ayRes.data || []);
      setClassesList(clsRes.data || []);
      setSubjectsList(sbjRes.data || []);
      setSyllabusesList(sylRes.data || []);
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
        academicYearId: item?.academicYearId?._id || item?.academicYearId || (academicYears[0]?._id || ''),
        status: item?.status || 'ACTIVE',
      });
    } else if (activeTab === 'subjects') {
      setFormData({
        subjectName: item?.subjectName || item?.name || '',
        subjectCode: item?.subjectCode || item?.code || '',
        category: item?.category || 'GENERAL',
        description: item?.description || '',
        status: item?.status || 'ACTIVE',
      });
    } else if (activeTab === 'syllabuses') {
      setFormData({
        title: item?.title || '',
        academicYearId: item?.academicYearId?._id || item?.academicYearId || (academicYears[0]?._id || ''),
        classId: item?.classId?._id || item?.classId || (classesList[0]?._id || ''),
        subjectId: item?.subjectId?._id || item?.subjectId || (subjectsList[0]?._id || ''),
        version: item?.version || '1.0',
        fileUrl: item?.fileUrl || '',
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
      } else if (activeTab === 'syllabuses') {
        if (editingItem) await updateSyllabus(editingItem._id, formData);
        else await createSyllabus(formData);
      }

      setFormLoading(false);
      setIsModalOpen(false);
      fetchAllAcademicData();
    } catch (err: any) {
      setFormLoading(false);
      setFormError(err.response?.data?.message || err.message || 'Operation failed. Please check form inputs.');
    }
  };

  const handleDeleteSyllabusAction = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate/delete this syllabus?')) return;
    setDeleteLoading(true);
    try {
      await deleteSyllabus(id);
      await fetchAllAcademicData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete syllabus');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered Syllabuses
  const filteredSyllabuses = useMemo(() => {
    return syllabusesList.filter((syl: any) => {
      // Search
      if (sylSearch.trim()) {
        const q = sylSearch.toLowerCase();
        const titleMatch = syl.title?.toLowerCase().includes(q);
        const versionMatch = syl.version?.toLowerCase().includes(q);
        const subjMatch =
          syl.subjectId?.subjectName?.toLowerCase().includes(q) ||
          syl.subjectId?.subjectCode?.toLowerCase().includes(q);
        const classMatch =
          syl.classId?.name?.toLowerCase().includes(q) ||
          syl.classId?.code?.toLowerCase().includes(q);
        if (!titleMatch && !versionMatch && !subjMatch && !classMatch) return false;
      }

      // Year Filter
      if (sylYearFilter) {
        const yId = syl.academicYearId?._id || syl.academicYearId;
        if (yId !== sylYearFilter) return false;
      }

      // Class Filter
      if (sylClassFilter) {
        const cId = syl.classId?._id || syl.classId;
        if (cId !== sylClassFilter) return false;
      }

      // Subject Filter
      if (sylSubjectFilter) {
        const sId = syl.subjectId?._id || syl.subjectId;
        if (sId !== sylSubjectFilter) return false;
      }

      // Status Filter
      if (sylStatusFilter) {
        if (syl.status?.toUpperCase() !== sylStatusFilter.toUpperCase()) return false;
      }

      return true;
    });
  }, [syllabusesList, sylSearch, sylYearFilter, sylClassFilter, sylSubjectFilter, sylStatusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#132238]">Academic Curriculum & Setup</h1>
          <p className="text-sm text-slate-500 mt-1">Configure Academic Years, Classes, Subjects, and Syllabuses for Markaz Sanaviyya</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361] cursor-pointer transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 mr-2" /> Add {activeTab === 'academic-years' ? 'Academic Year' : activeTab === 'classes' ? 'Class' : activeTab === 'subjects' ? 'Subject' : 'Syllabus'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-[#E2E8E0] pb-1 overflow-x-auto">
        {[
          { id: 'academic-years' as AcademicTab, label: 'Academic Years', icon: Calendar, count: academicYears.length },
          { id: 'classes' as AcademicTab, label: 'Classes', icon: Layers, count: classesList.length },
          { id: 'subjects' as AcademicTab, label: 'Subjects', icon: BookOpen, count: subjectsList.length },
          { id: 'syllabuses' as AcademicTab, label: 'Syllabuses', icon: FileText, count: syllabusesList.length },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#2F7C7A] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#E2E8E0]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Syllabuses Filter Bar */}
      {activeTab === 'syllabuses' && (
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8E0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Filter Syllabuses
            </span>
            {(sylSearch || sylYearFilter || sylClassFilter || sylSubjectFilter || sylStatusFilter) && (
              <button
                onClick={() => {
                  setSylSearch('');
                  setSylYearFilter('');
                  setSylClassFilter('');
                  setSylSubjectFilter('');
                  setSylStatusFilter('');
                }}
                className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={sylSearch}
                onChange={(e) => setSylSearch(e.target.value)}
                placeholder="Search title / code..."
                className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
              />
            </div>
            <div>
              <select
                value={sylYearFilter}
                onChange={(e) => setSylYearFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2F7C7A] bg-white"
              >
                <option value="">All Academic Years</option>
                {academicYears.map((ay) => (
                  <option key={ay._id} value={ay._id}>{ay.yearName} ({ay.yearCode})</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={sylClassFilter}
                onChange={(e) => setSylClassFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2F7C7A] bg-white"
              >
                <option value="">All Classes</option>
                {classesList.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.name} ({cls.code})</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={sylSubjectFilter}
                onChange={(e) => setSylSubjectFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2F7C7A] bg-white"
              >
                <option value="">All Subjects</option>
                {subjectsList.map((sbj: any) => (
                  <option key={sbj._id} value={sbj._id}>{sbj.subjectName || sbj.name} ({sbj.subjectCode || sbj.code})</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={sylStatusFilter}
                onChange={(e) => setSylStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2F7C7A] bg-white"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="SUPERSEDED">SUPERSEDED</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading academic records...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button onClick={fetchAllAcademicData} className="px-4 py-2 bg-[#2F7C7A] text-white font-bold text-xs rounded-lg uppercase cursor-pointer">
              <RefreshCw className="w-4 h-4 mr-2 inline" /> Retry
            </button>
          </div>
        ) : activeTab === 'academic-years' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-4">Year Name</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Current Active</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {academicYears.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No academic years found.</td>
                  </tr>
                ) : (
                  academicYears.map((ay) => (
                    <tr key={ay._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-[#132238]">{ay.yearName}</td>
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
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-4">Class Name</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Academic Year</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {classesList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No classes registered yet.</td>
                  </tr>
                ) : (
                  classesList.map((cls: any) => (
                    <tr key={cls._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-[#132238]">{cls.name}</td>
                      <td className="px-6 py-4 font-mono text-slate-600">{cls.code}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {cls.academicYearId?.yearName || cls.academicYearId?.yearCode || 'N/A'}
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
        ) : activeTab === 'subjects' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-4">Subject Name</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {subjectsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No subjects found.</td>
                  </tr>
                ) : (
                  subjectsList.map((sbj: any) => (
                    <tr key={sbj._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-[#132238]">{sbj.subjectName || sbj.name}</td>
                      <td className="px-6 py-4 font-mono text-slate-600">{sbj.subjectCode || sbj.code}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-full border">
                          {sbj.category || 'GENERAL'}
                        </span>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={sbj.status} /></td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleOpenModal(sbj)} className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-4">Syllabus Title</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Academic Year</th>
                  <th className="px-6 py-4">Version</th>
                  <th className="px-6 py-4">File Link</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {filteredSyllabuses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                      {syllabusesList.length === 0
                        ? 'No syllabuses created yet.'
                        : 'No syllabuses match the selected filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredSyllabuses.map((syl: any) => (
                    <tr key={syl._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-[#132238]">{syl.title}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">
                          {syl.subjectId?.subjectName || syl.subjectId?.name || 'Unassigned'}
                        </span>
                        {syl.subjectId?.subjectCode && (
                          <span className="block text-[11px] font-mono text-slate-400">
                            {syl.subjectId.subjectCode}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 font-mono text-xs rounded text-slate-700">
                          {syl.classId?.name || syl.classId?.code || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {syl.academicYearId?.yearName || syl.academicYearId?.yearCode || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">v{syl.version || '1.0'}</td>
                      <td className="px-6 py-4">
                        {syl.fileUrl ? (
                          <a
                            href={syl.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline gap-1 max-w-[140px] truncate"
                          >
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">View File</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">No file</span>
                        )}
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={syl.status} /></td>
                      <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleOpenModal(syl)}
                          className="px-2.5 py-1.5 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSyllabusAction(syl._id)}
                          disabled={deleteLoading}
                          className="px-2.5 py-1.5 border border-rose-200 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Deactivate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-[#E2E8E0] p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#132238]">
                {editingItem ? 'Edit Record' : 'Create Record'} ({activeTab === 'academic-years' ? 'Academic Year' : activeTab === 'classes' ? 'Class' : activeTab === 'subjects' ? 'Subject' : 'Syllabus'})
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
                </>
              )}

              {activeTab === 'syllabuses' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Syllabus Title *</label>
                    <input type="text" required value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Islamic Jurisprudence Syllabus 2026" className="w-full px-3 py-2 border rounded-lg text-sm" />
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Class *</label>
                      <select
                        required
                        value={formData.classId || ''}
                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                      >
                        <option value="">Select Class</option>
                        {classesList.map((cls) => (
                          <option key={cls._id} value={cls._id}>{cls.name} ({cls.code})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Subject *</label>
                      <select
                        required
                        value={formData.subjectId || ''}
                        onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                      >
                        <option value="">Select Subject</option>
                        {subjectsList.map((sbj: any) => (
                          <option key={sbj._id} value={sbj._id}>{sbj.subjectName || sbj.name} ({sbj.subjectCode || sbj.code})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-xs font-bold uppercase mb-1">Version *</label>
                      <input type="text" required value={formData.version || '1.0'} onChange={(e) => setFormData({ ...formData, version: e.target.value })} placeholder="1.0" className="w-full px-3 py-2 border rounded-lg text-sm" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold uppercase mb-1">File URL *</label>
                      <input type="text" required value={formData.fileUrl || ''} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} placeholder="https://downloads.markaz.in/syllabus.pdf" className="w-full px-3 py-2 border rounded-lg text-sm" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Status</label>
                <select value={formData.status || 'ACTIVE'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  {activeTab === 'syllabuses' && (
                    <>
                      <option value="DRAFT">DRAFT</option>
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="SUPERSEDED">SUPERSEDED</option>
                    </>
                  )}
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
                <button type="submit" disabled={formLoading} className="px-5 py-2 bg-[#2F7C7A] text-white rounded-lg text-xs font-bold uppercase cursor-pointer">
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
