import React, { useState, useEffect } from 'react';
import { Calendar, Users, Plus, RefreshCw, AlertCircle, Edit3, X } from 'lucide-react';
import StatusBadge from '../components/admin/StatusBadge';
import { getEvents, createEvent, updateEvent, getEventRegistrations } from '../services/eventService';

export const AdminEventsPage = () => {
  const [activeTab, setActiveTab] = useState('events');

  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchEventsData = async () => {
    setLoading(true);
    setError('');
    try {
      const [evtRes, regRes] = await Promise.all([
        getEvents().catch(() => ({ data: [] })),
        getEventRegistrations().catch(() => ({ data: [] })),
      ]);

      setEvents(evtRes.data || []);
      setRegistrations(regRes.data || []);
    } catch (err) {
      console.error('Failed to load event data:', err);
      setError('Failed to retrieve event records from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData();
  }, []);

  const handleOpenModal = (evt = null) => {
    if (evt) {
      setEditingEvent(evt);
      setFormData({
        title: evt.title || '',
        slug: evt.slug || '',
        eventType: evt.eventType || 'ACADEMIC',
        startDate: evt.startDate ? new Date(evt.startDate).toISOString().split('T')[0] : '',
        endDate: evt.endDate ? new Date(evt.endDate).toISOString().split('T')[0] : '',
        venue: evt.venue || '',
        description: evt.description || '',
        registrationRequired: evt.registrationRequired !== false,
        maxParticipants: evt.maxParticipants || 100,
        status: evt.status || 'UPCOMING',
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        slug: '',
        eventType: 'ACADEMIC',
        startDate: '',
        endDate: '',
        venue: 'Main Auditorium, Markaz Knowledge City',
        description: '',
        registrationRequired: true,
        maxParticipants: 100,
        status: 'UPCOMING',
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (editingEvent) {
        await updateEvent(editingEvent._id, formData);
      } else {
        await createEvent(formData);
      }
      setFormLoading(false);
      setIsModalOpen(false);
      fetchEventsData();
    } catch (err) {
      setFormLoading(false);
      setFormError(err.response?.data?.message || 'Failed to save event record.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#132238]">Events & Registrations</h1>
          <p className="text-sm text-slate-500 mt-1">Organize institutional events, conferences, and track registrations</p>
        </div>
        {activeTab === 'events' && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361]"
          >
            <Plus className="w-4 h-4 mr-2" /> Create New Event
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-[#E2E8E0] pb-1">
        {[
          { id: 'events', label: 'All Events', icon: Calendar, count: events.length },
          { id: 'registrations', label: 'Event Registrations', icon: Users, count: registrations.length },
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

      {/* Content Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading events data...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button onClick={fetchEventsData} className="px-4 py-2 bg-[#2F7C7A] text-white font-bold text-xs rounded-lg uppercase">
              <RefreshCw className="w-4 h-4 mr-2 inline" /> Retry
            </button>
          </div>
        ) : activeTab === 'events' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#E2E8E0]">
                <tr>
                  <th className="px-6 py-4">Event Title</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Venue</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {events.map((evt) => (
                  <tr key={evt._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#132238]">{evt.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-full border">{evt.eventType}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {new Date(evt.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">{evt.venue || 'N/A'}</td>
                    <td className="px-6 py-4"><StatusBadge status={evt.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenModal(evt)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
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
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#E2E8E0]">
                <tr>
                  <th className="px-6 py-4">Participant Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Event Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {registrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#132238]">{reg.participantName || reg.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600">{reg.participantEmail || reg.email}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{reg.eventId?.title || 'Event Record'}</td>
                    <td className="px-6 py-4"><StatusBadge status={reg.registrationStatus || 'CONFIRMED'} /></td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(reg.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-[#E2E8E0] p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#132238]">{editingEvent ? 'Edit Event' : 'Create Event'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            {formError && <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded">{formError}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Event Title *</label>
                <input type="text" required value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Event Type *</label>
                  <select value={formData.eventType || 'ACADEMIC'} onChange={(e) => setFormData({ ...formData, eventType: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                    <option value="ACADEMIC">ACADEMIC</option>
                    <option value="CULTURAL">CULTURAL</option>
                    <option value="SEMINAR">SEMINAR</option>
                    <option value="CONVOCATION">CONVOCATION</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Status</label>
                  <select value={formData.status || 'UPCOMING'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Start Date *</label>
                  <input type="date" required value={formData.startDate || ''} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">End Date *</label>
                  <input type="date" required value={formData.endDate || ''} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Venue *</label>
                <input type="text" required value={formData.venue || ''} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Description</label>
                <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="2" className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-xs font-bold">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-5 py-2 bg-[#2F7C7A] text-white rounded-lg text-xs font-bold uppercase">
                  {formLoading ? 'Saving...' : editingEvent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventsPage;
