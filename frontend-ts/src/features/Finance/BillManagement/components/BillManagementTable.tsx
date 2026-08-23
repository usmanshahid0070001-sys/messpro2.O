import React from 'react'
import {
  CreditCard,
  Edit3,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
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
      <div className="bg-card border border-border/80 rounded-2xl p-12 text-center shadow-xs">
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
    <div className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden relative">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0 text-xs">
          <thead>
            <tr className="bg-muted text-muted-foreground uppercase tracking-wider font-bold">
              {/* 1. PINNED LEFT: Resident Info */}
              <th
                className="py-3 px-4 sticky left-0 bg-muted z-3 border-b border-r border-border/80 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.12)]"
                style={{ width: '190px', minWidth: '190px', maxWidth: '190px' }}
              >
                Resident Details
              </th>

              {/* 2. SCROLLABLE MIDDLE: Mess Bill, Arrears, Dynamic Charges, Paid, Remaining */}
              <th className="py-3 px-3.5 whitespace-nowrap min-w-[110px] border-b border-border/80 bg-muted">
                Mess Bill
              </th>
              <th className="py-3 px-3.5 whitespace-nowrap min-w-[110px] border-b border-border/80 bg-muted">
                Prev Arrears
              </th>

              {dynamicColumns.map((col) => (
                <th
                  key={col.key}
                  className="py-3 px-3.5 whitespace-nowrap min-w-[120px] border-b border-border/80 bg-muted"
                >
                  {col.label}
                </th>
              ))}

              <th className="py-3 px-3.5 whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400 min-w-[100px] border-b border-border/80 bg-muted">
                Paid
              </th>
              <th className="py-3 px-3.5 whitespace-nowrap font-bold text-amber-600 dark:text-amber-400 min-w-[110px] border-b border-border/80 bg-muted">
                Remaining
              </th>

              {/* 3. PINNED RIGHT: Total (Has the single left border & shadow for the entire right fixed block) */}
              <th
                className="py-3 px-3.5 whitespace-nowrap font-bold text-foreground sticky bg-muted z-3 border-b border-l border-border/80 shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.12)]"
                style={{
                  right: '240px',
                  width: '120px',
                  minWidth: '120px',
                  maxWidth: '120px',
                }}
              >
                Total
              </th>

              {/* 4. PINNED RIGHT: Status (No vertical border line) */}
              <th
                className="py-3 px-3 text-center whitespace-nowrap sticky bg-muted z-3 border-b border-border/80"
                style={{
                  right: '110px',
                  width: '130px',
                  minWidth: '130px',
                  maxWidth: '130px',
                }}
              >
                Status
              </th>

              {/* 5. PINNED RIGHT: Actions (No vertical border line) */}
              <th
                className="py-3 px-4 text-right whitespace-nowrap sticky right-0 bg-muted z-3 border-b border-border/80"
                style={{
                  width: '110px',
                  minWidth: '110px',
                  maxWidth: '110px',
                }}
              >
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
                  className="hover:bg-muted/40 transition-colors group"
                >
                  {/* 1. PINNED LEFT: Student Info */}
                  <td
                    className="py-3 px-4 sticky left-0 bg-card group-hover:bg-card transition-colors shadow-[2px_0_6px_-2px_rgba(0,0,0,0.12)] border-r border-b border-border/60 z-2"
                    style={{ width: '190px', minWidth: '190px', maxWidth: '190px' }}
                  >
                    <div className="font-bold text-foreground whitespace-nowrap flex items-center gap-1.5">
                      <span className="truncate max-w-[130px]">{studentName}</span>
                      {bill.isGuest && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                          GUEST
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      {rollNumber}
                    </div>
                  </td>

                  {/* 2. SCROLLABLE MIDDLE: Mess Bill, Arrears, Dynamic Charges, Paid, Remaining */}
                  <td className="py-3 px-3.5 font-medium text-foreground font-mono whitespace-nowrap border-b border-border/60 bg-card group-hover:bg-muted/40">
                    Rs. {bill.baseMessBill.toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 font-medium font-mono text-muted-foreground whitespace-nowrap border-b border-border/60 bg-card group-hover:bg-muted/40">
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
                      <td
                        key={col.key}
                        className="py-3 px-3.5 font-medium text-muted-foreground font-mono whitespace-nowrap border-b border-border/60 bg-card group-hover:bg-muted/40"
                      >
                        {charge ? `Rs. ${charge.calculatedAmount.toLocaleString()}` : '-'}
                      </td>
                    )
                  })}

                  {/* Movable Paid & Remaining */}
                  <td className="py-3 px-3.5 font-bold text-emerald-600 dark:text-emerald-400 font-mono whitespace-nowrap border-b border-border/60 bg-card group-hover:bg-muted/40">
                    Rs. {bill.paidBill.toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 font-bold font-mono whitespace-nowrap border-b border-border/60 bg-card group-hover:bg-muted/40">
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

                  {/* 3. PINNED RIGHT: Total (Solid opaque bg-card, single left border) */}
                  <td
                    className="py-3 px-3.5 font-bold text-foreground font-mono sticky bg-card group-hover:bg-card transition-colors z-2 border-l border-b border-border/80 shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.12)] whitespace-nowrap"
                    style={{
                      right: '240px',
                      width: '120px',
                      minWidth: '120px',
                      maxWidth: '120px',
                    }}
                  >
                    Rs. {bill.total.toLocaleString()}
                  </td>

                  {/* 4. PINNED RIGHT: Status (Solid opaque bg-card, NO internal vertical border) */}
                  <td
                    className="py-3 px-3 text-center sticky bg-card group-hover:bg-card transition-colors z-2 border-b border-border/60 whitespace-nowrap"
                    style={{
                      right: '110px',
                      width: '130px',
                      minWidth: '130px',
                      maxWidth: '130px',
                    }}
                  >
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
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                      ) : isAdjusted ? (
                        <Clock className="w-3 h-3 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3 h-3 shrink-0" />
                      )}
                      <span className="truncate">{bill.status}</span>
                    </span>
                  </td>

                  {/* 5. PINNED RIGHT: Actions (Solid opaque bg-card, NO internal vertical border) */}
                  <td
                    className="py-3 px-4 text-right sticky right-0 bg-card group-hover:bg-card transition-colors z-2 border-b border-border/60 whitespace-nowrap"
                    style={{
                      width: '110px',
                      minWidth: '110px',
                      maxWidth: '110px',
                    }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenDetails(bill)}
                        className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="View Statement Receipt"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenEditCharges(bill)}
                        className="p-1 rounded-lg text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                        title="Adjust Custom Charges"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenPayment(bill)}
                        disabled={bill.remainingBill === 0}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <CreditCard className="w-3 h-3" />
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
