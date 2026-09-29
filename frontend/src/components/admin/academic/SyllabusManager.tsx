'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
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
  Upload,
  Paperclip,
  CheckCircle2,
  FileCheck,
  Clock,
} from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import {
  getAcademicYears,
  getClasses,
  getSubjects,
  getSyllabuses,
  createSyllabus,
  updateSyllabus,
  deleteSyllabus,
  uploadSyllabusFile,
} from '@/services/academic.service';
import { AcademicYear, ClassModel, Subject, Syllabus, SyllabusExamType, SyllabusUnit } from '@/types';
import { getFileUrl } from '@/utils/fileUrl';

interface SyllabusManagerProps {
  standalone?: boolean;
  preloadedYears?: AcademicYear[];
  preloadedClasses?: ClassModel[];
  preloadedSubjects?: Subject[];
}

export default function SyllabusManager({
  standalone = true,
  preloadedYears,
  preloadedClasses,
  preloadedSubjects,
}: SyllabusManagerProps) {
  // Datasets
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(preloadedYears || []);
  const [classesList, setClassesList] = useState<ClassModel[]>(preloadedClasses || []);
  const [subjectsList, setSubjectsList] = useState<Subject[]>(preloadedSubjects || []);
  const [syllabusesList, setSyllabusesList] = useState<Syllabus[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Syllabus Filters
  const [sylSearch, setSylSearch] = useState('');
  const [sylYearFilter, setSylYearFilter] = useState('');
  const [sylClassFilter, setSylClassFilter] = useState('');
  const [sylSubjectFilter, setSylSubjectFilter] = useState('');
  const [sylExamTypeFilter, setSylExamTypeFilter] = useState('');
  const [sylStatusFilter, setSylStatusFilter] = useState('');

  // Modals & Forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Syllabus | null>(null);
  const [formData, setFormData] = useState<{
    kitabName: string;
    academicYearId: string;
    classId: string;
    subjectId: string;
    examType: SyllabusExamType;
    units: SyllabusUnit[];
    fileUrl: string;
    fileName: string;
    status: string;
    version: string;
  }>({
    kitabName: '',
    academicYearId: '',
    classId: '',
    subjectId: '',
    examType: 'HALF_YEARLY',
    units: [{ unitNumber: 1, title: '' }],
    fileUrl: '',
    fileName: '',
    status: 'ACTIVE',
    version: '1.0',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete State
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSyllabusData = async () => {
    setLoading(true);
    setError('');
    try {
      const promises: Promise<any>[] = [
        getSyllabuses().catch(() => ({ success: false, data: [] })),
      ];

      // Fetch references if not provided
      const needsYears = !preloadedYears || preloadedYears.length === 0;
      const needsClasses = !preloadedClasses || preloadedClasses.length === 0;
      const needsSubjects = !preloadedSubjects || preloadedSubjects.length === 0;

      if (needsYears) promises.push(getAcademicYears().catch(() => ({ success: false, data: [] })));
      if (needsClasses) promises.push(getClasses().catch(() => ({ success: false, data: [] })));
      if (needsSubjects) promises.push(getSubjects().catch(() => ({ success: false, data: [] })));

      const results = await Promise.all(promises);
      const sylRes = results[0];
      setSyllabusesList(sylRes.data || []);

      let resIdx = 1;
      if (needsYears) {
        setAcademicYears(results[resIdx]?.data || []);
        resIdx++;
      }
      if (needsClasses) {
        setClassesList(results[resIdx]?.data || []);
        resIdx++;
      }
      if (needsSubjects) {
        setSubjectsList(results[resIdx]?.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load syllabus records:', err);
      setError('Failed to retrieve syllabus records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabusData();
  }, []);

  const handleOpenModal = (item: any = null) => {
    setEditingItem(item);
    setFormError('');

    const defaultYear = academicYears[0]?._id || '';
    const defaultClass = classesList[0]?._id || '';
    const defaultSubject = subjectsList[0]?._id || '';

    const initialUnits: SyllabusUnit[] = item?.units && item.units.length > 0
      ? item.units.map((u: any, idx: number) => ({
          unitNumber: u.unitNumber !== undefined ? u.unitNumber : idx + 1,
          title: u.title || '',
        }))
      : [{ unitNumber: 1, title: '' }];

    setFormData({
      kitabName: item?.kitabName || item?.title || '',
      academicYearId: item?.academicYearId?._id || item?.academicYearId || defaultYear,
      classId: item?.classId?._id || item?.classId || defaultClass,
      subjectId: item?.subjectId?._id || item?.subjectId || defaultSubject,
      examType: (item?.examType as SyllabusExamType) || 'HALF_YEARLY',
      units: initialUnits,
      fileUrl: item?.fileUrl || '',
      fileName: item?.fileName || '',
      status: item?.status || 'ACTIVE',
      version: item?.version || '1.0',
    });
    setIsModalOpen(true);
  };

  // Dynamic Units handlers
  const handleAddUnit = () => {
    setFormData((prev) => ({
      ...prev,
      units: [
        ...prev.units,
        { unitNumber: prev.units.length + 1, title: '' },
      ],
    }));
  };

  const handleRemoveUnit = (index: number) => {
    setFormData((prev) => {
      const nextUnits = prev.units
        .filter((_, idx) => idx !== index)
        .map((u, idx) => ({ ...u, unitNumber: idx + 1 }));
      return {
        ...prev,
        units: nextUnits.length > 0 ? nextUnits : [{ unitNumber: 1, title: '' }],
      };
    });
  };

  const handleUnitChange = (index: number, title: string) => {
    setFormData((prev) => {
      const nextUnits = [...prev.units];
      nextUnits[index] = { ...nextUnits[index], title };
      return { ...prev, units: nextUnits };
    });
  };

  // File Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
      setFormError('Please select a PDF or DOC/DOCX document.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setFormError('File size must not exceed 15MB.');
      return;
    }

    setUploadingFile(true);
    setFormError('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const resultStr = reader.result as string;
          const base64Data = resultStr.includes(',') ? resultStr.split(',')[1] : resultStr;

          const res = await uploadSyllabusFile({
            fileName: file.name,
            fileData: base64Data,
          });

          if (res.success && res.data) {
            const uploadedData = res.data;
            setFormData((prev) => ({
              ...prev,
              fileUrl: uploadedData.fileUrl,
              fileName: uploadedData.fileName || file.name,
            }));
          } else {
            setFormError(res.message || 'File upload failed.');
          }
        } catch (uploadErr: any) {
          setFormError(uploadErr.response?.data?.message || 'File upload failed.');
        } finally {
          setUploadingFile(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        setFormError('Failed to read file from disk.');
        setUploadingFile(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setFormError('An unexpected error occurred during file upload.');
      setUploadingFile(false);
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({
      ...prev,
      fileUrl: '',
      fileName: '',
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.kitabName.trim()) {
      setFormError('Kitab Name is required.');
      return;
    }
    if (!formData.academicYearId) {
      setFormError('Please select an Academic Year.');
      return;
    }
    if (!formData.classId) {
      setFormError('Please select a Class.');
      return;
    }
    if (!formData.subjectId) {
      setFormError('Please select a Subject.');
      return;
    }

    const cleanUnits = formData.units
      .map((u) => ({ unitNumber: u.unitNumber, title: u.title.trim() }))
      .filter((u) => u.title.length > 0);

    const payload = {
      kitabName: formData.kitabName.trim(),
      title: formData.kitabName.trim(),
      academicYearId: formData.academicYearId,
      classId: formData.classId,
      subjectId: formData.subjectId,
      examType: formData.examType,
      units: cleanUnits,
      fileUrl: formData.fileUrl || undefined,
      fileName: formData.fileName || undefined,
      version: formData.version || '1.0',
      status: formData.status || 'ACTIVE',
    };

    setFormLoading(true);

    try {
      if (editingItem) {
        await updateSyllabus(editingItem._id, payload);
      } else {
        await createSyllabus(payload);
      }

      setFormLoading(false);
      setIsModalOpen(false);
      fetchSyllabusData();
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
      await fetchSyllabusData();
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
        const kitabMatch = (syl.kitabName || syl.title)?.toLowerCase().includes(q);
        const subjMatch =
          syl.subjectId?.subjectName?.toLowerCase().includes(q) ||
          syl.subjectId?.name?.toLowerCase().includes(q) ||
          syl.subjectId?.subjectCode?.toLowerCase().includes(q) ||
          syl.subjectId?.code?.toLowerCase().includes(q);
        const classMatch =
          syl.classId?.name?.toLowerCase().includes(q) ||
          syl.classId?.code?.toLowerCase().includes(q);
        const unitMatch = Array.isArray(syl.units) && syl.units.some((u: any) => u.title?.toLowerCase().includes(q));
        if (!kitabMatch && !subjMatch && !classMatch && !unitMatch) return false;
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

      // Exam Type Filter
      if (sylExamTypeFilter) {
        if (syl.examType !== sylExamTypeFilter) return false;
      }

      // Status Filter
      if (sylStatusFilter) {
        if (syl.status?.toUpperCase() !== sylStatusFilter.toUpperCase()) return false;
      }

      return true;
    });
  }, [syllabusesList, sylSearch, sylYearFilter, sylClassFilter, sylSubjectFilter, sylExamTypeFilter, sylStatusFilter]);

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
                <span className="text-slate-900 font-semibold">Syllabus</span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-[#132238]">Curriculum Syllabus Management</h1>
              <p className="text-sm text-slate-500 mt-1">
                Centrally manage course syllabuses, Kitab names, exam types, curriculum units, and attachments across academic years.
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361] cursor-pointer transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Syllabus
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
            <div className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all bg-[#2F7C7A] text-white shadow-xs whitespace-nowrap">
              <FileText className="w-4 h-4" />
              <span>Syllabuses</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white">
                {syllabusesList.length}
              </span>
            </div>
            <Link
              href="/admin/academic/timetable"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all bg-white text-slate-600 hover:bg-slate-100 border border-[#E2E8E0] whitespace-nowrap"
            >
              <Clock className="w-4 h-4" />
              <span>Class Timetable</span>
            </Link>
          </div>
        </>
      )}

      {/* Syllabuses Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8E0] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Filter Syllabuses
          </span>
          {(sylSearch || sylYearFilter || sylClassFilter || sylSubjectFilter || sylExamTypeFilter || sylStatusFilter) && (
            <button
              onClick={() => {
                setSylSearch('');
                setSylYearFilter('');
                setSylClassFilter('');
                setSylSubjectFilter('');
                setSylExamTypeFilter('');
                setSylStatusFilter('');
              }}
              className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={sylSearch}
              onChange={(e) => setSylSearch(e.target.value)}
              placeholder="Search kitab, class, subject..."
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
                <option key={ay._id} value={ay._id}>
                  {ay.yearName} ({ay.yearCode})
                </option>
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
                <option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.code})
                </option>
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
                <option key={sbj._id} value={sbj._id}>
                  {sbj.subjectName || sbj.name} ({sbj.subjectCode || sbj.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={sylExamTypeFilter}
              onChange={(e) => setSylExamTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2F7C7A] bg-white"
            >
              <option value="">All Exam Types</option>
              <option value="HALF_YEARLY">Half Yearly</option>
              <option value="ANNUAL">Annual</option>
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

      {/* Content Table Area */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading syllabus records...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              onClick={fetchSyllabusData}
              className="px-4 py-2 bg-[#2F7C7A] text-white font-bold text-xs rounded-lg uppercase cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 mr-2 inline" /> Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="px-5 py-4">Academic Year</th>
                  <th className="px-5 py-4">Class</th>
                  <th className="px-5 py-4">Subject</th>
                  <th className="px-5 py-4">Kitab Name</th>
                  <th className="px-5 py-4">Exam Type</th>
                  <th className="px-5 py-4">Units</th>
                  <th className="px-5 py-4">File</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {filteredSyllabuses.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-slate-400">
                      {syllabusesList.length === 0
                        ? 'No syllabuses created yet.'
                        : 'No syllabuses match the selected filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredSyllabuses.map((syl: any) => {
                    const resolvedFileUrl = getFileUrl(syl.fileUrl);
                    return (
                      <tr key={syl._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 text-xs font-medium text-slate-600">
                          {syl.academicYearId?.yearName || syl.academicYearId?.yearCode || 'N/A'}
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 bg-slate-100 font-mono text-xs rounded-md text-slate-700 font-semibold">
                            {syl.classId?.name || syl.classId?.code || 'N/A'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-semibold text-slate-800">
                            {syl.subjectId?.subjectName || syl.subjectId?.name || 'Unassigned'}
                          </span>
                          {(syl.subjectId?.subjectCode || syl.subjectId?.code) && (
                            <span className="block text-[11px] font-mono text-slate-400">
                              {syl.subjectId?.subjectCode || syl.subjectId?.code}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-bold text-[#132238]">
                          {syl.kitabName || syl.title}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                              syl.examType === 'ANNUAL'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {syl.examType === 'ANNUAL' ? 'Annual' : 'Half Yearly'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {Array.isArray(syl.units) ? syl.units.length : 0} Units
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {syl.fileUrl ? (
                            <a
                              href={resolvedFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs font-semibold text-[#2F7C7A] hover:text-[#256361] hover:underline gap-1.5 max-w-[130px] truncate"
                              title={syl.fileName || 'View uploaded document'}
                            >
                              <Paperclip className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{syl.fileName || 'View File'}</span>
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">No file</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={syl.status} />
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => handleOpenModal(syl)}
                            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-xl border border-[#E2E8E0] p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#132238]">
                  {editingItem ? 'Edit Syllabus' : 'Add Syllabus'}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure syllabus details, Kitab name, exam type, units, and document.
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
              {/* Row 1: Academic Year & Class */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Academic Year *</label>
                  <select
                    required
                    value={formData.academicYearId}
                    onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
                  >
                    <option value="">Select Academic Year</option>
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

              {/* Row 2: Subject & Exam Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="block text-xs font-bold uppercase mb-1">Exam Type *</label>
                  <select
                    required
                    value={formData.examType}
                    onChange={(e) => setFormData({ ...formData, examType: e.target.value as SyllabusExamType })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
                  >
                    <option value="HALF_YEARLY">Half Yearly</option>
                    <option value="ANNUAL">Annual</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Kitab Name */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Kitab Name *</label>
                <input
                  type="text"
                  required
                  value={formData.kitabName}
                  onChange={(e) => setFormData({ ...formData, kitabName: e.target.value })}
                  placeholder="e.g. Noorul Iman, Fathul Mueen, Safinathun Najah"
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
                />
              </div>

              {/* Row 4: Dynamic Units */}
              <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-700">Curriculum Units</span>
                    <p className="text-[11px] text-slate-500">Define the chapters or topic units included in this syllabus.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddUnit}
                    className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#2F7C7A] text-[#2F7C7A] hover:bg-[#E6F2F1] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Unit
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  {formData.units.map((unit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 w-14 shrink-0">
                        Unit {index + 1}:
                      </span>
                      <input
                        type="text"
                        value={unit.title}
                        onChange={(e) => handleUnitChange(index, e.target.value)}
                        placeholder={`e.g. ${index === 0 ? 'Taharah' : index === 1 ? 'Salah' : 'Zakah'}`}
                        className="flex-1 px-3 py-1.5 border rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
                      />
                      {formData.units.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveUnit(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-white cursor-pointer"
                          title="Remove unit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 5: File Upload */}
              <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#2F7C7A]" /> Syllabus Document
                  </span>
                  <span className="text-[10px] text-slate-500">PDF, DOC, DOCX up to 15MB</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {uploadingFile ? (
                  <div className="p-4 text-center border-2 border-dashed border-[#2F7C7A]/40 rounded-xl bg-white space-y-1">
                    <div className="w-5 h-5 border-2 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-medium text-slate-600">Uploading syllabus document...</p>
                  </div>
                ) : formData.fileUrl ? (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {formData.fileName || 'Uploaded Syllabus File'}
                        </p>
                        <a
                          href={getFileUrl(formData.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[#2F7C7A] hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> View / Download
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 text-center border-2 border-dashed border-slate-300 rounded-xl bg-white hover:border-[#2F7C7A] hover:bg-slate-50/50 cursor-pointer transition-colors space-y-1"
                  >
                    <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">
                      Click to upload syllabus PDF
                    </p>
                    <p className="text-[11px] text-slate-400">PDF is recommended</p>
                  </div>
                )}
              </div>

              {/* Row 6: Status & Version */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="SUPERSEDED">SUPERSEDED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Version</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="1.0"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold cursor-pointer text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading || uploadingFile}
                  className="px-5 py-2 bg-[#2F7C7A] text-white rounded-xl text-xs font-bold uppercase cursor-pointer hover:bg-[#256361] disabled:opacity-50 transition-colors shadow-xs"
                >
                  {formLoading ? 'Saving...' : editingItem ? 'Update Syllabus' : 'Create Syllabus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
