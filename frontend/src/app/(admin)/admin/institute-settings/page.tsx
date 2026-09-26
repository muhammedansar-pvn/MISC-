'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  BookOpen,
  Calendar,
} from 'lucide-react';
import {
  getInstituteSettings,
  updateInstituteSettings,
  InstituteSettingsData,
} from '@/services/institute-settings.service';
import { getAcademicYears } from '@/services/academic.service';
import { AcademicYear } from '@/types';

export default function AdminInstituteSettingsPage() {
  const [settings, setSettings] = useState<InstituteSettingsData | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<InstituteSettingsData>>({
    name: 'Markaz Sanaviyya',
    code: 'SANAVIYYA',
    tagline: 'Centre for Secondary & Higher Secondary Islamic Education',
    description: '',
    affiliation: 'Jamia Markaz (Markazu Ssaqafathi Ssunniyya)',
    establishedYear: 1978,
    principalName: '',
    contactNumber: '',
    email: '',
    website: '',
    address: {
      street: '',
      city: '',
      district: '',
      state: '',
      country: '',
      postalCode: '',
    },
    academicSettings: {
      currentAcademicYearId: '',
      evaluationSystem: 'TRIMESTER',
      attendanceMode: 'DAILY',
    },
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [settingsRes, yearsRes] = await Promise.all([
        getInstituteSettings().catch(() => ({ success: false, data: null })),
        getAcademicYears().catch(() => ({ success: false, data: [] })),
      ]);

      if (yearsRes && yearsRes.data) {
        setAcademicYears(yearsRes.data);
      }

      if (settingsRes && settingsRes.data) {
        const d = settingsRes.data;
        setSettings(d);
        setFormData({
          name: d.name || 'Markaz Sanaviyya',
          code: d.code || 'SANAVIYYA',
          tagline: d.tagline || '',
          description: d.description || '',
          affiliation: d.affiliation || 'Jamia Markaz',
          establishedYear: d.establishedYear || 1978,
          principalName: d.principalName || '',
          contactNumber: d.contactNumber || '',
          email: d.email || '',
          website: d.website || '',
          address: {
            street: d.address?.street || '',
            city: d.address?.city || '',
            district: d.address?.district || '',
            state: d.address?.state || '',
            country: d.address?.country || '',
            postalCode: d.address?.postalCode || '',
          },
          academicSettings: {
            currentAcademicYearId:
              d.academicSettings?.currentAcademicYearId?._id ||
              d.academicSettings?.currentAcademicYearId ||
              '',
            evaluationSystem: d.academicSettings?.evaluationSystem || 'TRIMESTER',
            attendanceMode: d.academicSettings?.attendanceMode || 'DAILY',
          },
        });
      }
    } catch (err: any) {
      console.error('Failed to load institute settings:', err);
      setError('Unable to load Institute Settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await updateInstituteSettings(formData);
      if (res && res.data) {
        setSettings(res.data);
        setSuccessMessage('Institute settings updated successfully!');
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err: any) {
      console.error('Save settings error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-[#E2E8E0]">
        <div className="w-8 h-8 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Loading Markaz Sanaviyya configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#2F7C7A]/10 border border-[#2F7C7A]/20 flex items-center justify-center text-[#2F7C7A]">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-[#132238]">{formData.name || 'Markaz Sanaviyya'}</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-[#2F7C7A] text-white rounded-full">
                {formData.code || 'SANAVIYYA'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Single-Institute Master Settings & Institutional Identity
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361] transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Core Institutional Identity */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E2E8E0] pb-3">
            <Award className="w-5 h-5 text-[#2F7C7A]" />
            <h2 className="text-base font-bold text-[#132238]">Institutional Identity</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Institute Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Institute Code *</label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border rounded-xl text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Motto / Tagline</label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. Centre for Secondary & Higher Secondary Islamic Education"
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Parent Affiliation</label>
              <input
                type="text"
                value={formData.affiliation || ''}
                onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                placeholder="Jamia Markaz"
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Established Year</label>
              <input
                type="number"
                value={formData.establishedYear || 1978}
                onChange={(e) => setFormData({ ...formData, establishedYear: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Principal / Director Name</label>
              <input
                type="text"
                value={formData.principalName || ''}
                onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                placeholder="Dr. Muhammad Abdul Hakim Azhari"
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Institutional Overview</label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Overview of Markaz Sanaviyya..."
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Academic Architecture Settings */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E2E8E0] pb-3">
            <BookOpen className="w-5 h-5 text-[#2F7C7A]" />
            <h2 className="text-base font-bold text-[#132238]">Academic Setup & Operations</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Default Academic Year</label>
              <select
                value={formData.academicSettings?.currentAcademicYearId || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    academicSettings: {
                      ...formData.academicSettings,
                      currentAcademicYearId: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((ay) => (
                  <option key={ay._id} value={ay._id}>
                    {ay.yearName} ({ay.yearCode}) {ay.isCurrent ? '★ Current' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Evaluation System</label>
              <select
                value={formData.academicSettings?.evaluationSystem || 'TRIMESTER'}
                onChange={(e: any) =>
                  setFormData({
                    ...formData,
                    academicSettings: {
                      ...formData.academicSettings,
                      evaluationSystem: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
              >
                <option value="TRIMESTER">Trimester (3 Terms)</option>
                <option value="SEMESTER">Semester (2 Terms)</option>
                <option value="ANNUAL">Annual Examination</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Attendance Mode</label>
              <select
                value={formData.academicSettings?.attendanceMode || 'DAILY'}
                onChange={(e: any) =>
                  setFormData({
                    ...formData,
                    academicSettings: {
                      ...formData.academicSettings,
                      attendanceMode: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
              >
                <option value="DAILY">Daily (Once per day)</option>
                <option value="SESSION_WISE">Session-wise (Morning/Afternoon)</option>
                <option value="SUBJECT_WISE">Subject/Period-wise</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 3: Contact & Communication */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E2E8E0] pb-3">
            <Mail className="w-5 h-5 text-[#2F7C7A]" />
            <h2 className="text-base font-bold text-[#132238]">Communication & Digital Channels</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Official Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sanaviyya@markaz.in"
                  className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Telephone / Mobile</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={formData.contactNumber || ''}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="+91 495 2800 400"
                  className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Official Website</label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://markaz.in"
                  className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Location & Address */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E2E8E0] pb-3">
            <MapPin className="w-5 h-5 text-[#2F7C7A]" />
            <h2 className="text-base font-bold text-[#132238]">Campus Location</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Street Address</label>
              <input
                type="text"
                value={formData.address?.street || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value },
                  })
                }
                placeholder="Karanthur, Kunnamangalam"
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-slate-700">City / Town</label>
              <input
                type="text"
                value={formData.address?.city || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value },
                  })
                }
                placeholder="Kozhikode"
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-slate-700">District</label>
              <input
                type="text"
                value={formData.address?.district || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, district: e.target.value },
                  })
                }
                placeholder="Kozhikode"
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-slate-700">State</label>
              <input
                type="text"
                value={formData.address?.state || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, state: e.target.value },
                  })
                }
                placeholder="Kerala"
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-slate-700">PIN Code</label>
              <input
                type="text"
                value={formData.address?.postalCode || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, postalCode: e.target.value },
                  })
                }
                placeholder="673571"
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#2F7C7A]"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center px-6 py-3 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361] transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
