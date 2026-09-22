'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, RefreshCw, AlertCircle, Edit3, X } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import { getInstitutions, createInstitution, updateInstitution } from '@/services/institution.service';
import { Institution, InstitutionPayload } from '@/types';

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<Institution | null>(null);
  const [formData, setFormData] = useState<InstitutionPayload>({
    institutionName: '',
    institutionCode: '',
    type: 'DIRECT',
    address: '',
    contactNumber: '',
    email: '',
    status: 'ACTIVE',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchInstitutionsList = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getInstitutions();
      if (res.success && res.data) {
        setInstitutions(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load institutions:', err);
      setError('Unable to load institutions list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutionsList();
  }, []);

  const handleOpenModal = (inst: Institution | null = null) => {
    if (inst) {
      setEditingInst(inst);
      setFormData({
        institutionName: inst.institutionName || '',
        institutionCode: inst.institutionCode || '',
        type: (inst.type as any) || 'DIRECT',
        address: inst.address || '',
        contactNumber: inst.contactNumber || '',
        email: inst.email || '',
        status: (inst.status as any) || 'ACTIVE',
      });
    } else {
      setEditingInst(null);
      setFormData({
        institutionName: '',
        institutionCode: '',
        type: 'DIRECT',
        address: '',
        contactNumber: '',
        email: '',
        status: 'ACTIVE',
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (editingInst) {
        await updateInstitution(editingInst._id, formData);
      } else {
        await createInstitution(formData);
      }
      setFormLoading(false);
      setIsModalOpen(false);
      fetchInstitutionsList();
    } catch (err: any) {
      setFormLoading(false);
      setFormError(err.response?.data?.message || 'Failed to save institution.');
    }
  };

  const filtered = institutions.filter((inst) => {
    const q = search.toLowerCase();
    return (
      inst.institutionName?.toLowerCase().includes(q) ||
      inst.institutionCode?.toLowerCase().includes(q) ||
      inst.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-serif font-bold text-[#132238]">Affiliated Institutions</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
              {institutions.length} Registered
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Manage campuses, centers, and affiliated colleges</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361] transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Institution
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8E0] shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by institution name, code, or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2E8E0] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A]"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading institutions...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              onClick={fetchInstitutionsList}
              className="inline-flex items-center px-4 py-2 bg-[#2F7C7A] text-white font-bold text-xs rounded-lg uppercase cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-[#132238]">No institutions found</h3>
            <p className="text-sm text-slate-500">Add an institution to start managing academic records.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#E2E8E0]">
                <tr>
                  <th className="px-6 py-4">Institution Name</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {filtered.map((inst) => (
                  <tr key={inst._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#132238]">
                      {inst.institutionName}
                      <p className="text-xs text-slate-400 font-normal">{inst.address || 'No address'}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700">{inst.institutionCode}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                        {inst.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <p>{inst.email || 'N/A'}</p>
                      <p className="text-slate-400">{inst.contactNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={inst.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenModal(inst)}
                        className="inline-flex items-center px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1 text-slate-500" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Institution Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-[#E2E8E0] p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#132238]">
                {editingInst ? 'Edit Institution' : 'Add New Institution'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Institution Name *</label>
                <input
                  type="text"
                  required
                  value={formData.institutionName}
                  onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                  placeholder="e.g. Markaz Arts & Science College"
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8E0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.institutionCode}
                    onChange={(e) => setFormData({ ...formData, institutionCode: e.target.value })}
                    placeholder="MASC-01"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8E0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8E0] cursor-pointer"
                  >
                    <option value="DIRECT">DIRECT</option>
                    <option value="AFFILIATED">AFFILIATED</option>
                    <option value="RECOGNIZED">RECOGNIZED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@markaz.in"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8E0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="04951234567"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8E0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Karanthur, Kozhikode, Kerala"
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8E0]"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8E0] cursor-pointer"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-[#2F7C7A] text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  {formLoading ? 'Saving...' : editingInst ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
