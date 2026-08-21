import React, { useState, useMemo } from 'react'
import {
  Calendar,
  Utensils,
  CheckCircle2,
  Clock,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react'
import type { StudentMonthlyMealRecord } from '@/hooks/queries/useMealQueries'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface MealTimelineListViewProps {
  records: StudentMonthlyMealRecord[]
}

type MealTypeFilter = 'all' | 'Breakfast' | 'Lunch' | 'Dinner'
type AttendanceFilter = 'all' | 'eaten' | 'selected'

export default function MealTimelineListView({
  records,
}: MealTimelineListViewProps) {
  const [mealTypeFilter, setMealTypeFilter] = useState<MealTypeFilter>('all')
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>('all')

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (mealTypeFilter !== 'all' && r.mealType !== mealTypeFilter) {
        return false
      }
      if (attendanceFilter === 'eaten' && !r.attendance?.hasEaten) {
        return false
      }
      if (attendanceFilter === 'selected' && !r.selection?.hasSelected) {
        return false
      }
      return true
    })
  }, [records, mealTypeFilter, attendanceFilter])

  // Group by Date (Sorted Descending)
  const groupedByDate = useMemo(() => {
    const groups = new Map<string, StudentMonthlyMealRecord[]>()
    filteredRecords.forEach((r) => {
      if (!groups.has(r.date)) {
        groups.set(r.date, [])
      }
      groups.get(r.date)!.push(r)
    })

    // Sort dates descending
    return Array.from(groups.entries()).sort(
      ([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime()
    )
  }, [filteredRecords])

  if (records.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground mb-3">
          <Utensils className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">No Meal Records Logged</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          No dining attendance or meal pre-selections found for this month.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <div className="bg-card border border-border p-3 sm:p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">
            {groupedByDate.length} {groupedByDate.length === 1 ? 'Day' : 'Days'} with Logs
          </span>
          <span className="text-muted-foreground">
            ({filteredRecords.length} total entries)
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Meal Type Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <span>
                  {mealTypeFilter === 'all' ? 'All Meals' : mealTypeFilter}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                Meal Type
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={mealTypeFilter}
                onValueChange={(v) => setMealTypeFilter(v as MealTypeFilter)}
              >
                <DropdownMenuRadioItem value="all" className="text-xs cursor-pointer">
                  All Meals
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Breakfast" className="text-xs cursor-pointer">
                  Breakfast
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Lunch" className="text-xs cursor-pointer">
                  Lunch
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Dinner" className="text-xs cursor-pointer">
                  Dinner
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Attendance Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                <span>
                  {attendanceFilter === 'all'
                    ? 'All Activity'
                    : attendanceFilter === 'eaten'
                    ? 'Eaten Only'
                    : 'Pre-Selected'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                Attendance Status
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={attendanceFilter}
                onValueChange={(v) => setAttendanceFilter(v as AttendanceFilter)}
              >
                <DropdownMenuRadioItem value="all" className="text-xs cursor-pointer">
                  All Activity
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="eaten" className="text-xs cursor-pointer">
                  Eaten Only
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="selected" className="text-xs cursor-pointer">
                  Pre-Selected
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-3">
        {groupedByDate.map(([dateStr, dayMeals]) => {
          const dateObj = new Date(dateStr)
          const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
          const formattedDate = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })

          const dayEatenMeals = dayMeals.filter((m) => m.attendance?.hasEaten)
          const dayTotalCost = dayEatenMeals.reduce(
            (sum, m) => sum + (m.mealInfo?.price || 0) * (m.attendance?.count || 1),
            0
          )

          return (
            <div
              key={dateStr}
              className="bg-card border border-border p-4 rounded-2xl shadow-xs space-y-3"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                    {weekday}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground font-mono">
                      {formattedDate} &bull; {dateStr}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {dayEatenMeals.length} meal{dayEatenMeals.length === 1 ? '' : 's'} consumed
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-semibold text-muted-foreground">Day Total</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    Rs. {dayTotalCost.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Day Meal Line Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {dayMeals.map((meal, mIdx) => {
                  const isEaten = meal.attendance?.hasEaten
                  const isSelected = meal.selection?.hasSelected
                  const count = meal.attendance?.count || meal.selection?.count || 1
                  const price = meal.mealInfo?.price || 0
                  const itemTotal = price * count

                  return (
                    <div
                      key={mIdx}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        isEaten
                          ? 'bg-emerald-500/5 border-emerald-500/20'
                          : 'bg-muted/30 border-border/60'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-muted text-foreground uppercase tracking-wider">
                            {meal.mealType}
                          </span>
                          <span className="text-xs font-bold text-foreground truncate">
                            {meal.mealInfo?.name || meal.mealType}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                          Rs. {price} &times; {count} portion{count > 1 ? 's' : ''}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-foreground font-mono">
                          Rs. {itemTotal}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 border ${
                            isEaten
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : isSelected
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                              : 'bg-muted text-muted-foreground border-border/60'
                          }`}
                        >
                          {isEaten ? (
                            <>
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Eaten</span>
                            </>
                          ) : isSelected ? (
                            <>
                              <Clock className="w-2.5 h-2.5" />
                              <span>Booked</span>
                            </>
                          ) : (
                            <span>Skipped</span>
                          )}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
