import React from 'react'
import {
  AlertTriangle,
  Flame,
  TrendingUp,
  UserX,
  UtensilsCrossed,
  CheckCircle2,
} from 'lucide-react'

interface MealControlMetricsProps {
  totalViolations: number
  totalExtraMeals: number
  totalMissedMeals: number
  totalPlannedSelections: number
  totalActualAttendance: number
}

export default function MealControlMetrics({
  totalViolations,
  totalExtraMeals,
  totalMissedMeals,
  totalPlannedSelections,
  totalActualAttendance,
}: MealControlMetricsProps) {
  const turnoutRate =
    totalPlannedSelections > 0
      ? Math.round((totalActualAttendance / totalPlannedSelections) * 100)
      : totalActualAttendance > 0
      ? 100
      : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* ── Metric 1: Total Violations ── */}
      <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs relative overflow-hidden group hover:border-amber-500/30 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted-foreground">
            Total Flagged Records
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {totalViolations}
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">
            {totalViolations === 1 ? 'incident' : 'incidents'}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground/80 mt-1.5">
          Selection vs dining discrepancies
        </p>
      </div>

      {/* ── Metric 2: Extra / Unselected Meals Eaten ── */}
      <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs relative overflow-hidden group hover:border-amber-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted-foreground">
            Unselected / Extra Eaten
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
            <Flame className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
            +{totalExtraMeals}
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">
            extra meals
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground/80 mt-1.5">
          Ate without active meal reservation
        </p>
      </div>

      {/* ── Metric 3: Missed / Wasted Meals ── */}
      <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs relative overflow-hidden group hover:border-rose-500/30 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted-foreground">
            Missed / Wasted Meals
          </span>
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 group-hover:bg-rose-500/20 transition-colors">
            <UserX className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
            {totalMissedMeals}
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">
            meals wasted
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground/80 mt-1.5">
          Selected meals where student was absent
        </p>
      </div>

      {/* ── Metric 4: Turnout & Headcount ── */}
      <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted-foreground">
            Turnout & Diners
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
            <UtensilsCrossed className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {totalActualAttendance}
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">
            / {totalPlannedSelections} booked ({turnoutRate}%)
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground/80 mt-1.5">
          Total verified meals served today
        </p>
      </div>
    </div>
  )
}
