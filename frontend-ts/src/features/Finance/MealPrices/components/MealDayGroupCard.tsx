import React, { memo } from 'react'
import {
  Calendar,
  Users,
  Utensils,
  Sunrise,
  Sun,
  Moon,
  Coffee,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import type { MealPriceDayGroup } from '@/hooks/queries/useBillingQueries'
import { Input } from '@/components/ui/input'

// ── Theme / Visual Helper for Meal Slots ───────────────────────────────────
const getMealSlotVisuals = (slotName: string) => {
  const norm = slotName.toLowerCase()
  if (norm.includes('break') || norm.includes('morn')) {
    return {
      icon: Sunrise,
      badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
    }
  }
  if (norm.includes('lunch') || norm.includes('noon')) {
    return {
      icon: Sun,
      badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25',
    }
  }
  if (norm.includes('dinner') || norm.includes('night') || norm.includes('supper')) {
    return {
      icon: Moon,
      badge: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25',
    }
  }
  if (norm.includes('tea') || norm.includes('snack')) {
    return {
      icon: Coffee,
      badge: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25',
    }
  }
  return {
    icon: Utensils,
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
  }
}

interface MealDayGroupCardProps {
  group: MealPriceDayGroup
  editingTotalMap: Record<string, string>
  onNameChange: (date: string, mealId: string, newName: string) => void
  onPriceChange: (date: string, mealId: string, newPriceStr: string) => void
  onTotalChange: (
    date: string,
    mealId: string,
    newTotalStr: string,
    attendanceCount: number
  ) => void
  onTotalBlur: (mealId: string) => void
  onSetEditingTotal: (mealId: string, val: string) => void
}

function MealDayGroupCard({
  group,
  editingTotalMap,
  onNameChange,
  onPriceChange,
  onTotalChange,
  onTotalBlur,
  onSetEditingTotal,
}: MealDayGroupCardProps) {
  const dayDateObj = new Date(group.date)
  const formattedDate = dayDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const dayTotal = group.meals.reduce((acc, m) => {
    const p = m.mealInfo.price === '' ? 0 : Number(m.mealInfo.price)
    return acc + p * m.attendanceCount
  }, 0)

  const dayAttendance = group.meals.reduce(
    (acc, m) => acc + m.attendanceCount,
    0
  )

  const allPriced = group.meals.every(
    (m) => m.mealInfo.price !== '' && Number(m.mealInfo.price) > 0
  )

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs transition-all hover:border-border min-w-0">
      {/* Group Header */}
      <div className="px-4 py-3 bg-muted/40 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
          <span className="text-sm font-bold text-foreground">
            {formattedDate}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              allPriced
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25'
            }`}
          >
            {allPriced ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                All Priced
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                Pending Price
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3.5 text-xs">
          <span className="text-muted-foreground font-medium">
            Portions: <strong className="text-foreground">{dayAttendance}</strong>
          </span>
          <span className="text-muted-foreground font-medium">
            Day Total:{' '}
            <strong className="text-purple-600 dark:text-purple-400 font-mono font-bold">
              Rs. {dayTotal.toLocaleString('en-PK')}
            </strong>
          </span>
        </div>
      </div>

      {/* Meals Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-muted/15 border-b border-border/60 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
              <th className="text-left py-2.5 px-4 w-28">Slot</th>
              <th className="text-left py-2.5 px-3 min-w-[180px]">Dish / Meal Name</th>
              <th className="text-center py-2.5 px-3 w-28">Attendance</th>
              <th className="text-right py-2.5 px-3 w-36">Unit Price (Rs)</th>
              <th className="text-right py-2.5 px-3 w-36">Meal Total (Rs)</th>
              <th className="text-right py-2.5 px-4 w-28">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {group.meals.map((meal) => {
              const visuals = getMealSlotVisuals(meal.mealType)
              const SlotIcon = visuals.icon
              const priceNum =
                meal.mealInfo.price === '' ? 0 : Number(meal.mealInfo.price)
              const calculatedTotal = priceNum * meal.attendanceCount

              const currentEditingTotal =
                editingTotalMap[meal.id] ??
                (calculatedTotal > 0 ? calculatedTotal.toString() : '')

              return (
                <tr
                  key={meal.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {/* Slot Badge */}
                  <td className="py-2.5 px-4 align-middle">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${visuals.badge}`}
                    >
                      <SlotIcon className="h-3 w-3" />
                      {meal.mealType}
                    </span>
                  </td>

                  {/* Dish Name Input */}
                  <td className="py-2.5 px-3 align-middle">
                    <Input
                      type="text"
                      value={meal.mealInfo.name}
                      onChange={(e) =>
                        onNameChange(group.date, meal.id, e.target.value)
                      }
                      placeholder="e.g. Chicken Biryani"
                      className="h-8 text-xs font-semibold bg-background rounded-lg border-border/70 focus:border-purple-500"
                    />
                  </td>

                  {/* Attendance Count */}
                  <td className="py-2.5 px-3 text-center align-middle">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold font-mono text-xs border border-blue-500/20">
                      <Users className="h-3 w-3" />
                      {meal.attendanceCount}
                    </span>
                  </td>

                  {/* Unit Price Input */}
                  <td className="py-2.5 px-3 text-right align-middle">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px] font-medium pointer-events-none select-none">
                        Rs.
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={meal.mealInfo.price}
                        onChange={(e) =>
                          onPriceChange(group.date, meal.id, e.target.value)
                        }
                        placeholder="0"
                        className="h-8 pl-8 pr-2 text-right font-mono font-bold text-xs bg-background rounded-lg border-border/70 focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </td>

                  {/* Meal Total (Smart Math Recalculation Input) */}
                  <td className="py-2.5 px-3 text-right align-middle">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-purple-600/80 dark:text-purple-400/80 text-[11px] font-medium pointer-events-none select-none">
                        Rs.
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={currentEditingTotal}
                        onChange={(e) => {
                          const val = e.target.value
                          onSetEditingTotal(meal.id, val)
                          onTotalChange(
                            group.date,
                            meal.id,
                            val,
                            meal.attendanceCount
                          )
                        }}
                        onBlur={() => onTotalBlur(meal.id)}
                        placeholder="0"
                        className="h-8 pl-8 pr-2 text-right font-mono font-bold text-xs bg-background rounded-lg border-border/70 text-purple-700 dark:text-purple-300 focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        title="Enter aggregate expenditure to auto-recalculate unit price: ⌈Total / Attendance⌉"
                      />
                    </div>
                  </td>

                  {/* Row Subtotal */}
                  <td className="py-2.5 px-4 text-right align-middle">
                    <span className="font-mono font-bold text-foreground text-xs">
                      Rs. {calculatedTotal.toLocaleString('en-PK')}
                    </span>
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

export default memo(MealDayGroupCard)
