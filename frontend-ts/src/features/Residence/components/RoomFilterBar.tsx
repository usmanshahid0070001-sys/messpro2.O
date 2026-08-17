import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

type SortOrder = 'name-asc' | 'name-desc' | 'occupancy'

interface RoomFilterBarProps {
  searchTerm: string
  onSearchChange: (val: string) => void
  statusFilter: string
  onStatusChange: (val: string) => void
  sortOrder: SortOrder
  onSortChange: (val: SortOrder) => void
}

const STATUS_OPTIONS = ['all', 'available', 'full', 'maintenance']

export default function RoomFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortOrder,
  onSortChange,
}: RoomFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between bg-card p-3 sm:p-3.5 rounded-xl border border-border shadow-xs">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search room (e.g. A-1, Room 102)..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-xs sm:text-sm w-full bg-background/70 focus:bg-background"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onStatusChange(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value as SortOrder)}
          className="h-8 px-2 rounded-lg border border-border bg-background text-xs font-medium text-foreground cursor-pointer focus:ring-1 focus:ring-teal-500"
        >
          <option value="name-asc">Room Name (A-Z)</option>
          <option value="name-desc">Room Name (Z-A)</option>
          <option value="occupancy">Highest Occupancy</option>
        </select>
      </div>
    </div>
  )
}
