'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, RefreshCw, AlertCircle, Edit3, X, User as UserIcon } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import { getFacultyMembers, createFaculty, updateFaculty } from '@/services/faculty.service';
import { getInstitutions } from '@/services/institution.service';
import { getUsers } from '@/services/admin.service';
import { FacultyProfile, Institution, User } from '@/types';

export default function AdminFacultyPage() {
  const [facultyList, setFacultyList] = useState<FacultyProfile[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyProfile | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<any>({
    userId: '',
    facultyId: '',
    nameEnglish: '',
    nameArabic: '',
    placeEnglish: '',
    designation: '',
    islamicQualification: '',
    academicQualification: '',
    joiningYear: new Date().getFullYear(),
    previousExperience: '',
    contactNumber: '',
    institutionId: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [facRes, instRes] = await Promise.all([
        getFacultyMembers().catch(() => ({ success: false, data: [] })),
        getInstitutions().catch(() => ({ success: false, data: [] })),
      ]);

      setFacultyList(facRes.data || []);
      setInstitutions(instRes.data || []);
    } catch (err: any) {
      console.error('Failed to fetch faculty records:', err);
      setError('Failed to retrieve faculty records from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        nameEnglish: fac.nameEnglish || (fac.userId as any)?.name || '',
        nameArabic: fac.nameArabic || '',
        placeEnglish: fac.placeEnglish || '',
        designation: fac.designation || '',
        islamicQualification: fac.islamicQualification || '',
        academicQualification: fac.academicQualification || '',
        joiningYear: fac.joiningYear || new Date().getFullYear(),
        previousExperience: fac.previousExperience || '',
        contactNumber: fac.contactNumber || (fac.userId as any)?.mobile || '',
        institutionId: (fac.institutionId as any)?._id || fac.institutionId || '',
      });
      setFormLoading(false);
    } else {
      setEditingFaculty(null);
      setSelectedUser(null);
      setFormData({
        userId: '',
        facultyId: `FAC-${Date.now().toString().slice(-4)}`,
        nameEnglish: '',
        nameArabic: '',
        placeEnglish: '',
        designation: 'Assistant Professor',
        islamicQualification: '',
        academicQualification: 'M.A., Ph.D.',
        joiningYear: new Date().getFullYear(),
        previousExperience: '',
        contactNumber: '',
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
        await updateFaculty(editingFaculty._id, formData);
      } else {
        await createFaculty(formData);
      }
      setFormLoading(false);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormLoading(false);
      setFormError(err.response?.data?.message || 'Failed to save faculty profile.');
    }
  };

  const filtered = facultyList.filter((f) => {
    const q = search.toLowerCase();
    const name = ((f.userId as any)?.name || f.nameEnglish || '').toLowerCase();
    const email = ((f.userId as any)?.email || '').toLowerCase();
    const emp = (f.facultyId || '').toLowerCase();
    return name.includes(q) || email.includes(q) || emp.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-serif font-bold text-[#132238]">Faculty Profiles Directory</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-teal-100 text-teal-800 rounded-full">
              {facultyList.length} Faculty Profiles
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Link registered faculty user accounts with academic profiles</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Faculty Profile
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8E0] shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by faculty name, email, or employee ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2E8E0] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading faculty directory...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button onClick={fetchData} className="px-4 py-2 bg-[#2F7C7A] text-white font-bold text-xs rounded-lg uppercase cursor-pointer">
              <RefreshCw className="w-4 h-4 mr-2 inline" /> Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-[#132238]">No faculty profiles found</h3>
            <p className="text-sm text-slate-500">Create faculty profiles to link registered faculty accounts.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#E2E8E0]">
                <tr>
                  <th className="px-6 py-4">Faculty Member & Account</th>
                  <th className="px-6 py-4">Emp. ID</th>
                  <th className="px-6 py-4">Designation & Institution</th>
                  <th className="px-6 py-4">Qualifications</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {filtered.map((fac) => (
                  <tr key={fac._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#132238]">
                      {(fac.userId as any)?.name || fac.nameEnglish || 'N/A'}
                      <p className="text-xs text-slate-400 font-normal">{(fac.userId as any)?.email || 'No email'}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-[#2F7C7A] font-semibold">{fac.facultyId}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">{fac.designation || 'Lecturer'}</p>
                      <p className="text-slate-400">{(fac.institutionId as any)?.institutionName || (fac.institutionId as any)?.name || 'Default Campus'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700">
                      <p className="font-medium text-slate-800">{fac.academicQualification || '-'}</p>
                      {fac.islamicQualification && <p className="text-slate-400">{fac.islamicQualification}</p>}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={(fac.userId as any)?.status || 'ACTIVE'} /></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenModal(fac)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                        <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-xl border border-[#E2E8E0] p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#132238]">
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
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] cursor-pointer"
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
                <div className="p-3 bg-[#F7F8F5] rounded-xl border border-[#E2E8E0] space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#132238] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><UserIcon className="w-3.5 h-3.5 text-[#2F7C7A]" /> Linked Account Info</span>
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full font-bold text-[10px]">{selectedUser.role}</span>
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
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Employee ID (Emp ID) *</label>
                  <input
                    type="text"
                    required
                    value={formData.facultyId}
                    onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                    placeholder="FAC-1001"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Senior Lecturer"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A]"
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
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Islamic Qualification</label>
                  <input
                    type="text"
                    value={formData.islamicQualification}
                    onChange={(e) => setFormData({ ...formData, islamicQualification: e.target.value })}
                    placeholder="e.g. Al-Azhar, Fazil"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A]"
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
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Contact Number</label>
                  <input
                    type="text"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Institution</label>
                <select
                  value={formData.institutionId}
                  onChange={(e) => setFormData({ ...formData, institutionId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A] cursor-pointer"
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
                  className="px-5 py-2 bg-[#2F7C7A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#256361] disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? 'Saving...' : editingFaculty ? 'Update Profile' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
