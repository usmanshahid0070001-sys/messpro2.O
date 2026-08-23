import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Calendar } from 'lucide-react'
import {
  useGetMealPricesForBilling,
  useGetBillingSettings,
  type BillFieldConfig,
} from '@/hooks/queries/useBillingQueries'
import {
  useUpdateBillingSettings,
  useGenerateBills,
  type BackendCustomChargePayload,
} from '@/hooks/mutations/useBillingMutations'
import { Skeleton } from '@/components/ui/skeleton'

// Modular Sub-Components
import BillGenHeader from './components/BillGenHeader'
import BillGenMetrics from './components/BillGenMetrics'
import MealRevenueReviewCard from './components/MealRevenueReviewCard'
import BillMethodsCard from './components/BillMethodsCard'
import BillGenEstimatePreview from './components/BillGenEstimatePreview'
import BillGenConfirmModal from './components/BillGenConfirmModal'

import { useSearchParams } from 'react-router-dom'

// ── Helper to format YYYY-MM-DD ──────────────────────────────────────────
function formatDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const DEFAULT_BILL_FIELDS: BillFieldConfig[] = [
  {
    id: 'default-mess',
    name: 'Mess Bill',
    type: 'meal_attendance',
    value: null,
    linkedFieldId: null,
    included: true,
  },
  {
    id: 'default-unpaid',
    name: 'Previous Unpaid Balance',
    type: 'previous_unpaid',
    value: null,
    linkedFieldId: null,
    included: true,
  },
]

