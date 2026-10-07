'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCheck, Calendar, Users, Award, Plus, RefreshCw, AlertCircle,
  Edit3, CheckCircle, X, Globe, EyeOff, Clock, Layers, BookOpen
} from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import {
  getExams, createExam, updateExam, publishExam,
  getExamSchedules, createExamSchedule, updateExamSchedule,
  getExamRegistrations, updateExamRegistrationStatus, checkExamFeePayment,
  getMarkEntries, verifyMarkEntries
} from '@/services/exam.service';
import { getAcademicYears, getClasses, getSubjects } from '@/services/academic.service';
import { Exam, ExamSchedule, ExamRegistration, MarkEntry, AcademicYear, ClassModel, Subject } from '@/types';

type ExamTab = 'exams' | 'schedules' | 'registrations' | 'mark-entries';

const formatToDateTimeLocal = (dateStr?: string | Date | null) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatToDateInput = (dateStr?: string | Date | null) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatDisplayDateTime = (dateStr?: string | Date | null) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AdminExamsPage() {
  const [activeTab, setActiveTab] = useState<ExamTab>('exams');

  const [exams, setExams] = useState<Exam[]>([]);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [registrations, setRegistrations] = useState<ExamRegistration[]>([]);
  const [markEntries, setMarkEntries] = useState<MarkEntry[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);

  // Modals & Mark Verification
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchExamData = async () => {
    setLoading(true);
    setError('');
    try {
      const [exRes, schRes, regRes, markRes, ayRes, clRes, subRes] = await Promise.all([
        getExams().catch(() => ({ success: false, data: [] })),
        getExamSchedules().catch(() => ({ success: false, data: [] })),
        getExamRegistrations().catch(() => ({ success: false, data: [] })),
        getMarkEntries().catch(() => ({ success: false, data: [] })),
        getAcademicYears().catch(() => ({ success: false, data: [] })),
        getClasses().catch(() => ({ success: false, data: [] })),
        getSubjects().catch(() => ({ success: false, data: [] })),
      ]);

      setExams(exRes.data || []);
      setSchedules(schRes.data || []);
      setRegistrations(regRes.data || []);
      setMarkEntries(markRes.data || []);
      setAcademicYears(ayRes.data || []);
      setClasses(clRes.data || []);
      setSubjects(subRes.data || []);
    } catch (err: any) {
      console.error('Failed to load examination datasets:', err);
      setError('Failed to retrieve examination management records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamData();
  }, []);

  const handleOpenModal = (item: any = null) => {
    setEditingItem(item);
    setFormError('');

    if (activeTab === 'exams') {
      const defaultAyId = item?.academicYearId?._id || item?.academicYearId || (academicYears[0]?._id || '');
      const sDate = formatToDateInput(item?.startDate);
      const eDate = formatToDateInput(item?.endDate);
      const regSDate = formatToDateTimeLocal(item?.registrationStartDate);
      const regEDate = formatToDateTimeLocal(item?.registrationEndDate);
      const resPubDate = formatToDateTimeLocal(item?.resultPublicationDate);
      const eligibleClassIds = (item?.eligibleClassIds || []).map((c: any) => c?._id || c);
      const subjectIds = (item?.subjectIds || []).map((s: any) => s?._id || s);

      setFormData({
        title: item?.title || item?.name || '',
        name: item?.name || item?.title || '',
        code: item?.code || '',
        description: item?.description || '',
        academicYearId: defaultAyId,
        startDate: sDate,
        endDate: eDate,
        registrationStartDate: regSDate,
        registrationEndDate: regEDate,
        resultPublicationDate: resPubDate,
        eligibleClassIds: eligibleClassIds,
        subjectIds: subjectIds,
        term: item?.term || 'FIRST_TERM',
        examType: item?.examType || 'ANNUAL',
        fee: item?.fee != null ? item.fee : 0,
        status: item?.status || 'DRAFT',
      });
    } else if (activeTab === 'schedules') {
      const defaultExId = item?.examId?._id || item?.examId || (exams[0]?._id || '');
      const defaultClId = item?.classId?._id || item?.classId || (classes[0]?._id || '');
      const defaultSubId = item?.subjectId?._id || item?.subjectId || (subjects[0]?._id || '');
      setFormData({
        examId: defaultExId,
        classId: defaultClId,
        subjectId: defaultSubId,
        examDate: item?.examDate ? new Date(item.examDate).toISOString().split('T')[0] : '',
        startTime: item?.startTime || '09:30',
        endTime: item?.endTime || '12:30',
        maxMarks: item?.maxMarks || 100,
        passMarks: item?.passMarks || 40,
        status: item?.status || 'SCHEDULED',
      });
    }

    setIsModalOpen(true);
  };

  const handleSaveExam = async (forcedStatus?: string) => {
    setFormError('');
    setFormLoading(true);

    try {
      const payload: any = {
        title: formData.title || formData.name || '',
        name: formData.name || formData.title || '',
        code: (formData.code || '').trim().toUpperCase(),
        description: (formData.description || '').trim(),
        academicYearId: formData.academicYearId,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        registrationStartDate: formData.registrationStartDate ? new Date(formData.registrationStartDate).toISOString() : undefined,
        registrationEndDate: formData.registrationEndDate ? new Date(formData.registrationEndDate).toISOString() : undefined,
        resultPublicationDate: formData.resultPublicationDate ? new Date(formData.resultPublicationDate).toISOString() : null,
        eligibleClassIds: formData.eligibleClassIds || [],
        subjectIds: formData.subjectIds || [],
        term: formData.term || 'FIRST_TERM',
        examType: formData.examType || 'ANNUAL',
        fee: Number(formData.fee) >= 0 ? Number(formData.fee) : 0,
        status: forcedStatus || formData.status || 'DRAFT',
      };

      if (!payload.title) {
        setFormError('Please provide an Examination Title.');
        setFormLoading(false);
        return;
      }
      if (!payload.code) {
        setFormError('Please provide an Examination Code.');
        setFormLoading(false);
        return;
      }
      if (!payload.academicYearId) {
        setFormError('Please select an Academic Year.');
        setFormLoading(false);
        return;
      }
      if (!payload.startDate || !payload.endDate) {
        setFormError('Please provide both Start Date and End Date.');
        setFormLoading(false);
        return;
      }
      if (new Date(payload.endDate) <= new Date(payload.startDate)) {
        setFormError('End Date must be after Start Date.');
        setFormLoading(false);
        return;
      }
      if (payload.registrationStartDate && payload.registrationEndDate) {
        if (new Date(payload.registrationEndDate) < new Date(payload.registrationStartDate)) {
          setFormError('Registration Close Date cannot be earlier than Registration Open Date.');
          setFormLoading(false);
          return;
        }
      }
      if (payload.status === 'PUBLISHED') {
        if (!payload.registrationStartDate || !payload.registrationEndDate) {
          setFormError('To publish an examination, both Registration Open Date and Close Date must be configured.');
          setFormLoading(false);
          return;
        }
        if (!payload.eligibleClassIds || payload.eligibleClassIds.length === 0) {
          setFormError('To publish an examination, at least one Eligible Class must be selected.');
          setFormLoading(false);
          return;
        }
      }

      if (editingItem) {
        await updateExam(editingItem._id, payload);
      } else {
        await createExam(payload);
      }

      setFormLoading(false);
      setIsModalOpen(false);
      fetchExamData();
    } catch (err: any) {
      setFormLoading(false);
      setFormError(err.response?.data?.message || err.message || 'Failed to save examination record.');
    }
  };

  const handleTogglePublish = async (exam: Exam) => {
    try {
      const isPublished = exam.status === 'PUBLISHED';
      if (!isPublished) {
        if (!exam.registrationStartDate || !exam.registrationEndDate) {
          alert('Cannot publish: Registration Open Date and Close Date must be configured.');
          return;
        }
        if (!exam.eligibleClassIds || exam.eligibleClassIds.length === 0) {
          alert('Cannot publish: At least one eligible class must be selected.');
          return;
        }
      }
      await publishExam(exam._id, !isPublished);
      fetchExamData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to update publication status.');
    }
  };

  const handleSubmitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (!formData.examId || !formData.classId || !formData.subjectId) {
        setFormError('Exam, Class, and Subject are all required.');
        setFormLoading(false);
        return;
      }
      if (editingItem) await updateExamSchedule(editingItem._id, formData);
      else await createExamSchedule(formData);

      setFormLoading(false);
      setIsModalOpen(false);
      fetchExamData();
    } catch (err: any) {
      setFormLoading(false);
      setFormError(err.response?.data?.message || 'Failed to save schedule record.');
    }
  };


  const handleVerifyMarks = async (examScheduleId: string) => {
    try {
      await verifyMarkEntries(examScheduleId);
      alert('Mark entries verified successfully.');
      fetchExamData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to verify mark entries.');
    }
  };

  const handleIssueHallTicket = async (regId: string) => {
    try {
      await updateExamRegistrationStatus(regId, 'HALL_TICKET_ISSUED');
      fetchExamData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update registration status.');
    }
  };

  const handleReconcilePayment = async (regId: string) => {
    try {
      setReconcilingId(regId);
      const res = await checkExamFeePayment(regId);
      if (res.success && res.data) {
        alert(res.data.message || 'Fee status verified and reconciled.');
        fetchExamData();
      } else {
        alert(res.message || 'Payment check completed.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to check payment status.');
    } finally {
      setReconcilingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E3EAE5] shadow-xs">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#171D19]">Examination Management</h1>
          <p className="text-sm text-slate-500 mt-1">Configure exams, timetables, hall tickets, mark submissions & verification</p>
        </div>
        {(activeTab === 'exams' || activeTab === 'schedules') && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-[#23804A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#1B6F41] cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" /> Add {activeTab === 'exams' ? 'Exam' : 'Schedule'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-[#E3EAE5] pb-1 overflow-x-auto">
        {[
          { id: 'exams' as ExamTab, label: 'Exams', icon: FileCheck, count: exams.length },
          { id: 'schedules' as ExamTab, label: 'Exam Schedules', icon: Calendar, count: schedules.length },
          { id: 'registrations' as ExamTab, label: 'Registrations', icon: Users, count: registrations.length },
          { id: 'mark-entries' as ExamTab, label: 'Mark Verification', icon: Award, count: markEntries.length },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#23804A] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#E3EAE5]'
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

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-[#E3EAE5] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#23804A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading examination data...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button onClick={fetchExamData} className="px-4 py-2 bg-[#23804A] text-white font-bold text-xs rounded-lg uppercase cursor-pointer">
              <RefreshCw className="w-4 h-4 mr-2 inline" /> Retry
            </button>
          </div>
        ) : activeTab === 'exams' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FBFCFB] text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-4">Examination</th>
                  <th className="px-6 py-4">Academic Year & Eligibility</th>
                  <th className="px-6 py-4">Registration Window</th>
                  <th className="px-6 py-4">Exam Period</th>
                  <th className="px-6 py-4">Result Publication</th>
                  <th className="px-6 py-4">Fee</th>
                  <th className="px-6 py-4">Registrations</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EAE5]">
                {exams.map((ex) => {
                  const ay = (ex.academicYearId as any);
                  const ayName = ay?.yearName || ay?.name || ay?.yearCode || 'Current Academic Year';
                  const sDate = ex.startDate ? new Date(ex.startDate).toLocaleDateString('en-GB') : '—';
                  const eDate = ex.endDate ? new Date(ex.endDate).toLocaleDateString('en-GB') : '—';
                  const eligibleClassesList = (ex.eligibleClassIds || []) as any[];

                  const now = new Date();
                  let regBadge = (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      Draft
                    </span>
                  );
                  if (ex.status === 'PUBLISHED') {
                    if (!ex.registrationStartDate || !ex.registrationEndDate) {
                      regBadge = (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Window Unset
                        </span>
                      );
                    } else if (now < new Date(ex.registrationStartDate)) {
                      regBadge = (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 mr-1 text-amber-600" /> Opens {new Date(ex.registrationStartDate).toLocaleDateString('en-GB')}
                        </span>
                      );
                    } else if (now > new Date(ex.registrationEndDate)) {
                      regBadge = (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Closed
                        </span>
                      );
                    } else {
                      regBadge = (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" /> Open
                        </span>
                      );
                    }
                  }

                  return (
                    <tr key={ex._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#171D19]">{ex.title || ex.name}</p>
                        <p className="font-mono text-xs text-slate-500">{ex.code}</p>
                        {ex.description && (
                          <p className="text-xs text-slate-500 line-clamp-1 max-w-xs mt-0.5">{ex.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-slate-800 mb-1">{ayName}</p>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {eligibleClassesList.length > 0 ? (
                            eligibleClassesList.slice(0, 3).map((cl: any) => (
                              <span key={cl._id || cl} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                                {cl.name || cl.className || cl.code || 'Class'}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-amber-600 italic">No classes set</span>
                          )}
                          {eligibleClassesList.length > 3 && (
                            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-medium">
                              +{eligibleClassesList.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="mb-1">{regBadge}</div>
                        {ex.registrationStartDate && ex.registrationEndDate ? (
                          <p className="font-mono text-[11px] text-slate-500">
                            {new Date(ex.registrationStartDate).toLocaleDateString('en-GB')} – {new Date(ex.registrationEndDate).toLocaleDateString('en-GB')}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">Not set</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 font-mono">
                        {sDate} – {eDate}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {ex.resultPublicationDate ? (
                          <div>
                            {now >= new Date(ex.resultPublicationDate) ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" /> Released
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                <Clock className="w-3 h-3 mr-1 text-indigo-600" /> Scheduled
                              </span>
                            )}
                            <p className="font-mono text-[11px] text-slate-500 mt-1">
                              {formatDisplayDateTime(ex.resultPublicationDate)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Immediate on completion</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">
                        {ex.fee != null && ex.fee > 0 ? `₹${ex.fee}` : 'Free'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                          <Users className="w-3 h-3 mr-1 text-emerald-600" />
                          {ex.registeredStudentsCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={ex.status} />
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenModal(ex)}
                          className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleTogglePublish(ex)}
                          title={ex.status === 'PUBLISHED' ? 'Unpublish and set to Draft' : 'Publish examination to students'}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                            ex.status === 'PUBLISHED'
                              ? 'border border-amber-300 text-amber-800 hover:bg-amber-50'
                              : 'bg-[#23804A] text-white hover:bg-[#1B6F41]'
                          }`}
                        >
                          {ex.status === 'PUBLISHED' ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5 inline mr-1" /> Unpublish
                            </>
                          ) : (
                            <>
                              <Globe className="w-3.5 h-3.5 inline mr-1" /> Publish
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        ) : activeTab === 'schedules' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FBFCFB] text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-4">Exam / Subject</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Exam Date</th>
                  <th className="px-6 py-4">Timing</th>
                  <th className="px-6 py-4">Max / Pass Marks</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EAE5]">
                {schedules.map((sch) => {
                  const cl = (sch.classId as any);
                  const clName = cl?.name || cl?.className || cl?.code || 'Class N/A';
                  return (
                    <tr key={sch._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#171D19]">{(sch.examId as any)?.title || (sch.examId as any)?.name || 'Exam Record'}</p>
                        <p className="text-xs text-slate-500">{(sch.subjectId as any)?.name || 'Subject N/A'}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-700">{clName}</td>
                      <td className="px-6 py-4 text-xs text-slate-700">{sch.examDate ? new Date(sch.examDate).toLocaleDateString('en-GB') : 'N/A'}</td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-600">{sch.startTime} - {sch.endTime}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{sch.maxMarks} / {sch.passMarks}</td>
                      <td className="px-6 py-4"><StatusBadge status={sch.status || 'SCHEDULED'} /></td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleOpenModal(sch)} className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                          <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
                        </button>
                        <button onClick={() => handleVerifyMarks(sch._id)} className="px-3 py-1.5 bg-[#23804A] text-white rounded-lg text-xs font-semibold hover:bg-[#1B6F41] cursor-pointer">
                          <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> Verify Marks
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'registrations' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FBFCFB] text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-4">Candidate / Roll Number</th>
                  <th className="px-6 py-4">Examination</th>
                  <th className="px-6 py-4">Registration Date</th>
                  <th className="px-6 py-4">Fee Payment Status</th>
                  <th className="px-6 py-4">Hall Ticket / Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EAE5]">
                {registrations.map((reg) => {
                  const stu = (reg.studentId as any);
                  const ex = (reg.examId as any);
                  const payment = (reg.paymentId as any);
                  const isPaid = payment?.status === 'SUCCESS' || reg.registrationStatus === 'HALL_TICKET_ISSUED';
                  const isPending = payment?.status === 'PENDING';
                  const isReconciling = reconcilingId === reg._id;

                  return (
                    <tr key={reg._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#171D19]">{stu?.nameEnglish || stu?.name || 'Student Candidate'}</div>
                        <div className="text-xs font-mono text-emerald-800 font-semibold">{reg.rollNumber || 'Under Generation'}</div>
                        {stu?.registrationNumber && (
                          <div className="text-[11px] font-mono text-slate-400">Reg: {stu.registrationNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{ex?.title || ex?.name || 'Exam'}</p>
                        <p className="text-xs font-mono text-slate-400">{ex?.code || ''}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-600">
                        {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('en-GB') : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {isPaid ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Fee Paid {payment?.amount ? `(₹${payment.amount})` : ''}
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Payment Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Fee Unpaid
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={reg.registrationStatus} /></td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleReconcilePayment(reg._id)}
                          disabled={isReconciling}
                          className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                          title="Verify and reconcile fee payment"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 inline mr-1 ${isReconciling ? 'animate-spin text-emerald-600' : ''}`} />
                          Reconcile Fee
                        </button>
                        {reg.registrationStatus !== 'HALL_TICKET_ISSUED' && (
                          <button
                            onClick={() => handleIssueHallTicket(reg._id)}
                            className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 cursor-pointer"
                          >
                            Issue Hall Ticket
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FBFCFB] text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Marks Obtained</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Verified By Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EAE5]">
                {markEntries.map((mk) => (
                  <tr key={mk._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-[#171D19]">{(mk.studentId as any)?.name || 'Student Record'}</td>
                    <td className="px-6 py-4 font-bold text-emerald-700">{mk.marksObtained}</td>
                    <td className="px-6 py-4"><StatusBadge status={mk.status} /></td>
                    <td className="px-6 py-4 text-xs font-semibold">{mk.verifiedBy ? 'VERIFIED' : 'PENDING VERIFICATION'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl border border-[#E3EAE5] p-6 space-y-4 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-[#171D19]">
                  {editingItem ? 'Edit' : 'Create'} {activeTab === 'exams' ? 'Examination' : 'Exam Schedule'}
                </h3>
                {activeTab === 'exams' && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure dates, fee, eligibility, and registration window for students
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded shrink-0">
                {formError}
              </div>
            )}

            <div className="overflow-y-auto pr-1 flex-1">
              {activeTab === 'exams' ? (
                <div className="space-y-4 text-sm">
                  {/* Basic Information */}
                  <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Basic Information</h4>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Exam Title / Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.title || formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value, name: e.target.value })}
                        placeholder="Term 1 Sanaviyya Board Examination 2026"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#23804A] outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Exam Code *</label>
                        <input
                          type="text"
                          required
                          value={formData.code || ''}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                          placeholder="EXAM-2026-T1"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg uppercase font-mono focus:ring-1 focus:ring-[#23804A] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Academic Year *</label>
                        <select
                          required
                          value={formData.academicYearId || ''}
                          onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg cursor-pointer focus:ring-1 focus:ring-[#23804A] outline-none"
                        >
                          <option value="">Select Academic Year</option>
                          {academicYears.map((ay) => (
                            <option key={ay._id} value={ay._id}>
                              {ay.yearName || ay.yearCode || 'Academic Year'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Term</label>
                        <select
                          value={formData.term || 'FIRST_TERM'}
                          onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg cursor-pointer focus:ring-1 focus:ring-[#23804A] outline-none"
                        >
                          <option value="FIRST_TERM">First Term</option>
                          <option value="MID_TERM">Mid Term</option>
                          <option value="FINAL_TERM">Final Term</option>
                          <option value="ANNUAL">Annual</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Exam Type</label>
                        <select
                          value={formData.examType || 'ANNUAL'}
                          onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg cursor-pointer focus:ring-1 focus:ring-[#23804A] outline-none"
                        >
                          <option value="ANNUAL">Annual</option>
                          <option value="SEMESTER">Semester</option>
                          <option value="SUPPLEMENTARY">Supplementary</option>
                          <option value="UNIT_TEST">Unit Test</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Description</label>
                      <textarea
                        rows={2}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Comprehensive annual examination guidelines, syllabus scope, or announcements..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#23804A] outline-none"
                      />
                    </div>
                  </div>

                  {/* Academic Scope & Cohort Eligibility */}
                  <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Eligible Classes (Cohort Scope)
                      </h4>
                      <div className="space-x-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, eligibleClassIds: classes.map((c) => c._id) })}
                          className="text-[#23804A] font-semibold hover:underline cursor-pointer"
                        >
                          Select All
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, eligibleClassIds: [] })}
                          className="text-slate-500 font-semibold hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Students in these classes will see this examination available in their portal and be permitted to register.
                    </p>
                    <div className="max-h-36 overflow-y-auto border border-slate-200 bg-white rounded-lg p-2.5 grid grid-cols-2 gap-2">
                      {classes.map((cls) => {
                        const isChecked = (formData.eligibleClassIds || []).includes(cls._id);
                        return (
                          <label
                            key={cls._id}
                            className={`flex items-center space-x-2 text-xs p-2 rounded-lg cursor-pointer border transition-colors ${
                              isChecked
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const current = formData.eligibleClassIds || [];
                                const updated = e.target.checked
                                  ? [...current, cls._id]
                                  : current.filter((id: string) => id !== cls._id);
                                setFormData({ ...formData, eligibleClassIds: updated });
                              }}
                              className="rounded text-[#23804A] focus:ring-[#23804A] h-3.5 w-3.5"
                            />
                            <span className="truncate">{cls.name || cls.className || cls.code}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Exam Subjects */}
                  <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Included Subjects (Optional)
                      </h4>
                      <div className="space-x-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, subjectIds: subjects.map((s) => s._id) })}
                          className="text-[#23804A] font-semibold hover:underline cursor-pointer"
                        >
                          Select All
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, subjectIds: [] })}
                          className="text-slate-500 font-semibold hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="max-h-32 overflow-y-auto border border-slate-200 bg-white rounded-lg p-2.5 grid grid-cols-2 gap-2">
                      {subjects.map((sub) => {
                        const isChecked = (formData.subjectIds || []).includes(sub._id);
                        return (
                          <label
                            key={sub._id}
                            className={`flex items-center space-x-2 text-xs p-2 rounded-lg cursor-pointer border transition-colors ${
                              isChecked
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const current = formData.subjectIds || [];
                                const updated = e.target.checked
                                  ? [...current, sub._id]
                                  : current.filter((id: string) => id !== sub._id);
                                setFormData({ ...formData, subjectIds: updated });
                              }}
                              className="rounded text-[#23804A] focus:ring-[#23804A] h-3.5 w-3.5"
                            />
                            <span className="truncate">{sub.name} ({sub.code})</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Registration Window */}
                  <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/80 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-[#23804A]" />
                      <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                        Student Registration Window *
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Students can only register and pay fees during this window. Required for publishing.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                          Registration Opens
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.registrationStartDate || ''}
                          onChange={(e) => setFormData({ ...formData, registrationStartDate: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#23804A] outline-none text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                          Registration Closes
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.registrationEndDate || ''}
                          onChange={(e) => setFormData({ ...formData, registrationEndDate: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#23804A] outline-none text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Examination Window & Fee */}
                  <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Exam Period & Fee</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Exam Start Date *</label>
                        <input
                          type="date"
                          required
                          value={formData.startDate || ''}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#23804A] outline-none text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Exam End Date *</label>
                        <input
                          type="date"
                          required
                          value={formData.endDate || ''}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#23804A] outline-none text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Fee (₹ INR)</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.fee != null ? formData.fee : 0}
                          onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#23804A] outline-none text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Result Publication Schedule */}
                  <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/70 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-emerald-700" />
                      <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                        Result Publication Schedule (Optional)
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Results remain hidden from students and parents until this date & time. Leave empty for immediate visibility upon exam completion.
                    </p>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700">
                        Result Publication Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.resultPublicationDate || ''}
                        onChange={(e) => setFormData({ ...formData, resultPublicationDate: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#23804A] outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Schedules Form */
                <form id="schedule-form" onSubmit={handleSubmitSchedule} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Examination *</label>
                    <select
                      required
                      value={formData.examId || ''}
                      onChange={(e) => setFormData({ ...formData, examId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                    >
                      <option value="">Select Exam</option>
                      {exams.map((ex) => (
                        <option key={ex._id} value={ex._id}>
                          {ex.title || ex.name || ex.code} ({ex.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Class *</label>
                      <select
                        required
                        value={formData.classId || ''}
                        onChange={(e) => {
                          const newClassId = e.target.value;
                          const validSubs = subjects.filter((s: any) => {
                            if (!newClassId) return true;
                            if (!s.classes || s.classes.length === 0) return true;
                            return s.classes.some((c: any) => (c?._id || c) === newClassId);
                          });
                          const nextSubId = validSubs.some((s) => s._id === formData.subjectId)
                            ? formData.subjectId
                            : '';
                          setFormData({ ...formData, classId: newClassId, subjectId: nextSubId });
                        }}
                        className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                      >
                        <option value="">Select Class</option>
                        {classes.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name || c.className || c.code}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Subject *</label>
                      <select
                        required
                        value={formData.subjectId || ''}
                        onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                      >
                        <option value="">
                          {formData.classId ? 'Select Subject' : 'Select Class first'}
                        </option>
                        {subjects
                          .filter((s: any) => {
                            if (!formData.classId) return true;
                            if (!s.classes || s.classes.length === 0) return true;
                            return s.classes.some((c: any) => (c?._id || c) === formData.classId);
                          })
                          .map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name || (s as any).subjectName} ({s.code || (s as any).subjectCode})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Exam Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.examDate || ''}
                      onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Start Time</label>
                      <input
                        type="text"
                        value={formData.startTime || '09:30'}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">End Time</label>
                      <input
                        type="text"
                        value={formData.endTime || '12:30'}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Max Marks *</label>
                      <input
                        type="number"
                        required
                        value={formData.maxMarks || 100}
                        onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Pass Marks *</label>
                      <input
                        type="number"
                        required
                        value={formData.passMarks || 40}
                        onChange={(e) => setFormData({ ...formData, passMarks: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>

              {activeTab === 'exams' ? (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={formLoading}
                    onClick={() => handleSaveExam('DRAFT')}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold uppercase hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    {formLoading ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button
                    type="button"
                    disabled={formLoading}
                    onClick={() => handleSaveExam('PUBLISHED')}
                    className="px-5 py-2 bg-[#23804A] text-white rounded-lg text-xs font-bold uppercase hover:bg-[#1B6F41] cursor-pointer shadow-xs transition-colors flex items-center"
                  >
                    <Globe className="w-3.5 h-3.5 mr-1.5" />
                    {formLoading ? 'Publishing...' : editingItem?.status === 'PUBLISHED' ? 'Save & Keep Published' : 'Publish Examination'}
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  form="schedule-form"
                  disabled={formLoading}
                  className="px-5 py-2 bg-[#23804A] text-white rounded-lg text-xs font-bold uppercase hover:bg-[#1B6F41] cursor-pointer shadow-xs"
                >
                  {formLoading ? 'Saving...' : editingItem ? 'Update Schedule' : 'Create Schedule'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


