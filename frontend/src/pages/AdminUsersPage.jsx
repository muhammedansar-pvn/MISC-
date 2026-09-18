import React, { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  RefreshCw,
  Eye,
  AlertCircle,
  Users as UsersIcon,
  X,
  FileDown,
  LayoutGrid,
  Table as TableIcon,
  Building2,
  GraduationCap,
  UserCheck,
  FolderTree,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import RoleBadge from '../components/admin/RoleBadge';
import StatusBadge from '../components/admin/StatusBadge';
import UserCard from '../components/admin/UserCard';
import { UserCardSkeleton, StatCardSkeleton } from '../components/admin/SkeletonLoader';
import UserFormModal from '../components/admin/UserFormModal';
import UserDetailsModal from '../components/admin/UserDetailsModal';
import { getUsers, getDashboardStats } from '../services/adminService';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & View Mode
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Frontend Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modals & Selected User
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const [usersRes, statsRes] = await Promise.all([
        getUsers(params),
        getDashboardStats().catch(() => ({ data: null })),
      ]);

      if (usersRes.success) {
        setUsers(usersRes.data || []);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch user list:', err);
      setError('Unable to load users. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setCurrentPage(1);
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData();
  };

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalUsersCount = users.length;
  const totalPages = Math.ceil(totalUsersCount / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = users.slice(startIndex, startIndex + pageSize);

  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const suspendedCount = users.filter((u) => u.status === 'SUSPENDED').length;

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* 1. Header & Actions Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs w-full min-w-0 flex-wrap">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-semibold text-[#132238]">Users</h1>
            <span className="px-3 py-0.5 text-xs font-extrabold bg-[#2F7C7A]/10 text-[#2F7C7A] rounded-full border border-[#2F7C7A]/20">
              {totalUsersCount} Total
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage system users including administrators, institutions, students, and faculty members.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361] transition-all shadow-xs"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Add User
          </button>

          <button
            onClick={() => handleClearFilters()}
            className="inline-flex items-center justify-center px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all"
          >
            <UsersIcon className="w-4 h-4 mr-1.5 text-slate-500" /> Directory
          </button>

          <button
            onClick={() => alert('Role distribution analytics feature coming soon.')}
            className="inline-flex items-center justify-center px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all hidden sm:inline-flex"
          >
            <FolderTree className="w-4 h-4 mr-1.5 text-slate-500" /> Role Distribution
          </button>
        </div>
      </div>

      {/* 2. Responsive 4 Statistics Cards */}
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
                  {stats?.totalUsers !== undefined ? stats.totalUsers : totalUsersCount}
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">
                  <span className="text-emerald-600 font-bold">{activeCount} Active</span> /{' '}
                  <span className="text-rose-600 font-bold">{suspendedCount} Suspended</span>
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

      {/* 3. Filter & Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8E0] shadow-xs space-y-3 w-full min-w-0">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 flex-wrap w-full min-w-0">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full min-w-[220px] flex items-center space-x-2">
            <div className="relative flex-1 min-w-0">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, username..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2E8E0] bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] transition-all"
              />
            </div>
          </form>

          {/* Role & Status Dropdown Filters */}
          <div className="flex items-center space-x-2 w-full lg:w-auto flex-wrap sm:flex-nowrap gap-y-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#E2E8E0] bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] flex-1 sm:flex-none"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">ADMINISTRATOR</option>
              <option value="INSTITUTION">INSTITUTION ADMIN</option>
              <option value="FACULTY">FACULTY MEMBER</option>
              <option value="STUDENT">STUDENT</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#E2E8E0] bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] flex-1 sm:flex-none"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INVITED">INVITED</option>
              <option value="PENDING_SETUP">PENDING SETUP</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>

          {/* Right Action Controls: PDF & View Switch */}
          <div className="flex items-center space-x-3 w-full lg:w-auto justify-between lg:justify-end flex-wrap sm:flex-nowrap gap-y-2">
            <button
              onClick={() => alert('PDF report export is currently unavailable.')}
              className="inline-flex items-center px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all opacity-80"
              title="PDF Report Generation"
            >
              <FileDown className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Download PDF
            </button>

            {/* Cards vs Table Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white text-[#132238] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-[#132238] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>

            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Showing <strong className="text-[#132238]">{paginatedUsers.length}</strong> of {totalUsersCount} users
            </span>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {(search || roleFilter || statusFilter) && (
          <div className="flex items-center space-x-2 text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-y-1">
            <span className="font-semibold">Active Filters:</span>
            {search && <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-mono">"{search}"</span>}
            {roleFilter && <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded font-bold">{roleFilter}</span>}
            {statusFilter && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded font-bold">{statusFilter}</span>}
            <button
              onClick={handleClearFilters}
              className="text-[#2F7C7A] hover:underline font-bold ml-2 inline-flex items-center"
            >
              <X className="w-3.5 h-3.5 mr-1" /> Clear all
            </button>
          </div>
        )}
      </div>

      {/* 4. Main User Data Container (Cards or Table) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full min-w-0">
          <UserCardSkeleton />
          <UserCardSkeleton />
          <UserCardSkeleton />
          <UserCardSkeleton />
        </div>
      ) : error ? (
        <div className="bg-white p-12 rounded-2xl border border-rose-200 text-center space-y-4 w-full min-w-0">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-rose-700">{error}</p>
          <button
            onClick={fetchData}
            className="inline-flex items-center px-4 py-2 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl border border-[#E2E8E0] text-center space-y-3 w-full min-w-0">
          <UsersIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-[#132238]">No users found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            No registered users matching the selected filter criteria could be found.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* Card Grid View (3 columns on 1024px desktop, 4 columns on 1280px+ desktop) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5 w-full min-w-0">
          {paginatedUsers.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              onDetails={(u) => setSelectedUser(u)}
              onEdit={(u) => setIsInviteModalOpen(true)}
              onToggleStatus={(u) => alert(`Status toggle for ${u.name || u.email} requested.`)}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-xs overflow-hidden w-full min-w-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm min-w-[700px]">
              <thead className="bg-[#F7F8F5] text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-[#E2E8E0]">
                <tr>
                  <th className="px-6 py-4">Name & Title</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {paginatedUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-[#132238]">{user.name || 'Unassigned User'}</p>
                        <p className="text-xs text-slate-400">{user.department || 'MISC Central'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">@{user.username || 'unassigned'}</td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{user.email}</td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-all"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8E0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs w-full min-w-0">
          <span className="text-slate-500 font-semibold">
            Showing <strong className="text-[#132238]">{startIndex + 1}</strong> to{' '}
            <strong className="text-[#132238]">{Math.min(startIndex + pageSize, totalUsersCount)}</strong> of{' '}
            <strong className="text-[#132238]">{totalUsersCount}</strong> users
          </span>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg font-bold transition-all text-xs ${
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
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Invite/Add User Modal */}
      <UserFormModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={fetchData}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
      />
    </div>
  );
};

export default AdminUsersPage;
