'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  GraduationCap,
  Languages,
  HeartHandshake,
  Sparkles,
  Users2,
  Calendar,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  Award,
} from 'lucide-react';
import { getMyDevelopmentScores } from '@/services/development.service';
import { StudentDevelopmentScore } from '@/types';

export default function StudentProgressPage() {
  const [scores, setScores] = useState<StudentDevelopmentScore[]>([]);
  const [selectedScoreId, setSelectedScoreId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function loadScores(isManualRefresh = false) {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const res = await getMyDevelopmentScores();
      if (res.success && Array.isArray(res.data)) {
        setScores(res.data);
        if (res.data.length > 0 && !selectedScoreId) {
          setSelectedScoreId(res.data[0]._id);
        }
      } else {
        setScores([]);
      }
    } catch (err: any) {
      console.error('Failed to load development scores:', err);
      setError(err?.message || 'Failed to retrieve progress scores.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadScores();
  }, []);

  const activeScore = useMemo(() => {
    if (!scores.length) return null;
    return scores.find((s) => s._id === selectedScoreId) || scores[0];
  }, [scores, selectedScoreId]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-emerald-500 to-green-600';
    if (score >= 70) return 'from-[#23804A] to-cyan-600';
    if (score >= 50) return 'from-amber-500 to-amber-600';
    return 'from-rose-500 to-rose-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'Distinction', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 80) return { label: 'Very Good', bg: 'bg-green-50 text-green-700 border-green-200' };
    if (score >= 70) return { label: 'Good', bg: 'bg-green-50 text-green-700 border-green-200' };
    if (score >= 50) return { label: 'Satisfactory', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Needs Focus', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const formatTermLabel = (term: string) => {
    switch (term) {
      case 'TERM_1':
        return 'Term 1 Evaluation';
      case 'TERM_2':
        return 'Term 2 Evaluation';
      case 'TERM_3':
        return 'Term 3 Evaluation';
      case 'ANNUAL':
        return 'Annual Evaluation';
      default:
        return term;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/student" className="hover:text-[#23804A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Development</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#171D19]">
            Holistic Development & Progress
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Continuous assessment across 5 core dimensions: Academic, Linguistic, Spiritual, Skill, and Leadership.
          </p>
        </div>

        {/* Evaluation Term Selector & Refresh */}
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {scores.length > 1 && (
            <div className="relative">
              <select
                value={selectedScoreId}
                onChange={(e) => setSelectedScoreId(e.target.value)}
                className="py-2 pl-3 pr-8 text-xs font-semibold text-slate-800 bg-white border border-[#E3EAE5] rounded-lg shadow-2xs focus:outline-hidden focus:border-[#23804A] appearance-none cursor-pointer"
              >
                {scores.map((sc) => (
                  <option key={sc._id} value={sc._id}>
                    {formatTermLabel(sc.term)} ({sc.academicYearId?.yearName || 'Academic Year'})
                  </option>
                ))}
              </select>
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          <button
            onClick={() => loadScores(true)}
            disabled={loading || refreshing}
            className="p-2 rounded-lg border border-[#E3EAE5] bg-white text-slate-600 hover:text-[#23804A] hover:bg-slate-50 shadow-2xs transition-all disabled:opacity-50"
            title="Refresh progress scores"
            aria-label="Refresh progress scores"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#23804A]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-6">
          <div className="h-32 bg-slate-200/70 animate-pulse rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-slate-200/70 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-[#E3EAE5] p-12 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Unable to load development scores</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => loadScores(true)}
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#23804A] text-white hover:bg-[#1B6F41] transition-all"
          >
            Try Again
          </button>
        </div>
      ) : !activeScore ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-[#E3EAE5] p-12 sm:p-16 text-center space-y-3 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EAF2EC] text-[#23804A] flex items-center justify-center mx-auto border border-[#23804A]/20">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#171D19]">No development scores recorded yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Your periodic holistic development evaluations will appear here once submitted by your designated Usthad and faculty advisors.
          </p>
        </div>
      ) : (
        /* Populated Development View */
        <div className="space-y-6">
          {/* Overall Composite Score Banner */}
          <div className="bg-white rounded-2xl border border-[#E3EAE5] p-6 sm:p-8 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAF2EC] text-[#23804A] border border-[#23804A]/20">
                    {formatTermLabel(activeScore.term)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {activeScore.academicYearId?.yearName || 'Academic Year'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#171D19]">
                  Overall Holistic Development Aggregate
                </h2>
                <p className="text-xs text-slate-500 max-w-xl">
                  Equally weighted composite rating computed across academic performance, tri-lingual proficiency, spiritual observance, creative skills, and leadership contributions.
                </p>
              </div>

              {/* Score Value Display */}
              <div className="flex items-center space-x-4 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl self-start md:self-auto shrink-0">
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Composite Score
                  </span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl sm:text-4xl font-mono font-bold text-[#171D19]">
                      {activeScore.overallDevelopmentScore}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/ 100</span>
                  </div>
                  <span
                    className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      getScoreBadge(activeScore.overallDevelopmentScore).bg
                    }`}
                  >
                    {getScoreBadge(activeScore.overallDevelopmentScore).label}
                  </span>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-[#23804A] to-[#78A887] text-white flex items-center justify-center shadow-md shadow-[#23804A]/20">
                  <Award className="w-7 h-7" />
                </div>
              </div>
            </div>

            {/* Composite Progress Bar */}
            <div className="mt-6 space-y-1.5">
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(
                    activeScore.overallDevelopmentScore
                  )} transition-all duration-500`}
                  style={{
                    width: `${Math.min(100, Math.max(0, activeScore.overallDevelopmentScore))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* 5 Core Dimensions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Academic Performance */}
            <div className="bg-white rounded-xl border border-[#E3EAE5] p-5 shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Academic Proficiency</h3>
                    <p className="text-[11px] text-slate-400">Class examinations and subject mastery</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold font-mono text-slate-900">
                    {activeScore.academicScore}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/100</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(
                      activeScore.academicScore
                    )} transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(0, activeScore.academicScore))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-1">
                  <span>Foundational</span>
                  <span>Competent</span>
                  <span>Mastery</span>
                </div>
              </div>
            </div>

            {/* 2. Spiritual Growth */}
            <div className="bg-white rounded-xl border border-[#E3EAE5] p-5 shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Spiritual Growth & Ethics</h3>
                    <p className="text-[11px] text-slate-400">Hifz, Sunan observance, and character (Akhlaq)</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold font-mono text-slate-900">
                    {activeScore.spiritualScore}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/100</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(
                      activeScore.spiritualScore
                    )} transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(0, activeScore.spiritualScore))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-1">
                  <span>Regularity</span>
                  <span>Steadfast</span>
                  <span>Exemplary</span>
                </div>
              </div>
            </div>

            {/* 3. Skill & Creativity */}
            <div className="bg-white rounded-xl border border-[#E3EAE5] p-5 shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Skill & Creative Competency</h3>
                    <p className="text-[11px] text-slate-400">Public discourse, digital fluency & creativity</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold font-mono text-slate-900">
                    {activeScore.skillScore}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/100</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(
                      activeScore.skillScore
                    )} transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(0, activeScore.skillScore))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-1">
                  <span>Emerging</span>
                  <span>Proficient</span>
                  <span>Accomplished</span>
                </div>
              </div>
            </div>

            {/* 4. Leadership & Social Conduct */}
            <div className="bg-white rounded-xl border border-[#E3EAE5] p-5 shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                    <Users2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Leadership & Teamwork</h3>
                    <p className="text-[11px] text-slate-400">Initiative, peer support, and responsibility</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold font-mono text-slate-900">
                    {activeScore.leadershipScore}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/100</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(
                      activeScore.leadershipScore
                    )} transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(0, activeScore.leadershipScore))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-1">
                  <span>Participating</span>
                  <span>Active Contributor</span>
                  <span>Leader</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Linguistic Competency with Arabic / English / Urdu Breakdown */}
          <div className="bg-white rounded-xl border border-[#E3EAE5] p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-[#23804A] flex items-center justify-center shrink-0">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Linguistic Competency Breakdown
                  </h3>
                  <p className="text-xs text-slate-500">
                    Multi-lingual fluency across the three official languages of instruction.
                  </p>
                </div>
              </div>
              <div className="text-right self-start sm:self-auto">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Linguistic Overall
                </span>
                <span className="text-xl font-bold font-mono text-[#23804A]">
                  {activeScore.linguisticScore?.overall ?? 0}
                  <span className="text-xs text-slate-400 font-normal"> /100</span>
                </span>
              </div>
            </div>

            {/* Language Sub-bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Arabic */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Arabic (العربية)</span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {activeScore.linguisticScore?.arabic ?? 0}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, activeScore.linguisticScore?.arabic ?? 0))}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">Classical grammar, reading & speech</p>
              </div>

              {/* English */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">English Language</span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {activeScore.linguisticScore?.english ?? 0}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-600 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, activeScore.linguisticScore?.english ?? 0))}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">Written composition & articulation</p>
              </div>

              {/* Urdu */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Urdu (اردو)</span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {activeScore.linguisticScore?.urdu ?? 0}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-600 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, activeScore.linguisticScore?.urdu ?? 0))}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">Subcontinental textual literacy</p>
              </div>
            </div>
          </div>

          {/* Evaluator Remarks (if present) */}
          {activeScore.remarks && (
            <div className="bg-white rounded-xl border border-[#E3EAE5] p-5 shadow-2xs space-y-2">
              <div className="flex items-center space-x-2 text-[#23804A]">
                <MessageSquare className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Evaluator Observations & Recommendations
                </h3>
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                "{activeScore.remarks}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
