import React from 'react'
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Users,
  Wallet,
  ArrowUpRight,
} from 'lucide-react'

interface BillManagementMetricsProps {
  totalRevenue: number
  totalPaid: number
  totalRemaining: number
  totalBillsCount: number
  paidBillsCount: number
  unpaidBillsCount: number
}

export default function BillManagementMetrics({
  totalRevenue,
  totalPaid,
  totalRemaining,
  totalBillsCount,
  paidBillsCount,
  unpaidBillsCount,
}: BillManagementMetricsProps) {
  const collectionRate = totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Total Expected Revenue (Purple Palette) */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-xs relative overflow-hidden group hover:border-purple-500/30 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Total Expected Revenue</span>
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-3xl font-bold tracking-tight text-foreground">
                Rs. {totalRevenue.toLocaleString()}
              </h3>
            </div>
            <p className="text-[11px] font-normal text-muted-foreground/80 mt-1">
              From {totalBillsCount} generated resident & guest {totalBillsCount === 1 ? 'bill' : 'bills'}
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Total Collected Payments (Emerald Green Accent) */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-xs relative overflow-hidden group hover:border-emerald-500/30 transition-all">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-2">
            <p className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Total Collected</span>
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                Rs. {totalPaid.toLocaleString()}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                {collectionRate}% Collected
              </span>
            </div>

            {/* Collection Progress Bar */}
            <div className="mt-2.5 w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(collectionRate, 100)}%` }}
              />
            </div>
            <p className="text-[11px] font-normal text-muted-foreground/80 mt-1">
              {paidBillsCount} {paidBillsCount === 1 ? 'bill' : 'bills'} fully settled
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Outstanding Balance / Unpaid (Amber/Rose Accent) */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-xs relative overflow-hidden group hover:border-amber-500/30 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Outstanding Dues</span>
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                Rs. {totalRemaining.toLocaleString()}
              </h3>
            </div>
            <p className="text-[11px] font-normal text-muted-foreground/80 mt-1">
              {unpaidBillsCount} {unpaidBillsCount === 1 ? 'account' : 'accounts'} with pending balance
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  )
}
