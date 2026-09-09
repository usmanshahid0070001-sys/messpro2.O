import React, { useState } from 'react'
import {
  CheckCircle2,
  Clock,
  Flame,
  User,
  Users,
  Utensils,
  UserX,
} from 'lucide-react'
import type { ManagerLiveOverviewData } from '@/hooks/queries/useMealQueries'

interface MealLiveHeadcountGridProps {
  overviewData: ManagerLiveOverviewData
  searchQuery: string
  selectedDate: string
}

export default function MealLiveHeadcountGrid({
  overviewData,
  searchQuery,
  selectedDate,
}: MealLiveHeadcountGridProps) {
  const mealTypes = overviewData.mealTypes || []
  const dataByMeal = overviewData.data || {}

  const [activeMealTab, setActiveMealTab] = useState<string>(
    mealTypes[0] || 'Breakfast'
  )

  if (mealTypes.length === 0) {
    return (
      <div className="p-10 rounded-2xl bg-card border border-border/70 text-center flex flex-col items-center justify-center gap-3">
        <div className="p-3.5 rounded-2xl bg-muted text-muted-foreground border border-border/60">
          <Utensils className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground">No Meal Schedule Configured</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure meal slots (Breakfast, Lunch, Dinner) in weekly schedule settings first.
          </p>
        </div>
      </div>
    )
  }

  // Active meal slot data
  const currentSlot = dataByMeal[activeMealTab] || {
    summary: { totalSelections: 0, totalAttendance: 0 },
    data: [],
  }

  // Filter students by search
  const filteredStudents = (currentSlot.data || []).filter((s) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.rollNumber || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      {/* ── Meal Slot Summary Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mealTypes.map((mt) => {
          const slot = dataByMeal[mt] || {
            summary: { totalSelections: 0, totalAttendance: 0 },
            data: [],
          }
          const totalBooked = slot.summary.totalSelections || 0
          const totalAte = slot.summary.totalAttendance || 0
          const turnout =
            totalBooked > 0
              ? Math.min(100, Math.round((totalAte / totalBooked) * 100))
              : totalAte > 0
              ? 100
              : 0

          const isSelected = activeMealTab === mt

          return (
            <button
              key={mt}
              type="button"
              onClick={() => setActiveMealTab(mt)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-card border-emerald-500/50 shadow-xs ring-1 ring-emerald-500/30'
                  : 'bg-card/70 border-border/70 hover:border-border hover:bg-card'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-xl border ${
                      isSelected
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-muted text-muted-foreground border-border/60'
                    }`}
                  >
                    <Utensils className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{mt}</h4>
                </div>
                <span className="text-xs font-mono font-bold text-foreground">
                  {totalAte} / {totalBooked}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-3.5 space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${turnout}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Turnout Ratio</span>
                  <span className="font-semibold text-foreground">{turnout}%</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Active Meal Slot Resident List ── */}
      <div className="rounded-2xl bg-card border border-border/70 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-foreground">
              {activeMealTab} — Resident Dining Roster ({filteredStudents.length})
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            Date: <strong className="text-foreground">{selectedDate}</strong>
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No student activity recorded for {activeMealTab}.
          </div>
        ) : (
          <div className="divide-y divide-border/50 max-h-96 overflow-y-auto">
            {filteredStudents.map((s, idx) => {
              const isEaten = s.hasAttended || s.attendanceCount > 0
              const isSelected = s.isSelected || s.selectionCount > 0
              const isExtra = isEaten && !isSelected
              const isMissed = !isEaten && isSelected

              return (
                <div
                  key={`${s.rollNumber}_${idx}`}
                  className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                      {s.name ? s.name.charAt(0).toUpperCase() : <User className="h-3.5 w-3.5" />}
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-semibold text-foreground truncate block">
                        {s.name}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {s.rollNumber} {s.isGuest && '• (Guest)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status Pill */}
                    {isEaten && isSelected && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        Dined (Booked)
                      </span>
                    )}

                    {isExtra && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Flame className="h-3 w-3" />
                        Extra / Unbooked
                      </span>
                    )}

                    {isMissed && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <UserX className="h-3 w-3" />
                        Absent (Wasted)
                      </span>
                    )}

                    {!isEaten && !isSelected && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
                        Not Opted
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
