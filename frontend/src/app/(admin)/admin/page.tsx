'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserCheck,
  Clock,
  Building2,
  GraduationCap,
  BookOpen,
  UserPlus,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import RoleBadge from '@/components/admin/RoleBadge';
import StatusBadge from '@/components/admin/StatusBadge';
import UserFormModal from '@/components/admin/UserFormModal';
import { getDashboardStats, getUsers } from '@/services/admin.service';
import { DashboardStats, User } from '@/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes] = await Promise.all([
        getDashboardStats(),
        getUsers(),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (usersRes.success && usersRes.data) {
        setRecentUsers((usersRes.data || []).slice(0, 5));
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError('Unable to load dashboard statistics. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-[#132238]">Loading dashboard statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center max-w-lg mx-auto space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
        <h3 className="text-lg font-bold text-rose-900">Dashboard Error</h3>
        <p className="text-sm text-rose-700">{error}</p>
        <button
          onClick={fetchData}
          className="inline-flex items-center px-4 py-2 bg-[#2F7C7A] text-white font-bold text-xs rounded-lg uppercase tracking-wider hover:bg-[#256361] transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#132238]">System Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time MISC Portal user management and operational metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361] transition-all shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Invite New User
          </button>
          <button
            onClick={() => router.push('/admin/users')}
            className="inline-flex items-center justify-center px-4 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
          >
            Manage Users <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          icon={Users}
          colorBg="bg-purple-100"
          colorText="text-purple-700"
          subtitle="Registered across system"
        />
        <StatCard
          title="Active Users"
          value={stats?.activeUsers}
          icon={UserCheck}
          colorBg="bg-emerald-100"
          colorText="text-emerald-700"
          subtitle="Setup completed & active"
        />
        <StatCard
          title="Pending / Invited"
          value={stats?.pendingUsers}
          icon={Clock}
          colorBg="bg-sky-100"
          colorText="text-sky-700"
          subtitle="Awaiting account setup"
        />
        <StatCard
          title="Institutions"
          value={stats?.institutions}
          icon={Building2}
          colorBg="bg-blue-100"
          colorText="text-blue-700"
          subtitle="Affiliated institutions"
        />
        <StatCard
          title="Faculty Members"
          value={stats?.faculty}
          icon={BookOpen}
          colorBg="bg-teal-100"
          colorText="text-teal-700"
          subtitle="Instructors & evaluators"
        />
        <StatCard
          title="Students"
          value={stats?.students}
          icon={GraduationCap}
          colorBg="bg-amber-100"
          colorText="text-amber-700"
          subtitle="Enrolled students"
        />
      </div>

      {/* Recent Users Overview Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E2E8E0] flex items-center justify-between bg-[#F7F8F5]">
          <div>
            <h3 className="text-base font-bold text-[#132238]">Recently Registered Users</h3>
            <p className="text-xs text-slate-500">Latest accounts created or invited</p>
          </div>
          <button
            onClick={() => router.push('/admin/users')}
            className="text-xs font-bold text-[#2F7C7A] hover:underline flex items-center cursor-pointer"
          >
            View All Users <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {recentUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No users registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#E2E8E0]">
                <tr>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {recentUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#132238]">{u.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite User Modal */}
      <UserFormModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
