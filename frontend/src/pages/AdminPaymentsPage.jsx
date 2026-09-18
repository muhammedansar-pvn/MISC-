import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, Search, Filter, RefreshCw, AlertCircle, Eye, CheckCircle, X } from 'lucide-react';
import StatusBadge from '../components/admin/StatusBadge';
import { getPayments } from '../services/paymentService';

export const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);

  const fetchPaymentRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.paymentType = typeFilter;

      const res = await getPayments(params);
      if (res.success) {
        setPayments(res.data || []);
      }
    } catch (err) {
      console.error('Failed to retrieve payment records:', err);
      setError('Unable to load payment audit records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentRecords();
  }, [statusFilter, typeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-serif font-bold text-[#132238]">Payment & Financial Ledger</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
              {payments.length} Transactions
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Audit fee payments, event registration fees, and transaction verification logs</p>
        </div>
      </div>

      {/* Payment Security Audit Notice Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start space-x-3.5 shadow-xs">
        <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-emerald-900">
          <p className="font-bold text-sm">Server-Side Payment Security Enforced</p>
          <p className="leading-relaxed text-emerald-800">
            Client-submitted status claims are strictly un-trusted. Real gateway <span className="font-bold">SUCCESS</span> transitions are executed only via server-verified gateway webhooks or direct backend signature verification. Unverified client claims remain flagged.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8E0] shadow-xs flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E2E8E0] text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#2F7C7A]"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E2E8E0] text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#2F7C7A]"
          >
            <option value="">All Payment Types</option>
            <option value="EXAM_FEE">EXAM FEE</option>
            <option value="EVENT_REGISTRATION">EVENT REGISTRATION</option>
            <option value="INSTITUTION_FEE">INSTITUTION FEE</option>
          </select>
        </div>

        {(statusFilter || typeFilter) && (
          <button
            onClick={() => { setStatusFilter(''); setTypeFilter(''); }}
            className="text-xs font-bold text-[#2F7C7A] hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading payment ledger...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button onClick={fetchPaymentRecords} className="px-4 py-2 bg-[#2F7C7A] text-white font-bold text-xs rounded-lg uppercase">
              <RefreshCw className="w-4 h-4 mr-2 inline" /> Retry
            </button>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-[#132238]">No transactions found</h3>
            <p className="text-sm text-slate-500">No payment transactions match the filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#E2E8E0]">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Payer / User</th>
                  <th className="px-6 py-4">Payment Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Gateway</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {payments.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#132238]">{tx.transactionId}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{tx.userId?.name || 'Anonymous / Student'}</p>
                      <p className="text-xs text-slate-400">{tx.userId?.email || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-full border">
                        {tx.paymentType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#132238]">
                      ₹{tx.amount} <span className="text-xs text-slate-400 font-normal">{tx.currency || 'INR'}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{tx.gateway}</td>
                    <td className="px-6 py-4"><StatusBadge status={tx.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="w-3.5 h-3.5 inline mr-1" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#132238]">Transaction Details</h3>
              <button onClick={() => setSelectedTx(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-900">{selectedTx.transactionId}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-slate-500">Payer Name:</span>
                <span className="font-bold text-slate-900">{selectedTx.userId?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-slate-500">Payment Type:</span>
                <span className="font-bold text-slate-900">{selectedTx.paymentType}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-700 text-sm">₹{selectedTx.amount} {selectedTx.currency}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-slate-500">Payment Gateway:</span>
                <span className="font-mono font-bold text-slate-900">{selectedTx.gateway}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-slate-500">Verification Status:</span>
                <StatusBadge status={selectedTx.status} />
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-slate-500">Created Date:</span>
                <span>{new Date(selectedTx.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setSelectedTx(null)} className="px-4 py-2 bg-slate-100 font-bold text-xs rounded-lg text-slate-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
