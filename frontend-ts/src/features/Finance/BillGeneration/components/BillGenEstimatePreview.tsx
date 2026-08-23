import React, { memo } from 'react'
import { Receipt, ShieldCheck, CheckCircle2 } from 'lucide-react'
import type { BillFieldConfig } from '@/hooks/queries/useBillingQueries'

interface BillGenEstimatePreviewProps {
  billFields: BillFieldConfig[]
  calculateFieldValue: (field: BillFieldConfig) => number
  totalBillAmount: number
  messRevenue: number
}

function BillGenEstimatePreview({
  billFields,
  calculateFieldValue,
  totalBillAmount,
}: BillGenEstimatePreviewProps) {
  const activeFields = billFields.filter((f) => f.included !== false)

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs min-w-0">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Sample Student Invoice Breakdown
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live preview of active billing line items generated for each student profile.
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Line Items */}
      <div className="p-4 sm:p-5 space-y-2.5 text-xs">
        {activeFields.map((field) => {
          const val = calculateFieldValue(field)
          return (
            <div
              key={field.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="font-semibold text-foreground">{field.name}</span>
                {field.type === 'percentage' && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    ({field.value}%)
                  </span>
                )}
                {field.type === 'multiplier' && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    ({field.value}×)
                  </span>
                )}
              </div>

              <span className="font-mono font-bold text-foreground whitespace-nowrap">
                {field.type === 'previous_unpaid'
                  ? 'Dynamic (Arrears)'
                  : `Rs. ${Math.round(val).toLocaleString('en-PK')}`}
              </span>
            </div>
          )
        })}

        {/* Total Sample Row */}
        <div className="pt-2 flex items-center justify-between border-t border-border gap-2">
          <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
            Estimated Invoiced Amount:
          </span>
          <span className="text-base font-bold font-mono text-purple-600 dark:text-purple-400 whitespace-nowrap">
            Rs. {Math.round(totalBillAmount).toLocaleString('en-PK')}
          </span>
        </div>
      </div>

      {/* Security & Collision Shield Notice */}
      <div className="p-3.5 bg-blue-500/10 border-t border-blue-500/20 text-xs text-foreground flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-blue-900 dark:text-blue-300">
            Automated Idempotent Collision Shield:
          </span>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            If a student already possesses an invoice for this exact date range, the engine will safely skip re-generation for them to avoid double billing.
          </p>
        </div>
      </div>
    </div>
  )
}

export default memo(BillGenEstimatePreview)
