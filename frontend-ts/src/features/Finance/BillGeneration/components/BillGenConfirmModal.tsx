import React, { memo } from 'react'
import {
  Calendar,
  Send,
  AlertTriangle,
  Receipt,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BillFieldConfig } from '@/hooks/queries/useBillingQueries'

interface BillGenConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isGenerating: boolean
  startDate: string
  endDate: string
  messRevenue: number
  totalAttendanceCount: number
  billFields: BillFieldConfig[]
  calculateFieldValue: (field: BillFieldConfig) => number
  totalBillAmount: number
}

function BillGenConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isGenerating,
  startDate,
  endDate,
  messRevenue,
  totalAttendanceCount,
  billFields,
  calculateFieldValue,
  totalBillAmount,
}: BillGenConfirmModalProps) {
  if (!isOpen) return null

  const activeFields = billFields.filter((f) => f.included !== false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Confirm Bill Generation
              </h3>
              <p className="text-xs text-muted-foreground">
                Final audit check before issuing student monthly invoices
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Billing Period Box */}
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Target Billing Period
              </span>
              <span className="font-semibold text-foreground text-xs">
                {startDate} <span className="text-muted-foreground font-normal">to</span> {endDate}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                Portions Logged
              </span>
              <span className="font-mono font-bold text-foreground text-xs whitespace-nowrap">
                {totalAttendanceCount.toLocaleString('en-PK')} meals
              </span>
            </div>
          </div>

          {/* Line Items Summary */}
          <div className="space-y-2">
            <span className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
              Configured Invoice Structure ({activeFields.length} active charges):
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {activeFields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="font-medium text-foreground">{field.name}</span>
                  </div>
                  <span className="font-mono font-bold text-foreground whitespace-nowrap">
                    {field.type === 'previous_unpaid'
                      ? 'Student Specific'
                      : `Rs. ${Math.round(calculateFieldValue(field)).toLocaleString('en-PK')}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Estimated Invoiced Amount */}
          <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Estimated Total Profile
            </span>
            <span className="text-base font-bold font-mono text-purple-600 dark:text-purple-400 whitespace-nowrap">
              Rs. {Math.round(totalBillAmount).toLocaleString('en-PK')}
            </span>
          </div>

          {/* Warning Notice */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              This process will batch calculate each student's consumption, roll over past unpaid balances, attach the configured dynamic fees, and publish official bill vouchers.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-muted/20 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isGenerating}
            className="h-8.5 px-4 text-xs rounded-xl cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isGenerating}
            className="h-8.5 px-5 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-sm transition-all"
          >
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5 mr-1.5" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Confirm & Generate Bills'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default memo(BillGenConfirmModal)
