import React, { useState, useMemo } from 'react'
import {
  CheckCircle2,
  Calendar,
  CalendarDays,
  Filter,
  ChevronDown,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CleaningLogProps {
  cleaningDates?: string[]
  maxHeightClass?: string
  initialSelectedMonth?: string
}

interface MonthOption {
  key: string // e.g. "2026-07"
  year: number
  monthIndex: number
  label: string // e.g. "July 2026"
  shortLabel: string // e.g. "Jul 2026"
  count: number
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function CleaningLog({
  cleaningDates = [],
  maxHeightClass = 'max-h-64',
  initialSelectedMonth = 'all',
}: CleaningLogProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(initialSelectedMonth)

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  // Extract all distinct months present in the cleaningDates
  const availableMonths = useMemo<MonthOption[]>(() => {
    if (!cleaningDates || cleaningDates.length === 0) return []

    const map = new Map<string, MonthOption>()

    cleaningDates.forEach((dateStr) => {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return

      const year = d.getFullYear()
      const monthIndex = d.getMonth()
      const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`

      if (map.has(key)) {
        map.get(key)!.count += 1
      } else {
        const label = `${MONTH_NAMES[monthIndex]} ${year}`
        const shortLabel = `${MONTH_NAMES[monthIndex].slice(0, 3)} ${year}`
        map.set(key, {
          key,
          year,
          monthIndex,
          label,
          shortLabel,
          count: 1,
        })
      }
    })

    // Sort descending chronologically (latest month first)
    return Array.from(map.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.monthIndex - a.monthIndex
    })
  }, [cleaningDates])

  // Filtered and reversed list of dates
  const filteredDates = useMemo(() => {
    if (!cleaningDates || cleaningDates.length === 0) return []
    const list = [...cleaningDates].reverse()

    if (selectedMonth === 'all') return list

    return list.filter((dateStr) => {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return false
      const year = d.getFullYear()
      const monthIndex = d.getMonth()
      const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
      return key === selectedMonth
    })
  }, [cleaningDates, selectedMonth])

  // Get active month label
  const activeMonthLabel = useMemo(() => {
    if (selectedMonth === 'all') return 'All Logs'
    const found = availableMonths.find((m) => m.key === selectedMonth)
    if (found) return found.label

    // Fallback if key is in "YYYY-MM" format
    const [y, m] = selectedMonth.split('-')
    if (y && m) {
      const idx = parseInt(m, 10) - 1
      return `${MONTH_NAMES[idx] || m} ${y}`
    }
    return selectedMonth
  }, [selectedMonth, availableMonths])

  if (!cleaningDates || cleaningDates.length === 0) {
    return (
      <div className="text-center py-6 px-4 bg-muted/20 border border-border/60 rounded-xl space-y-2">
        <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
          <Calendar className="w-4 h-4" />
        </div>
        <p className="text-xs text-muted-foreground">No sanitation logs recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* ── Month Filter Bar ──────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Filter className="w-3.5 h-3.5 text-teal-500" />
            <span>Filter by Month:</span>
          </div>

          {/* Month Select Dropdown for direct choice */}
          <div className="relative">
            <select
              aria-label="Select month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-8 pl-2.5 pr-7 text-xs font-medium bg-muted/40 hover:bg-muted/70 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-teal-500 transition-colors cursor-pointer appearance-none"
            >
              <option value="all">All Logs ({cleaningDates.length})</option>
              {availableMonths.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label} ({m.count})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Quick Month Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedMonth('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedMonth === 'all'
                ? 'bg-teal-600 text-white font-semibold shadow-xs'
                : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70 border border-border/50'
            }`}
          >
            All Logs ({cleaningDates.length})
          </button>

          {availableMonths.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setSelectedMonth(m.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedMonth === m.key
                  ? 'bg-teal-600 text-white font-semibold shadow-xs'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70 border border-border/50'
              }`}
            >
              {m.shortLabel} ({m.count})
            </button>
          ))}
        </div>
      </div>

      {/* ── Active Filter Summary / Banner ───────────────────────── */}
      {selectedMonth !== 'all' && (
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-xs">
          <div className="flex items-center gap-1.5 font-medium truncate">
            <CalendarDays className="w-3.5 h-3.5 shrink-0 text-teal-600 dark:text-teal-400" />
            <span className="truncate">
              Showing logs for <strong>{activeMonthLabel}</strong> ({filteredDates.length})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedMonth('all')}
            className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300 hover:underline shrink-0 ml-2 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Show All
          </button>
        </div>
      )}

      {/* ── Logs List ────────────────────────────────────────────── */}
      <div className={`space-y-1.5 overflow-y-auto pr-1 ${maxHeightClass}`}>
        {filteredDates.length === 0 ? (
          <div className="text-center py-6 px-3 bg-muted/20 border border-dashed border-border rounded-xl space-y-2">
            <p className="text-xs text-muted-foreground">
              No cleaning logs found for <strong>{activeMonthLabel}</strong>.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMonth('all')}
              className="h-7 text-xs font-medium border-border"
            >
              View All Logs
            </Button>
          </div>
        ) : (
          filteredDates.map((dateStr, idx) => {
            const d = new Date(dateStr)
            const isToday =
              d.getDate() === today.getDate() &&
              d.getMonth() === today.getMonth() &&
              d.getFullYear() === today.getFullYear()

            const formatted = d.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })

            // Format time if available and not midnight
            const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0
            const formattedTime = hasTime
              ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : null

            return (
              <div
                key={idx}
                className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-card border border-border hover:border-teal-500/30 transition-colors shadow-2xs group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-foreground block truncate">
                      {formatted}
                    </span>
                    {formattedTime && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {formattedTime}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isToday && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Today
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
