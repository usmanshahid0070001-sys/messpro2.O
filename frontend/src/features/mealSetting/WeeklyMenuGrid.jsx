const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


export default function WeeklyMenuGrid({ meals, menu, onUpdateCell }) {
  if (meals.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#e5e5e5] dark:border-[#222222] bg-white dark:bg-[#0a0a0a] shadow-sm">
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
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Enter Food item"
                        value={cellData.foodName || ''}
                        onChange={(e) => onUpdateCell(day, meal.id, 'foodName', e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#f5f5f5] dark:bg-[#111111] border border-transparent focus:border-[#111111] dark:focus:border-[#444] rounded text-sm text-[#111111] dark:text-white focus:outline-none transition-colors placeholder:text-[#a3a3a3]"
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#737373] font-medium">Rs.</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="Price"
                          value={cellData.price === 0 && !cellData.foodName ? '' : cellData.price}
                          onChange={(e) => onUpdateCell(day, meal.id, 'price', e.target.value ? Number(e.target.value) : '')}
                          className="w-full pl-8 pr-3 py-1.5 bg-[#f5f5f5] dark:bg-[#111111] border border-transparent focus:border-[#111111] dark:focus:border-[#444] rounded text-sm text-[#111111] dark:text-white focus:outline-none transition-colors placeholder:text-[#a3a3a3]"
                        />
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
