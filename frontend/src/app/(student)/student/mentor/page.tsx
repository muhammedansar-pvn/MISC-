'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  Mail,
  Phone,
  Building2,
  Calendar,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { getMyMentor } from '@/services/mentor.service';
import { MentorAssignment } from '@/types';

export default function StudentMentorPage() {
  const [assignment, setAssignment] = useState<MentorAssignment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMentor(isManualRefresh = false) {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const res = await getMyMentor();
      if (res.success && res.data) {
        setAssignment(res.data);
      } else {
        setAssignment(null);
      }
    } catch (err: any) {
      console.error('Failed to load mentor assignment:', err);
      // If 404 or empty data
      if (err?.response?.status === 404) {
        setAssignment(null);
      } else {
        setError(err?.message || 'Failed to retrieve mentor information.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadMentor();
  }, []);

  const mentorProfile = assignment?.mentorId;
  const mentorUser = mentorProfile?.userId;
  const academicYear = assignment?.academicYearId;

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
            <span className="text-slate-900 font-semibold">My Mentor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Assigned Usthad / Mentor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Personal academic and spiritual guidance under the Markaz Sanaviyya Mentorship Program.
          </p>
        </div>

        <button
          onClick={() => loadMentor(true)}
          disabled={loading || refreshing}
          className="p-2 rounded-lg border border-[#E2E8E0] bg-white text-slate-600 hover:text-[#2F7C7A] hover:bg-slate-50 shadow-2xs transition-all disabled:opacity-50 self-start sm:self-auto"
          title="Refresh mentor details"
          aria-label="Refresh mentor details"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#2F7C7A]' : ''}`} />
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E2E8E0] p-8 animate-pulse">
            <div className="flex items-center space-x-5">
              <div className="w-20 h-20 rounded-full bg-slate-200" />
              <div className="space-y-3 flex-1">
                <div className="h-6 w-48 bg-slate-200 rounded-md" />
                <div className="h-4 w-32 bg-slate-200 rounded-md" />
                <div className="h-4 w-64 bg-slate-200 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-[#E2E8E0] p-12 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Unable to load mentor profile</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => loadMentor(true)}
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#2F7C7A] text-white hover:bg-[#286b69] transition-all"
          >
            Retry Connection
          </button>
        </div>
      ) : !assignment || !mentorProfile ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-[#E2E8E0] p-12 sm:p-16 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center mx-auto border border-[#2F7C7A]/20">
            <UserCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#132238]">No mentor assigned yet</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Your designated class mentor (Usthad) for the current academic year is being assigned by the academic council. Once assigned, their contact details and guidance schedule will appear here.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/student"
              className="inline-flex items-center text-xs font-semibold px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        /* Main Mentor Card */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E2E8E0] p-6 sm:p-8 shadow-2xs overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-start sm:items-center space-x-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#2F7C7A] to-[#3ca09d] text-white font-serif text-2xl font-bold flex items-center justify-center shadow-md shadow-[#2F7C7A]/20 shrink-0">
                  {mentorUser?.name ? mentorUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E6F2F1] text-[#2F7C7A] border border-[#2F7C7A]/20">
                      Assigned Mentor
                    </span>
                    <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Verified Faculty
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#132238]">
                    {mentorUser?.name || 'Usthad'}
                  </h2>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <span>Faculty ID: <span className="font-mono font-semibold text-slate-700">{mentorProfile.facultyId}</span></span>
                    {mentorProfile.department && (
                      <>
                        <span>•</span>
                        <span>{mentorProfile.department}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {academicYear && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 self-start md:self-auto text-xs space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Academic Session
                  </span>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2F7C7A]" />
                    {academicYear.yearName}
                  </p>
                </div>
              )}
            </div>

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
              {/* Email */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 space-y-2">
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <Mail className="w-4 h-4 text-[#2F7C7A]" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Official Email</span>
                </div>
                {mentorUser?.email ? (
                  <a
                    href={`mailto:${mentorUser.email}`}
                    className="text-sm font-semibold text-slate-800 hover:text-[#2F7C7A] transition-colors break-all block"
                  >
                    {mentorUser.email}
                  </a>
                ) : (
                  <p className="text-xs text-slate-400 italic">Not available</p>
                )}
              </div>

              {/* Mobile / Contact Number */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 space-y-2">
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <Phone className="w-4 h-4 text-[#2F7C7A]" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Contact Number</span>
                </div>
                {mentorUser?.mobile ? (
                  <a
                    href={`tel:${mentorUser.mobile}`}
                    className="text-sm font-semibold font-mono text-slate-800 hover:text-[#2F7C7A] transition-colors block"
                  >
                    {mentorUser.mobile}
                  </a>
                ) : (
                  <p className="text-xs text-slate-400 italic">Campus extension / reception</p>
                )}
              </div>

              {/* Department */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 space-y-2">
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <Building2 className="w-4 h-4 text-[#2F7C7A]" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Department</span>
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  {mentorProfile.department || 'Islamic Studies & Sanaviyya Faculty'}
                </p>
              </div>
            </div>
          </div>

          {/* Mentorship Information & Principles Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-[#E2E8E0] p-5 shadow-2xs space-y-2">
              <div className="flex items-center space-x-2 text-[#2F7C7A]">
                <BookOpen className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Role of Your Mentor (Usthad)
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your assigned Usthad is here to support your holistic development across Islamic studies, language acquisition, character development, and academic success. You may approach your mentor during designated office hours or consultation sessions.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8E0] p-5 shadow-2xs space-y-2">
              <div className="flex items-center space-x-2 text-[#2F7C7A]">
                <MessageSquare className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Guidance Consultations
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                For academic inquiries, leave reconciliations, or personal guidance, contact your Usthad directly via official email or visit the faculty department during scheduled advisor hours.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
