import { Search, ArrowUpDown, ChevronDown, Calendar, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type ServiceFilterType = 'all' | 'cleaned-today' | 'pending-today' | 'never'
export type ServiceSortType = 'recent' | 'name' | 'least'

export interface MonthOption {
  key: string // e.g. "2026-07"
  year: number
  monthIndex: number
  label: string // e.g. "July 2026"
  shortLabel: string // e.g. "Jul 2026"
  totalHostelLogs: number
}

interface ServiceFilterBarProps {
  searchTerm: string
  onSearchChange: (val: string) => void
  filter: ServiceFilterType
  onFilterChange: (val: ServiceFilterType) => void
  sortOrder: ServiceSortType
  onSortChange: (val: ServiceSortType) => void
  selectedMonth: string
  onMonthChange: (val: string) => void
  availableMonths: MonthOption[]
  totalCount: number
  cleanedCount: number
  pendingCount: number
}

const SORT_LABELS: Record<ServiceSortType, string> = {
  recent: 'Recently Cleaned',
  name: 'Room Name (A → Z)',
  least: 'Fewest Cleanings',
}

export default function ServiceFilterBar({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  sortOrder,
  onSortChange,
  selectedMonth,
  onMonthChange,
  availableMonths,
  totalCount,
  cleanedCount,
  pendingCount,
}: ServiceFilterBarProps) {
  const activeMonth = availableMonths.find((m) => m.key === selectedMonth)

  return (
    <div className="space-y-2.5 bg-card p-3 sm:p-3.5 rounded-2xl border border-border shadow-xs">
      {/* ── Top Row: Search + Month Selector + Sort ── */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search room name (e.g. Room 101, A-1)..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs sm:text-sm w-full bg-background/70 focus:bg-background"
          />
        </div>

        {/* Month Selector Dropdown & Sort */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Month Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`inline-flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors shadow-2xs cursor-pointer min-w-[145px] ${
                  selectedMonth !== 'all'
                    ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30 font-semibold'
                    : 'bg-muted/40 border-border/80 text-foreground hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="truncate">
                    {selectedMonth === 'all' ? 'All Months (All Logs)' : activeMonth?.label || selectedMonth}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                Filter Logs by Month
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={selectedMonth}
                onValueChange={(val) => onMonthChange(val)}
              >
                <DropdownMenuRadioItem value="all" className="text-xs cursor-pointer">
                  All Months (All Logs)
                </DropdownMenuRadioItem>
                {availableMonths.map((m) => (
                  <DropdownMenuRadioItem key={m.key} value={m.key} className="text-xs cursor-pointer">
                    {m.label} ({m.totalHostelLogs} logs)
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer min-w-[145px]"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <ArrowUpDown className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="truncate">{SORT_LABELS[sortOrder]}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                Sort Cleaning Logs
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={sortOrder}
                onValueChange={(val) => onSortChange(val as ServiceSortType)}
              >
                <DropdownMenuRadioItem value="recent" className="text-xs cursor-pointer">
                  Recently Cleaned
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name" className="text-xs cursor-pointer">
                  Room Name (A → Z)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="least" className="text-xs cursor-pointer">
                  Fewest Cleanings {selectedMonth !== 'all' ? `(${activeMonth?.shortLabel || 'Month'})` : ''}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Bottom Row: Status Filter Pills + Quick Month Switchers ── */}
      <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-border/40">
        {/* Status Pills */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('cleaned-today')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filter === 'cleaned-today'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Cleaned Today ({cleanedCount})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('pending-today')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filter === 'pending-today'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending Today ({pendingCount})
          </button>
        </div>

        {/* Quick Month Pills */}
        {availableMonths.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            <span className="text-[11px] font-medium text-muted-foreground mr-1 hidden sm:inline">
              Month:
            </span>
            <button
              type="button"
              onClick={() => onMonthChange('all')}
              className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedMonth === 'all'
                  ? 'bg-teal-600 text-white font-semibold shadow-xs'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
            >
              All Logs
            </button>
            {availableMonths.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => onMonthChange(m.key)}
                className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  selectedMonth === m.key
                    ? 'bg-teal-600 text-white font-semibold shadow-xs'
                    : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70'
                }`}
              >
                {m.shortLabel}
              </button>
            ))}
            {selectedMonth !== 'all' && (
              <button
                type="button"
                onClick={() => onMonthChange('all')}
                title="Clear month filter"
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
