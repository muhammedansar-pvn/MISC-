'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  Building,
  Calendar,
  Hash,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import RoleBadge from '@/components/admin/RoleBadge';
import StatusBadge from '@/components/admin/StatusBadge';
import { getUserById } from '@/services/admin.service';
import { User } from '@/types';

export default function AdminUserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUser = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await getUserById(id);
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch user profile:', err);
      setError(err.response?.data?.message || 'User profile not found or unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-[#132238]">Loading user profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4 my-8">
        <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
        <h3 className="text-lg font-bold text-rose-900">User Profile Unavailable</h3>
        <p className="text-sm text-rose-700">{error || 'Requested user details could not be found.'}</p>
        <div className="flex justify-center space-x-3 pt-2">
          <button
            onClick={() => router.push('/admin/users')}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer"
          >
            Back to Users List
          </button>
          <button
            onClick={fetchUser}
            className="px-4 py-2 bg-[#2F7C7A] hover:bg-[#256361] text-white font-bold text-xs rounded-xl uppercase tracking-wider inline-flex items-center cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#2F7C7A] hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Users List
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-[#2F7C7A]/10 text-[#2F7C7A] flex items-center justify-center font-serif font-bold text-2xl">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#132238]">{user.name || 'User Profile'}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Username: <span className="font-mono text-slate-800">@{user.username || 'unassigned'}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <RoleBadge role={user.role} />
            <StatusBadge status={user.status} />
          </div>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-xs p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold text-[#132238] border-b border-[#E2E8E0] pb-3">
          Account Specifications
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="flex items-start space-x-3.5 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <Mail className="w-5 h-5 text-[#2F7C7A] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</p>
              <p className="font-semibold text-[#132238] mt-0.5">{user.email || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <Hash className="w-5 h-5 text-[#2F7C7A] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">System Username</p>
              <p className="font-mono font-semibold text-[#132238] mt-0.5">{user.username || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <Phone className="w-5 h-5 text-[#2F7C7A] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Mobile Phone</p>
              <p className="font-semibold text-[#132238] mt-0.5">{user.mobile || 'Not specified'}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <Building className="w-5 h-5 text-[#2F7C7A] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Department / Office</p>
              <p className="font-semibold text-[#132238] mt-0.5">{user.department || 'Not assigned'}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <Calendar className="w-5 h-5 text-[#2F7C7A] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Created On</p>
              <p className="font-semibold text-[#132238] mt-0.5">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
