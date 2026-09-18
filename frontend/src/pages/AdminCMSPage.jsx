import React, { useState, useEffect } from 'react';
import { FileText, Download, MessageSquare, Plus, RefreshCw, AlertCircle, Edit3, Trash2, CheckCircle, X } from 'lucide-react';
import StatusBadge from '../components/admin/StatusBadge';
import {
  getArticles, createArticle, updateArticle, deleteArticle,
  getResources, createResource, updateResource, deleteResource,
  getEnquiries, updateEnquiryStatus
} from '../services/cmsService';

export const AdminCMSPage = () => {
  const [activeTab, setActiveTab] = useState('articles');

  // Data
  const [articles, setArticles] = useState([]);
  const [resources, setResources] = useState([]);
  const [enquiries, setEnquiries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals & Delete Confirmation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchCMSData = async () => {
    setLoading(true);
    setError('');
    try {
      const [artRes, resRes, enqRes] = await Promise.all([
        getArticles().catch(() => ({ data: [] })),
        getResources().catch(() => ({ data: [] })),
        getEnquiries().catch(() => ({ data: [] })),
      ]);

      setArticles(artRes.data || []);
      setResources(resRes.data || []);
      setEnquiries(enqRes.data || []);
    } catch (err) {
      console.error('Failed to load CMS data:', err);
      setError('Failed to retrieve CMS content records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCMSData();
  }, []);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setFormError('');

    if (activeTab === 'articles') {
      setFormData({
        title: item?.title || '',
        slug: item?.slug || '',
        category: item?.category || 'NEWS',
        excerpt: item?.excerpt || '',
        content: item?.content || '',
        isPublished: item?.isPublished || true,
      });
    } else if (activeTab === 'resources') {
      setFormData({
        title: item?.title || '',
        category: item?.category || 'SYLLABUS',
        fileUrl: item?.fileUrl || '',
        fileType: item?.fileType || 'PDF',
        targetAudience: item?.targetAudience || 'ALL',
        isPublic: item?.isPublic !== false,
      });
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (activeTab === 'articles') {
        if (editingItem) await updateArticle(editingItem._id, formData);
        else await createArticle(formData);
      } else if (activeTab === 'resources') {
        if (editingItem) await updateResource(editingItem._id, formData);
        else await createResource(formData);
      }

      setFormLoading(false);
      setIsModalOpen(false);
      fetchCMSData();
    } catch (err) {
      setFormLoading(false);
      setFormError(err.response?.data?.message || 'Failed to save record.');
    }
  };

  const handleDelete = async (id) => {
    try {
      if (activeTab === 'articles') {
        await deleteArticle(id);
      } else if (activeTab === 'resources') {
        await deleteResource(id);
      }
      setDeleteConfirmId(null);
      fetchCMSData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item.');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateEnquiryStatus(id, status);
      fetchCMSData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#132238]">Content & Communications</h1>
          <p className="text-sm text-slate-500 mt-1">Manage portal articles, downloadable resources, and public enquiries</p>
        </div>
        {activeTab !== 'enquiries' && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361]"
          >
            <Plus className="w-4 h-4 mr-2" /> Add {activeTab === 'articles' ? 'Article' : 'Resource'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-[#E2E8E0] pb-1">
        {[
          { id: 'articles', label: 'News & Articles', icon: FileText, count: articles.length },
          { id: 'resources', label: 'Download Resources', icon: Download, count: resources.length },
          { id: 'enquiries', label: 'Enquiries & Messages', icon: MessageSquare, count: enquiries.length },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-[#2F7C7A] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#E2E8E0]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading CMS records...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button onClick={fetchCMSData} className="px-4 py-2 bg-[#2F7C7A] text-white font-bold text-xs rounded-lg uppercase">
              <RefreshCw className="w-4 h-4 mr-2 inline" /> Retry
            </button>
          </div>
        ) : activeTab === 'articles' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-4">Title / Excerpt</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Publish State</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {articles.map((art) => (
                  <tr key={art._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#132238]">{art.title}</p>
                      <p className="text-xs text-slate-400 max-w-sm truncate">{art.excerpt || art.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-full border">{art.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      {art.isPublished ? (
                        <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">PUBLISHED</span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">DRAFT</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(art.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenModal(art)} className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
                      </button>
                      <button onClick={() => setDeleteConfirmId(art._id)} className="px-3 py-1.5 border border-rose-200 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-50">
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'resources' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-4">Resource Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">File Type</th>
                  <th className="px-6 py-4">Audience</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {resources.map((res) => (
                  <tr key={res._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#132238]">{res.title}</p>
                      <p className="text-xs text-blue-600 font-mono truncate max-w-xs">{res.fileUrl}</p>
                    </td>
                    <td className="px-6 py-4"><span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-full border">{res.category}</span></td>
                    <td className="px-6 py-4 font-mono text-xs uppercase text-slate-700">{res.fileType || 'PDF'}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">{res.targetAudience || 'ALL'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenModal(res)} className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
                      </button>
                      <button onClick={() => setDeleteConfirmId(res._id)} className="px-3 py-1.5 border border-rose-200 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-50">
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-4">Sender Details</th>
                  <th className="px-6 py-4">Subject & Message</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {enquiries.map((enq) => (
                  <tr key={enq._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-[#132238]">
                      {enq.name}
                      <p className="text-xs text-slate-400 font-normal">{enq.email} | {enq.phone || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{enq.subject}</p>
                      <p className="text-xs text-slate-600 max-w-sm line-clamp-2">{enq.message}</p>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={enq.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq._id, e.target.value)}
                        className="px-2 py-1 text-xs border rounded-lg bg-white"
                      >
                        <option value="NEW">NEW</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-slate-500">Are you sure you want to permanently remove this record? This action cannot be undone.</p>
            <div className="flex justify-center space-x-3 pt-2">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 border rounded-lg text-xs font-bold text-slate-700">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold uppercase">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-[#E2E8E0] p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#132238]">{editingItem ? 'Edit' : 'Create'} {activeTab === 'articles' ? 'Article' : 'Resource'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            {formError && <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded">{formError}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {activeTab === 'articles' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Title *</label>
                    <input type="text" required value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Slug</label>
                    <input type="text" value={formData.slug || ''} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="auto-generated-if-empty" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Category</label>
                    <select value={formData.category || 'NEWS'} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                      <option value="NEWS">NEWS</option>
                      <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
                      <option value="ARTICLE">ARTICLE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Excerpt</label>
                    <textarea value={formData.excerpt || ''} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} rows="2" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Content *</label>
                    <textarea required value={formData.content || ''} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows="4" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="isPublished" checked={formData.isPublished || false} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} />
                    <label htmlFor="isPublished" className="text-xs font-bold uppercase">Publish Immediately</label>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Title *</label>
                    <input type="text" required value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">File URL *</label>
                    <input type="text" required value={formData.fileUrl || ''} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} placeholder="https://downloads.misc.markaz.in/resources/file.pdf" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Category</label>
                      <select value={formData.category || 'SYLLABUS'} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                        <option value="SYLLABUS">SYLLABUS</option>
                        <option value="CIRCULAR">CIRCULAR</option>
                        <option value="MODEL_PAPER">MODEL PAPER</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Target Audience</label>
                      <select value={formData.targetAudience || 'ALL'} onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                        <option value="ALL">ALL</option>
                        <option value="STUDENTS">STUDENTS</option>
                        <option value="FACULTY">FACULTY</option>
                        <option value="INSTITUTIONS">INSTITUTIONS</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-xs font-bold">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-5 py-2 bg-[#2F7C7A] text-white rounded-lg text-xs font-bold uppercase">
                  {formLoading ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCMSPage;
