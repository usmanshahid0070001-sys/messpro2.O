import { useState, useMemo } from "react";
import { Plus, X, IndianRupee } from "lucide-react";
import { mockMeals, initialMockSubcharges } from "../data/mockData";

export default function BillEstimator() {
  const [subcharges, setSubcharges] = useState(initialMockSubcharges);
  const [newSubcharge, setNewSubcharge] = useState({ name: "", type: "fixed", value: "" });
  const [isAdding, setIsAdding] = useState(false);

  // Filter consumed meals for the estimation (assuming all pending eventually get consumed or we calculate based on consumed)
  // For estimator, let's include all to project the full month, or just consumed. Let's include all for projected cost.
  const baseMealsCost = useMemo(() => {
    return mockMeals.reduce((acc, meal) => acc + meal.price, 0);
  }, []);

  const mealCount = mockMeals.length;

  const totalCalculated = useMemo(() => {
    let total = baseMealsCost;
    
    // Apply fixed first
    subcharges.filter(s => s.type === "fixed").forEach(s => {
      total += Number(s.value);
    });

    // Apply multiplier (e.g. per meal)
    subcharges.filter(s => s.type === "multiplier").forEach(s => {
      total += (Number(s.value) * mealCount);
    });

    // Apply percentage on the base + fixed + multiplier
    let percentageAmount = 0;
    subcharges.filter(s => s.type === "percentage").forEach(s => {
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
    
    setNewSubcharge({ name: "", type: "fixed", value: "" });
    setIsAdding(false);
  };

  const removeSubcharge = (id) => {
    setSubcharges(subcharges.filter(s => s.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top: Meal Breakdown & Controls */}
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h3 className="text-base sm:text-lg font-medium text-[#111111] dark:text-white mb-1">Base Meal Cost</h3>
          <p className="text-xs sm:text-sm text-[#737373] dark:text-[#a0a0a0] mb-3 sm:mb-4">Total meals calculated for this month: {mealCount}</p>
          
          <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 sm:p-4 border border-black/5 dark:border-white/5">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-[#404040] dark:text-[#d4d4d4]">Total Base Price</span>
              <span className="font-semibold text-[#111111] dark:text-white">₹{baseMealsCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-medium text-[#111111] dark:text-white">Additional Charges</h3>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="text-xs sm:text-sm flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Add Mock Charge
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleAddSubcharge} className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 mb-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="text"
                placeholder="Charge Name"
                className="flex-1 text-sm rounded-md border-black/10 dark:border-white/10 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 sm:py-2 px-3 border bg-white dark:bg-[#111111] text-[#111111] dark:text-white placeholder-[#a3a3a3] dark:placeholder-[#737373]"
                value={newSubcharge.name}
                onChange={(e) => setNewSubcharge({ ...newSubcharge, name: e.target.value })}
                required
              />
              <select
                className="w-full sm:w-32 text-sm rounded-md border-black/10 dark:border-white/10 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 sm:py-2 px-3 border bg-white dark:bg-[#111111] text-[#111111] dark:text-white"
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
                className="w-full sm:w-24 text-sm rounded-md border-black/10 dark:border-white/10 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 sm:py-2 px-3 border bg-white dark:bg-[#111111] text-[#111111] dark:text-white placeholder-[#a3a3a3] dark:placeholder-[#737373]"
                value={newSubcharge.value}
                onChange={(e) => setNewSubcharge({ ...newSubcharge, value: e.target.value })}
                required
                min="0"
                step="0.01"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
              >
                Add
              </button>
            </form>
          )}

          <div className="space-y-2 sm:space-y-3">
            {subcharges.map((charge) => (
              <div key={charge.id} className="flex justify-between items-center p-2.5 sm:p-3 rounded-lg border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-colors">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => removeSubcharge(charge.id)}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-500/10 text-[#a3a3a3] dark:text-[#737373] hover:text-red-500 dark:hover:text-red-400 rounded transition-colors"
                    title="Remove charge"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <span className="text-sm font-medium text-[#404040] dark:text-[#d4d4d4]">{charge.name}</span>
                </div>
                <div className="text-xs sm:text-sm text-[#737373] dark:text-[#a0a0a0]">
                  {charge.type === 'fixed' && `+₹${charge.value}`}
                  {charge.type === 'percentage' && `+${charge.value}%`}
                  {charge.type === 'multiplier' && `+₹${charge.value} × ${mealCount}`}
                </div>
              </div>
            ))}
            {subcharges.length === 0 && (
              <div className="text-center py-4 sm:py-6 text-sm text-[#737373] dark:text-[#a0a0a0] border border-dashed border-black/10 dark:border-white/10 rounded-lg">
                No additional charges applied.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Summary Card */}
      <div className="w-full mt-4">
        <div className="bg-[#111111] dark:bg-[#1a1a1a] text-white rounded-xl p-4 sm:p-6 shadow-lg border border-transparent dark:border-white/10">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 text-[#a3a3a3]">
            <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
            <h3 className="font-medium text-sm sm:text-base text-white">Estimated Bill</h3>
          </div>
          
          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-white/10">
            <div className="flex justify-between">
              <span className="text-[#a3a3a3]">Base Meals</span>
              <span>₹{baseMealsCost.toFixed(2)}</span>
            </div>
            
            {subcharges.map((s) => (
              <div key={s.id} className="flex justify-between">
                <span className="text-[#a3a3a3] truncate pr-4">{s.name}</span>
                <span>
                  {s.type === 'fixed' && `₹${Number(s.value).toFixed(2)}`}
                  {s.type === 'percentage' && `${s.value}%`}
                  {s.type === 'multiplier' && `₹${(Number(s.value) * mealCount).toFixed(2)}`}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-end">
            <span className="text-[#a3a3a3] text-sm">Total Projected</span>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">₹{totalCalculated.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


