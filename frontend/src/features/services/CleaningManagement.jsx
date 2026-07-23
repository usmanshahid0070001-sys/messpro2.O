import React, { useState } from 'react';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';

const priorityToneMap = {
  High: 'danger',
  Medium: 'warning',
  Low: 'info'
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

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-[#e0e0e0] dark:border-[#222222] shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200">
      
      {/* Card Header */}
      <div className="px-4 py-3 border-b border-[#e0e0e0] dark:border-[#222222] flex justify-between items-start bg-[#f5f5f5]/50 dark:bg-[#1a1a1a]/50 rounded-t-xl">
        <h3 className="text-lg font-black text-[#111111] dark:text-white">Room {room}</h3>
        
        <div className="flex flex-col gap-1 items-end">
          {activeComplaints.length > 0 && topComplaint && (
            <StatusBadge tone={priorityToneMap[topComplaint.priority] || 'neutral'}>
              {activeComplaints.length} Issue{activeComplaints.length > 1 ? 's' : ''}
            </StatusBadge>
          )}
          {isOverdue && (
            <StatusBadge tone="warning">
              Overdue Clean
            </StatusBadge>
          )}
        </div>
      </div>
      
      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col gap-3 text-sm text-[#404040] dark:text-[#a3a3a3]">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-[#737373] dark:text-[#888888]">Last Cleaned</span>
          <span className="text-[#111111] dark:text-white font-bold">
            {lastClean ? new Date(lastClean.cleanedAt).toLocaleDateString() : 'Never'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-[#737373] dark:text-[#888888]">Cleaned By</span>
          <span className="font-medium">{lastClean ? lastClean.cleanedBy : 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-[#737373] dark:text-[#888888]">Next Scheduled</span>
          <span className="font-medium">{nextCleanDate.toLocaleDateString()}</span>
        </div>
      </div>

      {/* Expandable History */}
      <div className="border-t border-[#e0e0e0] dark:border-[#222222]">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 text-[13px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex justify-between items-center rounded-b-xl"
        >
          <span>{isExpanded ? 'Hide History' : 'Show History'}</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isExpanded && (
          <div className="p-4 bg-[#f5f5f5]/30 dark:bg-[#1a1a1a]/30 text-[13px] max-h-40 overflow-y-auto custom-scrollbar rounded-b-xl border-t border-[#e0e0e0] dark:border-[#222222]">
            {sortedLogs.length === 0 ? (
              <p className="text-[#737373] dark:text-[#888888] text-center italic font-medium">No records found.</p>
            ) : (
              <ul className="space-y-3">
                {sortedLogs.map((log) => (
                  <li key={log.id} className="flex justify-between items-center">
                    <span className="font-medium text-[#111111] dark:text-[#e5e5e5]">
                      {new Date(log.cleanedAt).toLocaleDateString()}
                    </span>
                    <span className="text-[#737373] dark:text-[#a3a3a3] font-semibold bg-[#e5e5e5] dark:bg-[#333333] px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
                      {log.notes || 'Clean'} - {log.cleanedBy}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const CleaningManagement = ({ rooms, cleaningData, complaints }) => {
  return (
    <SectionCard title="Cleaning Management" subtitle="Room cleaning schedules and history">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
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
