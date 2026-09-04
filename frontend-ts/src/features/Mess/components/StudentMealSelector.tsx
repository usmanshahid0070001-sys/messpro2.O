import { useState, useEffect, useMemo } from 'react'
import {
  Utensils,
  Save,
  Clock,
  AlertCircle,
  Check,
  CheckCheck,
  Sunrise,
  Sun,
  Moon,
  Coffee,
  Layers,
  Calendar,
  Lock,
  CheckCircle2,
  Minus,
  Plus,
  RotateCcw,
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

const formatTimeRange = (range?: { start?: string; end?: string } | string) => {
  if (!range) return '—'
  if (typeof range === 'string') return range
  if (range.start && range.end) return `${range.start} – ${range.end}`
  return range.end || range.start || '—'
}

const hasTimePassed = (timing?: { start?: string; end?: string } | string): boolean => {
  if (!timing) return false
  const timeStr = typeof timing === 'object' && timing.end ? timing.end : (typeof timing === 'string' ? timing : '')
  if (!timeStr) return false
  try {
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const match12 = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (match12) {
      let hours = parseInt(match12[1], 10)
      const minutes = parseInt(match12[2], 10)
      const period = match12[3].toUpperCase()
      if (period === 'PM' && hours < 12) hours += 12
      if (period === 'AM' && hours === 12) hours = 0
      return currentMinutes >= hours * 60 + minutes
    }

    const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/)
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
  const servingTiming = schedule?.servingTiming || []

  const weekDays = useMemo(() => getWeekDaysFromToday(), [])

  const [selectedDayIndex, setSelectedDayIndex] = useState<number | 'all'>('all')

  const [selectionsMap, setSelectionsMap] = useState<Record<string, number>>({})
  const [isDirty, setIsDirty] = useState(false)
  const [showCutoffModal, setShowCutoffModal] = useState(false)

  useEffect(() => {
    const initialMap: Record<string, number> = {}
    selections.forEach((rec) => {
      const key = `${rec.date}_${rec.mealType}`
      initialMap[key] = rec.selection?.count || 0
    })
    setSelectionsMap(initialMap)
    setIsDirty(false)
  }, [selections])

  const getDishInfo = (dayName: string, slotIndex: number) => {
    const dayItems = (schedule?.menu as any)?.[dayName] || []
    const item = dayItems[slotIndex]
    const foodName = item?.meal === 'none' ? '' : item?.meal || ''
    const price = item?.price || 0
    return { foodName, price }
  }

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

    try {
      await bulkSelectMutation.mutateAsync({ selections: payloadSelections })
      setIsDirty(false)
      toast.success('Your weekly meal preferences have been saved!')
    } catch (err: any) {
      // Toast already handled by mutation hook
    }
  }

  const handleDiscard = () => {
    const initialMap: Record<string, number> = {}
    selections.forEach((rec) => {
      initialMap[`${rec.date}_${rec.mealType}`] = rec.selection?.count || 0
    })
    setSelectionsMap(initialMap)
    setIsDirty(false)
    toast.info('Discarded changes')
  }

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
    <div className="space-y-5 pb-20 w-full max-w-full min-w-0">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center justify-between sm:justify-start gap-2.5 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground leading-tight">
                Weekly Meal Plan
              </h1>
              <p className="text-xs text-muted-foreground">
                {totalWeekSelectedMeals} of {maxTotalWeekSlots} meals reserved this week
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
            {isSelectionsLoading && (
              <span className="text-[11px] text-muted-foreground animate-pulse flex items-center gap-1 mr-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Syncing...
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
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
              {!isInactive ? 'Open' : 'Locked'}
            </span>

            <button
              type="button"
              onClick={() => setShowCutoffModal(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="View Cutoff Rules & Timing Info"
            >
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </button>
          </div>
        </div>

        {/* Quick Batch Actions */}
        {!isInactive && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-border/40 sm:self-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAllToday}
              className="h-7 px-2.5 text-[11px] font-semibold rounded-lg border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
            >
              <Check className="h-3 w-3 mr-1" />
              <span>Select Today</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAllWeek}
              className="h-7 px-2.5 text-[11px] font-semibold rounded-lg border-border hover:bg-emerald-500/10 hover:text-emerald-600 cursor-pointer"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              <span>Select Week</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAllWeek}
              className="h-7 px-2 text-[11px] text-muted-foreground hover:text-rose-500 cursor-pointer"
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Inactive Notice (Only when pre-orders are locked) */}
      {isInactive && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>Pre-orders are currently closed by admin. You can view the menu below.</span>
        </div>
      )}

      {/* ── 2. Instant Horizontal Day Selector Strip ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
        <button
          type="button"
          onClick={() => setSelectedDayIndex('all')}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 ${
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
              className={`px-3 py-1.5 rounded-xl text-xs shrink-0 transition-all cursor-pointer border flex items-center gap-2 ${
                isSelectedTab
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-bold shadow-xs'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-1">
                {d.isToday && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                <span>{d.isToday ? 'Today' : d.shortDay}</span>
                <span className="text-[10px] text-muted-foreground/80">{d.dayOfMonth}</span>
              </div>
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
            </button>
          )
        })}
      </div>

      {/* ── 3. Interactive Meals Grid (Directly Visible Above Fold) ── */}
      <div className="space-y-4">
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
                className={`px-4 py-2.5 border-b border-border flex items-center justify-between gap-2 ${
                  day.isToday ? 'bg-emerald-500/10' : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar
                    className={`h-3.5 w-3.5 ${
                      day.isToday
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    {day.dayName}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    ({day.formattedLabel})
                  </span>
                  {day.isToday && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500 text-white animate-pulse">
                      TODAY
                    </span>
                  )}
                  {day.isTomorrow && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      Tomorrow
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-muted-foreground font-medium">
                  {daySelectedCount}/{mealNames.length} selected
                </span>
              </div>

              {/* Day Meals Grid */}
              <div className="p-3.5 sm:p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/35 shadow-xs'
                          : isLocked
                          ? 'bg-muted/40 border-border/60 opacity-75'
                          : 'bg-muted/20 border-border/70 hover:border-emerald-500/30'
                      }`}
                    >
                      {/* Slot Header */}
                      <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`p-1.5 rounded-lg border ${
                              isSelected
                                ? 'bg-emerald-500 text-white border-emerald-600'
                                : visuals.badge
                            }`}
                          >
                            <SlotIcon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-foreground block">
                              {mealType}
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium block">
                              Serving: {formatTimeRange(servingTiming[slotIdx])}
                            </span>
                          </div>
                        </div>

                        {isLocked ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            title={`Selection cutoff was ${formatTimeRange(cutoff)}. Orders for this meal are locked.`}
                          >
                            <Lock className="h-2.5 w-2.5" />
                            Passed
                          </span>
                        ) : cutoff ? (
                          <span
                            className={`text-[10px] flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full border ${
                              day.isToday
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                : 'bg-muted text-muted-foreground border-border/60'
                            }`}
                            title={`You can select or change this meal until ${formatTimeRange(cutoff)} ${
                              day.isToday ? 'today' : `on ${day.dayName}`
                            }`}
                          >
                            <Clock
                              className={`h-2.5 w-2.5 ${
                                day.isToday
                                  ? 'text-emerald-600 dark:text-emerald-400 animate-pulse'
                                  : 'text-muted-foreground'
                              }`}
                            />
                            Cutoff: {typeof cutoff === 'object' && cutoff?.end ? cutoff.end : (typeof cutoff === 'string' ? cutoff : '—')}
                          </span>
                        ) : null}
                      </div>

                      {/* Dish & Price */}
                      <div className="space-y-0.5">
                        <h4 className="text-xs sm:text-sm font-semibold text-foreground leading-snug line-clamp-2">
                          {dish.foodName || 'No menu listed'}
                        </h4>
                        <div className="text-[11px] text-muted-foreground font-medium">
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
                      <div className="pt-1.5 flex items-center justify-between gap-2 border-t border-border/50">
                        {isLocked || isInactive ? (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 py-1">
                            {isSelected ? (
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                {currentCount} portion{currentCount > 1 ? 's' : ''} reserved
                              </span>
                            ) : (
                              <span className="text-muted-foreground/70">Not ordered</span>
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
                              <div className="flex items-center gap-1 bg-card border border-border p-0.5 rounded-xl">
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
                                <span className="font-mono text-xs font-bold text-foreground px-1 min-w-[16px] text-center">
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

      {/* ── 4. On-Demand Cutoff & Guidelines Modal ── */}
      {showCutoffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Clock className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Cutoff Times & Rules</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCutoffModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground font-semibold">What is Cutoff Time?</strong>
                <br />
                The cutoff time is the deadline by which you can select, modify, or cancel a meal portion. You can change your choices freely anytime <strong className="text-foreground">before this time arrives</strong>.
              </p>
              <p>
                Once cutoff passes, that slot is locked so the kitchen staff can prepare the exact number of meals.
              </p>

              {selectionTiming.length > 0 && (
                <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
                  <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider block">
                    Hostel Meal Timings:
                  </span>
                  {mealNames.map((name, i) => (
                    <div key={name} className="flex justify-between items-center text-xs border-b border-border/40 pb-1.5 last:border-0 last:pb-0">
                      <div>
                        <span className="font-bold text-foreground block">{name}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                          Serving: {formatTimeRange(servingTiming[i])}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        Order Window: {formatTimeRange(selectionTiming[i])}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => setShowCutoffModal(false)}
                className="h-8 px-4 text-xs font-semibold rounded-xl"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Sticky Floating Save Bar (When Unsaved Changes) ── */}
      {isDirty && !isInactive && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md p-3.5 rounded-2xl bg-card/95 backdrop-blur-md border border-emerald-500/40 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-foreground">Unsaved selections</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDiscard}
              className="h-8 text-xs rounded-xl cursor-pointer"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              <span>Discard</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={bulkSelectMutation.isPending}
              className="h-8 px-4 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm"
            >
              <Save className="h-3 w-3 mr-1" />
              <span>{bulkSelectMutation.isPending ? 'Saving...' : 'Save'}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
