'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  Edit3,
  X,
  User as UserIcon,
  Eye,
  MoreVertical,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import {
  getFacultyMembers,
  getFacultyById,
  createFaculty,
  updateFaculty,
  updateFacultyStatus,
  deleteFaculty,
} from '@/services/faculty.service';
import { getInstitutions } from '@/services/institution.service';
import { getUsers } from '@/services/admin.service';
import { FacultyProfile, Institution, User } from '@/types';

const getAssignedFacultyItems = (faculty: any, assignmentKey: 'classId' | 'subjectId', profileKey: 'assignedClasses' | 'assignedSubjects') => {
  const activeAssignments = (faculty.currentAssignments || [])
    .map((assignment: any) => assignment[assignmentKey])
    .filter(Boolean);
  const profileAssignments = Array.isArray(faculty[profileKey]) ? faculty[profileKey] : [];
  const items = [...activeAssignments, ...profileAssignments];
  return [...new Map(items.map((item: any) => [String(item?._id || item), item])).values()];
};

export default function AdminFacultyPage() {
  const [facultyList, setFacultyList] = useState<FacultyProfile[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [notice, setNotice] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [viewingFaculty, setViewingFaculty] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyProfile | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<any>({
    userId: '',
    facultyId: '',
    email: '',
    nameEnglish: '',
    nameArabic: '',
    placeEnglish: '',
    designation: '',
    islamicQualification: '',
    academicQualification: '',
    joiningYear: new Date().getFullYear(),
    previousExperience: '',
    contactNumber: '',
    department: '',
    institutionId: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const pageSize = 20;

  const fetchData = useCallback(async (targetPage = page) => {
    setLoading(true);
    setError('');
    try {
      const [facRes, instRes] = await Promise.all([
        getFacultyMembers({
          page: targetPage,
          limit: pageSize,
          search: search.trim() || undefined,
          status: statusFilter || undefined,
          department: departmentFilter.trim() || undefined,
        }),
        getInstitutions().catch(() => ({ success: false, data: [] })),
      ]);

      if (!facRes.success) throw new Error(facRes.message || 'Failed to load faculty records.');
      setFacultyList(facRes.data || []);
      setTotal(facRes.total ?? (facRes.data || []).length);
      setTotalPages(facRes.totalPages ?? 1);
      setInstitutions(instRes.data || []);
    } catch (err: any) {
      console.error('Failed to fetch faculty records:', err);
      setError(err.response?.data?.message || err.message || 'Failed to retrieve faculty records from server.');
    } finally {
      setLoading(false);
    }
  }, [departmentFilter, page, search, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => fetchData(page), search.trim() ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [fetchData, page, search]);

  const handleOpenModal = async (fac: FacultyProfile | null = null) => {
    setFormError('');
    setFormLoading(true);
    setIsModalOpen(true);

    if (fac) {
      setEditingFaculty(fac);
      setSelectedUser((fac.userId as unknown as User) || null);
      setFormData({
        userId: (fac.userId as any)?._id || fac.userId || '',
        facultyId: fac.facultyId || '',
        email: (fac.userId as any)?.pendingEmail || (fac.userId as any)?.email || '',
        nameEnglish: fac.nameEnglish || (fac.userId as any)?.name || '',
        nameArabic: fac.nameArabic || '',
        placeEnglish: fac.placeEnglish || '',
        designation: fac.designation || '',
        islamicQualification: fac.islamicQualification || '',
        academicQualification: fac.academicQualification || '',
        joiningYear: fac.joiningYear || new Date().getFullYear(),
        previousExperience: fac.previousExperience || '',
        contactNumber: fac.contactNumber || (fac.userId as any)?.mobile || '',
        department: fac.department || '',
        institutionId: (fac.institutionId as any)?._id || fac.institutionId || '',
      });
      setFormLoading(false);
    } else {
      setEditingFaculty(null);
      setSelectedUser(null);
      setFormData({
        userId: '',
        facultyId: `FAC-${Date.now().toString().slice(-4)}`,
        email: '',
        nameEnglish: '',
        nameArabic: '',
        placeEnglish: '',
        designation: 'Assistant Professor',
        islamicQualification: '',
        academicQualification: 'M.A., Ph.D.',
        joiningYear: new Date().getFullYear(),
        previousExperience: '',
        contactNumber: '',
        department: '',
        institutionId: institutions[0]?._id || '',
      });

      try {
        const usersRes = await getUsers({ role: 'FACULTY' });
        const facultyUsers = usersRes.data || [];
        setAvailableUsers(facultyUsers);

        if (facultyUsers.length > 0) {
          const first = facultyUsers[0];
          setSelectedUser(first);
          setFormData((prev: any) => ({
            ...prev,
            userId: first._id,
            email: first.email || '',
            nameEnglish: first.name || '',
            contactNumber: first.mobile || '',
          }));
        }
      } catch (err: any) {
        console.error('Failed to fetch faculty users:', err);
        setFormError('Failed to load registered faculty users.');
      } finally {
        setFormLoading(false);
      }
    }
  };

  const handleUserSelect = (uId: string) => {
    const found = availableUsers.find((u) => u._id === uId);
    setSelectedUser(found || null);
    if (found) {
      setFormData((prev: any) => ({
        ...prev,
        userId: found._id,
        email: found.email || prev.email,
        nameEnglish: found.name || prev.nameEnglish,
        contactNumber: found.mobile || prev.contactNumber,
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, userId: uId }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.userId) {
      setFormError('Please select a registered faculty user.');
      return;
    }

    setFormLoading(true);

    try {
      if (editingFaculty) {
        const response = await updateFaculty(editingFaculty._id, formData);
        setNotice(response.data?.requiresEmailVerification
          ? `Faculty profile saved. Verify the new email address at ${response.data.email || formData.email} to complete the change.`
          : 'Faculty profile updated.');
      } else {
        await createFaculty(formData);
        setNotice('Faculty profile created.');
      }
      setFormLoading(false);
      setIsModalOpen(false);
      await fetchData(page);
    } catch (err: any) {
      setFormLoading(false);
      setFormError(err.response?.data?.message || 'Failed to save faculty profile.');
    }
  };

  const filtered = facultyList;

  const handleView = async (faculty: FacultyProfile) => {
    setActiveMenuId(null);
    setDetailsError('');
    setDetailsLoading(true);
    setViewingFaculty({ _id: faculty._id });
    try {
      const response = await getFacultyById(faculty._id);
      if (!response.success || !response.data) throw new Error(response.message || 'Faculty details are unavailable.');
      setViewingFaculty(response.data);
    } catch (err: any) {
      setDetailsError(err.response?.data?.message || err.message || 'Failed to load faculty details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleToggleStatus = async (faculty: FacultyProfile, nextStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
    const prompt = nextStatus === 'INACTIVE'
      ? 'Are you sure you want to deactivate this faculty?'
      : nextStatus === 'SUSPENDED'
        ? 'Are you sure you want to suspend this faculty account?'
        : 'Activate this faculty account?';
    if (!window.confirm(prompt)) return;

    setActiveMenuId(null);
    setActionLoadingId(faculty._id);
    setError('');
    try {
      await updateFacultyStatus(faculty._id, nextStatus);
      setNotice(nextStatus === 'ACTIVE'
        ? 'Faculty account activated.'
        : `Faculty ${nextStatus === 'SUSPENDED' ? 'suspended' : 'deactivated'}. Existing academic records and assignments were preserved.`);
      await fetchData(page);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update faculty status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (faculty: FacultyProfile) => {
    if (!window.confirm('Are you sure you want to delete this faculty? Existing academic records will be preserved.')) return;

    setActiveMenuId(null);
    setActionLoadingId(faculty._id);
    setError('');
    try {
      await deleteFaculty(faculty._id);
      setNotice('Faculty deleted. The account and profile were soft-deleted; academic records were preserved.');
      if (facultyList.length === 1 && page > 1) setPage(page - 1);
      else await fetchData(page);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete faculty.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getAccountStatus = (faculty: FacultyProfile) =>
    (((faculty.userId as any)?.status || faculty.status || 'INACTIVE') as string).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E3EAE5] shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-serif font-bold text-[#171D19]">Faculty Profiles Directory</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-green-100 text-green-800 rounded-full">
              {total} Faculty Profiles
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Manage faculty accounts, profiles, and academic responsibilities.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => fetchData(page)} disabled={loading} className="inline-flex items-center justify-center px-3 py-2.5 border border-[#E3EAE5] text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 disabled:opacity-50 cursor-pointer">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-[#23804A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#1B6F41] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Faculty Profile
          </button>
        </div>
      </div>

      {notice && (
        <div className="flex items-start justify-between gap-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} aria-label="Dismiss" className="text-emerald-700"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3EAE5] shadow-xs grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, email, or employee ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E3EAE5] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#23804A]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-full px-3 py-2 rounded-xl border border-[#E3EAE5] text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#23804A] bg-white"
          aria-label="Filter faculty by status"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="PENDING_SETUP">Pending setup</option>
          <option value="INVITED">Invited</option>
        </select>
        <input
          type="text"
          value={departmentFilter}
          onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
          placeholder="Filter by department..."
          className="w-full px-3 py-2 rounded-xl border border-[#E3EAE5] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#23804A]"
          aria-label="Filter faculty by department"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E3EAE5] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#23804A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading faculty directory...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button onClick={() => fetchData(page)} className="px-4 py-2 bg-[#23804A] text-white font-bold text-xs rounded-lg uppercase cursor-pointer">
              <RefreshCw className="w-4 h-4 mr-2 inline" /> Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-[#171D19]">No faculty profiles found</h3>
            <p className="text-sm text-slate-500">
              {search || statusFilter || departmentFilter
                ? 'No faculty members match the current search and filters.'
                : 'Create faculty profiles to link registered faculty accounts.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FBFCFB] text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#E3EAE5]">
                <tr>
                  <th className="px-5 py-4">Faculty</th>
                  <th className="px-5 py-4">Mobile</th>
                  <th className="px-5 py-4">Faculty ID</th>
                  <th className="px-5 py-4">Department & Designation</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EAE5]">
                {filtered.map((fac) => (
                  <tr key={fac._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-[#171D19]">
                      {(fac.userId as any)?.name || fac.nameEnglish || 'N/A'}
                      <p className="text-xs text-slate-400 font-normal">{(fac.userId as any)?.email || 'No email'}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-700">{(fac.userId as any)?.mobile || fac.contactNumber || '—'}</td>
                    <td className="px-5 py-4 font-mono text-[#23804A] font-semibold">{fac.facultyId || '—'}</td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">{fac.department || '—'}</p>
                      <p className="text-slate-400">{fac.designation || '—'}</p>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={getAccountStatus(fac)} /></td>
                    <td className="px-5 py-4 text-xs text-slate-500">{fac.createdAt ? new Date(fac.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          disabled={actionLoadingId === fac._id}
                          onClick={() => setActiveMenuId(activeMenuId === fac._id ? null : fac._id)}
                          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-50 cursor-pointer"
                          aria-label={`Actions for ${fac.nameEnglish || 'faculty member'}`}
                          aria-expanded={activeMenuId === fac._id}
                        >
                          {actionLoadingId === fac._id ? <span className="text-xs">Saving…</span> : <MoreVertical className="w-4 h-4" />}
                        </button>
                        {activeMenuId === fac._id && actionLoadingId !== fac._id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-[#E3EAE5] py-1.5 z-20">
                            <button type="button" onClick={() => handleView(fac)} className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                              <Eye className="w-3.5 h-3.5" /> View details
                            </button>
                            <button type="button" onClick={() => { setActiveMenuId(null); handleOpenModal(fac); }} className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                            {getAccountStatus(fac) === 'ACTIVE' && (
                              <>
                                <button type="button" onClick={() => handleToggleStatus(fac, 'INACTIVE')} className="w-full px-3 py-2 text-left text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2">
                                  <ShieldAlert className="w-3.5 h-3.5" /> Deactivate
                                </button>
                                <button type="button" onClick={() => handleToggleStatus(fac, 'SUSPENDED')} className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2">
                                  <ShieldAlert className="w-3.5 h-3.5" /> Suspend
                                </button>
                              </>
                            )}
                            {['INACTIVE', 'SUSPENDED'].includes(getAccountStatus(fac)) && (
                              <button type="button" onClick={() => handleToggleStatus(fac, 'ACTIVE')} className="w-full px-3 py-2 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5" /> Activate
                              </button>
                            )}
                            <div className="my-1 border-t border-slate-100" />
                            <button type="button" onClick={() => handleDelete(fac)} className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2">
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && total > 0 && (
          <div className="px-5 py-3 bg-[#FBFCFB] border-t border-[#E3EAE5] flex items-center justify-between text-xs text-slate-600">
            <span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} faculty</span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="p-1.5 border rounded-lg disabled:opacity-40 hover:bg-white" aria-label="Previous page">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>Page {page} of {Math.max(1, totalPages)}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="p-1.5 border rounded-lg disabled:opacity-40 hover:bg-white" aria-label="Next page">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-xl border border-[#E3EAE5] p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#171D19]">
                {editingFaculty ? 'Edit Faculty Profile' : 'Add Faculty Profile'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            {formError && <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded font-medium">{formError}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {/* Registered User Selection / Preview */}
              {!editingFaculty ? (
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Select Registered Faculty Account *</label>
                  {availableUsers.length === 0 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                      No available registered faculty users found. Please register a faculty user in User Management first.
                    </div>
                  ) : (
                    <select
                      value={formData.userId}
                      onChange={(e) => handleUserSelect(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#23804A] cursor-pointer"
                      required
                    >
                      {availableUsers.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.email}) - Username: {u.username}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : null}

              {/* Read-only Account Info Card */}
              {selectedUser && (
                <div className="p-3 bg-[#FBFCFB] rounded-xl border border-[#E3EAE5] space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#171D19] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><UserIcon className="w-3.5 h-3.5 text-[#23804A]" /> Linked Account Info</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">{selectedUser.role}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                    <div><span className="font-semibold text-slate-700">Name:</span> {selectedUser.name}</div>
                    <div><span className="font-semibold text-slate-700">Email:</span> {selectedUser.email}</div>
                    <div><span className="font-semibold text-slate-700">Username:</span> {selectedUser.username}</div>
                    <div><span className="font-semibold text-slate-700">User ID:</span> <span className="font-mono text-[11px]">{selectedUser._id}</span></div>
                  </div>
                </div>
              )}

              {/* Profile Specific Fields */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Name *</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={formData.nameEnglish}
                    onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    readOnly={!editingFaculty}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] read-only:bg-slate-50 read-only:text-slate-500"
                  />
                  {editingFaculty && <p className="text-[11px] text-slate-500 mt-1">Email changes are saved as pending until verified by the faculty member.</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Employee ID (Emp ID) *</label>
                  <input
                    type="text"
                    required
                    value={formData.facultyId}
                    onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                    placeholder="FAC-1001"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Senior Lecturer"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Academic Qualification</label>
                  <input
                    type="text"
                    value={formData.academicQualification}
                    onChange={(e) => setFormData({ ...formData, academicQualification: e.target.value })}
                    placeholder="e.g. M.A., Ph.D."
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Islamic Qualification</label>
                  <input
                    type="text"
                    value={formData.islamicQualification}
                    onChange={(e) => setFormData({ ...formData, islamicQualification: e.target.value })}
                    placeholder="e.g. Al-Azhar, Fazil"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Joining Year</label>
                  <input
                    type="number"
                    min="1950"
                    max="2100"
                    value={formData.joiningYear}
                    onChange={(e) => setFormData({ ...formData, joiningYear: parseInt(e.target.value, 10) || '' })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Contact Number</label>
                  <input
                    type="text"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Arabic"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Institution</label>
                <select
                  value={formData.institutionId}
                  onChange={(e) => setFormData({ ...formData, institutionId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#23804A] cursor-pointer"
                >
                  <option value="">-- Select Institution --</option>
                  {institutions.map((i) => <option key={i._id} value={i._id}>{i.institutionName || i.name}</option>)}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button
                  type="submit"
                  disabled={formLoading || (!editingFaculty && availableUsers.length === 0)}
                  className="px-5 py-2 bg-[#23804A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1B6F41] disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? 'Saving...' : editingFaculty ? 'Update Profile' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white max-w-3xl w-full rounded-2xl shadow-xl border border-[#E3EAE5] p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#171D19]">Faculty Details</h3>
                {!detailsLoading && viewingFaculty.userId && <p className="text-xs text-slate-500 mt-1">{viewingFaculty.facultyId}</p>}
              </div>
              <button type="button" onClick={() => { setViewingFaculty(null); setDetailsError(''); }} className="text-slate-400 hover:text-slate-600 cursor-pointer" aria-label="Close faculty details">
                <X className="w-5 h-5" />
              </button>
            </div>
            {detailsLoading ? (
              <div className="py-12 text-center text-sm text-slate-500">Loading faculty details…</div>
            ) : detailsError ? (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">{detailsError}</div>
            ) : (
              <>
                <section className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Basic Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500">Name</span><p className="font-semibold text-slate-800">{viewingFaculty.userId?.name || viewingFaculty.nameEnglish || '—'}</p></div>
                    <div><span className="text-slate-500">Email</span><p className="font-semibold text-slate-800">{viewingFaculty.userId?.email || '—'}</p>{viewingFaculty.userId?.pendingEmail && <p className="text-xs text-amber-700">Pending: {viewingFaculty.userId.pendingEmail}</p>}</div>
                    <div><span className="text-slate-500">Mobile</span><p className="font-semibold text-slate-800">{viewingFaculty.userId?.mobile || viewingFaculty.contactNumber || '—'}</p></div>
                    <div><span className="text-slate-500">Status</span><p className="mt-1"><StatusBadge status={viewingFaculty.userId?.status || viewingFaculty.status} /></p></div>
                    <div><span className="text-slate-500">Created</span><p className="font-semibold text-slate-800">{viewingFaculty.createdAt ? new Date(viewingFaculty.createdAt).toLocaleString() : '—'}</p></div>
                  </div>
                </section>

                <section className="space-y-3 border-t pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Academic Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500">Department</span><p className="font-semibold text-slate-800">{viewingFaculty.department || '—'}</p></div>
                    <div><span className="text-slate-500">Designation</span><p className="font-semibold text-slate-800">{viewingFaculty.designation || '—'}</p></div>
                    <div><span className="text-slate-500">Academic qualification</span><p className="font-semibold text-slate-800">{viewingFaculty.academicQualification || '—'}</p></div>
                    <div><span className="text-slate-500">Islamic qualification</span><p className="font-semibold text-slate-800">{viewingFaculty.islamicQualification || '—'}</p></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-xs font-bold text-slate-600 mb-2">Assigned Classes</p>
                      {getAssignedFacultyItems(viewingFaculty, 'classId', 'assignedClasses').length ? (
                        <ul className="space-y-1 text-sm text-slate-700">{getAssignedFacultyItems(viewingFaculty, 'classId', 'assignedClasses').map((item: any) => <li key={String(item?._id || item)}>{item.name || item.code || item._id || String(item)}</li>)}</ul>
                      ) : <p className="text-sm text-slate-500">No active class assignments</p>}
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-xs font-bold text-slate-600 mb-2">Assigned Subjects</p>
                      {getAssignedFacultyItems(viewingFaculty, 'subjectId', 'assignedSubjects').length ? (
                        <ul className="space-y-1 text-sm text-slate-700">{getAssignedFacultyItems(viewingFaculty, 'subjectId', 'assignedSubjects').map((item: any) => <li key={String(item?._id || item)}>{item.subjectName || item.name || item.subjectCode || item._id || String(item)}</li>)}</ul>
                      ) : <p className="text-sm text-slate-500">No active subject assignments</p>}
                    </div>
                  </div>
                </section>

                <section className="space-y-3 border-t pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Academic Activity</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      ['Assigned classes', 'assignedClassesCount'],
                      ['Assigned subjects', 'assignedSubjectsCount'],
                      ['Active assignments', 'activeAssignmentsCount'],
                      ['Timetable entries', 'timetableEntriesCount'],
                      ['Assignments created', 'assignmentsCreatedCount'],
                      ['Attendance records', 'attendanceRecordsCount'],
                      ['Marks evaluated', 'marksEvaluatedCount'],
                      ['Mentees', 'menteesCount'],
                    ].map(([label, key]) => (
                      <div key={key} className="p-3 rounded-xl bg-[#FBFCFB] border border-[#E3EAE5]">
                        <p className="text-[11px] text-slate-500">{label}</p>
                        <p className="text-lg font-bold text-[#171D19]">{viewingFaculty.academicActivity?.[key] ?? '—'}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
