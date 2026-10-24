import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { complaintService } from '../../services/complaintService';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge';
import { Search, Eye, ChevronLeft, ChevronRight, CheckCircle, XCircle, UserCheck } from 'lucide-react';

const statusColors = {
  'Pending': 'warning', 'Assigned': 'info', 'In Progress': 'info',
  'Resolved': 'success', 'Rejected': 'destructive', 'Closed': 'default'
};

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [showAssign, setShowAssign] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [assignForm, setAssignForm] = useState({ assignedEngineer: '', estimatedResolutionDate: '', remarks: '' });
  const [updateForm, setUpdateForm] = useState({ status: '', engineerNotes: '', adminRemarks: '' });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 10 };
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        if (priorityFilter) params.priority = priorityFilter;
        const res = await complaintService.getAll(params);
        setComplaints(res.data.data);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, search, statusFilter, priorityFilter]);

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await complaintService.assign(selected._id, assignForm);
      toast.success('Complaint assigned successfully');
      setShowAssign(false);
      setSelected(null);
      setAssignForm({ assignedEngineer: '', estimatedResolutionDate: '', remarks: '' });
      const res = await complaintService.getAll({ page, limit: 10 });
      setComplaints(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await complaintService.updateStatus(selected._id, updateForm);
      toast.success('Complaint updated successfully');
      setShowUpdate(false);
      setSelected(null);
      setUpdateForm({ status: '', engineerNotes: '', adminRemarks: '' });
      const res = await complaintService.getAll({ page, limit: 10 });
      setComplaints(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Complaint Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">View, assign, and manage all complaints</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by token, title, or employee..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary">
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
            <option value="Closed">Closed</option>
          </select>
          <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary">
            <option value="">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Token</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Engineer</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : complaints.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No complaints found</td></tr>
              ) : complaints.map((c, i) => (
                <motion.tr key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-sm font-mono text-primary">{c.token}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{c.employeeName}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white max-w-[150px] truncate">{c.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{c.category}</td>
                  <td className="px-4 py-3"><Badge variant={c.priority === 'High' ? 'destructive' : c.priority === 'Medium' ? 'warning' : 'default'}>{c.priority}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={statusColors[c.status]}>{c.status}</Badge></td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{c.assignedEngineer || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setSelected(c); setShowAssign(true); }} className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Assign"><UserCheck className="w-4 h-4" /></button>
                      <button onClick={() => { setSelected(c); setShowUpdate(true); }} className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Update Status"><CheckCircle className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"><ChevronLeft className="w-4 h-4" /> Previous</button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50">Next <ChevronRight className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      {showAssign && selected && (
        <Modal title="Assign Complaint" onClose={() => setShowAssign(false)}>
          <form onSubmit={handleAssign} className="space-y-4">
            <p className="text-sm text-gray-500">Token: <span className="font-mono text-primary">{selected.token}</span></p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Engineer Name *</label>
              <input type="text" value={assignForm.assignedEngineer} onChange={(e) => setAssignForm({ ...assignForm, assignedEngineer: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Resolution Date</label>
              <input type="date" value={assignForm.estimatedResolutionDate} onChange={(e) => setAssignForm({ ...assignForm, estimatedResolutionDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
              <textarea value={assignForm.remarks} onChange={(e) => setAssignForm({ ...assignForm, remarks: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none resize-none" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button type="button" onClick={() => setShowAssign(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">Assign</button>
            </div>
          </form>
        </Modal>
      )}

      {showUpdate && selected && (
        <Modal title="Update Complaint Status" onClose={() => setShowUpdate(false)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <p className="text-sm text-gray-500">Token: <span className="font-mono text-primary">{selected.token}</span> | Current: <Badge variant={statusColors[selected.status]}>{selected.status}</Badge></p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Status *</label>
              <select value={updateForm.status} onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none" required>
                <option value="">Select status</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Engineer Notes</label>
              <textarea value={updateForm.engineerNotes} onChange={(e) => setUpdateForm({ ...updateForm, engineerNotes: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Remarks</label>
              <textarea value={updateForm.adminRemarks} onChange={(e) => setUpdateForm({ ...updateForm, adminRemarks: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none resize-none" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button type="button" onClick={() => setShowUpdate(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">Update</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><XCircle className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}
