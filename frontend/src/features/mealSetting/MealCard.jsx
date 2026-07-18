import { Clock, Trash2 } from 'lucide-react';

export default function MealCard({ meal, onUpdate, onRemove }) {
  return (
    <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[#e5e5e5] dark:border-[#222222] rounded-xl shadow-sm relative group">
      <button
        onClick={() => onRemove(meal.id)}
        className="absolute top-3 right-3 p-1.5 text-[#a3a3a3] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        title="Remove Meal"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#737373] dark:text-[#a0a0a0] mb-1.5">
            Meal Name
          </label>
          <input
            type="text"
            placeholder="e.g. Breakfast"
            value={meal.name}
            onChange={(e) => onUpdate(meal.id, 'name', e.target.value)}
            className="w-full px-3 py-2 bg-[#f5f5f5] dark:bg-[#111111] border border-transparent focus:border-[#111111] dark:focus:border-[#444] rounded-lg text-sm text-[#111111] dark:text-white focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#737373] dark:text-[#a0a0a0] mb-1.5">
            Selection Deadline
          </label>
          <div className="relative flex items-center">
            <Clock className="absolute left-3 w-4 h-4 text-[#a3a3a3]" />
            <input
              type="time"
              value={meal.endTime}
              onChange={(e) => onUpdate(meal.id, 'endTime', e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#f5f5f5] dark:bg-[#111111] border border-transparent focus:border-[#111111] dark:focus:border-[#444] rounded-lg text-sm text-[#111111] dark:text-white focus:outline-none transition-colors"
            />
          </div>
          <p className="text-[11px] text-[#a3a3a3] mt-1.5">
            Time after which students cannot select/deselect this meal.
          </p>
        </div>
      </div>
    </div>
  );
}
