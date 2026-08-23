import React from 'react'
import {
  Utensils,
  Wallet,
  CalendarCheck2,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react'

interface MealHistoryMetricsProps {
  totalConsumedPortions: number
  totalMealCost: number
  activeDaysCount: number
  totalDaysInMonth: number
  totalPreSelectedCount: number
  totalPreSelectedEatenCount: number
}

function MealHistoryMetrics({
  totalConsumedPortions,
  totalMealCost,
  activeDaysCount,
  totalDaysInMonth,
  totalPreSelectedCount,
  totalPreSelectedEatenCount,
}: MealHistoryMetricsProps) {
  const selectionEfficiency =
    totalPreSelectedCount > 0
      ? Math.round((totalPreSelectedEatenCount / totalPreSelectedCount) * 100)
      : totalConsumedPortions > 0
      ? 100
      : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
      {/* 1. Total Consumed Portions (Food & Meals / Emerald) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-emerald-500/40 transition-all group">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 whitespace-nowrap min-w-0">
            <Utensils className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="truncate">Meals Consumed</span>
          </span>
          <div className="p-1 px-2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold shrink-0">
            Attendance
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono truncate">
            {totalConsumedPortions} <span className="text-base font-medium">portions</span>
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Total claimed dining hall meals
          </div>
        </div>
      </div>

      {/* 2. Base Meal Expenses (Finance / Purple) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-purple-500/40 transition-all group">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 whitespace-nowrap min-w-0">
            <Wallet className="h-4 w-4 text-purple-500 shrink-0" />
            <span className="truncate">Base Mess Expense</span>
          </span>
          <div className="p-1 px-2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-semibold shrink-0">
            Base Ledger
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono truncate">
            Rs. {Math.round(totalMealCost).toLocaleString('en-PK')}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Accumulated consumed dishes cost
          </div>
        </div>
      </div>

      {/* 3. Active Dining Days (People & Access / Blue) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-blue-500/40 transition-all group">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 whitespace-nowrap min-w-0">
            <CalendarCheck2 className="h-4 w-4 text-blue-500 shrink-0" />
            <span className="truncate">Dining Days</span>
          </span>
          <div className="p-1 px-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-semibold shrink-0">
            {activeDaysCount}/{totalDaysInMonth} Days
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono truncate">
            {activeDaysCount} <span className="text-base font-medium">days</span>
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Days with at least 1 eaten meal
          </div>
        </div>
      </div>

      {/* 4. Pre-Selection Efficiency (Neutral Slate) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-slate-500/40 transition-all group">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 whitespace-nowrap min-w-0">
            <TrendingUp className="h-4 w-4 text-slate-500 shrink-0" />
            <span className="truncate">Selection Intake</span>
          </span>
          <div className="p-1 px-2 rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-400 text-[10px] font-semibold shrink-0">
            {selectionEfficiency}% Claimed
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono truncate">
            {selectionEfficiency}%
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            {totalPreSelectedCount > 0
              ? `${totalPreSelectedEatenCount} of ${totalPreSelectedCount} booked meals eaten`
              : 'No pre-selection bookings required'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(MealHistoryMetrics)
