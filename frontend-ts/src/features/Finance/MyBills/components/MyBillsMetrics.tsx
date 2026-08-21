import React from 'react'
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
} from 'lucide-react'

interface MyBillsMetricsProps {
  totalInvoiced: number
  totalPaid: number
  totalRemaining: number
  totalInvoicesCount: number
  paidInvoicesCount: number
  unpaidInvoicesCount: number
}

function MyBillsMetrics({
  totalInvoiced,
  totalPaid,
  totalRemaining,
  totalInvoicesCount,
  paidInvoicesCount,
  unpaidInvoicesCount,
}: MyBillsMetricsProps) {
  const settlementRate =
    totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
      {/* 1. Total Invoiced (Purple) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-purple-500/40 transition-all group">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 whitespace-nowrap min-w-0">
            <Wallet className="h-4 w-4 text-purple-500 shrink-0" />
            <span className="truncate">Total Invoiced</span>
          </span>
          <div className="p-1 px-2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-semibold shrink-0">
            Hostel Dues
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono truncate">
            Rs. {Math.round(totalInvoiced).toLocaleString('en-PK')}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Gross official charges invoiced
          </div>
        </div>
      </div>

      {/* 2. Total Settled Payments (Emerald) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-emerald-500/40 transition-all group">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 whitespace-nowrap min-w-0">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="truncate">Settled Payments</span>
          </span>
          <div className="p-1 px-2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold shrink-0">
            {settlementRate}% Paid
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono truncate">
            Rs. {Math.round(totalPaid).toLocaleString('en-PK')}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            {paidInvoicesCount} invoice{paidInvoicesCount === 1 ? '' : 's'} fully cleared
          </div>
        </div>
      </div>

      {/* 3. Outstanding Balance (Amber) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-amber-500/40 transition-all group">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 whitespace-nowrap min-w-0">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="truncate">Outstanding Dues</span>
          </span>
          <div className="p-1 px-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold shrink-0">
            {unpaidInvoicesCount > 0 ? `${unpaidInvoicesCount} Pending` : 'All Clear'}
          </div>
        </div>
        <div>
          <div
            className={`text-2xl sm:text-3xl font-bold tracking-tight font-mono truncate ${
              totalRemaining > 0
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            Rs. {Math.round(totalRemaining).toLocaleString('en-PK')}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            {totalRemaining > 0 ? 'Payable balance to management' : 'Zero pending arrears'}
          </div>
        </div>
      </div>

      {/* 4. Total Invoices (Blue) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between gap-3 min-w-0 hover:border-blue-500/40 transition-all group">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 whitespace-nowrap min-w-0">
            <CalendarCheck className="h-4 w-4 text-blue-500 shrink-0" />
            <span className="truncate">Billing Invoices</span>
          </span>
          <div className="p-1 px-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-semibold shrink-0">
            Ledger
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono truncate">
            {totalInvoicesCount}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
            Invoiced accounting cycles
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(MyBillsMetrics)
