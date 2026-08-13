import React, { useState } from'react';
import { motion, AnimatePresence } from'framer-motion';
import { Bed, CalendarDays, AlertTriangle, History, Search } from'lucide-react';
import SectionCard from'../../features/ui/SectionCard';
import { useRooms } from'../../hooks/queries/useResidenceQueries';
import LoadingScreen from'../ui/LoadingScreen';

export const CleaningManagement = () => {
 const { data: response, isLoading, isError } = useRooms();
 const [searchTerm, setSearchTerm] = useState('');

 if (isLoading) {
 return (
 <SectionCard title="Cleaning Management"subtitle="Room cleaning schedules and history">
 <div className="flex items-center justify-center p-12 text-zinc-500">
 <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
 <span className="ml-3 font-medium">Loading rooms...</span>
 </div>
 </SectionCard>
 );
 }

 if (isError || !response?.data) {
 return (
 <SectionCard title="Cleaning Management"subtitle="Room cleaning schedules and history">
 <div className="p-6 text-center text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl">
 Failed to load rooms.
 </div>
 </SectionCard>
 );
 }

 const rooms = response.data;
 
 const filteredRooms = rooms.filter(room => 
 room.roomName.toLowerCase().includes(searchTerm.toLowerCase())
 );

 return (
 <SectionCard 
 title="Cleaning Management"
 subtitle="Room cleaning schedules and history"
 action={
 <div className="relative w-full sm:w-64">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <Search className="h-4 w-4 text-zinc-400"/>
 </div>
 <input
 type="text"
 placeholder="Search rooms..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg leading-5 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
 />
 </div>
 }
 >
 <div className="flex flex-col gap-4 pt-2">
 {filteredRooms.length === 0 ? (
 <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
 <p className="text-sm text-zinc-500">
 {searchTerm ?'No rooms match your search.':'No rooms found in this hostel.'}
 </p>
 </div>
 ) : (
 <div className="space-y-3">
 {filteredRooms.map((room) => {
 const dates = room.cleaningDates || [];
 const sortedDates = [...dates].sort((a, b) => new Date(b) - new Date(a)); // Newest first

 return (
 <div 
 key={room._id} 
 className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group"
 >
 {/* Left Side: Room Info */}
 <div className="flex items-center gap-4 shrink-0">
 <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center shrink-0">
 <Bed className="w-5 h-5 text-blue-600 dark:text-blue-400"/>
 </div>
 <div className="flex flex-col">
 <h3 className="text-base font-black text-zinc-900 dark:text-zinc-50 leading-none mb-1">
 Room {room.roomName}
 </h3>
 <div className="flex items-center gap-1.5">
 <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
 Capacity: {room.capacity}
 </span>
 <span className="text-zinc-300 dark:text-zinc-700">•</span>
 <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
 Occupied: {room.occupants}
 </span>
 </div>
 </div>
 </div>

 {/* Right Side: Cleaning Dates Blocks */}
 <div className="flex items-center gap-2 flex-wrap">
 {sortedDates.length > 0 ? (
 sortedDates.map((dateStr, idx) => {
 const date = new Date(dateStr);
 const day = date.getDate();
 const fullDateString = date.toLocaleDateString(undefined, { 
 weekday:'short', month:'short', day:'numeric', year:'numeric'
 });

 return (
 <div
 key={idx}
 title={fullDateString} // Native browser tooltip for full date on hover
 className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-help hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 dark:hover:border-indigo-500/20 transition-colors"
 >
 {day}
 </div>
 );
 })
 ) : (
 <span className="text-xs font-medium text-zinc-400 dark:text-zinc-600 italic px-2">
 No cleaning records
 </span>
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </SectionCard>
 );
};

export default CleaningManagement;
