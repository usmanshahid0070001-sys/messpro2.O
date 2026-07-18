import { useState, useEffect } from 'react';
import { Plus, Save, Info, AlertTriangle } from 'lucide-react';
import MealCard from './MealCard';
import WeeklyMenuGrid from './WeeklyMenuGrid';

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ManageMealSettings() {
  const [status, setStatus] = useState("Active");
  const [meals, setMeals] = useState([]); 
  const [menu, setMenu] = useState({});
  const [mealToRemove, setMealToRemove] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Track if there are unsaved changes
  const [isDirty, setIsDirty] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem('mealSettings');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setStatus(parsed.status || "Active");
        setMeals(parsed.meals || []);
        
        // Ensure menu has all days
        const loadedMenu = parsed.menu || {};
        const safeMenu = {};
        DAYS_OF_WEEK.forEach(day => {
          safeMenu[day] = loadedMenu[day] || {};
        });
        setMenu(safeMenu);
      } catch (e) {
        console.error("Failed to parse session storage data", e);
        initializeEmptyMenu();
      }
    } else {
      initializeEmptyMenu();
    }
  }, []);

  const initializeEmptyMenu = () => {
    const defaultMenu = {};
    DAYS_OF_WEEK.forEach(day => {
      defaultMenu[day] = {};
    });
    setMenu(defaultMenu);
  };

  const handleSaveData = (customData = null) => {
    const dataToSave = customData || { status, meals, menu };
    
    // As per requirement, empty foodName inputs will be saved as "none"
    // Wait, the requirement says "if the input is empty just save none in the data that will be send via api"
    // We can do this transformation during the API mock save.
    const transformedMenu = {};
    Object.keys(dataToSave.menu).forEach(day => {
      transformedMenu[day] = {};
      Object.keys(dataToSave.menu[day]).forEach(mealId => {
        const cell = dataToSave.menu[day][mealId];
        transformedMenu[day][mealId] = {
          foodName: cell.foodName ? cell.foodName.trim() : "none",
          price: cell.price || 0
        };
      });
    });

    const finalData = { ...dataToSave, menu: transformedMenu };
    sessionStorage.setItem('mealSettings', JSON.stringify(finalData));
    setIsDirty(false);
  };

  const handleSaveMenu = () => {
    setIsSaving(true);
    handleSaveData();
    setTimeout(() => {
      setIsSaving(false);
    }, 600);
  };

  const handleToggleStatus = () => {
    const newStatus = status === 'Active' ? 'Inactive' : 'Active';
    setStatus(newStatus);
    // Requirement: toggle triggers save automatically
    handleSaveData({ status: newStatus, meals, menu });
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
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                status === 'Active' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-[#333]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  status === 'Active' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-xs font-bold ${status === 'Active' ? 'text-blue-600' : 'text-[#737373]'}`}>
              {status}
            </span>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={handleSaveMenu}
              disabled={isSaving || !isDirty}
              className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Configuration
            </button>
            {isDirty && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Unsaved Changes
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
          <button
            onClick={handleAddMeal}
            className="flex items-center gap-2 bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 rounded-lg px-4 py-2 text-sm font-bold hover:bg-blue-600/20 dark:hover:bg-blue-600/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Plus className="w-4 h-4" />
            Add Meal
          </button>
        </div>

        {meals.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-[#e5e5e5] dark:border-[#333333] rounded-2xl bg-[#fafafa] dark:bg-[#111111]">
            <p className="text-sm font-medium text-[#737373]">No meals configured. Click "Add Meal" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meals.map((meal) => (
              <MealCard 
                key={meal.id} 
                meal={meal} 
                onUpdate={updateMeal} 
                onRemove={setMealToRemove} 
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