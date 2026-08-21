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
} from 'lucide-react'
import { Link } from 'react-router-dom'

export type ViewMode = 'current' | 'monthly'
export type StatusFilter = 'all' | 'Unpaid' | 'Paid' | 'Adjusted in Balance'

interface BillManagementHeaderProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  selectedMonth: string
  onMonthChange: (month: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: StatusFilter
  onStatusFilterChange: (status: StatusFilter) => void
  onExportExcel: () => void
  isExporting?: boolean
  totalBillsCount: number
  onResetFilters: () => void
  hasActiveFilters: boolean
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
      <div className="bg-card border border-border p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* View Mode Toggle Pill */}
          <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border/60 self-start">
            <button
              type="button"
              onClick={() => onViewModeChange('current')}
              className={`px-3.5 py-1.5 text-xs md:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
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
              className={`px-3.5 py-1.5 text-xs md:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'monthly'
                  ? 'bg-card text-purple-600 dark:text-purple-400 shadow-xs border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Monthly Archive</span>
            </button>
          </div>

          {/* Search, Month Picker & Status Selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Month Picker (Only active when in monthly archive mode) */}
            {viewMode === 'monthly' && (
              <div className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-xl text-xs md:text-sm font-medium shadow-2xs">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => onMonthChange(e.target.value)}
                  className="bg-transparent text-foreground font-semibold focus:outline-none cursor-pointer"
                />
              </div>
            )}

            {/* Search Input */}
            <div className="relative min-w-[220px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name or roll..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-foreground placeholder:text-muted-foreground shadow-2xs"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-background border border-border px-2.5 py-1.5 rounded-xl text-xs md:text-sm shadow-2xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
                className="bg-transparent text-foreground font-medium text-xs md:text-sm focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Unpaid">Unpaid / Arrears</option>
                <option value="Paid">Fully Paid</option>
                <option value="Adjusted in Balance">Adjusted in Balance</option>
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
