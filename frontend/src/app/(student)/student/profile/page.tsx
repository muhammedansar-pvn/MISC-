'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getStudentProfile } from '@/services/student.service';
import { StudentProfile } from '@/types';
import {
  User,
  Building2,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Users,
  ShieldCheck,
  ArrowLeft,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);
        const res = await getStudentProfile();
        if (res.success && res.data) {
          setProfile(res.data);
        } else {
          setError(res.message || 'Student profile not found.');
        }
      } catch (err: any) {
        console.error('Failed to load student profile:', err);
        setError(err.response?.data?.message || 'Failed to retrieve profile.');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-64 bg-slate-200/70 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200/70 animate-pulse rounded-xl" />
          <div className="h-64 bg-slate-200/70 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  const institution = (profile?.institutionId as any);
  const enrolledClass = (profile?.classId as any);

  return (
    <div className="space-y-8">
      {/* Header Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/student" className="hover:text-[#2F7C7A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">My Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Student Academic Profile
          </h1>
        </div>

        <Link
          href="/student"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#2F7C7A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
        </Link>
      </div>

      {error || !profile ? (
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8E0] shadow-2xs text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Student Profile Not Linked</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your user account is logged in as <span className="font-semibold text-slate-800">{user?.email}</span>, but your official student record has not been linked by your institution yet.
          </p>
          <div className="pt-2">
            <Link
              href="/student"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#2F7C7A] text-white text-xs font-semibold"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Identity Hero Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8E0] p-6 sm:p-8 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#132238] to-[#2F7C7A] text-white flex items-center justify-center font-bold font-serif text-3xl shrink-0 shadow-md">
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt={profile.nameEnglish || 'Student'}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  profile.nameEnglish?.[0]?.toUpperCase() || 'S'
                )}
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#132238]">
                    {profile.nameEnglish}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active Student
                  </span>
                </div>

                {profile.nameArabic && (
                  <p className="font-arabic text-lg text-[#2F7C7A]" dir="rtl">
                    {profile.nameArabic}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 pt-1">
                  <div className="flex items-center space-x-1.5 font-mono">
                    <span className="text-slate-400">Reg No:</span>
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {profile.registrationNumber}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <GraduationCap className="w-4 h-4 text-[#2F7C7A]" />
                    <span>
                      {enrolledClass?.className || 'Class N/A'}{' '}
                      {enrolledClass?.section ? `(${enrolledClass.section})` : ''}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Building2 className="w-4 h-4 text-[#2F7C7A]" />
                    <span className="truncate max-w-xs">{institution?.name || 'Institution N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Academic & Institutional Info */}
            <div className="bg-white rounded-xl border border-[#E2E8E0] p-6 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#E2E8E0] pb-3">
                <GraduationCap className="w-5 h-5 text-[#2F7C7A]" />
                <h3 className="font-bold text-sm text-[#132238]">Academic Enrollment Details</h3>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <dt className="text-slate-400 font-medium">Class / Program</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {enrolledClass?.className || 'Not Assigned'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Section</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {enrolledClass?.section || 'Default'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Institution Name</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {institution?.name || 'Council Direct'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Institution Code</dt>
                  <dd className="font-mono font-bold text-slate-900 mt-0.5">
                    {institution?.code || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Admission Year</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {profile.admissionYear || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Council Registration</dt>
                  <dd className="font-mono font-bold text-[#2F7C7A] mt-0.5">
                    {profile.registrationNumber}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Personal & Biographic Info */}
            <div className="bg-white rounded-xl border border-[#E2E8E0] p-6 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#E2E8E0] pb-3">
                <User className="w-5 h-5 text-[#2F7C7A]" />
                <h3 className="font-bold text-sm text-[#132238]">Personal & Guardian Details</h3>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <dt className="text-slate-400 font-medium">Date of Birth</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {profile.dateOfBirth
                      ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Father's Name</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {profile.fatherName || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Mother's Name</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {profile.motherName || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Place of Origin (English)</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {profile.placeEnglish || 'N/A'}
                  </dd>
                </div>
                {profile.placeArabic && (
                  <div>
                    <dt className="text-slate-400 font-medium">Place of Origin (Arabic)</dt>
                    <dd className="font-arabic font-bold text-slate-900 mt-0.5" dir="rtl">
                      {profile.placeArabic}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-slate-400 font-medium">Contact Phone</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {profile.contactNumber || (user as any)?.phone || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Registered User Email</dt>
                  <dd className="font-bold text-slate-900 mt-0.5 truncate">
                    {user?.email || 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
