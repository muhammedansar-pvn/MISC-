import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { resetPassword } from '../services/authService';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [formData, setFormData] = useState({
    token: token,
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await resetPassword({
        token: formData.token,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      setLoading(false);
      setSuccess(true);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to reset password. Token may be invalid or expired.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl border border-[#E2E8E0] shadow-sm">
        <div>
          <Link
            to="/login"
            className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#2F7C7A] hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sign In
          </Link>
          <h2 className="font-serif text-3xl font-bold text-[#132238] tracking-tight">
            Set New Password
          </h2>
          <p className="text-sm text-[#475569] mt-2">
            Please enter your reset token and your new password below.
          </p>
        </div>

        {success ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-emerald-800">Password Reset Successful</h3>
            <p className="text-sm text-emerald-700">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-[#2F7C7A] text-white py-3 px-4 rounded font-bold hover:bg-[#256361] transition-all text-sm tracking-wider uppercase"
            >
              PROCEED TO LOGIN
            </button>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
                <p className="font-semibold">Reset Failed</p>
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {!token && (
                <div>
                  <label htmlFor="token" className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-2">
                    Reset Token
                  </label>
                  <input
                    id="token"
                    name="token"
                    type="text"
                    required
                    value={formData.token}
                    onChange={handleChange}
                    placeholder="Enter reset token from email"
                    className="w-full px-4 py-3 rounded border border-[#E2E8E0] bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                  />
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 rounded border border-[#E2E8E0] bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-[#132238]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 rounded border border-[#E2E8E0] bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-[#132238]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2F7C7A] text-white py-3.5 px-4 rounded font-bold hover:bg-[#256361] focus:outline-none transition-all disabled:opacity-50 text-sm tracking-wider uppercase shadow-sm"
            >
              {loading ? 'RESETTING PASSWORD...' : 'RESET PASSWORD'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
