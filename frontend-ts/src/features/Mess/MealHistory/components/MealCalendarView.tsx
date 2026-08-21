import React, { useState, useMemo } from 'react'
import {
  CheckCircle2,
  Clock,
  Utensils,
  X,
  Sparkles,
  DollarSign,
  AlertCircle,
} from 'lucide-react'
import type { StudentMonthlyMealRecord } from '@/hooks/queries/useMealQueries'

interface MealCalendarViewProps {
  currentDate: Date
  records: StudentMonthlyMealRecord[]
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export default function MealCalendarView({
  currentDate,
  records,
}: MealCalendarViewProps) {
  const [selectedDayRecord, setSelectedDayRecord] = useState<{
    dateStr: string
    meals: StudentMonthlyMealRecord[]
  } | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month])
  const firstDayOfWeek = useMemo(() => getFirstDayOfWeek(year, month), [year, month])

  // Map records by YYYY-MM-DD
  const recordsByDate = useMemo(() => {
    const map = new Map<string, StudentMonthlyMealRecord[]>()
    records.forEach((r) => {
      if (!map.has(r.date)) {
        map.set(r.date, [])
      }
      map.get(r.date)!.push(r)
    })
    return map
  }, [records])

  // Current day string for "Today" marker
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`

  // Build grid calendar cells
  const calendarCells = useMemo(() => {
    const cells: Array<{
      dayNumber: number | null
      dateStr: string | null
      meals: StudentMonthlyMealRecord[]
      isToday: boolean
    }> = []

    // Padding for days of previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ dayNumber: null, dateStr: null, meals: [], isToday: false })
    }

    // Days of the active month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayMeals = recordsByDate.get(dateStr) || []
      const isToday = dateStr === todayStr
      cells.push({ dayNumber: day, dateStr, meals: dayMeals, isToday })
    }

    return cells
  }, [daysInMonth, firstDayOfWeek, year, month, recordsByDate, todayStr])

  return (
    <div className="space-y-4">
      {/* Calendar Legend Bar */}
      <div className="bg-card border border-border p-3 sm:p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Monthly Attendance Grid</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs" />
            <span className="text-foreground">Eaten / Consumed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-2xs" />
            <span className="text-muted-foreground">Pre-Selected (Not Eaten)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40" />
            <span className="text-muted-foreground">Skipped / No Entry</span>
          </div>
        </div>
      </div>

      {/* 7-Column Calendar Grid */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        {/* Day of week headers */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/60 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-2.5">
          {WEEKDAYS.map((wd) => (
            <div key={wd}>{wd}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-border/60">
          {calendarCells.map((cell, idx) => {
            if (!cell.dayNumber) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[110px] sm:min-h-[130px] p-2 bg-muted/20 opacity-40 select-none"
                />
              )
            }

            const consumedMeals = cell.meals.filter((m) => m.attendance?.hasEaten)
            const dayExpense = consumedMeals.reduce(
              (sum, m) => sum + (m.mealInfo?.price || 0) * (m.attendance?.count || 1),
              0
            )

            return (
              <div
                key={`day-${cell.dayNumber}`}
                onClick={() => {
                  if (cell.meals.length > 0) {
                    setSelectedDayRecord({
                      dateStr: cell.dateStr!,
                      meals: cell.meals,
                    })
                  }
                }}
                className={`min-h-[110px] sm:min-h-[130px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors ${
                  cell.meals.length > 0 ? 'cursor-pointer hover:bg-muted/30' : 'bg-card'
                }`}
              >
                {/* Day Top: Number & Day Expense Tag */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`w-6 h-6 text-xs font-bold rounded-full flex items-center justify-center font-mono ${
                      cell.isToday
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-foreground'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {dayExpense > 0 && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono hidden sm:inline">
                      Rs. {dayExpense}
                    </span>
                  )}
                </div>

                {/* Day Middle: Meal Chips */}
                <div className="space-y-1 my-1">
                  {cell.meals.map((meal, mIdx) => {
                    const isEaten = meal.attendance?.hasEaten
                    const isSelected = meal.selection?.hasSelected
                    const count = meal.attendance?.count || meal.selection?.count || 1
                    const dishName = meal.mealInfo?.name || meal.mealType

                    return (
                      <div
                        key={mIdx}
                        className={`px-1.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium flex items-center justify-between gap-1 border truncate shadow-2xs ${
                          isEaten
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                            : isSelected
                            ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
                            : 'bg-muted text-muted-foreground border-border/60'
                        }`}
                        title={`${meal.mealType}: ${dishName} (Rs. ${meal.mealInfo?.price || 0}${
                          count > 1 ? ` x ${count}` : ''
                        })`}
                      >
                        <span className="truncate">
                          <span className="font-bold">{meal.mealType.charAt(0)}:</span>{' '}
                          <span className="hidden xl:inline">{dishName}</span>
                          <span className="xl:hidden">{dishName.split(' ')[0]}</span>
                          {count > 1 && <span className="font-bold"> (x{count})</span>}
                        </span>

                        {isEaten ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        ) : isSelected ? (
                          <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                        ) : null}
                      </div>
                    )
                  })}
                </div>

                {/* Day Bottom: Portions Count Tag */}
                <div className="text-[9px] sm:text-[10px] text-muted-foreground flex justify-between items-center">
                  <span>
                    {consumedMeals.length > 0
                      ? `${consumedMeals.reduce((s, m) => s + (m.attendance?.count || 1), 0)} eaten`
                      : ''}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDayRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-emerald-500/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Day Dining Breakdown
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    {selectedDayRecord.dateStr}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayRecord(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {selectedDayRecord.meals.map((meal, i) => {
                const isEaten = meal.attendance?.hasEaten
                const count = meal.attendance?.count || meal.selection?.count || 1
                const price = meal.mealInfo?.price || 0
                const mealTotal = price * count

                return (
                  <div
                    key={i}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-2xs ${
                      isEaten
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-muted/30 border-border/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-muted text-foreground">
                          {meal.mealType}
                        </span>
                        <h4 className="text-sm font-bold text-foreground">
                          {meal.mealInfo?.name || 'Meal Entry'}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Rs. {price} &times; {count} portion{count > 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground font-mono">
                        Rs. {mealTotal}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                          isEaten
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {isEaten ? 'Eaten' : 'Pre-Selected'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total Day Expense:</span>
              <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                Rs.{' '}
                {selectedDayRecord.meals
                  .filter((m) => m.attendance?.hasEaten)
                  .reduce(
                    (s, m) =>
                      s + (m.mealInfo?.price || 0) * (m.attendance?.count || 1),
                    0
                  )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
