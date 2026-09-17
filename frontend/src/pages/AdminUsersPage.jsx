import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  RefreshCw,
  Eye,
  AlertCircle,
  Users as UsersIcon,
  X,
} from 'lucide-react';
import RoleBadge from '../components/admin/RoleBadge';
import StatusBadge from '../components/admin/StatusBadge';
import UserFormModal from '../components/admin/UserFormModal';
import UserDetailsModal from '../components/admin/UserDetailsModal';
import { getUsers } from '../services/adminService';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsersList = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await getUsers(params);
      if (res.success) {
        setUsers(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Unable to load users. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsersList();
  };

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-serif font-bold text-[#132238]">User Management</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-[#2F7C7A]/10 text-[#2F7C7A] rounded-full">
              {users.length} Users
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage system accounts, send invitations, and inspect user profiles
          </p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361] transition-all shadow-sm"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Invite New User
        </button>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8E0] shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or username..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2E8E0] bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E2E8E0] bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] transition-all"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="INSTITUTION">INSTITUTION</option>
              <option value="FACULTY">FACULTY</option>
              <option value="STUDENT">STUDENT</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E2E8E0] bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] transition-all"
            >
              <option value="">All Statuses</option>
              <option value="INVITED">INVITED</option>
              <option value="PENDING_SETUP">PENDING SETUP</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>
        </form>

        {(search || roleFilter || statusFilter) && (
          <div className="flex items-center space-x-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>Active filters:</span>
            {search && <span className="px-2 py-0.5 bg-slate-100 rounded">Query: "{search}"</span>}
            {roleFilter && <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded">Role: {roleFilter}</span>}
            {statusFilter && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded">Status: {statusFilter}</span>}
            <button
              onClick={handleClearFilters}
              className="text-[#2F7C7A] hover:underline font-bold ml-2 inline-flex items-center"
            >
              <X className="w-3 h-3 mr-1" /> Clear all
            </button>
          </div>
        )}
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              onClick={fetchUsersList}
              className="inline-flex items-center px-4 py-2 bg-[#2F7C7A] text-white font-bold text-xs rounded-lg uppercase tracking-wider"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <UsersIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-[#132238]">No users found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              No registered user matching the selected criteria could be found in the database.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#E2E8E0]">
                <tr>
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Mobile</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-[#132238]">{user.name || 'N/A'}</p>
                        <p className="text-xs font-mono text-slate-400">@{user.username || 'unassigned'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{user.email}</td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-mono">{user.mobile || '-'}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="inline-flex items-center px-3 py-1.5 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <UserFormModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={fetchUsersList}
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
