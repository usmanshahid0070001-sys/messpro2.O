import { Clock, Trash2 } from 'lucide-react';

export default function MealCard({ meal, onUpdate, onRemove, isManager }) {
  return (
    <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm relative group">
      {!isManager && (
        <button
          onClick={() => onRemove(meal.id)}
          className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          title="Remove Meal"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
            Meal Name
          </label>
          <input
            type="text"
            placeholder="e.g. Breakfast"
            value={meal.name}
            onChange={(e) => onUpdate(meal.id, 'name', e.target.value)}
            disabled={isManager}
            className={`w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-transparent rounded-lg text-sm text-zinc-900 dark:text-zinc-50 transition-colors ${isManager ? 'opacity-70 cursor-not-allowed' : 'focus:border-zinc-900 dark:focus:border-zinc-700 focus:outline-none'}`}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
            Selection Deadline
          </label>
          <div className="relative flex items-center">
            <Clock className="absolute left-3 w-4 h-4 text-zinc-400" />
            <input
              type="time"
              value={meal.endTime}
              onChange={(e) => onUpdate(meal.id, 'endTime', e.target.value)}
              disabled={isManager}
              className={`w-full pl-9 pr-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-transparent rounded-lg text-sm text-zinc-900 dark:text-zinc-50 transition-colors ${isManager ? 'opacity-70 cursor-not-allowed' : 'focus:border-zinc-900 dark:focus:border-zinc-700 focus:outline-none'}`}
            />
          </div>
          <p className="text-[11px] text-zinc-400 mt-1.5">
            Time after which students cannot select/deselect this meal.
          </p>
        </div>
      </div>
    </div>
  );
}
