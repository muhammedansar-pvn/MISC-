'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getExamResults, getExams } from '@/services/exam.service';
import { getClasses } from '@/services/academic.service';
import { ExamResult, Exam, ClassModel } from '@/types';
import {
  Award,
  Search,
  Filter,
  Eye,
  X,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Calendar,
  BookOpen,
  ArrowLeft,
  FileText,
} from 'lucide-react';

export default function InstitutionResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // View Result Detail Modal
  const [viewResult, setViewResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    async function loadResultsData() {
      try {
        setLoading(true);
        const [resRes, exRes, clsRes] = await Promise.allSettled([
          getExamResults(),
          getExams(),
          getClasses(),
        ]);

        if (resRes.status === 'fulfilled' && resRes.value.success && Array.isArray(resRes.value.data)) {
          setResults(resRes.value.data);
        }
        if (exRes.status === 'fulfilled' && exRes.value.success && Array.isArray(exRes.value.data)) {
          setExams(exRes.value.data);
        }
        if (clsRes.status === 'fulfilled' && clsRes.value.success && Array.isArray(clsRes.value.data)) {
          setClasses(clsRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load institution exam results:', err);
      } finally {
        setLoading(false);
      }
    }

    loadResultsData();
  }, []);

  const filteredResults = results.filter((res) => {
    const exId = (res.examId as any)?._id || res.examId;
    const clsId = ((res as any).classId as any)?._id || (res as any).classId;
    const stu = (res.studentId as any);
    const stuName = (stu?.nameEnglish || '').toLowerCase();
    const regNum = (stu?.registrationNumber || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const examMatch = !selectedExamId || exId === selectedExamId;
    const classMatch = !selectedClassId || clsId === selectedClassId;
    const searchMatch = !q || stuName.includes(q) || regNum.includes(q);
    const statusMatch = statusFilter === 'ALL' || (res.resultStatus || 'PASSED') === statusFilter;

    return examMatch && classMatch && searchMatch && statusMatch;
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
            <span className="text-slate-900 font-semibold">Results</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#132238]">
            Institutional Examination Results
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Declared board examination scores, candidate transcripts, and performance moderation.
          </p>
        </div>

        <Link
          href="/institution/dashboard"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8E0] shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by candidate name or registration number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-700 w-full sm:w-44"
          >
            <option value="">All Exams</option>
            {exams.map((ex) => (
              <option key={ex._id} value={ex._id}>
                {ex.name}
              </option>
            ))}
          </select>

          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-700 w-full sm:w-36"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name || cls.className}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-700 w-full sm:w-28"
          >
            <option value="ALL">All Status</option>
            <option value="PASSED">PASSED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* Results Data Table */}
      <div className="bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No examination results found</p>
            <p className="text-xs text-slate-400 mt-1">
              {results.length === 0
                ? 'No board examination results have been declared for your campus yet.'
                : 'No results match your search filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8F5] border-b border-[#E2E8E0] text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Candidate Name</th>
                  <th className="p-4">Reg Number</th>
                  <th className="p-4">Examination</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Total Score</th>
                  <th className="p-4">Percentage</th>
                  <th className="p-4">Grade</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((res) => {
                  const stu = (res.studentId as any);
                  const ex = (res.examId as any);
                  const cls = ((res as any).classId as any);
                  const isPassed = (res.resultStatus || 'PASSED') === 'PASSED';
                  return (
                    <tr key={res._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-bold text-slate-900">
                        {stu?.nameEnglish || 'Candidate Student'}
                      </td>
                      <td className="p-4 font-mono text-slate-700">
                        {stu?.registrationNumber || '—'}
                      </td>
                      <td className="p-4 text-slate-700 font-medium">
                        {ex?.name || 'Examination'}
                      </td>
                      <td className="p-4 text-slate-600">
                        {cls?.name || cls?.className || '—'}
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {res.totalMarksObtained} <span className="text-slate-400 font-normal">/ {res.totalMaxMarks}</span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-800">
                        {res.percentage ? `${res.percentage}%` : '—'}
                      </td>
                      <td className="p-4 font-mono font-bold text-[#2F7C7A]">
                        {res.grade || (res as any).overallGrade || '—'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPassed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {res.resultStatus || 'DECLARED'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setViewResult(res)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-[#2F7C7A] transition-colors cursor-pointer"
                          title="View Breakdown"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Result Breakdown Modal */}
      {viewResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-[#2F7C7A]" />
                <h3 className="font-bold text-sm text-[#132238]">Candidate Examination Result</h3>
              </div>
              <button
                onClick={() => setViewResult(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Candidate Summary Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Candidate</span>
                <p className="font-bold text-slate-900 mt-0.5">{(viewResult.studentId as any)?.nameEnglish || 'Student'}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Reg Number</span>
                <p className="font-mono font-bold text-slate-800 mt-0.5">{(viewResult.studentId as any)?.registrationNumber || '—'}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Overall Percentage</span>
                <p className="font-mono font-bold text-emerald-700 text-sm mt-0.5">{viewResult.percentage}%</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Grade Conferred</span>
                <p className="font-mono font-bold text-[#132238] text-sm mt-0.5">{viewResult.grade || (viewResult as any).overallGrade || 'PASS'}</p>
              </div>
            </div>

            {/* Subject Paper Breakdown */}
            <div>
              <h4 className="font-bold text-xs text-[#132238] uppercase tracking-wider mb-2">
                Subject Paper Breakdown
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F8F5] border-b border-slate-200 text-slate-600 text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Marks</th>
                      <th className="p-3">Max</th>
                      <th className="p-3">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Array.isArray((viewResult as any).subjectResults) && (viewResult as any).subjectResults.length > 0 ? (
                      (viewResult as any).subjectResults.map((sub: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-medium text-slate-800">
                            {sub.subjectId?.name || sub.subjectName || `Subject #${idx + 1}`}
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-900">{sub.marksObtained}</td>
                          <td className="p-3 font-mono text-slate-500">{sub.maxMarks}</td>
                          <td className="p-3 font-mono font-bold text-[#2F7C7A]">{sub.grade || '—'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400">
                          Consolidated result declared.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewResult(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
