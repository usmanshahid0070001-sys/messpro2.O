import { useState } from "react";
import {
  Users,
  Utensils,
  AlertCircle,
  CalendarDays,
  RefreshCw,
  Clock,
} from "lucide-react";
import { useDailyCounts } from "../../hooks/queries/useManagerQueries";

export default function LiveCounts() {
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  const {
    data: counts,
    isLoading,
    isError,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useDailyCounts(selectedDate);

  const handleDateChange = (e) => setSelectedDate(e.target.value);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-slate-200 dark:bg-[#1e293b] w-1/2 rounded-full animate-pulse" />
        <div className="flex flex-col gap-6">
          <div className="h-44 glass-panel rounded-[2.5rem] animate-pulse" />
          <div className="h-44 glass-panel rounded-[2.5rem] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-500 dark:text-[#888888]" />
            <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-white">
              Daily Counts
            </h2>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 glass-panel text-slate-500 dark:text-[#555555] hover:text-slate-900 dark:hover:text-white rounded-xl transition-all active:scale-90 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* DATE SELECTOR */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <CalendarDays className="w-4 h-4 text-slate-400 dark:text-[#555555] group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="w-full pl-11 pr-4 py-3.5 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-md border border-slate-200/50 dark:border-[#222222] text-sm font-bold text-slate-700 dark:text-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 outline-none shadow-sm transition-all cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>

        {/* LAST UPDATED STATUS */}
        <div className="flex items-center justify-between px-1">
          {isError ? (
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-500/20">
              <AlertCircle className="w-3 h-3" /> Error Syncing
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-[#555555]">
              <Clock className="w-3 h-3" />
              Updated:{" "}
              {new Date(dataUpdatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>

      {/* COUNT CARDS */}
      <div className="flex flex-col gap-6">
        {/* LUNCH CARD */}
        <div className="relative p-8 overflow-hidden glass-panel rounded-[2.5rem] group transition-all duration-300 border border-slate-200/50 dark:border-[#222222] hover:border-slate-300 dark:hover:border-[#444444]">
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500 pointer-events-none">
            <Utensils className="w-48 h-48 text-slate-900 dark:text-[#555555]" />
          </div>
          <div className="relative z-10">
            <h3 className="mb-2 text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 dark:text-[#555555] group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              Lunch Session
            </h3>
            <p className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm">
              {counts?.lunch ?? 0}
            </p>
            <p className="mt-2 text-xs font-bold text-slate-500 dark:text-[#888888]">
              Confirmed Bookings
            </p>
          </div>
        </div>

        {/* DINNER CARD */}
        <div className="relative p-8 overflow-hidden glass-panel rounded-[2.5rem] group transition-all duration-300 border border-slate-200/50 dark:border-[#222222] hover:border-slate-300 dark:hover:border-[#444444]">
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 pointer-events-none">
            <Utensils className="w-48 h-48 text-slate-900 dark:text-[#555555]" />
          </div>
          <div className="relative z-10">
            <h3 className="mb-2 text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 dark:text-[#555555] group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              Dinner Session
            </h3>
            <p className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm">
              {counts?.dinner ?? 0}
            </p>
            <p className="mt-2 text-xs font-bold text-slate-500 dark:text-[#888888]">
              Confirmed Bookings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
