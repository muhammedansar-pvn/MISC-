'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getFacultyById } from '@/services/faculty.service';
import { FacultyProfile } from '@/types';
import {
  User,
  Building2,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  BookOpen,
  Award,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Briefcase,
} from 'lucide-react';

export default function FacultyProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFacultyProfile() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Attempt to fetch profile if linked
        const res = await getFacultyById(user.id);
        if (res.success && res.data) {
          setProfile(res.data);
        }
      } catch (err) {
        // Faculty user account is active, institutional record may be pending linkage
      } finally {
        setLoading(false);
      }
    }

    loadFacultyProfile();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-52 bg-slate-200/70 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200/70 animate-pulse rounded-xl" />
          <div className="h-64 bg-slate-200/70 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  const institution = (profile?.institutionId as any);

  return (
    <div className="space-y-8">
      {/* Header Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/faculty" className="hover:text-[#2F7C7A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Faculty Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Academic Faculty Profile
          </h1>
        </div>

        <Link
          href="/faculty"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#2F7C7A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Identity Hero Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#132238] to-[#2F7C7A] text-white flex items-center justify-center font-bold font-serif text-3xl shrink-0 shadow-md">
            {profile?.photo ? (
              <img
                src={profile.photo}
                alt={profile.nameEnglish || user?.name || 'Faculty'}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              (profile?.nameEnglish || user?.name || user?.username || 'F')[0].toUpperCase()
            )}
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#132238]">
                {profile?.nameEnglish || user?.name || user?.username || 'Faculty Instructor'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
                Authorized Evaluator
              </span>
            </div>

            {profile?.nameArabic && (
              <p className="font-arabic text-lg text-[#2F7C7A]" dir="rtl">
                {profile.nameArabic}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 pt-1">
              <div className="flex items-center space-x-1.5">
                <Briefcase className="w-4 h-4 text-[#2F7C7A]" />
                <span className="font-medium text-slate-700">
                  {profile?.designation || user?.department || 'Academic Faculty'}
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-[#2F7C7A]" />
                <span className="truncate max-w-xs">{institution?.name || 'Markaz Affiliated Center'}</span>
              </div>
              {profile?.facultyId && (
                <div className="flex items-center space-x-1 font-mono">
                  <span className="text-slate-400">Faculty ID:</span>
                  <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {profile.facultyId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notice if profile linkage pending */}
      {!profile && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start space-x-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-900">Active Faculty User Account</p>
            <p className="text-slate-500 mt-0.5 leading-relaxed">
              Your credentials are authenticated as an authorized faculty instructor. Detailed institutional biographic records (qualifications, joining date, and designation) will populate once synchronized by your institution administrator.
            </p>
          </div>
        </div>
      )}

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Professional & Qualifications */}
        <div className="bg-white rounded-xl border border-[#E2E8E0] p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#E2E8E0] pb-3">
            <GraduationCap className="w-5 h-5 text-[#2F7C7A]" />
            <h3 className="font-bold text-sm text-[#132238]">Professional & Academic Credentials</h3>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="text-slate-400 font-medium">Designation / Rank</dt>
              <dd className="font-bold text-slate-900 mt-0.5">
                {profile?.designation || user?.department || 'Instructor / Lecturer'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Joining Year</dt>
              <dd className="font-bold text-slate-900 mt-0.5">
                {profile?.joiningYear || 'Current Session'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Academic Qualification</dt>
              <dd className="font-bold text-slate-900 mt-0.5">
                {profile?.academicQualification || 'Degree on File'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Islamic Qualification</dt>
              <dd className="font-bold text-slate-900 mt-0.5">
                {profile?.islamicQualification || 'Certificate on File'}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-400 font-medium">Prior Teaching Experience</dt>
              <dd className="text-slate-700 mt-0.5 leading-relaxed">
                {profile?.previousExperience || 'Verified institutional teaching background.'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Institutional & Contact Information */}
        <div className="bg-white rounded-xl border border-[#E2E8E0] p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#E2E8E0] pb-3">
            <Building2 className="w-5 h-5 text-[#2F7C7A]" />
            <h3 className="font-bold text-sm text-[#132238]">Institution & Contact Details</h3>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="text-slate-400 font-medium">Institution Name</dt>
              <dd className="font-bold text-slate-900 mt-0.5">
                {institution?.name || 'MISC Affiliated Academic Centre'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Institution Code</dt>
              <dd className="font-mono font-bold text-slate-900 mt-0.5">
                {institution?.code || 'MISC-HQ'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Registered User Email</dt>
              <dd className="font-bold text-slate-900 mt-0.5 truncate">
                {user?.email || 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Contact Phone</dt>
              <dd className="font-bold text-slate-900 mt-0.5">
                {profile?.contactNumber || user?.mobile || 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Place of Origin (English)</dt>
              <dd className="font-bold text-slate-900 mt-0.5">
                {profile?.placeEnglish || 'N/A'}
              </dd>
            </div>
            {profile?.placeArabic && (
              <div>
                <dt className="text-slate-400 font-medium">Place of Origin (Arabic)</dt>
                <dd className="font-arabic font-bold text-slate-900 mt-0.5" dir="rtl">
                  {profile.placeArabic}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
