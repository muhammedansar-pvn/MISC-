'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Layers, FileText, Plus, RefreshCw, AlertCircle, Edit3, X } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import {
  getAcademicYears, createAcademicYear, updateAcademicYear,
  getClasses, createClass, updateClass,
  getSubjects, createSubject, updateSubject,
  getSyllabuses, createSyllabus, updateSyllabus
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

  // Modals & Forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

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
        academicYearId: item?.academicYearId?._id || item?.academicYearId || '',
        status: item?.status || 'ACTIVE',
      });
    } else if (activeTab === 'subjects') {
      setFormData({
        name: item?.name || '',
        code: item?.code || '',
        type: item?.type || 'THEORY',
        credits: item?.credits || 3,
        status: item?.status || 'ACTIVE',
      });
    } else if (activeTab === 'syllabuses') {
      setFormData({
        title: item?.title || '',
        academicYearId: item?.academicYearId?._id || item?.academicYearId || '',
        classId: item?.classId?._id || item?.classId || '',
        subjectId: item?.subjectId?._id || item?.subjectId || '',
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
      setFormError(err.response?.data?.message || 'Operation failed. Please check form inputs.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#132238]">Academic Setup & Curriculum</h1>
          <p className="text-sm text-slate-500 mt-1">Configure Academic Years, Classes, Subjects, and Syllabuses</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361] cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" /> Add {activeTab.replace('-', ' ').slice(0, -1)}
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
                {academicYears.map((ay) => (
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
                ))}
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
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {classesList.map((cls) => (
                  <tr key={cls._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-[#132238]">{cls.name}</td>
                    <td className="px-6 py-4 font-mono text-slate-600">{cls.code}</td>
                    <td className="px-6 py-4"><StatusBadge status={cls.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenModal(cls)} className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                        <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
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
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Credits</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {subjectsList.map((sbj) => (
                  <tr key={sbj._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-[#132238]">{sbj.name}</td>
                    <td className="px-6 py-4 font-mono text-slate-600">{sbj.code}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-full border">
                        {sbj.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{sbj.credits}</td>
                    <td className="px-6 py-4"><StatusBadge status={sbj.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenModal(sbj)} className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                        <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-4">Syllabus Title</th>
                  <th className="px-6 py-4">Resource File URL</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {syllabusesList.map((syl) => (
                  <tr key={syl._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-[#132238]">{syl.title}</td>
                    <td className="px-6 py-4 text-xs font-mono text-blue-600 truncate max-w-xs">{syl.fileUrl || 'No file attached'}</td>
                    <td className="px-6 py-4"><StatusBadge status={syl.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenModal(syl)} className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                        <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-[#E2E8E0] p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#132238]">
                {editingItem ? 'Edit Record' : 'Create Record'} ({activeTab})
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            {formError && <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded">{formError}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {activeTab === 'academic-years' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Year Name *</label>
                    <input type="text" required value={formData.yearName || ''} onChange={(e) => setFormData({ ...formData, yearName: e.target.value })} placeholder="2026-2027" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Year Code *</label>
                    <input type="text" required value={formData.yearCode || ''} onChange={(e) => setFormData({ ...formData, yearCode: e.target.value })} placeholder="AY2026" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Start Date *</label>
                      <input type="date" required value={formData.startDate || ''} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">End Date *</label>
                      <input type="date" required value={formData.endDate || ''} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
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
                    <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Standard 10" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Class Code *</label>
                    <input type="text" required value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="STD-10" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </>
              )}

              {activeTab === 'subjects' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Subject Name *</label>
                    <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Arabic Grammar" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Code *</label>
                      <input type="text" required value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="ARB-101" className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Type *</label>
                      <select value={formData.type || 'THEORY'} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                        <option value="THEORY">THEORY</option>
                        <option value="PRACTICAL">PRACTICAL</option>
                        <option value="BOTH">BOTH</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Credits</label>
                    <input type="number" min="1" value={formData.credits || 3} onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </>
              )}

              {activeTab === 'syllabuses' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Syllabus Title *</label>
                    <input type="text" required value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Islamic Jurisprudence Syllabus 2026" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">File URL *</label>
                    <input type="text" required value={formData.fileUrl || ''} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} placeholder="https://downloads.misc.markaz.in/syllabuses/arb-101.pdf" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Status</label>
                <select value={formData.status || 'ACTIVE'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
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
