import React, { useState } from 'react';
import { X, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { createUserInvitation } from '../../services/adminService';

export const UserFormModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'FACULTY',
    department: '',
    mobile: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);
    setSuccessMessage('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and Email are required.');
      return;
    }

    setLoading(true);

    try {
      const res = await createUserInvitation(formData);
      setLoading(false);
      setSuccessMessage('User invitation sent successfully.');
      setTimeout(() => {
        if (onSuccess) onSuccess(res.data);
        handleClose();
      }, 1500);
    } catch (err) {
      setLoading(false);
      const data = err.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        setFieldErrors(data.errors);
      }
      setError(data?.message || 'Failed to create user invitation. Please check your inputs.');
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      role: 'FACULTY',
      department: '',
      mobile: '',
    });
    setError('');
    setFieldErrors([]);
    setSuccessMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-[#E2E8E0] overflow-hidden transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8E0] bg-[#F7F8F5]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#2F7C7A]/10 text-[#2F7C7A] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#132238]">Register / Invite User</h3>
              <p className="text-xs text-slate-500">Send account setup link via email</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {successMessage ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="text-lg font-bold text-emerald-900">{successMessage}</h4>
              <p className="text-sm text-emerald-700">
                An invitation email with an account setup link has been generated for{' '}
                <span className="font-semibold">{formData.email}</span>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm rounded-r-lg space-y-1">
                  <div className="flex items-center font-bold">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                  {fieldErrors.length > 0 && (
                    <ul className="list-disc pl-6 text-xs space-y-0.5 text-rose-600 mt-1">
                      {fieldErrors.map((errItem, idx) => (
                        <li key={idx}>
                          <span className="font-semibold capitalize">{errItem.field}:</span> {errItem.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Ahmed Hassan"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8E0] bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ahmed.hassan@markaz.in"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8E0] bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-1.5">
                    User Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8E0] bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                  >
                    <option value="FACULTY">Faculty Member</option>
                    <option value="STUDENT">Student</option>
                    <option value="INSTITUTION">Institution Representative</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8E0] bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-1.5">
                  Department / Office
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Islamic Studies & Shariah"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8E0] bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-[#E2E8E0]">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#2F7C7A] text-white rounded-lg font-bold text-sm hover:bg-[#256361] focus:outline-none transition-all disabled:opacity-50 uppercase tracking-wider shadow-sm flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      SENDING INVITATION...
                    </>
                  ) : (
                    'SEND INVITATION'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;
