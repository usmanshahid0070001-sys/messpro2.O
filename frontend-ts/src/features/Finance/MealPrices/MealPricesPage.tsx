import { useState, useEffect, useMemo, useRef, useDeferredValue } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Sparkles, Utensils } from 'lucide-react'
import {
  useGetMealPricesForBilling,
  type MealPriceDayGroup,
} from '@/hooks/queries/useBillingQueries'
import { useUpdateMealPrices } from '@/hooks/mutations/useBillingMutations'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

// Extracted Sub-Components for modular architecture
import MealPricesHeader from './components/MealPricesHeader'
import MealPricesMetrics from './components/MealPricesMetrics'
import MealPricesToolbar, { type StatusFilterType } from './components/MealPricesToolbar'
import MealDayGroupCard from './components/MealDayGroupCard'
import MealPricesEmptyState from './components/MealPricesEmptyState'
import MealPricesSaveBar from './components/MealPricesSaveBar'

// ── Helper to format YYYY-MM-DD ──────────────────────────────────────────
function formatDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function MealPricesPage() {
  const [searchParams] = useSearchParams()
  const paramStart = searchParams.get('startDate') || ''
  const paramEnd = searchParams.get('endDate') || ''

  // ── Date Range State ───────────────────────────────────────────────────
  const [startDateInput, setStartDateInput] = useState<string>(() => paramStart)
  const [endDateInput, setEndDateInput] = useState<string>(() => paramEnd)
  const [activeDateRange, setActiveDateRange] = useState<{
    startDate: string | null
    endDate: string | null
  }>({
    startDate: paramStart || null,
    endDate: paramEnd || null,
  })

  // Synchronize when URL search params change (e.g. from Bill Generation)
  useEffect(() => {
    if (paramStart && paramEnd) {
      setStartDateInput(paramStart)
      setEndDateInput(paramEnd)
      setActiveDateRange({ startDate: paramStart, endDate: paramEnd })
    }
  }, [paramStart, paramEnd])

  // ── Query & Mutation ───────────────────────────────────────────────────
  const {
    data: fetchedRecords,
    isLoading,
    isFetching,
    refetch,
  } = useGetMealPricesForBilling(
    activeDateRange.startDate,
    activeDateRange.endDate,
    Boolean(activeDateRange.startDate && activeDateRange.endDate)
  )

  const updatePricesMutation = useUpdateMealPrices()

  // ── Local Editable Records & Baseline Snapshot ─────────────────────────
  const [records, setRecords] = useState<MealPriceDayGroup[]>([])
  const savedSnapshot = useRef<string>(JSON.stringify([]))
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all')
  const [editingTotalMap, setEditingTotalMap] = useState<Record<string, string>>({})

  // Synchronize local editable records with fresh server data
  useEffect(() => {
    if (fetchedRecords) {
      setRecords(fetchedRecords)
      savedSnapshot.current = JSON.stringify(fetchedRecords)
      setEditingTotalMap({})
    }
  }, [fetchedRecords])

  const isDirty = useMemo(() => {
    return JSON.stringify(records) !== savedSnapshot.current
  }, [records])

  // Count changed items
  const changedCount = useMemo(() => {
    if (!isDirty) return 0
    let count = 0
    try {
      const original: MealPriceDayGroup[] = JSON.parse(savedSnapshot.current)
      records.forEach((group) => {
        const origGroup = original.find((g) => g.date === group.date)
        if (!origGroup) return
        group.meals.forEach((meal) => {
          const origMeal = origGroup.meals.find((m) => m.id === meal.id)
          if (!origMeal) return
          if (
            meal.mealInfo.price !== origMeal.mealInfo.price ||
            meal.mealInfo.name !== origMeal.mealInfo.name
          ) {
            count++
          }
        })
      })
    } catch {
      return 0
    }
    return count
  }, [records, isDirty])

  // ── Date Range Quick Presets ───────────────────────────────────────────
  const handleApplyPreset = (preset: 'thisMonth' | 'lastMonth' | 'last14Days' | 'last30Days') => {
    const now = new Date()
    let start = new Date()
    let end = new Date()

    if (preset === 'thisMonth') {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    } else if (preset === 'lastMonth') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      end = new Date(now.getFullYear(), now.getMonth(), 0)
    } else if (preset === 'last14Days') {
      start = new Date(now)
      start.setDate(now.getDate() - 14)
      end = new Date(now)
    } else if (preset === 'last30Days') {
      start = new Date(now)
      start.setDate(now.getDate() - 30)
      end = new Date(now)
    }

    const sStr = formatDateString(start)
    const eStr = formatDateString(end)

    setStartDateInput(sStr)
    setEndDateInput(eStr)
    setActiveDateRange({ startDate: sStr, endDate: eStr })
  }

  const handleLoadRecords = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!startDateInput || !endDateInput) {
      toast.error('Please specify both start and end dates.')
      return
    }
    if (startDateInput > endDateInput) {
      toast.error('Start date cannot be after end date.')
      return
    }
    setActiveDateRange({ startDate: startDateInput, endDate: endDateInput })
  }

  // ── Cell Value Updaters ────────────────────────────────────────────────
  const updateMealCell = (
    date: string,
    mealId: string,
    patch: { price?: number | ''; name?: string }
  ) => {
    setRecords((prev) =>
      prev.map((group) =>
        group.date === date
          ? {
              ...group,
              meals: group.meals.map((meal) =>
                meal.id === mealId
                  ? { ...meal, mealInfo: { ...meal.mealInfo, ...patch } }
                  : meal
              ),
            }
          : group
      )
    )
  }

  const handlePriceChange = (date: string, mealId: string, value: string) => {
    const parsed = value === '' ? '' : Math.max(0, Number(value))
    updateMealCell(date, mealId, { price: parsed })
  }

  const handleNameChange = (date: string, mealId: string, newName: string) => {
    updateMealCell(date, mealId, { name: newName })
  }

  /**
   * Recalculate price when total is edited:
   * Total = Price * Attendance => Price = Math.ceil(Total / Attendance)
   */
  const handleTotalChange = (
    date: string,
    mealId: string,
    newTotalStr: string,
    attendanceCount: number
  ) => {
    if (newTotalStr === '') {
      handlePriceChange(date, mealId, '')
      return
    }
    const total = parseFloat(newTotalStr)
    if (isNaN(total) || total < 0) return

    let unitPrice = attendanceCount > 0 ? total / attendanceCount : total
    unitPrice = Math.ceil(unitPrice)

    handlePriceChange(date, mealId, unitPrice.toString())
  }

  const handleTotalBlur = (mealId: string) => {
    setEditingTotalMap((prev) => {
      const next = { ...prev }
      delete next[mealId]
      return next
    })
  }

  const handleSetEditingTotal = (mealId: string, val: string) => {
    setEditingTotalMap((prev) => ({
      ...prev,
      [mealId]: val,
    }))
  }

  // ── Save & Discard Actions ─────────────────────────────────────────────
  const handleSave = async () => {
    if (!isDirty) return

    try {
      const original: MealPriceDayGroup[] = JSON.parse(savedSnapshot.current)
      const updates: Array<{
        date: string
        mealType: string
        oldName: string
        newName: string
        newPrice: number
      }> = []

      records.forEach((group) => {
        const origGroup = original.find((g) => g.date === group.date)
        if (!origGroup) return

        group.meals.forEach((meal) => {
          const origMeal = origGroup.meals.find((m) => m.id === meal.id)
          if (!origMeal) return

          const currentPrice = meal.mealInfo.price === '' ? 0 : Number(meal.mealInfo.price)
          const origPrice = origMeal.mealInfo.price === '' ? 0 : Number(origMeal.mealInfo.price)

          if (currentPrice !== origPrice || meal.mealInfo.name !== origMeal.mealInfo.name) {
            updates.push({
              date: group.date,
              mealType: meal.mealType,
              oldName: origMeal.mealInfo.name,
              newName: meal.mealInfo.name,
              newPrice: currentPrice,
            })
          }
        })
      })

      if (updates.length === 0) {
        toast.info('No price changes detected.')
        return
      }

      await updatePricesMutation.mutateAsync(updates)
      savedSnapshot.current = JSON.stringify(records)
      setEditingTotalMap({})
    } catch {
      // Error handled by mutation toast
    }
  }

  const handleDiscard = async () => {
    try {
      const original = JSON.parse(savedSnapshot.current)
      setRecords(original)
      setEditingTotalMap({})
      await refetch()
      toast.info('Changes discarded and records refreshed.')
    } catch {
      await refetch()
    }
  }

  // ── Derived Filtered Records & Key Statistics ──────────────────────────
  const filteredRecords = useMemo(() => {
    let list = records

    // 1. Text Search Filter
    if (deferredSearchQuery.trim()) {
      const q = deferredSearchQuery.toLowerCase()
      list = list
        .map((group) => ({
          ...group,
          meals: group.meals.filter(
            (m) =>
              m.mealInfo.name.toLowerCase().includes(q) ||
              m.mealType.toLowerCase().includes(q)
          ),
        }))
        .filter((group) => group.meals.length > 0)
    }

    // 2. Status Filter
    if (statusFilter === 'pending') {
      list = list.filter((group) =>
        group.meals.some(
          (m) => m.mealInfo.price === '' || Number(m.mealInfo.price) === 0
        )
      )
    } else if (statusFilter === 'completed') {
      list = list.filter((group) =>
        group.meals.every(
          (m) => m.mealInfo.price !== '' && Number(m.mealInfo.price) > 0
        )
      )
    }

    return list
  }, [records, deferredSearchQuery, statusFilter])

  // Statistics derived across all loaded records
  const totalMealsCount = useMemo(() => {
    return records.reduce((acc, g) => acc + g.meals.length, 0)
  }, [records])

  const totalAttendanceCount = useMemo(() => {
    return records.reduce(
      (acc, g) => acc + g.meals.reduce((sub, m) => sub + m.attendanceCount, 0),
      0
    )
  }, [records])

  const grandTotalRevenue = useMemo(() => {
    return records.reduce((acc, g) => {
      return (
        acc +
        g.meals.reduce((sub, m) => {
          const price = m.mealInfo.price === '' ? 0 : Number(m.mealInfo.price)
          return sub + price * m.attendanceCount
        }, 0)
      )
    }, 0)
  }, [records])

  const averageMealPrice = useMemo(() => {
    if (totalAttendanceCount === 0) return 0
    return grandTotalRevenue / totalAttendanceCount
  }, [grandTotalRevenue, totalAttendanceCount])

  // ── Excel (.xlsx) Export ───────────────────────────────────────────────
  const handleExportExcel = async () => {
    if (records.length === 0) {
      toast.error('No records to export.')
      return
    }

    try {
      const XLSX = await import('xlsx')

      const excelData: Array<Record<string, any>> = []

      records.forEach((g) => {
        g.meals.forEach((m) => {
          const price = m.mealInfo.price === '' ? 0 : Number(m.mealInfo.price)
          const total = price * m.attendanceCount
          excelData.push({
            'Date': g.date,
            'Meal Slot': m.mealType,
            'Dish Name': m.mealInfo.name,
            'Attendance Portions': m.attendanceCount,
            'Unit Price (Rs)': price,
            'Meal Total (Rs)': total,
          })
        })
      })

      // Grand totals summary row
      excelData.push({
        'Date': 'TOTALS / OVERVIEW',
        'Meal Slot': '',
        'Dish Name': '',
        'Attendance Portions': totalAttendanceCount,
        'Unit Price (Rs)': `Avg: ${averageMealPrice.toFixed(2)}`,
        'Meal Total (Rs)': grandTotalRevenue,
      })

      const worksheet = XLSX.utils.json_to_sheet(excelData)

      // Set clean column widths for Excel
      worksheet['!cols'] = [
        { wch: 14 }, // Date
        { wch: 14 }, // Meal Slot
        { wch: 24 }, // Dish Name
        { wch: 20 }, // Attendance Portions
        { wch: 16 }, // Unit Price (Rs)
        { wch: 16 }, // Meal Total (Rs)
      ]

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Meal Prices')

      const fileName = `Meal_Prices_${activeDateRange.startDate || 'all'}_to_${activeDateRange.endDate || 'all'}.xlsx`
      XLSX.writeFile(workbook, fileName)
      toast.success('Exported meal pricing report to Excel (.xlsx)')
    } catch (err) {
      toast.error('Failed to export Excel report')
      console.error(err)
    }
  }

  const isRangeSelected = Boolean(activeDateRange.startDate && activeDateRange.endDate)

  return (
    <div className="space-y-6 pb-28">
      {/* ── 1. Page Header & Date Range Controls ── */}
      <MealPricesHeader
        startDateInput={startDateInput}
        endDateInput={endDateInput}
        onStartDateChange={setStartDateInput}
        onEndDateChange={setEndDateInput}
        onApplyPreset={handleApplyPreset}
        onLoadRecords={handleLoadRecords}
        isLoading={isLoading}
        isFetching={isFetching}
      />

      {/* ── 2. Unselected / Empty Date Range State ── */}
      {!isRangeSelected && (
        <MealPricesEmptyState
          isRangeSelected={false}
          onApplyPreset={handleApplyPreset}
        />
      )}

      {/* ── 3. Loaded Content Area ── */}
      {isRangeSelected && (
        <div className="space-y-5">
          {/* KPI Statistic Figures (AGENTS.md Semantic Colors & Scale) */}
          <MealPricesMetrics
            grandTotalRevenue={grandTotalRevenue}
            totalAttendanceCount={totalAttendanceCount}
            averageMealPrice={averageMealPrice}
            totalMealsCount={totalMealsCount}
            daysCount={records.length}
          />

          {/* Math Engine Hint Notice */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-foreground flex items-start gap-3 shadow-xs">
            <div className="p-1.5 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <span className="font-bold text-foreground">Smart Math Recalculation Engine:</span>
              <p className="text-muted-foreground leading-relaxed">
                You can adjust either the <strong className="text-foreground">Unit Price</strong> or the aggregate <strong className="text-foreground">Meal Total</strong> expenditure. Entering a total will automatically compute <span className="font-mono font-semibold text-foreground">Price = ⌈Total / Attendance⌉</span> (e.g., Rs. 5,500 total / 60 portions = 91.6 → Rs. 92/portion).
              </p>
            </div>
          </div>

          {/* Search, Filter & Export Toolbar */}
          <MealPricesToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onExportExcel={handleExportExcel}
            totalCount={records.length}
            filteredCount={filteredRecords.length}
          />

          {/* Day Group Tables */}
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <MealPricesEmptyState
              isRangeSelected={true}
              onApplyPreset={handleApplyPreset}
            />
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((group) => (
                <MealDayGroupCard
                  key={group.date}
                  group={group}
                  editingTotalMap={editingTotalMap}
                  onNameChange={handleNameChange}
                  onPriceChange={handlePriceChange}
                  onTotalChange={handleTotalChange}
                  onTotalBlur={handleTotalBlur}
                  onSetEditingTotal={handleSetEditingTotal}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 4. Sticky Floating Save & Discard Bar ── */}
      <MealPricesSaveBar
        isDirty={isDirty}
        changedCount={changedCount}
        isPending={updatePricesMutation.isPending}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    </div>
  )
}
