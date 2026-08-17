import React from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

type ServiceFilterType = 'all' | 'cleaned-today' | 'pending-today' | 'never'
type ServiceSortType = 'recent' | 'name' | 'least'

interface ServiceFilterBarProps {
  searchTerm: string
  onSearchChange: (val: string) => void
  filter: ServiceFilterType
  onFilterChange: (val: ServiceFilterType) => void
  sortOrder: ServiceSortType
  onSortChange: (val: ServiceSortType) => void
  totalCount: number
  cleanedCount: number
  pendingCount: number
}

export default function ServiceFilterBar({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  sortOrder,
  onSortChange,
  totalCount,
  cleanedCount,
  pendingCount,
}: ServiceFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between bg-card p-3 sm:p-3.5 rounded-xl border border-border shadow-xs">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search room name (e.g. Room 101, A-1)..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-xs sm:text-sm w-full bg-background/70 focus:bg-background"
        />
      </div>

      {/* Filter pills and sort select */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('cleaned-today')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              filter === 'cleaned-today'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Cleaned ({cleanedCount})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('pending-today')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              filter === 'pending-today'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending ({pendingCount})
          </button>
        </div>

        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value as ServiceSortType)}
          className="h-8 px-2 rounded-lg border border-border bg-background text-xs font-medium text-foreground cursor-pointer focus:ring-1 focus:ring-teal-500"
        >
          <option value="recent">Recently Cleaned</option>
          <option value="name">Room Name (A-Z)</option>
          <option value="least">Fewest Cleanings</option>
        </select>
      </div>
    </div>
  )
}
