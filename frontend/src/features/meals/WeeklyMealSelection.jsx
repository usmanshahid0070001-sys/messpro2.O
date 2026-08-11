import { useState, useEffect, useRef } from'react';
import { useMealSchedule } from'../../hooks/queries/useMealQueries';
import { useMyHostel } from'../../hooks/queries/useHostelQueries';
import { useGetStudentSelections } from'../../hooks/queries/useAttendanceQueries';
import { useSaveSelections } from'../../hooks/mutations/useAttendanceMutations';
import { Save, Utensils, CheckCircle2, Circle, Lock } from'lucide-react';
import { motion } from'framer-motion';

const STATIC_DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const getCurrentDay = (timeZone) => {
 try {
 const options = { timeZone, weekday:'long'};
 const formatter = new Intl.DateTimeFormat('en-US', options);
 const parts = formatter.formatToParts(new Date());
 return parts.find(p => p.type ==='weekday').value;
 } catch(e) {
 return new Intl.DateTimeFormat('en-US', { weekday:'long'}).format(new Date());
 }
};

const getCurrentMinutes = (timeZone) => {
 try {
 const now = new Date();
 const options = { timeZone, hour:'numeric', minute:'numeric', hourCycle:'h23'};
 const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(now);
 let hour = 0, minute = 0;
 parts.forEach(p => {
 if (p.type ==='hour') hour = parseInt(p.value, 10);
 if (p.type ==='minute') minute = parseInt(p.value, 10);
 });
 return hour * 60 + minute;
 } catch(e) {
 const now = new Date();
 return now.getHours() * 60 + now.getMinutes();
 }
};

const hasTimePassed = (selectionTimeString, timeZone) => {
 if (!selectionTimeString) return false;
 
 let hours, minutes;
 const match24 = selectionTimeString.match(/^(\d{1,2}):(\d{2})$/);
 if (match24) {
 hours = parseInt(match24[1], 10);
 minutes = parseInt(match24[2], 10);
 } else {
 const match12 = selectionTimeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
 if (!match12) return false;
 hours = parseInt(match12[1], 10);
 minutes = parseInt(match12[2], 10);
 const period = match12[3].toUpperCase();
 if (period ==='PM'&& hours < 12) hours += 12;
 if (period ==='AM'&& hours === 12) hours = 0;
 }
 
 const selectionTotalMinutes = hours * 60 + minutes;
 const currentTotalMinutes = getCurrentMinutes(timeZone);
 
 return currentTotalMinutes >= selectionTotalMinutes;
};

const getShiftedDays = (currentDay) => {
 const idx = STATIC_DAYS.indexOf(currentDay);
 if (idx === -1) return STATIC_DAYS;
 return [...STATIC_DAYS.slice(idx), ...STATIC_DAYS.slice(0, idx)];
};

const getDateForShiftedIndex = (index, timeZone) => {
 const futureDate = new Date(Date.now() + index * 24 * 60 * 60 * 1000);
 try {
 const formatter = new Intl.DateTimeFormat('en-US', {
 timeZone,
 month:'short',
 day:'numeric'
 });
 return formatter.format(futureDate);
 } catch(e) {
 return new Intl.DateTimeFormat('en-US', { month:'short', day:'numeric'}).format(futureDate);
 }
};

const getIsoDateForShiftedIndex = (index, timeZone) => {
 const d = new Date(Date.now() + index * 24 * 60 * 60 * 1000);
 try {
 const formatter = new Intl.DateTimeFormat('en-CA', {
 timeZone, year:'numeric', month:'2-digit', day:'2-digit'
 });
 return formatter.format(d);
 } catch(e) {
 const y = d.getFullYear();
 const m = String(d.getMonth() + 1).padStart(2,'0');
 const day = String(d.getDate()).padStart(2,'0');
 return `${y}-${m}-${day}`;
 }
};

