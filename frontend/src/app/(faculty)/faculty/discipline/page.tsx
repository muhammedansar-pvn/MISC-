'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { getMyClasses, getMyStudents } from '@/services/faculty.service';
import {
  recordDisciplineIncident,
  resolveDisciplineIncident,
  getStudentDisciplineRecords,
} from '@/services/discipline.service';
import { DisciplineRecord } from '@/types';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShieldAlert,
  Calendar,
  User,
  CheckSquare,
  Clock,
} from 'lucide-react';

function FacultyDisciplineContent() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [records, setRecords] = useState<DisciplineRecord[]>([]);

  // Incident form
  const [incidentType, setIncidentType] = useState('Disruptive Conduct');
  const [severity, setSeverity] = useState('LOW');
  const [demeritPoints, setDemeritPoints] = useState<number>(5);
  const [incidentDate, setIncidentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');

  // Resolution modal state
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionRemarks, setResolutionRemarks] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialClasses() {
      try {
        setLoading(true);
        const res = await getMyClasses();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setClasses(res.data);
          const rawClassId = res.data[0].classId as unknown;
          const firstClassId = typeof rawClassId === 'object' && rawClassId !== null ? (rawClassId as any)._id : res.data[0].classId;
          setSelectedClassId(firstClassId);
        }
      } catch (err) {
        console.error('Failed to load classes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialClasses();
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;
    async function loadStudents() {
      try {
        const res = await getMyStudents(selectedClassId);
        if (res.success && Array.isArray(res.data)) {
          setStudents(res.data);
          if (res.data.length > 0) {
            setSelectedStudentId(res.data[0]._id);
          } else {
            setSelectedStudentId('');
          }
        }
      } catch (err) {
        console.error('Failed to load students for class:', err);
      }
    }
    loadStudents();
  }, [selectedClassId]);

  useEffect(() => {
    if (!selectedStudentId) {
      setRecords([]);
      return;
    }
    loadDisciplineHistory();
  }, [selectedStudentId]);

  async function loadDisciplineHistory() {
    try {
      const res = await getStudentDisciplineRecords(selectedStudentId);
      if (res.success && Array.isArray(res.data)) {
        setRecords(res.data);
      }
    } catch (err) {
      console.error('Failed to load discipline records:', err);
    }
  }

  const handleRecordIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !description.trim()) return;

    try {
      setSaving(true);
      setSuccessMsg(null);
      setErrorMsg(null);

      const res = await recordDisciplineIncident({
        studentId: selectedStudentId,
        incidentType,
        severity,
        demeritPoints: Number(demeritPoints),
        description: description.trim(),
        actionTaken: actionTaken.trim(),
        incidentDate,
      });

      if (res.success) {
        setSuccessMsg('Disciplinary incident recorded successfully.');
        setDescription('');
        setActionTaken('');
        setTimeout(() => setSuccessMsg(null), 3000);
        await loadDisciplineHistory();
      } else {
        setErrorMsg(res.message || 'Failed to record incident');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error recording incident');
    } finally {
      setSaving(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      setSaving(true);
      setSuccessMsg(null);
      setErrorMsg(null);

      const res = await resolveDisciplineIncident(id, {
        resolutionRemarks: resolutionRemarks.trim(),
      });

      if (res.success) {
        setSuccessMsg('Disciplinary incident marked as resolved.');
        setResolvingId(null);
        setResolutionRemarks('');
        setTimeout(() => setSuccessMsg(null), 3000);
        await loadDisciplineHistory();
      } else {
        setErrorMsg(res.message || 'Failed to resolve incident');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error resolving incident');
    } finally {
      setSaving(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-12 bg-slate-200/70 animate-pulse rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200/70 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

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
            <span className="text-slate-900 font-semibold">Discipline & Conduct</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#171D19]">
            Discipline & Conduct Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Log disciplinary incidents, track conduct points, and record behavioral actions for authorized students.
          </p>
        </div>

        <Link
          href="/faculty"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#23804A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Cohort & Student Selection */}
      <div className="p-5 bg-white rounded-xl border border-[#E3EAE5] shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
            Assigned Class
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#23804A] bg-white font-medium text-slate-800"
          >
            {classes.map((c) => (
              <option key={c._id || c.classId?._id} value={c.classId?._id || c._id}>
                {c.className || c.classId?.name} ({c.classCode || c.classId?.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
            Target Student
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#23804A] bg-white font-medium text-slate-800"
          >
            {students.length === 0 ? (
              <option value="">No enrolled students in class</option>
            ) : (
              students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.nameEnglish || s.userId?.name} ({s.registrationNumber || 'REG-NA'})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {selectedStudentId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Incident Entry Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleRecordIncident} className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-[#171D19] flex items-center space-x-1.5 border-b border-slate-100 pb-2.5">
                <Plus className="w-4 h-4 text-[#23804A]" />
                <span>Log Disciplinary Incident</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Incident Type</label>
                <input
                  type="text"
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  placeholder="e.g. Late Arrival, Uniform, Disruption"
                  required
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg font-medium bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Demerit Points</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={demeritPoints}
                    onChange={(e) => setDemeritPoints(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Incident Date</label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Description / Facts</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the incident objectively..."
                  required
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#23804A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Action Taken</label>
                <input
                  type="text"
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="e.g. Verbal warning, extra assignment"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={saving || !description.trim()}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#23804A] hover:bg-[#1B6F41] rounded-lg shadow-2xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{saving ? 'Recording...' : 'Submit Incident Report'}</span>
              </button>
            </form>
          </div>

          {/* Student Conduct History */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Student Conduct History ({records.length} incidents)
              </span>
              <span className="text-xs text-slate-400">Total Demerit: {records.reduce((acc, r) => acc + (r.demeritPoints || 0), 0)} pts</span>
            </div>

            {records.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-xl border border-[#E3EAE5] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Clean Conduct Record</p>
                <p className="text-xs text-slate-400">No disciplinary incidents logged for this student.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((r) => (
                  <div
                    key={r._id}
                    className={`p-4 rounded-xl border transition-all ${
                      r.resolved ? 'bg-slate-50/60 border-slate-200' : 'bg-white border-amber-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">{r.incidentType}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(r.severity)}`}>
                          {r.severity}
                        </span>
                        {r.demeritPoints > 0 && (
                          <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            -{r.demeritPoints} pts
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{new Date(r.incidentDate).toLocaleDateString()}</span>
                        </span>
                        {r.resolved ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Resolved
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setResolvingId(r._id)}
                            className="text-amber-700 hover:text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 hover:bg-amber-100 transition-colors"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">{r.description}</p>
                    {r.actionTaken && (
                      <p className="text-xs text-slate-500 mt-1 italic">
                        Action: <span className="text-slate-700 not-italic font-medium">{r.actionTaken}</span>
                      </p>
                    )}

                    {/* Resolution form if active */}
                    {resolvingId === r._id && (
                      <div className="mt-3 p-3 bg-amber-50/50 rounded-lg border border-amber-200 space-y-2">
                        <label className="block text-[11px] font-bold text-amber-900 uppercase">
                          Resolution Remarks & Outcome:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Completed counseling session, apologized"
                            value={resolutionRemarks}
                            onChange={(e) => setResolutionRemarks(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 text-xs border border-amber-300 rounded bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleResolve(r._id)}
                            className="px-3 py-1.5 bg-[#23804A] hover:bg-[#1B6F41] text-white text-xs font-bold rounded"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setResolvingId(null)}
                            className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FacultyDisciplinePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 text-xs">
          Loading discipline management workspace...
        </div>
      }
    >
      <FacultyDisciplineContent />
    </Suspense>
  );
}
