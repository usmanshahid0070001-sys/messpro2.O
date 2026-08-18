import { Search, Download, X, Sparkles, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export type StatusFilterType = 'all' | 'pending' | 'completed'

interface MealPricesToolbarProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  statusFilter: StatusFilterType
  onStatusFilterChange: (val: StatusFilterType) => void
  onExportExcel: () => void
  totalCount: number
  filteredCount: number
}

export default function MealPricesToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onExportExcel,
  totalCount,
  filteredCount,
}: MealPricesToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
      {/* Left: Search & Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search dish or meal slot..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8.5 pl-8.5 pr-8 text-xs bg-card rounded-xl border-border/80 focus:border-purple-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center p-1 rounded-xl bg-muted/50 border border-border/70 text-xs">
          <button
            type="button"
            onClick={() => onStatusFilterChange('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Days
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('pending')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/25'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending Price
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('completed')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/25'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Priced
          </button>
        </div>
      </div>

      {/* Right: Export Button */}
      <div className="flex items-center gap-2 self-start md:self-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExportExcel}
          className="h-8.5 px-3 text-xs font-semibold rounded-xl border-border/80 hover:bg-muted/70 cursor-pointer shadow-xs transition-all"
          title="Export report to Excel (.xlsx) spreadsheet"
        >
          <Download className="h-3.5 w-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
          <span>Export Excel</span>
        </Button>
      </div>
    </div>
  )
}
