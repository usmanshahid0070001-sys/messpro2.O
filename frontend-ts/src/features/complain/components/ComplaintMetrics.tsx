import { useMemo } from 'react'
import { AlertCircle, Clock, CheckCircle2, UserCheck, Flame, Layers } from 'lucide-react'
import type { Complaint } from '@/hooks/queries/useComplaintQueries'

interface ComplaintMetricsProps {
  complaints: Complaint[]
}

export default function ComplaintMetrics({ complaints }: ComplaintMetricsProps) {
  const metrics = useMemo(() => {
    const stats = {
      total: complaints.length,
      open: 0,
      assigned: 0,
      inProgress: 0,
      resolved: 0,
      urgent: 0,
    }

    complaints.forEach((c) => {
      if (c.status === 'Open') stats.open++
      else if (c.status === 'Assigned') stats.assigned++
      else if (c.status === 'In Progress') stats.inProgress++
      else if (c.status === 'Resolved') stats.resolved++

      if (c.intensity === 'Urgent') stats.urgent++
    })

    return stats
  }, [complaints])

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-3.5 w-full min-w-0">
      {/* 1. Total Complaints with Urgent indicator */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border hover:border-border/80 transition-colors flex flex-col justify-between gap-2 shadow-xs min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs sm:text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 truncate">
            <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 shrink-0" />
            <span className="truncate">Total Tickets</span>
          </span>
          {metrics.urgent > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shrink-0 animate-pulse">
              <Flame className="h-3 w-3" />
              {metrics.urgent}
            </span>
          )}
        </div>
        <div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground font-mono">
            {metrics.total}
          </div>
          <div className="text-[10px] sm:text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Active in filter
          </div>
        </div>
      </div>

      {/* 2. Open */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border hover:border-border/80 transition-colors flex flex-col justify-between gap-2 shadow-xs min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 truncate">
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 shrink-0" />
            <span className="truncate">Open</span>
          </span>
          <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground font-mono text-blue-600 dark:text-blue-400">
            {metrics.open}
          </div>
          <div className="text-[10px] sm:text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Pending triage
          </div>
        </div>
      </div>

      {/* 3. Assigned */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border hover:border-border/80 transition-colors flex flex-col justify-between gap-2 shadow-xs min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 truncate">
            <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500 shrink-0" />
            <span className="truncate">Assigned</span>
          </span>
          <div className="h-2 w-2 rounded-full bg-purple-500 shrink-0" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground font-mono text-purple-600 dark:text-purple-400">
            {metrics.assigned}
          </div>
          <div className="text-[10px] sm:text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Allocated to staff
          </div>
        </div>
      </div>

      {/* 4. In Progress */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border hover:border-border/80 transition-colors flex flex-col justify-between gap-2 shadow-xs min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 truncate">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 shrink-0" />
            <span className="truncate">In Progress</span>
          </span>
          <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground font-mono text-amber-600 dark:text-amber-400">
            {metrics.inProgress}
          </div>
          <div className="text-[10px] sm:text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Work ongoing
          </div>
        </div>
      </div>

      {/* 5. Resolved */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border hover:border-border/80 transition-colors flex flex-col justify-between gap-2 shadow-xs min-w-0 col-span-2 md:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 truncate">
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 shrink-0" />
            <span className="truncate">Resolved</span>
          </span>
          <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground font-mono text-emerald-600 dark:text-emerald-400">
            {metrics.resolved}
          </div>
          <div className="text-[10px] sm:text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Closed tickets
          </div>
        </div>
      </div>
    </div>
  )
}
