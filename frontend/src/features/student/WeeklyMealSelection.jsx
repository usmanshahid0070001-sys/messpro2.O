import { useState, useEffect } from 'react';
import { useMealSchedule } from '../../hooks/queries/useMealQueries';
import { Save, Utensils, CheckCircle2, Circle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const STATIC_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const getCurrentDayPK = () => {
  const options = { timeZone: 'Asia/Karachi', weekday: 'long' };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(new Date());
  return parts.find(p => p.type === 'weekday').value;
};

const getPKCurrentMinutes = () => {
  const now = new Date();
  const options = { timeZone: 'Asia/Karachi', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' };
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(now);
  let hour = 0, minute = 0;
  parts.forEach(p => {
    if (p.type === 'hour') hour = parseInt(p.value, 10);
    if (p.type === 'minute') minute = parseInt(p.value, 10);
  });
  return hour * 60 + minute;
};

const hasTimePassedInPK = (selectionTimeString) => {
  if (!selectionTimeString) return false;
  const match = selectionTimeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return false;
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  const selectionTotalMinutes = hours * 60 + minutes;
  const currentTotalMinutes = getPKCurrentMinutes();
  
  return currentTotalMinutes >= selectionTotalMinutes;
};

const getShiftedDays = (currentDay) => {
  const idx = STATIC_DAYS.indexOf(currentDay);
  if (idx === -1) return STATIC_DAYS;
  return [...STATIC_DAYS.slice(idx), ...STATIC_DAYS.slice(0, idx)];
};

const getDateForShiftedIndex = (index) => {
  const futureDate = new Date(Date.now() + index * 24 * 60 * 60 * 1000);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    month: 'short',
    day: 'numeric'
  });
  return formatter.format(futureDate);
};

