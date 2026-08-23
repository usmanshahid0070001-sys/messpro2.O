import React from 'react'
import { DollarSign, Utensils, Users, Sliders } from 'lucide-react'

interface BillGenMetricsProps {
  messRevenue: number
  totalAttendanceCount: number
  activeMethodsCount: number
  estimatedTotalRevenue: number
}

function BillGenMetrics({
  messRevenue,
  totalAttendanceCount,
  activeMethodsCount,
  estimatedTotalRevenue,
}: BillGenMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
      {/* 1. Estimated Total Bill (Finance & Dues / Purple) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-purple-500/40 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 truncate">
            <DollarSign className="h-4 w-4 text-purple-500 shrink-0" />
            <span className="truncate">Est. Total Invoiced</span>
          </span>
          <div className="p-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-semibold">
            All Charges
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono truncate">
            Rs. {Math.round(estimatedTotalRevenue).toLocaleString('en-PK')}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Estimated gross billing profile
          </div>
        </div>
      </div>

      {/* 2. Base Mess Consumption Revenue (Food & Meals / Emerald) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-emerald-500/40 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 truncate">
            <Utensils className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="truncate">Mess Bill Revenue</span>
          </span>
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
            Meals Only
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono truncate">
            Rs. {Math.round(messRevenue).toLocaleString('en-PK')}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Consumed meals base total
          </div>
        </div>
      </div>

      {/* 3. Verified Attendance Portions (People & Access / Blue) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-blue-500/40 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 truncate">
            <Users className="h-4 w-4 text-blue-500 shrink-0" />
            <span className="truncate">Portions Eaten</span>
          </span>
          <div className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-semibold">
            Attendance
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono truncate">
            {totalAttendanceCount.toLocaleString('en-PK')}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Logged dining entries
          </div>
        </div>
      </div>

      {/* 4. Active Bill Methods (Neutral Slate) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-slate-500/40 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 truncate">
            <Sliders className="h-4 w-4 text-slate-500 shrink-0" />
            <span className="truncate">Active Methods</span>
          </span>
          <div className="p-1 rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-400 text-[10px] font-semibold">
            Formula
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono truncate">
            {activeMethodsCount}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Configured dynamic billing charges
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(BillGenMetrics)
