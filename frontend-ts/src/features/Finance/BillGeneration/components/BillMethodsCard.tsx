import React, { memo } from 'react'
import {
  Settings2,
  Plus,
  Trash2,
  Link as LinkIcon,
  Calculator,
} from 'lucide-react'
import type { BillFieldConfig } from '@/hooks/queries/useBillingQueries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface BillMethodsCardProps {
  billFields: BillFieldConfig[]
  messRevenue: number
  onAddField: () => void
  onUpdateField: (id: string, key: keyof BillFieldConfig, value: any) => void
  onRemoveField: (id: string) => void
  calculateFieldValue: (field: BillFieldConfig) => number
  totalBillAmount: number
}

function BillMethodsCard({
  billFields,
  messRevenue,
  onAddField,
  onUpdateField,
  onRemoveField,
  calculateFieldValue,
  totalBillAmount,
}: BillMethodsCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs transition-all min-w-0">
      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
            <Settings2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-foreground">
                Bill Methods & Custom Charges
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25">
                {billFields.filter((f) => f.included !== false).length} Active
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure static fees, percentages, and multipliers to structure invoices.
            </p>
          </div>
        </div>

        {billFields.length < 10 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddField}
            className="h-8.5 px-3 text-xs font-semibold rounded-xl border-border hover:bg-muted cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-3.5 w-3.5 mr-1 text-purple-600 dark:text-purple-400" />
            <span>Add Charge</span>
          </Button>
        )}
      </div>

      {/* Fields List */}
      <div className="p-4 sm:p-5 space-y-3.5">
        {billFields.map((field, index) => {
          const calculatedValue = calculateFieldValue(field)
          const isCoreField =
            field.type === 'meal_attendance' || field.type === 'previous_unpaid'
          const isIncluded = field.included !== false

          return (
            <div
              key={field.id}
              className={`p-4 rounded-xl border transition-all space-y-3 min-w-0 ${
                !isIncluded
                  ? 'bg-muted/15 border-border/60 opacity-60'
                  : 'bg-card border-border hover:border-purple-500/40 shadow-xs'
              }`}
            >
              {/* Row 1: Checkbox, Name, Type & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 min-w-0">
                {/* Checkbox & Name Input */}
                <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
                  <input
                    type="checkbox"
                    checked={isIncluded}
                    onChange={(e) =>
                      onUpdateField(field.id, 'included', e.target.checked)
                    }
                    className="w-4 h-4 rounded border-border text-purple-600 focus:ring-purple-500 cursor-pointer shrink-0"
                    title="Include this charge in generated bills"
                  />
                  <span className="text-[11px] font-bold text-muted-foreground font-mono w-5 shrink-0">
                    #{index + 1}
                  </span>
                  <Input
                    type="text"
                    value={field.name}
                    onChange={(e) =>
                      onUpdateField(field.id, 'name', e.target.value)
                    }
                    placeholder="Charge Name"
                    disabled={isCoreField}
                    className="h-8.5 text-xs font-semibold bg-background rounded-lg border-border focus:border-purple-500 disabled:opacity-85 flex-1 min-w-0"
                  />
                </div>

                {/* Right controls: Type selector & Delete */}
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={field.type}
                    onChange={(e) => {
                      const newType = e.target.value as any
                      onUpdateField(field.id, 'type', newType)
                      if (newType !== 'percentage' && newType !== 'multiplier') {
                        onUpdateField(field.id, 'linkedFieldId', null)
                      }
                    }}
                    disabled={isCoreField}
                    className="h-8.5 bg-background border border-border rounded-lg px-2.5 text-xs font-semibold text-foreground focus:border-purple-500 outline-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {field.type === 'meal_attendance' && (
                      <option value="meal_attendance">Mess Bill Link</option>
                    )}
                    {field.type === 'previous_unpaid' && (
                      <option value="previous_unpaid">Unpaid Arrears Link</option>
                    )}
                    {!isCoreField && (
                      <>
                        <option value="static">Fixed Amount</option>
                        <option value="percentage">Percentage (%)</option>
                        <option value="multiplier">Multiplier (×)</option>
                      </>
                    )}
                  </select>

                  {!isCoreField && (
                    <button
                      type="button"
                      onClick={() => onRemoveField(field.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Remove charge"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: Value Configuration & Calculated Preview */}
              <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 min-w-0">
                {/* Value Input Controls */}
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  {field.type === 'static' && (
                    <div className="relative w-full max-w-[200px]">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px] font-semibold pointer-events-none select-none">
                        Rs.
                      </span>
                      <Input
                        type="number"
                        min={0}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          onUpdateField(
                            field.id,
                            'value',
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                        placeholder="0"
                        className="h-8 pl-8 pr-2 text-right font-mono font-bold text-xs bg-background rounded-lg border-border focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  )}

                  {(field.type === 'percentage' || field.type === 'multiplier') && (
                    <div className="flex flex-wrap items-center gap-2 w-full">
                      <div className="relative w-24 shrink-0">
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            onUpdateField(
                              field.id,
                              'value',
                              e.target.value === '' ? '' : Number(e.target.value)
                            )
                          }
                          placeholder="0"
                          className={`h-8 font-mono font-bold text-xs bg-background rounded-lg border-border focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-right ${
                            field.type === 'percentage' ? 'pr-6' : 'text-center'
                          }`}
                        />
                        {field.type === 'percentage' && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px] font-bold pointer-events-none select-none">
                            %
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-bold text-muted-foreground">
                        {field.type === 'multiplier' ? '×' : 'of'}
                      </span>

                      <select
                        value={field.linkedFieldId || ''}
                        onChange={(e) =>
                          onUpdateField(field.id, 'linkedFieldId', e.target.value)
                        }
                        className="flex-1 min-w-[140px] h-8 bg-background border border-border rounded-lg px-2 text-xs font-medium text-foreground focus:border-purple-500 outline-none cursor-pointer"
                      >
                        <option value="" disabled>
                          Select target charge...
                        </option>
                        {billFields
                          .filter((f) => f.id !== field.id)
                          .map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  {field.type === 'meal_attendance' && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-500/20">
                      <LinkIcon className="h-3 w-3 shrink-0" />
                      <span>Auto-calculated from verified consumed meals</span>
                    </div>
                  )}

                  {field.type === 'previous_unpaid' && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-medium border border-amber-500/20">
                      <LinkIcon className="h-3 w-3 shrink-0" />
                      <span>Auto-applied per student past unpaid dues</span>
                    </div>
                  )}
                </div>

                {/* Calculated Amount Indicator */}
                <div className="flex items-center gap-2 shrink-0 ml-auto">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Profile Value:
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border whitespace-nowrap">
                    {field.type === 'previous_unpaid'
                      ? 'Student Specific'
                      : `Rs. ${Math.round(calculatedValue).toLocaleString('en-PK')}`}
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {billFields.length === 0 && (
          <div className="py-10 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-xl">
            <Calculator className="h-8 w-8 text-muted-foreground mb-2" />
            <h4 className="text-sm font-semibold text-foreground">No Billing Methods Configured</h4>
            <p className="text-xs text-muted-foreground max-w-sm mt-0.5">
              Add dynamic fields to define invoice calculation rules.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddField}
              className="mt-3 h-8 text-xs rounded-xl"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add First Field
            </Button>
          </div>
        )}
      </div>

      {/* Total Profile Footer */}
      {billFields.length > 0 && (
        <div className="p-4 sm:p-5 border-t border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Estimated Total Bill Profile
            </span>
            <span className="text-[11px] text-muted-foreground">
              Sum of active charges (excluding variable individual past arrears)
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 whitespace-nowrap">
            Rs. {Math.round(totalBillAmount).toLocaleString('en-PK')}
          </span>
        </div>
      )}
    </div>
  )
}

export default memo(BillMethodsCard)
