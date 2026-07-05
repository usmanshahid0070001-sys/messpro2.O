import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Info,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Coffee,
  Ban,
} from "lucide-react";
import { useMealHistory, useMonthlyBill } from "../../hooks/queries/useStudentQueries";
import { motion, AnimatePresence } from "framer-motion";

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
const getLocalDateString = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

// Map meal types to icons dynamically
const MealIconMap = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon
};

export default function StudentMealHistory() {
  const [showDetails, setShowDetails] = useState(false);
  const today = new Date();
  const currentMonthNum = today.getMonth();
  const currentYearNum = today.getFullYear();

  const [viewDate, setViewDate] = useState(new Date(currentYearNum, currentMonthNum, 1));

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const todayString = getLocalDateString(currentYearNum, currentMonthNum, today.getDate());

  const targetMonthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;

  const { data: historyData, isLoading: historyLoading } = useMealHistory(viewYear, viewMonth);
  const { data: billData, isLoading: billLoading } = useMonthlyBill(targetMonthStr);

  const handlePrevMonth = () => setViewDate(new Date(viewYear, viewMonth - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewYear, viewMonth + 1, 1));

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const paddingDays = Array.from({
    length: firstDay === 0 ? 6 : firstDay - 1,
  }).map((_, i) => <div key={`pad-${i}`} className="p-1 sm:p-2" />);

  const monthDays = Array.from({ length: daysInMonth }).map((_, i) => i + 1);

  const getStatusConfig = (status, isFuture) => {
    if (isFuture)
      return {
        bg: "bg-slate-50 dark:bg-[#0f172a]/30",
        text: "text-slate-300 dark:text-slate-600",
        border: "border-slate-200 dark:border-white/5 border-dashed",
      };
    if (status === "MATCH")
      return {
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-500/20",
      };
    if (status === "MISSED")
      return {
        bg: "bg-amber-50 dark:bg-amber-500/10",
        text: "text-amber-500 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-500/20",
      };
    if (status === "EXTRA")
      return {
        bg: "bg-rose-50 dark:bg-rose-500/10",
        text: "text-rose-500 dark:text-rose-400",
        border: "border-rose-200 dark:border-rose-500/20",
      };

    return {
      bg: "bg-slate-100 dark:bg-[#1e293b]",
      text: "text-slate-400 dark:text-slate-500",
      border: "border-slate-200 dark:border-white/10",
    };
  };

  const getBadgeConfig = () => {
    if (!billData) return null;
    if (billData.paid) {
      return {
        text: "Paid",
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        textCol: "text-emerald-700 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-500/20",
        Icon: CheckCircle2,
      };
    }
    if (billData.amountPaid > 0) {
      return {
        text: "Partial",
        bg: "bg-amber-50 dark:bg-amber-500/10",
        textCol: "text-amber-700 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-500/20",
        Icon: AlertCircle,
      };
    }
    return {
      text: "Unpaid",
      bg: "bg-rose-50 dark:bg-rose-500/10",
      textCol: "text-rose-700 dark:text-rose-400",
      border: "border-rose-200 dark:border-rose-500/20",
      Icon: AlertCircle,
    };
  };

  const badgeConfig = getBadgeConfig();

  return (
    <div className="glass-panel rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col h-full relative">
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 dark:border-white/5 bg-white/50 dark:bg-[#030712]/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex w-full items-center justify-between bg-slate-100/50 dark:bg-[#0f172a]/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/5">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-white dark:hover:bg-[#1e293b] rounded-xl text-slate-600 dark:text-slate-300 transition-all shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <span className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">
              {viewDate.toLocaleString("default", { month: "long", year: "numeric" })}
            </span>
          </div>
          <button
            onClick={handleNextMonth}
            disabled={viewMonth >= currentMonthNum && viewYear >= currentYearNum}
            className="p-2 hover:bg-white dark:hover:bg-[#1e293b] rounded-xl text-slate-600 dark:text-slate-300 transition-all shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-white/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:shadow-none disabled:border-transparent"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-5 md:p-8 flex-1 bg-slate-50/30 dark:bg-transparent overflow-y-auto custom-scrollbar relative z-10">
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-8 p-4 bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>
            <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Attended</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></div>
            <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Missed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></div>
            <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Guest/Extra</span>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
            <div key={day} className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {historyLoading ? (
          <div className="h-48 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {paddingDays}
            {monthDays.map((day) => {
              const dateStr = getLocalDateString(viewYear, viewMonth, day);
              const isFuture = dateStr > todayString;
              const isToday = dateStr === todayString;
              const record = historyData?.find((r) => r.date === dateStr);

              // Dynamically extract statuses
              const meals = ['breakfast', 'lunch', 'dinner'];
              
              return (
                <motion.div
                  whileHover={!isFuture ? { scale: 1.05, y: -2 } : {}}
                  key={day}
                  className={`relative flex flex-col items-center p-1 sm:p-2 rounded-xl overflow-hidden transition-all min-h-[4.5rem] lg:min-h-[5.5rem] ${
                    isToday
                      ? "border-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-md"
                      : isFuture
                        ? "border-2 border-dashed border-slate-200 dark:border-[#1e293b] bg-slate-50/50 dark:bg-[#0f172a]/30"
                        : "border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1e293b]/50 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/50"
                  }`}
                >
                  <span className={`text-xs font-black mb-auto ${isToday ? "text-indigo-600 dark:text-indigo-400" : isFuture ? "text-slate-400 dark:text-slate-600" : "text-slate-800 dark:text-slate-200"}`}>
                    {day}
                  </span>

                  <div className="flex flex-wrap gap-1 mt-1 w-full justify-center">
                    {meals.map(meal => {
                      if (!record?.[meal]) return null;
                      const conf = getStatusConfig(record[meal].status, isFuture);
                      const Icon = MealIconMap[meal] || Sun;
                      return (
                        <div key={meal} className={`p-0.5 rounded-md border ${conf.bg} ${conf.border} ${conf.text}`} title={meal}>
                          <Icon className="w-3 h-3 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Digital Receipt Section */}
        <AnimatePresence mode="wait">
          {!billLoading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10 relative">
              <div className="glass-panel border-slate-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-xl">
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl">
                      <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    Official Statement
                  </h3>

                  {badgeConfig && (
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border ${badgeConfig.bg} ${badgeConfig.textCol} ${badgeConfig.border}`}>
                      <badgeConfig.Icon className="w-4 h-4" />
                      {badgeConfig.text}
                    </div>
                  )}
                </div>

                {!billData ? (
                  <div className="text-center py-10 bg-slate-50/50 dark:bg-[#0f172a]/50 rounded-2xl border border-slate-200 dark:border-white/5 border-dashed">
                    <Ban className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-500 dark:text-[#94a3b8] uppercase tracking-widest">
                      Bill not generated yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600 dark:text-[#94a3b8]">Base Meal Cost</span>
                        <button onClick={() => setShowDetails(!showDetails)} className="p-1 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md transition-colors group">
                          <Info className={`w-4 h-4 transition-colors ${showDetails ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500"}`} />
                        </button>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white">Rs. {billData.mealCost}</span>
                    </div>

                    <AnimatePresence>
                      {showDetails && billData.mealsTaken && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-slate-50/80 dark:bg-[#0f172a]/80 rounded-xl border border-slate-100 dark:border-white/5"
                        >
                          <div className="p-4">
                            <div className="grid grid-cols-3 text-[10px] font-black text-slate-400 dark:text-[#64748b] uppercase tracking-widest border-b border-slate-200 dark:border-white/10 pb-2 mb-3">
                              <span>Date</span>
                              <span className="text-center">Meal</span>
                              <span className="text-right">Price</span>
                            </div>
                            <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                              {billData.mealsTaken.map((meal, idx) => (
                                <div key={idx} className="grid grid-cols-3 text-xs font-bold text-slate-600 dark:text-slate-300 items-center">
                                  <span>{new Date(meal.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
                                  <span className="text-center flex justify-center">
                                    <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${meal.mealType.toLowerCase() === "lunch" ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" : "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20"}`}>
                                      {meal.mealType}
                                    </span>
                                  </span>
                                  <span className="text-right text-slate-900 dark:text-slate-100">Rs. {meal.priceCharged}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {billData.remainingBill > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-rose-500 dark:text-rose-400">Previous Arrears</span>
                        <span className="font-black text-rose-600 dark:text-rose-500">Rs. {billData.remainingBill}</span>
                      </div>
                    )}

                    {billData.fine > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-rose-500 dark:text-rose-400">Late Fine</span>
                        <span className="font-black text-rose-600 dark:text-rose-500">Rs. {billData.fine}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-600 dark:text-[#94a3b8]">Surcharges & Fees</span>
                      <span className="font-black text-slate-900 dark:text-white">Rs. {billData.factor + billData.serviceCharges}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm pb-3">
                      <span className="font-bold text-slate-600 dark:text-[#94a3b8]">Fuel Allocation</span>
                      <span className="font-black text-slate-900 dark:text-white">Rs. {billData.fuelCharges}</span>
                    </div>

                    <div className="border-t border-slate-200 dark:border-white/10 pt-4">
                      <div className="flex justify-between items-center text-base">
                        <span className="font-black text-slate-900 dark:text-white">Total Invoice</span>
                        <span className="font-black text-slate-900 dark:text-white">Rs. {billData.totalBill.toLocaleString()}</span>
                      </div>

                      {billData.amountPaid > 0 && (
                        <div className="flex justify-between items-center text-sm mt-1.5">
                          <span className="font-black text-emerald-600 dark:text-emerald-400">Already Paid</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400">- Rs. {billData.amountPaid.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t-2 border-dashed border-slate-300 dark:border-white/10 my-5"></div>

                    <div className="flex justify-between items-end">
                      <span className="text-xs font-black text-slate-500 dark:text-[#64748b] uppercase tracking-widest mb-1.5">Current Due</span>
                      <span className={`text-4xl font-black tracking-tighter ${billData.paid ? "text-emerald-500" : "text-indigo-600 dark:text-indigo-400"}`}>
                        <span className="text-xl">Rs. </span>
                        {(billData.paid ? 0 : (billData.remainingAmount !== undefined ? billData.remainingAmount : billData.totalBill)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
