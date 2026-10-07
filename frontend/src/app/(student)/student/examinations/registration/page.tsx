'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getAvailableExamsForRegistration,
  registerStudentForExam,
  checkExamFeePayment,
} from '@/services/exam.service';
import { createPaymentOrder, verifyPayment } from '@/services/payment.service';
import { getStudentProfile } from '@/services/student.service';
import { AvailableExamForRegistration, StudentProfile } from '@/types';
import {
  ClipboardList,
  Calendar,
  Clock,
  BookOpen,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Building2,
  RefreshCw,
  X,
  Printer,
  Sparkles,
} from 'lucide-react';

export default function StudentExamRegistrationPage() {
  const router = useRouter();
  const [exams, setExams] = useState<AvailableExamForRegistration[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedSchedules, setExpandedSchedules] = useState<{ [examId: string]: boolean }>({});

  // Registration modal & state
  const [confirmModalExam, setConfirmModalExam] = useState<AvailableExamForRegistration | null>(null);
  const [registering, setRegistering] = useState<boolean>(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    examTitle: string;
    registrationId: string;
    fee: number;
    rollNumber: string;
    isPaid: boolean;
  } | null>(null);

  // Payment states
  const [payingExamId, setPayingExamId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [examsRes, profileRes] = await Promise.allSettled([
        getAvailableExamsForRegistration(),
        getStudentProfile(),
      ]);

      if (examsRes.status === 'fulfilled' && examsRes.value.success && Array.isArray(examsRes.value.data)) {
        setExams(examsRes.value.data);
      }

      if (profileRes.status === 'fulfilled' && profileRes.value.success && profileRes.value.data) {
        setProfile(profileRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load available examinations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleSchedules = (examId: string) => {
    setExpandedSchedules((prev) => ({
      ...prev,
      [examId]: !prev[examId],
    }));
  };

  // Helper to load Razorpay script
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

  // Handle student registration submission
  const handleConfirmRegistration = async () => {
    if (!confirmModalExam) return;

    try {
      setRegistering(true);
      setFeedback(null);

      const res = await registerStudentForExam({
        examId: confirmModalExam._id,
      });

      if (!res.success || !res.data) {
        throw new Error(res.message || 'Registration failed');
      }

      const reg = res.data;
      const isPaid = reg.registrationStatus === 'HALL_TICKET_ISSUED';

      setRegistrationSuccess({
        examTitle: confirmModalExam.title || confirmModalExam.name || 'Examination',
        registrationId: reg._id,
        fee: confirmModalExam.fee || 0,
        rollNumber: reg.rollNumber || 'Assigned',
        isPaid,
      });

      // Update local exam state
      setExams((prev) =>
        prev.map((e) =>
          e._id === confirmModalExam._id
            ? {
                ...e,
                isRegistered: true,
                registration: {
                  _id: reg._id,
                  rollNumber: reg.rollNumber || '',
                  registrationStatus: reg.registrationStatus || 'REGISTERED',
                  paymentStatus: isPaid ? 'PAID' : 'UNPAID',
                  isPaid,
                  createdAt: reg.createdAt,
                },
                isRegistrationOpen: false,
                registrationCloseReason: 'Already Registered',
              }
            : e
        )
      );

      setConfirmModalExam(null);
    } catch (err: any) {
      setFeedback({
        id: confirmModalExam._id,
        message: err.response?.data?.message || err.message || 'Failed to complete registration.',
        type: 'error',
      });
      setConfirmModalExam(null);
    } finally {
      setRegistering(false);
    }
  };

  // Handle immediate payment for an exam registration
  const handleInitiatePayment = async (exam: AvailableExamForRegistration) => {
    const registrationId = exam.registration?._id;
    if (!registrationId) {
      setFeedback({
        id: exam._id,
        message: 'Registration record not found. Please register first.',
        type: 'error',
      });
      return;
    }

    try {
      setPayingExamId(exam._id);
      setFeedback(null);

      const orderRes = await createPaymentOrder(registrationId);
      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Failed to create payment order');
      }

      const order = orderRes.data;

      // Auto-cleared zero fee exam
      if (order.freeExam) {
        setFeedback({
          id: exam._id,
          message: 'Exam fee is ₹0. Registration confirmed and Admit Card issued!',
          type: 'success',
        });
        await checkExamFeePayment(registrationId);
        await loadData();
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your network connection.');
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Markaz Sanaviyya',
        description: `Examination Fee - ${exam.title || exam.code}`,
        order_id: order.orderId,
        prefill: {
          name: profile?.nameEnglish || '',
          email: (profile?.userId as any)?.email || '',
          contact: profile?.emergencyContactNumber || (profile?.userId as any)?.mobile || '',
        },
        theme: {
          color: '#23804A',
        },
        handler: async (response: any) => {
          try {
            setFeedback({
              id: exam._id,
              message: 'Verifying payment cryptographic signature with Sanaviyya server...',
              type: 'info',
            });

            const verifyRes = await verifyPayment({
              transactionId: order.transactionId,
              paymentId: order.paymentId,
              examRegistrationId: registrationId,
              razorpayOrderId: response.razorpay_order_id || order.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              razorpay_order_id: response.razorpay_order_id || order.orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              gateway: 'RAZORPAY',
            });

            if (verifyRes.success) {
              setFeedback({
                id: exam._id,
                message: 'Payment verified successfully! Hall Ticket has been issued.',
                type: 'success',
              });
              await loadData();
            } else {
              setFeedback({
                id: exam._id,
                message: verifyRes.message || 'Payment verification failed.',
                type: 'error',
              });
            }
          } catch (verErr: any) {
            setFeedback({
              id: exam._id,
              message: verErr.response?.data?.message || verErr.message || 'Payment verification failed.',
              type: 'error',
            });
          }
        },
        modal: {
          ondismiss: () => {
            setPayingExamId(null);
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch (err: any) {
      setFeedback({
        id: exam._id,
        message: err.response?.data?.message || err.message || 'Payment initialization failed.',
        type: 'error',
      });
    } finally {
      setPayingExamId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-28 bg-slate-200/70 animate-pulse rounded-2xl" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-slate-200/70 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const openExamsCount = exams.filter((e) => e.isRegistrationOpen).length;
  const registeredExamsCount = exams.filter((e) => e.isRegistered).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Breadcrumb & Header */}
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
            <span className="text-slate-900 font-semibold">Exam Registration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#171D19]">
            Examination Registration & Enrolment
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Browse upcoming institutional examinations configured for your class, review subject timetables and fees, and register online.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/student/examinations/registrations"
            className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-2xs"
          >
            <FileCheck className="w-3.5 h-3.5 mr-1.5 text-[#23804A]" /> Hall Tickets & Status
          </Link>
          <Link
            href="/student/examinations"
            className="inline-flex items-center text-xs font-semibold text-white px-3.5 py-2 rounded-lg bg-[#23804A] hover:bg-[#1B6F41] transition-all shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5" /> Exam Schedules
          </Link>
        </div>
      </div>

      {/* Student Enrolment Info Banner */}
      {profile && (
        <div className="bg-gradient-to-r from-emerald-50/60 via-slate-50 to-emerald-50/40 border border-emerald-900/10 rounded-2xl p-5 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-white border border-emerald-900/10 flex items-center justify-center text-[#23804A] shadow-2xs shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 text-base">
                    {profile.nameEnglish || 'Student Candidate'}
                  </h3>
                  <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    ELIGIBLE CANDIDATE
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
                  <span>
                    Reg No: <strong className="text-slate-800 font-medium">{profile.registrationNumber || 'N/A'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Class:{' '}
                    <strong className="text-slate-800 font-medium">
                      {(profile.classId as any)?.name || (profile.classId as any)?.className || 'Sanaviyya Standard'}
                    </strong>
                  </span>
                  {profile.admissionNumber && (
                    <>
                      <span>•</span>
                      <span>
                        Admission No: <strong className="text-slate-800 font-medium">{profile.admissionNumber}</strong>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
              <div className="text-left md:text-right text-xs">
                <span className="text-slate-500 block">Available Open Exams</span>
                <span className="text-base font-bold text-slate-900">{openExamsCount}</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-left md:text-right text-xs">
                <span className="text-slate-500 block">Enrolled Exams</span>
                <span className="text-base font-bold text-[#23804A]">{registeredExamsCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Success Feedback Banner (Post-Registration) */}
      {registrationSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start justify-between shadow-2xs">
          <div className="flex items-start space-x-3.5">
            <CheckCircle2 className="w-5 h-5 text-[#23804A] mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-emerald-950 text-sm">
                Enrolment Confirmed for {registrationSuccess.examTitle}
              </h4>
              <p className="text-xs text-emerald-800 mt-1">
                Institutional Candidate Roll Number assigned:{' '}
                <strong className="font-mono font-bold text-emerald-900">{registrationSuccess.rollNumber}</strong>.
                {registrationSuccess.isPaid
                  ? ' Your examination fee is satisfied and your official Hall Ticket (Admit Card) is ready for download!'
                  : ` Please complete the examination fee of ₹${registrationSuccess.fee} to activate your Hall Ticket.`}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {registrationSuccess.isPaid ? (
                  <Link
                    href="/student/examinations/registrations"
                    className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#23804A] text-white hover:bg-[#1B6F41] transition-all"
                  >
                    <FileCheck className="w-3.5 h-3.5 mr-1.5" /> View & Print Hall Ticket
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      const ex = exams.find((e) => e.registration?._id === registrationSuccess.registrationId);
                      if (ex) handleInitiatePayment(ex);
                    }}
                    className="inline-flex items-center text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-[#23804A] text-white hover:bg-[#1B6F41] transition-all"
                  >
                    <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Pay Exam Fee ₹{registrationSuccess.fee} Now
                  </button>
                )}
                <button
                  onClick={() => setRegistrationSuccess(null)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => setRegistrationSuccess(null)}
            className="text-emerald-600 hover:text-emerald-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Available Examinations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-serif text-[#171D19] flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#23804A]" />
            Examinations Configured for Your Enrolment
          </h2>
          <button
            onClick={loadData}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {exams.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-2xs">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              No Examinations Currently Available
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are no institutional examinations open for registration for your assigned class at this time. When an examination session is published by academic administration, it will appear here.
            </p>
            <div className="mt-5">
              <Link
                href="/student/examinations"
                className="inline-flex items-center text-xs font-semibold text-[#23804A] hover:underline"
              >
                View General Examination Timetables <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => {
              const isExpanded = expandedSchedules[exam._id];
              const isRegistered = exam.isRegistered;
              const registration = exam.registration;
              const isPaid = registration?.isPaid || false;
              const hasFee = (exam.fee || 0) > 0;
              const isPaying = payingExamId === exam._id;
              const examFeedback = feedback && feedback.id === exam._id ? feedback : null;

              return (
                <div
                  key={exam._id}
                  className={`bg-white border rounded-2xl transition-all overflow-hidden ${
                    isRegistered
                      ? isPaid
                        ? 'border-emerald-300 shadow-2xs'
                        : 'border-amber-300 shadow-2xs'
                      : exam.isRegistrationOpen
                      ? 'border-slate-200 hover:border-[#23804A]/40 shadow-2xs'
                      : 'border-slate-200 opacity-90'
                  }`}
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                      {/* Left: Exam Details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                            {exam.code}
                          </span>
                          {exam.term && (
                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              {exam.term.replace(/_/g, ' ')}
                            </span>
                          )}
                          {exam.examType && (
                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              {exam.examType}
                            </span>
                          )}

                          {/* Status Badges */}
                          {isRegistered ? (
                            isPaid ? (
                              <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> ENROLLED & HALL TICKET ISSUED
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                <AlertCircle className="w-3.5 h-3.5 mr-1" /> REGISTERED — FEE PENDING
                              </span>
                            )
                          ) : exam.isRegistrationOpen ? (
                            <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Sparkles className="w-3 h-3 mr-1" /> REGISTRATION OPEN
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {exam.registrationCloseReason || 'REGISTRATION CLOSED'}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold font-serif text-[#171D19]">
                          {exam.title || exam.name}
                        </h3>

                        {/* Meta Row */}
                        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-5 text-xs text-slate-600 pt-1">
                          <div className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                            <span>
                              Exam Period:{' '}
                              <strong className="text-slate-800 font-medium">
                                {new Date(exam.startDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}{' '}
                                –{' '}
                                {new Date(exam.endDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </strong>
                            </span>
                          </div>

                          <div className="flex items-center">
                            <CreditCard className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                            <span>
                              Exam Fee:{' '}
                              <strong className="text-slate-900 font-bold text-sm">
                                {hasFee ? `₹${exam.fee}` : 'Free (₹0)'}
                              </strong>
                            </span>
                          </div>

                          {exam.registrationEndDate && (
                            <div className="flex items-center">
                              <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                              <span>
                                Reg Deadline:{' '}
                                <strong className="text-slate-800 font-medium">
                                  {new Date(exam.registrationEndDate).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </strong>
                              </span>
                            </div>
                          )}

                          {exam.schedulesCount > 0 && (
                            <div className="flex items-center">
                              <BookOpen className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                              <span>
                                Papers:{' '}
                                <strong className="text-slate-800 font-medium">
                                  {exam.schedulesCount} scheduled subjects
                                </strong>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* If registered: Roll Number info */}
                        {isRegistered && registration?.rollNumber && (
                          <div className="mt-2 text-xs bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 inline-flex items-center gap-3">
                            <span className="text-slate-500">Institutional Roll Number:</span>
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {registration.rollNumber}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        {/* Action State 1: Eligible and Open (Not Registered) */}
                        {!isRegistered && exam.isRegistrationOpen && (
                          <button
                            onClick={() => setConfirmModalExam(exam)}
                            className="inline-flex items-center justify-center text-xs font-semibold text-white px-5 py-2.5 rounded-xl bg-[#23804A] hover:bg-[#1B6F41] transition-all shadow-2xs hover:shadow-sm"
                          >
                            <ClipboardList className="w-4 h-4 mr-1.5" /> Register Now
                          </button>
                        )}

                        {/* Action State 2: Registered, Fee Pending */}
                        {isRegistered && !isPaid && hasFee && (
                          <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                            <button
                              onClick={() => handleInitiatePayment(exam)}
                              disabled={isPaying}
                              className="inline-flex items-center justify-center text-xs font-semibold text-white px-5 py-2.5 rounded-xl bg-[#23804A] hover:bg-[#1B6F41] transition-all shadow-2xs hover:shadow-sm disabled:opacity-60"
                            >
                              <CreditCard className="w-4 h-4 mr-1.5" />
                              {isPaying ? 'Processing...' : `Pay Exam Fee ₹${exam.fee}`}
                            </button>
                            <Link
                              href="/student/examinations/registrations"
                              className="inline-flex items-center justify-center text-xs font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 transition-all text-center"
                            >
                              View Hall Ticket Status
                            </Link>
                          </div>
                        )}

                        {/* Action State 3: Enrolled & Hall Ticket Issued */}
                        {isRegistered && isPaid && (
                          <Link
                            href="/student/examinations/registrations"
                            className="inline-flex items-center justify-center text-xs font-semibold text-white px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 transition-all shadow-2xs"
                          >
                            <FileCheck className="w-4 h-4 mr-1.5" /> Download Hall Ticket
                          </Link>
                        )}

                        {/* Action State 4: Registration Closed & Not Registered */}
                        {!isRegistered && !exam.isRegistrationOpen && (
                          <button
                            disabled
                            className="inline-flex items-center justify-center text-xs font-semibold text-slate-400 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 cursor-not-allowed"
                          >
                            Registration Closed
                          </button>
                        )}

                        {/* Toggle Schedules Details Button */}
                        {exam.schedules && exam.schedules.length > 0 && (
                          <button
                            onClick={() => toggleSchedules(exam._id)}
                            className="text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 font-medium py-1 px-2"
                          >
                            {isExpanded ? (
                              <>
                                Hide Subject Papers <ChevronUp className="w-3.5 h-3.5" />
                              </>
                            ) : (
                              <>
                                View Subject Papers ({exam.schedules.length}) <ChevronDown className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline Feedback Message */}
                    {examFeedback && (
                      <div
                        className={`mt-4 p-3 rounded-xl text-xs flex items-center justify-between ${
                          examFeedback.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : examFeedback.type === 'error'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {examFeedback.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          <span>{examFeedback.message}</span>
                        </div>
                        <button
                          onClick={() => setFeedback(null)}
                          className="text-slate-400 hover:text-slate-600 ml-2"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expandable Timetable / Schedules Drawer */}
                  {isExpanded && exam.schedules && exam.schedules.length > 0 && (
                    <div className="bg-slate-50/70 border-t border-slate-100 p-5 sm:p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#23804A]" />
                          Scheduled Papers & Timings for Your Class
                        </h4>
                        <span className="text-xs text-slate-500">
                          Total Papers: {exam.schedules.length}
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-xs bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                          <thead className="bg-slate-100/70 text-slate-600 font-semibold">
                            <tr>
                              <th scope="col" className="px-3.5 py-2.5">Date</th>
                              <th scope="col" className="px-3.5 py-2.5">Time</th>
                              <th scope="col" className="px-3.5 py-2.5">Subject Paper</th>
                              <th scope="col" className="px-3.5 py-2.5 text-center">Max Marks</th>
                              <th scope="col" className="px-3.5 py-2.5 text-center">Pass Marks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {exam.schedules.map((schedule: any) => (
                              <tr key={schedule._id} className="hover:bg-slate-50/50">
                                <td className="px-3.5 py-2.5 font-medium text-slate-900 whitespace-nowrap">
                                  {new Date(schedule.examDate).toLocaleDateString('en-IN', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                  })}
                                </td>
                                <td className="px-3.5 py-2.5 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                                  {schedule.startTime} – {schedule.endTime}
                                </td>
                                <td className="px-3.5 py-2.5 font-semibold text-slate-900">
                                  {schedule.subjectId?.name ||
                                    schedule.subjectId?.subjectName ||
                                    schedule.subjectId?.code ||
                                    'Subject'}
                                </td>
                                <td className="px-3.5 py-2.5 text-center font-medium">
                                  {schedule.maxMarks}
                                </td>
                                <td className="px-3.5 py-2.5 text-center text-slate-600">
                                  {schedule.passMarks || schedule.passingMarks || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModalExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#23804A] bg-emerald-50 px-2 py-0.5 rounded">
                  Examination Enrolment
                </span>
                <h3 className="text-lg font-bold font-serif text-slate-900 mt-1">
                  Confirm Examination Registration
                </h3>
              </div>
              <button
                onClick={() => setConfirmModalExam(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Examination:</span>
                <span className="font-semibold text-slate-900 text-right">
                  {confirmModalExam.title || confirmModalExam.name}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Exam Code:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {confirmModalExam.code}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Candidate Name:</span>
                <span className="font-semibold text-slate-900">
                  {profile?.nameEnglish || 'Student Candidate'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Student Reg Number:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {profile?.registrationNumber || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Class:</span>
                <span className="font-semibold text-slate-900">
                  {(profile?.classId as any)?.name || (profile?.classId as any)?.className || 'Sanaviyya'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-700 font-bold">Examination Fee:</span>
                <span className="font-bold text-base text-[#23804A]">
                  {(confirmModalExam.fee || 0) > 0 ? `₹${confirmModalExam.fee}` : 'Free (₹0)'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              By confirming, you will be formally registered as an examination candidate with an institutional roll number assigned.
              {(confirmModalExam.fee || 0) > 0
                ? ' After registering, you will be prompted to complete the examination fee online to receive your official Hall Ticket.'
                : ' As this examination has zero fee, your official Hall Ticket will be issued immediately upon confirmation.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalExam(null)}
                disabled={registering}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRegistration}
                disabled={registering}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#23804A] hover:bg-[#1B6F41] rounded-xl transition-all shadow-2xs hover:shadow-sm disabled:opacity-60 flex items-center gap-1.5"
              >
                {registering ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Enrolling...
                  </>
                ) : (
                  <>
                    <ClipboardList className="w-3.5 h-3.5" /> Confirm & Register
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
