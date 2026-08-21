import React from 'react'
import {
  Receipt,
  X,
  User,
  Calendar,
  CreditCard,
  Printer,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import type { Bill } from '@/hooks/queries/useBillingQueries'

interface BillDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  bill: Bill | null
  onOpenPayment?: (bill: Bill) => void
}

export default function BillDetailsModal({
  isOpen,
  onClose,
  bill,
  onOpenPayment,
}: BillDetailsModalProps) {
  if (!isOpen || !bill) return null

  const studentName = bill.studentId?.name || (bill.isGuest ? 'Dining Guest' : 'Resident')
  const rollNumber = bill.rollNumber || bill.studentId?.id || 'N/A'
  const email = bill.studentId?.email || null

  const handlePrint = () => {
    window.print()
  }

  const isPaid = bill.status === 'Paid'
  const isAdjusted = bill.status === 'Adjusted in Balance'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-purple-500/5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Bill Statement & Breakdown</h3>
              <p className="text-xs text-muted-foreground">Itemized dues and transaction summary</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Print Statement"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Resident & Period Card */}
          <div className="p-4 bg-muted/30 border border-border/60 rounded-xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-foreground">{studentName}</h4>
                  {bill.isGuest && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      GUEST
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">Roll / ID: {rollNumber}</p>
                {email && <p className="text-xs text-muted-foreground mt-0.5">{email}</p>}
              </div>

              {/* Status Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${
                  isPaid
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : isAdjusted
                    ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}
              >
                {isPaid ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                <span>{bill.status}</span>
              </span>
            </div>

            <div className="border-t border-border/60 pt-2.5 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Billing Period:</span>
              </span>
              <span className="font-semibold text-foreground font-mono">
                {bill.billingPeriod?.startDate || 'N/A'} &rarr; {bill.billingPeriod?.endDate || 'N/A'}
              </span>
            </div>
          </div>

          {/* Itemized Charges Breakdown */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Itemized Line Items
            </h5>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-muted-foreground">
                    <th className="py-2.5 px-3 font-semibold">Description</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-foreground">Base Mess Bill</div>
                      <div className="text-[11px] text-muted-foreground">Consumed meals attendance tally</div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-foreground text-right font-mono">
                      Rs. {bill.baseMessBill.toLocaleString()}
                    </td>
                  </tr>

                  {bill.previousUnpaidArrears > 0 && (
                    <tr>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-amber-600 dark:text-amber-400">
                          Previous Arrears Carried Over
                        </div>
                        <div className="text-[11px] text-muted-foreground">Unpaid balance from past cycle</div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-amber-600 dark:text-amber-400 text-right font-mono">
                        Rs. {bill.previousUnpaidArrears.toLocaleString()}
                      </td>
                    </tr>
                  )}

                  {bill.customCharges && bill.customCharges.length > 0 && (
                    bill.customCharges.map((charge, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-foreground">{charge.name}</div>
                          <div className="text-[11px] text-muted-foreground capitalize">
                            Type: {charge.chargeType || 'Addition'}{' '}
                            {charge.target && charge.target !== 'none' ? `(on ${charge.target.replace('_', ' ')})` : ''}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-foreground text-right font-mono">
                          Rs. {charge.calculatedAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Final Ledger Breakdown */}
          <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Total Billed Dues:</span>
              <span className="font-bold text-foreground text-sm font-mono">
                Rs. {bill.total.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-muted-foreground">
              <span>Amount Paid:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                Rs. {bill.paidBill.toLocaleString()}
              </span>
            </div>

            <div className="border-t border-border pt-2 flex justify-between items-center text-sm font-bold">
              <span className="text-foreground">Remaining Balance Due:</span>
              <span
                className={`font-mono text-base ${
                  bill.remainingBill === 0 ? 'text-emerald-600' : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                Rs. {bill.remainingBill.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-border bg-card flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs md:text-sm font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors"
          >
            Close
          </button>

          {bill.remainingBill > 0 && onOpenPayment && (
            <button
              type="button"
              onClick={() => {
                onClose()
                onOpenPayment(bill)
              }}
              className="px-4 py-2 text-xs md:text-sm font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
