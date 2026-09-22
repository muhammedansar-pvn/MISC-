'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserCheck, Lock, Eye, EyeOff, CheckCircle, AlertTriangle, User } from 'lucide-react';
import { verifyAccountSetupToken, accountSetup } from '@/services/auth.service';

interface AccountSetupPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function AccountSetupPage({ params }: AccountSetupPageProps) {
  const resolvedParams = use(params);
  const token = resolvedParams?.token || '';
  const router = useRouter();

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenError('Setup token is missing');
        setVerifying(false);
        return;
      }

      try {
        const res: any = await verifyAccountSetupToken(token);
        if (res.success || res.valid) {
          setTokenValid(true);
          const userData = res.user || res.data?.user || {};
          setUserInfo(userData);
          setFormData((prev) => ({
            ...prev,
            username: userData.username || userData.email || '',
          }));
        } else {
          setTokenError(res.message || 'Invitation token is invalid or expired');
        }
      } catch (err: any) {
        setTokenError(err.response?.data?.message || 'Invalid or expired invitation token');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username) {
      setError('Please provide a username.');
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
      await accountSetup({
        token,
        username: formData.username.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      setLoading(false);
      setSuccess(true);
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to complete account setup.');
    }
  };

  if (verifying) {
    return (
      <div className="max-w-md w-full bg-white p-12 rounded-2xl border border-[#E2E8E0] text-center space-y-4 shadow-xs">
        <div className="w-10 h-10 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-[#132238]">Verifying invitation token...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-[#E2E8E0] shadow-xs">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2F7C7A]/10 text-[#2F7C7A] mb-2">
          <UserCheck className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#132238] tracking-tight">
          Account Setup
        </h2>
        <p className="text-sm text-[#475569]">
          Complete your MISC Portal user registration
        </p>
      </div>

      {!tokenValid ? (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto" />
          <h3 className="text-lg font-bold text-amber-800">Invalid Invitation Link</h3>
          <p className="text-sm text-amber-700">
            {tokenError || 'This setup token is invalid, expired, or has already been used.'}
          </p>
          <Link
            href="/login"
            className="inline-block w-full bg-[#2F7C7A] text-white py-3 px-4 rounded-xl font-bold hover:bg-[#256361] transition-all text-xs tracking-wider uppercase text-center cursor-pointer"
          >
            RETURN TO LOGIN
          </Link>
        </div>
      ) : success ? (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-4">
          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-bold text-emerald-800">Setup Complete</h3>
          <p className="text-sm text-emerald-700">
            Your account has been set up successfully. You can now sign in using your credentials.
          </p>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full bg-[#2F7C7A] text-white py-3.5 px-4 rounded-xl font-bold hover:bg-[#256361] transition-all text-xs tracking-wider uppercase cursor-pointer"
          >
            GO TO LOGIN
          </button>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          {userInfo?.email && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
              Setting up account for: <span className="font-bold text-slate-800">{userInfo.email}</span> ({userInfo.role || 'USER'})
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-lg">
              <p className="font-semibold">Setup Error</p>
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-2">
                Username *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="choose_username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E2E8E0] bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-2">
                Create Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <Lock className="w-4 h-4" />
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
              <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <Lock className="w-4 h-4" />
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
            {loading ? 'ACTIVATING ACCOUNT...' : 'COMPLETE ACCOUNT SETUP'}
          </button>
        </form>
      )}
    </div>
  );
}
