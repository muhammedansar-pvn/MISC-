'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getFacultyProfile,
  getFacultyById,
  updateFacultyProfile,
  uploadFacultyPhoto,
  deleteFacultyPhoto,
} from '@/services/faculty.service';
import { getFileUrl } from '@/utils/fileUrl';
import { setUser } from '@/utils/token';
import { FacultyProfile } from '@/types';
import {
  User,
  Building2,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  BookOpen,
  Award,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Camera,
  Trash2,
  Edit2,
  X,
  RefreshCw,
} from 'lucide-react';

export default function FacultyProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Photo Management State
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Profile Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    nameEnglish: '',
    nameArabic: '',
    contactNumber: '',
    designation: '',
    academicQualification: '',
    islamicQualification: '',
    previousExperience: '',
    placeEnglish: '',
    placeArabic: '',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const loadFacultyProfile = async () => {
    try {
      setLoading(true);
      // Attempt self-profile endpoint first, fallback to getFacultyById
      let res;
      try {
        res = await getFacultyProfile();
      } catch {
        if (user?.id) {
          res = await getFacultyById(user.id);
        }
      }

      if (res && res.success && res.data) {
        setProfile(res.data);
      }
    } catch (err) {
      // Faculty record may be pending setup
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacultyProfile();
  }, [user?.id]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoFeedback({ type: 'error', message: 'Only JPEG, PNG, and WebP images are allowed.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoFeedback({ type: 'error', message: 'Photo file size exceeds the 5MB maximum limit.' });
      return;
    }

    try {
      setPhotoUploading(true);
      setPhotoFeedback(null);
      const res = await uploadFacultyPhoto(file);
      if (res.success && res.data) {
        setProfile(res.data);
        setPhotoFeedback({ type: 'success', message: 'Faculty profile photo updated successfully!' });
      } else {
        setPhotoFeedback({ type: 'error', message: res.message || 'Failed to upload photo.' });
      }
    } catch (err: any) {
      setPhotoFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to upload photo.',
      });
    } finally {
      setPhotoUploading(false);
    }
  };

  const handlePhotoRemove = async () => {
    if (!profile?.photo) return;
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;

    try {
      setPhotoUploading(true);
      setPhotoFeedback(null);
      const res = await deleteFacultyPhoto();
      if (res.success && res.data) {
        setProfile(res.data);
        setPhotoFeedback({ type: 'success', message: 'Profile photo removed.' });
      } else {
        setPhotoFeedback({ type: 'error', message: res.message || 'Failed to remove photo.' });
      }
    } catch (err: any) {
      setPhotoFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to remove photo.',
      });
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleOpenEditModal = () => {
    if (!profile) return;
    setEditForm({
      nameEnglish: profile.nameEnglish || (profile.userId as any)?.name || user?.name || '',
      nameArabic: profile.nameArabic || '',
      contactNumber: profile.contactNumber || (profile.userId as any)?.mobile || user?.mobile || '',
      designation: profile.designation || '',
      academicQualification: profile.academicQualification || '',
      islamicQualification: profile.islamicQualification || '',
      previousExperience: profile.previousExperience || '',
      placeEnglish: profile.placeEnglish || '',
      placeArabic: profile.placeArabic || '',
    });
    setEditError(null);
    setEditSuccess(null);
    setIsEditModalOpen(true);
  };

  const handleSaveEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.nameEnglish.trim()) {
      setEditError('Faculty name (English) is required.');
      return;
    }

    try {
      setEditSubmitting(true);
      setEditError(null);
      setEditSuccess(null);

      const payload = {
        nameEnglish: editForm.nameEnglish.trim(),
        nameArabic: editForm.nameArabic.trim(),
        contactNumber: editForm.contactNumber.trim(),
        designation: editForm.designation.trim(),
        academicQualification: editForm.academicQualification.trim(),
        islamicQualification: editForm.islamicQualification.trim(),
        previousExperience: editForm.previousExperience.trim(),
        placeEnglish: editForm.placeEnglish.trim(),
        placeArabic: editForm.placeArabic.trim(),
      };

      const res = await updateFacultyProfile(payload);
      if (res.success && res.data) {
        setProfile(res.data);
        if (user && editForm.nameEnglish.trim()) {
          setUser({ ...user, name: editForm.nameEnglish.trim() });
        }
        setEditSuccess('Faculty profile updated successfully!');
        setTimeout(() => {
          setIsEditModalOpen(false);
          setEditSuccess(null);
        }, 1200);
      } else {
        setEditError(res.message || 'Failed to update faculty profile.');
      }
    } catch (err: any) {
      setEditError(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-52 bg-slate-200/70 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200/70 animate-pulse rounded-xl" />
          <div className="h-64 bg-slate-200/70 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  const institution = profile?.institutionId as any;

  return (
    <div className="space-y-8">
      {/* Header Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/faculty" className="hover:text-[#23804A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Faculty Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#171D19]">
            Academic Faculty Profile
          </h1>
        </div>

        <Link
          href="/faculty"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#23804A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Photo Feedback Banner */}
      {photoFeedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
            photoFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {photoFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{photoFeedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setPhotoFeedback(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Identity Hero Card */}
      <div className="bg-white rounded-2xl border border-[#E3EAE5] p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1 min-w-0">
            {/* Avatar & Photo Actions */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-[#171D19] to-[#23804A] text-white flex items-center justify-center font-bold font-serif text-3xl shrink-0 shadow-md overflow-hidden relative">
                  {profile?.photo ? (
                    <img
                      src={getFileUrl(profile.photo)}
                      alt={profile.nameEnglish || user?.name || 'Faculty'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (profile?.nameEnglish || user?.name || user?.username || 'F')[0].toUpperCase()
                  )}

                  {photoUploading && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-2xs gap-1">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span className="text-[10px] font-semibold">Updating...</span>
                    </div>
                  )}
                </div>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  disabled={photoUploading}
                  onClick={() => photoInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#23804A] hover:text-[#1B6F41] bg-[#23804A]/5 hover:bg-[#23804A]/10 border border-[#23804A]/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  title="Upload or replace photo (Max 5MB: JPG, PNG, WebP)"
                >
                  <Camera className="w-3 h-3" />
                  <span>{profile?.photo ? 'Change' : 'Upload'}</span>
                </button>
                {profile?.photo && (
                  <button
                    type="button"
                    disabled={photoUploading}
                    onClick={handlePhotoRemove}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    title="Remove profile photo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[#171D19]">
                  {profile?.nameEnglish || user?.name || user?.username || 'Faculty Instructor'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                  Authorized Evaluator
                </span>
              </div>

              {profile?.nameArabic && (
                <p className="font-arabic text-lg text-[#23804A]" dir="rtl">
                  {profile.nameArabic}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center space-x-1.5">
                  <Briefcase className="w-4 h-4 text-[#23804A]" />
                  <span className="font-medium text-slate-700">
                    {profile?.designation || user?.department || 'Academic Faculty'}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-[#23804A]" />
                  <span className="truncate max-w-xs">{institution?.name || 'Markaz Affiliated Center'}</span>
                </div>
                {profile?.facultyId && (
                  <div className="flex items-center space-x-1 font-mono">
                    <span className="text-slate-400">Faculty ID:</span>
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {profile.facultyId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Profile CTA Button */}
          {profile && (
            <div className="self-start sm:self-center shrink-0">
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#23804A] hover:bg-[#1B6F41] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Faculty Profile</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notice if profile linkage pending */}
      {!profile && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start space-x-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-900">Active Faculty User Account</p>
            <p className="text-slate-500 mt-0.5 leading-relaxed">
              Your credentials are authenticated as an authorized faculty instructor. Detailed institutional biographic records (qualifications, joining date, and designation) will populate once synchronized by your institution administrator.
            </p>
          </div>
        </div>
      )}

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Professional & Qualifications */}
        <div className="bg-white rounded-xl border border-[#E3EAE5] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E3EAE5] pb-3">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-[#23804A]" />
              <h3 className="font-bold text-sm text-[#171D19]">Professional & Academic Credentials</h3>
            </div>
            {profile && (
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#23804A] hover:text-[#1B6F41] hover:underline cursor-pointer"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            )}
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="text-slate-400 font-medium">Designation / Rank</dt>
              <dd className="font-bold text-slate-900 mt-0.5">
                {profile?.designation || user?.department || 'Instructor / Lecturer'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Joining Year</dt>
              <dd className="font-bold text-slate-900 mt-0.5">
                {profile?.joiningYear || 'Current Session'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Academic Qualification</dt>
              <dd className="font-bold text-slate-900 mt-0.5">
                {profile?.academicQualification || 'Degree on File'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Islamic Qualification</dt>
              <dd className="font-bold text-slate-900 mt-0.5">
                {profile?.islamicQualification || 'Certificate on File'}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-400 font-medium">Prior Teaching Experience</dt>
              <dd className="text-slate-700 mt-0.5 leading-relaxed">
                {profile?.previousExperience || 'Verified institutional teaching background.'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Institutional & Contact Information */}
        <div className="bg-white rounded-xl border border-[#E3EAE5] p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#E3EAE5] pb-3">
            <Building2 className="w-5 h-5 text-[#23804A]" />
            <h3 className="font-bold text-sm text-[#171D19]">Institution & Contact Details</h3>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="text-slate-400 font-medium">Institution Name</dt>
              <dd className="font-bold text-slate-900 mt-0.5">
                {institution?.name || 'MISC Affiliated Academic Centre'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Institution Code</dt>
              <dd className="font-mono font-bold text-slate-900 mt-0.5">
                {institution?.code || 'MISC-HQ'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Registered User Email</dt>
              <dd className="font-bold text-slate-900 mt-0.5 truncate">
                {user?.email || 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Contact Phone</dt>
              <dd className="font-bold text-slate-900 mt-0.5">
                {profile?.contactNumber || user?.mobile || 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Place of Origin (English)</dt>
              <dd className="font-bold text-slate-900 mt-0.5">
                {profile?.placeEnglish || 'N/A'}
              </dd>
            </div>
            {profile?.placeArabic && (
              <div>
                <dt className="text-slate-400 font-medium">Place of Origin (Arabic)</dt>
                <dd className="font-arabic font-bold text-slate-900 mt-0.5" dir="rtl">
                  {profile.placeArabic}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Edit Faculty Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  Edit Faculty Profile
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your personal biographic, academic, and qualification details
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Informational Security Notice */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold">Institutional Governance Notice:</span> Institutional placement, Faculty ID, Assigned Classes, Assigned Subjects, and Joining Year are officially managed by the administration.
              </div>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded font-medium">
                {editError}
              </div>
            )}

            {editSuccess && (
              <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs rounded font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{editSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* English Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Full Name (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.nameEnglish}
                    onChange={(e) => setEditForm({ ...editForm, nameEnglish: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A] focus:border-transparent transition-all"
                    placeholder="e.g. Dr. Ahmad Hassan"
                  />
                </div>

                {/* Arabic Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Full Name (Arabic)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={editForm.nameArabic}
                    onChange={(e) => setEditForm({ ...editForm, nameArabic: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-arabic rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A] focus:border-transparent transition-all"
                    placeholder="د. أحمد حسن"
                  />
                </div>

                {/* Designation */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A] focus:border-transparent transition-all"
                    placeholder="e.g. Senior Lecturer / Professor"
                  />
                </div>

                {/* Contact Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={editForm.contactNumber}
                    onChange={(e) => setEditForm({ ...editForm, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A] focus:border-transparent transition-all"
                    placeholder="+91 9876543210"
                  />
                </div>

                {/* Academic Qualification */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Academic Qualification
                  </label>
                  <input
                    type="text"
                    value={editForm.academicQualification}
                    onChange={(e) => setEditForm({ ...editForm, academicQualification: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A] focus:border-transparent transition-all"
                    placeholder="e.g. M.A. Arabic Literature, B.Ed."
                  />
                </div>

                {/* Islamic Qualification */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Islamic Qualification
                  </label>
                  <input
                    type="text"
                    value={editForm.islamicQualification}
                    onChange={(e) => setEditForm({ ...editForm, islamicQualification: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A] focus:border-transparent transition-all"
                    placeholder="e.g. Sanad in Hadith, Fazil"
                  />
                </div>

                {/* Place English */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Place of Origin (English)
                  </label>
                  <input
                    type="text"
                    value={editForm.placeEnglish}
                    onChange={(e) => setEditForm({ ...editForm, placeEnglish: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A] focus:border-transparent transition-all"
                    placeholder="e.g. Malappuram"
                  />
                </div>

                {/* Place Arabic */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Place of Origin (Arabic)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={editForm.placeArabic}
                    onChange={(e) => setEditForm({ ...editForm, placeArabic: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-arabic rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A] focus:border-transparent transition-all"
                    placeholder="ملابورم"
                  />
                </div>

                {/* Previous Experience */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Prior Teaching Experience
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.previousExperience}
                    onChange={(e) => setEditForm({ ...editForm, previousExperience: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#23804A] focus:border-transparent transition-all resize-none"
                    placeholder="Describe relevant prior teaching positions, years of service, and specializations..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 bg-[#23804A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1B6F41] disabled:opacity-50 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {editSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
