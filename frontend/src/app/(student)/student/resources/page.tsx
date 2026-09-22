'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getResources } from '@/services/cms.service';
import { DownloadResource } from '@/types';
import {
  FileText,
  Download,
  Search,
  Filter,
  ExternalLink,
  BookOpen,
  FileCheck,
  Tag,
} from 'lucide-react';

export default function StudentResourcesPage() {
  const [resources, setResources] = useState<DownloadResource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadResources() {
      try {
        setLoading(true);
        const res = await getResources({ status: 'PUBLISHED' });
        if (res.success && Array.isArray(res.data)) {
          setResources(res.data);
        }
      } catch (err) {
        console.error('Failed to load student resources:', err);
      } finally {
        setLoading(false);
      }
    }

    loadResources();
  }, []);

  const categories = ['ALL', 'ACADEMIC', 'EXAMINATION', 'SYLLABUS', 'GUIDELINES', 'GENERAL'];

  const filteredResources = resources.filter((res) => {
    const matchesCategory =
      selectedCategory === 'ALL' ||
      res.category?.toUpperCase() === selectedCategory.toUpperCase();
    const matchesSearch =
      !searchQuery ||
      res.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-14 bg-slate-200/70 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-slate-200/70 animate-pulse rounded-xl" />
          ))}
        </div>
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
            <span className="text-slate-900 font-semibold">Academic Resources</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#132238]">
            Study Materials & Downloads
          </h1>
        </div>

        <span className="text-xs font-bold text-slate-500 bg-white px-3.5 py-2 rounded-lg border border-[#E2E8E0] self-start sm:self-auto">
          {resources.length} Published Documents
        </span>
      </div>

      {/* Filter and Search */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#2F7C7A] text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search study materials, guidelines, and reference sheets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#2F7C7A]"
          />
        </div>
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E2E8E0] space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No resources found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No published download materials match your selected criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => (
            <div
              key={res._id}
              className="bg-white rounded-xl border border-[#E2E8E0] p-5 shadow-2xs hover:border-[#2F7C7A] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E6F2F1] text-[#2F7C7A]">
                    {res.category || 'General'}
                  </span>
                  {res.fileSize && (
                    <span className="text-[11px] font-mono text-slate-400">{res.fileSize}</span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-[#132238] line-clamp-1">{res.title}</h3>
                {res.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {res.createdAt ? new Date(res.createdAt).toLocaleDateString('en-GB') : 'Verified'}
                </span>
                {res.fileUrl ? (
                  <a
                    href={res.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#2F7C7A] text-white text-xs font-semibold hover:bg-[#286b69] transition-all shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">Available in Library</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
