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
import { useGetDailyOverview } from '../../hooks/queries/useAttendanceQueries';
import LoadingScreen from '../../components/ui/LoadingScreen';

const todayStr = () => new Date().toISOString().split('T')[0];

export default function LiveOverview() {
  const { user } = useAuth();
  const { socket } = useSocket(user?.hostelId);

  // Default to today
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const { data: liveResponse, isLoading, isFetching, isError, error } = useGetDailyOverview(selectedDate);

  const [activeTab, setActiveTab] = useState(null);
  const [mealsData, setMealsData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default'); // default | name | roll | status
  const [flashedRolls, setFlashedRolls] = useState(new Set());
  const flashTimers = useRef({});

  const isToday = selectedDate === todayStr();

  // Effect to load initial data
  useEffect(() => {
    if (liveResponse?.data) {
      setMealsData(liveResponse.data);
    }

    if (liveResponse?.mealTypes?.length > 0 && (!activeTab || !liveResponse.mealTypes.includes(activeTab))) {
      setActiveTab(liveResponse.mealTypes[0]);
    } else if (liveResponse?.mealTypes?.length === 0) {
      setActiveTab(null);
    }
    
    // Clear search when date changes so filters don't silently hide data on a new day
    setSearchQuery('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    return () => {
      socket.off('attendance_success');
    };
  }, [socket, selectedDate]);

  useEffect(() => {
    const timers = flashTimers.current;
    return () => Object.values(timers).forEach(clearTimeout);
  }, []);


  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    if (isToday) return; // no point navigating into a future date with no data
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleJumpToToday = () => setSelectedDate(todayStr());

  const getMealIcon = (type) => {
    switch (type) {
      case 'Breakfast': return <Coffee className="w-4 h-4" />;
      case 'Lunch': return <Sunset className="w-4 h-4" />;
      case 'Dinner': return <Moon className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const currentMealState = mealsData[activeTab] || { data: [], summary: { totalSelections: 0, totalAttendance: 0 } };
  const rawData = currentMealState.data || [];
  const summary = currentMealState.summary || { totalSelections: 0, totalAttendance: 0 };
  const attendanceRate = summary.totalSelections > 0
    ? Math.round((summary.totalAttendance / summary.totalSelections) * 100)
    : 0;

  const currentData = useMemo(() => {
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
  }, [rawData, searchQuery, sortBy]);

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
    if (!currentData || currentData.length === 0) return;
    
    const excelData = currentData.map(student => ({
      'Student Name': student.name,
      'Roll No.': student.rollNumber,
      'Guest': student.isGuest ? 'Yes' : 'No',
      'Selections': student.selectionCount,
      'Attendance': student.attendanceCount,
      'Status': student.hasAttended ? 'Present' : 'Absent'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Overview");
    XLSX.writeFile(workbook, `Daily_Overview_${activeTab}_${selectedDate}.xlsx`);
  };

  if (isLoading && !liveResponse) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      {/* Header and Date Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Activity className="text-primary-500 w-5 h-5 shrink-0" />
            Daily Overview
          </h2>
          <p className="text-[#a3a3a3] text-sm mt-1">Monitor meal selections and live attendance</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-[#171717] rounded-lg border border-white/10 w-full sm:w-auto">
            <button
              onClick={handlePrevDay}
              aria-label="Previous day"
              className="p-2 hover:bg-white/5 active:bg-white/10 rounded-l-lg transition-colors text-[#a3a3a3] hover:text-white shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 px-4 py-2 border-x border-white/10 min-w-[140px]">
              <CalendarIcon className="w-4 h-4 text-primary-400 shrink-0" />
              <span className="text-white text-sm font-medium">
                {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <button
              onClick={handleNextDay}
              disabled={isToday}
              aria-label="Next day"
              className={`p-2 rounded-r-lg transition-colors shrink-0 ${
                isToday ? 'text-[#525252] cursor-not-allowed' : 'text-[#a3a3a3] hover:text-white hover:bg-white/5 active:bg-white/10'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isToday && (
            <button
              onClick={handleJumpToToday}
              className="px-3 py-2 bg-[#171717] border border-white/10 hover:bg-white/5 hover:border-white/20 text-[#a3a3a3] hover:text-white rounded-lg text-sm font-medium transition-colors"
            >
              Today
            </button>
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
          {/* Meal Tabs */}
          <div className="flex flex-wrap gap-2">
            {liveResponse.mealTypes.map(meal => (
              <button
                key={meal}
                onClick={() => setActiveTab(meal)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  activeTab === meal
                    ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                    : 'bg-[#171717] border-white/5 text-[#a3a3a3] hover:text-white hover:border-white/10 hover:bg-white/5'
                }`}
              >
                {getMealIcon(meal)}
                {meal}
              </button>
            ))}
          </div>

          {activeTab && (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-[#171717] rounded-lg p-5 border border-white/5 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-[#a3a3a3] mb-3">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Total Selections</span>
                  </div>
                  <span className="text-3xl font-semibold text-white">{summary?.totalSelections || 0}</span>
                </div>

                <div className="bg-[#171717] rounded-lg p-5 border border-white/5 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-[#a3a3a3] mb-3">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Total Attendance</span>
                  </div>
                  <span className="text-3xl font-semibold text-white">{summary?.totalAttendance || 0}</span>
                </div>

                <div className="bg-[#171717] rounded-lg p-5 border border-white/5 col-span-2 lg:col-span-1 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-[#a3a3a3] mb-3">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm font-medium">Attendance Rate</span>
                  </div>
                  <div className="flex items-end justify-between w-full">
                    <span className="text-3xl font-semibold text-white">{attendanceRate}%</span>
                    <div className="w-3/5 h-2 bg-[#262626] rounded-full overflow-hidden mb-2">
                      <motion.div
                        className="h-full bg-primary-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${attendanceRate}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Table Container */}
              <div className="bg-[#171717] rounded-lg border border-white/5 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <h3 className="text-base font-medium text-white">Student Sheet</h3>
                    {isFetching && !isLoading && (
                      <span className="w-3.5 h-3.5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>

                  <div className="flex w-full sm:w-auto items-center gap-2">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search name or roll no."
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-md pl-9 pr-8 py-1.5 text-sm text-white placeholder-[#737373] focus:outline-none focus:border-primary-500/50"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#737373] hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={cycleSort}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-[#a3a3a3] bg-[#0a0a0a] hover:text-white hover:bg-white/5 border border-white/10 transition-colors whitespace-nowrap"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                      <span className="hidden sm:inline">{sortLabel}</span>
                    </button>
                    <button
                      onClick={handleExport}
                      disabled={currentData.length === 0}
                      className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                        currentData.length === 0
                          ? 'bg-[#171717] text-[#525252] border border-white/5 cursor-not-allowed'
                          : 'bg-[#171717] text-[#a3a3a3] hover:text-white hover:bg-white/5 border border-white/10'
                      }`}
                      title="Export to Excel"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Export</span>
                    </button>
                  </div>
                </div>

                {/* Empty states */}
                {rawData.length === 0 ? (
                  <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
                    <CalendarIcon className="w-10 h-10 text-[#404040] mb-3" />
                    <p className="text-[#a3a3a3] font-medium">No records found</p>
                    <p className="text-[#737373] text-sm mt-1">There are no selections or attendance data for {activeTab} on this date.</p>
                  </div>
                ) : currentData.length === 0 ? (
                  <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
                    <Search className="w-10 h-10 text-[#404040] mb-3" />
                    <p className="text-[#a3a3a3] font-medium">No students match "{searchQuery}"</p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-3 text-sm text-primary-400 hover:text-primary-300 font-medium"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Desktop/Tablet View */}
                    <div className="hidden sm:block overflow-x-auto max-h-[500px] overflow-y-auto">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead className="sticky top-0 z-10 bg-[#171717] border-b border-white/5">
                          <tr>
                            <th className="py-3 px-5 text-[#737373] font-medium text-xs uppercase tracking-wider">Student Name</th>
                            <th className="py-3 px-5 text-[#737373] font-medium text-xs uppercase tracking-wider">Roll No.</th>
                            <th className="py-3 px-5 text-[#737373] font-medium text-xs uppercase tracking-wider text-right">Selections</th>
                            <th className="py-3 px-5 text-[#737373] font-medium text-xs uppercase tracking-wider text-right">Attendance</th>
                            <th className="py-3 px-5 text-[#737373] font-medium text-xs uppercase tracking-wider text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {currentData.map((student) => (
                            <motion.tr
                              layout
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.15 }}
                              key={student.rollNumber}
                              className={`transition-colors duration-500 ${
                                flashedRolls.has(student.rollNumber) ? 'bg-primary-500/10' : 'hover:bg-white/5'
                              }`}
                            >
                              <td className="py-3 px-5 text-sm text-white font-medium">
                                {student.name}
                                {student.isGuest && (
                                  <span className="ml-2 text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-md">Guest</span>
                                )}
                              </td>
                              <td className="py-3 px-5 text-sm text-[#a3a3a3]">{student.rollNumber}</td>
                              <td className="py-3 px-5 text-sm text-white text-right">{student.selectionCount}</td>
                              <td className="py-3 px-5 text-sm text-white text-right">{student.attendanceCount}</td>
                              <td className="py-3 px-5 text-center">
                                {student.hasAttended ? (
                                  <span className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                                    Present
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
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
                    <div className="sm:hidden divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                      {currentData.map((student) => (
                        <motion.div
                          layout
                          key={student.rollNumber}
                          className={`p-4 transition-colors duration-500 ${
                            flashedRolls.has(student.rollNumber) ? 'bg-primary-500/10' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-sm text-white flex items-center gap-2">
                              {student.name}
                              {student.isGuest && (
                                <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded-md">Guest</span>
                              )}
                            </div>
                            {student.hasAttended ? (
                              <span className="px-2 py-1 rounded text-[10px] font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                                Present
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded text-[10px] font-medium bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
                                Absent
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-xs text-[#a3a3a3]">
                            <span>Roll: {student.rollNumber}</span>
                            <div className="flex gap-3">
                              <span>Sel: <strong className="text-white font-medium">{student.selectionCount}</strong></span>
                              <span>Att: <strong className="text-white font-medium">{student.attendanceCount}</strong></span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
                
                {rawData.length > 0 && (
                  <div className="px-5 py-3 border-t border-white/5 bg-[#0a0a0a] text-xs text-[#737373] flex justify-between items-center">
                    <span>Showing {currentData.length} records</span>
                    <span>Total selections: {summary?.totalSelections || 0}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="bg-[#171717] border border-white/5 rounded-lg p-12 flex flex-col items-center justify-center text-center">
          <CalendarIcon className="w-12 h-12 text-[#404040] mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Schedule Configured</h3>
          <p className="text-[#a3a3a3] max-w-sm">This hostel does not have a meal schedule or timings set up yet. Configure meal settings first to view the daily overview.</p>
        </div>
      )}
    </div>
  );
}