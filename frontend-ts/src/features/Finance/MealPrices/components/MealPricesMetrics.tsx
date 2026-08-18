import { DollarSign, Users, TrendingUp, Utensils } from 'lucide-react'

interface MealPricesMetricsProps {
  grandTotalRevenue: number
  totalAttendanceCount: number
  averageMealPrice: number
  totalMealsCount: number
  daysCount: number
}

export default function MealPricesMetrics({
  grandTotalRevenue,
  totalAttendanceCount,
  averageMealPrice,
  totalMealsCount,
  daysCount,
}: MealPricesMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
      {/* 1. Total Billable Revenue ── (Finance & Dues / Purple) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-purple-500/40 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 truncate">
            <DollarSign className="h-4 w-4 text-purple-500 shrink-0" />
            <span className="truncate">Total Revenue</span>
          </span>
          <div className="p-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-semibold">
            Billable
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono truncate">
            Rs. {grandTotalRevenue.toLocaleString('en-PK')}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Across selected period
          </div>
        </div>
      </div>

      {/* 2. Total Portions Eaten ── (People & Access / Blue) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-blue-500/40 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 truncate">
            <Users className="h-4 w-4 text-blue-500 shrink-0" />
            <span className="truncate">Portions Eaten</span>
          </span>
          <div className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-semibold">
            Verified
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono truncate">
            {totalAttendanceCount.toLocaleString('en-PK')}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Recorded student entries
          </div>
        </div>
      </div>

      {/* 3. Average Price Per Meal ── (Food & Meals / Emerald) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-emerald-500/40 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 truncate">
            <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="truncate">Avg Price / Portion</span>
          </span>
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
            Weighted
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono truncate">
            Rs. {averageMealPrice.toFixed(1)}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Average cost per plate
          </div>
        </div>
      </div>

      {/* 4. Meal Sessions ── (Neutral Slate) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-slate-500/40 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 truncate">
            <Utensils className="h-4 w-4 text-slate-500 shrink-0" />
            <span className="truncate">Meal Slots</span>
          </span>
          <div className="p-1 rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-400 text-[10px] font-semibold">
            {daysCount} Days
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono truncate">
            {totalMealsCount}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Configured meal sessions
          </div>
        </div>
      </div>
    </div>
  )
}
