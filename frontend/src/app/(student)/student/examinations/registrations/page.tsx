'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getExamRegistrations, getExamSchedules, checkExamFeePayment } from '@/services/exam.service';
import { createPaymentOrder, verifyPayment } from '@/services/payment.service';
import { getStudentProfile } from '@/services/student.service';
import { ExamRegistration, ExamSchedule, StudentProfile } from '@/types';
import {
  FileCheck,
  Printer,
  Calendar,
  Building2,
  User,
  ShieldCheck,
  X,
  Clock,
  ArrowLeft,
  AlertCircle,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  Lock,
  ClipboardList,
} from 'lucide-react';

export default function StudentRegistrationsPage() {
  const [registrations, setRegistrations] = useState<ExamRegistration[]>([]);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [selectedHallTicket, setSelectedHallTicket] = useState<ExamRegistration | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkingPaymentId, setCheckingPaymentId] = useState<string | null>(null);
  const [payingRegistrationId, setPayingRegistrationId] = useState<string | null>(null);
  const [paymentFeedback, setPaymentFeedback] = useState<{ id: string; message: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    async function loadRegistrations() {
      try {
        setLoading(true);
        const [regRes, schedRes, profRes] = await Promise.allSettled([
          getExamRegistrations(),
          getExamSchedules(),
          getStudentProfile(),
        ]);

        if (regRes.status === 'fulfilled' && regRes.value.success && Array.isArray(regRes.value.data)) {
          setRegistrations(regRes.value.data);
        }

        if (schedRes.status === 'fulfilled' && schedRes.value.success && Array.isArray(schedRes.value.data)) {
          setSchedules(schedRes.value.data);
        }

        if (profRes.status === 'fulfilled' && profRes.value.success && profRes.value.data) {
          setProfile(profRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load exam registrations:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRegistrations();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCheckPayment = async (regId: string) => {
    try {
      setCheckingPaymentId(regId);
      setPaymentFeedback(null);
      const res = await checkExamFeePayment(regId);
      if (res.success && res.data) {
        const { isPaid, status, registration, message } = res.data;
        const paymentData = res.data?.payment;
        setRegistrations((prev) =>
          prev.map((r) =>
            r._id === regId
              ? {
                  ...r,
                  registrationStatus: registration?.registrationStatus || r.registrationStatus,
                  paymentId: registration?.paymentId || paymentData || r.paymentId,
                }
              : r
          )
        );
        if (selectedHallTicket && selectedHallTicket._id === regId) {
          setSelectedHallTicket((prev) =>
            prev
              ? {
                  ...prev,
                  registrationStatus: registration?.registrationStatus || prev.registrationStatus,
                  paymentId: registration?.paymentId || paymentData || prev.paymentId,
                }
              : null
          );
        }
        setPaymentFeedback({
          id: regId,
          message: message || (isPaid ? 'Exam fee verified successfully! Hall Ticket issued.' : `Fee Status: ${status}`),
          type: isPaid ? 'success' : 'info',
        });
      } else {
        setPaymentFeedback({
          id: regId,
          message: res.message || 'Unable to check fee status at this time.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setPaymentFeedback({
        id: regId,
        message: err.response?.data?.message || err.message || 'Payment status check failed.',
        type: 'error',
      });
    } finally {
      setCheckingPaymentId(null);
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiatePayment = async (reg: ExamRegistration) => {
    try {
      setPayingRegistrationId(reg._id);
      setPaymentFeedback(null);

      // 1. Request secure payment order from backend
      const res = await createPaymentOrder(reg._id);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to create payment order');
      }

      const order = res.data;

      // Handle 0-fee free examination auto-clear
      if (order.freeExam) {
        setPaymentFeedback({
          id: reg._id,
          message: 'Exam fee is ₹0. Registration confirmed and Admit Card issued!',
          type: 'success',
        });
        await handleCheckPayment(reg._id);
        return;
      }

      // 2. Load Gateway SDK dynamically
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Payment gateway SDK could not be loaded. Please verify your connection.');
      }

      // 3. Launch Checkout Modal
      const options = {
        key: order.keyId,
        amount: order.amountInPaise,
        currency: order.currency || 'INR',
        name: order.institutionName || 'Markaz Sanaviyya',
        description: `${order.examTitle} Fee Payment`,
        order_id: order.orderId,
        prefill: {
          name: order.studentName || profile?.nameEnglish || '',
          email: (profile?.userId as any)?.email || '',
        },
        notes: {
          examRegistrationId: reg._id,
          rollNumber: order.rollNumber,
        },
        theme: {
          color: '#23804A',
        },
        handler: async function (response: any) {
          try {
            setPayingRegistrationId(reg._id);
            // 4. Verify payment cryptographically with backend
            const verifyRes = await verifyPayment({
              transactionId: order.transactionId,
              razorpayOrderId: response.razorpay_order_id || order.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              gateway: 'RAZORPAY',
            });

            if (verifyRes.success) {
              setPaymentFeedback({
                id: reg._id,
                message: 'Payment verified successfully! Hall Ticket has been issued.',
                type: 'success',
              });
              await handleCheckPayment(reg._id);
            } else {
              setPaymentFeedback({
                id: reg._id,
                message: verifyRes.message || 'Payment verification failed.',
                type: 'error',
              });
            }
          } catch (vErr: any) {
            setPaymentFeedback({
              id: reg._id,
              message: vErr.response?.data?.message || vErr.message || 'Payment verification failed.',
              type: 'error',
            });
          } finally {
            setPayingRegistrationId(null);
          }
        },
        modal: {
          ondismiss: function () {
            setPayingRegistrationId(null);
            setPaymentFeedback({
              id: reg._id,
              message: 'Checkout window closed. You can retry payment at any time.',
              type: 'info',
            });
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setPaymentFeedback({
          id: reg._id,
          message: resp.error?.description || 'Payment was declined by your bank.',
          type: 'error',
        });
        setPayingRegistrationId(null);
      });
      rzp.open();
    } catch (err: any) {
      setPaymentFeedback({
        id: reg._id,
        message: err.response?.data?.message || err.message || 'Failed to initiate payment.',
        type: 'error',
      });
      setPayingRegistrationId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200/70 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const institution = (profile?.institutionId as any);
  const enrolledClass = (profile?.classId as any);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/student" className="hover:text-[#23804A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/student/examinations" className="hover:text-[#23804A] transition-colors">
              Examinations
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Registrations & Hall Tickets</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#171D19]">
            Exam Registrations & Hall Tickets
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/student/examinations/registration"
            className="inline-flex items-center text-xs font-semibold text-white px-3.5 py-2 rounded-lg bg-[#23804A] hover:bg-[#1B6F41] shadow-2xs transition-all"
          >
            <ClipboardList className="w-3.5 h-3.5 mr-1.5" /> Register for Exam
          </Link>
          <Link
            href="/student/examinations"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#23804A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Timetable
          </Link>
        </div>
      </div>

      {/* Info Notice regarding registration workflow */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start space-x-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-[#23804A] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-900">Institutional Candidate Verification</p>
          <p className="text-slate-500 mt-0.5 leading-relaxed">
            Examination registration and roll number allocation are officially processed by your institution and verified by the council. When your registration is approved and marked as <span className="font-semibold text-emerald-700">HALL_TICKET_ISSUED</span>, you may preview and print your official Admit Card below.
          </p>
        </div>
      </div>

      {/* Registrations List */}
      {registrations.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E3EAE5] space-y-3">
          <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No active exam registrations</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You do not currently have any registered examinations on record. Please contact your institution administrator if you believe this is an error.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => {
            const exam = (reg.examId as any);
            const payment = (reg.paymentId as any);
            const isIssued = reg.registrationStatus === 'HALL_TICKET_ISSUED';
            const isCancelled = reg.registrationStatus === 'CANCELLED';
            const isPaid = payment?.status === 'SUCCESS' || (isIssued && payment);
            const isPendingPayment = payment?.status === 'PENDING';
            const isChecking = checkingPaymentId === reg._id;

            return (
              <div
                key={reg._id}
                className="bg-white rounded-xl border border-[#E3EAE5] p-6 shadow-2xs hover:border-[#23804A] transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {exam?.examCode || 'EXAM'}
                      </span>
                      <h2 className="text-base font-bold text-[#171D19]">{exam?.title || 'Examination Term'}</h2>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isIssued
                            ? 'bg-emerald-100 text-emerald-800'
                            : isCancelled
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {reg.registrationStatus || 'REGISTERED'}
                      </span>

                      {/* Fee Payment Badge */}
                      {isPaid ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Fee Paid {payment?.amount ? `(₹${payment.amount})` : ''}
                        </span>
                      ) : isPendingPayment ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Payment Pending
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-500" />
                          Fee Unpaid
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <div className="flex items-center space-x-1 font-mono">
                        <span className="text-slate-400">Roll Number:</span>
                        <span className="font-bold text-slate-800">{reg.rollNumber || 'Under Generation'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Registered On:</span>{' '}
                        <span className="text-slate-700 font-medium">
                          {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('en-GB') : 'Verified'}
                        </span>
                      </div>
                      {payment?.transactionId && (
                        <div className="flex items-center space-x-1 font-mono">
                          <span className="text-slate-400">Txn ID:</span>
                          <span className="text-slate-700 font-medium">{payment.transactionId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-start md:self-auto shrink-0 flex-wrap gap-y-2">
                    {!isPaid && !isCancelled && (
                      <button
                        onClick={() => handleInitiatePayment(reg)}
                        disabled={payingRegistrationId === reg._id || isChecking}
                        className="inline-flex items-center px-4 py-2.5 rounded-lg bg-[#23804A] hover:bg-[#1B6F41] text-white text-xs font-semibold shadow-2xs transition-all disabled:opacity-60 cursor-pointer"
                        title="Proceed to secure Razorpay checkout"
                      >
                        <CreditCard
                          className={`w-3.5 h-3.5 mr-1.5 ${
                            payingRegistrationId === reg._id ? 'animate-pulse' : ''
                          }`}
                        />
                        {payingRegistrationId === reg._id
                          ? 'Connecting Gateway...'
                          : `Pay Exam Fee ₹${exam?.fee ?? 500}`}
                      </button>
                    )}

                    <button
                      onClick={() => handleCheckPayment(reg._id)}
                      disabled={isChecking || payingRegistrationId === reg._id}
                      className="inline-flex items-center px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all disabled:opacity-60"
                      title="Verify and check fee payment status"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 mr-1.5 ${
                          isChecking ? 'animate-spin text-[#23804A]' : 'text-slate-400'
                        }`}
                      />
                      {isChecking ? 'Checking...' : 'Check Payment Status'}
                    </button>

                    {isIssued ? (
                      <button
                        onClick={() => setSelectedHallTicket(reg)}
                        className="inline-flex items-center px-4 py-2.5 rounded-lg bg-[#23804A] hover:bg-[#1B6F41] text-white text-xs font-semibold shadow-2xs transition-all"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1.5" /> View / Print Hall Ticket
                      </button>
                    ) : !isPaid ? null : (
                      <span className="text-xs text-slate-400 italic bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                        Admit Card in preparation
                      </span>
                    )}
                  </div>
                </div>

                {/* Inline payment check notification / alert */}
                {paymentFeedback?.id === reg._id && (
                  <div
                    className={`p-3 rounded-lg text-xs flex items-center space-x-2 animate-in fade-in duration-150 ${
                      paymentFeedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : paymentFeedback.type === 'error'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-sky-50 text-sky-800 border border-sky-200'
                    }`}
                  >
                    {paymentFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{paymentFeedback.message}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Hall Ticket Printable Modal */}
      {selectedHallTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Actions Bar (hidden when printing) */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">Official Examination Hall Ticket</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Admit Card
                </button>
                <button
                  onClick={() => setSelectedHallTicket(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 sm:p-10 space-y-6 text-slate-900 bg-white" id="printable-hall-ticket">
              {/* Council Header */}
              <div className="text-center border-b-2 border-[#171D19] pb-6 space-y-1">
                <div className="font-bold uppercase tracking-widest text-xs text-[#23804A]">
                  Markaz Sanaviyya
                </div>
                <h2 className="text-2xl font-serif font-bold text-[#171D19]">
                  EXAMINATION ADMIT CARD / HALL TICKET
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  {(selectedHallTicket.examId as any)?.title || 'Examination Session'}
                </p>
              </div>

              {/* Student Candidate Identification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400">Candidate Name:</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {profile?.nameEnglish || 'Student Candidate'}
                  </p>
                  {profile?.nameArabic && (
                    <p className="font-arabic text-emerald-800 text-sm" dir="rtl">
                      {profile.nameArabic}
                    </p>
                  )}
                </div>
                <div>
                  <span className="text-slate-400">Official Roll Number:</span>
                  <p className="font-mono font-bold text-lg text-[#171D19] mt-0.5">
                    {selectedHallTicket.rollNumber}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Registration Number:</span>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">
                    {profile?.registrationNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Class:</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {enrolledClass?.name || enrolledClass?.code || enrolledClass?.className || 'Sanaviyya Standard'}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400">Institution:</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    Markaz Sanaviyya (SANAVIYYA)
                  </p>
                </div>
              </div>

              {/* Fee Clearance & Verification */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950">Exam Fee Clearance: </span>
                    <span className="font-semibold text-emerald-800">
                      {(selectedHallTicket.paymentId as any)?.status === 'SUCCESS' ||
                      selectedHallTicket.registrationStatus === 'HALL_TICKET_ISSUED'
                        ? 'PAID & VERIFIED'
                        : 'PENDING'}
                    </span>
                    {(selectedHallTicket.paymentId as any)?.amount && (
                      <span className="ml-1 text-emerald-700 font-mono">
                        (₹{(selectedHallTicket.paymentId as any).amount})
                      </span>
                    )}
                  </div>
                </div>
                {(selectedHallTicket.paymentId as any)?.transactionId && (
                  <div className="text-[11px] font-mono text-emerald-800">
                    Ref ID: {(selectedHallTicket.paymentId as any).transactionId}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="space-y-2 text-[11px] text-slate-600 border-t border-slate-200 pt-4">
                <p className="font-bold uppercase tracking-wider text-slate-800">
                  Important Examination Instructions:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-500">
                  <li>Candidates must present this Admit Card along with their official student identification.</li>
                  <li>Report to the examination hall at least 15 minutes before the scheduled start time.</li>
                  <li>Electronic devices, smartwatches, and unauthorized materials are strictly prohibited.</li>
                  <li>Maintain silence and adhere to the supervisor's instructions at all times.</li>
                </ul>
              </div>

              {/* Signatures */}
              <div className="pt-8 flex items-center justify-between text-xs text-slate-500 border-t border-dashed border-slate-300">
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  <span>Candidate Signature</span>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  <span>Controller of Examinations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
