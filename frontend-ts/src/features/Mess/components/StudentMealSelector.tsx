import { useState, useEffect, useMemo } from 'react'
import {
  Utensils,
  Save,
  Clock,
  CheckCircle2,
  Lock,
  Calendar,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  Check,
  Plus,
  Minus,
  Sun,
  Sunrise,
  Moon,
  Coffee,
  CheckCheck,
  ChevronRight,
  TrendingUp,
  Layers,
  Filter,
} from 'lucide-react'
import type { MealSchedule, StudentSelectionRecord } from '@/hooks/queries/useMealQueries'
import { useBulkSelectMeals } from '@/hooks/mutations/useMealMutations'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface StudentMealSelectorProps {
  schedule: MealSchedule | null
  selections: StudentSelectionRecord[] | undefined
  isSelectionsLoading: boolean
}

const STATIC_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

type DayOfWeek = (typeof STATIC_DAYS)[number]

// ── Time & Date Helpers ──────────────────────────────────────────────────
const hasTimePassed = (cutoffString: string): boolean => {
  if (!cutoffString) return false
  try {
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const match12 = cutoffString.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (match12) {
      let hours = parseInt(match12[1], 10)
      const minutes = parseInt(match12[2], 10)
      const period = match12[3].toUpperCase()
      if (period === 'PM' && hours < 12) hours += 12
      if (period === 'AM' && hours === 12) hours = 0
      return currentMinutes >= hours * 60 + minutes
    }

    const match24 = cutoffString.match(/^(\d{1,2}):(\d{2})$/)
    if (match24) {
      const hours = parseInt(match24[1], 10)
      const minutes = parseInt(match24[2], 10)
      return currentMinutes >= hours * 60 + minutes
    }

    return false
  } catch {
    return false
  }
}

// Generate the 7 days starting from Today (index 0 = Today, 1 = Tomorrow, ..., 6)
const getWeekDaysFromToday = () => {
  const days = []
  const today = new Date()

  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)

    const dayName = STATIC_DAYS[d.getDay()]
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const isoDate = `${yyyy}-${mm}-${dd}`

    const formattedLabel = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })

    const shortDay = d.toLocaleDateString('en-US', { weekday: 'short' })
    const dayOfMonth = d.getDate()

    days.push({
      offsetIndex: i,
      dayName,
      isoDate,
      formattedLabel,
      shortDay,
      dayOfMonth,
      isToday: i === 0,
      isTomorrow: i === 1,
    })
  }

  return days
}

// Slot Theme Generator (Sunrise for Breakfast, Sun for Lunch, Moon for Dinner)
const getSlotVisuals = (slotName: string) => {
  const norm = slotName.toLowerCase()
  if (norm.includes('break') || norm.includes('morn')) {
    return {
      icon: Sunrise,
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300',
    }
  }
  if (norm.includes('lunch') || norm.includes('afternoon') || norm.includes('noon')) {
    return {
      icon: Sun,
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      activeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
    }
  }
  if (norm.includes('dinner') || norm.includes('night') || norm.includes('supper')) {
    return {
      icon: Moon,
      badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      activeBg: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-700 dark:text-indigo-300',
    }
  }
  if (norm.includes('tea') || norm.includes('snack') || norm.includes('even')) {
    return {
      icon: Coffee,
      badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      activeBg: 'bg-teal-500/15 border-teal-500/40 text-teal-700 dark:text-teal-300',
    }
  }
  return {
    icon: Utensils,
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    activeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
  }
}

