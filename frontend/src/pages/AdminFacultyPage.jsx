import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, RefreshCw, AlertCircle, Edit3, X } from 'lucide-react';
import StatusBadge from '../components/admin/StatusBadge';
import { getFacultyMembers, createFaculty, updateFaculty } from '../services/facultyService';
import { getInstitutions } from '../services/institutionService';

export const AdminFacultyPage = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    designation: '',
    department: '',
    qualification: '',
    institutionId: '',
    status: 'ACTIVE',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [facRes, instRes] = await Promise.all([
        getFacultyMembers().catch(() => ({ data: [] })),
        getInstitutions().catch(() => ({ data: [] })),
      ]);

      setFacultyList(facRes.data || []);
      setInstitutions(instRes.data || []);
    } catch (err) {
      console.error('Failed to fetch faculty records:', err);
      setError('Failed to retrieve faculty records from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (fac = null) => {
    if (fac) {
      setEditingFaculty(fac);
      setFormData({
        name: fac.userId?.name || fac.name || '',
        email: fac.userId?.email || fac.email || '',
        employeeId: fac.employeeId || '',
        designation: fac.designation || '',
        department: fac.department || '',
        qualification: fac.qualification || '',
        institutionId: fac.institutionId?._id || fac.institutionId || '',
        status: fac.status || 'ACTIVE',
      });
    } else {
      setEditingFaculty(null);
      setFormData({
        name: '',
        email: '',
        employeeId: `FAC-${Date.now().toString().slice(-4)}`,
        designation: 'Assistant Professor',
        department: 'Islamic Studies',
        qualification: 'M.A., Ph.D.',
        institutionId: institutions[0]?._id || '',
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
      if (editingFaculty) {
        await updateFaculty(editingFaculty._id, formData);
      } else {
        await createFaculty(formData);
      }
      setFormLoading(false);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setFormLoading(false);
      setFormError(err.response?.data?.message || 'Failed to save faculty record.');
    }
  };

  const filtered = facultyList.filter((f) => {
    const q = search.toLowerCase();
    const name = (f.userId?.name || f.name || '').toLowerCase();
    const email = (f.userId?.email || f.email || '').toLowerCase();
    const emp = (f.employeeId || '').toLowerCase();
    return name.includes(q) || email.includes(q) || emp.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-serif font-bold text-[#132238]">Faculty Directory</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-teal-100 text-teal-800 rounded-full">
              {facultyList.length} Active Members
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Manage academic faculty members, designations, and qualifications</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361]"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Faculty Member
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
            <button onClick={fetchData} className="px-4 py-2 bg-[#2F7C7A] text-white font-bold text-xs rounded-lg uppercase">
              <RefreshCw className="w-4 h-4 mr-2 inline" /> Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-[#132238]">No faculty members found</h3>
            <p className="text-sm text-slate-500">Add faculty members to assign evaluations and subjects.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#E2E8E0]">
                <tr>
                  <th className="px-6 py-4">Faculty Member</th>
                  <th className="px-6 py-4">Emp. ID</th>
                  <th className="px-6 py-4">Designation & Department</th>
                  <th className="px-6 py-4">Qualification</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {filtered.map((fac) => (
                  <tr key={fac._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#132238]">
                      {fac.userId?.name || fac.name || 'N/A'}
                      <p className="text-xs text-slate-400 font-normal">{fac.userId?.email || fac.email}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700">{fac.employeeId}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">{fac.designation || 'Lecturer'}</p>
                      <p className="text-slate-400">{fac.department || 'Islamic Studies'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700">{fac.qualification || '-'}</td>
                    <td className="px-6 py-4"><StatusBadge status={fac.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenModal(fac)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50">
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
              <h3 className="text-lg font-bold text-[#132238]">{editingFaculty ? 'Edit Faculty Profile' : 'Add Faculty Member'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            {formError && <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded">{formError}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {!editingFaculty && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Full Name *</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Dr. Ibrahim" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Email Address *</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="ibrahim@markaz.in" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Emp. ID *</label>
                  <input type="text" required value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Designation</label>
                  <input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} placeholder="Professor" className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Department</label>
                  <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="Islamic Shariah" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Qualification</label>
                  <input type="text" value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} placeholder="Ph.D., Al-Azhar" className="w-full px-3 py-2 border rounded-lg" />
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
                  {formLoading ? 'Saving...' : editingFaculty ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFacultyPage;
