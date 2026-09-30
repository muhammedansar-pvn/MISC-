'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyStudents, getMyClasses } from '@/services/faculty.service';
import { StudentProfile, FacultyClassView } from '@/types';
import {
  Users,
  Search,
  Building2,
  ArrowLeft,
  ArrowRight,
  UserCheck,
  Mail,
  Phone,
  FileText,
} from 'lucide-react';

export default function FacultyStudentsRosterPage() {
  const [classes, setClasses] = useState<FacultyClassView[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Load authorized classes
  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await getMyClasses();
        if (res.success && Array.isArray(res.data)) {
          setClasses(res.data);
        }
      } catch (err) {
        console.error('Failed to load faculty classes:', err);
      }
    }
    loadClasses();
  }, []);

  // Load students based on selected class
  useEffect(() => {
    async function loadStudents() {
      try {
        setLoading(true);
        const targetClass = selectedClassId === 'ALL' ? undefined : selectedClassId;
        const res = await getMyStudents(targetClass);
        if (res.success && Array.isArray(res.data)) {
          setStudents(res.data);
        } else {
          setStudents([]);
        }
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, [selectedClassId]);

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const nameEn = (s.nameEnglish || s.userId?.name || '').toLowerCase();
    const nameAr = (s.nameArabic || '').toLowerCase();
    const regNo = (s.registrationNumber || '').toLowerCase();

    return !searchQuery || nameEn.includes(q) || nameAr.includes(q) || regNo.includes(q);
  });

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
            <span className="text-slate-900 font-semibold">Student Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238] flex items-center gap-2">
            <Users className="w-7 h-7 text-[#2F7C7A]" />
            Student Cohort Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse enrolled students in classes assigned to you. Access 360° academic profiles, attendance history, and faculty remarks.
          </p>
        </div>

        <Link
          href="/faculty"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#2F7C7A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Control / Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students by name, Arabic name, or register number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#2F7C7A]"
          />
        </div>

        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[#132238] focus:outline-hidden focus:border-[#2F7C7A]"
        >
          <option value="ALL">All Authorized Classes</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name} ({cls.code || 'CLS'})
            </option>
          ))}
        </select>
      </div>

      {/* Students List Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50/60 border-b border-[#E2E8E0] flex items-center justify-between text-xs text-slate-600">
          <span className="font-bold text-[#132238]">
            Enrolled Students ({filteredStudents.length})
          </span>
          <span className="text-[11px] text-slate-400">
            Click &ldquo;View 360° Profile&rdquo; to review longitudinal attendance and remarks
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading student cohort roster...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No students found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No students match the current filter or search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 w-36">Reg Number</th>
                  <th className="py-3.5 px-4">Student Details</th>
                  <th className="py-3.5 px-4 w-44">Class Cohort</th>
                  <th className="py-3.5 px-4 w-48">Contact</th>
                  <th className="py-3.5 px-4 text-right w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st, idx) => (
                  <tr key={st._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-xs">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#132238]">
                      {st.registrationNumber || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-sm text-[#132238]">
                        {st.nameEnglish || st.userId?.name || 'Student Candidate'}
                      </div>
                      {st.nameArabic && (
                        <div className="text-xs text-slate-500 font-serif mt-0.5">
                          {st.nameArabic}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#E6F2F1] text-[#2F7C7A] font-semibold text-xs border border-[#2F7C7A]/20">
                        <Building2 className="w-3 h-3 mr-1" />
                        {st.classId?.name || 'Class'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {st.userId?.email && (
                        <div className="flex items-center space-x-1.5 truncate text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{st.userId.email}</span>
                        </div>
                      )}
                      {st.contactNumber && (
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{st.contactNumber}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/faculty/students/${st._id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#2F7C7A] hover:bg-[#286b69] text-white text-xs font-semibold shadow-2xs transition-all"
                      >
                        <span>Student 360°</span>
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </td>
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
