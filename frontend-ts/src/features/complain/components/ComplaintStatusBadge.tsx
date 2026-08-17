import { AlertCircle, Clock, CheckCircle2, UserCheck, ShieldAlert, ArrowUpRight, Flame, Minus } from 'lucide-react'
import type { ComplaintIntensity, ComplaintStatus } from '@/hooks/queries/useComplaintQueries'

interface StatusBadgeProps {
  status: ComplaintStatus
  className?: string
  showIcon?: boolean
}

export function ComplaintStatusBadge({ status, className = '', showIcon = true }: StatusBadgeProps) {
  switch (status) {
    case 'Open':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 ${className}`}
        >
          {showIcon && <AlertCircle className="w-3.5 h-3.5" />}
          Open
        </span>
      )
    case 'Assigned':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 ${className}`}
        >
          {showIcon && <UserCheck className="w-3.5 h-3.5" />}
          Assigned
        </span>
      )
    case 'In Progress':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 ${className}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />}
          In Progress
        </span>
      )
    case 'Resolved':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5" />}
          Resolved
        </span>
      )
    default:
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground ${className}`}>
          {status}
        </span>
      )
  }
}

interface IntensityBadgeProps {
  intensity: ComplaintIntensity
  className?: string
  showIcon?: boolean
}

export function ComplaintIntensityBadge({ intensity, className = '', showIcon = true }: IntensityBadgeProps) {
  switch (intensity) {
    case 'Urgent':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse ${className}`}
        >
          {showIcon && <Flame className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
          Urgent
        </span>
      )
    case 'High':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 ${className}`}
        >
          {showIcon && <ShieldAlert className="w-3.5 h-3.5" />}
          High
        </span>
      )
    case 'Medium':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 ${className}`}
        >
          {showIcon && <ArrowUpRight className="w-3.5 h-3.5" />}
          Medium
        </span>
      )
    case 'Low':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 ${className}`}
        >
          {showIcon && <Minus className="w-3.5 h-3.5" />}
          Low
        </span>
      )
    default:
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground ${className}`}>
          {intensity}
        </span>
      )
  }
}
