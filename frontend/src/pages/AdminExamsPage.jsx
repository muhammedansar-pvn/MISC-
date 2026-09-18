import React, { useState, useEffect } from 'react';
import { FileCheck, Calendar, Users, Award, Plus, RefreshCw, AlertCircle, Edit3, CheckCircle, X } from 'lucide-react';
import StatusBadge from '../components/admin/StatusBadge';
import {
  getExams, createExam, updateExam,
  getExamSchedules, createExamSchedule, updateExamSchedule,
  getExamRegistrations, updateExamRegistrationStatus,
  getMarkEntries, submitMarkEntry, verifyMarkEntries
} from '../services/examService';

export const AdminExamsPage = () => {
  const [activeTab, setActiveTab] = useState('exams');

  const [exams, setExams] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [markEntries, setMarkEntries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals & Mark Verification
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchExamData = async () => {
    setLoading(true);
    setError('');
    try {
      const [exRes, schRes, regRes, markRes] = await Promise.all([
        getExams().catch(() => ({ data: [] })),
        getExamSchedules().catch(() => ({ data: [] })),
        getExamRegistrations().catch(() => ({ data: [] })),
        getMarkEntries().catch(() => ({ data: [] })),
      ]);

      setExams(exRes.data || []);
      setSchedules(schRes.data || []);
      setRegistrations(regRes.data || []);
      setMarkEntries(markRes.data || []);
    } catch (err) {
      console.error('Failed to load examination datasets:', err);
      setError('Failed to retrieve examination management records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamData();
  }, []);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setFormError('');

    if (activeTab === 'exams') {
      setFormData({
        name: item?.name || '',
        code: item?.code || '',
        academicYearId: item?.academicYearId?._id || item?.academicYearId || '',
        term: item?.term || 'FIRST_TERM',
        examType: item?.examType || 'ANNUAL',
        status: item?.status || 'SCHEDULED',
      });
    } else if (activeTab === 'schedules') {
      setFormData({
        examId: item?.examId?._id || item?.examId || '',
        classId: item?.classId?._id || item?.classId || '',
        subjectId: item?.subjectId?._id || item?.subjectId || '',
        examDate: item?.examDate ? new Date(item.examDate).toISOString().split('T')[0] : '',
        startTime: item?.startTime || '09:30',
        endTime: item?.endTime || '12:30',
        maxMarks: item?.maxMarks || 100,
        passMarks: item?.passMarks || 40,
        status: item?.status || 'SCHEDULED',
      });
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (activeTab === 'exams') {
        if (editingItem) await updateExam(editingItem._id, formData);
        else await createExam(formData);
      } else if (activeTab === 'schedules') {
        if (editingItem) await updateExamSchedule(editingItem._id, formData);
        else await createExamSchedule(formData);
      }

      setFormLoading(false);
      setIsModalOpen(false);
      fetchExamData();
    } catch (err) {
      setFormLoading(false);
      setFormError(err.response?.data?.message || 'Failed to save examination record.');
    }
  };

  const handleVerifyMarks = async (examScheduleId) => {
    try {
      await verifyMarkEntries(examScheduleId);
      alert('Mark entries verified successfully.');
      fetchExamData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify mark entries.');
    }
  };

  const handleIssueHallTicket = async (regId) => {
    try {
      await updateExamRegistrationStatus(regId, 'HALL_TICKET_ISSUED');
      fetchExamData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update registration status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8E0] shadow-xs">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#132238]">Examination Management</h1>
          <p className="text-sm text-slate-500 mt-1">Configure exams, timetables, hall tickets, mark submissions & verification</p>
        </div>
        {(activeTab === 'exams' || activeTab === 'schedules') && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-[#2F7C7A] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#256361]"
          >
            <Plus className="w-4 h-4 mr-2" /> Add {activeTab === 'exams' ? 'Exam' : 'Schedule'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-[#E2E8E0] pb-1 overflow-x-auto">
        {[
          { id: 'exams', label: 'Exams', icon: FileCheck, count: exams.length },
          { id: 'schedules', label: 'Exam Schedules', icon: Calendar, count: schedules.length },
          { id: 'registrations', label: 'Registrations', icon: Users, count: registrations.length },
          { id: 'mark-entries', label: 'Mark Verification', icon: Award, count: markEntries.length },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
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

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8E0] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading examination data...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button onClick={fetchExamData} className="px-4 py-2 bg-[#2F7C7A] text-white font-bold text-xs rounded-lg uppercase">
              <RefreshCw className="w-4 h-4 mr-2 inline" /> Retry
            </button>
          </div>
        ) : activeTab === 'exams' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-4">Exam Name</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Term</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {exams.map((ex) => (
                  <tr key={ex._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-[#132238]">{ex.name}</td>
                    <td className="px-6 py-4 font-mono text-slate-600">{ex.code}</td>
                    <td className="px-6 py-4 text-xs text-slate-700">{ex.term}</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-full border">{ex.examType}</span></td>
                    <td className="px-6 py-4"><StatusBadge status={ex.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenModal(ex)} className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'schedules' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-4">Exam / Subject</th>
                  <th className="px-6 py-4">Exam Date</th>
                  <th className="px-6 py-4">Timing</th>
                  <th className="px-6 py-4">Max / Pass Marks</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {schedules.map((sch) => (
                  <tr key={sch._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#132238]">{sch.examId?.name || 'Exam Record'}</p>
                      <p className="text-xs text-slate-500">{sch.subjectId?.name || 'Subject N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700">{new Date(sch.examDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600">{sch.startTime} - {sch.endTime}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{sch.maxMarks} / {sch.passMarks}</td>
                    <td className="px-6 py-4"><StatusBadge status={sch.status} /></td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenModal(sch)} className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
                      </button>
                      <button onClick={() => handleVerifyMarks(sch._id)} className="px-3 py-1.5 bg-[#2F7C7A] text-white rounded-lg text-xs font-semibold hover:bg-[#256361]">
                        <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> Verify Marks
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'registrations' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F8F5] text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Exam</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Hall Ticket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {registrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-[#132238]">{reg.studentId?.name || reg.name || 'Student Record'}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{reg.examId?.name || 'Exam'}</td>
                    <td className="px-6 py-4"><StatusBadge status={reg.registrationStatus} /></td>
                    <td className="px-6 py-4 text-right">
                      {reg.registrationStatus !== 'HALL_TICKET_ISSUED' && (
                        <button onClick={() => handleIssueHallTicket(reg._id)} className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold">
                          Issue Hall Ticket
                        </button>
                      )}
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
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Marks Obtained</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Verified By Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E0]">
                {markEntries.map((mk) => (
                  <tr key={mk._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-[#132238]">{mk.studentId?.name || 'Student Record'}</td>
                    <td className="px-6 py-4 font-bold text-emerald-700">{mk.marksObtained}</td>
                    <td className="px-6 py-4"><StatusBadge status={mk.status} /></td>
                    <td className="px-6 py-4 text-xs font-semibold">{mk.verifiedBy ? 'VERIFIED' : 'PENDING VERIFICATION'}</td>
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
              <h3 className="text-lg font-bold text-[#132238]">{editingItem ? 'Edit' : 'Create'} {activeTab === 'exams' ? 'Exam' : 'Exam Schedule'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            {formError && <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded">{formError}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {activeTab === 'exams' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Exam Name *</label>
                    <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Annual Degree Exam 2026" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Exam Code *</label>
                    <input type="text" required value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="EXAM-2026-ANNUAL" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Term</label>
                      <select value={formData.term || 'FIRST_TERM'} onChange={(e) => setFormData({ ...formData, term: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                        <option value="FIRST_TERM">FIRST TERM</option>
                        <option value="MID_TERM">MID TERM</option>
                        <option value="FINAL_TERM">FINAL TERM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Exam Type</label>
                      <select value={formData.examType || 'ANNUAL'} onChange={(e) => setFormData({ ...formData, examType: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                        <option value="ANNUAL">ANNUAL</option>
                        <option value="SEMESTER">SEMESTER</option>
                        <option value="SUPPLEMENTARY">SUPPLEMENTARY</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Exam Date *</label>
                    <input type="date" required value={formData.examDate || ''} onChange={(e) => setFormData({ ...formData, examDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Start Time</label>
                      <input type="text" value={formData.startTime || '09:30'} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">End Time</label>
                      <input type="text" value={formData.endTime || '12:30'} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Max Marks *</label>
                      <input type="number" required value={formData.maxMarks || 100} onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Pass Marks *</label>
                      <input type="number" required value={formData.passMarks || 40} onChange={(e) => setFormData({ ...formData, passMarks: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
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

export default AdminExamsPage;