export default function BillGenerationPage() {
  const [searchParams] = useSearchParams()
  const paramStart = searchParams.get('startDate') || ''
  const paramEnd = searchParams.get('endDate') || ''

  // ── Date Range State (Starts completely empty unless passed via URL) ───
  const [startDateInput, setStartDateInput] = useState<string>(paramStart)
  const [endDateInput, setEndDateInput] = useState<string>(paramEnd)

  useEffect(() => {
    if (paramStart && paramEnd) {
      setStartDateInput(paramStart)
      setEndDateInput(paramEnd)
    }
  }, [paramStart, paramEnd])

  const isDateRangeSelected = Boolean(startDateInput && endDateInput)

  // ── Queries & Mutations ────────────────────────────────────────────────
  const {
    data: fetchedMealRecords = [],
    isLoading: isMealsLoading,
  } = useGetMealPricesForBilling(startDateInput, endDateInput, isDateRangeSelected)

  const {
    data: settingsData,
  } = useGetBillingSettings()

  const updateSettingsMutation = useUpdateBillingSettings()
  const generateBillsMutation = useGenerateBills()

  // ── Bill Fields State & Snapshots ──────────────────────────────────────
  const [billFields, setBillFields] = useState<BillFieldConfig[]>(DEFAULT_BILL_FIELDS)
  const isInitialized = useRef(false)
  const savedSnapshot = useRef<string>(JSON.stringify(DEFAULT_BILL_FIELDS))
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  // Synchronize server customCharges when loaded from hostel settings
  useEffect(() => {
    if (settingsData?.customCharges && settingsData.customCharges.length > 0) {
      savedSnapshot.current = JSON.stringify(settingsData.customCharges)
      if (!isInitialized.current) {
        setBillFields(settingsData.customCharges)
        isInitialized.current = true
      }
    }
  }, [settingsData])

  const isSettingsDirty = useMemo(() => {
    return JSON.stringify(billFields) !== savedSnapshot.current
  }, [billFields])

  // ── Date Range Presets ─────────────────────────────────────────────────
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
  }

  // ── Derived Meal Statistics ────────────────────────────────────────────
  const messRevenue = useMemo(() => {
    return fetchedMealRecords.reduce((acc, g) => {
      return (
        acc +
        g.meals.reduce((sub, m) => {
          const price = m.mealInfo.price === '' ? 0 : Number(m.mealInfo.price)
          return sub + price * m.attendanceCount
        }, 0)
      )
    }, 0)
  }, [fetchedMealRecords])

  const totalAttendanceCount = useMemo(() => {
    return fetchedMealRecords.reduce((acc, g) => {
      return acc + g.meals.reduce((sub, m) => sub + m.attendanceCount, 0)
    }, 0)
  }, [fetchedMealRecords])

  // ── Dynamic Field Handlers & Math Engine ───────────────────────────────
  const addField = useCallback(() => {
    setBillFields((prev) => {
      if (prev.length >= 10) return prev
      return [
        ...prev,
        {
          id: Date.now().toString(),
          name: '',
          type: 'static',
          value: 0,
          linkedFieldId: null,
          included: true,
        },
      ]
    })
  }, [])

  const updateField = useCallback((id: string, key: keyof BillFieldConfig, value: any) => {
    setBillFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: value } : f))
    )
  }, [])

  const removeField = useCallback((id: string) => {
    setBillFields((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const calculateFieldValue = useCallback(
    (field: BillFieldConfig, visited = new Set<string>()): number => {
      if (field.included === false) return 0
      if (field.type === 'meal_attendance') {
        return messRevenue
      }
      if (field.type === 'static') {
        return Number(field.value) || 0
      }
      if (visited.has(field.id) || visited.size > 8) return 0
      visited.add(field.id)

      if (field.type === 'percentage') {
        const linked = billFields.find((f) => f.id === field.linkedFieldId)
        if (!linked) return 0
        const base = calculateFieldValue(linked, new Set(visited))
        return (base * (Number(field.value) || 0)) / 100
      }
      if (field.type === 'multiplier') {
        const linked = billFields.find((f) => f.id === field.linkedFieldId)
        if (!linked) return 0
        const base = calculateFieldValue(linked, new Set(visited))
        return base * (Number(field.value) || 0)
      }
      return 0
    },
    [billFields, messRevenue]
  )

  const totalBillAmount = useMemo(() => {
    return billFields.reduce((sum, field) => sum + calculateFieldValue(field), 0)
  }, [billFields, calculateFieldValue])

  const activeMethodsCount = useMemo(() => {
    return billFields.filter((f) => f.included !== false).length
  }, [billFields])

  // ── Save Settings Action ───────────────────────────────────────────────
  const handleSaveSettings = async () => {
    if (!isSettingsDirty) return
    try {
      await updateSettingsMutation.mutateAsync({
        customCharges: billFields,
        isDynamicBillingEnabled: true,
      })
      savedSnapshot.current = JSON.stringify(billFields)
    } catch {
      // Handled by toast in mutation
    }
  }

  // ── Generate Bills Execution ───────────────────────────────────────────
  const handleGenerateBills = async () => {
    try {
      // Auto-save settings if modified
      if (isSettingsDirty) {
        await handleSaveSettings()
      }

      // Map UI dynamic fields to backend schema
      const mappedCustomCharges: BackendCustomChargePayload[] = billFields
        .filter(
          (f) =>
            f.included !== false &&
            f.type !== 'meal_attendance' &&
            f.type !== 'previous_unpaid'
        )
        .map((f) => {
          let target: 'mess_bill' | 'unpaid_bill' | 'none' = 'none'
          if (f.linkedFieldId) {
            const linked = billFields.find((bf) => bf.id === f.linkedFieldId)
            if (linked?.type === 'meal_attendance') target = 'mess_bill'
            else if (linked?.type === 'previous_unpaid') target = 'unpaid_bill'
          }

          let chargeType: 'addition' | 'multiple' | 'percentage' = 'addition'
          if (f.type === 'percentage') chargeType = 'percentage'
          else if (f.type === 'multiplier') chargeType = 'multiple'

          return {
            name: f.name || 'Custom Charge',
            chargeType,
            value: Number(f.value) || 0,
            target,
          }
        })

      await generateBillsMutation.mutateAsync({
        billingPeriod: {
          startDate: startDateInput,
          endDate: endDateInput,
        },
        customCharges: mappedCustomCharges,
      })

      setIsConfirmModalOpen(false)
    } catch {
      // Handled by mutation error toast
    }
  }

  return (
    <div className="space-y-6 pb-28">
      {/* ── 1. Page Header & Date Range Controls ── */}
      <BillGenHeader
        startDateInput={startDateInput}
        endDateInput={endDateInput}
        onStartDateChange={setStartDateInput}
        onEndDateChange={setEndDateInput}
        onApplyPreset={handleApplyPreset}
        isDateRangeSelected={isDateRangeSelected}
        isSettingsDirty={isSettingsDirty}
        isSettingsSaving={updateSettingsMutation.isPending}
        isGenerating={generateBillsMutation.isPending}
        onSaveSettings={handleSaveSettings}
        onOpenConfirmModal={() => setIsConfirmModalOpen(true)}
      />

      {/* ── 2. Unselected Date Range State ── */}
      {!isDateRangeSelected && (
        <div className="p-12 text-center border border-dashed border-border/80 rounded-2xl bg-card flex flex-col items-center justify-center gap-4">
          <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Calendar className="h-8 w-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-base font-bold text-foreground">
              Select Billing Period to Load Records
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Choose a start and end date above (or click <strong className="text-foreground">"This Month"</strong>) to calculate meal attendance revenue and generate monthly vouchers.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleApplyPreset('thisMonth')}
              className="px-3.5 py-1.5 rounded-xl bg-muted border border-border text-xs font-semibold text-foreground hover:bg-muted/80 cursor-pointer"
            >
              Load Current Month
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('lastMonth')}
              className="px-3.5 py-1.5 rounded-xl bg-muted border border-border text-xs font-semibold text-foreground hover:bg-muted/80 cursor-pointer"
            >
              Load Last Month
            </button>
          </div>
        </div>
      )}

      {/* ── 3. Loaded Billing Workspace ── */}
      {isDateRangeSelected && (
        <div className="space-y-5">
          {/* Top KPI Metrics */}
          <BillGenMetrics
            messRevenue={messRevenue}
            totalAttendanceCount={totalAttendanceCount}
            activeMethodsCount={activeMethodsCount}
            estimatedTotalRevenue={totalBillAmount}
          />

          {/* Asymmetric Workspace Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* Left Column (7 cols): Bill Methods Builder */}
            <div className="xl:col-span-7 space-y-5 min-w-0">
              <BillMethodsCard
                billFields={billFields}
                messRevenue={messRevenue}
                onAddField={addField}
                onUpdateField={updateField}
                onRemoveField={removeField}
                calculateFieldValue={calculateFieldValue}
                totalBillAmount={totalBillAmount}
              />
            </div>

            {/* Right Column (5 cols, sticky on large screens): Meal Review & Sample Invoice Preview */}
            <div className="xl:col-span-5 space-y-5 xl:sticky xl:top-6 min-w-0">
              {/* Consumed Meals & Mess Revenue Review Card */}
              {isMealsLoading ? (
                <Skeleton className="h-44 w-full rounded-2xl" />
              ) : (
                <MealRevenueReviewCard
                  records={fetchedMealRecords}
                  totalAttendanceCount={totalAttendanceCount}
                  messRevenue={messRevenue}
                  startDate={startDateInput}
                  endDate={endDateInput}
                />
              )}

              {/* Sample Invoice Preview */}
              <BillGenEstimatePreview
                billFields={billFields}
                calculateFieldValue={calculateFieldValue}
                totalBillAmount={totalBillAmount}
                messRevenue={messRevenue}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Confirmation Modal ── */}
      <BillGenConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleGenerateBills}
        isGenerating={generateBillsMutation.isPending}
        startDate={startDateInput}
        endDate={endDateInput}
        messRevenue={messRevenue}
        totalAttendanceCount={totalAttendanceCount}
        billFields={billFields}
        calculateFieldValue={calculateFieldValue}
        totalBillAmount={totalBillAmount}
      />
    </div>
  )
}
