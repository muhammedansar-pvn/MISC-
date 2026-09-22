import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Search, RefreshCw, AlertCircle, Edit3, X, User } from 'lucide-react';
import StatusBadge from '../components/admin/StatusBadge';
import { getStudents, registerStudent, updateStudent } from '../services/studentService';
import { getInstitutions } from '../services/institutionService';
import { getClasses } from '../services/academicService';
import { getUsers } from '../services/adminService';

export const AdminStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    nameEnglish: '',
    nameArabic: '',
    placeEnglish: '',
    dateOfBirth: '',
    admissionYear: new Date().getFullYear(),
    classId: '',
    institutionId: '',
    contactNumber: '',
    fatherName: '',
    motherName: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [stdRes, instRes, clsRes] = await Promise.all([
        getStudents().catch(() => ({ data: [] })),
        getInstitutions().catch(() => ({ data: [] })),
        getClasses().catch(() => ({ data: [] })),
      ]);

      setStudents(stdRes.data || []);
      setInstitutions(instRes.data || []);
      setClassesList(clsRes.data || []);
    } catch (err) {
      console.error('Failed to load student records:', err);
      setError('Failed to retrieve student records from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = async (std = null) => {
    setFormError('');
    setFormLoading(true);
    setIsModalOpen(true);

    if (std) {
      setEditingStudent(std);
      setSelectedUser(std.userId || null);
      setFormData({
        userId: std.userId?._id || std.userId || '',
        nameEnglish: std.nameEnglish || std.userId?.name || '',
        nameArabic: std.nameArabic || '',
        placeEnglish: std.placeEnglish || '',
        dateOfBirth: std.dateOfBirth ? new Date(std.dateOfBirth).toISOString().split('T')[0] : '',
        admissionYear: std.admissionYear || new Date().getFullYear(),
        classId: std.classId?._id || std.classId || '',
        institutionId: std.institutionId?._id || std.institutionId || '',
        contactNumber: std.contactNumber || std.userId?.mobile || '',
        fatherName: std.fatherName || '',
        motherName: std.motherName || '',
      });
      setFormLoading(false);
    } else {
      setEditingStudent(null);
      setSelectedUser(null);
      setFormData({
        userId: '',
        nameEnglish: '',
        nameArabic: '',
        placeEnglish: '',
        dateOfBirth: '2005-01-01',
        admissionYear: new Date().getFullYear(),
        classId: classesList[0]?._id || '',
        institutionId: institutions[0]?._id || '',
        contactNumber: '',
        fatherName: '',
        motherName: '',
      });

      try {
        const usersRes = await getUsers({ role: 'STUDENT' });
        const studentUsers = usersRes.data || [];
        setAvailableUsers(studentUsers);

        if (studentUsers.length > 0) {
          const first = studentUsers[0];
          setSelectedUser(first);
          setFormData((prev) => ({
            ...prev,
            userId: first._id,
            nameEnglish: first.name || '',
            contactNumber: first.mobile || '',
          }));
        }
      } catch (err) {
        console.error('Failed to fetch student users:', err);
        setFormError('Failed to load registered student users.');
      } finally {
        setFormLoading(false);
      }
    }
  };

  const handleUserSelect = (uId) => {
    const found = availableUsers.find((u) => u._id === uId);
    setSelectedUser(found || null);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        userId: found._id,
        nameEnglish: found.name || prev.nameEnglish,
        contactNumber: found.mobile || prev.contactNumber,
      }));
    } else {
      setFormData((prev) => ({ ...prev, userId: uId }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.userId) {
      setFormError('Please select a registered student user.');
      return;
    }

    setFormLoading(true);

    try {
      if (editingStudent) {
        await updateStudent(editingStudent._id, formData);
      } else {
        await registerStudent(formData);
      }
      setFormLoading(false);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setFormLoading(false);
      setFormError(err.response?.data?.message || 'Failed to save student profile.');
    }
  };

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const name = (s.userId?.name || s.nameEnglish || '').toLowerCase();
    const email = (s.userId?.email || '').toLowerCase();
    const reg = (s.registrationNumber || '').toLowerCase();
    return name.includes(q) || email.includes(q) || reg.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-serif font-bold text-[#132238]">Student Profiles Directory</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
              {students.length} Profiles
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Link registered student accounts with institutional academic profiles</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Student Profile
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
            placeholder="Search by student name, email, or registration number..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2E8E0] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading student profiles...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button onClick={fetchData} className="px-4 py-2 bg-[#2F7C7A] text-white font-bold text-xs rounded-lg uppercase">
              <RefreshCw className="w-4 h-4 mr-2 inline" /> Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-[#132238]">No student profiles found</h3>
            <p className="text-sm text-slate-500">Create a student profile to link registered student accounts.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#E2E8E0]">
                <tr>
                  <th className="px-6 py-4">Student Name & Account</th>
                  <th className="px-6 py-4">Reg. Number</th>
                  <th className="px-6 py-4">Parents</th>
                  <th className="px-6 py-4">Institution / Class</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {filtered.map((std) => (
                  <tr key={std._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#132238]">
                      {std.userId?.name || std.nameEnglish || 'N/A'}
                      <p className="text-xs text-slate-400 font-normal">{std.userId?.email || 'No email'}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-[#2F7C7A] font-semibold">{std.registrationNumber}</td>
                    <td className="px-6 py-4 text-xs text-slate-700">
                      <p className="font-medium text-slate-800">F: {std.fatherName || 'N/A'}</p>
                      <p className="text-slate-400">M: {std.motherName || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">{std.institutionId?.name || 'Default Campus'}</p>
                      <p className="text-slate-400">{std.classId?.className || 'Class N/A'}</p>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={std.userId?.status || 'ACTIVE'} /></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenModal(std)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50">
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
                {editingStudent ? 'Edit Student Profile' : 'Create Student Profile'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            {formError && <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded font-medium">{formError}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {/* Registered User Selection / Preview */}
              {!editingStudent ? (
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Select Registered Student Account *</label>
                  {availableUsers.length === 0 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                      No available registered student users found. Please register a student user in User Management first.
                    </div>
                  ) : (
                    <select
                      value={formData.userId}
                      onChange={(e) => handleUserSelect(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2F7C7A]"
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
                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-[#2F7C7A]" /> Linked Account Info</span>
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full font-bold text-[10px]">{selectedUser.role}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                    <div><span className="font-semibold text-slate-700">Name:</span> {selectedUser.name}</div>
                    <div><span className="font-semibold text-slate-700">Email:</span> {selectedUser.email}</div>
                    <div><span className="font-semibold text-slate-700">Username:</span> {selectedUser.username}</div>
                    <div><span className="font-semibold text-slate-700">User ID:</span> <span className="font-mono text-[11px]">{selectedUser._id || selectedUser}</span></div>
                  </div>
                </div>
              )}

              {/* Profile Specific Fields */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Student Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nameEnglish}
                    onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value })}
                    placeholder="Full Name in English"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Father Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="Father Name"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Mother Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    placeholder="Mother Name"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Admission Year *</label>
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    required
                    value={formData.admissionYear}
                    onChange={(e) => setFormData({ ...formData, admissionYear: parseInt(e.target.value, 10) || '' })}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Institution</label>
                  <select
                    value={formData.institutionId}
                    onChange={(e) => setFormData({ ...formData, institutionId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A]"
                  >
                    <option value="">-- None --</option>
                    {institutions.map((i) => <option key={i._id} value={i._id}>{i.name || i.institutionName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Class</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#2F7C7A]"
                  >
                    <option value="">-- None --</option>
                    {classesList.map((c) => <option key={c._id} value={c._id}>{c.className || c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button
                  type="submit"
                  disabled={formLoading || (!editingStudent && availableUsers.length === 0)}
                  className="px-5 py-2 bg-[#2F7C7A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#256361] disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : editingStudent ? 'Update Profile' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentsPage;
