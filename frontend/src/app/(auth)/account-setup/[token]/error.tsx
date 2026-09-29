'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function AccountSetupError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-[#E2E8E0] shadow-xs text-center">
      <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold font-serif text-[#132238]">
          Invalid or Expired Link
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          This link is invalid or has expired. If you need a new password setup invitation, please contact your institution administration or request a new link.
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <Link
          href="/login"
          className="block w-full bg-[#2F7C7A] text-white py-3.5 px-4 rounded-xl font-bold hover:bg-[#256361] transition-all text-xs tracking-wider uppercase text-center"
        >
          RETURN TO LOGIN
        </Link>
        <button
          type="button"
          onClick={() => reset()}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
