import { Search, ArrowUpDown, Shield, UserCheck, Building, Users, Download } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface FilterSectionProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  roleFilter: string
  onRoleFilterChange: (value: string) => void
  currentRole: string
  sortOrder: 'asc' | 'desc' | 'none'
  onToggleSort: () => void
  onExport: () => void
}

export default function FilterSection({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  currentRole,
  sortOrder,
  onToggleSort,
  onExport
}: FilterSectionProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-muted/20 p-4 rounded-xl border border-border/80">
      
      {/* Tab Selectors (Flat tab design instead of select dropdown) */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg border border-border/60 w-fit overflow-x-auto">
        <button
          type="button"
          onClick={() => onRoleFilterChange('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all border-none outline-none ${
            roleFilter === 'all'
              ? 'bg-background text-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          All Members
        </button>

        {currentRole === 'superadmin' && (
          <button
            type="button"
            onClick={() => onRoleFilterChange('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all border-none outline-none ${
              roleFilter === 'admin'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Admins
          </button>
        )}

        <button
          type="button"
          onClick={() => onRoleFilterChange('manager')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all border-none outline-none ${
            roleFilter === 'manager'
              ? 'bg-background text-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          Managers
        </button>

        <button
          type="button"
          onClick={() => onRoleFilterChange('student')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all border-none outline-none ${
            roleFilter === 'student'
              ? 'bg-background text-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building className="h-3.5 w-3.5" />
          Students
        </button>
      </div>

      {/* Right Side: Search Input, Alphabetic Sorting Button, and Export Sheet Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search member, email, or roll number..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-9 bg-background w-full sm:w-64"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleSort}
          className={`gap-1.5 text-xs h-9 justify-center ${
            sortOrder !== 'none' ? 'bg-primary/5 text-primary border-primary/20 hover:bg-primary/10' : ''
          }`}
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span>
            {sortOrder === 'none' ? 'Sort' : sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExport}
          className="gap-1.5 text-xs h-9 justify-center hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/20"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Excel</span>
        </Button>
      </div>
    </div>
  )
}
