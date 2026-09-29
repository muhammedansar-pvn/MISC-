'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  RefreshCw,
  Search,
  AlertCircle,
  Calendar,
  Medal,
  Sparkles,
} from 'lucide-react';
import { getMyAchievements } from '@/services/activity.service';
import { StudentAchievement, AchievementStatus } from '@/types';

export default function StudentActivitiesPage() {
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'ALL' | AchievementStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  async function loadAchievements(isManualRefresh = false) {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const res = await getMyAchievements();
      if (res.success && Array.isArray(res.data)) {
        setAchievements(res.data);
      } else {
        setAchievements([]);
      }
    } catch (err: any) {
      console.error('Failed to load achievements:', err);
      setError(err?.message || 'Failed to retrieve achievements.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAchievements();
  }, []);

  const totalCount = achievements.length;
  const verifiedCount = useMemo(
    () => achievements.filter((a) => a.status === 'VERIFIED').length,
    [achievements]
  );
  const rankCount = useMemo(
    () =>
      achievements.filter(
        (a) =>
          a.rankPosition === 'FIRST' ||
          a.rankPosition === 'SECOND' ||
          a.rankPosition === 'THIRD'
      ).length,
    [achievements]
  );

  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const activityName = item.activityId?.name || '';
      const category = item.activityId?.category || '';
      const matchesSearch =
        !q ||
        activityName.toLowerCase().includes(q) ||
        category.toLowerCase().includes(q) ||
        item.stage.toLowerCase().includes(q) ||
        item.rankPosition.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [achievements, statusFilter, searchQuery]);

  const renderRankBadge = (rank: string) => {
    switch (rank) {
      case 'FIRST':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <Trophy className="w-3.5 h-3.5 mr-1 text-amber-600" /> 1st Place
          </span>
        );
      case 'SECOND':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <Medal className="w-3.5 h-3.5 mr-1 text-slate-500" /> 2nd Place
          </span>
        );
      case 'THIRD':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100/70 text-amber-900 border border-amber-300">
            <Medal className="w-3.5 h-3.5 mr-1 text-amber-700" /> 3rd Place
          </span>
        );
      case 'CONSOLATION':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Award className="w-3.5 h-3.5 mr-1 text-blue-600" /> Consolation
          </span>
        );
      case 'PARTICIPATION':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
            Participation
          </span>
        );
    }
  };

  const renderCategoryBadge = (category?: string) => {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E6F2F1] text-[#2F7C7A] border border-[#2F7C7A]/20">
        {category || 'ACTIVITY'}
      </span>
    );
  };

  const renderStatusBadge = (status: AchievementStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Verified
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 mr-1 text-amber-600" /> Pending Verification
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 mr-1 text-rose-600" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

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
            <span className="text-slate-900 font-semibold">Activities</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Activities & Achievements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Record of your co-curricular competitions, literary engagements, cultural events, and certified distinctions.
          </p>
        </div>

        <button
          onClick={() => loadAchievements(true)}
          disabled={loading || refreshing}
          className="p-2 rounded-lg border border-[#E2E8E0] bg-white text-slate-600 hover:text-[#2F7C7A] hover:bg-slate-50 shadow-2xs transition-all disabled:opacity-50 self-start sm:self-auto"
          title="Refresh achievements"
          aria-label="Refresh achievements"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#2F7C7A]' : ''}`} />
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Achievements */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Participations
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-[#132238]">
            {loading ? '--' : totalCount}
          </p>
          <p className="text-xs text-slate-400">Events and competitions entered</p>
        </div>

        {/* Verified by Faculty */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Verified Records
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-700">
            {loading ? '--' : verifiedCount}
          </p>
          <p className="text-xs text-slate-400">Certified by institutional faculty</p>
        </div>

        {/* Top Ranks */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Podium Honors (1st - 3rd)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-amber-700">
            {loading ? '--' : rankCount}
          </p>
          <p className="text-xs text-slate-400">Competitive excellence recognitions</p>
        </div>
      </div>

      {/* Main Grid / Section */}
      <div className="bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-hidden">
        {/* Controls */}
        <div className="p-5 border-b border-[#E2E8E0] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#132238] flex items-center space-x-2">
              <Award className="w-4 h-4 text-[#2F7C7A]" />
              <span>Achievement Portfolio</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified distinctions, competition levels, and digital certificates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search activity or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-[#E2E8E0] rounded-lg focus:outline-hidden focus:border-[#2F7C7A] text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="inline-flex rounded-lg border border-[#E2E8E0] bg-slate-50 p-0.5 text-xs">
              {(['ALL', 'VERIFIED', 'PENDING'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-white text-[#132238] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'VERIFIED' ? 'Verified' : 'Pending'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <div className="w-8 h-8 rounded-full border-2 border-[#2F7C7A] border-t-transparent animate-spin mx-auto mb-3" />
            Loading activities and achievements...
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Unable to load achievements</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => loadAchievements(true)}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#2F7C7A] text-white hover:bg-[#286b69] transition-all"
            >
              Retry
            </button>
          </div>
        ) : filteredAchievements.length === 0 ? (
          /* Empty State */
          <div className="p-12 sm:p-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center mx-auto border border-[#2F7C7A]/20">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#132238]">No activities or achievements recorded yet</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              When you participate in speech, essay, debate, Qiraath, sports, or other campus competitions, your verified records and awards will be featured here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
            {filteredAchievements.map((item) => (
              <div
                key={item._id}
                className="bg-slate-50/60 rounded-xl border border-slate-200 p-5 space-y-3 hover:bg-white hover:shadow-2xs transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    {renderCategoryBadge(item.activityId?.category)}
                    {renderStatusBadge(item.status)}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {item.activityId?.name || 'Sanaviyya Activity'}
                    </h3>
                    {item.activityId?.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {item.activityId.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {renderRankBadge(item.rankPosition)}

                    <span className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      Stage: <span className="font-bold text-slate-800">{item.stage}</span>
                    </span>

                    {item.marksObtained > 0 && (
                      <span className="text-[11px] font-mono font-semibold text-[#2F7C7A] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                        {item.marksObtained} Marks
                      </span>
                    )}
                  </div>

                  {item.academicYearId && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.academicYearId.yearName}</span>
                    </div>
                  )}

                  {item.remarks && (
                    <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200/80">
                      "{item.remarks}"
                    </p>
                  )}
                </div>

                {/* Certificate Link if verified and available */}
                {item.certificateUrl && item.status === 'VERIFIED' && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Official Certificate
                    </span>
                    <a
                      href={item.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-[#2F7C7A] hover:text-[#246260] bg-white px-3 py-1.5 rounded-lg border border-[#2F7C7A]/30 hover:border-[#2F7C7A] transition-all shadow-2xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1.5" /> View Certificate
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
