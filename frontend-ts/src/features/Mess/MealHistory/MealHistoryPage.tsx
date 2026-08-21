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
import MealCalendarView from './components/MealCalendarView'
import MealTimelineListView from './components/MealTimelineListView'
import BillEstimatorCard from './components/BillEstimatorCard'

function formatYearMonth(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
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
    <div className="space-y-5 pb-16 animate-in fade-in duration-300">
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

      {/* 2. Main View (Calendar Grid or Daily Timeline) */}
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

      {/* 3. Interactive Bill Estimator at the end of the section */}
      <BillEstimatorCard records={records} monthLabel={monthLabel} />
    </div>
  )
}
