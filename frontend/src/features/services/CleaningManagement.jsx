import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  CalendarDays, 
  UserCircle2, 
  ChevronDown, 
  AlertTriangle,
  History,
  Clock,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight
} from 'lucide-react';
import SectionCard from '../../components/ui/SectionCard';

const getPriorityDetails = (priority) => {
  switch (priority) {
    case 'High': return { icon: ArrowUpRight, color: 'text-rose-500', bg: 'bg-rose-500/10' };
    case 'Medium': return { icon: ArrowRight, color: 'text-amber-500', bg: 'bg-amber-500/10' };
    case 'Low': return { icon: ArrowDownRight, color: 'text-sky-500', bg: 'bg-sky-500/10' };
    default: return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-500/10' };
  }
};

const CleaningCard = ({ room, cleaningLogs, activeComplaints }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const sortedLogs = [...cleaningLogs].sort((a, b) => new Date(b.cleanedAt) - new Date(a.cleanedAt));
  const lastClean = sortedLogs[0];
  
  const isOverdue = lastClean 
    ? (new Date() - new Date(lastClean.cleanedAt)) / (1000 * 60 * 60 * 24) > 3 
    : true;
    
  const nextCleanDate = lastClean 
    ? new Date(new Date(lastClean.cleanedAt).getTime() + 3 * 24 * 60 * 60 * 1000) 
    : new Date();

  const priorityOrder = { High: 3, Medium: 2, Low: 1 };
  
  let topComplaint = null;
  if (activeComplaints.length > 0) {
    topComplaint = activeComplaints.reduce((prev, curr) => {
      return (priorityOrder[prev.priority] > priorityOrder[curr.priority]) ? prev : curr;
    });
  }

  const Prio = topComplaint ? getPriorityDetails(topComplaint.priority) : null;

  return (
    <motion.div 
      layout
      className="flex flex-col bg-white dark:bg-[#0a0a0a] rounded-2xl border border-[#e5e5e5] dark:border-[#222222] shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative group"
    >
      {/* Status indicator strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isOverdue ? 'bg-amber-500' : 'bg-transparent'} transition-colors`} />

      {/* Card Header */}
      <div className="px-5 py-4 border-b border-[#e5e5e5] dark:border-[#1a1a1a] flex justify-between items-start bg-[#fafafa] dark:bg-[#111111]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#333] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-5 h-5 text-[#111] dark:text-white" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#111] dark:text-white tracking-tight leading-none mb-1">Room {room}</h3>
            <span className="text-[11px] font-bold text-[#737373] uppercase tracking-wider">
              {isOverdue ? 'Attention Needed' : 'Up to Date'}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 items-end shrink-0">
          {topComplaint && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 shadow-sm">
              <Prio.icon className="w-3 h-3" />
              {activeComplaints.length} Issue{activeComplaints.length > 1 ? 's' : ''}
            </div>
          )}
          {isOverdue && !topComplaint && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 shadow-sm">
              <AlertTriangle className="w-3 h-3" />
              Overdue
            </div>
          )}
        </div>
      </div>
      
      {/* Card Body */}
      <div className="p-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#a3a3a3] uppercase tracking-widest">
              <History className="w-3.5 h-3.5" /> Last Clean
            </div>
            <span className="text-[13px] font-bold text-[#111] dark:text-white">
              {lastClean ? new Date(lastClean.cleanedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#a3a3a3] uppercase tracking-widest">
              <CalendarDays className="w-3.5 h-3.5" /> Scheduled
            </div>
            <span className={`text-[13px] font-bold ${isOverdue ? 'text-amber-600 dark:text-amber-500' : 'text-[#111] dark:text-white'}`}>
              {nextCleanDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-[#f0f0f0] dark:border-[#1a1a1a] flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#a3a3a3] uppercase tracking-widest">
            <UserCircle2 className="w-3.5 h-3.5" /> Cleaned By
          </div>
          <span className="text-[13px] font-semibold text-[#404040] dark:text-[#a3a3a3]">
            {lastClean ? lastClean.cleanedBy : 'Unassigned'}
          </span>
        </div>
      </div>

      {/* Expandable History Toggle */}
      <div className="mt-auto border-t border-[#f0f0f0] dark:border-[#1a1a1a]">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-5 py-3 text-[12px] font-bold text-[#111] dark:text-white hover:bg-[#fafafa] dark:hover:bg-[#111111]/50 transition-colors flex justify-between items-center bg-transparent focus:outline-none"
        >
          <span>{isExpanded ? 'Hide History' : 'Show History'}</span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <ChevronDown className="w-4 h-4 text-[#a3a3a3]" />
          </motion.div>
        </button>
        
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} // easeOutExpo
              className="overflow-hidden bg-[#fafafa] dark:bg-[#111111]"
            >
              <div className="p-4 border-t border-[#f0f0f0] dark:border-[#1a1a1a] max-h-48 overflow-y-auto">
                {sortedLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <Clock className="w-5 h-5 text-[#d4d4d4] dark:text-[#333] mb-2" />
                    <p className="text-[12px] text-[#737373] dark:text-[#888888] font-medium">No records found.</p>
                  </div>
                ) : (
                  <div className="relative pl-3 border-l-2 border-[#e5e5e5] dark:border-[#333] space-y-4 ml-2">
                    {sortedLogs.map((log, idx) => (
                      <div key={log.id} className="relative">
                        <div className="absolute w-2 h-2 rounded-full bg-[#111] dark:bg-white -left-[17px] top-1.5 ring-4 ring-[#fafafa] dark:ring-[#111111]" />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[12px] font-bold text-[#111] dark:text-white">
                            {new Date(log.cleanedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-[11px] font-medium text-[#737373] dark:text-[#888888]">
                            {log.notes || 'Routine Clean'} • {log.cleanedBy}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export const CleaningManagement = ({ rooms, cleaningData, complaints }) => {
  return (
    <SectionCard title="Cleaning Management" subtitle="Room cleaning schedules and history">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
        {rooms.map(room => {
          const roomLogs = cleaningData.filter(c => c.roomId === room);
          const activeComplaints = complaints.filter(c => c.roomId === room && c.status !== 'Resolved');
          
          return (
            <CleaningCard 
              key={room} 
              room={room} 
              cleaningLogs={roomLogs} 
              activeComplaints={activeComplaints}
            />
          );
        })}
      </div>
    </SectionCard>
  );
};
