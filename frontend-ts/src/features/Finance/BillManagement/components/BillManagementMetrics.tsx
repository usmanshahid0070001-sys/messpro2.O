import React from 'react'
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react'

interface BillManagementMetricsProps {
  totalRevenue: number
  totalPaid: number
  totalRemaining: number
  totalBillsCount: number
  paidBillsCount: number
  unpaidBillsCount: number
}

function BillManagementMetrics({
  totalRevenue,
  totalPaid,
  totalRemaining,
  totalBillsCount,
  paidBillsCount,
  unpaidBillsCount,
}: BillManagementMetricsProps) {
  const collectionRate = totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
      {/* 1. Total Invoiced Revenue (Finance & Dues / Purple) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-purple-500/40 transition-all group">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 whitespace-nowrap min-w-0">
            <Wallet className="h-4 w-4 text-purple-500 shrink-0" />
            <span className="truncate">Total Invoiced</span>
          </span>
          <div className="p-1 px-2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-semibold shrink-0">
            All Dues
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono truncate">
            Rs. {Math.round(totalRevenue).toLocaleString('en-PK')}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Total expected billing revenue
          </div>
        </div>
      </div>

      {/* 2. Total Collected Payments (Emerald) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-emerald-500/40 transition-all group">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 whitespace-nowrap min-w-0">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="truncate">Total Collected</span>
          </span>
          <div className="p-1 px-2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold shrink-0">
            {collectionRate}% Paid
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono truncate">
            Rs. {Math.round(totalPaid).toLocaleString('en-PK')}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            {paidBillsCount} {paidBillsCount === 1 ? 'bill' : 'bills'} fully settled
          </div>
        </div>
      </div>

      {/* 3. Outstanding Arrears / Balance (Amber) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-amber-500/40 transition-all group">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 whitespace-nowrap min-w-0">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="truncate">Outstanding Dues</span>
          </span>
          <div className="p-1 px-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold shrink-0">
            {unpaidBillsCount} Pending
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400 font-mono truncate">
            Rs. {Math.round(totalRemaining).toLocaleString('en-PK')}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Remaining uncollected balance
          </div>
        </div>
      </div>

      {/* 4. Total Billed Accounts (People & Access / Blue) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-blue-500/40 transition-all group">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 whitespace-nowrap min-w-0">
            <Users className="h-4 w-4 text-blue-500 shrink-0" />
            <span className="truncate">Billed Accounts</span>
          </span>
          <div className="p-1 px-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-semibold shrink-0">
            Ledger
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono truncate">
            {totalBillsCount}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Residents & dining guests
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(BillManagementMetrics)
