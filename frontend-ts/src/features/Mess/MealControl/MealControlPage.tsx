import React, { useState, useMemo, useCallback } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import {
  useGetMealViolations,
  useGetManagerLiveOverview,
} from '@/hooks/queries/useMealQueries'
import { Skeleton } from '@/components/ui/skeleton'

// Sub-components
import MealControlHeader from './components/MealControlHeader'
import MealControlMetrics from './components/MealControlMetrics'
import MealViolationsTable from './components/MealViolationsTable'
import MealLiveHeadcountGrid from './components/MealLiveHeadcountGrid'
import PrintableViolationsSheet from './components/PrintableViolationsSheet'

function getTodayString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getYesterdayString(): string {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function MealControlPage() {
  const { currentHostel } = useSelector((state: RootState) => state.hostel)

  // ── Date & Filter State ────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString())
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'violations' | 'headcount'>('violations')
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false)

  // ── Queries ────────────────────────────────────────────────────────────
  const {
    data: violations = [],
    isLoading: isViolationsLoading,
    isRefetching: isViolationsRefetching,
    refetch: refetchViolations,
  } = useGetMealViolations(selectedDate)

  const {
    data: liveOverview = { date: selectedDate, mealTypes: [], data: {} },
    isLoading: isOverviewLoading,
    isRefetching: isOverviewRefetching,
    refetch: refetchOverview,
  } = useGetManagerLiveOverview(selectedDate)

  const isRefetching = isViolationsRefetching || isOverviewRefetching

  const handleRefresh = useCallback(() => {
    refetchViolations()
    refetchOverview()
  }, [refetchViolations, refetchOverview])

  const handleApplyPreset = (preset: 'today' | 'yesterday') => {
    if (preset === 'today') setSelectedDate(getTodayString())
    else if (preset === 'yesterday') setSelectedDate(getYesterdayString())
  }

  // ── Derived Metrics ────────────────────────────────────────────────────
  const totalExtraMeals = useMemo(() => {
    return violations.reduce((acc, v) => acc + (v.extraMeals || 0), 0)
  }, [violations])

  const totalMissedMeals = useMemo(() => {
    return violations.reduce((acc, v) => acc + (v.missedMeals || 0), 0)
  }, [violations])

  const { totalPlannedSelections, totalActualAttendance } = useMemo(() => {
    let planned = 0
    let attended = 0
    const mealData = liveOverview?.data || {}
    Object.values(mealData).forEach((slot) => {
      planned += slot.summary?.totalSelections || 0
      attended += slot.summary?.totalAttendance || 0
    })
    return { totalPlannedSelections: planned, totalActualAttendance: attended }
  }, [liveOverview])

  return (
    <div className="space-y-6 pb-24">
      {/* ── 1. Top Header with Controls ── */}
      <MealControlHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onApplyPreset={handleApplyPreset}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        violationsCount={violations.length}
        isRefetching={isRefetching}
        onRefresh={handleRefresh}
        onPrint={() => setIsPrintModalOpen(true)}
      />

      {/* ── 2. Top KPI Cards ── */}
      {isViolationsLoading || isOverviewLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : (
        <MealControlMetrics
          totalViolations={violations.length}
          totalExtraMeals={totalExtraMeals}
          totalMissedMeals={totalMissedMeals}
          totalPlannedSelections={totalPlannedSelections}
          totalActualAttendance={totalActualAttendance}
        />
      )}

      {/* ── 3. Main Body View (Tab Switcher) ── */}
      {isViolationsLoading && activeTab === 'violations' ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : isOverviewLoading && activeTab === 'headcount' ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : activeTab === 'violations' ? (
        <MealViolationsTable
          records={violations}
          searchQuery={searchQuery}
          selectedDate={selectedDate}
        />
      ) : (
        <MealLiveHeadcountGrid
          overviewData={liveOverview}
          searchQuery={searchQuery}
          selectedDate={selectedDate}
        />
      )}

      {/* ── 4. Printable Sheet Modal ── */}
      <PrintableViolationsSheet
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        records={violations}
        selectedDate={selectedDate}
        hostelName={currentHostel?.name || 'Hostel Dining Hall'}
        totalExtraMeals={totalExtraMeals}
        totalMissedMeals={totalMissedMeals}
      />
    </div>
  )
}
