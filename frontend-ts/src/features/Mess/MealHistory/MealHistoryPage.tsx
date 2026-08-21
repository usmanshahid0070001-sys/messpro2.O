import React, { useState, useMemo } from 'react'
import {
  useGetStudentMonthlyRecords,
  type StudentMonthlyMealRecord,
} from '@/hooks/queries/useMealQueries'
import { Skeleton } from '@/components/ui/skeleton'

// Modular Components
import MealHistoryHeader, {
  type MealHistoryViewMode,
} from './components/MealHistoryHeader'
import MealHistoryMetrics from './components/MealHistoryMetrics'
import MealCalendarView from './components/MealCalendarView'
import MealTimelineListView from './components/MealTimelineListView'
import BillEstimatorCard from './components/BillEstimatorCard'

function formatYearMonth(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export default function MealHistoryPage() {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date())
  const [viewMode, setViewMode] = useState<MealHistoryViewMode>('calendar')

  const monthString = useMemo(() => formatYearMonth(currentDate), [currentDate])

  const { data: records = [], isLoading } = useGetStudentMonthlyRecords(monthString)

  // Month Navigation
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleResetCurrentMonth = () => {
    setCurrentDate(new Date())
  }

  const isCurrentMonth = useMemo(() => {
    const today = new Date()
    return (
      today.getFullYear() === currentDate.getFullYear() &&
      today.getMonth() === currentDate.getMonth()
    )
  }, [currentDate])

  // Analytics Metrics Derivations
  const {
    totalConsumedPortions,
    totalMealCost,
    activeDaysCount,
    totalDaysInMonth,
    totalPreSelectedCount,
    totalPreSelectedEatenCount,
  } = useMemo(() => {
    let consumedPortions = 0
    let mealCost = 0
    const activeDates = new Set<string>()
    let preSelectedCount = 0
    let preSelectedEatenCount = 0

    records.forEach((r) => {
      const isEaten = Boolean(r.attendance?.hasEaten)
      const eatenPortions = r.attendance?.count || 0
      const isSelected = Boolean(r.selection?.hasSelected)
      const selectedPortions = r.selection?.count || 0
      const price = r.mealInfo?.price || 0

      if (isEaten) {
        consumedPortions += eatenPortions
        mealCost += price * eatenPortions
        activeDates.add(r.date)
      }

      if (isSelected) {
        preSelectedCount += selectedPortions
        if (isEaten) {
          preSelectedEatenCount += Math.min(selectedPortions, eatenPortions)
        }
      }
    })

    const daysCount = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())

    return {
      totalConsumedPortions: consumedPortions,
      totalMealCost: mealCost,
      activeDaysCount: activeDates.size,
      totalDaysInMonth: daysCount,
      totalPreSelectedCount: preSelectedCount,
      totalPreSelectedEatenCount: preSelectedEatenCount,
    }
  }, [records, currentDate])

  const monthLabel = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }, [currentDate])

  const handleScrollToEstimator = () => {
    const el = document.getElementById('bill-estimator')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* 1. Header with Month Navigator & View Mode Toggle */}
      <MealHistoryHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onResetCurrentMonth={handleResetCurrentMonth}
        isCurrentMonth={isCurrentMonth}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalRecordsCount={records.length}
        onScrollToEstimator={handleScrollToEstimator}
      />

      {/* 2. KPI Metrics */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : (
        <MealHistoryMetrics
          totalConsumedPortions={totalConsumedPortions}
          totalMealCost={totalMealCost}
          activeDaysCount={activeDaysCount}
          totalDaysInMonth={totalDaysInMonth}
          totalPreSelectedCount={totalPreSelectedCount}
          totalPreSelectedEatenCount={totalPreSelectedEatenCount}
        />
      )}

      {/* 3. Main View (Calendar Grid or Daily Timeline) */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      ) : viewMode === 'calendar' ? (
        <MealCalendarView currentDate={currentDate} records={records} />
      ) : (
        <MealTimelineListView records={records} />
      )}

      {/* 4. Interactive Bill Estimator at the end of the section */}
      <BillEstimatorCard records={records} monthLabel={monthLabel} />
    </div>
  )
}
