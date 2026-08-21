import React, { useState, useMemo } from 'react'
import {
  useGetBills,
  type Bill,
} from '@/hooks/queries/useBillingQueries'
import { Skeleton } from '@/components/ui/skeleton'
import { Receipt, FileText, Sparkles } from 'lucide-react'

// Modular Subcomponents
import MyBillsHeader, {
  type StudentBillViewMode,
  type StudentBillStatusFilter,
} from './components/MyBillsHeader'
import MyBillCard from './components/MyBillCard'
import MyBillInvoiceModal from './components/MyBillInvoiceModal'

function getCurrentYearMonth(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export default function MyBillsPage() {
  // ── 1. State ─────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<StudentBillViewMode>('current')
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentYearMonth)
  const [statusFilter, setStatusFilter] = useState<StudentBillStatusFilter>('all')
  const [selectedInvoice, setSelectedInvoice] = useState<Bill | null>(null)

  // ── 2. Query ─────────────────────────────────────────────────────────
  const queryParams = useMemo(() => {
    return {
      demand: viewMode === 'current' ? ('current' as const) : null,
      month: viewMode === 'monthly' ? selectedMonth : null,
      status: statusFilter !== 'all' ? statusFilter : null,
    }
  }, [viewMode, selectedMonth, statusFilter])

  const { data: bills = [], isLoading } = useGetBills(queryParams)

  const handleResetFilters = () => {
    setStatusFilter('all')
  }

  const hasActiveFilters = statusFilter !== 'all'

  return (
    <div className="space-y-5 pb-16 animate-in fade-in duration-300">
      {/* 1. Header with View Toggle, Month Picker & Status Filter */}
      <MyBillsHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalBillsCount={bills.length}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 2. Bills List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      ) : bills.length === 0 ? (
        <div className="bg-card border border-border/80 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400 mb-3 shadow-2xs">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No Billing Invoices Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {viewMode === 'current'
              ? 'You do not have any generated bills for the current billing cycle.'
              : `No invoices recorded for ${selectedMonth}. Try selecting a different month.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bills.map((bill) => (
            <MyBillCard
              key={bill._id}
              bill={bill}
              onOpenInvoice={(b) => setSelectedInvoice(b)}
            />
          ))}
        </div>
      )}

      {/* 3. Invoice Receipt Modal */}
      <MyBillInvoiceModal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        bill={selectedInvoice}
      />
    </div>
  )
}
