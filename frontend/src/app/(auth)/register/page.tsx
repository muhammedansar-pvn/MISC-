'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Phone, UserCheck, Eye, EyeOff } from 'lucide-react';
import { register } from '@/services/auth.service';
import { UserRole } from '@/types';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    role: 'STUDENT' as UserRole,
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim() || undefined,
        role: formData.role,
        password: formData.password,
      });

      setLoading(false);

      if (response.success) {
        const targetEmail = response.email || formData.email.trim();
        router.push(`/verify-email?email=${encodeURIComponent(targetEmail)}`);
      } else {
        setError(response.message || 'Registration failed.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-[#E2E8E0] shadow-xs">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#2F7C7A]/10 text-[#2F7C7A] mb-1">
          <UserCheck className="w-7 h-7" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#132238] tracking-tight">
          Create an Account
        </h2>
        <p className="text-xs text-[#475569]">
          Join the Markaz Integrated Studies Council (MISC) Portal
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-lg">
          <p className="font-semibold">Registration Error</p>
          <p>{error}</p>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-1">
            Full Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
              <User className="w-4 h-4" />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E2E8E0] bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-1">
            Email Address *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E2E8E0] bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="mobile" className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                autoComplete="tel"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E2E8E0] bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-1">
              Account Type
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8E0] bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all cursor-pointer"
            >
              <option value="STUDENT">Student</option>
              <option value="FACULTY">Faculty</option>
              <option value="INSTITUTION">Institution</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-1">
            Password *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
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
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#E2E8E0] bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-[#132238] cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-1">
            Confirm Password *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E2E8E0] bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2F7C7A] text-white py-3.5 px-4 rounded-xl font-bold hover:bg-[#256361] focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:ring-offset-2 transition-all disabled:opacity-50 text-xs tracking-wider uppercase shadow-xs cursor-pointer"
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </div>
      </form>

      <div className="text-center pt-3 border-t border-[#E2E8E0]">
        <p className="text-sm text-[#64748B]">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#2F7C7A] hover:underline cursor-pointer">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
