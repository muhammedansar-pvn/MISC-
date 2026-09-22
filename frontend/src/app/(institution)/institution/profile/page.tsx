'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getInstitutions } from '@/services/institution.service';
import { Institution } from '@/types';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Calendar,
  User,
  ArrowLeft,
  AlertCircle,
  FileText,
  Building,
} from 'lucide-react';

export default function InstitutionProfilePage() {
  const { user } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await getInstitutions();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setInstitution(res.data[0]);
        }
      } catch (err) {
        console.error('Failed to load institution profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-64 bg-slate-200/70 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-56 bg-slate-200/70 animate-pulse rounded-xl" />
          <div className="h-56 bg-slate-200/70 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  const instName = institution?.institutionName || institution?.name || user?.name || 'Affiliated Institution';
  const instCode = institution?.institutionCode || 'N/A';
  const instType = institution?.type || 'DIRECT';
  const instEmail = institution?.email || user?.email || 'N/A';
  const instPhone = institution?.contactNumber || 'N/A';
  const instAddress = institution?.address || 'Jamia Markaz Institutional Network, Kerala';
  const instStatus = institution?.status || 'ACTIVE';

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
            <span className="text-slate-900 font-semibold">Institution Profile</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#132238]">
            Campus Profile & Accreditation
          </h1>
        </div>

        <Link
          href="/institution/dashboard"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Main Identity Banner */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-4 sm:space-x-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#132238] to-[#2F7C7A] flex items-center justify-center text-white font-bold text-2xl shadow-sm shrink-0">
              <Building className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#132238]">
                  {instName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {instStatus}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-[#2F7C7A]">
                  {instType}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Center Code: <span className="font-mono font-bold text-slate-800">{instCode}</span> • Affiliated to Markaz Integrated Studies Council (MISC)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Accredited Examination Center</span>
          </div>
        </div>

        {/* Profile Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
              Official Email
            </span>
            <div className="flex items-center space-x-2 text-slate-800 font-medium truncate">
              <Mail className="w-3.5 h-3.5 text-[#2F7C7A] shrink-0" />
              <span className="truncate">{instEmail}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
              Contact Telephone
            </span>
            <div className="flex items-center space-x-2 text-slate-800 font-medium">
              <Phone className="w-3.5 h-3.5 text-[#2F7C7A] shrink-0" />
              <span>{instPhone}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
              Campus Location
            </span>
            <div className="flex items-center space-x-2 text-slate-800 font-medium truncate">
              <MapPin className="w-3.5 h-3.5 text-[#2F7C7A] shrink-0" />
              <span className="truncate">{instAddress}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
              Affiliation Type
            </span>
            <div className="flex items-center space-x-2 text-slate-800 font-medium">
              <Building2 className="w-3.5 h-3.5 text-[#2F7C7A] shrink-0" />
              <span>{instType} Institutional Member</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Academic Governance & Portal Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Academic Governance Scope */}
        <div className="bg-white rounded-xl border border-[#E2E8E0] p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#E2E8E0] pb-3">
            <FileText className="w-5 h-5 text-[#2F7C7A]" />
            <h3 className="font-bold text-sm text-[#132238]">Academic Governance Scope</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            As an authorized affiliate of the Markaz Integrated Studies Council (MISC), this campus adheres to the central unified curricula, board timetables, standardized evaluations, and continuous moderations.
          </p>
          <div className="space-y-2 pt-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Standardized Syllabus</span>
              <span className="font-bold text-slate-800">Unified Central Board</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Candidate Evaluation</span>
              <span className="font-bold text-slate-800">Centralized Examinations</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Academic Certification</span>
              <span className="font-bold text-slate-800">Jamia Markaz Board</span>
            </div>
          </div>
        </div>

        {/* Right: Security & Operator Account Details */}
        <div className="bg-white rounded-xl border border-[#E2E8E0] p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#E2E8E0] pb-3">
            <User className="w-5 h-5 text-[#2F7C7A]" />
            <h3 className="font-bold text-sm text-[#132238]">Authorized Operator Account</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Administrative actions, candidate enrollments, and examination submissions executed through this session are logged under your official operator credentials.
          </p>
          <div className="space-y-2 pt-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Operator Username</span>
              <span className="font-mono font-bold text-slate-800">{user?.username || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Operator Email</span>
              <span className="font-mono text-slate-800">{user?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Access Role</span>
              <span className="font-bold text-[#2F7C7A]">{user?.role || 'INSTITUTION'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
