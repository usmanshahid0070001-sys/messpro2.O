import React, { useState } from 'react';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';

const priorityToneMap = {
  High: 'danger',
  Medium: 'warning',
  Low: 'info'
};

const statusToneMap = {
  'Open': 'neutral',
  'Assigned': 'info',
  'In Progress': 'warning',
  'Resolved': 'success'
};

export const ComplaintManagement = ({ complaints, onUpdateStatus }) => {
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredComplaints = filterStatus === 'All' 
    ? complaints 
    : complaints.filter(c => c.status === filterStatus);

  const filterSelect = (
    <select 
      className="text-sm bg-transparent border border-gray-200 dark:border-[#333333] text-[#111111] dark:text-white rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 px-3 py-1.5"
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
    >
      <option value="All">All Statuses</option>
      <option value="Open">Open</option>
      <option value="Assigned">Assigned</option>
      <option value="In Progress">In Progress</option>
      <option value="Resolved">Resolved</option>
    </select>
  );

  return (
    <SectionCard 
      title="Complaint Management" 
      subtitle="View and manage reported issues" 
      action={filterSelect}
    >
      <div className="overflow-x-auto w-full border border-[#e0e0e0] dark:border-[#222222] rounded-lg">
        <table className="min-w-full divide-y divide-[#e0e0e0] dark:divide-[#222222] text-sm">
          <thead className="bg-[#f5f5f5]/50 dark:bg-[#1a1a1a]/50">
            <tr>
              <th className="px-6 py-4 text-left font-black text-[#737373] dark:text-[#888888] uppercase tracking-wider text-[11px]">Room #</th>
              <th className="px-6 py-4 text-left font-black text-[#737373] dark:text-[#888888] uppercase tracking-wider text-[11px]">Category</th>
              <th className="px-6 py-4 text-left font-black text-[#737373] dark:text-[#888888] uppercase tracking-wider text-[11px]">Priority</th>
              <th className="px-6 py-4 text-left font-black text-[#737373] dark:text-[#888888] uppercase tracking-wider text-[11px]">Status</th>
              <th className="px-6 py-4 text-left font-black text-[#737373] dark:text-[#888888] uppercase tracking-wider text-[11px]">Raised By</th>
              <th className="px-6 py-4 text-left font-black text-[#737373] dark:text-[#888888] uppercase tracking-wider text-[11px]">Date Raised</th>
              <th className="px-6 py-4 text-right font-black text-[#737373] dark:text-[#888888] uppercase tracking-wider text-[11px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e0e0e0] dark:divide-[#222222]">
            {filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-[#737373] dark:text-[#888888] font-medium">
                  No complaints found.
                </td>
              </tr>
            ) : (
              filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-[#f5f5f5]/30 dark:hover:bg-[#1a1a1a]/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-[#111111] dark:text-white">{complaint.roomId}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-[#404040] dark:text-[#a3a3a3]">{complaint.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge tone={priorityToneMap[complaint.priority] || 'neutral'}>
                      {complaint.priority}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge tone={statusToneMap[complaint.status] || 'neutral'}>
                      {complaint.status}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-[#404040] dark:text-[#a3a3a3]">{complaint.raisedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-[#737373] dark:text-[#888888]">
                    {new Date(complaint.dateRaised).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-sm">
                    {complaint.status !== 'Resolved' ? (
                      <button 
                        onClick={() => onUpdateStatus(complaint.id, 'Resolved')}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors px-2 py-1 rounded"
                      >
                        Resolve
                      </button>
                    ) : (
                      <span className="text-[#737373] dark:text-[#555555]">Done</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
};
