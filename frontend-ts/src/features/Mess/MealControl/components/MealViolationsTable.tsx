import React, { useState, useMemo } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  Flame,
  UserX,
  Utensils,
  User,
} from 'lucide-react'
import type { MealViolationRecord } from '@/hooks/queries/useMealQueries'

interface MealViolationsTableProps {
  records: MealViolationRecord[]
  searchQuery: string
  selectedDate: string
}

export default function MealViolationsTable({
  records,
  searchQuery,
  selectedDate,
}: MealViolationsTableProps) {
  const [selectedMealType, setSelectedMealType] = useState<string>('all')
  const [selectedViolationType, setSelectedViolationType] = useState<'all' | 'extra' | 'missed'>('all')

  // Extract unique meal types
  const availableMealTypes = useMemo(() => {
    const set = new Set<string>()
    records.forEach((r) => {
      if (r.mealType) set.add(r.mealType)
    })
    return Array.from(set)
  }, [records])

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // 1. Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchRoll = (rec.rollNumber || '').toLowerCase().includes(query)
        const matchName = (rec.studentName || '').toLowerCase().includes(query)
        if (!matchRoll && !matchName) return false
      }

      // 2. Meal Type filter
      if (selectedMealType !== 'all' && rec.mealType !== selectedMealType) {
        return false
      }

      // 3. Violation Type filter
      if (selectedViolationType === 'extra' && rec.extraMeals <= 0) {
        return false
      }
      if (selectedViolationType === 'missed' && rec.missedMeals <= 0) {
        return false
      }

      return true
    })
  }, [records, searchQuery, selectedMealType, selectedViolationType])

  return (
    <div className="rounded-2xl bg-card border border-border/70 shadow-xs overflow-hidden">
      {/* ── Sub-header: Table Filters & Summary ── */}
      <div className="p-4 border-b border-border/60 flex flex-wrap items-center justify-between gap-3 bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Violation Log & Audit Sheet
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Showing {filteredRecords.length} of {records.length} flagged records for {selectedDate}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Meal Type Filter */}
          {availableMealTypes.length > 0 && (
            <select
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value)}
              aria-label="Filter by meal type"
              className="h-8 px-2.5 rounded-xl border border-border/80 bg-background text-xs font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">All Meals</option>
              {availableMealTypes.map((mt) => (
                <option key={mt} value={mt}>
                  {mt}
                </option>
              ))}
            </select>
          )}

          {/* Category Filter */}
          <div className="flex items-center p-0.5 rounded-xl bg-muted/60 border border-border/60">
            <button
              type="button"
              onClick={() => setSelectedViolationType('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedViolationType === 'all'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSelectedViolationType('extra')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedViolationType === 'extra'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Extra Eaten
            </button>
            <button
              type="button"
              onClick={() => setSelectedViolationType('missed')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedViolationType === 'missed'
                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Missed / Wasted
            </button>
          </div>
        </div>
      </div>

      {/* ── Table Content ── */}
      {filteredRecords.length === 0 ? (
        <div className="py-14 px-4 text-center flex flex-col items-center justify-center gap-3">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground">
              {records.length === 0
                ? 'Clean Record — No Violations Detected'
                : 'No Violations Match Your Filters'}
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              {records.length === 0
                ? `All students for ${selectedDate} either dined as reserved or had zero unselected consumption.`
                : 'Try adjusting your search keywords or category filters above.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-medium uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student / Resident</th>
                  <th className="py-3 px-4 font-semibold">Meal Session</th>
                  <th className="py-3 px-4 font-semibold text-center">Selected</th>
                  <th className="py-3 px-4 font-semibold text-center">Attended</th>
                  <th className="py-3 px-4 font-semibold">Violation Type</th>
                  <th className="py-3 px-4 font-semibold text-right">Discrepancy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredRecords.map((rec) => {
                  const isExtra = rec.extraMeals > 0
                  return (
                    <tr
                      key={rec._id || `${rec.rollNumber}_${rec.mealType}`}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Student Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                            {rec.studentName ? rec.studentName.charAt(0).toUpperCase() : <User className="h-3.5 w-3.5" />}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-xs">
                              {rec.studentName || 'Student'}
                            </div>
                            <div className="font-mono text-[11px] text-muted-foreground">
                              {rec.rollNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Meal Type */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-muted border border-border/60 text-foreground">
                          {rec.mealType}
                        </span>
                      </td>

                      {/* Selection Count */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md font-mono text-xs font-semibold ${
                            rec.selectionCount > 0
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {rec.selectionCount}
                        </span>
                      </td>

                      {/* Attendance Count */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md font-mono text-xs font-semibold ${
                            rec.attendanceCount > 0
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {rec.attendanceCount}
                        </span>
                      </td>

                      {/* Violation Type */}
                      <td className="py-3 px-4">
                        {isExtra ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                            <Flame className="h-3.5 w-3.5 shrink-0" />
                            <span>Extra / Unselected Eaten</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                            <UserX className="h-3.5 w-3.5 shrink-0" />
                            <span>Missed / Wasted Meal</span>
                          </div>
                        )}
                      </td>

                      {/* Discrepancy Badge */}
                      <td className="py-3 px-4 text-right">
                        {isExtra ? (
                          <span className="inline-flex items-center font-bold font-mono text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                            +{rec.extraMeals} meal
                          </span>
                        ) : (
                          <span className="inline-flex items-center font-bold font-mono text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
                            -{rec.missedMeals} skipped
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-border/60">
            {filteredRecords.map((rec) => {
              const isExtra = rec.extraMeals > 0
              return (
                <div key={rec._id || `${rec.rollNumber}_${rec.mealType}`} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                        {rec.studentName ? rec.studentName.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-xs">
                          {rec.studentName || 'Student'}
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {rec.rollNumber}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground border border-border/60">
                      {rec.mealType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="p-2 rounded-xl bg-muted/40 border border-border/50">
                      <span className="text-[10px] text-muted-foreground block">Booked Selections</span>
                      <span className="font-mono font-bold text-foreground">{rec.selectionCount}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-muted/40 border border-border/50">
                      <span className="text-[10px] text-muted-foreground block">Actual Attended</span>
                      <span className="font-mono font-bold text-foreground">{rec.attendanceCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {isExtra ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        <Flame className="h-3.5 w-3.5" /> Extra / Unselected Eaten
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        <UserX className="h-3.5 w-3.5" /> Missed / Wasted Meal
                      </span>
                    )}

                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                        isExtra
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      }`}
                    >
                      {isExtra ? `+${rec.extraMeals}` : `-${rec.missedMeals}`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
