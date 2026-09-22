'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getAcademicYears,
  getClasses,
  getSubjects,
  getSyllabuses,
} from '@/services/academic.service';
import { AcademicYear, ClassModel, Subject, Syllabus } from '@/types';
import {
  Layers,
  Calendar,
  BookOpen,
  FileText,
  Search,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export default function InstitutionAcademicsPage() {
  const [activeTab, setActiveTab] = useState<'years' | 'classes' | 'subjects' | 'syllabus'>('years');
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadAcademics() {
      try {
        setLoading(true);
        const [ayRes, clsRes, subRes, sylRes] = await Promise.allSettled([
          getAcademicYears(),
          getClasses(),
          getSubjects(),
          getSyllabuses(),
        ]);

        if (ayRes.status === 'fulfilled' && ayRes.value.success && Array.isArray(ayRes.value.data)) {
          setAcademicYears(ayRes.value.data);
        }
        if (clsRes.status === 'fulfilled' && clsRes.value.success && Array.isArray(clsRes.value.data)) {
          setClasses(clsRes.value.data);
        }
        if (subRes.status === 'fulfilled' && subRes.value.success && Array.isArray(subRes.value.data)) {
          setSubjects(subRes.value.data);
        }
        if (sylRes.status === 'fulfilled' && sylRes.value.success && Array.isArray(sylRes.value.data)) {
          setSyllabuses(sylRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load academics overview:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAcademics();
  }, []);

  const tabs = [
    { id: 'years', label: 'Academic Sessions', icon: Calendar, count: academicYears.length },
    { id: 'classes', label: 'Assigned Classes', icon: BookOpen, count: classes.length },
    { id: 'subjects', label: 'Curriculum Subjects', icon: Layers, count: subjects.length },
    { id: 'syllabus', label: 'Syllabus Repository', icon: FileText, count: syllabuses.length },
  ];

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
            <span className="text-slate-900 font-semibold">Academics</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#132238]">
            Curriculum & Academic Framework
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional academic standards, curriculum courses, and centralized syllabus documentation.
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

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8E0] pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchQuery('');
              }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? 'bg-[#132238] text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-teal-300' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter records in current view..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#2F7C7A] bg-white font-medium text-slate-800"
        />
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div>
            {/* Tab 1: Academic Years */}
            {activeTab === 'years' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F8F5] border-b border-[#E2E8E0] text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Academic Session</th>
                      <th className="p-4">Term Window</th>
                      <th className="p-4">Enrollment Status</th>
                      <th className="p-4">System Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {academicYears
                      .filter((ay) => (ay.yearName || ay.yearCode || '').toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((ay) => (
                        <tr key={ay._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-4 font-bold text-slate-900">
                            {ay.yearName || ay.yearCode}
                          </td>
                          <td className="p-4 text-slate-600 font-mono">
                            {ay.startDate ? new Date(ay.startDate).toLocaleDateString('en-GB') : '—'} to{' '}
                            {ay.endDate ? new Date(ay.endDate).toLocaleDateString('en-GB') : '—'}
                          </td>
                          <td className="p-4">
                            {(ay as any).isEnrollmentOpen ?? ay.isCurrent ? (
                              <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Admissions Open</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">Admissions Closed</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ay.isCurrent || ay.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {ay.isCurrent ? 'CURRENT SESSION' : ay.status || 'ACTIVE'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: Classes */}
            {activeTab === 'classes' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F8F5] border-b border-[#E2E8E0] text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Class Title</th>
                      <th className="p-4">Stream Code</th>
                      <th className="p-4">Section</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classes
                      .filter((c) => (c.name || c.className || '').toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((cls) => (
                        <tr key={cls._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-4 font-bold text-slate-900">{cls.name || cls.className}</td>
                          <td className="p-4 font-mono font-medium text-slate-700">{(cls as any).stream || cls.code || '—'}</td>
                          <td className="p-4 text-slate-600">{(cls as any).section || '—'}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {cls.status || 'ACTIVE'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Subjects */}
            {activeTab === 'subjects' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F8F5] border-b border-[#E2E8E0] text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Course Code</th>
                      <th className="p-4">Subject Title</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Credits</th>
                      <th className="p-4">Passing Criteria</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subjects
                      .filter(
                        (s) =>
                          (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.code || '').toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((sub) => (
                        <tr key={sub._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-4 font-mono font-bold text-slate-800">{sub.code}</td>
                          <td className="p-4">
                            <div className="font-bold text-slate-900">{sub.name}</div>
                            {(sub as any).nameArabic && (
                              <span className="text-[11px] text-slate-400 font-serif">{(sub as any).nameArabic}</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                              {sub.type || 'THEORY'}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-700">{sub.credits || '—'}</td>
                          <td className="p-4 text-slate-600">
                            Min {(sub as any).passMarks || 40}% to qualify
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 4: Syllabuses */}
            {activeTab === 'syllabus' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F8F5] border-b border-[#E2E8E0] text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Course Subject</th>
                      <th className="p-4">Class Cohort</th>
                      <th className="p-4">Units / Topics</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Document</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {syllabuses
                      .filter((syl) => {
                        const sub = (syl.subjectId as any);
                        return (sub?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
                      })
                      .map((syl) => {
                        const sub = (syl.subjectId as any);
                        const cls = (syl.classId as any);
                        return (
                          <tr key={syl._id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-4 font-bold text-slate-900">{sub?.name || 'Subject Course'}</td>
                            <td className="p-4 text-slate-700 font-medium">{cls?.name || cls?.className || '—'}</td>
                            <td className="p-4 text-slate-600 font-mono">
                              {Array.isArray(syl.units) ? `${syl.units.length} Modules` : 'Curriculum Defined'}
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {syl.status || 'ACTIVE'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {syl.fileUrl ? (
                                <a
                                  href={syl.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center space-x-1 text-[#2F7C7A] hover:underline font-semibold"
                                >
                                  <span>Download</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              ) : (
                                <span className="text-slate-400">Online Only</span>
                              )}
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
    </div>
  );
}
