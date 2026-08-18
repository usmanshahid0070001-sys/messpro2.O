import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import type { RootState } from '@/store'
import { useGetMealSchedule } from '@/hooks/queries/useMealQueries'
import AdminMealManager from './components/AdminMealManager'
import { Skeleton } from '@/components/ui/skeleton'

export default function ManageMealSchedule() {
  const { user } = useSelector((state: RootState) => state.auth)
  const role = user?.role
  const perms = user?.permissions || []

  // Check if user is superadmin, admin, or has meal_settings permission
  const canManage =
    role === 'superadmin' ||
    role === 'admin' ||
    perms.includes('meal_settings')

  // If not permitted, redirect to student schedule view
  if (!canManage) {
    return <Navigate to="/app/meals/schedule" replace />
  }

  const { data: schedule, isLoading } = useGetMealSchedule()

  if (isLoading) {
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
      <AdminMealManager schedule={schedule || null} />
    </div>
  )
}
