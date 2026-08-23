import React from 'react'
import {
  X,
  Printer,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Download,
} from 'lucide-react'
import type { Bill } from '@/hooks/queries/useBillingQueries'

interface MyBillInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  bill: Bill | null
}

export default function MyBillInvoiceModal({
  isOpen,
  onClose,
  bill,
}: MyBillInvoiceModalProps) {
  if (!isOpen || !bill) return null

  const studentName = bill.studentId?.name || (bill.isGuest ? 'Dining Guest' : 'Resident Student')
  const rollNumber = bill.rollNumber || bill.studentId?.id || 'N/A'
  const isPaid = bill.status === 'Paid'
  const isAdjusted = bill.status === 'Adjusted in Balance'

  const formattedDate = bill.createdAt
    ? new Date(bill.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Modal Topbar */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Hostel Dues Invoice Receipt
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Invoice Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 print:p-0 print:border-none print:shadow-none text-foreground">
          {/* Header & Status Banner */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/80 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                Official Statement
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-0.5">
                INVOICE RECEIPT
              </h1>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                Ref ID: <span className="text-foreground">{bill._id}</span>
              </p>
            </div>

            <div className="sm:text-right flex flex-col sm:items-end gap-1">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-2xs ${
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

              <p className="text-xs text-muted-foreground mt-2">
                Issue Date: <span className="font-semibold text-foreground">{formattedDate}</span>
              </p>
            </div>
          </div>

          {/* Student & Billing Period Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/30 border border-border/60 text-xs">
            <div>
              <p className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                Billed Resident:
              </p>
              <h4 className="text-sm font-bold text-foreground mt-0.5">{studentName}</h4>
              <p className="text-muted-foreground font-mono mt-0.5">
                Roll Number: {rollNumber}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                Billing Cycle:
              </p>
              <h4 className="text-sm font-bold text-foreground font-mono mt-0.5">
                {bill.billingPeriod?.startDate} &rarr; {bill.billingPeriod?.endDate}
              </h4>
              <p className="text-muted-foreground mt-0.5">
                Type: {bill.isGuest ? 'Dining Guest' : 'Hostel Student'}
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground uppercase tracking-wider font-bold border-b border-border">
                <tr>
                  <th className="py-2.5 px-4">Item Description</th>
                  <th className="py-2.5 px-4 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="py-3 px-4">
                    <p className="font-bold text-foreground">Base Mess Bill</p>
                    <p className="text-[11px] text-muted-foreground">
                      Confirmed dining attendance & meal portions
                    </p>
                  </td>
                  <td className="py-3 px-4 text-right font-bold font-mono text-foreground">
                    Rs. {bill.baseMessBill.toLocaleString()}
                  </td>
                </tr>

                {bill.previousUnpaidArrears > 0 && (
                  <tr>
                    <td className="py-3 px-4">
                      <p className="font-bold text-amber-600 dark:text-amber-400">
                        Previous Unpaid Arrears
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Outstanding rollover balance from prior cycle
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-amber-600 dark:text-amber-400">
                      Rs. {bill.previousUnpaidArrears.toLocaleString()}
                    </td>
                  </tr>
                )}

                {(bill.customCharges || []).map((charge, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-4">
                      <p className="font-bold text-foreground">{charge.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {charge.chargeType === 'addition'
                          ? 'Standard flat addition'
                          : charge.chargeType === 'multiplier'
                          ? 'Per meal portion factor'
                          : 'Percentage surcharge'}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-foreground">
                      Rs. {charge.calculatedAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col sm:items-end space-y-2 text-xs">
            <div className="w-full sm:w-64 space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Total Invoiced:</span>
                <span className="font-bold text-foreground font-mono">
                  Rs. {bill.total.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Amount Paid:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  - Rs. {bill.paidBill.toLocaleString()}
                </span>
              </div>

              <div className="border-t border-border pt-2 flex justify-between items-baseline">
                <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                  Balance Due:
                </span>
                <span
                  className={`text-xl font-black font-mono ${
                    bill.remainingBill > 0
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  Rs. {bill.remainingBill.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>
    </div>
  )
}
