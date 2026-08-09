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

  const stats = {
    consumed: mockMeals.filter(m => m.status === 'Consumed').length,
    total: new Set(mockMeals.map(m => m.date)).size
  };

  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0 mb-8 sm:mb-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <h3 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#111111] dark:text-white">
            {format(currentDate, 'MMMM')}
          </h3>
          <span className="text-xl sm:text-2xl text-[#a3a3a3] dark:text-[#737373] font-light">
            {format(currentDate, 'yyyy')}
          </span>
        </div>
        <p className="text-sm text-[#737373] dark:text-[#a0a0a0]">
          {stats.consumed} meals consumed out of {stats.total} logged days
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={prevMonth}
          className="p-2 border border-black/10 dark:border-white/10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-all"
          aria-label="Previous Month"
        >
          <ChevronLeft className="w-4 h-4 text-[#111111] dark:text-white" />
        </button>
        <button
          onClick={nextMonth}
          className="p-2 border border-black/10 dark:border-white/10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-all"
          aria-label="Next Month"
        >
          <ChevronRight className="w-4 h-4 text-[#111111] dark:text-white" />
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
            key={day}
            className={`min-h-[100px] sm:min-h-[120px] p-2 flex flex-col gap-2 rounded-xl transition-all ${
              !isCurrentMonth ? "opacity-30" : ""
            } hover:bg-black/5 dark:hover:bg-white/5`}
          >
            <div className={`text-xs sm:text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isCurrentMonth ? 'text-[#111111] dark:text-white' : 'text-[#a3a3a3]'}`}>
              {formattedDate}
            </div>
            <div className="flex flex-col gap-1.5">
              {currentDayMeals.map((meal, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-2 py-1.5 text-[10px] sm:text-xs rounded-lg ${
                    meal.status === "Consumed"
                      ? "bg-[#111111] dark:bg-white text-white dark:text-[#111111]"
                      : "bg-[#f5f5f5] dark:bg-[#1a1a1a] text-[#737373] dark:text-[#a0a0a0]"
                  }`}
                  title={`${meal.type}: ₹${meal.price}`}
                >
                  <span className="hidden xl:inline truncate font-medium">{meal.type}</span>
                  <span className="inline xl:hidden font-medium leading-none">{meal.type.charAt(0)}</span>
                  
                  {meal.status === "Consumed" ? (
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0 opacity-80" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40"></div>
                  )}
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
    return <div className="flex flex-col gap-2">{rows}</div>;
  };

  return (
    <div className="flex flex-col">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      
      {/* Legend */}
      <div className="mt-8 flex flex-wrap items-center gap-6 text-xs font-medium">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#111111] dark:bg-white"></div>
          <span className="text-[#111111] dark:text-white">Consumed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#f5f5f5] dark:bg-[#1a1a1a]"></div>
          <span className="text-[#737373] dark:text-[#a0a0a0]">Pending / Skipped</span>
        </div>
      </div>
    </div>
  );
}
