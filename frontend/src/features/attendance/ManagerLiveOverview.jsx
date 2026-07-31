import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users, CheckCircle, Activity, Coffee, Sunset, Moon,
  Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  Search, ArrowUpDown, RotateCcw, X, AlertCircle, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { useGetLiveOverviewData } from '../../hooks/queries/useAttendanceQueries';
import { useRespondGuestPermission } from '../../hooks/mutations/useAttendanceMutations';
import LoadingScreen from '../../components/ui/LoadingScreen';
import toast from 'react-hot-toast';

const todayStr = () => new Date().toISOString().split('T')[0];

export default function LiveOverview() {
  const { user } = useAuth();
  const { socket } = useSocket(user?.hostelId);

  const [selectedDate, setSelectedDate] = useState(todayStr());
  const { data: liveResponse, isLoading, isFetching, isError, error } = useGetLiveOverviewData(selectedDate);

  const [mealsData, setMealsData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default'); // default | name | roll | status
  const [flashedRolls, setFlashedRolls] = useState(new Set());
  const flashTimers = useRef({});
  const requestTimeoutRef = useRef(null);

  const [activeGuestRequest, setActiveGuestRequest] = useState(null);
  const { mutateAsync: respondToGuest } = useRespondGuestPermission();

  const isToday = selectedDate === todayStr();

  // Effect to load initial data
  useEffect(() => {
    if (liveResponse?.data) {
      setMealsData(liveResponse.data);
    }
    setSearchQuery('');
  }, [liveResponse]);

  // Effect for Socket Updates
  useEffect(() => {
    if (!socket) return;

    socket.on('attendance_success', (data) => {
      if (data.date !== selectedDate) return;

      const mType = data.mealType;

      setMealsData(prev => {
        const mealState = prev[mType];
        if (!mealState) return prev;

        let isNewAttendance = false;
        const exists = mealState.data.find(p => p.rollNumber === data.rollNumber);
        let newData = [];

        if (exists) {
          if (!exists.hasAttended) isNewAttendance = true;
          newData = mealState.data.map(p =>
            p.rollNumber === data.rollNumber
              ? { ...p, attendanceCount: data.count, hasAttended: true }
              : p
          );
        } else {
          isNewAttendance = true;
          newData = [{
            name: data.name,
            rollNumber: data.rollNumber,
            isGuest: data.isGuest,
            attendanceCount: data.count,
            selectionCount: data.selectionCount || 0,
            isSelected: (data.selectionCount > 0),
            hasAttended: true
          }, ...mealState.data];
        }

        return {
          ...prev,
          [mType]: {
            ...mealState,
            data: newData,
            summary: {
              ...mealState.summary,
              totalAttendance: isNewAttendance ? mealState.summary.totalAttendance + 1 : mealState.summary.totalAttendance
            }
          }
        };
      });

      // Show the confirmation card
      toast.success(`${data.name} marked present! (Count: ${data.count || 1})`, { 
        id: `scan_${data.rollNumber}`,
        iconTheme: {
          primary: '#10b981', // emerald-500
          secondary: '#fff',
        },
      });

      // Flash the updated row
      setFlashedRolls(prev => new Set(prev).add(data.rollNumber));
      clearTimeout(flashTimers.current[data.rollNumber]);
      flashTimers.current[data.rollNumber] = setTimeout(() => {
        setFlashedRolls(prev => {
          const next = new Set(prev);
          next.delete(data.rollNumber);
          return next;
        });
      }, 2500);
    });

    socket.on('guest_permission_request', (requestData) => {
      setActiveGuestRequest(requestData);
      
      // Auto-cancel after 10 seconds
      if (requestTimeoutRef.current) clearTimeout(requestTimeoutRef.current);
      requestTimeoutRef.current = setTimeout(() => {
        handleRespondGuest(requestData, false); // auto reject
      }, 10000);
    });

    return () => {
      socket.off('attendance_success');
      socket.off('guest_permission_request');
      if (requestTimeoutRef.current) clearTimeout(requestTimeoutRef.current);
    };
  }, [socket, selectedDate]);

  useEffect(() => {
    const timers = flashTimers.current;
    return () => Object.values(timers).forEach(clearTimeout);
  }, []);

  const handleRespondGuest = async (requestData, isApproved) => {
    if (requestTimeoutRef.current) clearTimeout(requestTimeoutRef.current);
    setActiveGuestRequest(null);

    try {
      await respondToGuest({
        requestId: requestData.requestId,
        studentId: requestData.studentId,
        isApproved
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    if (isToday) return; 
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleJumpToToday = () => setSelectedDate(todayStr());

  const getMealIcon = (type) => {
    switch (type) {
      case 'Breakfast': return <Coffee className="w-5 h-5" />;
      case 'Lunch': return <Sunset className="w-5 h-5" />;
      case 'Dinner': return <Moon className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const cycleSort = () => {
    setSortBy(prev => {
      if (prev === 'default') return 'status';
      if (prev === 'status') return 'name';
      if (prev === 'name') return 'roll';
      return 'default';
    });
  };

  const sortLabel = {
    default: 'Default order',
    status: 'Sort: Status',
    name: 'Sort: Name',
    roll: 'Sort: Roll No.'
  }[sortBy];

  const handleExport = () => {
    if (!liveResponse?.mealTypes?.length) return;
    const workbook = XLSX.utils.book_new();

    liveResponse.mealTypes.forEach(mealType => {
      const mealState = mealsData[mealType];
      if (!mealState?.data?.length) return;

      const excelData = mealState.data.map(student => ({
        'Student Name': student.name,
        'Roll No.': student.rollNumber,
        'Guest': student.isGuest ? 'Yes' : 'No',
        'Selections': student.selectionCount,
        'Attendance': student.attendanceCount,
        'Status': student.hasAttended ? 'Present' : 'Absent'
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, mealType);
    });

    if (workbook.SheetNames.length > 0) {
      XLSX.writeFile(workbook, `Daily_Overview_${selectedDate}.xlsx`);
    }
  };

  // Helper to get processed data for a specific meal
  const getProcessedData = (mealType) => {
    const rawData = mealsData[mealType]?.data || [];
    let result = rawData;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(s =>
        s.name?.toLowerCase().includes(q) || String(s.rollNumber).toLowerCase().includes(q)
      );
    }

    if (sortBy === 'name') {
      result = [...result].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'roll') {
      result = [...result].sort((a, b) => String(a.rollNumber).localeCompare(String(b.rollNumber), undefined, { numeric: true }));
    } else if (sortBy === 'status') {
      result = [...result].sort((a, b) => Number(b.hasAttended) - Number(a.hasAttended));
    }

    return result;
  };

  if (isLoading && !liveResponse) return <LoadingScreen />;

  return (
    <div className="space-y-6 pb-12 relative">
      <AnimatePresence>
        {activeGuestRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              initial={{ y: "100%", opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-2xl w-full max-w-sm shadow-2xl flex flex-col items-center text-center relative overflow-hidden mb-2 sm:mb-0"
            >
              {/* Optional pull pill for mobile aesthetics */}
              <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-4 sm:hidden" />

              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center mb-4 sm:mb-5">
                <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600 dark:text-amber-500" />
              </div>
              <h3 className="text-zinc-900 dark:text-zinc-50 font-bold text-lg sm:text-xl leading-tight mb-2">
                {activeGuestRequest.reason === 'guest' ? 'Guest Request' : 'Permission Required'}
              </h3>
              
              {activeGuestRequest.reason === 'unselected' ? (
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 sm:mb-8">
                  <strong className="text-zinc-900 dark:text-zinc-200">{activeGuestRequest.name}</strong> ({activeGuestRequest.rollNumber}) did not reserve this meal. Allow walk-in?
                </p>
              ) : activeGuestRequest.reason === 'extra_meal' ? (
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 sm:mb-8">
                  <strong className="text-zinc-900 dark:text-zinc-200">{activeGuestRequest.name}</strong> ({activeGuestRequest.rollNumber}) has reached their limit. Allow extra meal?
                </p>
              ) : (
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 sm:mb-8">
                  <strong className="text-zinc-900 dark:text-zinc-200">{activeGuestRequest.name}</strong> ({activeGuestRequest.rollNumber}) from another hostel wants to eat here.
                </p>
              )}
              
              <div className="flex gap-3 w-full relative z-10">
                <button 
                  onClick={() => handleRespondGuest(activeGuestRequest, true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 sm:py-3 rounded-xl font-semibold transition-all text-sm shadow-sm active:scale-95"
                >
                  Accept
                </button>
                <button 
                  onClick={() => handleRespondGuest(activeGuestRequest, false)}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 py-3.5 sm:py-3 rounded-xl font-semibold transition-all text-sm shadow-sm active:scale-95"
                >
                  Reject
                </button>
              </div>
              
              <motion.div 
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 10, ease: "linear" }}
                className="absolute bottom-0 left-0 h-1.5 bg-amber-500"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Date Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Activity className="text-primary-500 w-5 h-5 shrink-0" />
            Daily Overview
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Monitor meal selections and live attendance</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden w-full sm:w-auto">
            <button
              onClick={handlePrevDay}
              aria-label="Previous day"
              className="p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:bg-zinc-100 dark:active:bg-zinc-700 transition-colors text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 flex items-center justify-center border-r border-zinc-200 dark:border-zinc-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 min-w-[150px]">
              <CalendarIcon className="w-4 h-4 text-primary-500 dark:text-primary-400" />
              <span className="text-zinc-900 dark:text-zinc-50 text-sm font-medium">
                {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <button
              onClick={handleNextDay}
              disabled={isToday}
              aria-label="Next day"
              className={`p-2.5 transition-colors flex items-center justify-center border-l border-zinc-200 dark:border-zinc-700 ${
                isToday 
                  ? 'bg-zinc-50 dark:bg-zinc-950 text-zinc-300 dark:text-zinc-700 cursor-not-allowed' 
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 active:bg-zinc-100 dark:active:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isToday && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleJumpToToday}
              className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 shadow-sm hover:shadow text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 rounded-lg text-sm font-medium transition-all w-full sm:w-auto flex justify-center items-center"
            >
              Today
            </motion.button>
          )}
        </div>
      </div>

      {isError ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-red-200 font-medium mb-1">Failed to load daily overview</p>
          <p className="text-red-400/80 text-sm">{error?.response?.data?.message || error?.message || 'An unexpected error occurred.'}</p>
        </div>
      ) : liveResponse?.mealTypes?.length > 0 ? (
        <>
          {/* Top Section: Meal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveResponse.mealTypes.map(meal => {
              const summary = mealsData[meal]?.summary || { totalSelections: 0, totalAttendance: 0 };
              const attendanceRate = summary.totalSelections > 0
                ? Math.min(100, Math.round((summary.totalAttendance / summary.totalSelections) * 100))
                : 0;
              
              return (
                <div key={meal} className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm overflow-hidden relative">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl">
                        {getMealIcon(meal)}
                      </div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{meal}</h3>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Selections</p>
                      <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{summary.totalSelections}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Attended</p>
                      <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{summary.totalAttendance}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-2">
                      <span className="text-zinc-500 dark:text-zinc-400">Coverage</span>
                      <span className="text-primary-600 dark:text-primary-400 font-bold">{attendanceRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${attendanceRate}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-primary-500 rounded-full" 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unified Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50 dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl mt-8">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 hidden md:block">Student Sheets</h3>
            <div className="flex w-full md:w-auto flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name or roll no..."
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-9 pr-8 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={cycleSort}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span>{sortLabel}</span>
                </button>
                <button
                  onClick={handleExport}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Student Sheets Container */}
          <div className="space-y-8 mt-6">
            {liveResponse.mealTypes.map(meal => {
              const currentData = getProcessedData(meal);
              const summary = mealsData[meal]?.summary || { totalSelections: 0, totalAttendance: 0 };
              
              if (currentData.length === 0 && !searchQuery) return null;

              return (
                <div key={meal} className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="text-primary-500">
                        {getMealIcon(meal)}
                      </div>
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">{meal} Sheet</h4>
                    </div>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                      {currentData.length} records
                    </span>
                  </div>

                  {currentData.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <Search className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mb-3" />
                      <p className="text-zinc-500 dark:text-zinc-400 font-medium">No students match "{searchQuery}" in {meal}</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop/Tablet View */}
                      <div className="hidden sm:block overflow-x-auto max-h-[400px] overflow-y-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                              <th className="py-3 px-5 text-zinc-500 dark:text-zinc-400 font-semibold text-xs uppercase tracking-wider">Student Name</th>
                              <th className="py-3 px-5 text-zinc-500 dark:text-zinc-400 font-semibold text-xs uppercase tracking-wider">Roll No.</th>
                              <th className="py-3 px-5 text-zinc-500 dark:text-zinc-400 font-semibold text-xs uppercase tracking-wider text-right">Selections</th>
                              <th className="py-3 px-5 text-zinc-500 dark:text-zinc-400 font-semibold text-xs uppercase tracking-wider text-right">Attendance</th>
                              <th className="py-3 px-5 text-zinc-500 dark:text-zinc-400 font-semibold text-xs uppercase tracking-wider text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {currentData.map((student) => (
                              <motion.tr
                                layout
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.15 }}
                                key={student.rollNumber}
                                className={`transition-colors duration-500 ${
                                  flashedRolls.has(student.rollNumber) ? 'bg-primary-50 dark:bg-primary-900/10' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                                }`}
                              >
                                <td className="py-3.5 px-5 text-sm text-zinc-900 dark:text-zinc-50 font-medium">
                                  {student.name}
                                  {student.isGuest && (
                                    <span className="ml-2 text-[10px] font-bold tracking-wide uppercase bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-900/50 px-2 py-0.5 rounded-md">Guest</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-5 text-sm text-zinc-500 dark:text-zinc-400">{student.rollNumber}</td>
                                <td className="py-3.5 px-5 text-sm font-semibold text-zinc-900 dark:text-zinc-50 text-right">{student.selectionCount}</td>
                                <td className="py-3.5 px-5 text-sm font-semibold text-zinc-900 dark:text-zinc-50 text-right">{student.attendanceCount}</td>
                                <td className="py-3.5 px-5 text-center">
                                  {student.hasAttended ? (
                                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                                      Present
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                                      Absent
                                    </span>
                                  )}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile View */}
                      <div className="sm:hidden divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[500px] overflow-y-auto bg-zinc-50/50 dark:bg-zinc-900/20">
                        {currentData.map((student) => (
                          <motion.div
                            layout
                            key={student.rollNumber}
                            className={`p-4 transition-colors duration-500 ${
                              flashedRolls.has(student.rollNumber) ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                                {student.name}
                                {student.isGuest && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-900/50 px-1.5 py-0.5 rounded-md">Guest</span>
                                )}
                              </div>
                              {student.hasAttended ? (
                                <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                                  Present
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                                  Absent
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-950 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 shadow-sm">
                              <span className="font-medium">Roll: {student.rollNumber}</span>
                              <div className="flex gap-4">
                                <span>Sel: <strong className="text-zinc-900 dark:text-zinc-50 font-bold">{student.selectionCount}</strong></span>
                                <span>Att: <strong className="text-zinc-900 dark:text-zinc-50 font-bold">{student.attendanceCount}</strong></span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <CalendarIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">No Schedule Configured</h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">This hostel does not have a meal schedule or timings set up yet. Configure meal settings first to view the daily overview.</p>
        </div>
      )}
    </div>
  );
}