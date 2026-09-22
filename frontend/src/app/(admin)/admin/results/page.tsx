'use client';

import React, { useState, useEffect } from 'react';
import { Award, RefreshCw, AlertCircle, Play } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import { getExamResults, generateExamResults, getExams } from '@/services/exam.service';
import { getClasses } from '@/services/academic.service';
import { Exam, ClassLevel, ExamResult } from '@/types';

export default function AdminResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [classesList, setClassesList] = useState<ClassLevel[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Generator State
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [genMessage, setGenMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [resRes, exRes, clsRes] = await Promise.all([
        getExamResults().catch(() => ({ data: [] as ExamResult[] })),
        getExams().catch(() => ({ data: [] as Exam[] })),
        getClasses().catch(() => ({ data: [] as ClassLevel[] })),
      ]);

      const loadedResults = (resRes.data || []) as ExamResult[];
      const loadedExams = (exRes.data || []) as Exam[];
      const loadedClasses = (clsRes.data || []) as ClassLevel[];

      setResults(loadedResults);
      setExams(loadedExams);
      setClassesList(loadedClasses);

      if (loadedExams.length > 0 && !selectedExamId) {
        setSelectedExamId(loadedExams[0]._id);
      }
      if (loadedClasses.length > 0 && !selectedClassId) {
        setSelectedClassId(loadedClasses[0]._id);
      }
    } catch (err) {
      console.error('Failed to load exam results:', err);
      setError('Unable to load exam result records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId || !selectedClassId) {
      alert('Please select both an Exam and a Class.');
      return;
    }

    setGenLoading(true);
    setGenMessage('');

    try {
      const res = await generateExamResults({ examId: selectedExamId, classId: selectedClassId });
      setGenLoading(false);
      setGenMessage(res.message || 'Exam results generated successfully.');
      fetchData();
    } catch (err: any) {
      setGenLoading(false);
      alert(err.response?.data?.message || 'Failed to generate exam results.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-serif font-bold text-[#132238]">Exam Results & Transcripts</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
              {results.length} Published
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Generate final term grades, SGPAs, and publish student result transcripts</p>
        </div>
      </div>

      {/* Result Generation Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#132238]">Generate Batch Results</h3>
        {genMessage && (
          <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs rounded font-semibold">
            {genMessage}
          </div>
        )}
        <form onSubmit={handleGenerateResults} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Target Exam *</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-sm"
            >
              {exams.map((ex) => <option key={ex._id} value={ex._id}>{ex.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Target Class *</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-sm"
            >
              {classesList.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={genLoading}
            className="w-full py-2.5 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361] flex items-center justify-center cursor-pointer transition-colors"
          >
            {genLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {genLoading ? 'PROCESSING...' : 'GENERATE RESULTS'}
          </button>
        </form>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading result transcripts...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button onClick={fetchData} className="px-4 py-2 bg-[#2F7C7A] text-white font-bold text-xs rounded-lg uppercase cursor-pointer">
              <RefreshCw className="w-4 h-4 mr-2 inline" /> Retry
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Award className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-[#132238]">No generated results yet</h3>
            <p className="text-sm text-slate-500">Select an exam and class above to calculate and generate student transcripts.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#E2E8E0]">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Total Marks</th>
                  <th className="px-6 py-4">Percentage</th>
                  <th className="px-6 py-4">SGPA</th>
                  <th className="px-6 py-4">Grade</th>
                  <th className="px-6 py-4">Result Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {results.map((res: any) => (
                  <tr key={res._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#132238]">{res.studentId?.name || 'Student Record'}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{res.totalMarksObtained} / {res.totalMaxMarks}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{res.percentage}%</td>
                    <td className="px-6 py-4 font-bold text-[#2F7C7A]">{res.sgpa || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded-full border">
                        {res.grade || 'A'}
                      </span>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={res.resultStatus || 'PASS'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
