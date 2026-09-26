'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getExamRegistrations, getExamSchedules } from '@/services/exam.service';
import { getStudentProfile } from '@/services/student.service';
import { ExamRegistration, ExamSchedule, StudentProfile } from '@/types';
import {
  FileCheck,
  Printer,
  Calendar,
  Building2,
  User,
  ShieldCheck,
  X,
  Clock,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

export default function StudentRegistrationsPage() {
  const [registrations, setRegistrations] = useState<ExamRegistration[]>([]);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [selectedHallTicket, setSelectedHallTicket] = useState<ExamRegistration | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadRegistrations() {
      try {
        setLoading(true);
        const [regRes, schedRes, profRes] = await Promise.allSettled([
          getExamRegistrations(),
          getExamSchedules(),
          getStudentProfile(),
        ]);

        if (regRes.status === 'fulfilled' && regRes.value.success && Array.isArray(regRes.value.data)) {
          setRegistrations(regRes.value.data);
        }

        if (schedRes.status === 'fulfilled' && schedRes.value.success && Array.isArray(schedRes.value.data)) {
          setSchedules(schedRes.value.data);
        }

        if (profRes.status === 'fulfilled' && profRes.value.success && profRes.value.data) {
          setProfile(profRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load exam registrations:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRegistrations();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200/70 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const institution = (profile?.institutionId as any);
  const enrolledClass = (profile?.classId as any);

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
            <Link href="/student/examinations" className="hover:text-[#2F7C7A] transition-colors">
              Examinations
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Registrations & Hall Tickets</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Exam Registrations & Hall Tickets
          </h1>
        </div>

        <Link
          href="/student/examinations"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#2F7C7A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Timetable
        </Link>
      </div>

      {/* Info Notice regarding registration workflow */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start space-x-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-[#2F7C7A] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-900">Institutional Candidate Verification</p>
          <p className="text-slate-500 mt-0.5 leading-relaxed">
            Examination registration and roll number allocation are officially processed by your institution and verified by the council. When your registration is approved and marked as <span className="font-semibold text-emerald-700">HALL_TICKET_ISSUED</span>, you may preview and print your official Admit Card below.
          </p>
        </div>
      </div>

      {/* Registrations List */}
      {registrations.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E2E8E0] space-y-3">
          <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No active exam registrations</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You do not currently have any registered examinations on record. Please contact your institution administrator if you believe this is an error.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => {
            const exam = (reg.examId as any);
            const isIssued = reg.registrationStatus === 'HALL_TICKET_ISSUED';
            const isCancelled = reg.registrationStatus === 'CANCELLED';

            return (
              <div
                key={reg._id}
                className="bg-white rounded-xl border border-[#E2E8E0] p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#2F7C7A] transition-all"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {exam?.examCode || 'EXAM'}
                    </span>
                    <h2 className="text-base font-bold text-[#132238]">{exam?.title || 'Examination Term'}</h2>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isIssued
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCancelled
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {reg.registrationStatus || 'REGISTERED'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <div className="flex items-center space-x-1 font-mono">
                      <span className="text-slate-400">Roll Number:</span>
                      <span className="font-bold text-slate-800">{reg.rollNumber || 'Under Generation'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Registered On:</span>{' '}
                      <span className="text-slate-700 font-medium">
                        {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('en-GB') : 'Verified'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-start md:self-auto shrink-0">
                  {isIssued ? (
                    <button
                      onClick={() => setSelectedHallTicket(reg)}
                      className="inline-flex items-center px-4 py-2.5 rounded-lg bg-[#2F7C7A] hover:bg-[#286b69] text-white text-xs font-semibold shadow-2xs transition-all"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1.5" /> View / Print Hall Ticket
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                      Admit Card in preparation
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Hall Ticket Printable Modal */}
      {selectedHallTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Actions Bar (hidden when printing) */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">Official Examination Hall Ticket</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Admit Card
                </button>
                <button
                  onClick={() => setSelectedHallTicket(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 sm:p-10 space-y-6 text-slate-900 bg-white" id="printable-hall-ticket">
              {/* Council Header */}
              <div className="text-center border-b-2 border-[#132238] pb-6 space-y-1">
                <div className="font-bold uppercase tracking-widest text-xs text-[#2F7C7A]">
                  Markaz Sanaviyya
                </div>
                <h2 className="text-2xl font-serif font-bold text-[#132238]">
                  EXAMINATION ADMIT CARD / HALL TICKET
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  {(selectedHallTicket.examId as any)?.title || 'Examination Session'}
                </p>
              </div>

              {/* Student Candidate Identification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400">Candidate Name:</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {profile?.nameEnglish || 'Student Candidate'}
                  </p>
                  {profile?.nameArabic && (
                    <p className="font-arabic text-emerald-800 text-sm" dir="rtl">
                      {profile.nameArabic}
                    </p>
                  )}
                </div>
                <div>
                  <span className="text-slate-400">Official Roll Number:</span>
                  <p className="font-mono font-bold text-lg text-[#132238] mt-0.5">
                    {selectedHallTicket.rollNumber}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Registration Number:</span>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">
                    {profile?.registrationNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Class:</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {enrolledClass?.name || enrolledClass?.code || enrolledClass?.className || 'Sanaviyya Standard'}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400">Institution:</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    Markaz Sanaviyya (SANAVIYYA)
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2 text-[11px] text-slate-600 border-t border-slate-200 pt-4">
                <p className="font-bold uppercase tracking-wider text-slate-800">
                  Important Examination Instructions:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-500">
                  <li>Candidates must present this Admit Card along with their official student identification.</li>
                  <li>Report to the examination hall at least 15 minutes before the scheduled start time.</li>
                  <li>Electronic devices, smartwatches, and unauthorized materials are strictly prohibited.</li>
                  <li>Maintain silence and adhere to the supervisor's instructions at all times.</li>
                </ul>
              </div>

              {/* Signatures */}
              <div className="pt-8 flex items-center justify-between text-xs text-slate-500 border-t border-dashed border-slate-300">
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  <span>Candidate Signature</span>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  <span>Controller of Examinations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
