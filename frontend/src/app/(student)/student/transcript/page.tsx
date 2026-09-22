'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStudentProfile } from '@/services/student.service';
import { getExamResults } from '@/services/exam.service';
import { StudentProfile, ExamResult } from '@/types';
import {
  FileText,
  Printer,
  GraduationCap,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Award,
} from 'lucide-react';

export default function StudentTranscriptPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadTranscript() {
      try {
        setLoading(true);
        const [profRes, resRes] = await Promise.allSettled([
          getStudentProfile(),
          getExamResults(),
        ]);

        if (profRes.status === 'fulfilled' && profRes.value.success && profRes.value.data) {
          setProfile(profRes.value.data);
        }

        if (resRes.status === 'fulfilled' && resRes.value.success && Array.isArray(resRes.value.data)) {
          setResults(resRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load student transcript:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTranscript();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-96 bg-slate-200/70 animate-pulse rounded-2xl" />
      </div>
    );
  }

  const institution = (profile?.institutionId as any);
  const enrolledClass = (profile?.classId as any);

  // Cumulative math from existing backend results
  const totalMax = results.reduce((acc, r) => acc + (r.totalMaxMarks || 0), 0);
  const totalObtained = results.reduce((acc, r) => acc + (r.totalMarksObtained || 0), 0);
  const cumulativePercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : 0;
  const allPassed = results.length > 0 && results.every((r) => r.resultStatus === 'PASSED' || r.resultStatus === 'PASS');

  return (
    <div className="space-y-8">
      {/* Action Header (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/student" className="hover:text-[#2F7C7A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/student/results" className="hover:text-[#2F7C7A] transition-colors">
              Results
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Academic Transcript</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Official Academic Transcript
          </h1>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <Link
            href="/student/results"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#2F7C7A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Results
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[#2F7C7A] hover:bg-[#286b69] text-white text-xs font-semibold shadow-2xs transition-all"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Transcript
          </button>
        </div>
      </div>

      {/* Transcript Document View */}
      <div
        className="bg-white rounded-2xl border border-[#E2E8E0] p-6 sm:p-12 shadow-sm space-y-8 max-w-4xl mx-auto"
        id="official-transcript"
      >
        {/* Document Header */}
        <div className="text-center border-b-2 border-[#132238] pb-6 space-y-2">
          <div className="font-bold uppercase tracking-widest text-xs text-[#2F7C7A]">
            Markaz Integrated Studies Council (MISC)
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#132238] tracking-tight">
            CONSOLIDATED STATEMENT OF ACADEMIC RECORD
          </h2>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            OFFICIAL TRANSCRIPT OF EXAMINATION RESULTS
          </p>
        </div>

        {/* Candidate & Institutional Profile Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Candidate Name:</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              {profile?.nameEnglish || 'Enrolled Student'}
            </p>
            {profile?.nameArabic && (
              <p className="font-arabic text-[#2F7C7A] text-sm mt-0.5" dir="rtl">
                {profile.nameArabic}
              </p>
            )}
          </div>
          <div>
            <span className="text-slate-400 font-medium">Registration Number:</span>
            <p className="font-mono font-bold text-base text-[#132238] mt-0.5">
              {profile?.registrationNumber || 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Program / Class:</span>
            <p className="font-bold text-slate-800 mt-0.5">
              {enrolledClass?.className || 'General Curriculum'}{' '}
              {enrolledClass?.section ? `(${enrolledClass.section})` : ''}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Admission Session:</span>
            <p className="font-bold text-slate-800 mt-0.5">
              {profile?.admissionYear || 'Current Year'}
            </p>
          </div>
          <div className="sm:col-span-2 border-t border-slate-200 pt-3 mt-1">
            <span className="text-slate-400 font-medium">Affiliated Center / Institution:</span>
            <p className="font-bold text-slate-800 mt-0.5">
              {institution?.name || 'MISC Direct Academic Center'} ({institution?.code || 'MISC-HQ'})
            </p>
          </div>
        </div>

        {/* Results Records */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Examination Performance Record
          </h3>

          {results.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
              No examination results have been verified or published for this candidate yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-y border-slate-300 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">#</th>
                    <th className="p-3">Examination Session</th>
                    <th className="p-3 text-right">Max Marks</th>
                    <th className="p-3 text-right">Marks Scored</th>
                    <th className="p-3 text-right">Percentage</th>
                    <th className="p-3 text-center">Grade</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {results.map((r, idx) => {
                    const exam = (r.examId as any);
                    const isPass = r.resultStatus === 'PASSED' || r.resultStatus === 'PASS';
                    return (
                      <tr key={r._id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-medium text-slate-900">
                          {exam?.title || 'Term Examination'}
                          <span className="font-mono text-[10px] text-slate-400 ml-2">
                            ({exam?.examCode || 'EXAM'})
                          </span>
                        </td>
                        <td className="p-3 font-mono text-right text-slate-600">{r.totalMaxMarks}</td>
                        <td className="p-3 font-mono font-bold text-right text-slate-900">
                          {r.totalMarksObtained}
                        </td>
                        <td className="p-3 font-mono text-right text-slate-800">{r.percentage}%</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-800">{r.grade}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isPass
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {r.resultStatus}
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

        {/* Cumulative Ledger Totals */}
        {results.length > 0 && (
          <div className="p-5 rounded-xl bg-slate-100 border border-slate-300 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  Grand Total Marks
                </span>
                <p className="font-mono font-bold text-base text-slate-900 mt-0.5">
                  {totalObtained} / {totalMax}
                </p>
              </div>

              <div>
                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  Cumulative Aggregate
                </span>
                <p className="font-mono font-bold text-base text-[#2F7C7A] mt-0.5">
                  {cumulativePercentage}%
                </p>
              </div>

              <div>
                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  Standing
                </span>
                <p className="font-bold text-sm text-emerald-800 mt-0.5">
                  {allPassed ? 'Passed All Terms' : 'Under Review'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Authentication Seal & Signatures */}
        <div className="pt-12 flex flex-col sm:flex-row items-center justify-between gap-8 text-xs text-slate-500 border-t border-slate-300">
          <div className="text-center sm:text-left">
            <div className="w-40 border-b border-slate-400 mb-1.5" />
            <span className="font-semibold text-slate-700">Dean of Academics</span>
            <p className="text-[10px] text-slate-400">Markaz Integrated Studies</p>
          </div>

          <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 uppercase font-bold text-center p-2">
            Official Council Seal
          </div>

          <div className="text-center sm:text-right">
            <div className="w-40 border-b border-slate-400 mb-1.5 ml-auto" />
            <span className="font-semibold text-slate-700">Registrar / Controller</span>
            <p className="text-[10px] text-slate-400">Council Examination Division</p>
          </div>
        </div>
      </div>
    </div>
  );
}
