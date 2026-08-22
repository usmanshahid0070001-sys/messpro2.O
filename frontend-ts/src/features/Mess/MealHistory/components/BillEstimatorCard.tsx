import React, { useState, useMemo } from 'react'
import {
  Calculator,
  Plus,
  Trash2,
  Receipt,
  Sparkles,
  DollarSign,
  Info,
  Sliders,
  CheckCircle2,
  Printer,
  RotateCcw,
  Utensils,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type {
  StudentMonthlyMealRecord,
  MealSchedule,
} from '@/hooks/queries/useMealQueries'

export interface EstimatedSubcharge {
  id: string
  name: string
  type: 'fixed' | 'multiplier' | 'percentage'
  value: number
}

interface BillEstimatorCardProps {
  records: StudentMonthlyMealRecord[]
  monthLabel: string
  schedule?: MealSchedule | null
}

const DEFAULT_PRESET_CHARGES: EstimatedSubcharge[] = [
  {
    id: 'default-service',
    name: 'Hostel Maintenance & Utilities',
    type: 'fixed',
    value: 500,
  },
]

export default function BillEstimatorCard({
  records,
  monthLabel,
  schedule,
}: BillEstimatorCardProps) {
  const [subcharges, setSubcharges] = useState<EstimatedSubcharge[]>(DEFAULT_PRESET_CHARGES)
  const [newChargeName, setNewChargeName] = useState('')
  const [newChargeType, setNewChargeType] = useState<'fixed' | 'multiplier' | 'percentage'>('fixed')
  const [newChargeValue, setNewChargeValue] = useState('')
  const [isAddingOpen, setIsAddingOpen] = useState(false)
  const [showEatenBreakdown, setShowEatenBreakdown] = useState(false)

  // 1. Resolve Meal Price helper (record price or schedule lookup fallback)
  const resolveMealPrice = (r: StudentMonthlyMealRecord): { price: number; name: string } => {
    let price = Number(r.mealInfo?.price) || 0
    let name = r.mealInfo?.name || r.mealType

    if (price === 0 && schedule?.menu) {
      try {
        const dayName = new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'long',
        }) as
          | 'Monday'
          | 'Tuesday'
          | 'Wednesday'
          | 'Thursday'
          | 'Friday'
          | 'Saturday'
          | 'Sunday'
        const menuForDay = schedule.menu[dayName] || []
        const mealIdx = schedule.mealNames?.indexOf(r.mealType)
        if (mealIdx !== undefined && mealIdx !== -1 && menuForDay[mealIdx]) {
          const item = menuForDay[mealIdx]
          if (item.price) price = Number(item.price)
          if (item.meal && item.meal !== 'none') name = item.meal
        }
      } catch {
        // fallback
      }
    }

    return { price, name }
  }

  // 2. Extract Eaten Meals with exact calculated totals
  const eatenMealsList = useMemo(() => {
    const list: Array<{
      date: string
      mealType: string
      name: string
      count: number
      unitPrice: number
      totalPrice: number
    }> = []

    records.forEach((r) => {
      const hasEaten = Boolean(
        r.attendance?.hasEaten ||
        (r.attendance?.count && r.attendance.count > 0)
      )

      if (hasEaten) {
        const count =
          r.attendance?.count && r.attendance.count > 0
            ? r.attendance.count
            : 1
        const { price, name } = resolveMealPrice(r)
        const totalPrice = price * count

        list.push({
          date: r.date,
          mealType: r.mealType,
          name,
          count,
          unitPrice: price,
          totalPrice,
        })
      }
    })

    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [records, schedule])

  // 3. Calculate Base Consumed Meal Cost & Portion Aggregations
  const { baseMealsCost, totalConsumedPortions, mealTypeStats } = useMemo(() => {
    let cost = 0
    let portions = 0
    const stats: Record<string, { count: number; total: number }> = {}

    eatenMealsList.forEach((m) => {
      cost += m.totalPrice
      portions += m.count

      if (!stats[m.mealType]) {
        stats[m.mealType] = { count: 0, total: 0 }
      }
      stats[m.mealType].count += m.count
      stats[m.mealType].total += m.totalPrice
    })

    return {
      baseMealsCost: cost,
      totalConsumedPortions: portions,
      mealTypeStats: stats,
    }
  }, [eatenMealsList])

  // 4. Dynamic Math Calculations (Subcharges + Taxes)
  const calculations = useMemo(() => {
    let fixedTotal = 0
    let multiplierTotal = 0

    // Fixed Additions
    subcharges
      .filter((s) => s.type === 'fixed')
      .forEach((s) => {
        fixedTotal += s.value
      })

    // Multiplier per consumed meal
    subcharges
      .filter((s) => s.type === 'multiplier')
      .forEach((s) => {
        multiplierTotal += s.value * totalConsumedPortions
      })

    const subtotalBeforePercent = baseMealsCost + fixedTotal + multiplierTotal

    // Percentage surcharges applied to subtotal
    let percentageTotal = 0
    subcharges
      .filter((s) => s.type === 'percentage')
      .forEach((s) => {
        percentageTotal += (subtotalBeforePercent * s.value) / 100
      })

    const grandTotal = Math.round(subtotalBeforePercent + percentageTotal)

    return {
      fixedTotal,
      multiplierTotal,
      percentageTotal: Math.round(percentageTotal),
      grandTotal,
    }
  }, [baseMealsCost, totalConsumedPortions, subcharges])

  // Handlers
  const handleAddCharge = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChargeName.trim() || !newChargeValue) return

    const num = Number(newChargeValue)
    if (isNaN(num) || num <= 0) return

    setSubcharges((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newChargeName.trim(),
        type: newChargeType,
        value: num,
      },
    ])

    setNewChargeName('')
    setNewChargeValue('')
    setIsAddingOpen(false)
  }

  const handleRemoveCharge = (id: string) => {
    setSubcharges((prev) => prev.filter((s) => s.id !== id))
  }

  const handleResetCharges = () => {
    setSubcharges([])
  }

  return (
    <div id="bill-estimator" className="space-y-4 pt-4 scroll-mt-20">
      {/* Banner Header */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-xs">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Interactive Bill Estimator
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                <Sparkles className="w-3 h-3 text-purple-500" />
                Live Forecast
              </span>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full font-mono">
                {monthLabel}
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Accurately sums all eaten meal prices and lets you simulate custom charges, rent factors, and utilities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {subcharges.length > 0 && (
            <button
              type="button"
              onClick={handleResetCharges}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Custom Charges</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left 7 Columns: Base Consumed Charges & Dynamic Builder */}
        <div className="lg:col-span-7 space-y-4">
          {/* Base Consumption Card */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Base Consumed Mess Bill
                </p>
                <h4 className="text-base font-bold text-foreground mt-0.5">
                  Logged Dining Meals ({totalConsumedPortions} portions taken)
                </h4>
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                Rs. {baseMealsCost.toLocaleString()}
              </p>
            </div>

            {/* Meal Category breakdown badges */}
            {Object.keys(mealTypeStats).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {Object.entries(mealTypeStats).map(([type, stat]) => (
                  <div
                    key={type}
                    className="p-3 rounded-xl bg-muted/40 border border-border/70 text-xs"
                  >
                    <span className="font-semibold text-muted-foreground block text-[11px] uppercase">
                      {type}
                    </span>
                    <div className="font-bold text-foreground font-mono mt-0.5">
                      Rs. {stat.total.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {stat.count} {stat.count === 1 ? 'meal' : 'meals'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Toggle Individual Eaten Meals Table */}
            {eatenMealsList.length > 0 && (
              <div className="pt-1 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setShowEatenBreakdown(!showEatenBreakdown)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                >
                  {showEatenBreakdown ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Hide Eaten Meals Breakdown</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>View All {eatenMealsList.length} Eaten Meals ({monthLabel})</span>
                    </>
                  )}
                </button>

                {showEatenBreakdown && (
                  <div className="mt-3 max-h-64 overflow-y-auto border border-border rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/70 sticky top-0 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
                        <tr>
                          <th className="p-2.5">Date</th>
                          <th className="p-2.5">Meal</th>
                          <th className="p-2.5 text-center">Portions</th>
                          <th className="p-2.5 text-right">Price</th>
                          <th className="p-2.5 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {eatenMealsList.map((item, idx) => (
                          <tr key={`${item.date}_${item.mealType}_${idx}`} className="hover:bg-muted/30">
                            <td className="p-2.5 font-mono text-muted-foreground">{item.date}</td>
                            <td className="p-2.5">
                              <span className="font-semibold text-foreground">{item.mealType}</span>
                              <span className="text-[10px] text-muted-foreground block">{item.name}</span>
                            </td>
                            <td className="p-2.5 text-center font-bold text-foreground">{item.count}</td>
                            <td className="p-2.5 text-right font-mono text-muted-foreground">Rs. {item.unitPrice}</td>
                            <td className="p-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              Rs. {item.totalPrice}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>
                Accurately calculated from the sum of all confirmed dining hall meal records for {monthLabel}.
              </span>
            </p>
          </div>

          {/* Dynamic Additional Charges Builder */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Additional Fees & Estimator Factors
                </h3>
                <p className="text-xs text-muted-foreground">
                  Add fixed fees, per-meal multipliers, or percentage charges
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingOpen(!isAddingOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingOpen ? 'Close Form' : 'Add Charge'}</span>
              </button>
            </div>

            {/* Add Charge Form Inline */}
            {isAddingOpen && (
              <form
                onSubmit={handleAddCharge}
                className="p-4 bg-muted/40 border border-purple-500/20 rounded-xl space-y-3 animate-in fade-in duration-200"
              >
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Charge Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room Rent, Maintenance Fee, Fine"
                    value={newChargeName}
                    onChange={(e) => setNewChargeName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-foreground"
                    autoFocus
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Calculation Type
                    </label>
                    <select
                      value={newChargeType}
                      onChange={(e) =>
                        setNewChargeType(
                          e.target.value as 'fixed' | 'multiplier' | 'percentage'
                        )
                      }
                      className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-foreground cursor-pointer"
                    >
                      <option value="fixed">Fixed Flat Fee (Rs.)</option>
                      <option value="multiplier">Per Meal Factor (Rs./portion)</option>
                      <option value="percentage">Percentage Fee (%)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Value Amount
                    </label>
                    <input
                      type="number"
                      placeholder={newChargeType === 'percentage' ? 'e.g. 5' : 'e.g. 500'}
                      min="0"
                      step="any"
                      value={newChargeValue}
                      onChange={(e) => setNewChargeValue(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono text-foreground"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer shadow-2xs"
                  >
                    Add to Estimator
                  </button>
                </div>
              </form>
            )}

            {/* Active Subcharges List */}
            <div className="space-y-2">
              {subcharges.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                  No additional charges configured. Click &quot;Add Charge&quot; to test your bill scenario.
                </div>
              ) : (
                subcharges.map((charge) => {
                  let calculatedDisplay = 0
                  if (charge.type === 'fixed') {
                    calculatedDisplay = charge.value
                  } else if (charge.type === 'multiplier') {
                    calculatedDisplay = charge.value * totalConsumedPortions
                  } else if (charge.type === 'percentage') {
                    calculatedDisplay = Math.round(
                      ((baseMealsCost + calculations.fixedTotal + calculations.multiplierTotal) *
                        charge.value) /
                        100
                    )
                  }

                  return (
                    <div
                      key={charge.id}
                      className="p-3 bg-muted/20 border border-border/70 rounded-xl flex items-center justify-between gap-3 group hover:border-purple-500/30 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveCharge(charge.id)}
                          className="p-1 text-muted-foreground hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Remove Charge"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">
                            {charge.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {charge.type === 'fixed' && `Fixed Flat Fee (+Rs. ${charge.value})`}
                            {charge.type === 'multiplier' &&
                              `Rs. ${charge.value} × ${totalConsumedPortions} meals`}
                            {charge.type === 'percentage' && `+${charge.value}% surcharge on subtotal`}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs font-bold text-foreground font-mono shrink-0">
                        + Rs. {calculatedDisplay.toLocaleString()}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Receipt Statement Summary Card */}
        <div className="lg:col-span-5">
          <div className="bg-card border border-border p-5 sm:p-6 rounded-2xl shadow-md space-y-4 relative overflow-hidden">
            {/* Ambient Purple Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Projected Statement
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                Live Preview
              </span>
            </div>

            {/* Statement Line Items */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Base Meals Cost ({totalConsumedPortions} eaten):</span>
                <span className="font-semibold text-foreground font-mono">
                  Rs. {baseMealsCost.toLocaleString()}
                </span>
              </div>

              {calculations.fixedTotal > 0 && (
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Fixed Charges & Rent:</span>
                  <span className="font-semibold text-foreground font-mono">
                    + Rs. {calculations.fixedTotal.toLocaleString()}
                  </span>
                </div>
              )}

              {calculations.multiplierTotal > 0 && (
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Portion Multipliers:</span>
                  <span className="font-semibold text-foreground font-mono">
                    + Rs. {calculations.multiplierTotal.toLocaleString()}
                  </span>
                </div>
              )}

              {calculations.percentageTotal > 0 && (
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Percentage Surcharges:</span>
                  <span className="font-semibold text-foreground font-mono">
                    + Rs. {calculations.percentageTotal.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="border-t border-dashed border-border/80 pt-3 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Estimated Total Dues:
                  </span>
                  <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                    Rs. {calculations.grandTotal.toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  * Final bill may vary depending on official management invoicing.
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl bg-muted/60 hover:bg-muted border border-border/80 text-foreground transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Estimation Statement</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
