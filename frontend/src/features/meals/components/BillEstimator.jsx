import { useState, useMemo } from"react";
import { Plus, X } from"lucide-react";

export default function BillEstimator({ records = [], month =""}) {
 const [subcharges, setSubcharges] = useState([]);
 const [newSubcharge, setNewSubcharge] = useState({ name:"", type:"fixed", value:""});
 const [isAdding, setIsAdding] = useState(false);

 // Calculate base meal cost from the records
 const { baseMealsCost, mealCount } = useMemo(() => {
 let cost = 0;
 let count = 0;
 records.forEach(r => {
 if (r.attendance?.hasEaten) {
 cost += (r.mealInfo?.price || 0) * (r.attendance.count || 1);
 count += (r.attendance.count || 1);
 }
 });
 return { baseMealsCost: cost, mealCount: count };
 }, [records]);

 const totalCalculated = useMemo(() => {
 let total = baseMealsCost;
 
 // Apply fixed first
 subcharges.filter(s => s.type ==="fixed").forEach(s => {
 total += Number(s.value);
 });

 // Apply multiplier (e.g. per meal)
 subcharges.filter(s => s.type ==="multiplier").forEach(s => {
 total += (Number(s.value) * mealCount);
 });

 // Apply percentage on the base + fixed + multiplier
 let percentageAmount = 0;
 subcharges.filter(s => s.type ==="percentage").forEach(s => {
 percentageAmount += total * (Number(s.value) / 100);
 });
 
 return total + percentageAmount;
 }, [baseMealsCost, mealCount, subcharges]);

 const handleAddSubcharge = (e) => {
 e.preventDefault();
 if (!newSubcharge.name || !newSubcharge.value) return;
 
 setSubcharges([...subcharges, {
 id: Date.now().toString(),
 name: newSubcharge.name,
 type: newSubcharge.type,
 value: Number(newSubcharge.value)
 }]);
 
 setNewSubcharge({ name:"", type:"fixed", value:""});
 setIsAdding(false);
 };

 const removeSubcharge = (id) => {
 setSubcharges(subcharges.filter(s => s.id !== id));
 };

 return (
 <div className="flex flex-col gap-6">
 {/* Top: Meal Breakdown & Controls */}
 <div className="space-y-8">
 <div>
 <div className="flex justify-between items-end mb-4">
 <div>
 <h3 className="text-base font-medium text-foreground">Base Meal Cost</h3>
 <p className="text-sm text-foreground dark:text-foreground">Meals consumed in {month}: {mealCount}</p>
 </div>
 <div className="text-xl font-medium tracking-tight text-foreground tabular-nums">
 ₹{baseMealsCost.toFixed(2)}
 </div>
 </div>
 <div className="w-full h-px bg-black/5 dark:bg-white/5"></div>
 </div>

 <div className="flex justify-between items-center mb-6">
 <h3 className="text-base font-medium text-foreground">Additional Charges</h3>
 <button
 onClick={() => setIsAdding(!isAdding)}
 className="text-xs uppercase tracking-widest font-medium text-foreground hover:opacity-70 transition-opacity flex items-center gap-1"
 >
 <Plus className="w-3.5 h-3.5"/>
 Add Charge
 </button>
 </div>

 {isAdding && (
 <form onSubmit={handleAddSubcharge} className="bg-secondary p-4 rounded-xl mb-6 flex flex-col gap-3 border border-border dark:border-white/5 shadow-sm">
 <input
 type="text"
 placeholder="Charge Name (e.g. Fine)"
 className="w-full text-sm rounded-lg border border-black/10 dark:border-white/10 bg-background text-foreground placeholder-muted-foreground px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-colors"
 value={newSubcharge.name}
 onChange={(e) => setNewSubcharge({ ...newSubcharge, name: e.target.value })}
 required
 />
 <div className="flex gap-3">
 <select
 className="w-1/2 text-sm rounded-lg border border-black/10 dark:border-white/10 bg-background text-foreground px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-colors"
 value={newSubcharge.type}
 onChange={(e) => setNewSubcharge({ ...newSubcharge, type: e.target.value })}
 >
 <option value="fixed">Fixed (₹)</option>
 <option value="percentage">Percentage (%)</option>
 <option value="multiplier">Per Meal (₹)</option>
 </select>
 <input
 type="number"
 placeholder="Value"
 className="w-1/2 text-sm rounded-lg border border-black/10 dark:border-white/10 bg-background text-foreground placeholder-muted-foreground px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-colors"
 value={newSubcharge.value}
 onChange={(e) => setNewSubcharge({ ...newSubcharge, value: e.target.value })}
 required
 min="0"
 step="0.01"
 />
 </div>
 <button
 type="submit"
 className="w-full py-2.5 mt-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 active:scale-[0.98] transition-all"
 >
 Confirm
 </button>
 </form>
 )}

 <div className="space-y-2">
 {subcharges.map((charge) => (
 <div key={charge.id} className="flex justify-between items-center py-2 border-b border-border dark:border-white/5 last:border-0 group">
 <div className="flex items-center gap-3">
 <button
 onClick={() => removeSubcharge(charge.id)}
 className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-all"
 title="Remove charge"
 >
 <X className="w-3.5 h-3.5 text-foreground dark:text-foreground"/>
 </button>
 <span className="text-sm font-medium text-foreground">{charge.name}</span>
 </div>
 <div className="text-sm text-foreground dark:text-foreground tabular-nums">
 {charge.type ==='fixed'&& `+₹${charge.value}`}
 {charge.type ==='percentage'&& `+${charge.value}%`}
 {charge.type ==='multiplier'&& `+₹${charge.value} × ${mealCount}`}
 </div>
 </div>
 ))}
 {subcharges.length === 0 && (
 <div className="text-sm text-foreground dark:text-foreground py-2 italic opacity-60">
 No additional charges applied.
 </div>
 )}
 </div>
 </div>

 {/* Bottom: Summary Card (Receipt style) */}
 <div className="w-full mt-2 relative">
 <div className="bg-primary text-primary-foreground rounded-xl p-6 sm:p-8">
 <div className="flex flex-col gap-6">
 <div>
 <p className="text-xs uppercase tracking-widest opacity-60 font-medium mb-1">Projected Total</p>
 <h2 className="text-4xl font-semibold tracking-tighter tabular-nums">₹{totalCalculated.toFixed(2)}</h2>
 </div>
 
 <div className="w-full h-px bg-white/20 dark:bg-black/10"></div>
 
 <div className="space-y-3 text-sm font-medium opacity-80">
 <div className="flex justify-between">
 <span>Base Meals ({mealCount})</span>
 <span className="tabular-nums">₹{baseMealsCost.toFixed(2)}</span>
 </div>
 
 {subcharges.map((s) => (
 <div key={s.id} className="flex justify-between">
 <span className="truncate pr-4">{s.name}</span>
 <span className="tabular-nums">
 {s.type ==='fixed'&& `₹${Number(s.value).toFixed(2)}`}
 {s.type ==='percentage'&& `${s.value}%`}
 {s.type ==='multiplier'&& `₹${(Number(s.value) * mealCount).toFixed(2)}`}
 </span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
