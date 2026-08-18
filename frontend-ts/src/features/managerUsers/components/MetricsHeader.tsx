import { useMemo } from 'react'
import { Users, ShieldCheck, UserCheck, GraduationCap, Gauge } from 'lucide-react'
import type { ManageableUser } from '@/hooks/queries/useUserQueries'

interface MetricsHeaderProps {
  users: ManageableUser[]
  currentRole: string
  maxStudents?: number
}

export default function MetricsHeader({ users, currentRole, maxStudents }: MetricsHeaderProps) {
  const metrics = useMemo(() => {
    const stats = { total: users.length, admins: 0, managers: 0, students: 0 }
    users.forEach((u) => {
      if (u.role === 'admin') stats.admins++
      else if (u.role === 'manager') stats.managers++
      else if (u.role === 'student') stats.students++
    })
    return stats
  }, [users])

  const showAdminCard = currentRole === 'superadmin'
  const gridCols = showAdminCard
    ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'
    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'

  const capacityPct = maxStudents && maxStudents > 0
    ? Math.min(100, Math.round((metrics.students / maxStudents) * 100))
    : 0

  return (
    <div className={`grid ${gridCols} gap-3 sm:gap-4 w-full min-w-0`}>
      {/* Total Members */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-blue-500/40 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 truncate">
            <Users className="h-4 w-4 text-blue-500 shrink-0" />
            <span className="truncate">Total Members</span>
          </span>
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
            {metrics.total}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Active directory profiles
          </div>
        </div>
      </div>

      {/* Admins (Superadmin only) */}
      {showAdminCard && (
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-indigo-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 truncate">
              <ShieldCheck className="h-4 w-4 text-indigo-500 shrink-0" />
              <span className="truncate">Administrators</span>
            </span>
            <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold">
              Hostel Admin
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono text-indigo-600 dark:text-indigo-400">
              {metrics.admins}
            </div>
            <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
              Hostel system owners
            </div>
          </div>
        </div>
      )}

      {/* Managers */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-purple-500/40 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 truncate">
            <UserCheck className="h-4 w-4 text-purple-500 shrink-0" />
            <span className="truncate">Managers & Staff</span>
          </span>
          <div className="p-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-semibold">
            Permitted
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono text-purple-600 dark:text-purple-400">
            {metrics.managers}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Operational personnel
          </div>
        </div>
      </div>

      {/* Students */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-teal-500/40 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 truncate">
            <GraduationCap className="h-4 w-4 text-teal-500 shrink-0" />
            <span className="truncate">Student Residents</span>
          </span>
          <div className="p-1 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-semibold">
            Residents
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono text-teal-600 dark:text-teal-400">
            {metrics.students}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Enrolled hostel students
          </div>
        </div>
      </div>

      {/* Max Students / Capacity Limit */}
      {maxStudents !== undefined && (
        <div className={`p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 col-span-full ${showAdminCard ? 'xl:col-span-1' : 'lg:col-span-1'} hover:border-amber-500/40 transition-all group`}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 truncate">
              <Gauge className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="truncate">Plan Capacity</span>
            </span>
            <span className="text-[11px] font-mono font-semibold text-amber-600 dark:text-amber-400">
              {capacityPct}% Occupied
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono text-amber-600 dark:text-amber-400">
              {maxStudents}
            </div>
            <div className="text-[10px] sm:text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate flex items-center justify-between">
              <span>{Math.max(0, maxStudents - metrics.students)} seats available</span>
              <span className="font-mono text-[10px] text-muted-foreground">{metrics.students} / {maxStudents} enrolled</span>
            </div>
            {/* Visual capacity progress track */}
            <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  capacityPct >= 90
                    ? 'bg-rose-500'
                    : capacityPct >= 75
                    ? 'bg-amber-500'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${capacityPct}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
