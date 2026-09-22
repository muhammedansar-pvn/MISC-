'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getExams,
  getExamSchedules,
  getExamRegistrations,
  registerStudentForExam,
} from '@/services/exam.service';
import { getInstitutions } from '@/services/institution.service';
import { getStudents } from '@/services/student.service';
import {
  Exam,
  ExamSchedule,
  ExamRegistration,
  Institution,
  StudentProfile,
} from '@/types';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  User,
  GraduationCap,
  Layers,
  ArrowLeft,
  Building2,
} from 'lucide-react';

export default function InstitutionExaminationsPage() {
  const [activeTab, setActiveTab] = useState<'schedules' | 'registrations'>('schedules');
  const [exams, setExams] = useState<Exam[]>([]);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [registrations, setRegistrations] = useState<ExamRegistration[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedExamId, setSelectedExamId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Register Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regForm, setRegForm] = useState({
    examId: '',
    studentId: '',
    rollNumber: '',
    registrationStatus: 'REGISTERED',
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadExamData();
  }, []);

  async function loadExamData() {
    try {
      setLoading(true);
      const [exRes, schRes, regRes, stuRes, instRes] = await Promise.allSettled([
        getExams(),
        getExamSchedules(),
        getExamRegistrations(),
        getStudents(),
        getInstitutions(),
      ]);

      if (exRes.status === 'fulfilled' && exRes.value.success && Array.isArray(exRes.value.data)) {
        setExams(exRes.value.data);
      }
      if (schRes.status === 'fulfilled' && schRes.value.success && Array.isArray(schRes.value.data)) {
        setSchedules(schRes.value.data);
      }
      if (regRes.status === 'fulfilled' && regRes.value.success && Array.isArray(regRes.value.data)) {
        setRegistrations(regRes.value.data);
      }
      if (stuRes.status === 'fulfilled' && stuRes.value.success && Array.isArray(stuRes.value.data)) {
        setStudents(stuRes.value.data);
      }
      if (instRes.status === 'fulfilled' && instRes.value.success && Array.isArray(instRes.value.data) && instRes.value.data.length > 0) {
        setInstitution(instRes.value.data[0]);
      }
    } catch (err) {
      console.error('Failed to load examination data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Candidate Exam Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regForm.examId) {
      setRegError('Please select a target examination.');
      return;
    }

    if (!regForm.studentId) {
      setRegError('Please select a candidate student.');
      return;
    }

    if (!regForm.rollNumber.trim()) {
      setRegError('Roll number / Candidate Hall Ticket Number is required.');
      return;
    }

    const instId = institution?._id;
    if (!instId) {
      setRegError('Institution profile identification not found.');
      return;
    }

    try {
      setRegLoading(true);
      const res = await registerStudentForExam({
        examId: regForm.examId,
        studentId: regForm.studentId,
        institutionId: instId,
        rollNumber: regForm.rollNumber.trim(),
        registrationStatus: regForm.registrationStatus,
      });

      if (res.success) {
        setRegSuccess('Candidate successfully registered for examination.');
        await loadExamData();
        setTimeout(() => {
          setShowRegisterModal(false);
          setRegSuccess(null);
          setRegForm({
            examId: '',
            studentId: '',
            rollNumber: '',
            registrationStatus: 'REGISTERED',
          });
        }, 1200);
      } else {
        setRegError(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setRegError(err.response?.data?.message || err.message || 'An error occurred during registration.');
    } finally {
      setRegLoading(false);
    }
  };

  const filteredSchedules = schedules.filter((sch) => {
    const exId = (sch.examId as any)?._id || sch.examId;
    const examMatch = !selectedExamId || exId === selectedExamId;
    const sub = (sch.subjectId as any);
    const subName = (sub?.name || '').toLowerCase();
    const searchMatch = !searchQuery || subName.includes(searchQuery.toLowerCase());
    return examMatch && searchMatch;
  });

  const filteredRegistrations = registrations.filter((reg) => {
    const exId = (reg.examId as any)?._id || reg.examId;
    const examMatch = !selectedExamId || exId === selectedExamId;
    const stu = (reg.studentId as any);
    const stuName = (stu?.nameEnglish || '').toLowerCase();
    const roll = (reg.rollNumber || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const searchMatch = !q || stuName.includes(q) || roll.includes(q);
    return examMatch && searchMatch;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/institution/dashboard" className="hover:text-[#2F7C7A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Examinations</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#132238]">
            Board Examinations & Registrations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized examination schedules, scheduled papers, and candidate registration management.
          </p>
        </div>

        <button
          onClick={() => {
            setRegError(null);
            setRegSuccess(null);
            setShowRegisterModal(true);
          }}
          className="inline-flex items-center space-x-2 bg-[#2F7C7A] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#256664] transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register Candidate for Exam</span>
        </button>
      </div>

      {/* Tabs & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#E2E8E0] pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'schedules'
                ? 'bg-[#132238] text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Exam Schedules</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === 'schedules' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {schedules.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('registrations')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'registrations'
                ? 'bg-[#132238] text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Candidate Registrations</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === 'registrations' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {registrations.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-700 w-full sm:w-56"
          >
            <option value="">All Examinations</option>
            {exams.map((ex) => (
              <option key={ex._id} value={ex._id}>
                {ex.name}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : activeTab === 'schedules' ? (
          /* View 1: Exam Schedules */
          filteredSchedules.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No examination schedules found</p>
              <p className="text-xs text-slate-400 mt-1">No scheduled papers match your filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F8F5] border-b border-[#E2E8E0] text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Examination</th>
                    <th className="p-4">Subject Paper</th>
                    <th className="p-4">Class Cohort</th>
                    <th className="p-4">Date & Session</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSchedules.map((sch) => {
                    const ex = (sch.examId as any);
                    const sub = (sch.subjectId as any);
                    const cls = (sch.classId as any);
                    return (
                      <tr key={sch._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{ex?.name || 'Examination'}</td>
                        <td className="p-4 font-medium text-slate-800">{sub?.name || 'Subject Paper'}</td>
                        <td className="p-4 text-slate-600">{cls?.name || cls?.className || '—'}</td>
                        <td className="p-4">
                          <span className="font-mono text-slate-800 font-medium block">
                            {sch.examDate ? new Date(sch.examDate).toLocaleDateString('en-GB') : 'TBA'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {sch.startTime && sch.endTime ? `${sch.startTime} - ${sch.endTime}` : 'Regular Session'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 font-mono">
                          {(sch as any).durationMinutes ? `${(sch as any).durationMinutes} mins` : 'Standard'}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-[#132238] font-mono">{sch.maxMarks}</span>
                          <span className="text-[10px] text-slate-400 ml-1">(Pass: {sch.passMarks || sch.passingMarks || '-'})</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* View 2: Candidate Registrations */
          filteredRegistrations.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No candidate registrations found</p>
              <p className="text-xs text-slate-400 mt-1">
                {registrations.length === 0
                  ? 'No candidates have been registered for examinations yet.'
                  : 'No registrations match your search filters.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F8F5] border-b border-[#E2E8E0] text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Roll Number</th>
                    <th className="p-4">Candidate Student</th>
                    <th className="p-4">Examination</th>
                    <th className="p-4">Registration Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.map((reg) => {
                    const ex = (reg.examId as any);
                    const stu = (reg.studentId as any);
                    return (
                      <tr key={reg._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-800">
                          {reg.rollNumber}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{stu?.nameEnglish || 'Candidate'}</div>
                          {stu?.registrationNumber && (
                            <span className="text-[11px] font-mono text-slate-400">Reg: {stu.registrationNumber}</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-700 font-medium">
                          {ex?.name || 'Board Examination'}
                        </td>
                        <td className="p-4 text-slate-600 font-mono">
                          {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('en-GB') : '—'}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              reg.registrationStatus === 'HALL_TICKET_ISSUED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : reg.registrationStatus === 'CANCELLED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-teal-50 text-[#2F7C7A] border border-[#2F7C7A]/20'
                            }`}
                          >
                            {reg.registrationStatus || 'REGISTERED'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Candidate Exam Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-[#2F7C7A]" />
                <h3 className="font-bold text-sm text-[#132238]">Register Candidate for Examination</h3>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {regError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{regSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Examination *</label>
                <select
                  required
                  value={regForm.examId}
                  onChange={(e) => setRegForm({ ...regForm, examId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-800"
                >
                  <option value="">-- Choose Examination --</option>
                  {exams.map((ex) => (
                    <option key={ex._id} value={ex._id}>
                      {ex.name} ({ex.examType || 'Board Evaluation'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Candidate Student *</label>
                <select
                  required
                  value={regForm.studentId}
                  onChange={(e) => setRegForm({ ...regForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-800"
                >
                  <option value="">-- Choose Candidate --</option>
                  {students.map((stu) => {
                    const cls = (stu.classId as any);
                    return (
                      <option key={stu._id} value={stu._id}>
                        {stu.nameEnglish} ({stu.registrationNumber || 'No Reg'}) • {cls?.name || cls?.className || 'Class'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Roll / Hall Ticket Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ROLL-2026-001"
                  value={regForm.rollNumber}
                  onChange={(e) => setRegForm({ ...regForm, rollNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Registration Status</label>
                <select
                  value={regForm.registrationStatus}
                  onChange={(e) => setRegForm({ ...regForm, registrationStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white text-slate-800"
                >
                  <option value="REGISTERED">REGISTERED</option>
                  <option value="HALL_TICKET_ISSUED">HALL_TICKET_ISSUED</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="px-5 py-2 bg-[#2F7C7A] text-white font-semibold rounded-lg hover:bg-[#256664] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {regLoading ? 'Registering...' : 'Register Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
