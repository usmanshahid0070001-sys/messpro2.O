const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function WeeklyMenuGrid({ meals, menu, onUpdateCell, isSwapMode, swapSelection, onSelectForSwap }) {
  if (meals.length === 0) return null;

  const isSelected = (day, mealId) => swapSelection?.some(s => s.day === day && s.mealId === mealId);

  const renderCellContent = (day, meal, cellData) => {
    const selected = isSelected(day, meal.id);
    return (
      <div 
        className={`flex flex-col gap-2 p-2 -m-2 rounded-lg transition-all ${isSwapMode ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : ''} ${selected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
        onClick={() => {
          if (isSwapMode && onSelectForSwap) onSelectForSwap(day, meal.id);
        }}
      >
        <input
          type="text"
          placeholder="Enter Food item"
          value={cellData.foodName || ''}
          onChange={(e) => onUpdateCell(day, meal.id, 'foodName', e.target.value)}
          readOnly={isSwapMode}
          className={`w-full px-3 py-1.5 bg-[#f5f5f5] dark:bg-[#111111] border border-transparent focus:border-[#111111] dark:focus:border-[#444] rounded text-sm text-[#111111] dark:text-white focus:outline-none transition-colors placeholder:text-[#a3a3a3] ${isSwapMode ? 'pointer-events-none' : ''}`}
        />
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#737373] font-medium">Rs.</span>
          <input
            type="number"
            min="0"
            placeholder="Price"
            value={cellData.price === 0 && !cellData.foodName ? '' : cellData.price}
            onChange={(e) => onUpdateCell(day, meal.id, 'price', e.target.value ? Number(e.target.value) : '')}
            readOnly={isSwapMode}
            className={`w-full pl-8 pr-3 py-1.5 bg-[#f5f5f5] dark:bg-[#111111] border border-transparent focus:border-[#111111] dark:focus:border-[#444] rounded text-sm text-[#111111] dark:text-white focus:outline-none transition-colors placeholder:text-[#a3a3a3] ${isSwapMode ? 'pointer-events-none' : ''}`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Desktop Layout */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#e5e5e5] dark:border-[#222222] bg-white dark:bg-[#0a0a0a] shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-[#fafafa] dark:bg-[#111111] border-b border-[#e5e5e5] dark:border-[#222222]">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#737373] border-r border-[#e5e5e5] dark:border-[#222222] w-32">
                Day
              </th>
              {meals.map(meal => (
                <th key={meal.id} className="p-4 text-sm font-bold text-[#111111] dark:text-white min-w-[240px]">
                  {meal.name || "Unnamed Meal"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#222222]">
            {DAYS_OF_WEEK.map(day => (
              <tr key={day} className="hover:bg-[#fafafa] dark:hover:bg-[#111111]/50 transition-colors">
                <td className="p-4 text-sm font-bold text-[#111111] dark:text-white border-r border-[#e5e5e5] dark:border-[#222222]">
                  {day}
                </td>
                {meals.map(meal => {
                  const cellData = menu[day]?.[meal.id] || { foodName: '', price: '' };
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
          <div key={day} className="bg-white dark:bg-[#0a0a0a] border border-[#e5e5e5] dark:border-[#222222] rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-[#fafafa] dark:bg-[#111111] p-4 border-b border-[#e5e5e5] dark:border-[#222222]">
              <h3 className="font-bold text-[#111111] dark:text-white">{day}</h3>
            </div>
            <div className="p-4 flex flex-col gap-6">
              {meals.map(meal => {
                const cellData = menu[day]?.[meal.id] || { foodName: '', price: '' };
                return (
                  <div key={meal.id} className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#737373] uppercase tracking-wider">
                      {meal.name || "Unnamed Meal"}
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
