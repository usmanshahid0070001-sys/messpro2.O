import { Search, Download, RotateCcw, ArrowUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
    { label: 'Active', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'Assigned', value: 'assigned' },
    { label: 'In Progress', value: 'in progress' },
    { label: 'Resolved', value: 'resolved' },
  ]

  const intensityOptions = [
    { label: 'All Urgencies', value: 'all' },
    { label: 'Urgent', value: 'Urgent' },
    { label: 'High', value: 'High' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Low', value: 'Low' },
  ]

  const getSortLabel = () => {
    if (sortOrder === 'newest') return 'Newest'
    if (sortOrder === 'oldest') return 'Oldest'
    return 'Priority'
  }

  return (
    <div className="flex flex-col gap-3 bg-card p-3.5 sm:p-4 rounded-2xl border border-border shadow-xs">
      {/* Top row: Search & Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
            className="h-9 text-xs gap-1.5 font-medium border-border flex-1 sm:flex-none justify-center"
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
              className="h-9 text-xs gap-1.5 font-medium border-border px-2.5"
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
            className="h-9 text-xs gap-1.5 font-medium border-border hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 flex-1 sm:flex-none justify-center"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-xs font-semibold'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Secondary filters: Intensity and Category dropdowns */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          {/* Intensity Selector */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <select
              value={intensityFilter}
              onChange={(e) => onIntensityFilterChange(e.target.value)}
              className="h-8 sm:h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer w-full"
            >
              {intensityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="h-8 sm:h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer w-full sm:max-w-[150px]"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
