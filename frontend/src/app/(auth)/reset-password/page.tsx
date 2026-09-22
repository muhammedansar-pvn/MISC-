'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { resetPassword } from '@/services/auth.service';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tokenFromUrl = searchParams?.get('token') || '';

  const [formData, setFormData] = useState({
    token: tokenFromUrl,
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (tokenFromUrl && !formData.token) {
      setFormData((prev) => ({ ...prev, token: tokenFromUrl }));
    }
  }, [tokenFromUrl, formData.token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        token: formData.token.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      setLoading(false);
      setSuccess(true);
    } catch (err: any) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
          'Failed to reset password. Token may be invalid or expired.'
      );
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-[#E2E8E0] shadow-xs">
      <div>
        <Link
          href="/login"
          className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#2F7C7A] hover:underline mb-6 cursor-pointer"
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
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-4">
          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-bold text-emerald-800">Password Reset Successful</h3>
          <p className="text-sm text-emerald-700">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full bg-[#2F7C7A] text-white py-3.5 px-4 rounded-xl font-bold hover:bg-[#256361] transition-all text-xs tracking-wider uppercase cursor-pointer"
          >
            PROCEED TO LOGIN
          </button>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-lg">
              <p className="font-semibold">Reset Failed</p>
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {!tokenFromUrl && (
              <div>
                <label
                  htmlFor="token"
                  className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-2"
                >
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
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8E0] bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#E2E8E0] bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] hover:text-[#132238] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-2"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#E2E8E0] bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] hover:text-[#132238] cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2F7C7A] text-white py-3.5 px-4 rounded-xl font-bold hover:bg-[#256361] focus:outline-none transition-all disabled:opacity-50 text-xs tracking-wider uppercase shadow-xs cursor-pointer"
          >
            {loading ? 'RESETTING PASSWORD...' : 'RESET PASSWORD'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md w-full bg-white p-12 rounded-2xl border border-[#E2E8E0] text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Loading password reset portal...</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
