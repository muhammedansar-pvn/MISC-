import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User, Mail, ShieldCheck } from 'lucide-react';

export const StudentDashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F7F8F5] p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E2E8E0] shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-[#132238]">Student Portal</h1>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                  STUDENT
                </span>
              </div>
              <p className="text-sm text-slate-500">Student Academic Dashboard & Examination Records</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#E2E8E0] shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-[#132238] border-b pb-2">Student Account Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3 text-slate-700">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Username:</span>
                <span className="font-mono text-slate-900">{user?.username || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Email:</span>
                <span className="text-slate-900">{user?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Role:</span>
                <span className="font-semibold text-amber-700">{user?.role}</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-lg">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <span>Phase 1 Integration Active</span>
            </div>
            <p className="text-sm text-emerald-700 leading-relaxed">
              Authenticated successfully as Student. Registered for exam hall tickets, result viewing, and download resources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
