import { useState, useEffect } from "react";
import {
  Calendar,
  Save,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  Utensils
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWeeklySelections, useMenuSchedule } from "../../hooks/queries/useStudentQueries";
import { useUpdateMealSelections } from "../../hooks/mutations/useStudentMutations";

const getLocalDateString = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const getEffectiveToday = () => {
  const now = new Date();
  if (now.getHours() < 5) now.setDate(now.getDate() - 1);
  return getLocalDateString(now);
};

const getCurrentWeekDates = () => {
  const now = new Date();
  const effectiveNow = new Date(now);
  if (now.getHours() < 5) effectiveNow.setDate(effectiveNow.getDate() - 1);

  const dates = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(effectiveNow);
    d.setDate(effectiveNow.getDate() + i);
    dates.push({
      dayName: d.toLocaleDateString("en-US", { weekday: "long" }),
      dateString: getLocalDateString(d),
      shortDay: d.toLocaleDateString("en-US", { weekday: "short" })
    });
  }
  return dates;
};

// Helper to extract valid meal types dynamically from the menu for a given day
const extractMealTypes = (menuDataForDay) => {
  if (!menuDataForDay) return [];
  return Object.keys(menuDataForDay).filter(key => {
    // Only keep keys that are likely meals (not prices, IDs, or metadata)
    return !key.toLowerCase().includes('price') && 
           !key.startsWith('_') && 
           typeof menuDataForDay[key] === 'string' &&
           menuDataForDay[key].trim() !== '';
  });
};

