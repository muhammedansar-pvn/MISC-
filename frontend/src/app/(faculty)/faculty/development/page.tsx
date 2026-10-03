'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { getMyClasses, getMyStudents } from '@/services/faculty.service';
import { recordDevelopmentScore, getStudentDevelopmentScores } from '@/services/development.service';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
  User,
  GraduationCap,
  Sparkles,
  BookOpen,
  Award,
  Compass,
} from 'lucide-react';

function FacultyDevelopmentContent() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('TERM_1');
  const [existingScores, setExistingScores] = useState<any[]>([]);

  // Scores state
  const [academicScore, setAcademicScore] = useState<number>(0);
  const [arabicScore, setArabicScore] = useState<number>(0);
  const [englishScore, setEnglishScore] = useState<number>(0);
  const [urduScore, setUrduScore] = useState<number>(0);
  const [spiritualScore, setSpiritualScore] = useState<number>(0);
  const [skillScore, setSkillScore] = useState<number>(0);
  const [leadershipScore, setLeadershipScore] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('');

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
        console.error('Failed to load assigned classes:', err);
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
      setExistingScores([]);
      return;
    }
    async function loadScores() {
      try {
        const res = await getStudentDevelopmentScores(selectedStudentId);
        if (res.success && Array.isArray(res.data)) {
          setExistingScores(res.data);
          // Auto-fill if score for selectedTerm exists
          const termScore = res.data.find((s: any) => s.term === selectedTerm);
          if (termScore) {
            setAcademicScore(termScore.academicScore || 0);
            setArabicScore(termScore.linguisticScore?.arabic || 0);
            setEnglishScore(termScore.linguisticScore?.english || 0);
            setUrduScore(termScore.linguisticScore?.urdu || 0);
            setSpiritualScore(termScore.spiritualScore || 0);
            setSkillScore(termScore.skillScore || 0);
            setLeadershipScore(termScore.leadershipScore || 0);
            setRemarks(termScore.remarks || '');
          } else {
            resetScores();
          }
        }
      } catch (err) {
        console.error('Failed to load scores for student:', err);
      }
    }
    loadScores();
  }, [selectedStudentId, selectedTerm]);

  const resetScores = () => {
    setAcademicScore(0);
    setArabicScore(0);
    setEnglishScore(0);
    setUrduScore(0);
    setSpiritualScore(0);
    setSkillScore(0);
    setLeadershipScore(0);
    setRemarks('');
  };

  const linguisticAverage = Math.round(((arabicScore + englishScore + urduScore) / 3) * 10) / 10;
  const overallComputed = Math.round(
    ((academicScore + linguisticAverage + spiritualScore + skillScore + leadershipScore) / 5) * 10
  ) / 10;

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    try {
      setSaving(true);
      setSuccessMsg(null);
      setErrorMsg(null);

      const targetStudent = students.find((s) => s._id === selectedStudentId);
      const academicYearId = targetStudent?.academicYearId?._id || targetStudent?.academicYearId;

      const payload = {
        studentId: selectedStudentId,
        academicYearId,
        term: selectedTerm,
        academicScore: Number(academicScore),
        linguisticScore: {
          arabic: Number(arabicScore),
          english: Number(englishScore),
          urdu: Number(urduScore),
          overall: linguisticAverage,
        },
        spiritualScore: Number(spiritualScore),
        skillScore: Number(skillScore),
        leadershipScore: Number(leadershipScore),
        overallDevelopmentScore: overallComputed,
        remarks: remarks.trim(),
      };

      const res = await recordDevelopmentScore(payload as any);
      if (res.success) {
        setSuccessMsg('Student development evaluation saved successfully.');
        setTimeout(() => setSuccessMsg(null), 3000);
        // Reload scores
        const refreshed = await getStudentDevelopmentScores(selectedStudentId);
        if (refreshed.success && Array.isArray(refreshed.data)) {
          setExistingScores(refreshed.data);
        }
      } else {
        setErrorMsg(res.message || 'Failed to save evaluation');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error while saving evaluation');
    } finally {
      setSaving(false);
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
            <span className="text-slate-900 font-semibold">Student Development</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#171D19]">
            Student Holistic Development
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate and record developmental growth across Academic, Linguistic, Spiritual, Skill, and Leadership domains.
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
      <div className="p-5 bg-white rounded-xl border border-[#E3EAE5] shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
            Evaluation Term
          </label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#23804A] bg-white font-medium text-slate-800"
          >
            <option value="TERM_1">Term 1 (First Assessment)</option>
            <option value="TERM_2">Term 2 (Mid-Year Assessment)</option>
            <option value="TERM_3">Term 3 (Final Assessment)</option>
            <option value="ANNUAL">Annual Comprehensive</option>
          </select>
        </div>
      </div>

      {/* Evaluation Form */}
      {selectedStudentId ? (
        <form onSubmit={handleSaveEvaluation} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Domain Scores Left 2 Cols */}
            <div className="lg:col-span-2 space-y-4">
              {/* Domain 1: Academic */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                  <GraduationCap className="w-4 h-4 text-[#23804A]" />
                  <span>Academic Domain Score (0–100)</span>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={academicScore}
                    onChange={(e) => setAcademicScore(Number(e.target.value))}
                    className="flex-1 accent-[#23804A]"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={academicScore}
                    onChange={(e) => setAcademicScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-16 px-2 py-1 text-center font-bold text-sm border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Domain 2: Linguistic Breakdown */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                    <BookOpen className="w-4 h-4 text-[#23804A]" />
                    <span>Linguistic Domain (Arabic, English, Urdu)</span>
                  </div>
                  <span className="text-xs font-bold text-[#23804A] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Avg: {linguisticAverage}/100
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold">Arabic</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={arabicScore}
                      onChange={(e) => setArabicScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                      className="w-full mt-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-semibold">English</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={englishScore}
                      onChange={(e) => setEnglishScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                      className="w-full mt-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-semibold">Urdu</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={urduScore}
                      onChange={(e) => setUrduScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                      className="w-full mt-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Domain 3: Spiritual */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-[#23804A]" />
                  <span>Spiritual & Religious Observance (0–100)</span>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={spiritualScore}
                    onChange={(e) => setSpiritualScore(Number(e.target.value))}
                    className="flex-1 accent-[#23804A]"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={spiritualScore}
                    onChange={(e) => setSpiritualScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-16 px-2 py-1 text-center font-bold text-sm border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Domain 4 & 5: Skill and Leadership */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                    <Compass className="w-3.5 h-3.5 text-[#23804A]" />
                    <span>Skill & Competency (0–100)</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={skillScore}
                    onChange={(e) => setSkillScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg font-bold"
                  />
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5 text-[#23804A]" />
                    <span>Leadership & Character (0–100)</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={leadershipScore}
                    onChange={(e) => setLeadershipScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg font-bold"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Qualitative Observations & Development Remarks
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Record strengths, behavioral notes, and developmental recommendations..."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#23804A]"
                />
              </div>
            </div>

            {/* Right Summary & Save Card */}
            <div className="space-y-4">
              <div className="p-5 bg-white rounded-xl border border-[#E3EAE5] shadow-2xs space-y-4">
                <h3 className="font-bold text-sm text-[#171D19] border-b border-slate-100 pb-2">
                  Evaluation Summary
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Academic:</span>
                    <span className="font-bold text-slate-800">{academicScore}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Linguistic (Avg):</span>
                    <span className="font-bold text-slate-800">{linguisticAverage}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Spiritual:</span>
                    <span className="font-bold text-slate-800">{spiritualScore}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Skill:</span>
                    <span className="font-bold text-slate-800">{skillScore}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Leadership:</span>
                    <span className="font-bold text-slate-800">{leadershipScore}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-700 uppercase">Composite Index</span>
                  <span className="text-xl font-bold text-[#23804A]">{overallComputed}/100</span>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#23804A] hover:bg-[#1B6F41] rounded-lg shadow-2xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Evaluation'}</span>
                </button>
              </div>

              {/* Past Evaluations Timeline */}
              {existingScores.length > 0 && (
                <div className="p-5 bg-white rounded-xl border border-[#E3EAE5] shadow-2xs space-y-3">
                  <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                    Recorded Terms
                  </h4>
                  <div className="space-y-2">
                    {existingScores.map((sc: any) => (
                      <div
                        key={sc._id}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between items-center"
                      >
                        <span className="font-bold text-slate-700">{sc.term}</span>
                        <span className="font-bold text-[#23804A]">{sc.overallDevelopmentScore}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      ) : (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E3EAE5] space-y-3">
          <User className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No student selected</p>
          <p className="text-xs text-slate-400">Please select an assigned class and student to begin evaluation.</p>
        </div>
      )}
    </div>
  );
}

export default function FacultyDevelopmentPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 text-xs">
          Loading student development workspace...
        </div>
      }
    >
      <FacultyDevelopmentContent />
    </Suspense>
  );
}
