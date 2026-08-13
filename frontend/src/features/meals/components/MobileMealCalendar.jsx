import { format, parseISO } from"date-fns";
import { CheckCircle2 } from"lucide-react";

export default function MobileMealCalendar({ currentDate, records }) {
 // Group records by day
 const groupedRecords = records.reduce((acc, meal) => {
 if (!acc[meal.date]) acc[meal.date] = [];
 acc[meal.date].push(meal);
 return acc;
 }, {});

 // Sort dates descending so recent days are at the top
 const sortedDates = Object.keys(groupedRecords).sort((a, b) => new Date(b) - new Date(a));

 if (sortedDates.length === 0) {
 return (
 <div className="p-8 text-center text-sm text-foreground dark:text-foreground bg-background rounded-3xl border border-border dark:border-white/10 shadow-sm">
 No meals recorded for this month yet.
 </div>
 );
 }

 return (
 <div className="flex flex-col gap-4">
 {sortedDates.map((dateStr) => {
 const dayMeals = groupedRecords[dateStr];
 const dateObj = parseISO(dateStr);
 
 return (
 <div key={dateStr} className="bg-background p-4 rounded-2xl border border-border dark:border-white/10 shadow-sm flex flex-col gap-3">
 <div className="flex items-baseline justify-between border-b border-border dark:border-white/5 pb-2">
 <span className="text-lg font-bold text-foreground">
 {format(dateObj,'dd')} <span className="text-sm font-medium text-foreground dark:text-foreground">{format(dateObj,'MMM, EEEE')}</span>
 </span>
 </div>
 
 <div className="flex flex-col gap-2">
 {dayMeals.map((meal, idx) => {
 const consumed = meal.attendance?.hasEaten;
 const count = meal.attendance?.count || meal.selection?.count || 1;
 const showCount = count > 1 ? ` (x${count})` :'';

 return (
 <div
 key={idx}
 className={`flex items-center justify-between p-3 text-sm rounded-xl transition-all ${
 consumed
 ?"bg-primary text-primary-foreground"
 :"bg-secondary text-foreground dark:text-foreground"
 }`}
 >
 <div className="flex items-center gap-3">
 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${consumed ?'bg-white/20 dark:bg-black/10':'bg-black/5 dark:bg-white/5'}`}>
 {meal.mealType.charAt(0)}
 </div>
 <div className="flex flex-col">
 <span className="font-semibold">{meal.mealType}{showCount}</span>
 <span className={`text-[10px] uppercase tracking-widest ${consumed ?'opacity-70':'opacity-50'}`}>
 ₹{meal.mealInfo?.price || 0}
 </span>
 </div>
 </div>
 
 {consumed ? (
 <CheckCircle2 className="w-5 h-5 flex-shrink-0"/>
 ) : (
 <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Pending</span>
 )}
 </div>
 );
 })}
 </div>
 </div>
 );
 })}
 </div>
 );
}
