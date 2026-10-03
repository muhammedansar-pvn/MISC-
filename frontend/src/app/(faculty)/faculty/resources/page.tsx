'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getResources } from '@/services/cms.service';
import {
  getStudyMaterials,
  createStudyMaterial,
  deleteStudyMaterial,
  StudyMaterialItem,
} from '@/services/study-material.service';
import { getMyAssignments } from '@/services/faculty.service';
import { DownloadResource, FacultyAssignment } from '@/types';
import {
  FileText,
  Download,
  Search,
  ArrowLeft,
  Plus,
  Trash2,
  Building2,
  BookOpen,
  FolderOpen,
  Layers,
} from 'lucide-react';

export default function FacultyResourcesPage() {
  const [activeTab, setActiveTab] = useState<'study-materials' | 'guidelines'>('study-materials');

  // Study Materials state
  const [materials, setMaterials] = useState<StudyMaterialItem[]>([]);
  const [facultyAllocs, setFacultyAllocs] = useState<FacultyAssignment[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [searchMaterials, setSearchMaterials] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');

  // Create Material Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialChapter, setMaterialChapter] = useState('');
  const [modalClassId, setModalClassId] = useState('');
  const [modalSubjectId, setModalSubjectId] = useState('');
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [submittingMaterial, setSubmittingMaterial] = useState(false);
  const [materialError, setMaterialError] = useState<string | null>(null);

  // Guidelines / CMS resources state
  const [resources, setResources] = useState<DownloadResource[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [searchGuidelines, setSearchGuidelines] = useState('');

  // 1. Load Study Materials & Allocations
  const loadMaterialsData = async () => {
    try {
      setLoadingMaterials(true);
      const [allocsRes, matRes] = await Promise.allSettled([
        getMyAssignments(),
        getStudyMaterials(),
      ]);

      if (allocsRes.status === 'fulfilled' && allocsRes.value.success && Array.isArray(allocsRes.value.data)) {
        const allocs = allocsRes.value.data;
        setFacultyAllocs(allocs);
        if (allocs.length > 0) {
          setModalClassId(allocs[0].classId._id);
          setModalSubjectId(allocs[0].subjectId._id);
        }
      }

      if (matRes.status === 'fulfilled' && matRes.value.success && Array.isArray(matRes.value.data)) {
        setMaterials(matRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load study materials:', err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  useEffect(() => {
    loadMaterialsData();
  }, []);

  // 2. Load CMS Resources on Demand
  useEffect(() => {
    if (activeTab === 'guidelines' && resources.length === 0) {
      setLoadingResources(true);
      getResources({ status: 'PUBLISHED' })
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setResources(res.data);
          }
        })
        .catch((err) => console.error('Failed to load CMS resources:', err))
        .finally(() => setLoadingResources(false));
    }
  }, [activeTab, resources.length]);

  // Distinct classes from allocations
  const distinctClassesMap = new Map<string, { _id: string; name: string }>();
  facultyAllocs.forEach((a) => {
    if (a.classId) {
      distinctClassesMap.set(a.classId._id, a.classId);
    }
  });
  const distinctClasses = Array.from(distinctClassesMap.values());

  const modalSubjects = facultyAllocs
    .filter((a) => a.classId?._id === modalClassId)
    .map((a) => a.subjectId)
    .filter(Boolean);

  const handleModalClassChange = (cId: string) => {
    setModalClassId(cId);
    const subjs = facultyAllocs.filter((a) => a.classId?._id === cId).map((a) => a.subjectId);
    if (subjs.length > 0 && subjs[0]) {
      setModalSubjectId(subjs[0]._id);
    } else {
      setModalSubjectId('');
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalClassId || !modalSubjectId || !materialTitle || !materialFile) {
      setMaterialError('Please fill all required fields and choose a file to upload.');
      return;
    }

    try {
      setSubmittingMaterial(true);
      setMaterialError(null);

      const formData = new FormData();
      formData.append('title', materialTitle.trim());
      formData.append('classId', modalClassId);
      formData.append('subjectId', modalSubjectId);
      if (materialChapter) formData.append('chapter', materialChapter.trim());
      formData.append('file', materialFile);

      const res = await createStudyMaterial(formData);
      if (res.success) {
        setIsModalOpen(false);
        setMaterialTitle('');
        setMaterialChapter('');
        setMaterialFile(null);
        loadMaterialsData();
      } else {
        setMaterialError(res.message || 'Failed to upload study material');
      }
    } catch (err: any) {
      setMaterialError(err?.response?.data?.message || err.message || 'Failed to upload material');
    } finally {
      setSubmittingMaterial(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this study material?')) return;
    try {
      const res = await deleteStudyMaterial(id);
      if (res.success) {
        setMaterials((prev) => prev.filter((m) => m._id !== id));
      } else {
        alert(res.message || 'Failed to delete material');
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Failed to delete material');
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const q = searchMaterials.toLowerCase();
    const title = (m.title || '').toLowerCase();
    const chap = (m.chapter || '').toLowerCase();
    const matchesSearch = !searchMaterials || title.includes(q) || chap.includes(q);
    const matchesClass = selectedClassFilter === 'ALL' || m.classId?._id === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  const filteredGuidelines = resources.filter((r) => {
    const q = searchGuidelines.toLowerCase();
    return (
      !searchGuidelines ||
      r.title?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/faculty" className="hover:text-[#23804A] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Academic Resources</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#171D19] flex items-center gap-2">
            <FolderOpen className="w-7 h-7 text-[#23804A]" />
            Study Materials & Guidelines
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload course-specific study materials, reference notes, and browse official Markaz academic guidelines.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {activeTab === 'study-materials' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-[#23804A] hover:bg-[#1B6F41] text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Upload Material
            </button>
          )}
          <Link
            href="/faculty"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#23804A] px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex space-x-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('study-materials')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'study-materials'
              ? 'border-[#23804A] text-[#23804A]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Class Study Materials ({materials.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('guidelines')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'guidelines'
              ? 'border-[#23804A] text-[#23804A]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Official Guidelines & Publications</span>
        </button>
      </div>

      {/* Tab 1: Class Study Materials */}
      {activeTab === 'study-materials' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search materials by title or chapter..."
                value={searchMaterials}
                onChange={(e) => setSearchMaterials(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#23804A]"
              />
            </div>

            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[#171D19] focus:outline-hidden focus:border-[#23804A]"
            >
              <option value="ALL">All Assigned Classes ({materials.length})</option>
              {distinctClasses.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {loadingMaterials ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-slate-200/70 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#E3EAE5] space-y-3">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h2 className="text-base font-bold text-slate-700">No Study Materials Uploaded</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No materials have been uploaded for your assigned classes yet. Click &ldquo;Upload Material&rdquo; to share notes and documents with your students.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMaterials.map((mat) => (
                <div
                  key={mat._id}
                  className="bg-white rounded-xl border border-[#E3EAE5] p-5 shadow-2xs hover:border-[#23804A] transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EAF2EC] text-[#23804A]">
                        {mat.classId?.name}
                      </span>
                      <button
                        onClick={() => handleDeleteMaterial(mat._id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete material"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="font-bold text-sm text-[#171D19] line-clamp-1">{mat.title}</h3>
                    <p className="text-xs text-slate-500">
                      Subject: <span className="font-semibold text-slate-700">{mat.subjectId?.name}</span>
                    </p>
                    {mat.chapter && (
                      <p className="text-[11px] text-green-700 font-medium">Chapter: {mat.chapter}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      {new Date(mat.createdAt).toLocaleDateString('en-GB')}
                    </span>
                    <a
                      href={mat.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#23804A] text-white text-xs font-semibold hover:bg-[#1B6F41] transition-all shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Guidelines / CMS Resources */}
      {activeTab === 'guidelines' && (
        <div className="space-y-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search official guidelines and council publications..."
              value={searchGuidelines}
              onChange={(e) => setSearchGuidelines(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#23804A]"
            />
          </div>

          {loadingResources ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-slate-200/70 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredGuidelines.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
              No official publications match your search query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGuidelines.map((res) => (
                <div
                  key={res._id}
                  className="bg-white rounded-xl border border-[#E3EAE5] p-5 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {res.category || 'General'}
                    </span>
                    {res.fileSize && (
                      <span className="text-[10px] font-mono text-slate-400">{res.fileSize}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-[#171D19] line-clamp-1">{res.title}</h3>
                  {res.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{res.description}</p>
                  )}
                  <div className="pt-2 border-t border-slate-100 text-right">
                    {res.fileUrl && (
                      <a
                        href={res.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-50 text-[#23804A] hover:bg-green-100 text-xs font-semibold border border-green-200 transition-all"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> Download
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Material Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base font-serif text-[#171D19] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#23804A]" /> Upload Subject Study Material
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {materialError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {materialError}
              </div>
            )}

            <form onSubmit={handleCreateMaterial} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Class Cohort *
                  </label>
                  <select
                    value={modalClassId}
                    onChange={(e) => handleModalClassChange(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[#171D19] focus:outline-hidden focus:border-[#23804A]"
                  >
                    {distinctClasses.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Subject Module *
                  </label>
                  <select
                    value={modalSubjectId}
                    onChange={(e) => setModalSubjectId(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[#171D19] focus:outline-hidden focus:border-[#23804A]"
                  >
                    {modalSubjects.map((sub: any) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name || sub.subjectName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Material Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Grammar Notes & Commentary"
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#23804A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Chapter / Unit (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unit 3 - Verb Conjugation"
                  value={materialChapter}
                  onChange={(e) => setMaterialChapter(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#23804A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  File Document (PDF, Word, Image) *
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setMaterialFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#EAF2EC] file:text-[#23804A] hover:file:bg-green-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMaterial}
                  className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#23804A] hover:bg-[#1B6F41] text-white text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  {submittingMaterial ? 'Uploading...' : 'Upload & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
