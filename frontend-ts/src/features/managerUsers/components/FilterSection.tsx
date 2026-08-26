import { Search, ArrowUpDown, ShieldCheck, UserCheck, GraduationCap, Users, Download, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface FilterSectionProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  roleFilter: string
  onRoleFilterChange: (value: string) => void
  currentRole: string
  sortOrder: 'asc' | 'desc' | 'room_asc' | 'none'
  onToggleSort: () => void
  onExport: () => void
  counts?: {
    total: number
    admin: number
    manager: number
    student: number
  }
}

export default function FilterSection({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  currentRole,
  sortOrder,
  onToggleSort,
  onExport,
  counts,
}: FilterSectionProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between bg-card p-3 sm:p-3.5 rounded-2xl border border-border/80 shadow-xs">
      {/* Role Segmented Tabs with Count Chips */}
      <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/60 w-full sm:w-fit overflow-x-auto">
        <button
          type="button"
          onClick={() => onRoleFilterChange('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            roleFilter === 'all'
              ? 'bg-background text-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-3.5 w-3.5 text-blue-500" />
          <span>All Members</span>
          {counts && (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-muted text-muted-foreground">
              {counts.total}
            </span>
          )}
        </button>

        {currentRole === 'superadmin' && (
          <button
            type="button"
            onClick={() => onRoleFilterChange('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              roleFilter === 'admin'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
            <span>Admins</span>
            {counts && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-muted text-muted-foreground">
                {counts.admin}
              </span>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => onRoleFilterChange('manager')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            roleFilter === 'manager'
              ? 'bg-background text-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <UserCheck className="h-3.5 w-3.5 text-purple-500" />
          <span>Managers</span>
          {counts && (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-muted text-muted-foreground">
              {counts.manager}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onRoleFilterChange('student')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            roleFilter === 'student'
              ? 'bg-background text-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5 text-teal-500" />
          <span>Students</span>
          {counts && (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-muted text-muted-foreground">
              {counts.student}
            </span>
          )}
        </button>
      </div>

      {/* Right Side: Search & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Search Input with Clear Button */}
        <div className="relative flex-1 sm:w-64 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search name, email, roll no..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8.5 pr-7.5 h-9 text-xs bg-background/80 focus:bg-background rounded-xl border-border/80"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full cursor-pointer"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Alphabetical Sort Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleSort}
          className={`h-9 px-3 text-xs gap-1.5 rounded-xl border-border/80 cursor-pointer ${
            sortOrder !== 'none'
              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/20'
              : 'hover:bg-muted'
          }`}
          title="Toggle sort order"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span>
            {sortOrder === 'none'
              ? 'Sort'
              : sortOrder === 'asc'
              ? 'Name A → Z'
              : sortOrder === 'desc'
              ? 'Name Z → A'
              : 'Room A → Z'}
          </span>
        </Button>

        {/* Export Excel Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExport}
          className="h-9 px-3 text-xs gap-1.5 rounded-xl border-border/80 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 cursor-pointer transition-colors"
        >
          <Download className="h-3.5 w-3.5 text-emerald-500" />
          <span>Export Excel</span>
        </Button>
      </div>
    </div>
  )
}
