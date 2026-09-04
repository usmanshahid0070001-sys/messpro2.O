import { Search, Download, RotateCcw, ArrowUpDown, ChevronDown, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ComplaintFilterBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  intensityFilter: string
  onIntensityFilterChange: (intensity: string) => void
  categoryFilter: string
  onCategoryFilterChange: (category: string) => void
  availableCategories: string[]
  sortOrder: 'newest' | 'oldest' | 'intensity'
  onToggleSort: () => void
  onExport: () => void
  onRefresh?: () => void
  isRefreshing?: boolean
}

export default function ComplaintFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  intensityFilter,
  onIntensityFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  availableCategories,
  sortOrder,
  onToggleSort,
  onExport,
  onRefresh,
  isRefreshing = false,
}: ComplaintFilterBarProps) {
  const statusOptions = [
    { label: 'All Tickets', value: 'all' },
    { label: 'Active / Pending', value: 'active' },
    { label: 'Open', value: 'open' },
    { label: 'Assigned', value: 'assigned' },
    { label: 'In Progress', value: 'in progress' },
    { label: 'Resolved', value: 'resolved' },
  ]

  const intensityOptions = [
    { label: 'All Urgencies', value: 'all', dot: 'bg-muted-foreground' },
    { label: 'Urgent', value: 'Urgent', dot: 'bg-red-500' },
    { label: 'High', value: 'High', dot: 'bg-amber-500' },
    { label: 'Medium', value: 'Medium', dot: 'bg-yellow-500' },
    { label: 'Low', value: 'Low', dot: 'bg-blue-500' },
  ]

  const getSortLabel = () => {
    if (sortOrder === 'newest') return 'Newest'
    if (sortOrder === 'oldest') return 'Oldest'
    return 'Priority'
  }

  const selectedIntensityLabel =
    intensityOptions.find((o) => o.value === intensityFilter)?.label || 'Urgency'

  return (
    <div className="flex flex-col gap-3 bg-card p-3.5 sm:p-4 rounded-2xl border border-border shadow-xs">
      {/* Top row: Search & Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by Roll No, Category, Room..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 sm:h-10 text-xs sm:text-sm w-full bg-background/70 focus:bg-background"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-start">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleSort}
            className="h-9 text-xs gap-1.5 font-medium border-border flex-1 sm:flex-none justify-center cursor-pointer"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{getSortLabel()}</span>
          </Button>

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-9 text-xs gap-1.5 font-medium border-border px-2.5 cursor-pointer"
              title="Refresh complaints"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-9 text-xs gap-1.5 font-semibold border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 flex-1 sm:flex-none justify-center cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Excel</span>
          </Button>
        </div>
      </div>

      {/* Bottom row: Status Pills & Dropdown Filters */}
      <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center justify-between pt-2 border-t border-border/60">
        {/* Status segmented pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none -mx-1 px-1">
          {statusOptions.map((opt) => {
            const isActive = statusFilter === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onStatusFilterChange(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-2xs font-semibold'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Secondary filters: Intensity and Category dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Intensity Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer min-w-[120px]"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      intensityOptions.find((o) => o.value === intensityFilter)?.dot || 'bg-muted-foreground'
                    }`}
                  />
                  <span className="truncate">{selectedIntensityLabel}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                Urgency Level
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={intensityFilter}
                onValueChange={(val) => onIntensityFilterChange(val)}
              >
                {intensityOptions.map((opt) => (
                  <DropdownMenuRadioItem
                    key={opt.value}
                    value={opt.value}
                    className="text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span className={`w-2 h-2 rounded-full ${opt.dot} shrink-0`} />
                    <span>{opt.label}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Category Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer min-w-[130px]"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Filter className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="truncate">{categoryFilter === 'all' ? 'All Categories' : categoryFilter}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 max-h-60 overflow-y-auto">
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                Complaint Category
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={categoryFilter}
                onValueChange={(val) => onCategoryFilterChange(val)}
              >
                <DropdownMenuRadioItem value="all" className="text-xs cursor-pointer">
                  All Categories
                </DropdownMenuRadioItem>
                {availableCategories.map((cat) => (
                  <DropdownMenuRadioItem key={cat} value={cat} className="text-xs cursor-pointer">
                    {cat}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
