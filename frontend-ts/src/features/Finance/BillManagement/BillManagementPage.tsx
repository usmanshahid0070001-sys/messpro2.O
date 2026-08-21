import React, { useState, useMemo, useDeferredValue } from 'react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import {
  useGetBills,
  type Bill,
} from '@/hooks/queries/useBillingQueries'
import {
  usePayBill,
  useUpdateBillCharges,
} from '@/hooks/mutations/useBillingMutations'
import { Skeleton } from '@/components/ui/skeleton'

// Modular Components
import BillManagementHeader, {
  type ViewMode,
  type StatusFilter,
} from './components/BillManagementHeader'
import BillManagementMetrics from './components/BillManagementMetrics'
import BillManagementTable from './components/BillManagementTable'
import BillManagementCards from './components/BillManagementCards'
import BillPaymentModal from './components/BillPaymentModal'
import BillDetailsModal from './components/BillDetailsModal'
import BillEditChargesModal from './components/BillEditChargesModal'

function getCurrentYearMonth(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export default function BillManagementPage() {
  // ── 1. View & Filter State ─────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>('current')
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentYearMonth)
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isExporting, setIsExporting] = useState(false)

  // ── 2. Modals State ───────────────────────────────────────────────────
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean
    bill: Bill | null
  }>({ isOpen: false, bill: null })

  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean
    bill: Bill | null
  }>({ isOpen: false, bill: null })

  const [editChargesModal, setEditChargesModal] = useState<{
    isOpen: boolean
    bill: Bill | null
  }>({ isOpen: false, bill: null })

  // ── 3. Queries & Mutations ─────────────────────────────────────────────
  const queryParams = useMemo(() => {
    return {
      demand: viewMode === 'current' ? ('current' as const) : null,
      month: viewMode === 'monthly' ? selectedMonth : null,
      status: statusFilter !== 'all' ? statusFilter : null,
    }
  }, [viewMode, selectedMonth, statusFilter])

  const {
    data: rawBills = [],
    isLoading,
    isFetching,
  } = useGetBills(queryParams)

  const payBillMutation = usePayBill()
  const updateChargesMutation = useUpdateBillCharges()

  // ── 4. Client Search & Derivations ────────────────────────────────────
  const filteredBills = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase()
    if (!query) return rawBills

    return rawBills.filter((b) => {
      const name = (b.studentId?.name || (b.isGuest ? 'Dining Guest' : '')).toLowerCase()
      const roll = (b.rollNumber || b.studentId?.id || '').toLowerCase()
      return name.includes(query) || roll.includes(query)
    })
  }, [rawBills, deferredSearchQuery])

  // Summaries
  const summaries = useMemo(() => {
    return filteredBills.reduce(
      (acc, curr) => {
        acc.totalRevenue += curr.total || 0
        acc.totalPaid += curr.paidBill || 0
        acc.totalRemaining += curr.remainingBill || 0
        if (curr.status === 'Paid') {
          acc.paidBillsCount += 1
        } else {
          acc.unpaidBillsCount += 1
        }
        return acc
      },
      {
        totalRevenue: 0,
        totalPaid: 0,
        totalRemaining: 0,
        paidBillsCount: 0,
        unpaidBillsCount: 0,
      }
    )
  }, [filteredBills])

  // Dynamic Custom Charge Columns from active bills
  const dynamicColumns = useMemo(() => {
    const set = new Set<string>()
    rawBills.forEach((b) => {
      b.customCharges?.forEach((c) => {
        if (c.name) set.add(c.name)
      })
    })
    return Array.from(set).map((name) => ({ key: name, label: name }))
  }, [rawBills])

  // ── 5. Payment & Edit Handlers ─────────────────────────────────────────
  const handleOpenPayment = (bill: Bill) => {
    setPaymentModal({ isOpen: true, bill })
  }

  const handleProcessPayment = (billId: string, amount: number) => {
    payBillMutation.mutate(
      { billId, amount },
      {
        onSuccess: () => {
          setPaymentModal({ isOpen: false, bill: null })
        },
      }
    )
  }

  const handleOpenEditCharges = (bill: Bill) => {
    setEditChargesModal({ isOpen: true, bill })
  }

  const handleSaveCharges = (
    billId: string,
    customCharges: Array<{
      name: string
      chargeType?: string
      value?: number
      target?: string
      calculatedAmount: number
    }>
  ) => {
    updateChargesMutation.mutate(
      { billId, customCharges },
      {
        onSuccess: () => {
          setEditChargesModal({ isOpen: false, bill: null })
        },
      }
    )
  }

  const handleOpenDetails = (bill: Bill) => {
    setDetailsModal({ isOpen: true, bill })
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
  }

  const hasActiveFilters = searchQuery.length > 0 || statusFilter !== 'all'

  // ── 6. Excel Export ────────────────────────────────────────────────────
  const handleExportExcel = () => {
    try {
      setIsExporting(true)
      const dataToExport = filteredBills.map((b) => {
        const row: Record<string, string | number> = {
          Name: b.studentId?.name || (b.isGuest ? 'Dining Guest' : 'Resident'),
          'Roll Number / ID': b.rollNumber || b.studentId?.id || 'N/A',
          Type: b.isGuest ? 'Guest' : 'Student Resident',
          'Billing Start': b.billingPeriod?.startDate || '',
          'Billing End': b.billingPeriod?.endDate || '',
          'Base Mess Bill': b.baseMessBill,
          'Previous Arrears': b.previousUnpaidArrears,
        }

        dynamicColumns.forEach((col) => {
          const charge = b.customCharges?.find((c) => c.name === col.key)
          row[col.label] = charge ? charge.calculatedAmount : 0
        })

        row['Total Bill'] = b.total
        row['Paid'] = b.paidBill
        row['Remaining Balance'] = b.remainingBill
        row['Status'] = b.status

        return row
      })

      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Bills')

      const dateSuffix =
        viewMode === 'monthly' ? selectedMonth : `Current_${new Date().toISOString().substring(0, 10)}`
      XLSX.writeFile(workbook, `Hostel_Bills_Ledger_${dateSuffix}.xlsx`)

      toast.success('Excel Export Complete', {
        description: `Exported ${dataToExport.length} billing rows successfully.`,
      })
    } catch (err: any) {
      toast.error('Export Failed', {
        description: err?.message || 'Could not generate Excel spreadsheet.',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-300">
      {/* 1. Header with View Toggles, Search, Filters & Export */}
      <BillManagementHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onExportExcel={handleExportExcel}
        isExporting={isExporting}
        totalBillsCount={filteredBills.length}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 2. KPI Metrics Bar */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : (
        <BillManagementMetrics
          totalRevenue={summaries.totalRevenue}
          totalPaid={summaries.totalPaid}
          totalRemaining={summaries.totalRemaining}
          totalBillsCount={filteredBills.length}
          paidBillsCount={summaries.paidBillsCount}
          unpaidBillsCount={summaries.unpaidBillsCount}
        />
      )}

      {/* 3. Bills Content (Desktop Table + Mobile Cards) */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : (
        <>
          {/* Desktop Table View (>= 1024px) */}
          <div className="hidden lg:block">
            <BillManagementTable
              bills={filteredBills}
              dynamicColumns={dynamicColumns}
              onOpenPayment={handleOpenPayment}
              onOpenEditCharges={handleOpenEditCharges}
              onOpenDetails={handleOpenDetails}
            />
          </div>

          {/* Mobile & Tablet Card View (< 1024px) */}
          <div className="lg:hidden">
            <BillManagementCards
              bills={filteredBills}
              onOpenPayment={handleOpenPayment}
              onOpenEditCharges={handleOpenEditCharges}
              onOpenDetails={handleOpenDetails}
            />
          </div>
        </>
      )}

      {/* 4. Modals */}
      <BillPaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, bill: null })}
        bill={paymentModal.bill}
        onProcessPayment={handleProcessPayment}
        isProcessing={payBillMutation.isPending}
      />

      <BillEditChargesModal
        isOpen={editChargesModal.isOpen}
        onClose={() => setEditChargesModal({ isOpen: false, bill: null })}
        bill={editChargesModal.bill}
        onSaveCharges={handleSaveCharges}
        isSaving={updateChargesMutation.isPending}
      />

      <BillDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, bill: null })}
        bill={detailsModal.bill}
        onOpenPayment={handleOpenPayment}
      />
    </div>
  )
}
