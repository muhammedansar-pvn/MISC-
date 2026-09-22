'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getExams, getExamSchedules } from '@/services/exam.service';
import { Exam, ExamSchedule } from '@/types';
import {
  Calendar,
  Clock,
  CheckSquare,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

export default function FacultyExaminationsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadExamsData() {
      try {
        setLoading(true);
        const [examsRes, schedulesRes] = await Promise.allSettled([
          getExams(),
          getExamSchedules(),
        ]);

        if (examsRes.status === 'fulfilled' && examsRes.value.success && Array.isArray(examsRes.value.data)) {
          setExams(examsRes.value.data);
          if (examsRes.value.data.length > 0) {
            setSelectedExamId(examsRes.value.data[0]._id);
          }
        }

        if (schedulesRes.status === 'fulfilled' && schedulesRes.value.success && Array.isArray(schedulesRes.value.data)) {
          setSchedules(schedulesRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load exam data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadExamsData();
  }, []);

  const filteredSchedules = schedules.filter((s) => {
    if (!selectedExamId) return true;
    const examId = (s.examId as any)?._id || s.examId;
    return examId === selectedExamId;
  });

  const selectedExam = exams.find((e) => e._id === selectedExamId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-28 bg-slate-200/70 animate-pulse rounded-2xl" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-200/70 animate-pulse rounded-xl" />
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
            <Link href="/faculty" className="hover:text-[#2F7C7A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Exam Schedules</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Examination Schedules & Papers
          </h1>
        </div>

        <Link
          href="/faculty/marks"
          className="inline-flex items-center text-xs font-semibold text-white px-4 py-2 rounded-lg bg-[#2F7C7A] hover:bg-[#286b69] shadow-2xs transition-all self-start sm:self-auto"
        >
          <CheckSquare className="w-3.5 h-3.5 mr-1.5" /> Open Mark Entry Workspace
        </Link>
      </div>

      {/* Select Examination */}
      {exams.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8E0] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-[#132238]">Select Examination Term</h2>
              <p className="text-xs text-slate-500">
                Choose an active or scheduled examination session to view scheduled papers.
              </p>
            </div>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-800"
            >
              {exams.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.title || exam.name || 'Exam'} ({exam.examCode || exam.code || 'TERM'})
                </option>
              ))}
            </select>
          </div>

          {selectedExam && (
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Exam Term / Code</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedExam.title} ({selectedExam.examCode || selectedExam.code})</p>
              </div>
              <div>
                <span className="text-slate-400">Duration</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {selectedExam.startDate ? new Date(selectedExam.startDate).toLocaleDateString('en-GB') : 'TBD'} to{' '}
                  {selectedExam.endDate ? new Date(selectedExam.endDate).toLocaleDateString('en-GB') : 'TBD'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Term Status</span>
                <p className="font-bold text-emerald-700 mt-0.5">{selectedExam.status || 'SCHEDULED'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timetable Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-serif text-[#132238]">Scheduled Papers</h2>
          <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
            {filteredSchedules.length} Papers
          </span>
        </div>

        {filteredSchedules.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-[#E2E8E0] space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No examination schedules found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no paper timetables registered under this examination term.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8E0] text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Subject Paper</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Session Timing</th>
                  <th className="p-4">Max Marks</th>
                  <th className="p-4">Pass Marks</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchedules.map((sch) => {
                  const subject = (sch.subjectId as any);
                  const cls = (sch.classId as any);

                  return (
                    <tr key={sch._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">
                          {subject?.name || 'Subject'}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">
                          {subject?.code || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-800">
                        {cls?.name || cls?.className || 'Class Cohort'}
                      </td>
                      <td className="p-4 font-medium text-slate-800">
                        {sch.examDate ? new Date(sch.examDate).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }) : 'TBD'}
                      </td>
                      <td className="p-4 text-slate-600">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#2F7C7A]" />
                          <span>{sch.startTime} - {sch.endTime}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {sch.maxMarks}
                      </td>
                      <td className="p-4 font-mono text-emerald-700 font-semibold">
                        {sch.passMarks || sch.passingMarks || '-'}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/faculty/marks?examScheduleId=${sch._id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#2F7C7A] hover:bg-[#286b69] text-white text-xs font-semibold shadow-2xs transition-all"
                        >
                          <CheckSquare className="w-3 h-3 mr-1" /> Enter Marks
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
