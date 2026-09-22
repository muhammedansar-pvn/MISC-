'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { forgotPassword } from '@/services/auth.service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await forgotPassword({ email: email.trim() });
      setLoading(false);
      setSubmitted(true);
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to process request. Please try again.');
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
          Reset Your Password
        </h2>
        <p className="text-sm text-[#475569] mt-2">
          Enter your registered email address and we'll send you a password reset link.
        </p>
      </div>

      {submitted ? (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-bold text-emerald-800">Check Your Email</h3>
          <p className="text-sm text-emerald-700">
            If an account with email <span className="font-semibold">{email}</span> exists, password reset instructions have been sent.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-block w-full bg-[#2F7C7A] text-white py-3 px-4 rounded-xl font-bold hover:bg-[#256361] transition-all text-xs tracking-wider uppercase cursor-pointer text-center"
            >
              RETURN TO SIGN IN
            </Link>
          </div>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-2">
              Registered Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                <Mail className="w-5 h-5" />
              </div>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E2E8E0] bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2F7C7A] text-white py-3.5 px-4 rounded-xl font-bold hover:bg-[#256361] focus:outline-none transition-all disabled:opacity-50 text-xs tracking-wider uppercase shadow-xs cursor-pointer"
          >
            {loading ? 'SENDING LINK...' : 'SEND RESET LINK'}
          </button>
        </form>
      )}
    </div>
  );
}
