import React, { useState } from 'react'
import {
  Utensils,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Users,
  TrendingUp,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { MealPriceDayGroup } from '@/hooks/queries/useBillingQueries'
import { Button } from '@/components/ui/button'

interface MealRevenueReviewCardProps {
  records: MealPriceDayGroup[]
  totalAttendanceCount: number
  messRevenue: number
  startDate: string
  endDate: string
}

function MealRevenueReviewCard({
  records,
  totalAttendanceCount,
  messRevenue,
  startDate,
  endDate,
}: MealRevenueReviewCardProps) {
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(false)

  const avgPrice = totalAttendanceCount > 0 ? messRevenue / totalAttendanceCount : 0

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs transition-all min-w-0">
      {/* ── 1. Card Header ── */}
      <div className="p-4 sm:p-5 border-b border-border bg-muted/20 space-y-3">
        {/* Title & Icon */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <Utensils className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                  Meal Consumption
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 whitespace-nowrap shrink-0">
                  {records.length} {records.length === 1 ? 'Day' : 'Days'} Recorded
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                Verified dining attendance calculating base mess charges.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (startDate && endDate) {
                navigate(
                  `/app/finance/meal-prices?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
                )
              } else {
                navigate('/app/finance/meal-prices')
              }
            }}
            className="h-8 px-3 text-xs font-semibold rounded-xl border-border hover:bg-muted cursor-pointer shadow-xs whitespace-nowrap"
            title="Open comprehensive meal rate editor for this date range"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>Edit Rates</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 px-2.5 text-xs font-semibold rounded-xl hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground whitespace-nowrap"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5 mr-1" />
                <span>Hide Table</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5 mr-1" />
                <span>Review Details</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── 2. Clean Key-Value Metrics Stack (No awkward wrapping!) ── */}
      <div className="p-4 sm:p-5 space-y-2.5 bg-card text-xs">
        {/* Row 1: Total Portions */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/70">
          <span className="text-muted-foreground font-medium flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span>Total Portions Eaten:</span>
          </span>
          <span className="font-mono font-bold text-foreground whitespace-nowrap">
            {totalAttendanceCount.toLocaleString('en-PK')} meals
          </span>
        </div>

        {/* Row 2: Weighted Average Rate */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/70">
          <span className="text-muted-foreground font-medium flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Weighted Average:</span>
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
            Rs. {avgPrice.toFixed(1)} / meal
          </span>
        </div>

        {/* Row 3: Base Mess Revenue */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/20">
          <span className="text-purple-900 dark:text-purple-200 font-semibold flex items-center gap-2">
            <Utensils className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>Base Mess Revenue:</span>
          </span>
          <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-sm whitespace-nowrap">
            Rs. {Math.round(messRevenue).toLocaleString('en-PK')}
          </span>
        </div>
      </div>

      {/* ── 3. Expanded Table Breakdown ── */}
      {isExpanded && (
        <div className="p-4 sm:p-5 pt-0 space-y-3">
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs border-collapse min-w-[480px]">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                  <th className="text-left py-2 px-3">Date</th>
                  <th className="text-left py-2 px-3">Slot</th>
                  <th className="text-left py-2 px-3">Dish Name</th>
                  <th className="text-center py-2 px-3">Attendance</th>
                  <th className="text-right py-2 px-3">Rate</th>
                  <th className="text-right py-2 px-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {records.flatMap((group) =>
                  group.meals.map((m) => {
                    const price = m.mealInfo.price === '' ? 0 : Number(m.mealInfo.price)
                    const total = price * m.attendanceCount
                    return (
                      <tr key={m.id} className="hover:bg-muted/20">
                        <td className="py-2 px-3 font-medium text-foreground whitespace-nowrap">
                          {group.date}
                        </td>
                        <td className="py-2 px-3 font-semibold text-muted-foreground whitespace-nowrap">
                          {m.mealType}
                        </td>
                        <td className="py-2 px-3 font-bold text-foreground">
                          {m.mealInfo.name}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 font-mono font-bold whitespace-nowrap">
                            {m.attendanceCount}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-muted-foreground whitespace-nowrap">
                          Rs. {price}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-foreground whitespace-nowrap">
                          Rs. {total.toLocaleString('en-PK')}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(MealRevenueReviewCard)
