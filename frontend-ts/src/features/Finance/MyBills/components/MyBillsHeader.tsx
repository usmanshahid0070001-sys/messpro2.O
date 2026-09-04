import React from 'react'
import {
  FileText,
  Calendar,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export type StudentBillViewMode = 'current' | 'monthly'
export type StudentBillStatusFilter = 'all' | 'Unpaid' | 'Paid' | 'Adjusted in Balance'

interface MyBillsHeaderProps {
  viewMode: StudentBillViewMode
  onViewModeChange: (mode: StudentBillViewMode) => void
  selectedMonth: string
  onMonthChange: (month: string) => void
  statusFilter: StudentBillStatusFilter
  onStatusFilterChange: (status: StudentBillStatusFilter) => void
  totalBillsCount: number
  onResetFilters: () => void
  hasActiveFilters: boolean
}

const STATUS_LABELS: Record<StudentBillStatusFilter, { label: string; dotColor: string }> = {
  all: { label: 'All Invoices', dotColor: 'bg-muted-foreground' },
  Unpaid: { label: 'Unpaid Dues', dotColor: 'bg-amber-500' },
  Paid: { label: 'Fully Settled', dotColor: 'bg-emerald-500' },
  'Adjusted in Balance': { label: 'Adjusted in Balance', dotColor: 'bg-slate-400' },
}

export default function MyBillsHeader({
  viewMode,
  onViewModeChange,
  selectedMonth,
  onMonthChange,
  statusFilter,
  onStatusFilterChange,
  totalBillsCount,
  onResetFilters,
  hasActiveFilters,
}: MyBillsHeaderProps) {
  return (
    <div className="space-y-4">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                My Hostel Dues & Invoices
              </h1>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {totalBillsCount} {totalBillsCount === 1 ? 'Invoice' : 'Invoices'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Review your monthly hostel dues, itemized meal charges, and payment verification receipts.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & View Mode Controls Bar */}
      <div className="bg-card border border-border p-3 sm:p-4 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left Group: View Mode Toggle (Current Cycle vs Monthly Archive) */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border/60 shadow-2xs">
              <button
                type="button"
                onClick={() => onViewModeChange('current')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'current'
                    ? 'bg-card text-purple-600 dark:text-purple-400 shadow-xs border border-border/80'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>Current Cycle</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </button>

              <button
                type="button"
                onClick={() => onViewModeChange('monthly')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'monthly'
                    ? 'bg-card text-purple-600 dark:text-purple-400 shadow-xs border border-border/80'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Monthly Archive</span>
              </button>
            </div>

            {/* Month Picker (When monthly archive mode is active) */}
            {viewMode === 'monthly' && (
              <div className="flex items-center gap-1.5 bg-muted/40 border border-border/80 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium shadow-2xs">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => onMonthChange(e.target.value)}
                  className="bg-transparent text-foreground font-semibold focus:outline-none cursor-pointer text-xs sm:text-sm"
                />
              </div>
            )}
          </div>

          {/* Right Group: Status Filter & Reset */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-between gap-2 px-3.5 py-1.5 rounded-xl bg-muted/40 border border-border/80 text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer min-w-[140px]"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${STATUS_LABELS[statusFilter].dotColor}`}
                    />
                    <span className="truncate">{STATUS_LABELS[statusFilter].label}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                  Filter by Payment Status
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={(val) => onStatusFilterChange(val as StudentBillStatusFilter)}
                >
                  <DropdownMenuRadioItem value="all" className="text-xs flex items-center gap-2 cursor-pointer">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground shrink-0" />
                    <span>All Invoices</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Unpaid" className="text-xs flex items-center gap-2 cursor-pointer">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span>Unpaid Dues</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Paid" className="text-xs flex items-center gap-2 cursor-pointer">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>Fully Settled</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="Adjusted in Balance"
                    className="text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                    <span>Adjusted in Balance</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/80 shadow-2xs cursor-pointer"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
