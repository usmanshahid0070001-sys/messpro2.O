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
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-end gap-4 shadow-lg shadow-black/5">
        
        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedMealId(''); // Reset meal when date changes
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Meal Type</label>
          <div className="relative">
            <Coffee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              value={selectedMealId}
              onChange={(e) => setSelectedMealId(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all appearance-none"
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

        <div className="w-full sm:w-1/3 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={!isConfigured || isSaving || (!hasUnsavedChanges && (serverAttendance?.length > 0))}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
              hasUnsavedChanges 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/20' 
                : 'bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
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
          className="glass-panel h-[400px] flex flex-col items-center justify-center rounded-2xl border border-white/5 text-center px-4"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
            <Calendar className="w-10 h-10 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Select Date and Meal</h3>
          <p className="text-gray-400 max-w-sm">
            Please choose a date and a specific meal from the menu above to load the student roster and mark attendance.
          </p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {attendanceLoading && <div className="text-center text-gray-400 py-8">Loading records...</div>}

          {/* Filters & Warning */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search roster..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
            
            <AnimatePresence>
              {hasUnsavedChanges && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-2 text-amber-400 bg-amber-400/10 border border-amber-400/20 px-4 py-2 rounded-xl text-sm font-medium"
                >
                  <FileWarning className="w-4 h-4" />
                  You have unsaved changes
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Roster Table */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-lg shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm">
                    <th className="px-6 py-4 font-medium w-1/3">Student</th>
                    <th className="px-6 py-4 font-medium w-1/4">Roll Number</th>
                    <th className="px-6 py-4 font-medium w-1/4">Room</th>
                    <th className="px-6 py-4 font-medium text-center w-32">Meals Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className={`transition-colors group ${student.count > 0 ? 'bg-emerald-500/5' : 'hover:bg-white/5'}`}>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                            student.count > 0 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                              : 'bg-white/5 text-gray-400 border border-white/10 group-hover:bg-white/10'
                          }`}>
                            {student.name.charAt(0)}
                          </div>
                          <span className={`font-medium transition-colors ${student.count > 0 ? 'text-emerald-50' : 'text-gray-200'}`}>
                            {student.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-400 text-sm font-mono uppercase tracking-wider">
                        {student.id}
                      </td>
                      <td className="px-6 py-3 text-gray-400">
                        {student.room?.roomName ? `Room ${student.room.roomName}` : '-'}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-center gap-3 bg-[#1A1A1A] rounded-lg p-1 border border-white/5 w-[104px] mx-auto">
                          <button 
                            onClick={() => handleCountChange(student.id, -1)}
                            disabled={student.count === 0}
                            className={`w-7 h-7 flex items-center justify-center rounded-md font-bold transition-colors ${
                              student.count > 0 
                                ? 'text-rose-400 hover:bg-rose-400/20' 
                                : 'text-gray-600 cursor-not-allowed'
                            }`}
                          >
                            -
                          </button>
                          <span className={`font-mono font-bold text-lg min-w-[1.25rem] text-center ${student.count > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                            {student.count}
                          </span>
                          <button 
                            onClick={() => handleCountChange(student.id, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-emerald-400 hover:bg-emerald-400/20 font-bold transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Guests Section in Table */}
                  {mergedGuestsList.length > 0 && (
                    <tr className="bg-white/5">
                      <td colSpan="4" className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-widest border-y border-white/10 bg-black/20">
                        External Guests & Additions
                      </td>
                    </tr>
                  )}
                  {mergedGuestsList.map(guest => (
                    <tr key={guest.rollNumber} className={`transition-colors group ${guest.count > 0 ? 'bg-emerald-500/5' : 'hover:bg-white/5'}`}>
                       <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-sm">
                            G
                          </div>
                          <span className="text-gray-200 font-medium">
                            {guest.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-400 text-sm font-mono uppercase tracking-wider">
                        {guest.rollNumber}
                      </td>
                      <td className="px-6 py-3 text-gray-500 italic">
                        External
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-center gap-3 bg-[#1A1A1A] rounded-lg p-1 border border-white/5 w-[104px] mx-auto">
                          <button 
                            onClick={() => handleCountChange(guest.rollNumber, -1)}
                            disabled={guest.count === 0}
                            className={`w-7 h-7 flex items-center justify-center rounded-md font-bold transition-colors ${
                              guest.count > 0 
                                ? 'text-rose-400 hover:bg-rose-400/20' 
                                : 'text-gray-600 cursor-not-allowed'
                            }`}
                          >
                            -
                          </button>
                          <span className={`font-mono font-bold text-lg min-w-[1.25rem] text-center ${guest.count > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                            {guest.count}
                          </span>
                          <button 
                            onClick={() => handleCountChange(guest.rollNumber, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-emerald-400 hover:bg-emerald-400/20 font-bold transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredStudents.length === 0 && mergedGuestsList.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                        No students found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Quick Guest Add Form */}
            <div className="bg-black/20 border-t border-white/10 p-4">
              <form onSubmit={handleAddGuest} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2 text-gray-400 font-medium text-sm w-full sm:w-auto">
                  <UserPlus className="w-4 h-4" />
                  Add Guest:
                </div>
                <input
                  type="text"
                  placeholder="Roll Number (e.g. FA21-BSE-000)"
                  value={guestRollNumber}
                  onChange={e => setGuestRollNumber(e.target.value)}
                  className="w-full sm:w-64 bg-[#1A1A1A] border border-white/10 rounded-lg py-2 px-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm font-mono"
                />
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-sm text-gray-500">Count:</span>
                  <input
                    type="number"
                    min="1"
                    value={guestCount}
                    onChange={e => setGuestCount(parseInt(e.target.value) || 1)}
                    className="w-20 bg-[#1A1A1A] border border-white/10 rounded-lg py-2 px-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!guestRollNumber.trim()}
                  className="w-full sm:w-auto px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
