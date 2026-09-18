import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Search, RefreshCw, AlertCircle, Edit3, Eye, X } from 'lucide-react';
import StatusBadge from '../components/admin/StatusBadge';
import { getStudents, registerStudent, updateStudent } from '../services/studentService';
import { getInstitutions } from '../services/institutionService';
import { getClasses } from '../services/academicService';

export const AdminStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    admissionNumber: '',
    rollNumber: '',
    institutionId: '',
    classId: '',
    mobile: '',
    status: 'ACTIVE',
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

  const handleOpenModal = (std = null) => {
    if (std) {
      setEditingStudent(std);
      setFormData({
        name: std.userId?.name || std.name || '',
        email: std.userId?.email || std.email || '',
        admissionNumber: std.admissionNumber || '',
        rollNumber: std.rollNumber || '',
        institutionId: std.institutionId?._id || std.institutionId || '',
        classId: std.classId?._id || std.classId || '',
        mobile: std.mobile || '',
        status: std.status || 'ACTIVE',
      });
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        email: '',
        admissionNumber: `ADM-${Date.now().toString().slice(-4)}`,
        rollNumber: '',
        institutionId: institutions[0]?._id || '',
        classId: classesList[0]?._id || '',
        mobile: '',
        status: 'ACTIVE',
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
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
      setFormError(err.response?.data?.message || 'Failed to save student record.');
    }
  };

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const name = (s.userId?.name || s.name || '').toLowerCase();
    const email = (s.userId?.email || s.email || '').toLowerCase();
    const adm = (s.admissionNumber || '').toLowerCase();
    return name.includes(q) || email.includes(q) || adm.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-serif font-bold text-[#132238]">Student Directory</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
              {students.length} Enrolled
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Manage student admissions, class assignments, and profiles</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361]"
        >
          <Plus className="w-4 h-4 mr-2" /> Register Student
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
            placeholder="Search by student name, email, or admission number..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2E8E0] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading student directory...</p>
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
            <h3 className="text-base font-bold text-[#132238]">No student records found</h3>
            <p className="text-sm text-slate-500">Register new students to manage academic profiles.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#E2E8E0]">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Admission No.</th>
                  <th className="px-6 py-4">Roll No.</th>
                  <th className="px-6 py-4">Institution / Class</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {filtered.map((std) => (
                  <tr key={std._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#132238]">
                      {std.userId?.name || std.name || 'N/A'}
                      <p className="text-xs text-slate-400 font-normal">{std.userId?.email || std.email}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700">{std.admissionNumber}</td>
                    <td className="px-6 py-4 font-mono text-slate-700">{std.rollNumber || '-'}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">{std.institutionId?.institutionName || 'Default Campus'}</p>
                      <p className="text-slate-400">{std.classId?.name || 'Class N/A'}</p>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={std.status} /></td>
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
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-[#E2E8E0] p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#132238]">{editingStudent ? 'Edit Student Record' : 'Register Student'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            {formError && <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded">{formError}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {!editingStudent && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Student Full Name *</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full Name" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Email Address *</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="student@markaz.in" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Admission No. *</label>
                  <input type="text" required value={formData.admissionNumber} onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Roll No.</label>
                  <input type="text" value={formData.rollNumber} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} placeholder="e.g. 101" className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Institution</label>
                  <select value={formData.institutionId} onChange={(e) => setFormData({ ...formData, institutionId: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                    {institutions.map((i) => <option key={i._id} value={i._id}>{i.institutionName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Class</label>
                  <select value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                    {classesList.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-xs font-bold">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-5 py-2 bg-[#2F7C7A] text-white rounded-lg text-xs font-bold uppercase">
                  {formLoading ? 'Saving...' : editingStudent ? 'Update' : 'Register'}
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
