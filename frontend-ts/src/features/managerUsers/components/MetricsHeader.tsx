import { useMemo } from 'react'
import { Users, Shield, UserCheck, Building, Scale } from 'lucide-react'
import type { ManageableUser } from '@/hooks/queries/useUserQueries'

interface MetricsHeaderProps {
  users: ManageableUser[]
  currentRole: string
  maxStudents?: number
}

export default function MetricsHeader({ users, currentRole, maxStudents }: MetricsHeaderProps) {
  const metrics = useMemo(() => {
    const stats = { total: users.length, admins: 0, managers: 0, students: 0 }
    users.forEach(u => {
      if (u.role === 'admin') stats.admins++
      else if (u.role === 'manager') stats.managers++
      else if (u.role === 'student') stats.students++
    })
    return stats
  }, [users])

  const showAdminCard = currentRole === 'superadmin'
  const gridCols = showAdminCard ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'

  return (
    <div className={`grid ${gridCols} gap-4`}>
      <div className="p-5 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between gap-2">
        <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-blue-500" />
          Total Members
        </span>
        <div className="text-3xl font-bold tracking-tight text-foreground font-mono">{metrics.total}</div>
      </div>

      {showAdminCard && (
        <div className="p-5 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between gap-2">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-slate-500" />
            Admins
          </span>
          <div className="text-3xl font-bold tracking-tight text-foreground font-mono">{metrics.admins}</div>
        </div>
      )}

      <div className="p-5 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between gap-2">
        <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
          <UserCheck className="h-3.5 w-3.5 text-purple-500" />
          Managers
        </span>
        <div className="text-3xl font-bold tracking-tight text-foreground font-mono">{metrics.managers}</div>
      </div>

      <div className="p-5 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between gap-2">
        <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
          <Building className="h-3.5 w-3.5 text-teal-500" />
          Students
        </span>
        <div className="text-3xl font-bold tracking-tight text-foreground font-mono">{metrics.students}</div>
      </div>

      {maxStudents !== undefined && (
        <div className="p-5 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between gap-2">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
            <Scale className="h-3.5 w-3.5 text-amber-500" />
            Max Students
          </span>
          <div className="text-3xl font-bold tracking-tight text-foreground font-mono">
            {maxStudents}
          </div>
        </div>
      )}
    </div>
  )
}
