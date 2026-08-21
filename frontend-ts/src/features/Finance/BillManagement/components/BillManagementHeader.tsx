import React from 'react'
import {
  FileText,
  Search,
  Download,
  Calendar,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  PlusCircle,
  ArrowUpDown,
  ChevronDown,
  Check,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export type ViewMode = 'current' | 'monthly'
export type StatusFilter = 'all' | 'Unpaid' | 'Paid' | 'Adjusted in Balance'
export type SortOrder =
  | 'name-asc'
  | 'name-desc'
  | 'roll-asc'
  | 'total-desc'
  | 'total-asc'
  | 'remaining-desc'

interface BillManagementHeaderProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  selectedMonth: string
  onMonthChange: (month: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: StatusFilter
  onStatusFilterChange: (status: StatusFilter) => void
  sortOrder: SortOrder
  onSortOrderChange: (sort: SortOrder) => void
  onExportExcel: () => void
  isExporting?: boolean
  totalBillsCount: number
  onResetFilters: () => void
  hasActiveFilters: boolean
}

const STATUS_LABELS: Record<StatusFilter, { label: string; dotColor: string }> = {
  all: { label: 'All Statuses', dotColor: 'bg-muted-foreground' },
  Unpaid: { label: 'Unpaid / Arrears', dotColor: 'bg-amber-500' },
  Paid: { label: 'Fully Paid', dotColor: 'bg-emerald-500' },
  'Adjusted in Balance': { label: 'Adjusted in Balance', dotColor: 'bg-slate-400' },
}

const SORT_LABELS: Record<SortOrder, string> = {
  'name-asc': 'Name (A → Z)',
  'name-desc': 'Name (Z → A)',
  'roll-asc': 'Roll Number',
  'total-desc': 'Highest Total',
  'total-asc': 'Lowest Total',
  'remaining-desc': 'Highest Remaining',
}

export default function BillManagementHeader({
  viewMode,
  onViewModeChange,
  selectedMonth,
  onMonthChange,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortOrder,
  onSortOrderChange,
  onExportExcel,
  isExporting = false,
  totalBillsCount,
  onResetFilters,
  hasActiveFilters,
}: BillManagementHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Top Banner: Title & Primary CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Manage Hostel Dues
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                <Sparkles className="w-3 h-3 text-purple-500" />
                Finance & Dues
              </span>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                {totalBillsCount} {totalBillsCount === 1 ? 'Bill' : 'Bills'}
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Review generated student bills, process full or partial dues payments, and export accounting ledgers.
            </p>
          </div>
        </div>

        {/* Action Buttons: New Generation Shortcut & Export */}
        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
          <Link
            to="/app/finance/generate-bills"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-medium rounded-xl border border-purple-500/30 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Generate Bills</span>
          </Link>

          <button
            type="button"
            onClick={onExportExcel}
            disabled={isExporting || totalBillsCount === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-medium rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export Excel'}</span>
          </button>
        </div>
      </div>

      {/* Filter & View Mode Controls Bar */}
      <div className="bg-card border border-border p-3 sm:p-4 rounded-2xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left Group: View Mode Toggle Pill & Month Picker */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border/60">
              <button
                type="button"
                onClick={() => onViewModeChange('current')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
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
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
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

          {/* Right Group: Search, Status Dropdown, Sort Dropdown & Reset */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 flex-1 lg:flex-initial lg:justify-end">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial sm:min-w-[220px]">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search resident or roll..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-muted/40 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-foreground placeholder:text-muted-foreground shadow-2xs"
              />
            </div>

            {/* 1. Shadcn Status Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80 text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer min-w-[130px]"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_LABELS[statusFilter].dotColor}`} />
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
                  onValueChange={(val) => onStatusFilterChange(val as StatusFilter)}
                >
                  <DropdownMenuRadioItem value="all" className="text-xs flex items-center gap-2 cursor-pointer">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground shrink-0" />
                    <span>All Statuses</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Unpaid" className="text-xs flex items-center gap-2 cursor-pointer">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span>Unpaid / Arrears</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Paid" className="text-xs flex items-center gap-2 cursor-pointer">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>Fully Paid</span>
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

            {/* 2. Shadcn Sort Order Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80 text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer min-w-[135px]"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <ArrowUpDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="truncate">{SORT_LABELS[sortOrder]}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                  Sort Ledger Records
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={sortOrder}
                  onValueChange={(val) => onSortOrderChange(val as SortOrder)}
                >
                  <DropdownMenuRadioItem value="name-asc" className="text-xs cursor-pointer">
                    Name (A → Z)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name-desc" className="text-xs cursor-pointer">
                    Name (Z → A)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="roll-asc" className="text-xs cursor-pointer">
                    Roll Number
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="total-desc" className="text-xs cursor-pointer">
                    Highest Total Bill
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="total-asc" className="text-xs cursor-pointer">
                    Lowest Total Bill
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="remaining-desc" className="text-xs cursor-pointer">
                    Highest Remaining Dues
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Reset Filters Shortcut */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/80 shadow-2xs"
                title="Reset Filters & Search"
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
