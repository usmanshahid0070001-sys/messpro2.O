import { useState, useMemo } from 'react'
import {
  Building2,
  Plus,
  Search,
  Download,
  Settings,
  UserPlus,
  ShieldCheck,
  Globe,
  MapPin,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Filter,
  CheckCircle2,
  Clock,
  Ban,
  Layers,
  ArrowUpRight,
} from 'lucide-react'
import { useGetHostels, type HostelTenant } from '@/hooks/queries/useSuperadminQueries'
import CreateHostelModal from './components/CreateHostelModal'
import HostelSettingsModal from './components/HostelSettingsModal'
import AddHostelUserModal from './components/AddHostelUserModal'
import { exportHostelsToExcel } from '@/utils/exportUtils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

export default function ManageTenantsPage() {
  const { data: hostels = [], isLoading, error } = useGetHostels()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Trial' | 'Suspended'>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedSettingsHostel, setSelectedSettingsHostel] = useState<HostelTenant | null>(null)
  const [selectedUserHostel, setSelectedUserHostel] = useState<HostelTenant | null>(null)

  // Derived metrics
  const totalCount = hostels.length
  const activeCount = hostels.filter((h) => h.status === 'Active').length
  const trialCount = hostels.filter((h) => h.status === 'Trial').length
  const suspendedCount = hostels.filter((h) => h.status === 'Suspended').length

  const filteredHostels = useMemo(() => {
    return hostels.filter((h) => {
      const matchesSearch =
        !searchQuery.trim() ||
        h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.subdomain?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || h.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [hostels, searchQuery, statusFilter])

  const handleExport = () => {
    exportHostelsToExcel(filteredHostels)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Multi-Tenant Registry
            </span>
            <span className="text-xs text-muted-foreground">• Global Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Hostel Tenants Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage provisioned hostel domains, subscription states, geofence coordinates, and staff credentials.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={filteredHostels.length === 0}
            className="gap-1.5 text-xs font-medium cursor-pointer shadow-xs"
          >
            <Download className="h-4 w-4 text-muted-foreground" />
            Export Excel
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Provision Hostel
          </Button>
        </div>
      </div>

      {/* Metric Cards (AGENTS.md semantic styling) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Hostels */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">Total Tenants</span>
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground font-mono">
              {totalCount}
            </div>
            <p className="text-[11px] mt-1 text-muted-foreground/80 flex items-center gap-1 font-medium">
              Registered across platform
            </p>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">Active Subscriptions</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground font-mono">
              {activeCount}
            </div>
            <p className="text-[11px] mt-1 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" /> Nominal operational state
            </p>
          </div>
        </div>

        {/* Trial Tenancies */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">Evaluating / Trial</span>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground font-mono">
              {trialCount}
            </div>
            <p className="text-[11px] mt-1 text-amber-600 dark:text-amber-400 font-medium">
              Pending contract conversion
            </p>
          </div>
        </div>

        {/* Suspended Hostels */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">Suspended / Inactive</span>
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <Ban className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground font-mono">
              {suspendedCount}
            </div>
            <p className="text-[11px] mt-1 text-muted-foreground/80 font-medium">
              Access restricted
            </p>
          </div>
        </div>
      </div>

      {/* Directory Filter & Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by hostel name, city, or subdomain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'Active', 'Trial', 'Suspended'] as const).map((st) => {
            const isSelected = statusFilter === st
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-foreground text-background border-foreground shadow-xs'
                    : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/40'
                }`}
              >
                {st === 'all' ? 'All Statuses' : st}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tenants Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-5 font-semibold">Tenant & Subdomain</th>
                <th className="py-3.5 px-4 font-semibold">Location</th>
                <th className="py-3.5 px-4 font-semibold">Subscription Tier</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Expires On</th>
                <th className="py-3.5 px-4 font-semibold">Geofence</th>
                <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Skeleton className="h-8 w-20 ml-auto rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : filteredHostels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Building2 className="h-10 w-10 text-muted-foreground/40" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          {searchQuery || statusFilter !== 'all'
                            ? 'No tenants match your search filter'
                            : 'No hostel tenants registered yet'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {searchQuery || statusFilter !== 'all'
                            ? 'Try clearing the search query or status filter.'
                            : 'Click "Provision Hostel" above to onboard your first tenant.'}
                        </p>
                      </div>
                      {!searchQuery && statusFilter === 'all' && (
                        <Button
                          size="sm"
                          onClick={() => setIsCreateModalOpen(true)}
                          className="mt-2 text-xs font-semibold gap-1.5"
                        >
                          <Plus className="h-4 w-4" /> Provision Hostel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHostels.map((hostel) => {
                  const planName =
                    typeof hostel.plan === 'object'
                      ? hostel.plan?.name
                      : hostel.plan || 'Standard Tier'

                  const hasCoords = Boolean(
                    hostel.locationCoords?.lat && hostel.locationCoords?.lng
                  )

                  const expiryFormatted = hostel.subscriptionExpiresAt
                    ? new Date(hostel.subscriptionExpiresAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Lifetime / Trial'

                  return (
                    <tr
                      key={hostel._id}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      {/* Name & Subdomain */}
                      <td className="py-3.5 px-5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {hostel.name}
                          </span>
                          <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
                            <Globe className="h-3 w-3 text-blue-500 shrink-0" />
                            <span>
                              {hostel.subdomain ? `${hostel.subdomain}.messpro.app` : 'No custom subdomain'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-foreground font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{hostel.location || 'Not Specified'}</span>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          <Layers className="h-3 w-3" />
                          {planName}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            hostel.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : hostel.status === 'Trial'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              hostel.status === 'Active'
                                ? 'bg-emerald-500 animate-pulse'
                                : hostel.status === 'Trial'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          {hostel.status || 'Active'}
                        </span>
                      </td>

                      {/* Expires On */}
                      <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                        {expiryFormatted}
                      </td>

                      {/* Geofence */}
                      <td className="py-3.5 px-4">
                        {hasCoords ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 font-medium font-mono">
                            <CheckCircle2 className="h-3.5 w-3.5" /> 30m Active
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Not set</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUserHostel(hostel)}
                            title="Add Admin / Manager to Hostel"
                            className="h-8 px-2.5 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            <span className="hidden md:inline">Staff</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSettingsHostel(hostel)}
                            title="Configure Hostel Settings"
                            className="h-8 px-2.5 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Settings className="h-3.5 w-3.5" />
                            <span className="hidden md:inline">Configure</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateHostelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <HostelSettingsModal
        isOpen={Boolean(selectedSettingsHostel)}
        onClose={() => setSelectedSettingsHostel(null)}
        hostel={selectedSettingsHostel}
      />

      <AddHostelUserModal
        isOpen={Boolean(selectedUserHostel)}
        onClose={() => setSelectedUserHostel(null)}
        hostel={selectedUserHostel}
      />
    </div>
  )
}
