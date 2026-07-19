import { useState, useEffect } from 'react';
import { Plus, Save, Info, AlertTriangle } from 'lucide-react';
import MealCard from './MealCard';
import WeeklyMenuGrid from './WeeklyMenuGrid';
import { useAuth } from '../../context/AuthContext';
import { useMealSchedule } from '../../hooks/queries/useMealQueries';
import { useUpdateMealSchedule } from '../../hooks/mutations/useMealMutations';

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ManageMealSettings() {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';

  const { data: scheduleData, isLoading, isError, refetch } = useMealSchedule();
  const updateScheduleMutation = useUpdateMealSchedule();

  const [status, setStatus] = useState("Active");
  const [meals, setMeals] = useState([]);
  const [menu, setMenu] = useState({});
  const [mealToRemove, setMealToRemove] = useState(null);

  // Track if there are unsaved changes
  const [isDirty, setIsDirty] = useState(false);

  // Load from sessionStorage OR backend data
  useEffect(() => {
    const draftData = sessionStorage.getItem('mealSettingsDraft');

    if (draftData) {
      // If we have a draft, load it and skip the backend data for now
      try {
        const parsed = JSON.parse(draftData);
        setStatus(parsed.status || "Active");
        setMeals(parsed.meals || []);
        setMenu(parsed.menu || {});
        setIsDirty(true);
        return; // Skip loading from backend
      } catch (e) {
        console.error("Failed to parse draft data", e);
        sessionStorage.removeItem('mealSettingsDraft');
      }
    }

    if (scheduleData && scheduleData.data) {
      const parsed = scheduleData.data;

      setStatus(parsed.status === 'inactive' ? 'Inactive' : 'Active');

      const loadedMeals = (parsed.mealNames || []).map((name, idx) => ({
        id: idx.toString(),
        name: name,
        endTime: (parsed.selectionTiming || [])[idx] || ''
      }));
      setMeals(loadedMeals);

      const loadedMenu = parsed.menu || {};
      const safeMenu = {};
      DAYS_OF_WEEK.forEach(day => {
        const dayArray = loadedMenu[day] || [];
        const dayObj = {};
        loadedMeals.forEach((meal, idx) => {
          const item = dayArray[idx];
          dayObj[meal.id] = {
            foodName: item?.meal === 'none' ? '' : (item?.meal || ''),
            price: item?.price || 0
          };
        });
        safeMenu[day] = dayObj;
      });
      setMenu(safeMenu);
    } else if (!isLoading) {
      initializeEmptyMenu();
    }
  }, [scheduleData, isLoading]);

  // Save to draft whenever state changes and it's dirty
  useEffect(() => {
    if (isDirty) {
      sessionStorage.setItem('mealSettingsDraft', JSON.stringify({ status, meals, menu }));
    }
  }, [status, meals, menu, isDirty]);

  const initializeEmptyMenu = () => {
    const defaultMenu = {};
    DAYS_OF_WEEK.forEach(day => {
      defaultMenu[day] = {};
    });
    setMenu(defaultMenu);
  };

  const handleSaveData = (customData = null) => {
    const dataToSave = customData || { status, meals, menu };

    // Transform frontend format to backend format
    const transformedMenu = {};
    Object.keys(dataToSave.menu).forEach(day => {
      transformedMenu[day] = [];
      dataToSave.meals.forEach((meal) => {
        const cell = dataToSave.menu[day][meal.id];
        transformedMenu[day].push({
          meal: cell && cell.foodName ? cell.foodName.trim() : "none",
          price: cell && cell.price ? Number(cell.price) : 0
        });
      });
    });

    const finalData = {
      status: dataToSave.status.toLowerCase(),
      numberOfMeals: dataToSave.meals.length,
      mealNames: dataToSave.meals.map(m => m.name),
      selectionTiming: dataToSave.meals.map(m => m.endTime),
      menu: transformedMenu
    };

    updateScheduleMutation.mutate(finalData, {
      onSuccess: () => {
        setIsDirty(false);
        sessionStorage.removeItem('mealSettingsDraft');
      }
    });
  };

  const handleSaveMenu = () => {
    handleSaveData();
  };

  const handleToggleStatus = () => {
    const newStatus = status === 'Active' ? 'Inactive' : 'Active';
    setStatus(newStatus);
    setIsDirty(true);
  };

  const handleAddMeal = () => {
    setIsDirty(true);
    const newMealId = Date.now().toString();
    const newMeals = [...meals, { id: newMealId, name: '', endTime: '' }];
    setMeals(newMeals);

    const updatedMenu = { ...menu };
    DAYS_OF_WEEK.forEach(day => {
      if (!updatedMenu[day]) updatedMenu[day] = {};
      updatedMenu[day][newMealId] = { foodName: '', price: '' };
    });
    setMenu(updatedMenu);
  };

  const confirmRemoveMeal = () => {
    if (!mealToRemove) return;
    setIsDirty(true);
    const updatedMeals = meals.filter(m => m.id !== mealToRemove);
    setMeals(updatedMeals);

    const updatedMenu = { ...menu };
    DAYS_OF_WEEK.forEach(day => {
      if (updatedMenu[day] && updatedMenu[day][mealToRemove]) {
        delete updatedMenu[day][mealToRemove];
      }
    });
    setMenu(updatedMenu);
    setMealToRemove(null);
  };

  const updateMeal = (id, field, value) => {
    setIsDirty(true);
    setMeals(meals.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const updateMenuCell = (day, mealId, field, value) => {
    setIsDirty(true);
    setMenu(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealId]: {
          ...prev[day][mealId],
          [field]: value
        }
      }
    }));
  };

  if (isLoading && !isDirty) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-[#222] rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-[#222] rounded w-96"></div>
        <div className="h-40 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl w-full mt-8"></div>
      </div>
    );
  }

  if (isError && !isDirty) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg flex items-center justify-between gap-4">
          <span>Failed to load meal schedule. Please try again.</span>
          <button
            onClick={() => refetch()}
            className="shrink-0 px-3 py-1.5 text-sm font-medium rounded-md border border-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#111111] dark:text-white">Meal Settings</h1>
          <p className="mt-1 text-sm font-medium text-[#737373] dark:text-[#a0a0a0]">
            Configure global meal timings, pricing, and weekly schedule.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-[#e5e5e5] dark:border-[#222222] rounded-xl shadow-sm">
            <span className="text-sm font-semibold text-[#111111] dark:text-white">Module Status</span>
            <button
              onClick={handleToggleStatus}
              disabled={isManager || updateScheduleMutation.isPending}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${status === 'Active' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-[#333]'
                } ${(isManager || updateScheduleMutation.isPending) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${status === 'Active' ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
            <span className={`text-xs font-bold ${status === 'Active' ? 'text-blue-600' : 'text-[#737373]'}`}>
              {status}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveMenu}
                disabled={updateScheduleMutation.isPending || !isDirty}
                className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateScheduleMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Configuration
              </button>
            </div>
            {isDirty && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Unsaved Draft Present
              </span>
            )}
          </div>
        </div>
      </div>

      {status === 'Inactive' && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-xl border border-amber-200 dark:border-amber-800/30">
          <Info className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">
            Meal module is currently inactive. This hostel does not serve meals or utilize mess features.
          </p>
        </div>
      )}

      {/* Meals Configuration */}
      <div className={`space-y-4 ${status === 'Inactive' ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#111111] dark:text-white">Daily Meals</h2>
          {!isManager && (
            <button
              onClick={handleAddMeal}
              className="flex items-center gap-2 bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 rounded-lg px-4 py-2 text-sm font-bold hover:bg-blue-600/20 dark:hover:bg-blue-600/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <Plus className="w-4 h-4" />
              Add Meal
            </button>
          )}
        </div>

        {meals.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-[#e5e5e5] dark:border-[#333333] rounded-2xl bg-[#fafafa] dark:bg-[#111111]">
            <p className="text-sm font-medium text-[#737373]">
              {isManager ? "No meals have been configured by the admin yet." : "No meals configured. Click \"Add Meal\" to get started."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onUpdate={updateMeal}
                onRemove={setMealToRemove}
                isManager={isManager}
              />
            ))}
          </div>
        )}
      </div>

      {/* Weekly Menu Schedule */}
      <div className={`space-y-4 ${status === 'Inactive' || meals.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
        <h2 className="text-lg font-bold text-[#111111] dark:text-white">Weekly Menu Configuration</h2>

        {meals.length > 0 && (
          <WeeklyMenuGrid
            meals={meals}
            menu={menu}
            onUpdateCell={updateMenuCell}
          />
        )}
      </div>

      {/* Remove Confirmation Modal */}
      {mealToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#0a0a0a] border border-[#e5e5e5] dark:border-[#222222] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-black text-[#111111] dark:text-white">Remove Meal?</h3>
            </div>
            <p className="text-sm text-[#737373] dark:text-[#a0a0a0] mb-6">
              Are you sure you want to remove this meal? This will delete all associated weekly menu configurations from the grid.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setMealToRemove(null)}
                className="px-4 py-2 text-sm font-bold text-[#404040] dark:text-[#cccccc] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveMeal}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}