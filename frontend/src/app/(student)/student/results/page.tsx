'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getExamResults } from '@/services/exam.service';
import { ExamResult } from '@/types';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from 'lucide-react';

export default function StudentResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);

  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        const res = await getExamResults();
        if (res.success && Array.isArray(res.data)) {
          setResults(res.data);
          // auto-expand the first term if available
          if (res.data.length > 0) {
            setExpandedResultId(res.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load student results:', err);
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedResultId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200/70 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200/70 animate-pulse rounded-xl" />
      </div>
    );
  }

  // Pure arithmetic calculations from backend values
  const totalExams = results.length;
  const passedCount = results.filter(
    (r) => r.resultStatus === 'PASSED' || r.resultStatus === 'PASS'
  ).length;
  const avgPercentage =
    totalExams > 0
      ? Math.round(
          (results.reduce((acc, r) => acc + (r.percentage || 0), 0) / totalExams) * 10
        ) / 10
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/student" className="hover:text-[#2F7C7A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Results</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Examination Results & Academic Scorecards
          </h1>
        </div>

        <Link
          href="/student/transcript"
          className="inline-flex items-center text-xs font-semibold text-white px-4 py-2 rounded-lg bg-[#2F7C7A] hover:bg-[#286b69] shadow-2xs transition-all self-start sm:self-auto"
        >
          <FileText className="w-3.5 h-3.5 mr-1.5" /> View Official Transcript
        </Link>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Examinations
          </span>
          <p className="text-2xl font-bold text-[#132238]">{totalExams}</p>
          <p className="text-xs text-slate-400">{passedCount} terms cleared successfully</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overall Pass Rate
          </span>
          <p className="text-2xl font-bold text-emerald-700">
            {totalExams > 0 ? Math.round((passedCount / totalExams) * 100) : 0}%
          </p>
          <p className="text-xs text-slate-400">Published official outcomes</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Average Score
          </span>
          <p className="text-2xl font-bold text-[#2F7C7A]">{avgPercentage}%</p>
          <p className="text-xs text-slate-400">Mean aggregate across terms</p>
        </div>
      </div>

      {/* Results Scorecards / Table */}
      {results.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E2E8E0] space-y-3">
          <Award className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No examination results available</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your exam results will appear here once verified and officially published by the council examination board.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-serif text-[#132238]">Term Scorecards</h2>
          <div className="space-y-4">
            {results.map((res) => {
              const exam = (res.examId as any);
              const isPassed = res.resultStatus === 'PASSED' || res.resultStatus === 'PASS';
              const isFailed = res.resultStatus === 'FAILED' || res.resultStatus === 'FAIL';
              const isExpanded = expandedResultId === res._id;
              const subjects: any[] = (res as any).subjectResults || [];

              return (
                <div
                  key={res._id}
                  className="bg-white rounded-2xl border border-[#E2E8E0] shadow-2xs overflow-hidden transition-all"
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => toggleExpand(res._id)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-base text-[#132238]">
                          {exam?.title || 'Examination'}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {exam?.examCode || exam?.code || 'TERM'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Published:{' '}
                        {res.publishedAt || res.createdAt
                          ? new Date((res.publishedAt || res.createdAt)!).toLocaleDateString('en-GB')
                          : 'Official'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 sm:space-x-6">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Marks</span>
                        <p className="font-mono font-bold text-slate-900 text-sm">
                          {res.totalMarksObtained} <span className="text-xs text-slate-400">/ {res.totalMaxMarks}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Percentage</span>
                        <p className="font-mono font-bold text-slate-900 text-sm">{res.percentage}%</p>
                      </div>

                      <div className="text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Grade</span>
                        <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-900 border border-slate-200 block mt-0.5">
                          {res.grade}
                        </span>
                      </div>

                      <div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            isPassed
                              ? 'bg-emerald-100 text-emerald-800'
                              : isFailed
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isPassed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          ) : isFailed ? (
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 mr-1" />
                          )}
                          {res.resultStatus}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-600 p-1"
                        aria-label="Toggle subject details"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Subject-wise Scorecard */}
                  {isExpanded && (
                    <div className="border-t border-[#E2E8E0] bg-slate-50/50 p-5 space-y-3">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                        <BookOpen className="w-4 h-4 text-[#2F7C7A]" />
                        <span>Subject-wise Breakdown</span>
                      </div>

                      {subjects.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">
                          Detailed subject breakdown pending official publication.
                        </p>
                      ) : (
                        <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-2xs">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                                <th className="p-3">#</th>
                                <th className="p-3">Curriculum Subject</th>
                                <th className="p-3 text-center">Marks Obtained</th>
                                <th className="p-3 text-center">Max Marks</th>
                                <th className="p-3 text-center">Passing Threshold</th>
                                <th className="p-3 text-center">Subject Grade</th>
                                <th className="p-3 text-right">Outcome</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {subjects.map((sub, sIdx) => {
                                const subPassed = sub.resultStatus === 'PASSED';
                                return (
                                  <tr key={sub.subjectId || sIdx} className="hover:bg-slate-50/50">
                                    <td className="p-3 text-slate-400 font-mono text-[11px]">
                                      {sIdx + 1}
                                    </td>
                                    <td className="p-3">
                                      <div className="font-bold text-slate-900">{sub.subjectName}</div>
                                      {sub.subjectCode && (
                                        <div className="font-mono text-[10px] text-slate-400">{sub.subjectCode}</div>
                                      )}
                                    </td>
                                    <td className="p-3 text-center font-mono font-bold text-slate-900 text-sm">
                                      {sub.isAbsent ? (
                                        <span className="text-rose-600 font-bold text-xs">ABSENT</span>
                                      ) : (
                                        sub.marksObtained
                                      )}
                                    </td>
                                    <td className="p-3 text-center font-mono text-slate-500">
                                      {sub.maxMarks}
                                    </td>
                                    <td className="p-3 text-center font-mono text-slate-500">
                                      {sub.passMarks}
                                    </td>
                                    <td className="p-3 text-center">
                                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                                        {sub.grade}
                                      </span>
                                    </td>
                                    <td className="p-3 text-right">
                                      <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                          subPassed
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-rose-100 text-rose-800'
                                        }`}
                                      >
                                        {subPassed ? 'PASS' : 'FAIL'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
