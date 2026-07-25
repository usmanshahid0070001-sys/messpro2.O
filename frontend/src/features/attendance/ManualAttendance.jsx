import { useState, useEffect, useMemo } from 'react';
import { Search, Save, Calendar, Coffee, UserPlus, FileWarning, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


import { useAuth } from '../../context/AuthContext';
import { useMealSchedule } from '../../hooks/queries/useMealQueries';
import { useGetTargettedUsers } from '../../hooks/queries/useUsers';
import { useGetAttendance } from '../../hooks/queries/useAttendanceQueries';
import { useSaveAttendance } from '../../hooks/mutations/useAttendanceMutations';
import LoadingScreen from '../../components/ui/LoadingScreen';

export default function ManualAttendance() {
  const { user } = useAuth();
  
  // -- Selection State --
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD
  const [selectedMealId, setSelectedMealId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // -- Draft State --
  // Format: { [rollNumber]: count }
  const [draftAttendance, setDraftAttendance] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // -- Guest Entry State --
  const [guestRollNumber, setGuestRollNumber] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [guests, setGuests] = useState([]); // List of manually added guests for this session

  // -- Queries --
  const { data: mealResponse, isLoading: mealsLoading } = useMealSchedule();
  const scheduleData = mealResponse?.data || null;
  const todayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
  
  const todaysMeals = useMemo(() => {
    if (!scheduleData || !scheduleData.menu || !scheduleData.mealNames) return [];
    
    const todaysMenu = scheduleData.menu[todayName] || [];
    
    return scheduleData.mealNames.map((mealName, index) => {
      const menuItem = todaysMenu[index];
      return {
        _id: index.toString(),
        type: mealName,
        name: menuItem?.meal && menuItem.meal !== 'none' ? menuItem.meal : 'Regular Meal',
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
  }, [selectedDate, selectedMealId]);

  const { mutate: saveAttendance, isPending: isSaving } = useSaveAttendance();

  // -- Sync Server Data to Draft when dependencies change --
  useEffect(() => {
    if (serverAttendance && !attendanceFetching) {
      if (hasUnsavedChanges) return; // Prevent background refresh from wiping out user's active edits

      const newDraft = {};
      const newGuests = [];
      serverAttendance.forEach(att => {
        newDraft[att.rollNumber] = att.count;
        if (att.isGuest) {
          // If they aren't in the student list, they are a guest
          if (!students.find(s => s.id === att.rollNumber)) {
            newGuests.push({ rollNumber: att.rollNumber, count: att.count, name: att.userRef?.name || 'Guest' });
          }
        }
      });
      setDraftAttendance(newDraft);
      setGuests(newGuests);
    }
  }, [serverAttendance, attendanceFetching, hasUnsavedChanges, students]);

  // -- Derived Data --
  const mergedStudentsList = useMemo(() => {
    // Only show students in the attendance roster
    const justStudents = students.filter(user => user.role === 'student');
    return justStudents.map(student => {
      const count = draftAttendance[student.id] !== undefined 
        ? draftAttendance[student.id] 
        : 0;
      return { ...student, count };
    });
  }, [students, draftAttendance]);

  const filteredStudents = mergedStudentsList.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.room?.roomName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mergedGuestsList = useMemo(() => {
    return guests.map(g => ({
      ...g,
      count: draftAttendance[g.rollNumber] !== undefined ? draftAttendance[g.rollNumber] : g.count
    }));
  }, [guests, draftAttendance]);

  // -- Handlers --
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
        return [...prev, { rollNumber: guestRollNumber, name: 'External/Guest', count: guestCount }];
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
      <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-2xl border border-[#e5e5e5] dark:border-[#222222] shadow-sm flex flex-col lg:flex-row items-end gap-4">
        
        <div className="w-full lg:w-1/3">
          <label className="block text-[13px] font-bold text-[#737373] dark:text-[#a0a0a0] mb-1.5 ml-1">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3] dark:text-[#666666] pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedMealId(''); // Reset meal when date changes
              }}
              className="w-full bg-white dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#333333] rounded-xl py-2 pl-9 pr-4 text-[#111111] dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <label className="block text-[13px] font-bold text-[#737373] dark:text-[#a0a0a0] mb-1.5 ml-1">Meal Type</label>
          <div className="relative">
            <Coffee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3] dark:text-[#666666] pointer-events-none" />
            <select
              value={selectedMealId}
              onChange={(e) => setSelectedMealId(e.target.value)}
              className="w-full bg-white dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#333333] rounded-xl py-2 pl-9 pr-4 text-[#111111] dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
            >
              <option value="" disabled>Select a meal</option>
              {todaysMeals.map(meal => (
                <option key={meal._id} value={meal._id}>
                  {meal.type}: {meal.name} (Rs.{meal.price})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full lg:w-1/3 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={!isConfigured || isSaving || (!hasUnsavedChanges && (serverAttendance?.length > 0))}
            className={`w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
              hasUnsavedChanges 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm ring-2 ring-blue-600/20' 
                : 'bg-[#f5f5f5] dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#222222] text-[#a3a3a3] dark:text-[#666666] cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {!isConfigured ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#fafafa] dark:bg-[#0a0a0a] h-[400px] flex flex-col items-center justify-center rounded-2xl border border-[#e5e5e5] dark:border-[#222222] text-center px-4"
        >
          <div className="w-16 h-16 bg-[#f5f5f5] dark:bg-[#1a1a1a] rounded-full flex items-center justify-center mb-4 border border-[#e5e5e5] dark:border-[#333333]">
            <Calendar className="w-8 h-8 text-[#a3a3a3] dark:text-[#666666]" />
          </div>
          <h3 className="text-lg font-bold text-[#111111] dark:text-white mb-2">Select Date and Meal</h3>
          <p className="text-[#737373] dark:text-[#a0a0a0] text-sm max-w-sm">
            Please choose a date and a specific meal from the menu above to load the student roster and mark attendance.
          </p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {attendanceLoading && <div className="text-center text-[#737373] dark:text-[#a0a0a0] text-sm py-8 font-medium">Loading records...</div>}

          {/* Filters & Warning */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] dark:text-[#666666] w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search roster..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#333333] rounded-xl py-2 pl-9 pr-4 text-[#111111] dark:text-white text-sm placeholder:text-[#a3a3a3] dark:placeholder:text-[#666666] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>
            
            <AnimatePresence>
              {hasUnsavedChanges && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide shadow-sm"
                >
                  <FileWarning className="w-4 h-4" />
                  Unsaved changes
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Roster Table */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-[#e5e5e5] dark:border-[#222222] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fafafa] dark:bg-[#111111] border-b border-[#e5e5e5] dark:border-[#222222] text-[#737373] dark:text-[#888888] text-[11px] uppercase tracking-wider font-bold">
                    <th className="px-6 py-4 w-1/3">Student</th>
                    <th className="px-6 py-4 w-1/4">Roll Number</th>
                    <th className="px-6 py-4 w-1/4">Room</th>
                    <th className="px-6 py-4 text-center w-32">Meals Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f5f5] dark:divide-[#1a1a1a]">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className={`transition-colors group ${student.count > 0 ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-[#fafafa] dark:hover:bg-[#111111]'}`}>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                            student.count > 0 
                              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                              : 'bg-[#f5f5f5] dark:bg-[#1a1a1a] text-[#737373] dark:text-[#a0a0a0] border border-[#e5e5e5] dark:border-[#222222]'
                          }`}>
                            {student.name.charAt(0)}
                          </div>
                          <span className={`font-semibold text-sm transition-colors ${student.count > 0 ? 'text-[#111111] dark:text-white' : 'text-[#404040] dark:text-[#dddddd]'}`}>
                            {student.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-[#737373] dark:text-[#a0a0a0] text-xs font-mono uppercase tracking-wider">
                        {student.id}
                      </td>
                      <td className="px-6 py-3 text-[#737373] dark:text-[#a0a0a0] text-sm font-medium">
                        {student.room?.roomName ? `Room ${student.room.roomName}` : '-'}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-center gap-3 bg-white dark:bg-[#111111] rounded-lg p-1 border border-[#e5e5e5] dark:border-[#333333] w-[104px] mx-auto shadow-sm">
                          <button 
                            onClick={() => handleCountChange(student.id, -1)}
                            disabled={student.count === 0}
                            className={`w-7 h-7 flex items-center justify-center rounded-md font-bold transition-colors ${
                              student.count > 0 
                                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30' 
                                : 'text-[#a3a3a3] dark:text-[#666666] cursor-not-allowed'
                            }`}
                          >
                            -
                          </button>
                          <span className={`font-mono font-bold text-base min-w-[1.25rem] text-center ${student.count > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-[#737373] dark:text-[#a0a0a0]'}`}>
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
                  
                  {/* Guests Section in Table */}
                  {mergedGuestsList.length > 0 && (
                    <tr className="bg-[#fafafa] dark:bg-[#111111]">
                      <td colSpan="4" className="px-6 py-2 text-[10px] font-bold text-[#737373] dark:text-[#888888] uppercase tracking-widest border-y border-[#e5e5e5] dark:border-[#222222]">
                        External Guests & Additions
                      </td>
                    </tr>
                  )}
                  {mergedGuestsList.map(guest => (
                    <tr key={guest.rollNumber} className={`transition-colors group ${guest.count > 0 ? 'bg-orange-50/50 dark:bg-orange-950/10' : 'hover:bg-[#fafafa] dark:hover:bg-[#111111]'}`}>
                       <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 flex items-center justify-center font-bold text-xs">
                            G
                          </div>
                          <span className="text-[#111111] dark:text-white font-semibold text-sm">
                            {guest.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-[#737373] dark:text-[#a0a0a0] text-xs font-mono uppercase tracking-wider">
                        {guest.rollNumber}
                      </td>
                      <td className="px-6 py-3 text-[#737373] dark:text-[#666666] text-sm italic font-medium">
                        External
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-center gap-3 bg-white dark:bg-[#111111] rounded-lg p-1 border border-[#e5e5e5] dark:border-[#333333] w-[104px] mx-auto shadow-sm">
                          <button 
                            onClick={() => handleCountChange(guest.rollNumber, -1)}
                            disabled={guest.count === 0}
                            className={`w-7 h-7 flex items-center justify-center rounded-md font-bold transition-colors ${
                              guest.count > 0 
                                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30' 
                                : 'text-[#a3a3a3] dark:text-[#666666] cursor-not-allowed'
                            }`}
                          >
                            -
                          </button>
                          <span className={`font-mono font-bold text-base min-w-[1.25rem] text-center ${guest.count > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-[#737373] dark:text-[#a0a0a0]'}`}>
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
                      <td colSpan="4" className="px-6 py-12 text-center text-[#737373] dark:text-[#888888] text-sm font-medium">
                        No students found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Quick Guest Add Form */}
            <div className="bg-[#fafafa] dark:bg-[#111111] border-t border-[#e5e5e5] dark:border-[#222222] p-4 sm:p-5">
              <form onSubmit={handleAddGuest} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2 text-[#737373] dark:text-[#a0a0a0] font-bold text-xs uppercase tracking-wide w-full sm:w-auto">
                  <UserPlus className="w-4 h-4" />
                  Add Guest
                </div>
                <input
                  type="text"
                  placeholder="Roll Number (e.g. FA21-BSE-000)"
                  value={guestRollNumber}
                  onChange={e => setGuestRollNumber(e.target.value)}
                  className="w-full sm:w-64 bg-white dark:bg-[#0a0a0a] border border-[#e5e5e5] dark:border-[#333333] rounded-lg py-2 px-3 text-[#111111] dark:text-white placeholder:text-[#a3a3a3] dark:placeholder:text-[#666666] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-mono shadow-sm"
                />
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-bold text-[#737373] dark:text-[#a0a0a0] uppercase">Count</span>
                  <input
                    type="number"
                    min="1"
                    value={guestCount}
                    onChange={e => setGuestCount(parseInt(e.target.value) || 1)}
                    className="w-20 bg-white dark:bg-[#0a0a0a] border border-[#e5e5e5] dark:border-[#333333] rounded-lg py-2 px-3 text-[#111111] dark:text-white text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!guestRollNumber.trim()}
                  className="w-full sm:w-auto px-5 py-2 bg-[#111111] hover:bg-[#404040] dark:bg-white dark:hover:bg-[#e5e5e5] text-white dark:text-[#111111] rounded-lg transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
