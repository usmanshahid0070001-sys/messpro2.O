import React from 'react'
import {
  Receipt,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import type { Bill } from '@/hooks/queries/useBillingQueries'

interface MyBillCardProps {
  bill: Bill
  onOpenInvoice: (bill: Bill) => void
}

export default function MyBillCard({ bill, onOpenInvoice }: MyBillCardProps) {
  const isPaid = bill.status === 'Paid'
  const isAdjusted = bill.status === 'Adjusted in Balance'

  return (
    <div className="bg-card border border-border p-5 rounded-2xl shadow-xs hover:border-purple-500/30 transition-all group space-y-4">
      {/* Header: Period & Status Stamp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-foreground font-mono">
                {bill.billingPeriod?.startDate} &rarr; {bill.billingPeriod?.endDate}
              </h3>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Invoice ID: <span className="font-mono text-foreground/80">{bill._id}</span>
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${
              isPaid
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : isAdjusted
                ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}
          >
            {isPaid ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : isAdjusted ? (
              <Clock className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            <span>{bill.status}</span>
          </span>
        </div>
      </div>

      {/* Charge Line Items Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Base Mess Bill */}
        <div className="p-3 bg-muted/20 border border-border/60 rounded-xl">
          <p className="text-[11px] text-muted-foreground font-medium">Base Mess Bill</p>
          <p className="text-sm font-bold text-foreground font-mono mt-1">
            Rs. {bill.baseMessBill.toLocaleString()}
          </p>
        </div>

        {/* Previous Arrears */}
        <div className="p-3 bg-muted/20 border border-border/60 rounded-xl">
          <p className="text-[11px] text-muted-foreground font-medium">Previous Arrears</p>
          <p
            className={`text-sm font-bold font-mono mt-1 ${
              bill.previousUnpaidArrears > 0
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-muted-foreground'
            }`}
          >
            Rs. {bill.previousUnpaidArrears.toLocaleString()}
          </p>
        </div>

        {/* Custom Charges Combined */}
        <div className="p-3 bg-muted/20 border border-border/60 rounded-xl">
          <p className="text-[11px] text-muted-foreground font-medium">Custom Charges</p>
          <p className="text-sm font-bold text-foreground font-mono mt-1">
            Rs.{' '}
            {(bill.customCharges || [])
              .reduce((s, c) => s + (c.calculatedAmount || 0), 0)
              .toLocaleString()}
          </p>
        </div>

        {/* Paid Amount */}
        <div className="p-3 bg-muted/20 border border-border/60 rounded-xl">
          <p className="text-[11px] text-muted-foreground font-medium">Paid Amount</p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            Rs. {bill.paidBill.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Itemized Custom Charges Pills */}
      {bill.customCharges && bill.customCharges.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-muted-foreground">
            Itemized Fees:
          </span>
          {bill.customCharges.map((c, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-muted border border-border/80 text-foreground"
            >
              <span>{c.name}:</span>
              <span className="font-mono font-bold">Rs. {c.calculatedAmount}</span>
            </span>
          ))}
        </div>
      )}

      {/* Footer: Grand Total, Remaining & Action CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border/60 pt-3.5">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Total Invoiced
            </p>
            <p className="text-base font-bold text-foreground font-mono">
              Rs. {bill.total.toLocaleString()}
            </p>
          </div>

          <div className="w-px h-8 bg-border/80" />

          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Remaining Due
            </p>
            <p
              className={`text-base font-bold font-mono ${
                bill.remainingBill > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              Rs. {bill.remainingBill.toLocaleString()}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenInvoice(bill)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>View Invoice Receipt</span>
          <ChevronRight className="w-3.5 h-3.5 ml-0.5 opacity-80" />
        </button>
      </div>
    </div>
  )
}
