import React from 'react'
import {
  Utensils,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Calculator,
  LayoutGrid,
  List,
  Sparkles,
  RotateCcw,
} from 'lucide-react'

export type MealHistoryViewMode = 'calendar' | 'timeline'

interface MealHistoryHeaderProps {
  currentDate: Date
  onPrevMonth: () => void
  onNextMonth: () => void
  onResetCurrentMonth: () => void
  isCurrentMonth: boolean
  viewMode: MealHistoryViewMode
  onViewModeChange: (mode: MealHistoryViewMode) => void
  totalRecordsCount: number
  onScrollToEstimator: () => void
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export default function MealHistoryHeader({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onResetCurrentMonth,
  isCurrentMonth,
  viewMode,
  onViewModeChange,
  totalRecordsCount,
  onScrollToEstimator,
}: MealHistoryHeaderProps) {
  const monthName = MONTH_NAMES[currentDate.getMonth()]
  const year = currentDate.getFullYear()

  return (
    <div className="space-y-4">
      {/* Top Banner: Title & Primary CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Meal Consumption History
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                Mess & Meals
              </span>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                {totalRecordsCount} Logged Entries
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Review your daily dining attendance, pre-selected portions, and calculate projected dues with the live bill estimator.
            </p>
          </div>
        </div>

        {/* Action Button: Scroll to Live Bill Estimator */}
        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={onScrollToEstimator}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>Estimate Bill</span>
          </button>
        </div>
      </div>

      {/* Controls & Month Switcher Bar */}
      <div className="bg-card border border-border p-3 sm:p-4 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Month Navigation Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border/80 shadow-2xs">
              <button
                type="button"
                onClick={onPrevMonth}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-3 py-1 font-bold text-xs sm:text-sm text-foreground flex items-center gap-2 min-w-[130px] justify-center font-mono">
                <CalendarIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  {monthName} {year}
                </span>
              </div>

              <button
                type="button"
                onClick={onNextMonth}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {!isCurrentMonth && (
              <button
                type="button"
                onClick={onResetCurrentMonth}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-muted/60 hover:bg-muted border border-border/80 text-foreground transition-colors shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-muted-foreground" />
                <span>This Month</span>
              </button>
            )}
          </div>

          {/* View Mode Switcher (Grid Calendar vs. Timeline List) */}
          <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border/80 self-start sm:self-auto shadow-2xs">
            <button
              type="button"
              onClick={() => onViewModeChange('calendar')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-xs border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('timeline')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-xs border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Timeline List</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
