import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  Wrench, 
  Zap, 
  Sparkles, 
  MoreHorizontal, 
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  MessageSquare
} from 'lucide-react';
import SectionCard from '../../features/ui/SectionCard';
import { useComplaints } from '../../hooks/queries/useComplaints';
import { useUpdateComplaintStatus } from '../../hooks/mutations/useComplaintMutations';

const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case 'electrical': return <Zap className="w-4 h-4 text-amber-500" />;
    case 'plumbing': return <Wrench className="w-4 h-4 text-blue-500" />;
    case 'cleaning': return <Sparkles className="w-4 h-4 text-emerald-500" />;
    default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
  }
};

const getPriorityDetails = (priority) => {
  switch (priority) {
    case 'High': return { icon: ArrowUpRight, color: 'text-rose-500', bg: 'bg-rose-500/10' };
    case 'Medium': return { icon: ArrowRight, color: 'text-amber-500', bg: 'bg-amber-500/10' };
    case 'Low': return { icon: ArrowDownRight, color: 'text-sky-500', bg: 'bg-sky-500/10' };
    default: return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-500/10' };
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'Open':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"><AlertCircle className="w-3 h-3" /> Open</span>;
    case 'Assigned':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"><Clock className="w-3 h-3" /> Assigned</span>;
    case 'In Progress':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"><Clock className="w-3 h-3" /> In Progress</span>;
    case 'Resolved':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> Resolved</span>;
    default:
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">{status}</span>;
  }
};

export const ComplaintManagement = () => {
  const [filterStatus, setFilterStatus] = useState('All');
  
  const { data: complaints = [] } = useComplaints(filterStatus);
  const updateStatusMutation = useUpdateComplaintStatus();

  const handleUpdateStatus = (id, status) => {
    updateStatusMutation.mutate({ id, status });
  };

  const filteredComplaints = complaints; // Filter is already applied by the backend API

  const filterTabs = ['All', 'Open', 'Assigned', 'In Progress', 'Resolved'];

  const filterSelect = (
    <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
      {filterTabs.map(tab => (
        <button
          key={tab}
          onClick={() => setFilterStatus(tab)}
          className={`relative px-4 py-1.5 text-[13px] font-bold rounded-lg transition-all duration-200 ease-out-expo ${
            filterStatus === tab 
              ? 'text-zinc-900 dark:text-zinc-50 shadow-sm' 
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
          }`}
        >
          {filterStatus === tab && (
            <motion.div 
              layoutId="complaint-filter-bg"
              className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-lg border border-black/5 dark:border-white/5"
              initial={false}
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            />
          )}
          <span className="relative z-10">{tab}</span>
        </button>
      ))}
    </div>
  );

  return (
    <SectionCard 
      title="Complaint Management" 
      subtitle="View and manage reported issues" 
      action={filterSelect}
    >
      <div className="w-full">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 shadow-sm">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest w-24">Room</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Priority</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Reporter</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <AnimatePresence mode="popLayout">
                {filteredComplaints.length === 0 ? (
                  <motion.tr 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan="6">
                      <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center mb-4">
                          <MessageSquare className="w-5 h-5 text-zinc-400" />
                        </div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">No complaints</h3>
                        <p className="text-[13px] text-zinc-500 mt-1">There are no {filterStatus !== 'All' ? filterStatus.toLowerCase() : ''} complaints right now.</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  filteredComplaints.map((complaint) => {
                    const Prio = getPriorityDetails(complaint.priority);
                    return (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        key={complaint.id} 
                        className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 text-[13px] font-black text-zinc-900 dark:text-zinc-50">
                            {complaint.roomid?.roomNumber || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center">
                              {getCategoryIcon(complaint.category)}
                            </div>
                            <div>
                              <p className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50">{complaint.category}</p>
                              <p className="text-[11px] font-medium text-zinc-500 line-clamp-1">{complaint.description || 'Routine issue reported'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${Prio.bg}`}>
                              <Prio.icon className={`w-3.5 h-3.5 ${Prio.color}`} />
                            </div>
                            <span className="text-[13px] font-bold text-zinc-700 dark:text-zinc-400">{complaint.intensity}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(complaint.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                              {complaint.roll_number.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <p className="text-[12px] font-medium text-zinc-900 dark:text-zinc-50 leading-tight truncate">
                                Room {complaint.roomid?.roomNumber || 'N/A'} • {complaint.roll_number}
                              </p>
                              <span className="text-[11px] text-zinc-500">
                                {new Date(complaint.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 transition-opacity">
                            {complaint.status === 'Open' && (
                              <button 
                                onClick={() => handleUpdateStatus(complaint._id, 'In Progress')}
                                disabled={updateStatusMutation.isPending}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm disabled:opacity-50"
                              >
                                In Progress
                              </button>
                            )}
                            {complaint.status === 'In Progress' && (
                              <button 
                                onClick={() => handleUpdateStatus(complaint._id, 'Resolved')}
                                disabled={updateStatusMutation.isPending}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm disabled:opacity-50"
                              >
                                Resolve
                              </button>
                            )}
                            <button className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredComplaints.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 px-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center mb-4">
                  <MessageSquare className="w-5 h-5 text-zinc-400" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">No complaints</h3>
                <p className="text-[13px] text-zinc-500 mt-1">There are no {filterStatus !== 'All' ? filterStatus.toLowerCase() : ''} complaints right now.</p>
              </motion.div>
            ) : (
              filteredComplaints.map((complaint) => {
                const Prio = getPriorityDetails(complaint.priority);
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={complaint.id} 
                    className="flex flex-col gap-3 p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 text-[12px] font-black text-zinc-900 dark:text-zinc-50">
                          {complaint.roomid?.roomNumber || 'N/A'}
                        </div>
                        {getStatusBadge(complaint.status)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Prio.icon className={`w-3.5 h-3.5 ${Prio.color}`} />
                        <span className="text-[12px] font-bold text-zinc-700 dark:text-zinc-400">{complaint.intensity}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center shrink-0">
                        {getCategoryIcon(complaint.category)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{complaint.category}</p>
                        <p className="text-[13px] font-medium text-zinc-500">{complaint.description || 'Routine issue reported'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800 mt-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                          {complaint.roll_number.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold text-zinc-900 dark:text-zinc-50">{complaint.roll_number}</span>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(complaint.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      
                      {complaint.status === 'Open' && (
                        <button 
                          onClick={() => handleUpdateStatus(complaint._id, 'In Progress')}
                          disabled={updateStatusMutation.isPending}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm disabled:opacity-50"
                        >
                          In Progress
                        </button>
                      )}
                      {complaint.status === 'In Progress' && (
                        <button 
                          onClick={() => handleUpdateStatus(complaint._id, 'Resolved')}
                          disabled={updateStatusMutation.isPending}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm disabled:opacity-50"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </SectionCard>
  );
};