export default function WeeklyMealSelection() {
 const { data: scheduleData, isLoading: isScheduleLoading, isError, refetch } = useMealSchedule();
 const { data: hostelResponse, isLoading: isHostelLoading } = useMyHostel();

 const [status, setStatus] = useState("Active");
 const [meals, setMeals] = useState([]);
 const [menu, setMenu] = useState({});
 const [selections, setSelections] = useState({});
 const initialSelectionsRef = useRef({});
 const [isDirty, setIsDirty] = useState(false);
 const [maxMealSelection, setMaxMealSelection] = useState(1);
 
 const timeZone = hostelResponse?.data?.location ||'Asia/Karachi';
 
 const currentDay = getCurrentDay(timeZone);
 const shiftedDays = getShiftedDays(currentDay);

 const startDate = getIsoDateForShiftedIndex(0, timeZone);
 const endDate = getIsoDateForShiftedIndex(6, timeZone);
 
 const { data: selectionsData, isLoading: isSelectionsLoading } = useGetStudentSelections(startDate, endDate);
 const saveSelectionsMutation = useSaveSelections();

 useEffect(() => {
 if (scheduleData?.data && selectionsData?.data) {
 const parsed = scheduleData.data;
 setStatus(parsed.status ==='inactive'?'Inactive':'Active');
 setMaxMealSelection(parsed.maxMealSelection || 1);

 const loadedMeals = (parsed.mealNames || []).map((name, idx) => ({
 id: idx.toString(),
 name: name,
 endTime: (parsed.selectionTiming || [])[idx] ||''
 }));
 setMeals(loadedMeals);

 const loadedMenu = parsed.menu || {};
 const safeMenu = {};
 const initialSelections = {};
 
 const existingMap = {};
 selectionsData.data.forEach(record => {
 existingMap[`${record.date}_${record.mealType}`] = record.selection?.count || 0;
 });

 const cDay = getCurrentDay(timeZone);
 const sDays = getShiftedDays(cDay);

 sDays.forEach((day, index) => {
 const dayArray = loadedMenu[day] || [];
 safeMenu[day] = {};
 initialSelections[day] = {};
 const isoDate = getIsoDateForShiftedIndex(index, timeZone);

 loadedMeals.forEach((meal, idx) => {
 const item = dayArray[idx];
 safeMenu[day][meal.id] = {
 foodName: item?.meal ==='none'?'': (item?.meal ||''),
 price: item?.price || 0
 };
 const key = `${isoDate}_${meal.name}`;
 initialSelections[day][meal.id] = existingMap[key] || 0;
 });
 });
 setMenu(safeMenu);
 setSelections(initialSelections);
 initialSelectionsRef.current = initialSelections;
 }
 }, [scheduleData, selectionsData, timeZone]);

 const toggleSelection = (day, mealId) => {
 setIsDirty(true);
 setSelections(prev => {
 const current = prev[day][mealId] || 0;
 return {
 ...prev,
 [day]: {
 ...prev[day],
 [mealId]: current > 0 ? 0 : 1
 }
 };
 });
 };

 const updateSelectionCount = (day, mealId, delta) => {
 setIsDirty(true);
 setSelections(prev => {
 const current = prev[day][mealId] || 0;
 let next = current + delta;
 if (next < 0) next = 0;
 if (next > maxMealSelection) next = maxMealSelection;
 
 return {
 ...prev,
 [day]: {
 ...prev[day],
 [mealId]: next
 }
 };
 });
 };

 const handleSaveSelection = () => {
 const payload = {
 selections: []
 };

 shiftedDays.forEach((day, index) => {
 const isoDate = getIsoDateForShiftedIndex(index, timeZone);
 
 meals.forEach(meal => {
 const count = selections[day]?.[meal.id] || 0;
 const cellData = menu[day]?.[meal.id];
 
 if (cellData && cellData.foodName !=='') {
 const initialCount = initialSelectionsRef.current[day]?.[meal.id] || 0;
 if (count !== initialCount) {
 payload.selections.push({
 date: isoDate,
 mealType: meal.name,
 mealInfo: {
 name: cellData.foodName,
 price: cellData.price
 },
 count: count
 });
 }
 }
 });
 });

 saveSelectionsMutation.mutate(payload, {
 onSuccess: () => {
 setIsDirty(false);
 }
 });
 };

 if (isScheduleLoading || isHostelLoading || isSelectionsLoading) {
 return (
 <div className="space-y-6 w-full max-w-[1600px] mx-auto animate-pulse">
 {/* Header Skeleton */}
 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
 <div className="space-y-3">
 <div className="h-8 bg-black/5 dark:bg-white/5 rounded-lg w-64"></div>
 <div className="h-4 bg-black/5 dark:bg-white/5 rounded-lg w-96 max-w-full"></div>
 </div>
 <div className="h-10 bg-black/5 dark:bg-white/5 rounded-xl w-full sm:w-40"></div>
 </div>

 {/* Days Grid Skeleton */}
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
 {[1, 2, 3].map((i) => (
 <div key={i} className="bg-background border border-border dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
 <div className="px-5 py-3 border-b border-border dark:border-white/5 bg-black/5 dark:bg-white/5 flex items-center justify-between">
 <div className="h-5 bg-black/5 dark:bg-white/5 rounded w-24"></div>
 <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-16"></div>
 </div>
 <div className="p-5 flex flex-col gap-4">
 {[1, 2].map((j) => (
 <div key={j} className="h-20 bg-black/5 dark:bg-white/5 rounded-xl w-full"></div>
 ))}
 </div>
 </div>
 ))}
 </div>
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

 if (meals.length === 0) {
 return (
 <div className="p-8 text-center border border-dashed border-border dark:border-border rounded-2xl bg-background dark:bg-background">
 <Utensils className="w-12 h-12 mx-auto text-foreground mb-4"/>
 <h3 className="text-lg font-bold text-foreground mb-2">No Menu Available</h3>
 <p className="text-sm text-foreground">The mess module is currently inactive or no meals have been configured by the admin.</p>
 </div>
 );
 }

 return (
 <div className="space-y-8 lg:p-8 p-4">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
 <div>
 <h1 className="text-2xl font-black tracking-tight text-foreground">Weekly Meal Selection</h1>
 <p className="mt-1 text-sm font-medium text-foreground dark:text-foreground">
 Opt-in or out of your upcoming meals.
 </p>
 </div>
 <button
 onClick={handleSaveSelection}
 disabled={!isDirty || status ==='Inactive'|| saveSelectionsMutation.isPending}
 className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
 >
 {saveSelectionsMutation.isPending ?'Saving...': (
 <>
 <Save className="w-4 h-4"/>
 Save Selections
 </>
 )}
 </button>
 </div>

 {status ==='Inactive'&& (
 <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-lg border border-amber-200 dark:border-amber-800/30 text-sm font-medium">
 Meal selection is currently paused. You can view the menu, but cannot make any changes.
 </div>
 )}

 {/* Days Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
 {shiftedDays.map((day, i) => {
 const isToday = day === currentDay;
 
 return (
 <motion.div 
 key={day}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.05 }}
 className={`bg-background rounded-2xl overflow-hidden shadow-sm transition-all ${isToday ?'border-2 border-blue-500 shadow-blue-500/10':'border border-border dark:border-border'}`}
 >
 <div className={`px-5 py-3 border-b flex items-center justify-between ${isToday ?'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800':'bg-background dark:bg-background border-border dark:border-border'}`}>
 <h3 className={`font-bold ${isToday ?'text-blue-700 dark:text-blue-300':'text-foreground'}`}>
 {day}
 </h3>
 {isToday ? (
 <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200">Today</span>
 ) : (
 <span className="text-xs font-medium text-foreground">{getDateForShiftedIndex(i, timeZone)}</span>
 )}
 </div>
 <div className="p-5 flex flex-col gap-4">
 {meals.map(meal => {
 const cellData = menu[day]?.[meal.id];
 const hasFood = cellData && cellData.foodName !=='';
 const selectionCount = selections[day]?.[meal.id] || 0;
 const isSelected = selectionCount > 0;
 
 const isLocked = status ==='Inactive'|| (isToday && hasTimePassed(meal.endTime, timeZone));
 
 let stateClass ="";
 if (!hasFood) {
 stateClass ="opacity-50 grayscale cursor-not-allowed border-transparent bg-gray-50 dark:bg-background";
 } else if (isLocked) {
 if (isSelected) {
 stateClass ="border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 cursor-not-allowed";
 } else {
 stateClass ="opacity-50 grayscale cursor-not-allowed border-transparent bg-gray-50 dark:bg-background";
 }
 } else {
 stateClass = isSelected 
 ?"border-blue-500 bg-blue-50 dark:bg-blue-900/20 cursor-pointer transition-all"
 :"border-border dark:border-border hover:border-blue-300 cursor-pointer transition-all";
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
 <span className="text-xs font-bold text-foreground uppercase tracking-wider">{meal.name}</span>
 {meal.endTime && <span className="text-[10px] font-semibold text-foreground bg-background dark:bg-background px-1.5 py-0.5 rounded">Ends {meal.endTime}</span>}
 </div>
 <span className={`text-sm font-semibold ${isSelected && !isLocked ?'text-blue-900 dark:text-blue-100': (isLocked && isSelected ?'text-emerald-900 dark:text-emerald-100':'text-foreground')}`}>
 {hasFood ? cellData.foodName :'Not Served'}
 </span>
 {hasFood && cellData.price > 0 && (
 <span className="text-xs font-medium text-foreground mt-0.5">Rs. {cellData.price}</span>
 )}
 </div>
 {hasFood && (
 <div className="shrink-0 ml-4 flex items-center justify-end min-w-[80px]">
 {maxMealSelection > 1 && selectionCount > 0 ? (
 <div className="flex items-center gap-0.5 bg-white dark:bg-background border border-border dark:border-border rounded-lg overflow-hidden shadow-sm">
 <button 
 onClick={(e) => { e.stopPropagation(); if(!isLocked) updateSelectionCount(day, meal.id, -1); }}
 disabled={isLocked || selectionCount === 0}
 className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-background dark:hover:bg-background disabled:opacity-50 transition-colors text-lg"
 >
 -
 </button>
 <span className="w-5 text-center text-sm font-bold text-foreground">
 {selectionCount}
 </span>
 <button 
 onClick={(e) => { e.stopPropagation(); if(!isLocked) updateSelectionCount(day, meal.id, 1); }}
 disabled={isLocked || selectionCount >= maxMealSelection}
 className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-background dark:hover:bg-background disabled:opacity-50 transition-colors text-lg"
 >
 +
 </button>
 </div>
 ) : (
 isLocked ? (
 isSelected ? <CheckCircle2 className="w-6 h-6 text-emerald-500"/> : <Lock className="w-5 h-5 text-foreground dark:text-foreground"/>
 ) : (
 isSelected ? <CheckCircle2 className="w-6 h-6 text-blue-500"/> : <Circle className="w-6 h-6 text-foreground dark:text-foreground"/>
 )
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
