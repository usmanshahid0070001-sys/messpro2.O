import { useState, useMemo, useEffect, useRef } from "react";
import { Calendar, Save, User, CheckCircle2, Receipt, Search, CheckCheck, Clock, Download } from "lucide-react";
import * as XLSX from "xlsx";

// Mock data (swap for your real fetch/import)
const mockMealRecords = [
  {
    date: "2026-07-28",
    meals: [
      { id: "m1", mealType: "Lunch", mealInfo: { name: "Biryani", price: 200 }, attendanceCount: 140, selectionCount: 150 },
    ],
  },
  {
    date: "2026-07-29",
    meals: [
      { id: "m2", mealType: "Lunch", mealInfo: { name: "Pasta", price: 200 }, attendanceCount: 90, selectionCount: 80 },
      { id: "m3", mealType: "Dinner", mealInfo: { name: "Aloo Qeema", price: 174 }, attendanceCount: 168, selectionCount: 70 },
    ],
  },
  {
    date: "2026-07-30",
    meals: [
      { id: "m4", mealType: "Breakfast", mealInfo: { name: "Halwa Puri", price: 100 }, attendanceCount: 120, selectionCount: 130 },
      { id: "m5", mealType: "Lunch", mealInfo: { name: "Chicken Karahi", price: 250 }, attendanceCount: 180, selectionCount: 175 },
      { id: "m6", mealType: "Dinner", mealInfo: { name: "Aloo Qeema", price: 174 }, attendanceCount: 168, selectionCount: 70 },
    ],
  },
];

const mealTypeStyles = {
  Breakfast: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Lunch: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  Dinner: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
};

