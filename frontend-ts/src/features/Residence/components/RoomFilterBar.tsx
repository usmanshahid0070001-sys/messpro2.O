import { Search, ArrowUpDown, ChevronDown } from 'lucide-react'
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

const SORT_LABELS: Record<SortOrder, string> = {
  'name-asc': 'Room Name (A → Z)',
  'name-desc': 'Room Name (Z → A)',
  occupancy: 'Highest Occupancy',
}

export default function RoomFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortOrder,
  onSortChange,
}: RoomFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between bg-card p-3 sm:p-3.5 rounded-2xl border border-border shadow-xs">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search room (e.g. A-1, Room 102)..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-xs sm:text-sm w-full bg-background/70 focus:bg-background"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onStatusChange(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer min-w-[140px]"
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
              Sort Rooms
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={sortOrder}
              onValueChange={(val) => onSortChange(val as SortOrder)}
            >
              <DropdownMenuRadioItem value="name-asc" className="text-xs cursor-pointer">
                Room Name (A → Z)
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="name-desc" className="text-xs cursor-pointer">
                Room Name (Z → A)
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="occupancy" className="text-xs cursor-pointer">
                Highest Occupancy
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
