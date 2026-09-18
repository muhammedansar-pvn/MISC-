import React from 'react';

export const UserCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-[#E2E8E0] p-5 space-y-4 animate-pulse">
    <div className="flex items-center space-x-3">
      <div className="w-11 h-11 bg-slate-200 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
    </div>
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2">
      <div className="h-3 bg-slate-200 rounded w-1/3" />
      <div className="h-3 bg-slate-200 rounded w-full" />
      <div className="h-3 bg-slate-200 rounded w-2/3" />
    </div>
    <div className="grid grid-cols-3 gap-2 pt-1">
      <div className="h-7 bg-slate-200 rounded-lg" />
      <div className="h-7 bg-slate-200 rounded-lg" />
      <div className="h-7 bg-slate-200 rounded-lg" />
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="bg-white p-5 rounded-2xl border border-[#E2E8E0] animate-pulse flex items-center justify-between">
    <div className="space-y-2 flex-1">
      <div className="h-3 bg-slate-200 rounded w-1/2" />
      <div className="h-8 bg-slate-200 rounded w-1/3" />
      <div className="h-3 bg-slate-100 rounded w-2/3" />
    </div>
    <div className="w-12 h-12 bg-slate-200 rounded-xl flex-shrink-0 ml-4" />
  </div>
);

export default UserCardSkeleton;
