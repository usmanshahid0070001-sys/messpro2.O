const DAYS_OF_WEEK = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function WeeklyMenuGrid({ meals, menu, onUpdateCell, isSwapMode, swapSelection, onSelectForSwap }) {
 if (meals.length === 0) return null;

 const isSelected = (day, mealId) => swapSelection?.some(s => s.day === day && s.mealId === mealId);

 const renderCellContent = (day, meal, cellData) => {
 const selected = isSelected(day, meal.id);
 return (
 <div 
 className={`flex flex-col gap-2 p-2 -m-2 rounded-lg transition-all ${isSwapMode ?'cursor-pointer hover:ring-2 hover:ring-blue-400':''} ${selected ?'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20':''}`}
 onClick={() => {
 if (isSwapMode && onSelectForSwap) onSelectForSwap(day, meal.id);
 }}
 >
 <input
 type="text"
 placeholder="Enter Food item"
 value={cellData.foodName ||''}
 onChange={(e) => onUpdateCell(day, meal.id,'foodName', e.target.value)}
 readOnly={isSwapMode}
 className={`w-full px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-zinc-900 dark:focus:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none transition-colors placeholder:text-zinc-400 ${isSwapMode ?'pointer-events-none':''}`}
 />
 <div className="relative">
 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-medium">Rs.</span>
 <input
 type="number"
 min="0"
 placeholder="Price"
 value={cellData.price === 0 && !cellData.foodName ?'': cellData.price}
 onChange={(e) => onUpdateCell(day, meal.id,'price', e.target.value ? Number(e.target.value) :'')}
 readOnly={isSwapMode}
 className={`w-full pl-8 pr-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-zinc-900 dark:focus:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none transition-colors placeholder:text-zinc-400 ${isSwapMode ?'pointer-events-none':''}`}
 />
 </div>
 </div>
 );
 };

 return (
 <div className="space-y-6">
 {/* Desktop Layout */}
 <div className="hidden md:block overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shadow-sm">
 <table className="w-full text-left border-collapse min-w-[800px]">
 <thead>
 <tr className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
 <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 border-r border-zinc-200 dark:border-zinc-800 w-32">
 Day
 </th>
 {meals.map(meal => (
 <th key={meal.id} className="p-4 text-sm font-bold text-zinc-900 dark:text-zinc-50 min-w-[240px]">
 {meal.name ||"Unnamed Meal"}
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
 {DAYS_OF_WEEK.map(day => (
 <tr key={day} className="hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors">
 <td className="p-4 text-sm font-bold text-zinc-900 dark:text-zinc-50 border-r border-zinc-200 dark:border-zinc-800">
 {day}
 </td>
 {meals.map(meal => {
 const cellData = menu[day]?.[meal.id] || { foodName:'', price:''};
 return (
 <td key={meal.id} className="p-4">
 {renderCellContent(day, meal, cellData)}
 </td>
 );
 })}
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Mobile Layout */}
 <div className="md:hidden flex flex-col gap-4">
 {DAYS_OF_WEEK.map(day => (
 <div key={day} className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
 <div className="bg-zinc-100 dark:bg-zinc-900 p-4 border-b border-zinc-200 dark:border-zinc-800">
 <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{day}</h3>
 </div>
 <div className="p-4 flex flex-col gap-6">
 {meals.map(meal => {
 const cellData = menu[day]?.[meal.id] || { foodName:'', price:''};
 return (
 <div key={meal.id} className="flex flex-col gap-2">
 <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
 {meal.name ||"Unnamed Meal"}
 </label>
 {renderCellContent(day, meal, cellData)}
 </div>
 );
 })}
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}
