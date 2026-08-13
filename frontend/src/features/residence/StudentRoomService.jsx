import React from'react';
import { Home, Users, Sparkles, AlertCircle, Info, CalendarCheck, InfoIcon } from'lucide-react';
import { motion } from'framer-motion';
import SectionCard from'../../features/ui/SectionCard';
import { useMyRoom } from'../../hooks/queries/useResidenceQueries';
import { useMarkRoomCleaning } from'../../hooks/mutations/useResidenceMutations';
import { useMyHostel } from'../../hooks/queries/useHostelQueries';

export default function StudentRoomService() {
 const { data: response, isLoading, isError, error } = useMyRoom();
 const markCleaningMutation = useMarkRoomCleaning();

 const { data: hostelResponse } = useMyHostel();
 const enabledFeatures = hostelResponse?.data?.plan?.features || [];
 
 // Check if cleaning/services feature is enabled for the hostel
 const hasServiceManagement = enabledFeatures.some(f => 
 (f.name ==='Service Management'|| f.name ==='Room Service') && f.isEnabled
 );

 if (isLoading) {
 return (
 <SectionCard>
 <div className="flex items-center justify-center p-12 text-zinc-500">
 <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
 <span className="ml-3 font-medium">Loading your room details...</span>
 </div>
 </SectionCard>
 );
 }

 // Handle 404 (Not allotted)
 if (isError || !response?.data) {
 return (
 <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
 <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
 <div className="p-3 bg-orange-100 dark:bg-orange-500/20 rounded-xl shrink-0">
 <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400"/>
 </div>
 <div>
 <h3 className="text-base font-bold text-orange-900 dark:text-orange-300">Room Not Allotted</h3>
 <p className="text-sm text-orange-700 dark:text-orange-400/80 mt-1.5 leading-relaxed">
 You do not have a room allotted yet. Please contact your admin or a staff member to get your room assigned.
 </p>
 </div>
 </div>
 </div>
 );
 }

 const room = response.data;
 const roommates = room.roommates || [];

 // Check if cleaned today
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 const alreadyMarkedToday = (room.cleaningDates || []).some(dateString => {
 const markDate = new Date(dateString);
 markDate.setHours(0, 0, 0, 0);
 return markDate.getTime() === today.getTime();
 });

 return (
 <div className="space-y-6 flex flex-col w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
 {/* Header */}
 <div>
 <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
 <Home className="w-6 h-6 text-indigo-500"/>
 My Room Details
 </h1>
 <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
 View your room details, roommates, and manage room services.
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Room Info Card */}
 <SectionCard>
 <div className="p-6">
 <div className="flex items-center gap-3 mb-6">
 <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
 <InfoIcon className="w-5 h-5"/>
 </div>
 <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Room Information</h2>
 </div>
 
 <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-5 border border-zinc-100 dark:border-zinc-800">
 <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
 <span className="text-sm font-medium text-zinc-500">Room Name</span>
 <span className="text-base font-black text-zinc-900 dark:text-zinc-50">{room.roomName}</span>
 </div>
 <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
 <span className="text-sm font-medium text-zinc-500">Capacity</span>
 <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{room.capacity} Beds</span>
 </div>
 <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
 <span className="text-sm font-medium text-zinc-500">Occupied</span>
 <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{room.occupants} Residents</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-zinc-500">Status</span>
 <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900">
 {room.status}
 </span>
 </div>
 </div>
 </div>
 </SectionCard>

 {/* Roommates Card */}
 <SectionCard>
 <div className="p-6">
 <div className="flex items-center gap-3 mb-6">
 <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
 <Users className="w-5 h-5"/>
 </div>
 <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Roommates</h2>
 </div>
 
 <div className="space-y-3">
 {roommates.map((rm, idx) => (
 <div key={rm._id || idx} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl">
 <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
 {rm.name.charAt(0).toUpperCase()}
 </div>
 <div>
 <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-none">{rm.name}</p>
 <p className="text-[12px] font-medium text-zinc-500 mt-1">{rm.id ||'N/A'}</p>
 </div>
 </div>
 ))}
 
 {roommates.length === 0 && (
 <p className="text-sm text-zinc-500 italic py-4 text-center">No roommates found.</p>
 )}
 </div>
 </div>
 </SectionCard>

 {/* Cleaning/Services Card (Only if feature enabled) */}
 {hasServiceManagement && (
 <SectionCard className="lg:col-span-2">
 <div className="p-6">
 <div className="flex items-center gap-3 mb-6">
 <div className="p-2.5 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg text-yellow-600 dark:text-yellow-400">
 <Sparkles className="w-5 h-5"/>
 </div>
 <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Room Cleaning Service</h2>
 </div>
 
 <div className="flex flex-col md:flex-row gap-8">
 {/* Mark cleaning section */}
 <div className="flex-1">
 <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center">
 <CalendarCheck className="w-12 h-12 text-zinc-400 mx-auto mb-4"/>
 <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-2">Mark Today's Cleaning</h3>
 <p className="text-sm text-zinc-500 mb-6">
 Did the cleaning staff clean your room today? Mark your attendance to maintain a record.
 </p>
 <button
 onClick={() => markCleaningMutation.mutate()}
 disabled={alreadyMarkedToday || markCleaningMutation.isPending}
 className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
 >
 {markCleaningMutation.isPending ?'Marking...': alreadyMarkedToday ?'Already Marked Today':'Mark as Cleaned'}
 </button>
 </div>
 </div>
 
 {/* Recent cleanings list */}
 <div className="flex-1">
 <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-4 uppercase tracking-wider">Recent Cleanings (Last 15)</h3>
 {room.cleaningDates && room.cleaningDates.length > 0 ? (
 <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
 {[...room.cleaningDates].reverse().map((dateStr, idx) => {
 const date = new Date(dateStr);
 return (
 <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-lg">
 <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
 {date.toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric', year:'numeric'})}
 </span>
 <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-md">
 Cleaned
 </span>
 </div>
 );
 })}
 </div>
 ) : (
 <div className="p-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20">
 <p className="text-sm text-zinc-500">No cleaning records found yet.</p>
 </div>
 )}
 </div>
 </div>
 </div>
 </SectionCard>
 )}
 </div>
 </div>
 );
}
