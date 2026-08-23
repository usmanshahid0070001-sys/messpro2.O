import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { useGetMealSchedule, useGetStudentSelections } from '@/hooks/queries/useMealQueries'
import StudentMealSelector from './components/StudentMealSelector'
import { Skeleton } from '@/components/ui/skeleton'

// Helper to format ISO YYYY-MM-DD
function getIsoDate(offsetDays: number = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function WeeklySchedule() {
  const { user } = useSelector((state: RootState) => state.auth)

  // 1. Fetch Meal Schedule
  const { data: schedule, isLoading: isScheduleLoading } = useGetMealSchedule()

  // 2. Compute date range (Today -> Today + 6 days) for student selections
  const startDate = useMemo(() => getIsoDate(0), [])
  const endDate = useMemo(() => getIsoDate(6), [])

  // 3. Fetch Student selections
  const { data: selections, isLoading: isSelectionsLoading } = useGetStudentSelections(
    startDate,
    endDate
  )

  if (isScheduleLoading) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="w-full pb-8">
      <StudentMealSelector
        schedule={schedule || null}
        selections={selections}
        isSelectionsLoading={isSelectionsLoading}
      />
    </div>
  )
}
