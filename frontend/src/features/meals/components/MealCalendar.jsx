import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  addDays
} from "date-fns";
import { CheckCircle2, CircleDashed } from "lucide-react";

export default function MealCalendar({ currentDate, records }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const getMealsForDay = (date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    return records.filter((meal) => meal.date === formattedDate);
  };

  const consumedCount = records.filter(m => m.attendance?.hasEaten).reduce((acc, m) => acc + m.attendance.count, 0);
  const totalDays = new Set(records.map(m => m.date)).size;

  const renderDays = () => {
    const days = [];
    const dateFormat = "EEEE";
    let startDateOfWeek = startOfWeek(currentDate);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-left font-medium text-[10px] uppercase tracking-widest text-[#737373] dark:text-[#555555] py-2 pl-2">
          <span className="hidden sm:inline">{format(addDays(startDateOfWeek, i), dateFormat).substring(0, 3)}</span>
          <span className="inline sm:hidden">{format(addDays(startDateOfWeek, i), dateFormat).substring(0, 1)}</span>
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const currentDayMeals = getMealsForDay(day);
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[100px] sm:min-h-[120px] p-2 flex flex-col gap-2 rounded-xl transition-all ${
              !isCurrentMonth ? "opacity-30" : ""
            } hover:bg-black/5 dark:hover:bg-white/5`}
          >
            <div className={`text-xs sm:text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isCurrentMonth ? 'text-[#111111] dark:text-white' : 'text-[#a3a3a3]'}`}>
              {formattedDate}
            </div>
            <div className="flex flex-col gap-1.5">
              {currentDayMeals.map((meal, idx) => {
                const consumed = meal.attendance?.hasEaten;
                const count = meal.attendance?.count || meal.selection?.count || 1;
                const showCount = count > 1 ? ` (x${count})` : '';

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between px-2 py-1.5 text-[10px] sm:text-xs rounded-lg ${
                      consumed
                        ? "bg-[#111111] dark:bg-white text-white dark:text-[#111111]"
                        : "bg-[#f5f5f5] dark:bg-[#1a1a1a] text-[#737373] dark:text-[#a0a0a0]"
                    }`}
                    title={`${meal.mealType}: ₹${meal.mealInfo?.price || 0} x ${count}`}
                  >
                    <span className="hidden xl:inline truncate font-medium">
                      {meal.mealType}{showCount}
                    </span>
                    <span className="inline xl:hidden font-medium leading-none">
                      {meal.mealType.charAt(0)}{count > 1 ? count : ''}
                    </span>
                    
                    {consumed ? (
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0 opacity-80" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="flex flex-col gap-2">{rows}</div>;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Stats & Legend in Containers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-[#737373] dark:text-[#a0a0a0] font-semibold mb-1">Consumption</span>
            <span className="text-sm font-medium text-[#111111] dark:text-white">
              <span className="text-2xl font-bold">{consumedCount}</span> meals
            </span>
          </div>
          <div className="text-right flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-[#737373] dark:text-[#a0a0a0] font-semibold mb-1">Active Days</span>
            <span className="text-sm font-medium text-[#111111] dark:text-white">
              <span className="text-2xl font-bold">{totalDays}</span> days
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-black/5 dark:border-white/10 flex flex-col justify-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-[#737373] dark:text-[#a0a0a0] font-semibold">Legend</span>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#111111] dark:bg-white"></div>
              <span className="text-[#111111] dark:text-white">Consumed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#f5f5f5] dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5"></div>
              <span className="text-[#737373] dark:text-[#a0a0a0]">Selected / Skipped</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] p-4 sm:p-6 rounded-xl border border-black/5 dark:border-white/10">
        {renderDays()}
        {renderCells()}
      </div>
    </div>
  );
}
