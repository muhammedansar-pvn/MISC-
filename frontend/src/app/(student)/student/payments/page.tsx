'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPayments } from '@/services/payment.service';
import { PaymentRecord } from '@/types';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  DollarSign,
  ArrowDownRight,
  ShieldCheck,
  Search,
} from 'lucide-react';

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        setLoading(true);
        const res = await getPayments();
        if (res.success && Array.isArray(res.data)) {
          setPayments(res.data);
        }
      } catch (err) {
        console.error('Failed to load student payments:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPayments();
  }, []);

  const filteredPayments = payments.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      p.transactionId?.toLowerCase().includes(q) ||
      p.paymentType?.toLowerCase().includes(q) ||
      p.status?.toLowerCase().includes(q) ||
      p.paymentMethod?.toLowerCase().includes(q)
    );
  });

  const totalPaid = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const successfulCount = payments.filter((p) => p.status === 'SUCCESS').length;


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200/70 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200/70 animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/student" className="hover:text-[#2F7C7A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Payments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Fee & Payment History
          </h1>
        </div>

        <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-lg border border-emerald-200 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">Secure Payment Records</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Amount Settled
          </span>
          <p className="text-2xl font-bold font-mono text-[#132238]">
            ₹{totalPaid.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-400">Verified transaction receipts</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Cleared Transactions
          </span>
          <p className="text-2xl font-bold text-emerald-700">{successfulCount}</p>
          <p className="text-xs text-slate-400">Successfully processed payments</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Records
          </span>
          <p className="text-2xl font-bold text-[#2F7C7A]">{payments.length}</p>
          <p className="text-xs text-slate-400">All registered ledger entries</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter by transaction ID, fee type, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#2F7C7A]"
        />
      </div>

      {/* Transactions Table */}
      {filteredPayments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E2E8E0] space-y-3">
          <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No payment records found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are no recorded fee payments or receipts matching your query.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8E0] shadow-2xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8E0] text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Payment Purpose</th>
                <th className="p-4">Method</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((pay) => {
                const isSuccess = pay.status === 'SUCCESS';
                const isFailed = pay.status === 'FAILED';


                return (
                  <tr key={pay._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {pay.transactionId}
                    </td>
                    <td className="p-4 font-medium text-slate-800">
                      {pay.paymentType || (pay as any).purpose || 'Institutional Fee'}
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-[11px]">
                      {pay.paymentMethod || 'Online'}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#132238] text-sm">
                      ₹{pay.amount?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isSuccess
                            ? 'bg-emerald-100 text-emerald-800'
                            : isFailed
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isSuccess ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : isFailed ? (
                          <XCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {pay.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono">
                      {pay.createdAt
                        ? new Date(pay.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Verified'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
