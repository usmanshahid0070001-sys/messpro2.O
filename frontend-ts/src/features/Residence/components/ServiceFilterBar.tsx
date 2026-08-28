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
  totalCount,
  cleanedCount,
  pendingCount,
}: ServiceFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between bg-card p-3 sm:p-3.5 rounded-2xl border border-border shadow-xs">
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

      {/* Filter pills and sort select */}
      <div className="flex items-center gap-2 flex-wrap">
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
            Cleaned ({cleanedCount})
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
            Pending ({pendingCount})
          </button>
        </div>

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
                Fewest Cleanings
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
