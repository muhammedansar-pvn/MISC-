'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  UserPlus,
  RefreshCw,
  Eye,
  AlertCircle,
  Users as UsersIcon,
  X,
  LayoutGrid,
  Table as TableIcon,
  Building2,
  GraduationCap,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Edit3,
  Trash2,
  MoreVertical,
  Mail,
  Phone,
} from 'lucide-react';
import RoleBadge from '@/components/admin/RoleBadge';
import StatusBadge from '@/components/admin/StatusBadge';
import UserCard from '@/components/admin/UserCard';
import { UserCardSkeleton, StatCardSkeleton } from '@/components/admin/SkeletonLoader';
import UserFormModal from '@/components/admin/UserFormModal';
import UserDetailsModal from '@/components/admin/UserDetailsModal';
import UserDeleteConfirmModal from '@/components/admin/UserDeleteConfirmModal';
import { getUsers, getDashboardStats, updateUserStatus } from '@/services/admin.service';
import { User, DashboardStats } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & View Mode
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  // Frontend Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Dropdown Menu State for Row Actions
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Modals & Selected User
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const router = useRouter();

  // Close More Menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    if (activeMenuId) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [activeMenuId]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, statsRes] = await Promise.all([
        getUsers(),
        getDashboardStats().catch(() => ({ success: false, data: null })),
      ]);

      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch user list:', err);
      setError('Unable to load users. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(search.trim() || roleFilter || statusFilter);

  const handleOpenAddModal = () => {
    setUserToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setUserToEdit(user);
    setIsFormModalOpen(true);
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateUserStatus(user._id, newStatus);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to change status for ${user.name || user.email}`);
    }
  };

  // Memoized Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Search Query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const name = (u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const username = (u.username || '').toLowerCase();
        const mobile = (u.mobile || '').toLowerCase();
        const dept = (u.department || '').toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !username.includes(q) && !mobile.includes(q) && !dept.includes(q)) {
          return false;
        }
      }

      // 2. Role Filter
      if (roleFilter && u.role?.toUpperCase() !== roleFilter.toUpperCase()) {
        return false;
      }

      // 3. Status Filter
      if (statusFilter && u.status?.toUpperCase() !== statusFilter.toUpperCase()) {
        return false;
      }

      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  // Pagination calculation
  const totalFilteredCount = filteredUsers.length;
  const totalPages = Math.ceil(totalFilteredCount / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const suspendedCount = users.filter((u) => u.status === 'SUSPENDED' || u.status === 'INACTIVE').length;

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <span>Admin</span>
            <span>/</span>
            <span>User Management</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Users</span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#132238]">Users</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-[#E6F2F1] text-[#2F7C7A] rounded-full border border-teal-100">
              {users.length} Total
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage user accounts, roles and access.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#2F7C7A]' : ''}`} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361] transition-colors cursor-pointer shadow-xs"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Add User
          </button>
        </div>
      </div>

      {/* 2. Responsive Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
        {loading && !stats ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="bg-white p-5 rounded-2xl border border-[#E2E8E0] shadow-xs flex items-center justify-between transition-all hover:shadow-xs w-full min-w-0">
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">TOTAL USERS</p>
                <p className="text-2xl font-extrabold text-[#132238] tracking-tight mt-1">
                  {stats?.totalUsers !== undefined ? stats.totalUsers : users.length}
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">
                  <span className="text-emerald-600 font-bold">{activeCount} Active</span> /{' '}
                  <span className="text-rose-600 font-bold">{suspendedCount} Inactive</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 ml-3">
                <UsersIcon className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E2E8E0] shadow-xs flex items-center justify-between transition-all hover:shadow-xs w-full min-w-0">
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">INSTITUTIONS</p>
                <p className="text-2xl font-extrabold text-[#132238] tracking-tight mt-1">
                  {stats?.institutions !== undefined ? stats.institutions : 0}
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">Affiliated Campuses</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 ml-3">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E2E8E0] shadow-xs flex items-center justify-between transition-all hover:shadow-xs w-full min-w-0">
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">STUDENTS</p>
                <p className="text-2xl font-extrabold text-[#132238] tracking-tight mt-1">
                  {stats?.students !== undefined ? stats.students : 0}
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">Enrolled Students</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 ml-3">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E2E8E0] shadow-xs flex items-center justify-between transition-all hover:shadow-xs w-full min-w-0">
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">FACULTY</p>
                <p className="text-2xl font-extrabold text-[#132238] tracking-tight mt-1">
                  {stats?.faculty !== undefined ? stats.faculty : 0}
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">Instructors & Staff</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 ml-3">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8E0] shadow-xs space-y-3 w-full min-w-0">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, username, mobile..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2E8E0] text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] bg-slate-50/50 focus:bg-white transition-all"
            />
          </div>

          {/* Role & Status Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="min-w-[140px]">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium border border-[#E2E8E0] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2F7C7A] bg-white text-slate-700 cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">ADMINISTRATOR</option>
                <option value="PRINCIPAL">PRINCIPAL</option>
                <option value="HOD">HOD</option>
                <option value="ASATITHA">ASATITHA / FACULTY</option>
                <option value="FACULTY">FACULTY</option>
                <option value="PARENT">PARENT</option>
                <option value="STUDENT">STUDENT</option>
                <option value="INSTITUTION">INSTITUTION</option>
              </select>
            </div>

            <div className="min-w-[130px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium border border-[#E2E8E0] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2F7C7A] bg-white text-slate-700 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="INVITED">INVITED</option>
                <option value="PENDING_SETUP">PENDING SETUP</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>

            {/* View Switcher: Table vs Cards */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-[#132238] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-[#132238] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>

            {/* Clear Filters Action */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center text-xs text-rose-600 hover:text-rose-700 hover:underline font-semibold px-2 py-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5 mr-1" /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Toolbar Subtext / Filter Count Indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800">{filteredUsers.length}</strong> of{' '}
            <strong className="text-slate-800">{users.length}</strong> users
          </span>
          {hasActiveFilters && (
            <span className="text-[11px] text-[#2F7C7A] bg-teal-50 px-2.5 py-0.5 rounded-full font-medium border border-teal-100">
              Filters applied
            </span>
          )}
        </div>
      </div>

      {/* 4. Main User Data Container (Cards or Table) */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-xs overflow-hidden w-full min-w-0">
        {loading ? (
          /* Loading Skeleton matching table structure */
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="h-4 w-40 bg-slate-200 animate-pulse rounded" />
              <div className="h-4 w-20 bg-slate-200 animate-pulse rounded" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-32 bg-slate-200 animate-pulse rounded" />
                    <div className="h-2.5 w-44 bg-slate-200 animate-pulse rounded" />
                  </div>
                </div>
                <div className="h-5 w-36 bg-slate-200 animate-pulse rounded hidden sm:block" />
                <div className="h-5 w-24 bg-slate-200 animate-pulse rounded hidden md:block" />
                <div className="h-5 w-20 bg-slate-200 animate-pulse rounded" />
                <div className="h-7 w-24 bg-slate-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-rose-800">Failed to load user accounts</h3>
              <p className="text-xs text-rose-600 max-w-md mx-auto">{error}</p>
            </div>
            <button
              onClick={fetchData}
              className="inline-flex items-center px-4 py-2 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361] transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <UsersIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#132238]">No users found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'No users match your selected search query and filter combination. Try clearing your filters.'
                : 'Get started by inviting or creating a new system user.'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5 mr-1" /> Clear all filters
              </button>
            ) : (
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center px-4 py-2 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361] transition-colors cursor-pointer shadow-xs"
              >
                <UserPlus className="w-4 h-4 mr-2" /> Add First User
              </button>
            )}
          </div>
        ) : viewMode === 'cards' ? (
          /* Card Grid View */
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full min-w-0">
            {paginatedUsers.map((u) => (
              <UserCard
                key={u._id}
                user={u}
                onDetails={(userItem: User) => setSelectedUser(userItem)}
                onEdit={(userItem: User) => handleOpenEditModal(userItem)}
                onToggleStatus={(userItem: User) => handleToggleStatus(userItem)}
              />
            ))}
          </div>
        ) : (
          /* Professional Admin Table View */
          <div className="overflow-x-auto min-h-[300px] w-full">
            <table className="w-full text-left text-sm min-w-[760px]">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#E2E8E0]">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Mobile</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Created Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {paginatedUsers.map((u) => {
                  const initial = getInitials(u.name);
                  const isSuspendedOrInactive = u.status === 'INACTIVE' || u.status === 'SUSPENDED';

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. User Column */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-[#E6F2F1] border border-teal-100 text-[#2F7C7A] flex items-center justify-center font-bold text-xs shrink-0">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-[#132238] truncate">{u.name || 'Unassigned User'}</p>
                            <p className="text-xs text-slate-500 font-normal truncate">
                              @{u.username || 'unassigned'}
                              {u.department ? ` · ${u.department}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Email Column */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-xs text-slate-700 font-medium">{u.email}</span>
                      </td>

                      {/* 3. Mobile Column */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs text-slate-600">
                          {u.mobile || '—'}
                        </span>
                      </td>

                      {/* 4. Role Column */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <RoleBadge role={u.role} />
                      </td>

                      {/* 5. Status Column */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <StatusBadge status={u.status} />
                      </td>

                      {/* 6. Created Date Column */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* 7. Consolidated Row Actions (View, Edit, More ⋮) */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end space-x-1.5">
                          {/* View Button */}
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-[#2F7C7A] border border-teal-200/80 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Edit User"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#2F7C7A]" />
                            <span>Edit</span>
                          </button>

                          {/* More (⋮) Dropdown Menu */}
                          <div
                            className="relative inline-block text-left"
                            ref={activeMenuId === u._id ? menuRef : null}
                          >
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === u._id ? null : u._id)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                              title="More actions"
                              aria-expanded={activeMenuId === u._id}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenuId === u._id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-[#E2E8E0] py-1.5 z-30 focus:outline-none animate-in fade-in zoom-in-95 duration-100">
                                {/* Student Profile Link if Student Role */}
                                {u.role === 'STUDENT' && (
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      router.push(`/admin/students?search=${encodeURIComponent(u.email)}`);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#2F7C7A] hover:bg-teal-50 flex items-center gap-2 cursor-pointer transition-colors"
                                  >
                                    <GraduationCap className="w-3.5 h-3.5 text-[#2F7C7A]" />
                                    <span>Student Profile</span>
                                  </button>
                                )}

                                {/* Toggle Status */}
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    handleToggleStatus(u);
                                  }}
                                  className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                                    u.status === 'ACTIVE'
                                      ? 'text-amber-700 hover:bg-amber-50'
                                      : 'text-emerald-700 hover:bg-emerald-50'
                                  }`}
                                >
                                  {u.status === 'ACTIVE' ? (
                                    <>
                                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Deactivate User</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Activate User</span>
                                    </>
                                  )}
                                </button>

                                <div className="my-1 border-t border-slate-100" />

                                {/* Delete User */}
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setUserToDelete(u);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Delete User</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Pagination Footer */}
        {!loading && !error && totalFilteredCount > 0 && (
          <div className="bg-white p-4 border-t border-[#E2E8E0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs w-full min-w-0">
            <span className="text-slate-500 font-semibold">
              Showing <strong className="text-[#132238]">{startIndex + 1}</strong> to{' '}
              <strong className="text-[#132238]">{Math.min(startIndex + pageSize, totalFilteredCount)}</strong> of{' '}
              <strong className="text-[#132238]">{totalFilteredCount}</strong> users
            </span>

            {totalPages > 1 && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-all cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#2F7C7A] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-all cursor-pointer"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invite / Edit User Form Modal */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setUserToEdit(null);
        }}
        onSuccess={fetchData}
        userToEdit={userToEdit}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
      />

      {/* Delete Confirmation & Dependency Safeguard Modal */}
      <UserDeleteConfirmModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onSuccess={fetchData}
        user={userToDelete}
      />
    </div>
  );
}
