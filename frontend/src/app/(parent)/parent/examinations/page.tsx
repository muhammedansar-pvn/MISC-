'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getParentStudents, ParentStudent } from '@/services/parent.service';
import { getExamRegistrations, checkExamFeePayment } from '@/services/exam.service';
import { createPaymentOrder, verifyPayment } from '@/services/payment.service';
import { ExamRegistration } from '@/types';
import {
  FileCheck,
  Printer,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  ShieldCheck,
  X,
  ArrowLeft,
} from 'lucide-react';

function ParentExaminationsContent() {
  const searchParams = useSearchParams();
  const preselectedStudentId = searchParams?.get('studentId') || '';

  const [students, setStudents] = useState<ParentStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [registrations, setRegistrations] = useState<ExamRegistration[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [selectedHallTicket, setSelectedHallTicket] = useState<ExamRegistration | null>(null);

  const [checkingPaymentId, setCheckingPaymentId] = useState<string | null>(null);
  const [payingRegistrationId, setPayingRegistrationId] = useState<string | null>(null);
  const [paymentFeedback, setPaymentFeedback] = useState<{ id: string; message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Load parent's linked students
  useEffect(() => {
    async function loadStudents() {
      try {
        setLoadingStudents(true);
        const res = await getParentStudents();
        const list = res.data?.students || (res as any).students;
        if (res.success && Array.isArray(list)) {
          setStudents(list);
          if (list.length > 0) {
            const initialId = preselectedStudentId && list.some((s) => s._id === preselectedStudentId)
              ? preselectedStudentId
              : list[0]._id;
            setSelectedStudentId(initialId);
          }
        }
      } catch (err) {
        console.error('Failed to load linked students:', err);
      } finally {
        setLoadingStudents(false);
      }
    }
    loadStudents();
  }, [preselectedStudentId]);

  // Load exam registrations whenever selected student changes
  useEffect(() => {
    if (!selectedStudentId) return;

    async function loadStudentRegistrations() {
      try {
        setLoadingRegistrations(true);
        setPaymentFeedback(null);
        const res = await getExamRegistrations({ studentId: selectedStudentId } as any);
        if (res.success && Array.isArray(res.data)) {
          setRegistrations(res.data);
        } else {
          setRegistrations([]);
        }
      } catch (err) {
        console.error('Failed to load student exam registrations:', err);
        setRegistrations([]);
      } finally {
        setLoadingRegistrations(false);
      }
    }

    loadStudentRegistrations();
  }, [selectedStudentId]);

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
          message: message || (isPaid ? 'Fee verified! Hall ticket has been issued.' : `Fee Status: ${status}`),
          type: isPaid ? 'success' : 'info',
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

  const handleInitiatePayment = async (reg: ExamRegistration) => {
    try {
      setPayingRegistrationId(reg._id);
      setPaymentFeedback(null);

      // 1. Create order on server
      const res = await createPaymentOrder(reg._id);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to create payment order');
      }

      const order = res.data;

      if (order.freeExam) {
        setPaymentFeedback({
          id: reg._id,
          message: 'Exam fee is ₹0. Hall ticket issued successfully!',
          type: 'success',
        });
        await handleCheckPayment(reg._id);
        return;
      }

      // 2. Load SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Payment gateway SDK could not be loaded. Please check your internet connection.');
      }

      const currentStudent = students.find((s) => s._id === selectedStudentId);

      // 3. Launch Checkout
      const options = {
        key: order.keyId,
        amount: order.amountInPaise,
        currency: order.currency || 'INR',
        name: order.institutionName || 'Markaz Sanaviyya',
        description: `${order.examTitle} Fee Payment - ${order.studentName}`,
        order_id: order.orderId,
        prefill: {
          name: order.studentName || currentStudent?.nameEnglish || '',
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
            // 4. Verify payment
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
          message: resp.error?.description || 'Payment was declined.',
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

  const handlePrint = () => {
    window.print();
  };

  if (loadingStudents) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-28 bg-slate-200/70 animate-pulse rounded-xl" />
      </div>
    );
  }

  const currentStudent = students.find((s) => s._id === selectedStudentId);

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
            <span className="text-slate-900 font-semibold">Examinations & Fees</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#171D19]">
            Examinations & Fee Payments
          </h1>
        </div>

        <Link
          href="/parent"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#23804A] px-3.5 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Child Selector Tabs */}
      <div className="bg-white p-4 rounded-xl border border-[#E3EAE5] shadow-2xs space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <Users className="w-4 h-4 text-[#23804A]" />
          <span>Select Linked Ward:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {students.map((student) => {
            const isSelected = student._id === selectedStudentId;
            return (
              <button
                key={student._id}
                onClick={() => setSelectedStudentId(student._id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#23804A] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{student.nameEnglish}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {student.classId?.name || 'Enrolled'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Registrations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-serif text-[#171D19]">
            Registered Examinations for {currentStudent?.nameEnglish || 'Selected Ward'}
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {registrations.length} Total
          </span>
        </div>

        {loadingRegistrations ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 bg-slate-200/70 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-[#E3EAE5] space-y-3">
            <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No active exam registrations</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              This ward does not currently have any scheduled examination registrations on record.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((reg) => {
              const exam = reg.examId as any;
              const payment = reg.paymentId as any;
              const isIssued = reg.registrationStatus === 'HALL_TICKET_ISSUED';
              const isCancelled = reg.registrationStatus === 'CANCELLED';
              const isPaid = payment?.status === 'SUCCESS' || (isIssued && payment);
              const isPendingPayment = payment?.status === 'PENDING';
              const isChecking = checkingPaymentId === reg._id;
              const isPaying = payingRegistrationId === reg._id;

              return (
                <div
                  key={reg._id}
                  className="bg-white rounded-xl border border-[#E3EAE5] p-6 shadow-2xs hover:border-[#23804A] transition-all space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {exam?.code || exam?.examCode || 'EXAM'}
                        </span>
                        <h3 className="text-base font-bold text-[#171D19]">{exam?.title || 'Examination'}</h3>
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
                          <span className="text-slate-400">Candidate:</span>{' '}
                          <span className="text-slate-800 font-medium">
                            {currentStudent?.nameEnglish}
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
                          disabled={isPaying || isChecking}
                          className="inline-flex items-center px-4 py-2.5 rounded-lg bg-[#23804A] hover:bg-[#1B6F41] text-white text-xs font-semibold shadow-2xs transition-all disabled:opacity-60 cursor-pointer"
                          title="Proceed to secure Razorpay checkout"
                        >
                          <CreditCard className={`w-3.5 h-3.5 mr-1.5 ${isPaying ? 'animate-pulse' : ''}`} />
                          {isPaying ? 'Connecting Gateway...' : `Pay Exam Fee ₹${exam?.fee ?? 500}`}
                        </button>
                      )}

                      <button
                        onClick={() => handleCheckPayment(reg._id)}
                        disabled={isChecking || isPaying}
                        className="inline-flex items-center px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all disabled:opacity-60"
                        title="Verify payment status"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 mr-1.5 ${
                            isChecking ? 'animate-spin text-[#23804A]' : 'text-slate-400'
                          }`}
                        />
                        {isChecking ? 'Checking...' : 'Check Status'}
                      </button>

                      {isIssued ? (
                        <button
                          onClick={() => setSelectedHallTicket(reg)}
                          className="inline-flex items-center px-4 py-2.5 rounded-lg bg-[#23804A] hover:bg-[#1B6F41] text-white text-xs font-semibold shadow-2xs transition-all"
                        >
                          <Printer className="w-3.5 h-3.5 mr-1.5" /> View / Print Admit Card
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Feedback Notification */}
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
      </div>

      {/* Hall Ticket Printable Modal */}
      {selectedHallTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">Official Examination Admit Card</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-lg bg-[#23804A] hover:bg-[#1B6F41] text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Card</span>
                </button>
                <button
                  onClick={() => setSelectedHallTicket(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="p-8 sm:p-12 space-y-8 bg-white print:p-0">
              <div className="text-center border-b-2 border-slate-900 pb-6 space-y-1">
                <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-slate-950 uppercase">
                  Markaz Sanaviyya
                </h2>
                <p className="text-xs font-bold tracking-widest text-[#23804A] uppercase">
                  Markaz Integrated Studies Council (MISC)
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Official Board Examination Hall Ticket / Admit Card
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-medium block">Candidate Name:</span>
                  <span className="font-bold text-slate-950 text-sm">{currentStudent?.nameEnglish}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Roll Number:</span>
                  <span className="font-mono font-black text-slate-950 text-sm tracking-wider">
                    {selectedHallTicket.rollNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Class / Standard:</span>
                  <span className="font-bold text-slate-950">{currentStudent?.classId?.name || 'Sanaviyya'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Examination:</span>
                  <span className="font-bold text-slate-950">{(selectedHallTicket.examId as any)?.title}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Fee Status:</span>
                  <span className="font-bold text-emerald-700">Verified & Paid</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Verification:</span>
                  <span className="font-bold text-slate-950">Council Verified</span>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
                <div>
                  <p className="font-bold text-slate-800">Council Controller of Examinations</p>
                  <p>Markaz Sanaviyya Board</p>
                </div>
                <div className="text-right">
                  <p>Generated electronically via Parent Portal</p>
                  <p className="font-mono">{new Date().toLocaleDateString('en-GB')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ParentExaminationsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-10 w-64 bg-slate-200/70 animate-pulse rounded-lg" />
          <div className="h-28 bg-slate-200/70 animate-pulse rounded-xl" />
        </div>
      }
    >
      <ParentExaminationsContent />
    </Suspense>
  );
}