export default function WeeklyMealSelection() {
  const { data: scheduleData, isLoading, isError, refetch } = useMealSchedule();

  const [status, setStatus] = useState("Active");
  const [meals, setMeals] = useState([]);
  const [menu, setMenu] = useState({});
  const [selections, setSelections] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  
  const currentDayPK = getCurrentDayPK();
  const shiftedDays = getShiftedDays(currentDayPK);

  useEffect(() => {
    if (scheduleData && scheduleData.data) {
      const parsed = scheduleData.data;
      setStatus(parsed.status === 'inactive' ? 'Inactive' : 'Active');

      const loadedMeals = (parsed.mealNames || []).map((name, idx) => ({
        id: idx.toString(),
        name: name,
        endTime: (parsed.selectionTiming || [])[idx] || ''
      }));
      setMeals(loadedMeals);

      const loadedMenu = parsed.menu || {};
      const safeMenu = {};
      const initialSelections = {};

      STATIC_DAYS.forEach(day => {
        const dayArray = loadedMenu[day] || [];
        safeMenu[day] = {};
        initialSelections[day] = {};

        loadedMeals.forEach((meal, idx) => {
          const item = dayArray[idx];
          safeMenu[day][meal.id] = {
            foodName: item?.meal === 'none' ? '' : (item?.meal || ''),
            price: item?.price || 0
          };
          initialSelections[day][meal.id] = false; // Default to unselected
        });
      });
      setMenu(safeMenu);
      setSelections(initialSelections);
    }
  }, [scheduleData]);

  const toggleSelection = (day, mealId) => {
    setIsDirty(true);
    setSelections(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealId]: !prev[day][mealId]
      }
    }));
  };

  const handleSaveSelection = () => {
    console.log("Saving selections:", selections);
    setIsDirty(false);
    alert("Selections saved successfully! (API Integration Pending)");
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-[#222] rounded w-48 mb-2"></div>
        <div className="h-40 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl w-full mt-8"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg flex items-center justify-between gap-4">
          <span>Failed to load weekly menu. Please try again.</span>
          <button onClick={() => refetch()} className="shrink-0 px-3 py-1.5 text-sm font-medium rounded-md border border-red-300 hover:bg-red-100 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (status === 'Inactive' || meals.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-[#e5e5e5] dark:border-[#333333] rounded-2xl bg-[#fafafa] dark:bg-[#111111]">
        <Utensils className="w-12 h-12 mx-auto text-[#a3a3a3] mb-4" />
        <h3 className="text-lg font-bold text-[#111111] dark:text-white mb-2">No Menu Available</h3>
        <p className="text-sm text-[#737373]">The mess module is currently inactive or no meals have been configured by the admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 lg:p-8 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#111111] dark:text-white">Weekly Meal Selection</h1>
          <p className="mt-1 text-sm font-medium text-[#737373] dark:text-[#a0a0a0]">
            Opt-in or out of your upcoming meals.
          </p>
        </div>
        <button
          onClick={handleSaveSelection}
          disabled={!isDirty}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          <Save className="w-4 h-4" />
          Save Selections
        </button>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {shiftedDays.map((day, i) => {
          const isToday = day === currentDayPK;
          
          return (
            <motion.div 
              key={day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white dark:bg-[#0a0a0a] rounded-2xl overflow-hidden shadow-sm transition-all ${isToday ? 'border-2 border-blue-500 shadow-blue-500/10' : 'border border-[#e5e5e5] dark:border-[#222222]'}`}
            >
              <div className={`px-5 py-3 border-b flex items-center justify-between ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-[#fafafa] dark:bg-[#111111] border-[#e5e5e5] dark:border-[#222222]'}`}>
                <h3 className={`font-bold ${isToday ? 'text-blue-700 dark:text-blue-300' : 'text-[#111111] dark:text-white'}`}>
                  {day}
                </h3>
                {isToday ? (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200">Today</span>
                ) : (
                  <span className="text-xs font-medium text-[#737373]">{getDateForShiftedIndex(i)}</span>
                )}
              </div>
              <div className="p-5 flex flex-col gap-4">
                {meals.map(meal => {
                  const cellData = menu[day]?.[meal.id];
                  const hasFood = cellData && cellData.foodName !== '';
                  const isSelected = selections[day]?.[meal.id];
                  
                  const isLocked = isToday && hasTimePassedInPK(meal.endTime);
                  
                  let stateClass = "";
                  if (!hasFood) {
                    stateClass = "opacity-50 grayscale cursor-not-allowed border-transparent bg-gray-50 dark:bg-[#111]";
                  } else if (isLocked) {
                    if (isSelected) {
                      stateClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 cursor-not-allowed";
                    } else {
                      stateClass = "opacity-50 grayscale cursor-not-allowed border-transparent bg-gray-50 dark:bg-[#111]";
                    }
                  } else {
                    stateClass = isSelected 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 cursor-pointer transition-all" 
                      : "border-[#e5e5e5] dark:border-[#333] hover:border-blue-300 cursor-pointer transition-all";
                  }

                  return (
                    <div 
                      key={meal.id} 
                      onClick={() => {
                        if (hasFood && !isLocked) toggleSelection(day, meal.id);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border ${stateClass}`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#737373] uppercase tracking-wider">{meal.name}</span>
                          {meal.endTime && <span className="text-[10px] font-semibold text-[#a3a3a3] bg-[#f5f5f5] dark:bg-[#222] px-1.5 py-0.5 rounded">Ends {meal.endTime}</span>}
                        </div>
                        <span className={`text-sm font-semibold ${isSelected && !isLocked ? 'text-blue-900 dark:text-blue-100' : (isLocked && isSelected ? 'text-emerald-900 dark:text-emerald-100' : 'text-[#111111] dark:text-white')}`}>
                          {hasFood ? cellData.foodName : 'Not Served'}
                        </span>
                        {hasFood && cellData.price > 0 && (
                          <span className="text-xs font-medium text-[#737373] mt-0.5">Rs. {cellData.price}</span>
                        )}
                      </div>
                      {hasFood && (
                        <div className="shrink-0 ml-4">
                          {isLocked ? (
                            isSelected ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Lock className="w-5 h-5 text-[#d4d4d4] dark:text-[#444]" />
                          ) : (
                            isSelected ? <CheckCircle2 className="w-6 h-6 text-blue-500" /> : <Circle className="w-6 h-6 text-[#d4d4d4] dark:text-[#444]" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
