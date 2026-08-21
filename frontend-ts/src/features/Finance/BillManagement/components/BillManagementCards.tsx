import React, { useState } from 'react'
import {
  CreditCard,
  Edit3,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { Bill } from '@/hooks/queries/useBillingQueries'

interface BillManagementCardsProps {
  bills: Bill[]
  onOpenPayment: (bill: Bill) => void
  onOpenEditCharges: (bill: Bill) => void
  onOpenDetails: (bill: Bill) => void
}

export default function BillManagementCards({
  bills,
  onOpenPayment,
  onOpenEditCharges,
  onOpenDetails,
}: BillManagementCardsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  if (bills.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-xs">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto text-muted-foreground mb-2.5">
          <Receipt className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-foreground">No Bills Found</h3>
        <p className="text-xs text-muted-foreground mt-1">
          No records match your active search and status filter.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {bills.map((bill) => {
        const studentName = bill.studentId?.name || (bill.isGuest ? 'Dining Guest' : 'Resident')
        const rollNumber = bill.rollNumber || bill.studentId?.id || 'N/A'
        const isPaid = bill.status === 'Paid'
        const isAdjusted = bill.status === 'Adjusted in Balance'
        const isExpanded = expandedId === bill._id

        return (
          <div
            key={bill._id}
            className="bg-card border border-border p-4 rounded-2xl shadow-xs space-y-3"
          >
            {/* Header: Student Name, Roll & Status */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-sm font-bold text-foreground">{studentName}</h4>
                  {bill.isGuest && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      GUEST
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{rollNumber}</p>
              </div>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 ${
                  isPaid
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : isAdjusted
                    ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}
              >
                {isPaid ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : isAdjusted ? (
                  <Clock className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                <span>{bill.status}</span>
              </span>
            </div>

            {/* Financial Summary 3-Column Grid */}
            <div className="grid grid-cols-3 gap-2 p-2.5 bg-muted/40 rounded-xl border border-border/60 text-center">
              <div>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">Total</p>
                <p className="text-xs font-bold text-foreground font-mono mt-0.5">
                  Rs. {bill.total.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                  Paid
                </p>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  Rs. {bill.paidBill.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400">
                  Remaining
                </p>
                <p
                  className={`text-xs font-bold font-mono mt-0.5 ${
                    bill.remainingBill === 0 ? 'text-emerald-600' : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  Rs. {bill.remainingBill.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Expandable Breakdown Toggle */}
            <div>
              <button
                type="button"
                onClick={() => toggleExpand(bill._id)}
                className="w-full flex items-center justify-between text-[11px] font-medium text-muted-foreground hover:text-foreground py-1 transition-colors"
              >
                <span>{isExpanded ? 'Hide itemized charges' : 'View itemized breakdown'}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {isExpanded && (
                <div className="mt-2 p-3 bg-muted/20 border border-border/60 rounded-xl space-y-1.5 text-xs animate-in fade-in duration-150">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Base Mess Bill:</span>
                    <span className="font-semibold text-foreground font-mono">
                      Rs. {bill.baseMessBill.toLocaleString()}
                    </span>
                  </div>
                  {bill.previousUnpaidArrears > 0 && (
                    <div className="flex justify-between text-amber-600 dark:text-amber-400">
                      <span>Previous Arrears:</span>
                      <span className="font-semibold font-mono">
                        Rs. {bill.previousUnpaidArrears.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {bill.customCharges &&
                    bill.customCharges.map((charge, i) => (
                      <div key={i} className="flex justify-between text-muted-foreground">
                        <span>{charge.name}:</span>
                        <span className="font-semibold text-foreground font-mono">
                          Rs. {charge.calculatedAmount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onOpenDetails(bill)}
                  className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="View Statement"
                >
                  <Receipt className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenEditCharges(bill)}
                  className="p-1.5 rounded-lg border border-border hover:bg-purple-500/10 text-muted-foreground hover:text-purple-600 transition-colors"
                  title="Adjust Charges"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => onOpenPayment(bill)}
                disabled={bill.remainingBill === 0}
                className="flex-1 max-w-[140px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay Dues</span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