export default function WeeklyMealSelection() {
  const weekDates = getCurrentWeekDates();
  const dateRangeString = weekDates.map((d) => d.dateString).join(",");

  const [attendance, setAttendance] = useState({});

  const { data: serverSelections, isLoading: isSelectionsLoading, isError, refetch } = useWeeklySelections(dateRangeString);
  const { data: menuSchedule } = useMenuSchedule();
  const saveMutation = useUpdateMealSelections();

  useEffect(() => {
    const initialState = {};
    // Determine dynamic meals for each day based on schedule to initialize properly
    weekDates.forEach((day) => {
      const dayData = menuSchedule?.menuData?.[day.dayName] || menuSchedule?.[day.dayName] || {};
      const mealsForDay = extractMealTypes(dayData);
      
      const dayDefaults = {};
      mealsForDay.forEach(meal => { dayDefaults[meal] = false; });
      // If no schedule yet, fallback to empty object
      initialState[day.dateString] = dayDefaults;
    });

    if (serverSelections && Array.isArray(serverSelections)) {
      serverSelections.forEach((record) => {
        if (initialState[record.date] !== undefined) {
          // Merge server data with our dynamic keys
          const updatedRecord = { ...initialState[record.date] };
          Object.keys(updatedRecord).forEach(mealKey => {
             if (record[mealKey] !== undefined) updatedRecord[mealKey] = record[mealKey];
          });
          initialState[record.date] = updatedRecord;
        }
      });
    }
    setAttendance(initialState);
  }, [serverSelections, menuSchedule]); // Re-run if schedule or selections arrive

  const isDirty = (() => {
    if (Object.keys(attendance).length === 0) return false;
    return weekDates.some(({ dateString }) => {
      const current = attendance[dateString];
      const original = serverSelections?.find((s) => s.date === dateString) || {};
      return Object.keys(current).some(meal => current[meal] !== !!original[meal]);
    });
  })();

  const toggleMeal = (dateString, mealType) => {
    const todayStr = getEffectiveToday();
    if (dateString <= todayStr) return; // Locked

    setAttendance((prev) => ({
      ...prev,
      [dateString]: {
        ...prev[dateString],
        [mealType]: !prev[dateString]?.[mealType],
      },
    }));
  };

  const handleSave = () => {
    const payload = Object.entries(attendance).map(([date, meals]) => {
      const dayObj = weekDates.find((d) => d.dateString === date);
      const dayName = dayObj ? dayObj.dayName : null;
      
      const dayMenu = menuSchedule?.menuData?.[dayName] || menuSchedule?.[dayName] || {};

      const record = { date };
      // Dynamically map meals and prices
      Object.entries(meals).forEach(([meal, isSelected]) => {
        record[meal] = isSelected;
        record[`${meal}Price`] = dayMenu[`${meal}Price`] || 0;
      });
      return record;
    });
    saveMutation.mutate(payload);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 glass-panel rounded-[2rem] text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4 animate-bounce" />
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Error Loading Data</h3>
        <button onClick={() => refetch()} className="px-6 py-2 bg-slate-900 dark:bg-white dark:text-black text-white font-bold rounded-xl flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (isSelectionsLoading || Object.keys(attendance).length === 0) {
    return (
      <div className="flex items-center justify-center h-64 glass-panel rounded-[2rem]">
         <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Premium Sticky Action Header */}
      <div className="sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 glass-panel rounded-3xl shadow-sm">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />
            Weekly Menu Plan
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-[#94a3b8]">
            Customize your meals. Locked days cannot be changed.
          </p>
        </div>
        
        <motion.button
          whileHover={!saveMutation.isPending && isDirty ? { scale: 1.02 } : {}}
          whileTap={!saveMutation.isPending && isDirty ? { scale: 0.98 } : {}}
          onClick={handleSave}
          disabled={saveMutation.isPending || !isDirty}
          className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold tracking-wide transition-all ${
            !isDirty
              ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
              : "bg-indigo-600 dark:bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 dark:hover:bg-indigo-400"
          }`}
        >
          {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saveMutation.isPending ? "Saving..." : "Save Preferences"}
        </motion.button>
      </div>

      {/* Days Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AnimatePresence>
          {weekDates.map(({ dayName, dateString, shortDay }, idx) => {
            const todayStr = getEffectiveToday();
            const isPastOrToday = dateString <= todayStr;
            const isEditable = !isPastOrToday;
            
            const dayMenu = menuSchedule?.menuData?.[dayName] || menuSchedule?.[dayName] || {};
            const availableMeals = extractMealTypes(dayMenu);

            return (
              <motion.div 
                key={dateString}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-6 rounded-[2rem] border transition-colors relative overflow-hidden ${
                  isPastOrToday 
                    ? 'bg-slate-50/50 dark:bg-[#0f172a]/30 border-slate-200/50 dark:border-white/5 opacity-80' 
                    : 'glass-panel border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/30'
                }`}
              >
                {/* Decorative background element */}
                {!isPastOrToday && (
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                )}

                <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-white/10 pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                      isPastOrToday ? 'bg-slate-200 dark:bg-slate-800 text-slate-400' : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {shortDay}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">{dayName}</h3>
                      <p className="text-xs font-bold text-slate-500 dark:text-[#94a3b8]">{dateString}</p>
                    </div>
                  </div>
                  {isPastOrToday && (
                    <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                      Locked
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {availableMeals.length === 0 ? (
                    <div className="text-center py-4 text-sm font-semibold text-slate-400">No meals scheduled</div>
                  ) : (
                    availableMeals.map((mealType) => {
                      const dishName = dayMenu[mealType];
                      const isSelected = attendance[dateString]?.[mealType] || false;

                      return (
                        <motion.button
                          key={mealType}
                          whileHover={isEditable ? { scale: 1.01 } : {}}
                          whileTap={isEditable ? { scale: 0.98 } : {}}
                          onClick={() => toggleMeal(dateString, mealType)}
                          disabled={!isEditable}
                          className={`w-full text-left relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${
                            !isEditable ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                          } ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50/50 dark:border-indigo-400/50 dark:bg-indigo-500/10 shadow-sm'
                              : 'border-transparent bg-slate-100 dark:bg-[#1e293b] hover:bg-slate-200 dark:hover:bg-[#334155]'
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {isSelected ? (
                              <CheckCircle2 className={`w-6 h-6 flex-shrink-0 ${isEditable ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                            ) : (
                              <div className="w-6 h-6 flex-shrink-0 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                            )}
                            
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-[#94a3b8] mb-0.5">
                                {mealType}
                              </p>
                              <p className={`font-bold truncate text-sm sm:text-base ${isSelected ? 'text-indigo-950 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                {dishName}
                              </p>
                            </div>
                          </div>
                          
                          {/* Animated Toggle Switch */}
                          <div className={`relative flex items-center justify-center w-12 h-6 rounded-full transition-colors duration-300 shrink-0 ${
                            isSelected ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}>
                            <motion.div
                              layout
                              className="w-4 h-4 bg-white rounded-full shadow-sm"
                              animate={{ x: isSelected ? 10 : -10 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          </div>
                        </motion.button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
