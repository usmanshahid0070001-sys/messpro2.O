import React from 'react'
import {
  CreditCard,
  Edit3,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react'
import type { Bill } from '@/hooks/queries/useBillingQueries'

interface DynamicColumn {
  key: string
  label: string
}

interface BillManagementTableProps {
  bills: Bill[]
  dynamicColumns: DynamicColumn[]
  onOpenPayment: (bill: Bill) => void
  onOpenEditCharges: (bill: Bill) => void
  onOpenDetails: (bill: Bill) => void
}

export default function BillManagementTable({
  bills,
  dynamicColumns,
  onOpenPayment,
  onOpenEditCharges,
  onOpenDetails,
}: BillManagementTableProps) {
  if (bills.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground mb-3">
          <Receipt className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">No Bills Found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          No billing records match your current filter and search criteria.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-muted/60 border-b border-border text-muted-foreground uppercase tracking-wider font-bold">
              {/* Sticky Resident Column */}
              <th className="py-3 px-4 sticky left-0 bg-muted/90 backdrop-blur-xs z-10 shadow-[1px_0_0_0_var(--color-border)]">
                Resident Details
              </th>

              <th className="py-3 px-3.5 whitespace-nowrap">Mess Bill</th>
              <th className="py-3 px-3.5 whitespace-nowrap">Prev Arrears</th>

              {/* Dynamic Columns */}
              {dynamicColumns.map((col) => (
                <th key={col.key} className="py-3 px-3.5 whitespace-nowrap">
                  {col.label}
                </th>
              ))}

              <th className="py-3 px-3.5 border-l border-border whitespace-nowrap font-bold text-foreground">
                Total
              </th>
              <th className="py-3 px-3.5 whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                Paid
              </th>
              <th className="py-3 px-3.5 whitespace-nowrap font-bold text-amber-600 dark:text-amber-400">
                Remaining
              </th>

              <th className="py-3 px-3.5 text-center whitespace-nowrap">Status</th>

              {/* Sticky Action Column */}
              <th className="py-3 px-4 text-right sticky right-0 bg-muted/90 backdrop-blur-xs z-10 shadow-[-1px_0_0_0_var(--color-border)]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60">
            {bills.map((bill) => {
              const studentName = bill.studentId?.name || (bill.isGuest ? 'Dining Guest' : 'Resident')
              const rollNumber = bill.rollNumber || bill.studentId?.id || 'N/A'
              const isPaid = bill.status === 'Paid'
              const isAdjusted = bill.status === 'Adjusted in Balance'

              return (
                <tr
                  key={bill._id}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  {/* Sticky Student Column */}
                  <td className="py-3 px-4 sticky left-0 bg-card group-hover:bg-muted/30 transition-colors shadow-[1px_0_0_0_var(--color-border)] z-10">
                    <div className="font-bold text-foreground whitespace-nowrap flex items-center gap-1.5">
                      <span>{studentName}</span>
                      {bill.isGuest && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          GUEST
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      {rollNumber}
                    </div>
                  </td>

                  {/* Mess Bill & Prev Arrears */}
                  <td className="py-3 px-3.5 font-medium text-foreground font-mono">
                    Rs. {bill.baseMessBill.toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 font-medium font-mono text-muted-foreground">
                    {bill.previousUnpaidArrears > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        Rs. {bill.previousUnpaidArrears.toLocaleString()}
                      </span>
                    ) : (
                      '0'
                    )}
                  </td>

                  {/* Dynamic Custom Charges */}
                  {dynamicColumns.map((col) => {
                    const charge = bill.customCharges?.find((c) => c.name === col.key)
                    return (
                      <td key={col.key} className="py-3 px-3.5 font-medium text-muted-foreground font-mono">
                        {charge ? `Rs. ${charge.calculatedAmount.toLocaleString()}` : '-'}
                      </td>
                    )
                  })}

                  {/* Totals, Paid & Remaining */}
                  <td className="py-3 px-3.5 font-bold text-foreground border-l border-border font-mono bg-muted/10">
                    Rs. {bill.total.toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 font-bold text-emerald-600 dark:text-emerald-400 font-mono bg-muted/10">
                    Rs. {bill.paidBill.toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 font-bold font-mono bg-muted/10">
                    <span
                      className={
                        bill.remainingBill === 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }
                    >
                      Rs. {bill.remainingBill.toLocaleString()}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
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
                  </td>

                  {/* Sticky Actions Column */}
                  <td className="py-3 px-4 text-right sticky right-0 bg-card group-hover:bg-muted/30 transition-colors shadow-[-1px_0_0_0_var(--color-border)] z-10">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenDetails(bill)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="View Statement Receipt"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenEditCharges(bill)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                        title="Adjust Custom Charges"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenPayment(bill)}
                        disabled={bill.remainingBill === 0}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