export default function MealPriceSettingsTable({ onTotalsChange, fromDate, toDate }) {
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState(mockMealRecords);
  const [savedAt, setSavedAt] = useState(null);
  const [editingTotal, setEditingTotal] = useState({ id: null, value: "" });

  const savedSnapshot = useRef(JSON.stringify(mockMealRecords));
  const isDirty = JSON.stringify(records) !== savedSnapshot.current;

  useEffect(() => {
    if (!savedAt) return;
    const t = setTimeout(() => setSavedAt(null), 2200);
    return () => clearTimeout(t);
  }, [savedAt]);

  // Auto-save on page refresh, navigation, or component unmount (like Vite HMR)
  useEffect(() => {
    const handleAutoSave = () => {
      if (JSON.stringify(records) !== savedSnapshot.current) {
        savedSnapshot.current = JSON.stringify(records);
        // Note: In a real app, fire a synchronous API call here (like navigator.sendBeacon)
      }
    };

    window.addEventListener("beforeunload", handleAutoSave);
    return () => {
      window.removeEventListener("beforeunload", handleAutoSave);
      handleAutoSave(); // Save on component unmount
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => r.date >= fromDate && r.date <= toDate)
      .map((group) => ({
        ...group,
        meals: group.meals.filter((m) =>
          search.trim() === "" ? true : m.mealInfo.name.toLowerCase().includes(search.trim().toLowerCase())
        ),
      }))
      .filter((group) => group.meals.length > 0);
  }, [records, fromDate, toDate, search]);

  const totalMeals = filteredRecords.reduce((sum, g) => sum + g.meals.length, 0);
  const totalAttendance = filteredRecords.reduce(
    (sum, g) => sum + g.meals.reduce((s, m) => s + m.attendanceCount, 0),
    0
  );
  const grandTotal = filteredRecords.reduce(
    (sum, g) => sum + g.meals.reduce((s, m) => s + (m.mealInfo.price || 0) * m.attendanceCount, 0),
    0
  );
  const avgPrice = totalAttendance > 0 ? grandTotal / totalAttendance : 0;

  useEffect(() => {
    if (onTotalsChange) {
      onTotalsChange({ totalAttendance, grandTotal, totalMeals, avgPrice });
    }
  }, [totalAttendance, grandTotal, totalMeals, avgPrice, onTotalsChange]);

  const updateMeal = (date, mealId, patch) => {
    setRecords((prev) =>
      prev.map((group) =>
        group.date === date
          ? {
              ...group,
              meals: group.meals.map((meal) =>
                meal.id === mealId ? { ...meal, mealInfo: { ...meal.mealInfo, ...patch } } : meal
              ),
            }
          : group
      )
    );
  };

  const handlePriceChange = (date, mealId, newPrice) => {
    updateMeal(date, mealId, { price: newPrice });
  };

  const handleNameChange = (date, mealId, newName) => {
    updateMeal(date, mealId, { name: newName });
  };

  const handleTotalChange = (date, mealId, newTotal, attendanceCount) => {
    if (newTotal === "") return handlePriceChange(date, mealId, "");
    const total = parseFloat(newTotal) || 0;
    let price = attendanceCount > 0 ? total / attendanceCount : total;
    price = Math.ceil(price); // Round up to nearest integer (e.g. 200.4 -> 201)
    handlePriceChange(date, mealId, price.toString());
  };

  const handleSave = () => {
    savedSnapshot.current = JSON.stringify(records);
    setSavedAt(new Date());
  };

  const handleExportExcel = () => {
    const excelData = [];
    
    filteredRecords.forEach((group) => {
      group.meals.forEach((meal) => {
        excelData.push({
          Date: group.date,
          Meal: meal.mealType,
          Name: meal.mealInfo.name,
          Attendance: meal.attendanceCount,
          "Price/Meal": meal.mealInfo.price || 0,
          "Meal Total": (meal.mealInfo.price || 0) * meal.attendanceCount,
        });
      });
    });

    // Add empty row for spacing
    excelData.push({});
    
    // Add Grand Totals row
    excelData.push({
      Date: "OVERVIEW / TOTALS",
      Meal: "",
      Name: "",
      Attendance: totalAttendance,
      "Price/Meal": `Avg: ${avgPrice.toFixed(2)}`,
      "Meal Total": grandTotal,
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Meal Prices");

    XLSX.writeFile(workbook, `Meal_Prices_${fromDate}_to_${toDate}.xlsx`);
  };

  return (
    <div className="w-full animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
            <Receipt className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
            Meal Price Settings
          </h2>
          <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Review meal attendance, adjust daily prices, and save configuration to generate accurate monthly bills.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full xl:w-auto shrink-0">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search meal name..."
              className="pl-10 pr-3 py-2 h-[42px] w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm transition-all"
            />
          </div>

          <button
            onClick={handleExportExcel}
            className="h-[42px] w-full sm:w-auto px-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] shrink-0"
            title="Export to Excel"
          >
            <Download className="w-4 h-4" />
            <span className="hidden xl:inline">Export</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={`h-[42px] w-full sm:w-auto px-6 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] shrink-0 ${
              isDirty
                ? "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed"
            }`}
          >
            {savedAt ? <CheckCheck className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{savedAt ? "Saved" : isDirty ? "Save Prices" : "Saved"}</span>
          </button>
        </div>
      </div>

      {/* Meta divider */}
      <div className="flex items-center gap-4 mb-4">
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
          <Receipt className="w-4 h-4" />
          <span className="text-[11px] font-bold uppercase tracking-widest">
            {filteredRecords.length} day{filteredRecords.length !== 1 && "s"} · {totalMeals} meal
            {totalMeals !== 1 && "s"}
          </span>
        </div>
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Table */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[860px]">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
                <th className="text-left font-bold text-[11px] uppercase tracking-widest text-zinc-500 px-5 py-3 w-[150px]">
                  Date
                </th>
                <th className="text-left font-bold text-[11px] uppercase tracking-widest text-zinc-500 px-4 py-3 w-[110px]">
                  Meal
                </th>
                <th className="text-left font-bold text-[11px] uppercase tracking-widest text-zinc-500 px-4 py-3">
                  Name
                </th>
                <th className="text-center font-bold text-[11px] uppercase tracking-widest text-zinc-500 px-4 py-3 w-[110px]">
                  Attendance
                </th>
                <th className="text-right font-bold text-[11px] uppercase tracking-widest text-zinc-500 px-4 py-3 w-[140px]">
                  Price / Meal
                </th>
                <th className="text-right font-bold text-[11px] uppercase tracking-widest text-zinc-500 px-4 py-3 w-[140px]">
                  Meal Total
                </th>
                <th className="text-right font-bold text-[11px] uppercase tracking-widest text-zinc-500 px-5 py-3 w-[140px]">
                  Day Total
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((group, gi) => {
                const formattedDate = new Intl.DateTimeFormat("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                }).format(new Date(group.date));

                const dateTotal = group.meals.reduce(
                  (sum, meal) => sum + (meal.mealInfo.price || 0) * meal.attendanceCount,
                  0
                );
                const allPriced = group.meals.every((m) => m.mealInfo.price !== "" && m.mealInfo.price > 0);

                return group.meals.map((meal, mi) => {
                  const mealPrice = meal.mealInfo.price || 0;
                  const mealTotal = mealPrice * meal.attendanceCount;

                  return (
                    <tr
                      key={meal.id}
                      className={`bg-white dark:bg-zinc-950 ${
                        mi === 0 ? "border-t-2 border-t-zinc-200 dark:border-t-zinc-800" : "border-t border-zinc-100 dark:border-zinc-900"
                      } transition-colors`}
                    >
                      {mi === 0 && (
                        <td rowSpan={group.meals.length} className="px-5 py-4 align-top">
                          <div className="flex items-start gap-2.5">
                            <Calendar className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                                {formattedDate}
                              </div>
                              <div
                                className={`flex items-center gap-1 text-[10px] font-semibold mt-1.5 ${
                                  allPriced ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                                }`}
                              >
                                {allPriced ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                {allPriced ? "Priced" : "Pending"}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}

                      <td className="px-4 py-3 align-middle">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest whitespace-nowrap ${
                            mealTypeStyles[meal.mealType] || "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {meal.mealType}
                        </span>
                      </td>

                      <td className="px-4 py-3 align-middle">
                        <input
                          type="text"
                          value={meal.mealInfo.name}
                          onChange={(e) => handleNameChange(group.date, meal.id, e.target.value)}
                          placeholder="Meal Name"
                          className="w-full bg-transparent text-sm font-semibold text-zinc-900 dark:text-zinc-50 outline-none border-b border-transparent hover:border-zinc-300 focus:border-blue-500 dark:hover:border-zinc-700 transition-colors py-0.5"
                        />
                      </td>

                      <td className="px-4 py-3 align-middle text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-lg">
                          <User className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">{meal.attendanceCount}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-middle">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium select-none pointer-events-none">
                            Rs.
                          </span>
                          <input
                            type="number"
                            step="any"
                            value={meal.mealInfo.price}
                            onChange={(e) => handlePriceChange(group.date, meal.id, e.target.value)}
                            placeholder="0"
                            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-bold text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-right shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </td>

                      <td className="px-4 py-3 align-middle">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600/50 dark:text-emerald-400/50 text-sm font-medium select-none pointer-events-none">
                            Rs.
                          </span>
                          <input
                            type="number"
                            step="any"
                            value={editingTotal.id === meal.id ? editingTotal.value : (mealTotal === 0 && (meal.mealInfo.price === "" || meal.mealInfo.price == "0") ? "" : mealTotal)}
                            onChange={(e) => setEditingTotal({ id: meal.id, value: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleTotalChange(group.date, meal.id, e.target.value, meal.attendanceCount);
                                setEditingTotal({ id: null, value: "" });
                              }
                            }}
                            onBlur={(e) => {
                              if (editingTotal.id === meal.id) {
                                handleTotalChange(group.date, meal.id, e.target.value, meal.attendanceCount);
                                setEditingTotal({ id: null, value: "" });
                              }
                            }}
                            placeholder="0"
                            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-bold text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-right shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </td>

                      {mi === 0 && (
                        <td rowSpan={group.meals.length} className="px-5 py-3 align-top text-right">
                          <span className="block text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-0.5">
                            Total
                          </span>
                          <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                            Rs. {dateTotal.toLocaleString('en-PK', { maximumFractionDigits: 2 })}
                          </span>
                        </td>
                      )}
                    </tr>
                  );
                });
              })}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="h-14 w-14 rounded-full bg-zinc-50 dark:bg-zinc-900 shadow-sm flex items-center justify-center mb-4 border border-zinc-200 dark:border-zinc-800">
                        <Receipt className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                      </div>
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">No records found</h3>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
                        Adjust the date range or search above to view meal attendances.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

            {filteredRecords.length > 0 && (
              <tfoot>
                <tr className="bg-zinc-50 dark:bg-zinc-900 border-t-2 border-zinc-200 dark:border-zinc-800">
                  <td colSpan={3} className="px-5 py-4 text-right text-xs font-bold uppercase tracking-widest text-zinc-500 align-middle">
                    Overview
                  </td>
                  <td className="px-4 py-4 text-center align-middle">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/80 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-lg shadow-sm" title="Total Attendances">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-black">{totalAttendance}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right align-middle">
                    <div title="Average Price per Meal">
                      <span className="block text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-0.5">
                        Avg Price
                      </span>
                      <span className="text-base font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                        Rs. {avgPrice.toLocaleString('en-PK', { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </td>
                  <td colSpan={2} className="px-5 py-4 text-right align-middle">
                    <span className="block text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-0.5">
                      Grand Total
                    </span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight truncate max-w-[280px] inline-block" title={`Rs. ${grandTotal.toLocaleString('en-PK', { maximumFractionDigits: 2 })}`}>
                      Rs. {grandTotal.toLocaleString('en-PK', { maximumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}