export default function StudentMealSelector({
  schedule,
  selections = [],
  isSelectionsLoading,
}: StudentMealSelectorProps) {
  const bulkSelectMutation = useBulkSelectMeals()

  const maxAllowed = schedule?.maxMealSelection || 1
  const isInactive = schedule?.status === 'inactive'
  const mealNames = schedule?.mealNames || ['Breakfast', 'Lunch', 'Dinner']
  const selectionTiming = schedule?.selectionTiming || []

  const weekDays = useMemo(() => getWeekDaysFromToday(), [])

  // View state: 'all' or specific day index (0..6)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | 'all'>('all')

  // selectionsMap: Record<isoDate_mealType, count: number>
  const [selectionsMap, setSelectionsMap] = useState<Record<string, number>>({})
  const [isDirty, setIsDirty] = useState(false)

  // Initialize selections from server data
  useEffect(() => {
    const initialMap: Record<string, number> = {}
    selections.forEach((rec) => {
      const key = `${rec.date}_${rec.mealType}`
      initialMap[key] = rec.selection?.count || 0
    })
    setSelectionsMap(initialMap)
    setIsDirty(false)
  }, [selections])

  // Helper to fetch dish details
  const getDishInfo = (dayName: string, slotIndex: number) => {
    const dayItems = (schedule?.menu as any)?.[dayName] || []
    const item = dayItems[slotIndex]
    const foodName = item?.meal === 'none' ? '' : item?.meal || ''
    const price = item?.price || 0
    return { foodName, price }
  }

  // Handle count updates
  const handleUpdateCount = (
    isoDate: string,
    mealType: string,
    delta: number,
    isLocked: boolean
  ) => {
    if (isInactive || isLocked) return

    const key = `${isoDate}_${mealType}`
    const current = selectionsMap[key] || 0
    const next = Math.max(0, Math.min(maxAllowed, current + delta))

    if (next !== current) {
      setIsDirty(true)
      setSelectionsMap((prev) => ({
        ...prev,
        [key]: next,
      }))
    }
  }

  // Quick 1-tap toggle (0 -> 1 -> 0)
  const handleToggle = (
    isoDate: string,
    mealType: string,
    isLocked: boolean
  ) => {
    if (isInactive || isLocked) return

    const key = `${isoDate}_${mealType}`
    const current = selectionsMap[key] || 0
    const next = current > 0 ? 0 : 1

    setIsDirty(true)
    setSelectionsMap((prev) => ({
      ...prev,
      [key]: next,
    }))
  }

  // ── Quick Bulk Actions ──
  const handleSelectAllWeek = () => {
    if (isInactive) return
    setIsDirty(true)
    setSelectionsMap((prev) => {
      const updated = { ...prev }
      weekDays.forEach((d) => {
        mealNames.forEach((mealType, idx) => {
          const isLocked = d.isToday && hasTimePassed(selectionTiming[idx])
          if (!isLocked) {
            updated[`${d.isoDate}_${mealType}`] = 1
          }
        })
      })
      return updated
    })
    toast.success('Selected 1 portion for all upcoming meals this week')
  }

  const handleSelectAllToday = () => {
    if (isInactive) return
    const today = weekDays[0]
    setIsDirty(true)
    setSelectionsMap((prev) => {
      const updated = { ...prev }
      mealNames.forEach((mealType, idx) => {
        const isLocked = hasTimePassed(selectionTiming[idx])
        if (!isLocked) {
          updated[`${today.isoDate}_${mealType}`] = 1
        }
      })
      return updated
    })
    toast.success("Selected today's meals")
  }

  const handleClearAllWeek = () => {
    if (isInactive) return
    setIsDirty(true)
    setSelectionsMap((prev) => {
      const updated = { ...prev }
      weekDays.forEach((d) => {
        mealNames.forEach((mealType, idx) => {
          const isLocked = d.isToday && hasTimePassed(selectionTiming[idx])
          if (!isLocked) {
            updated[`${d.isoDate}_${mealType}`] = 0
          }
        })
      })
      return updated
    })
    toast.info('Cleared all meal selections for this week')
  }

  // Save selections to backend
  const handleSave = async () => {
    const payloadSelections: any[] = []

    weekDays.forEach((d) => {
      mealNames.forEach((mealType, slotIdx) => {
        const key = `${d.isoDate}_${mealType}`
        const count = selectionsMap[key] || 0
        const dish = getDishInfo(d.dayName, slotIdx)

        payloadSelections.push({
          date: d.isoDate,
          mealType: mealType,
          mealInfo: {
            name: dish.foodName || mealType,
            price: dish.price,
          },
          count: count,
        })
      })
    })

    await bulkSelectMutation.mutateAsync({
      selections: payloadSelections,
    })

    setIsDirty(false)
  }

  // Revert changes
  const handleDiscard = () => {
    const initialMap: Record<string, number> = {}
    selections.forEach((rec) => {
      initialMap[`${rec.date}_${rec.mealType}`] = rec.selection?.count || 0
    })
    setSelectionsMap(initialMap)
    setIsDirty(false)
    toast.info('Discarded changes')
  }

  // ── Derived Weekly & Daily Metrics ──
  const todayInfo = weekDays[0]
  const todaySelectedCount = mealNames.reduce(
    (acc, name) => acc + (selectionsMap[`${todayInfo.isoDate}_${name}`] || 0),
    0
  )
  const todaySelectedNames = mealNames.filter(
    (name) => (selectionsMap[`${todayInfo.isoDate}_${name}`] || 0) > 0
  )

  const totalWeekSelectedMeals = weekDays.reduce((acc, d) => {
    return (
      acc +
      mealNames.reduce((subAcc, name) => {
        return subAcc + ((selectionsMap[`${d.isoDate}_${name}`] || 0) > 0 ? 1 : 0)
      }, 0)
    )
  }, 0)

  const maxTotalWeekSlots = weekDays.length * mealNames.length

  // Filter visible days
  const visibleDays =
    selectedDayIndex === 'all'
      ? weekDays
      : weekDays.filter((d) => d.offsetIndex === selectedDayIndex)

  return (
    <div className="space-y-6 pb-20">
      {/* ── 1. Hero Overview Card ── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Hostel Dining Plan
            </span>
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                !isInactive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  !isInactive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {!isInactive ? 'Pre-orders Open' : 'Menu View Only'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Weekly Meal Selection
          </h1>
          <p className="text-xs text-muted-foreground">
            Plan and pre-order your meals from today through the week. Max {maxAllowed} portion
            {maxAllowed > 1 ? 's' : ''} per meal.
          </p>
        </div>

        {/* Quick Summary Pill on Right */}
        <div className="flex items-center gap-3 self-start md:self-auto bg-muted/40 border border-border/80 p-3 rounded-xl">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Utensils className="h-4 w-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-foreground block">
              {totalWeekSelectedMeals} of {maxTotalWeekSlots} Meals
            </span>
            <span className="text-[11px] text-muted-foreground">Reserved this week</span>
          </div>
        </div>
      </div>

      {/* Inactive Alert Banner */}
      {isInactive && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <span className="font-semibold">Pre-orders are currently closed:</span> The hostel
            administration has locked meal selections. You can review the daily menu below.
          </div>
        </div>
      )}

      {/* ── 2. Today's Live Status Highlight ── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-card to-teal-500/10 border border-emerald-500/20 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Today's Dining Status</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                {todayInfo.formattedLabel}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {todaySelectedCount > 0
                ? `You have reserved ${todaySelectedCount} meal portion${
                    todaySelectedCount > 1 ? 's' : ''
                  } for today (${todaySelectedNames.join(', ')}).`
                : 'No meals selected for today yet.'}
            </p>
          </div>
        </div>

        {!isInactive && (
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAllToday}
              className="h-8 text-xs rounded-xl border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer font-medium"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              <span>Select Today</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAllWeek}
              className="h-8 text-xs rounded-xl border-border hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer font-medium"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              <span>Select All Week</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAllWeek}
              className="h-8 text-xs rounded-xl text-muted-foreground hover:text-rose-500 cursor-pointer"
            >
              Clear Week
            </Button>
          </div>
        )}
      </div>

      {/* ── 3. Interactive Horizontal Day Selector Strip ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Jump to Day
          </span>
          <button
            type="button"
            onClick={() => setSelectedDayIndex('all')}
            className={`text-xs font-medium transition-colors cursor-pointer ${
              selectedDayIndex === 'all'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {selectedDayIndex === 'all' ? '• Viewing All 7 Days' : 'Show All Days'}
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedDayIndex('all')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 ${
              selectedDayIndex === 'all'
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Full Week</span>
          </button>

          {weekDays.map((d) => {
            const isSelectedTab = selectedDayIndex === d.offsetIndex
            const daySelectedCount = mealNames.filter(
              (name) => (selectionsMap[`${d.isoDate}_${name}`] || 0) > 0
            ).length

            return (
              <button
                key={d.isoDate}
                type="button"
                onClick={() => setSelectedDayIndex(d.offsetIndex)}
                className={`px-4 py-2 rounded-2xl text-xs shrink-0 transition-all cursor-pointer border flex flex-col items-center gap-1 min-w-[84px] ${
                  isSelectedTab
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-xs'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="font-bold text-foreground text-xs">{d.shortDay}</span>
                  <span className="text-[11px] text-muted-foreground">{d.dayOfMonth}</span>
                </div>
                <div className="flex items-center gap-1">
                  {d.isToday && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${
                      daySelectedCount === mealNames.length
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : daySelectedCount > 0
                        ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {daySelectedCount}/{mealNames.length}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 4. 7-Day Interactive Meal Schedule Feed ── */}
      <div className="space-y-6">
        {visibleDays.map((day) => {
          const daySelectedCount = mealNames.filter(
            (name) => (selectionsMap[`${day.isoDate}_${name}`] || 0) > 0
          ).length

          return (
            <div
              key={day.isoDate}
              className={`rounded-2xl border bg-card overflow-hidden shadow-xs transition-all ${
                day.isToday
                  ? 'border-emerald-500/40 ring-1 ring-emerald-500/20'
                  : 'border-border'
              }`}
            >
              {/* Day Section Header */}
              <div
                className={`px-5 py-3.5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  day.isToday ? 'bg-emerald-500/10' : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar
                    className={`h-4 w-4 ${
                      day.isToday
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                  <span className="text-sm font-bold text-foreground">
                    {day.dayName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({day.formattedLabel})
                  </span>
                  {day.isToday && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white animate-pulse">
                      TODAY
                    </span>
                  )}
                  {day.isTomorrow && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      Tomorrow
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground font-medium">
                    {daySelectedCount} of {mealNames.length} meals selected
                  </span>
                </div>
              </div>

              {/* Day Meals Grid */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {mealNames.map((mealType, slotIdx) => {
                  const key = `${day.isoDate}_${mealType}`
                  const currentCount = selectionsMap[key] || 0
                  const isSelected = currentCount > 0
                  const cutoff = selectionTiming[slotIdx] || ''
                  const dish = getDishInfo(day.dayName, slotIdx)
                  const visuals = getSlotVisuals(mealType)
                  const SlotIcon = visuals.icon

                  // Cutoff lock check applies to today's meals
                  const isLocked = day.isToday && hasTimePassed(cutoff)

                  return (
                    <div
                      key={mealType}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/35 shadow-xs'
                          : isLocked
                          ? 'bg-muted/40 border-border/60 opacity-75'
                          : 'bg-muted/20 border-border/70 hover:border-emerald-500/30'
                      }`}
                    >
                      {/* Slot Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-lg border ${
                              isSelected
                                ? 'bg-emerald-500 text-white border-emerald-600'
                                : visuals.badge
                            }`}
                          >
                            <SlotIcon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-bold text-foreground">
                            {mealType}
                          </span>
                        </div>

                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <Lock className="h-2.5 w-2.5" />
                            Cutoff Passed
                          </span>
                        ) : cutoff ? (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            Cutoff: {cutoff}
                          </span>
                        ) : null}
                      </div>

                      {/* Dish & Price */}
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-foreground leading-snug">
                          {dish.foodName || 'No menu listed'}
                        </h4>
                        <div className="text-xs text-muted-foreground font-medium">
                          {dish.price > 0 ? (
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              Rs. {dish.price}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/80">Included in plan</span>
                          )}
                        </div>
                      </div>

                      {/* Stepper & Action Controls */}
                      <div className="pt-2 flex items-center justify-between gap-2 border-t border-border/50">
                        {isLocked || isInactive ? (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 py-1">
                            {isSelected ? (
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <Check className="h-3.5 w-3.5" />
                                {currentCount} portion{currentCount > 1 ? 's' : ''} reserved
                              </span>
                            ) : (
                              <span>Not ordered</span>
                            )}
                          </div>
                        ) : (
                          <>
                            {/* Tap to Toggle button */}
                            <button
                              type="button"
                              onClick={() => handleToggle(day.isoDate, mealType, isLocked)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                  : 'bg-card text-foreground border-border hover:bg-muted'
                              }`}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>{isSelected ? 'Selected' : 'Select'}</span>
                            </button>

                            {/* Quantity Stepper (if maxAllowed > 1) */}
                            {maxAllowed > 1 && (
                              <div className="flex items-center gap-1.5 bg-card border border-border p-1 rounded-xl">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateCount(day.isoDate, mealType, -1, isLocked)
                                  }
                                  disabled={currentCount <= 0}
                                  className="h-6 w-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                                  title="Decrease portion"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="font-mono text-xs font-bold text-foreground px-1 min-w-[18px] text-center">
                                  {currentCount}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateCount(day.isoDate, mealType, 1, isLocked)
                                  }
                                  disabled={currentCount >= maxAllowed}
                                  className="h-6 w-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                                  title="Increase portion"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 5. Sticky Floating Save Bar (When Unsaved Changes) ── */}
      {isDirty && !isInactive && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-emerald-500/40 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-foreground">You have unsaved meal selections</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDiscard}
              className="h-8 text-xs rounded-xl cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              <span>Discard</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={bulkSelectMutation.isPending}
              className="h-8 px-4 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm"
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              <span>{bulkSelectMutation.isPending ? 'Saving...' : 'Save Selections'}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
