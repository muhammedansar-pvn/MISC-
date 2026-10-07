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
  ShieldCheck,
  Search,
  ArrowLeft,
  FileText,
} from 'lucide-react';

export default function ParentPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        setLoading(true);
        const res = await getPayments();
        if (res.success && Array.isArray(res.data)) {
          setPayments(res.data);
        }
      } catch (err) {
        console.error('Failed to load parent payments:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPayments();
  }, []);

  const filteredPayments = payments.filter((p) => {
    const q = searchQuery.toLowerCase();
    const student = p.studentId as any;
    const exam = (p.examRegistrationId as any)?.examId as any;

    const matchesSearch =
      !searchQuery ||
      p.transactionId?.toLowerCase().includes(q) ||
      student?.nameEnglish?.toLowerCase().includes(q) ||
      exam?.title?.toLowerCase().includes(q) ||
      p.gateway?.toLowerCase().includes(q);

    const matchesStatus = !statusFilter || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPaid = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const successfulCount = payments.filter((p) => p.status === 'SUCCESS').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-slate-200/70 animate-pulse rounded-lg" />
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
            <Link href="/parent" className="hover:text-[#23804A] transition-colors">
              Parent Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Payment Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#171D19]">
            Guardian Payment Ledger
          </h1>
        </div>

        <Link
          href="/parent"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#23804A] px-3.5 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E3EAE5] shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Verified Fees
          </span>
          <p className="text-2xl font-bold font-serif text-[#171D19]">₹{totalPaid.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-700 font-medium">Successfully settled payments</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E3EAE5] shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Completed Transactions
          </span>
          <p className="text-2xl font-bold font-serif text-[#171D19]">{successfulCount}</p>
          <p className="text-[11px] text-slate-400">Total receipts issued</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E3EAE5] shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Recorded
          </span>
          <p className="text-2xl font-bold font-serif text-[#171D19]">{payments.length}</p>
          <p className="text-[11px] text-slate-400">All gateway attempts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E3EAE5] shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Txn ID, student, exam..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-[#23804A] focus:ring-1 focus:ring-[#23804A]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-[#23804A]"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      {filteredPayments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E3EAE5] space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No payment records found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No transactions match the selected filters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E3EAE5] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-[#E3EAE5] font-semibold">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Examination</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Gateway</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => {
                  const student = p.studentId as any;
                  const exam = (p.examRegistrationId as any)?.examId as any;
                  const isSuccess = p.status === 'SUCCESS';
                  const isPending = p.status === 'PENDING' || p.status === 'INITIATED';

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {p.transactionId}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {student?.nameEnglish || 'Linked Ward'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {exam?.title || (p.paymentType === 'EXAM_FEE' ? 'Board Exam Fee' : p.paymentType)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{p.amount?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {isSuccess ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Success
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 mr-1" /> Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <XCircle className="w-3 h-3 mr-1" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {p.gateway || 'ONLINE'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {p.paidAt
                          ? new Date(p.paidAt).toLocaleDateString('en-GB')
                          : new Date(p.createdAt).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
