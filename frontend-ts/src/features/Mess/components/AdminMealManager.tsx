import { useState, useEffect } from 'react'
import {
  Utensils,
  Save,
  RotateCcw,
  Clock,
  Settings2,
  Copy,
  Trash2,
} from 'lucide-react'
import type { MealSchedule, MenuItem } from '@/hooks/queries/useMealQueries'
import { useUpdateMealSchedule } from '@/hooks/mutations/useMealMutations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import MealTimingModal from './MealTimingModal'

interface AdminMealManagerProps {
  schedule: MealSchedule | null
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

type DayName = (typeof DAYS_OF_WEEK)[number]

const formatTimeRange = (range?: { start?: string; end?: string } | string) => {
  if (!range) return '—'
  if (typeof range === 'string') return range
  if (range.start && range.end) return `${range.start} – ${range.end}`
  return range.end || range.start || '—'
}

export default function AdminMealManager({
  schedule,
}: AdminMealManagerProps) {
  const updateScheduleMutation = useUpdateMealSchedule()

  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [maxMealSelection, setMaxMealSelection] = useState<number>(1)
  const [mealNames, setMealNames] = useState<string[]>(['Breakfast', 'Lunch', 'Dinner'])
  const [selectionTiming, setSelectionTiming] = useState<Array<{ start: string; end: string }>>([
    { start: '06:00', end: '07:00' },
    { start: '06:00', end: '11:30' },
    { start: '06:00', end: '18:30' },
  ])
  const [servingTiming, setServingTiming] = useState<Array<{ start: string; end: string }>>([
    { start: '07:30', end: '10:00' },
    { start: '12:30', end: '15:00' },
    { start: '19:30', end: '22:00' },
  ])

  // Menu: Record<DayName, MenuItem[]>
  const [menu, setMenu] = useState<Record<DayName, MenuItem[]>>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  })

  const [activeDay, setActiveDay] = useState<DayName>('Monday')
  const [viewMode, setViewMode] = useState<'tabs' | 'table'>('tabs')
  const [isTimingModalOpen, setIsTimingModalOpen] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Initialize from server schedule or defaults
  useEffect(() => {
    if (schedule) {
      setStatus(schedule.status || 'active')
      setMaxMealSelection(schedule.maxMealSelection || 1)

      const names =
        schedule.mealNames && schedule.mealNames.length > 0
          ? schedule.mealNames
          : ['Breakfast', 'Lunch', 'Dinner']
      setMealNames(names)

      const timings =
        schedule.selectionTiming && schedule.selectionTiming.length > 0
          ? schedule.selectionTiming.map((t, i) => {
              if (typeof t === 'object' && t !== null) {
                return {
                  start: t.start || '06:00',
                  end: t.end || (i === 0 ? '07:00' : i === 1 ? '11:30' : '18:30'),
                }
              }
              return {
                start: '06:00',
                end: String(t || (i === 0 ? '07:00' : i === 1 ? '11:30' : '18:30')),
              }
            })
          : names.map((_, i) => ({
              start: '06:00',
              end: i === 0 ? '07:00' : i === 1 ? '11:30' : '18:30',
            }))
      setSelectionTiming(timings)

      const servTimings =
        schedule.servingTiming && schedule.servingTiming.length > 0
          ? schedule.servingTiming.map((s, i) => ({
              start: s?.start || (i === 0 ? '07:30' : i === 1 ? '12:30' : '19:30'),
              end: s?.end || (i === 0 ? '10:00' : i === 1 ? '15:00' : '22:00'),
            }))
          : names.map((_, i) =>
              i === 0
                ? { start: '07:30', end: '10:00' }
                : i === 1
                ? { start: '12:30', end: '15:00' }
                : { start: '19:30', end: '22:00' }
            )
      setServingTiming(servTimings)

      const loadedMenu: Record<DayName, MenuItem[]> = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      }

      DAYS_OF_WEEK.forEach((day) => {
        const dayItems = schedule.menu?.[day] || []
        // Ensure each slot in mealNames has a menuItem
        loadedMenu[day] = names.map((_, index) => {
          const existing = dayItems[index]
          return {
            meal: existing?.meal || '',
            price: existing?.price !== undefined ? existing.price : 0,
          }
        })
      })

      setMenu(loadedMenu)
      setIsDirty(false)
    } else {
      // Default empty schedule
      const defaultNames = ['Breakfast', 'Lunch', 'Dinner']
      const defaultTimings = [
        { start: '06:00', end: '07:00' },
        { start: '06:00', end: '11:30' },
        { start: '06:00', end: '18:30' },
      ]
      const defaultServing = [
        { start: '07:30', end: '10:00' },
        { start: '12:30', end: '15:00' },
        { start: '19:30', end: '22:00' },
      ]
      setMealNames(defaultNames)
      setSelectionTiming(defaultTimings)
      setServingTiming(defaultServing)
      const emptyMenu: Record<DayName, MenuItem[]> = {
        Monday: defaultNames.map(() => ({ meal: '', price: 0 })),
        Tuesday: defaultNames.map(() => ({ meal: '', price: 0 })),
        Wednesday: defaultNames.map(() => ({ meal: '', price: 0 })),
        Thursday: defaultNames.map(() => ({ meal: '', price: 0 })),
        Friday: defaultNames.map(() => ({ meal: '', price: 0 })),
        Saturday: defaultNames.map(() => ({ meal: '', price: 0 })),
        Sunday: defaultNames.map(() => ({ meal: '', price: 0 })),
      }
      setMenu(emptyMenu)
      setIsDirty(false)
    }
  }, [schedule])

  // Handle dish change for day and slot
  const handleItemChange = (
    day: DayName,
    slotIndex: number,
    field: 'meal' | 'price',
    value: any
  ) => {
    setIsDirty(true)
    setMenu((prev) => {
      const copy = { ...prev }
      const dayArr = [...(copy[day] || [])]
      while (dayArr.length <= slotIndex) {
        dayArr.push({ meal: '', price: 0 })
      }
      dayArr[slotIndex] = {
        ...dayArr[slotIndex],
        [field]: field === 'price' ? Number(value) || 0 : value,
      }
      copy[day] = dayArr
      return copy
    })
  }

  // Save timing & slot changes from modal
  const handleSaveMealTypes = (
    newNames: string[],
    newSelectionTiming: Array<{ start: string; end: string }>,
    newServingTiming: Array<{ start: string; end: string }>
  ) => {
    setIsDirty(true)
    setMealNames(newNames)
    setSelectionTiming(newSelectionTiming)
    setServingTiming(newServingTiming)

    setMenu((prev) => {
      const updated: Record<DayName, MenuItem[]> = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      }

      DAYS_OF_WEEK.forEach((day) => {
        const currentArr = prev[day] || []
        updated[day] = newNames.map((_, idx) => {
          return currentArr[idx] || { meal: '', price: 0 }
        })
      })

      return updated
    })

    toast.success('Updated meal slots, selection windows & serving ranges')
  }

  // Copy day menu to all other days
  const handleCopyDayToAll = (sourceDay: DayName) => {
    setIsDirty(true)
    const sourceItems = menu[sourceDay] || []
    setMenu((prev) => {
      const updated = { ...prev }
      DAYS_OF_WEEK.forEach((day) => {
        if (day !== sourceDay) {
          updated[day] = sourceItems.map((item) => ({ ...item }))
        }
      })
      return updated
    })
    toast.success(`Copied ${sourceDay} menu to all other days`)
  }

  // Clear single day menu
  const handleClearDay = (targetDay: DayName) => {
    setIsDirty(true)
    setMenu((prev) => {
      const updated = { ...prev }
      updated[targetDay] = mealNames.map(() => ({ meal: '', price: 0 }))
      return updated
    })
    toast.info(`Cleared dishes for ${targetDay}`)
  }

  // Save all schedule changes
  const handleSaveSchedule = async () => {
    // Clean and build payload
    const safeMenuPayload: any = {}
    DAYS_OF_WEEK.forEach((day) => {
      const dayArr = menu[day] || []
      safeMenuPayload[day] = mealNames.map((_, idx) => {
        const item = dayArr[idx]
        return {
          meal: (item?.meal || '').trim() || 'none',
          price: Math.max(0, item?.price || 0),
        }
      })
    })

    await updateScheduleMutation.mutateAsync({
      status,
      maxMealSelection,
      numberOfMeals: mealNames.length,
      mealNames,
      selectionTiming,
      servingTiming,
      menu: safeMenuPayload,
    })

    setIsDirty(false)
  }

  const handleDiscard = () => {
    if (schedule) {
      setStatus(schedule.status || 'active')
      setMaxMealSelection(schedule.maxMealSelection || 1)
      setIsDirty(false)
      toast.info('Discarded unsaved changes')
    }
  }

  return (
    <div className="space-y-5 pb-12 w-full max-w-full min-w-0">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <Utensils className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Weekly Meal Schedule
            </h1>
            <p className="text-xs text-muted-foreground">
              Set daily dishes, pricing, student ordering quotas, and selection cutoff times.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsTimingModalOpen(true)}
            className="gap-1.5 h-9 text-xs font-semibold rounded-xl border-border hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer shadow-xs"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Configure Slots ({mealNames.length})</span>
          </Button>
        </div>
      </div>

      {/* ── Global Parameters Card ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Switcher */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">Ordering Status</span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {status === 'active' ? 'Active (Open)' : 'Inactive (View Only)'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mt-1">
              <Button
                type="button"
                variant={status === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setStatus('active')
                  setIsDirty(true)
                }}
                className={`flex-1 h-8 text-xs rounded-lg cursor-pointer ${
                  status === 'active' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
                }`}
              >
                Allow Pre-orders
              </Button>
              <Button
                type="button"
                variant={status === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setStatus('inactive')
                  setIsDirty(true)
                }}
                className={`flex-1 h-8 text-xs rounded-lg cursor-pointer ${
                  status === 'inactive' ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''
                }`}
              >
                Menu Only
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {status === 'active'
                ? 'Residents can select & pre-order meals for the week.'
                : 'Ordering locked. Residents can only view the menu.'}
            </p>
          </div>
        </div>

        {/* Max Meal Selection Quota */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">
              Max Portions per Student
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-muted text-foreground">
              Limit: {maxMealSelection}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-3 mt-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  if (maxMealSelection > 1) {
                    setMaxMealSelection((prev) => prev - 1)
                    setIsDirty(true)
                  }
                }}
                disabled={maxMealSelection <= 1}
                className="h-8 w-8 rounded-lg cursor-pointer font-bold text-sm"
              >
                -
              </Button>
              <span className="text-2xl font-bold font-mono text-foreground text-center min-w-[40px]">
                {maxMealSelection}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  if (maxMealSelection < 10) {
                    setMaxMealSelection((prev) => prev + 1)
                    setIsDirty(true)
                  }
                }}
                disabled={maxMealSelection >= 10}
                className="h-8 w-8 rounded-lg cursor-pointer font-bold text-sm"
              >
                +
              </Button>
              <span className="text-xs text-muted-foreground">food box / portions</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Maximum food boxes or plates a student can pre-order for a single meal.
            </p>
          </div>
        </div>

        {/* Active Slots Overview */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">Configured Slots</span>
            <button
              type="button"
              onClick={() => setIsTimingModalOpen(true)}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <Settings2 className="h-3 w-3" />
              <span>Edit</span>
            </button>
          </div>
          <div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {mealNames.map((name, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60 border border-border/60 text-foreground"
                >
                  <Utensils className="h-3 w-3 text-emerald-500" />
                  <span className="font-semibold">{name}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    Serving: {formatTimeRange(servingTiming[i])}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    &bull; Cutoff: {selectionTiming[i]?.end || selectionTiming[i]?.start || '—'}
                  </span>
                </span>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              {mealNames.length} meal slots active with configured selection windows and dining serving time ranges.
            </p>
          </div>
        </div>
      </div>

      {/* ── Menu Editor: 7-Day Matrix ── */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-xs">
        {/* Header Tabs */}
        <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
          <div>
            <h2 className="text-base font-bold text-foreground">Weekly Menu Matrix</h2>
            <p className="text-xs text-muted-foreground">
              Define the meal dishes and optional price per plate for each day
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 rounded-xl bg-muted border border-border/80">
              <button
                type="button"
                onClick={() => setViewMode('tabs')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  viewMode === 'tabs'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Day Tabs
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Full Week Matrix
              </button>
            </div>
          </div>
        </div>

        {/* ── View 1: Day Tabs ── */}
        {viewMode === 'tabs' && (
          <div className="p-5 space-y-5">
            {/* Days Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border/60">
              {DAYS_OF_WEEK.map((day) => {
                const dayItems = menu[day] || []
                const filledCount = dayItems.filter((it) => it.meal && it.meal.trim() !== '' && it.meal !== 'none').length
                const isActive = activeDay === day

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setActiveDay(day)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-2 border ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shadow-xs'
                        : 'bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/80 hover:text-foreground'
                    }`}
                  >
                    <span>{day}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                        filledCount === mealNames.length
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {filledCount}/{mealNames.length}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Active Day Action Toolbar */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{activeDay}'s Menu</span>
                <span className="text-xs text-muted-foreground">• Configure dishes & prices</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyDayToAll(activeDay)}
                  className="h-8 text-xs gap-1.5 rounded-lg border-border hover:bg-blue-500/10 hover:text-blue-600 cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy to All Days</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearDay(activeDay)}
                  className="h-8 text-xs gap-1 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear</span>
                </Button>
              </div>
            </div>

            {/* Active Day Meal Slots */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mealNames.map((slotName, slotIndex) => {
                const currentItem = menu[activeDay]?.[slotIndex] || { meal: '', price: 0 }
                const servingWindow = formatTimeRange(servingTiming[slotIndex])
                const selectionWindow = formatTimeRange(selectionTiming[slotIndex])

                return (
                  <div
                    key={slotIndex}
                    className="p-4 rounded-2xl bg-muted/20 border border-border/80 space-y-3 hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between pb-2 border-b border-border/60">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <Utensils className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-bold text-foreground">{slotName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Serving: {servingWindow}</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          Order: {selectionWindow}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Food / Dish Name
                        </label>
                        <Input
                          value={currentItem.meal === 'none' ? '' : currentItem.meal}
                          onChange={(e) =>
                            handleItemChange(activeDay, slotIndex, 'meal', e.target.value)
                          }
                          placeholder="e.g. Chicken Biryani, Raita"
                          className="h-9 text-xs rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Price per Plate (Rs.)
                        </label>
                        <Input
                          type="number"
                          min={0}
                          value={currentItem.price || ''}
                          onChange={(e) =>
                            handleItemChange(activeDay, slotIndex, 'price', e.target.value)
                          }
                          placeholder="0 for included / free"
                          className="h-9 text-xs rounded-lg font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── View 2: Full Week Matrix ── */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto p-4 sm:p-5">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-3 font-semibold text-muted-foreground w-28 uppercase text-[11px]">
                    Day
                  </th>
                  {mealNames.map((name, i) => (
                    <th key={i} className="p-3 font-semibold text-foreground">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Utensils className="h-3.5 w-3.5 text-emerald-500" />
                          <span>{name}</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
                          Served: {formatTimeRange(servingTiming[i])}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-normal block">
                          Order: {formatTimeRange(selectionTiming[i])}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="p-3 font-semibold text-right text-muted-foreground w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {DAYS_OF_WEEK.map((day) => (
                  <tr key={day} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-bold text-foreground">{day}</td>
                    {mealNames.map((_, slotIdx) => {
                      const item = menu[day]?.[slotIdx] || { meal: '', price: 0 }
                      return (
                        <td key={slotIdx} className="p-2 min-w-[200px]">
                          <div className="space-y-1">
                            <Input
                              value={item.meal === 'none' ? '' : item.meal}
                              onChange={(e) =>
                                handleItemChange(day, slotIdx, 'meal', e.target.value)
                              }
                              placeholder="Dish name"
                              className="h-8 text-xs rounded-md"
                            />
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-muted-foreground font-semibold">
                                Rs.
                              </span>
                              <Input
                                type="number"
                                min={0}
                                value={item.price || ''}
                                onChange={(e) =>
                                  handleItemChange(day, slotIdx, 'price', e.target.value)
                                }
                                placeholder="0"
                                className="h-7 text-[11px] rounded-md font-mono w-20"
                              />
                            </div>
                          </div>
                        </td>
                      )
                    })}
                    <td className="p-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleClearDay(day)}
                        className="h-7 w-7 text-muted-foreground hover:text-rose-500 cursor-pointer"
                        title="Clear day"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Timing modal */}
      <MealTimingModal
        isOpen={isTimingModalOpen}
        onClose={() => setIsTimingModalOpen(false)}
        mealNames={mealNames}
        selectionTiming={selectionTiming}
        servingTiming={servingTiming}
        onSave={handleSaveMealTypes}
      />

      {/* ── Sticky Bottom Save Bar (Appears when unsaved changes) ── */}
      {isDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-emerald-500/40 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-foreground">You have unsaved schedule changes</span>
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
              onClick={handleSaveSchedule}
              disabled={updateScheduleMutation.isPending}
              className="h-8 px-4 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm"
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              <span>{updateScheduleMutation.isPending ? 'Saving...' : 'Save Schedule'}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
