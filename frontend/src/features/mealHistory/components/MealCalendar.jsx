import { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  addDays
} from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle2, CircleDashed } from "lucide-react";
import { mockMeals } from "../data/mockData";

export default function MealCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date("2026-07-20")); // Defaulting to July 2026 to match mock data

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const getMealsForDay = (date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    return mockMeals.filter((meal) => meal.date === formattedDate);
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4 sm:mb-6">
      <h3 className="text-base sm:text-lg font-medium text-[#111111] dark:text-white">
        {format(currentDate, "MMMM yyyy")}
      </h3>
      <div className="flex gap-1 sm:gap-2">
        <button
          onClick={prevMonth}
          className="p-1.5 sm:p-2 border border-black/5 dark:border-white/5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label="Previous Month"
        >
          <ChevronLeft className="w-4 h-4 text-[#737373] dark:text-[#a0a0a0]" />
        </button>
        <button
          onClick={nextMonth}
          className="p-1.5 sm:p-2 border border-black/5 dark:border-white/5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label="Next Month"
        >
          <ChevronRight className="w-4 h-4 text-[#737373] dark:text-[#a0a0a0]" />
        </button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const dateFormat = "EEEE";
    let startDateOfWeek = startOfWeek(currentDate);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium text-[10px] sm:text-xs text-[#737373] dark:text-[#a0a0a0] py-1.5 sm:py-2">
          <span className="hidden sm:inline">{format(addDays(startDateOfWeek, i), dateFormat).substring(0, 3)}</span>
          <span className="inline sm:hidden">{format(addDays(startDateOfWeek, i), dateFormat).substring(0, 1)}</span>
        </div>
      );
    }
    return <div className="grid grid-cols-7 border-b border-black/5 dark:border-white/5 pb-1 sm:pb-2">{days}</div>;
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
            key={day}
            className={`min-h-[70px] sm:min-h-[100px] border-b border-r border-black/5 dark:border-white/5 p-1 sm:p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
              !isCurrentMonth ? "bg-black/5 dark:bg-white/5 text-[#a3a3a3] dark:text-[#555]" : "bg-white dark:bg-[#0a0a0a] text-[#111111] dark:text-white"
            } ${i === 6 ? "border-r-0" : ""}`}
          >
            <div className="text-right text-xs sm:text-sm font-medium mb-1 sm:mb-2">{formattedDate}</div>
            <div className="flex flex-col gap-0.5 sm:gap-1">
              {currentDayMeals.map((meal, idx) => (
                <div
                  key={idx}
                  className={`flex justify-center xl:justify-start items-center gap-1 sm:gap-1.5 p-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs rounded sm:border ${
                    meal.status === "Consumed"
                      ? "bg-green-50 dark:bg-green-500/10 sm:border-green-200 sm:dark:border-green-500/20 text-green-700 dark:text-green-400"
                      : "bg-amber-50 dark:bg-amber-500/10 sm:border-amber-200 sm:dark:border-amber-500/20 text-amber-700 dark:text-amber-400"
                  }`}
                  title={`${meal.type}: ₹${meal.price}`}
                >
                  {meal.status === "Consumed" ? (
                    <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                  ) : (
                    <CircleDashed className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                  )}
                  {/* Hidden on very small screens, shown as full text on xl desktop */}
                  <span className="hidden xl:inline truncate">{meal.type}</span>
                  {/* Shown as 1 letter on mobile, hidden on xl desktop */}
                  <span className="inline xl:hidden font-bold leading-none">{meal.type.charAt(0)}</span>
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border-l border-t border-black/5 dark:border-white/5 rounded-lg overflow-hidden">{rows}</div>;
  };

  return (
    <div className="flex flex-col">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      
      {/* Legend */}
      <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
          <span className="text-[#737373] dark:text-[#a0a0a0]">Consumed</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500"></div>
          <span className="text-[#737373] dark:text-[#a0a0a0]">Pending</span>
        </div>
        <div className="w-full sm:hidden text-[10px] text-[#a3a3a3]">
          (B) Breakfast · (L) Lunch · (D) Dinner
        </div>
      </div>
    </div>
  );
}
