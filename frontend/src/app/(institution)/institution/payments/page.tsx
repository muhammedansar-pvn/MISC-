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
  ShieldCheck,
  Search,
  Receipt,
  Download,
  Printer,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function InstitutionPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await getPayments();
      if (res.success && Array.isArray(res.data)) {
        setPayments(res.data);
      }
    } catch (err) {
      console.error('Failed to load institutional payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      p.transactionId?.toLowerCase().includes(q) ||
      p.paymentType?.toLowerCase().includes(q) ||
      p.paymentMethod?.toLowerCase().includes(q) ||
      p.notes?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'ALL' || p.status?.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const totalPaid = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const successfulCount = payments.filter((p) => p.status === 'SUCCESS').length;
  const pendingCount = payments.filter((p) => p.status === 'PENDING').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-60 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200/70 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-200/70 animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/institution/dashboard" className="hover:text-[#2F7C7A] transition-colors">
              Institution
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Payments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Financial Ledger & Payments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Institutional fee remittances, candidate exam payments, and transaction history.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchPayments}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Ledger</span>
          </button>
          <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-lg border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Audited Ledger</span>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Settled
          </span>
          <p className="text-2xl font-bold font-mono text-[#132238]">
            ₹{totalPaid.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-400">Total verified clearances</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Successful Records
          </span>
          <p className="text-2xl font-bold text-emerald-700">{successfulCount}</p>
          <p className="text-xs text-slate-400">Processed institutional transactions</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending Clearance
          </span>
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-xs text-slate-400">Awaiting gateway confirmation</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Ledger Entries
          </span>
          <p className="text-2xl font-bold text-[#2F7C7A]">{payments.length}</p>
          <p className="text-xs text-slate-400">Historical payment logs</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Transaction ID, Purpose, Notes, or Method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#2F7C7A]"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['ALL', 'SUCCESS', 'PENDING', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                statusFilter === st
                  ? 'bg-[#132238] text-white border-[#132238]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'All Records' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      {filteredPayments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E2E8E0] space-y-3">
          <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No payment records found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are no institutional fee entries matching your current filters.
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
                <th className="p-4 text-right">Receipt</th>
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
                      {pay.paymentType || (pay as any).purpose || 'Institutional Remittance'}
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-[11px]">
                      {pay.paymentMethod || 'Online Gateway'}
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
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedPayment(pay)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-[#2F7C7A] bg-[#2F7C7A]/10 hover:bg-[#2F7C7A]/20 rounded-md transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Voucher</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Receipt / Voucher Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#132238] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-[#2F7C7A]" />
                <h3 className="font-bold text-sm">Institutional Payment Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Receipt Voucher */}
            <div className="p-6 space-y-6">
              <div className="border-b border-dashed border-slate-200 pb-4 text-center">
                <p className="text-xs uppercase tracking-wider font-bold text-[#2F7C7A]">
                  Official Remittance Voucher
                </p>
                <h4 className="text-2xl font-bold font-mono text-slate-900 mt-1">
                  ₹{selectedPayment.amount?.toLocaleString('en-IN') || '0'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Status:{' '}
                  <span
                    className={`font-bold ${
                      selectedPayment.status === 'SUCCESS'
                        ? 'text-emerald-600'
                        : selectedPayment.status === 'FAILED'
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {selectedPayment.status}
                  </span>
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Transaction ID</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedPayment.transactionId}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Purpose / Type</span>
                  <span className="font-medium text-slate-800">
                    {selectedPayment.paymentType || (selectedPayment as any).purpose || 'General Fee'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Payment Channel</span>
                  <span className="font-medium text-slate-800">
                    {selectedPayment.paymentMethod || 'Online Payment Gateway'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Date & Timestamp</span>
                  <span className="font-mono text-slate-800">
                    {selectedPayment.createdAt
                      ? new Date(selectedPayment.createdAt).toLocaleString('en-IN')
                      : 'N/A'}
                  </span>
                </div>
                {selectedPayment.notes && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Remarks / Notes</span>
                    <span className="font-medium text-slate-800 max-w-[240px] text-right">
                      {selectedPayment.notes}
                    </span>
                  </div>
                )}
                {selectedPayment._id && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Internal Reference</span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {selectedPayment._id}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  This voucher confirms institutional ledger entry recorded in the MISC central system. For billing disputes or reconciliation queries, refer to the transaction ID shown above.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPayment(null)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#132238] rounded-xl hover:bg-[#132238]/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
