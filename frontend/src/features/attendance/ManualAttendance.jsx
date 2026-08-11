import { useState, useEffect, useMemo } from'react';
import { Search, Save, Calendar, Coffee, UserPlus, FileWarning, Check, Download } from'lucide-react';
import { motion, AnimatePresence } from'framer-motion';
import * as XLSX from'xlsx';

import { useAuth } from'../../context/AuthContext';
import { useMealSchedule } from'../../hooks/queries/useMealQueries';
import { useGetTargettedUsers } from'../../hooks/queries/useUsers';
import { useGetAttendance } from'../../hooks/queries/useAttendanceQueries';
import { useSaveAttendance } from'../../hooks/mutations/useAttendanceMutations';
import LoadingScreen from'../../features/ui/LoadingScreen';
import useUIStore from'../../store/useUIStore';

export default function ManualAttendance() {
 const { user } = useAuth();
 
 // -- Selection State --
 const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD
 const [selectedMealId, setSelectedMealId] = useState('');
 const [searchQuery, setSearchQuery] = useState('');
 
 // -- Draft State --
 // Format: { [rollNumber]: count }
 const [draftAttendance, setDraftAttendance] = useState({});
 const { hasUnsavedChanges, setHasUnsavedChanges, discardTrigger } = useUIStore();

 // -- Guest Entry State --
 const [guestRollNumber, setGuestRollNumber] = useState('');
 const [guestCount, setGuestCount] = useState(1);
 const [guests, setGuests] = useState([]); // List of manually added guests for this session

 // -- Queries --
 const { data: mealResponse, isLoading: mealsLoading } = useMealSchedule();
 const scheduleData = mealResponse?.data || null;
 const todayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday:'long'});
 
 const todaysMeals = useMemo(() => {
 if (!scheduleData || !scheduleData.menu || !scheduleData.mealNames) return [];
 
 const todaysMenu = scheduleData.menu[todayName] || [];
 
 return scheduleData.mealNames.map((mealName, index) => {
 const menuItem = todaysMenu[index];
 return {
 _id: index.toString(),
 type: mealName,
 name: menuItem?.meal && menuItem.meal !=='none'? menuItem.meal :'Regular Meal',
 price: menuItem?.price || 0
 };
 });
 }, [scheduleData, todayName]);
 
 const { data: students = [], isLoading: studentsLoading } = useGetTargettedUsers();
 
 const selectedMeal = todaysMeals.find(m => m._id === selectedMealId);

 const { 
 data: attendanceResponse, 
 isLoading: attendanceLoading,
 isFetching: attendanceFetching
 } = useGetAttendance(user?.hostelId, selectedDate, selectedMeal?.type);

 const serverAttendance = attendanceResponse?.data;

 // -- Clear local draft and guests when date or meal changes --
 useEffect(() => {
 setGuests([]);
 setDraftAttendance({});
 setHasUnsavedChanges(false);
 }, [selectedDate, selectedMealId, setHasUnsavedChanges]);

 // Cleanup on unmount
 useEffect(() => {
 return () => setHasUnsavedChanges(false);
 }, [setHasUnsavedChanges]);

 const { mutate: saveAttendance, isPending: isSaving } = useSaveAttendance();

 const loadFromServer = () => {
 if (serverAttendance) {
 const newDraft = {};
 const newGuests = [];
 serverAttendance.forEach(att => {
 newDraft[att.rollNumber] = att.attendance?.count || 0;
 if (att.isGuest) {
 if (!students.find(s => s.id === att.rollNumber)) {
 newGuests.push({ rollNumber: att.rollNumber, count: att.attendance?.count || 0, name: att.studentId?.name ||'Guest'});
 }
 }
 });
 setDraftAttendance(newDraft);
 setGuests(newGuests);
 }
 };

 // -- Sync Server Data to Draft when dependencies change --
 useEffect(() => {
 if (serverAttendance && !attendanceFetching) {
 if (hasUnsavedChanges) return; // Prevent background refresh from wiping out user's active edits
 loadFromServer();
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [serverAttendance, attendanceFetching, hasUnsavedChanges, students]);

 useEffect(() => {
 if (discardTrigger > 0) {
 loadFromServer();
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [discardTrigger]);

 // -- Derived Data --
 const mergedStudentsList = useMemo(() => {
 // Only show students in the attendance roster
 const justStudents = students.filter(user => user.role ==='student');
 return justStudents.map(student => {
 const serverAtt = serverAttendance?.find(a => a.rollNumber === student.id);
 
 const count = draftAttendance[student.id] !== undefined 
 ? draftAttendance[student.id] 
 : (serverAtt?.attendance?.count || 0);
 
 const reservedCount = serverAtt?.selection?.count || 0;

 return { ...student, count, reservedCount };
 });
 }, [students, draftAttendance, serverAttendance]);

 const filteredStudents = mergedStudentsList.filter(student => 
 student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
 student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
 (student.room?.roomName ||'').toLowerCase().includes(searchQuery.toLowerCase())
 );

 const mergedGuestsList = useMemo(() => {
 return guests.map(g => ({
 ...g,
 count: draftAttendance[g.rollNumber] !== undefined ? draftAttendance[g.rollNumber] : g.count
 }));
 }, [guests, draftAttendance]);

 const totalReserved = mergedStudentsList.reduce((acc, s) => acc + (s.reservedCount || 0), 0);
 const totalEaten = mergedStudentsList.reduce((acc, s) => acc + (s.count || 0), 0) + mergedGuestsList.reduce((acc, g) => acc + (g.count || 0), 0);

 // -- Handlers --
 const exportToExcel = () => {
 const dataToExport = [
 ...filteredStudents.map(s => ({
 Name: s.name,
'Roll Number': s.id,
 Room: s.room?.roomName ||'-',
 Reserved: s.reservedCount,
'Meals Taken': s.count
 })),
 ...mergedGuestsList.map(g => ({
 Name: g.name,
'Roll Number': g.rollNumber,
 Room:'External',
 Reserved: 0,
'Meals Taken': g.count
 }))
 ];

 const worksheet = XLSX.utils.json_to_sheet(dataToExport);
 const workbook = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(workbook, worksheet,'Attendance');
 
 const fileName = `Attendance_${selectedDate}_${selectedMeal?.name ||'Meal'}.xlsx`;
 XLSX.writeFile(workbook, fileName);
 };
 const handleCountChange = (rollNumber, delta) => {
 setDraftAttendance(prev => {
 const current = prev[rollNumber] !== undefined ? prev[rollNumber] : 0;
 const newCount = Math.max(0, current + delta);
 return { ...prev, [rollNumber]: newCount };
 });
 setHasUnsavedChanges(true);
 };

 const handleAddGuest = (e) => {
 e.preventDefault();
 if (!guestRollNumber.trim()) return;
 
 // Check if it's actually a registered student
 const existingStudent = students.find(s => s.id.toLowerCase() === guestRollNumber.toLowerCase());
 if (existingStudent) {
 handleCountChange(existingStudent.id, guestCount);
 } else {
 // Add as guest
 setGuests(prev => {
 if (prev.find(g => g.rollNumber.toLowerCase() === guestRollNumber.toLowerCase())) return prev;
 return [...prev, { rollNumber: guestRollNumber, name:'External/Guest', count: guestCount }];
 });
 setDraftAttendance(prev => ({ ...prev, [guestRollNumber]: guestCount }));
 setHasUnsavedChanges(true);
 }
 
 setGuestRollNumber('');
 setGuestCount(1);
 };

 const handleSave = () => {
 if (!selectedMeal) return;

 // Build records array
 const records = [];
 Object.entries(draftAttendance).forEach(([rollNumber, count]) => {
 records.push({ rollNumber, count });
 });

 saveAttendance({
 hostelId: user.hostelId,
 date: selectedDate,
 mealType: selectedMeal.type,
 mealInfo: {
 name: selectedMeal.name,
 price: selectedMeal.price || 0
 },
 records
 }, {
 onSuccess: () => {
 setHasUnsavedChanges(false);
 }
 });
 };

 if (mealsLoading || studentsLoading) return <LoadingScreen />;

 const isConfigured = !!selectedDate && !!selectedMealId;

 return (
 <div className="space-y-6">
 
 {/* Top Configuration Bar */}
 <div className="bg-zinc-50 dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col lg:flex-row items-end gap-4">
 
 <div className="w-full lg:w-1/3">
 <label className="block text-[13px] font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">Date</label>
 <div className="relative">
 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none"/>
 <input
 type="date"
 value={selectedDate}
 onChange={(e) => {
 setSelectedDate(e.target.value);
 setSelectedMealId(''); // Reset meal when date changes
 }}
 className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl py-2 pl-9 pr-4 text-zinc-900 dark:text-zinc-50 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all [color-scheme:dark]"
 />
 </div>
 </div>

 <div className="w-full lg:w-1/3">
 <label className="block text-[13px] font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">Meal Type</label>
 <div className="relative">
 <Coffee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none"/>
 <select
 value={selectedMealId}
 onChange={(e) => setSelectedMealId(e.target.value)}
 className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl py-2 pl-9 pr-4 text-zinc-900 dark:text-zinc-50 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
 >
 <option value=""disabled>Select a meal</option>
 {todaysMeals.map(meal => (
 <option key={meal._id} value={meal._id}>
 {meal.type}: {meal.name} (Rs.{meal.price})
 </option>
 ))}
 </select>
 </div>
 </div>

 <div className="w-full lg:w-1/3 flex justify-end gap-2">
 {isConfigured && (
 <button 
 onClick={exportToExcel}
 className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors border border-emerald-200 dark:border-emerald-800/50"
 >
 <Download className="w-4 h-4"/>
 <span>Export</span>
 </button>
 )}
 <button 
 onClick={handleSave}
 disabled={!isConfigured || isSaving || (!hasUnsavedChanges && (serverAttendance?.length > 0))}
 className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
 hasUnsavedChanges 
 ?'bg-blue-600 hover:bg-blue-700 text-white shadow-sm ring-2 ring-blue-600/20'
 :'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
 }`}
 >
 {isSaving ? (
 <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"/>
 ) : (
 <Save className="w-4 h-4"/>
 )}
 <span>{isSaving ?'Saving...': hasUnsavedChanges ?'Save Changes':'Saved'}</span>
 </button>
 </div>
 </div>

 {/* Main Content Area */}
 {!isConfigured ? (
 <motion.div 
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 className="bg-zinc-100 dark:bg-zinc-950 h-[400px] flex flex-col items-center justify-center rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center px-4"
 >
 <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900/50 rounded-full flex items-center justify-center mb-4 border border-zinc-200 dark:border-zinc-700">
 <Calendar className="w-8 h-8 text-zinc-400 dark:text-zinc-500"/>
 </div>
 <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Select Date and Meal</h3>
 <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm">
 Please choose a date and a specific meal from the menu above to load the student roster and mark attendance.
 </p>
 </motion.div>
 ) : (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-6"
 >
 {attendanceLoading && <div className="text-center text-zinc-500 dark:text-zinc-400 text-sm py-8 font-medium">Loading records...</div>}

 {/* Filters & Warning */}
 <div className="flex flex-col sm:flex-row justify-between gap-4">
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-4 h-4 pointer-events-none"/>
 <input
 type="text"
 placeholder="Search roster..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl py-2 pl-9 pr-4 text-zinc-900 dark:text-zinc-50 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
 />
 </div>
 <div className="flex items-center gap-3">
 <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold overflow-hidden shadow-sm h-9">
 <span className="px-3 flex items-center border-r border-zinc-200 dark:border-zinc-700 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10">
 Reserved: {totalReserved}
 </span>
 <span className="px-3 flex items-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10">
 Eaten: {totalEaten}
 </span>
 </div>

 <AnimatePresence>
 {hasUnsavedChanges && (
 <motion.div 
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 px-4 h-9 rounded-xl text-xs font-bold uppercase tracking-wide shadow-sm"
 >
 <FileWarning className="w-4 h-4"/>
 Unsaved changes
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>

 {/* Roster Table */}
 <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider font-bold">
 <th className="px-6 py-4 w-[30%]">Student</th>
 <th className="px-6 py-4 w-[20%]">Roll Number</th>
 <th className="px-6 py-4 w-[20%]">Room</th>
 <th className="px-6 py-4 text-center w-[15%]">Reserved</th>
 <th className="px-6 py-4 text-center w-[15%]">Meals Taken</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900/50">
 {filteredStudents.map((student) => (
 <tr key={student.id} className={`transition-colors group ${student.count > 0 ?'bg-blue-50/50 dark:bg-blue-900/10':'hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}>
 <td className="px-6 py-3">
 <div className="flex items-center gap-3">
 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
 student.count > 0 
 ?'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
 :'bg-zinc-100 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
 }`}>
 {student.name.charAt(0)}
 </div>
 <span className={`font-semibold text-sm transition-colors ${student.count > 0 ?'text-zinc-900 dark:text-zinc-50':'text-zinc-700 dark:text-zinc-200'}`}>
 {student.name}
 </span>
 </div>
 </td>
 <td className="px-6 py-3 text-zinc-500 dark:text-zinc-400 text-xs font-mono uppercase tracking-wider">
 {student.id}
 </td>
 <td className="px-6 py-3 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
 {student.room?.roomName ? `Room ${student.room.roomName}` :'-'}
 </td>
 <td className="px-6 py-3">
 <div className="flex justify-center items-center">
 <span className={`text-sm font-bold px-2.5 py-1 rounded-md ${student.reservedCount > 0 ?'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50':'text-zinc-400 dark:text-zinc-500'}`}>
 {student.reservedCount}
 </span>
 </div>
 </td>
 <td className="px-6 py-3">
 <div className="flex items-center justify-center gap-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700 w-[104px] mx-auto shadow-sm">
 <button 
 onClick={() => handleCountChange(student.id, -1)}
 disabled={student.count === 0}
 className={`w-7 h-7 flex items-center justify-center rounded-md font-bold transition-colors ${
 student.count > 0 
 ?'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
 :'text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
 }`}
 >
 -
 </button>
 <span className={`font-mono font-bold text-base min-w-[1.25rem] text-center ${student.count > 0 ?'text-blue-600 dark:text-blue-400':'text-zinc-500 dark:text-zinc-400'}`}>
 {student.count}
 </span>
 <button 
 onClick={() => handleCountChange(student.id, 1)}
 className="w-7 h-7 flex items-center justify-center rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-bold transition-colors"
 >
 +
 </button>
 </div>
 </td>
 </tr>
 ))}
 
 {mergedGuestsList.length > 0 && (
 <tr className="bg-zinc-100 dark:bg-zinc-900">
 <td colSpan="5"className="px-6 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest border-y border-zinc-200 dark:border-zinc-800">
 External Guests & Additions
 </td>
 </tr>
 )}
 {mergedGuestsList.map(guest => (
 <tr key={guest.rollNumber} className={`transition-colors group ${guest.count > 0 ?'bg-orange-50/50 dark:bg-orange-950/10':'hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}>
 <td className="px-6 py-3">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 flex items-center justify-center font-bold text-xs">
 G
 </div>
 <span className="text-zinc-900 dark:text-zinc-50 font-semibold text-sm">
 {guest.name}
 </span>
 </div>
 </td>
 <td className="px-6 py-3 text-zinc-500 dark:text-zinc-400 text-xs font-mono uppercase tracking-wider">
 {guest.rollNumber}
 </td>
 <td className="px-6 py-3 text-zinc-500 dark:text-zinc-500 text-sm italic font-medium">
 External
 </td>
 <td className="px-6 py-3">
 <div className="flex justify-center items-center">
 <span className="text-zinc-400 dark:text-zinc-500 text-sm font-bold">0</span>
 </div>
 </td>
 <td className="px-6 py-3">
 <div className="flex items-center justify-center gap-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700 w-[104px] mx-auto shadow-sm">
 <button 
 onClick={() => handleCountChange(guest.rollNumber, -1)}
 disabled={guest.count === 0}
 className={`w-7 h-7 flex items-center justify-center rounded-md font-bold transition-colors ${
 guest.count > 0 
 ?'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
 :'text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
 }`}
 >
 -
 </button>
 <span className={`font-mono font-bold text-base min-w-[1.25rem] text-center ${guest.count > 0 ?'text-orange-600 dark:text-orange-400':'text-zinc-500 dark:text-zinc-400'}`}>
 {guest.count}
 </span>
 <button 
 onClick={() => handleCountChange(guest.rollNumber, 1)}
 className="w-7 h-7 flex items-center justify-center rounded-md text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-bold transition-colors"
 >
 +
 </button>
 </div>
 </td>
 </tr>
 ))}

 {filteredStudents.length === 0 && mergedGuestsList.length === 0 && (
 <tr>
 <td colSpan="5"className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400 text-sm font-medium">
 No students found matching your search.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>

 {/* Quick Guest Add Form */}
 <div className="bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-4 sm:p-5">
 <form onSubmit={handleAddGuest} className="flex flex-col sm:flex-row items-center gap-3">
 <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase tracking-wide w-full sm:w-auto">
 <UserPlus className="w-4 h-4"/>
 Add Guest
 </div>
 <input
 type="text"
 placeholder="Roll Number (e.g. FA21-BSE-000)"
 value={guestRollNumber}
 onChange={e => setGuestRollNumber(e.target.value)}
 className="w-full sm:w-64 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg py-2 px-3 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-mono shadow-sm"
 />
 <div className="flex items-center gap-2 w-full sm:w-auto">
 <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Count</span>
 <input
 type="number"
 min="1"
 value={guestCount}
 onChange={e => setGuestCount(parseInt(e.target.value) || 1)}
 className="w-20 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg py-2 px-3 text-zinc-900 dark:text-zinc-50 text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm shadow-sm"
 />
 </div>
 <button
 type="submit"
 disabled={!guestRollNumber.trim()}
 className="w-full sm:w-auto px-5 py-2 bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-900 rounded-lg transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
 >
 Add
 </button>
 </form>
 </div>

 </div>
 </motion.div>
 )}
 </div>
 );
}
