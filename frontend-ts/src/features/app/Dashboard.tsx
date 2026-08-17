import { useSelector } from 'react-redux'
import {
  Building2,
  Users,
  Utensils,
  CreditCard,
  AlertCircle,
  Calendar,
  Clock,
  QrCode,
  ShieldCheck,
  BedDouble,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
  Plus,
  Settings2,
  Settings2Icon
} from 'lucide-react'
import type { RootState } from '@/store'
import type { PlanFeature } from '@/store/slices/HostelSlice'
import { useGetMyHostel } from '@/hooks/queries/useHostelQueries'
import { useNavigation } from '@/hooks/useNavigation'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

// ── Metadata with semantic category color-coding ────────────────────────
export interface ActionMeta {
  desc: string
  icon: any
  color: string
  hoverBg: string
  hoverText: string
  borderHover: string
}

const ACTION_METADATA: Record<string, ActionMeta> = {
  // ── People / Access ── (Brand Blue)
  'User Management': {
    desc: 'Add, edit, or manage user access',
    icon: Users,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    hoverBg: 'group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    borderHover: 'hover:border-blue-500/40',
  },

  // ── Residence / Rooms ── (Teal / Cyan)
  'Room Allocation': {
    desc: 'Assign and manage resident rooms',
    icon: BedDouble,
    color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    hoverBg: 'group-hover:bg-teal-600 dark:group-hover:bg-teal-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-teal-600 dark:group-hover:text-teal-400',
    borderHover: 'hover:border-teal-500/40',
  },
  'Room Services': {
    desc: 'Track room maintenance and services',
    icon: Building2,
    color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    hoverBg: 'group-hover:bg-teal-600 dark:group-hover:bg-teal-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-teal-600 dark:group-hover:text-teal-400',
    borderHover: 'hover:border-teal-500/40',
  },
  'My Room': {
    desc: 'View your room details & roommates',
    icon: BedDouble,
    color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    hoverBg: 'group-hover:bg-teal-600 dark:group-hover:bg-teal-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-teal-600 dark:group-hover:text-teal-400',
    borderHover: 'hover:border-teal-500/40',
  },

  // ── Food / Meals ── (Emerald Green)
  'Weekly Schedule': {
    desc: 'Configure weekly dining menu',
    icon: Utensils,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    hoverBg: 'group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    borderHover: 'hover:border-emerald-500/40',
  },
  'Meal Overview': {
    desc: 'Live meal counts and session overview',
    icon: Utensils,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    hoverBg: 'group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    borderHover: 'hover:border-emerald-500/40',
  },
  'Meal Control': {
    desc: 'Manage meal access and restrictions',
    icon: Utensils,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    hoverBg: 'group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    borderHover: 'hover:border-emerald-500/40',
  },
  'Meal History': {
    desc: 'Review your past meal consumption',
    icon: Utensils,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    hoverBg: 'group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    borderHover: 'hover:border-emerald-500/40',
  },

  // ── Finance ── (Purple)
  'Manage Hostel Dues': {
    desc: 'Track student fees and receipts',
    icon: CreditCard,
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    hoverBg: 'group-hover:bg-purple-600 dark:group-hover:bg-purple-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
    borderHover: 'hover:border-purple-500/40',
  },
  'Generate Bills': {
    desc: 'Issue new monthly invoices & dues',
    icon: FileText,
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    hoverBg: 'group-hover:bg-purple-600 dark:group-hover:bg-purple-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
    borderHover: 'hover:border-purple-500/40',
  },

  // ── Attendance & Configuration ── (Slate / Neutral Tone)
  'Manual Attendance': {
    desc: 'Log manual attendance records',
    icon: Settings2Icon,
    color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    hoverBg: 'group-hover:bg-slate-700 dark:group-hover:bg-slate-600 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-slate-700 dark:group-hover:text-slate-300',
    borderHover: 'hover:border-slate-500/40',
  },
  'QR Attendance': {
    desc: 'Manage QR code meal scanning',
    icon: QrCode,
    color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    hoverBg: 'group-hover:bg-slate-700 dark:group-hover:bg-slate-600 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-slate-700 dark:group-hover:text-slate-300',
    borderHover: 'hover:border-slate-500/40',
  },
  'Biometric Attendance': {
    desc: 'Sync biometric attendance records',
    icon: Activity,
    color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    hoverBg: 'group-hover:bg-slate-700 dark:group-hover:bg-slate-600 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-slate-700 dark:group-hover:text-slate-300',
    borderHover: 'hover:border-slate-500/40',
  },
  'Hostel Configuration': {
    desc: 'Configure hostel settings and rules',
    icon: Settings2,
    color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    hoverBg: 'group-hover:bg-slate-700 dark:group-hover:bg-slate-600 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-slate-700 dark:group-hover:text-slate-300',
    borderHover: 'hover:border-slate-500/40',
  },
  'Mark Attendance': {
    desc: 'Scan QR code at the mess counter',
    icon: QrCode,
    color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    hoverBg: 'group-hover:bg-slate-700 dark:group-hover:bg-slate-600 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-slate-700 dark:group-hover:text-slate-300',
    borderHover: 'hover:border-slate-500/40',
  },

  // ── Alerts & Complaints ── (Warm Amber)
  'Complaints': {
    desc: 'Review and resolve resident issues',
    icon: AlertCircle,
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    hoverBg: 'group-hover:bg-amber-600 dark:group-hover:bg-amber-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    borderHover: 'hover:border-amber-500/40',
  },
  'My Complaints': {
    desc: 'Submit and track maintenance issues',
    icon: AlertCircle,
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    hoverBg: 'group-hover:bg-amber-600 dark:group-hover:bg-amber-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    borderHover: 'hover:border-amber-500/40',
  },
}

// ── Helpers ─────────────────────────────────────────────────────────────
function calculateDaysRemaining(expiresAt?: string | { $date: string }): number | null {
  if (!expiresAt) return null
  const dateStr = typeof expiresAt === 'string' ? expiresAt : expiresAt.$date
  if (!dateStr) return null
  const diffMs = new Date(dateStr).getTime() - new Date().getTime()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export interface QuickActionItem {
  title: string
  url: string
  icon: any
  desc: string
  color: string
  hoverBg: string
  hoverText: string
  borderHover: string
}

function extractQuickActions(navItems: any[]): QuickActionItem[] {
  const actions: QuickActionItem[] = []
  const seenTitles = new Set<string>()

  navItems.forEach((section) => {
    if (section.items && section.items.length > 0) {
      section.items.forEach((subItem: any) => {
        if (subItem.title !== 'Dashboard' && !seenTitles.has(subItem.title)) {
          seenTitles.add(subItem.title)
          const meta = ACTION_METADATA[subItem.title] || {
            desc: `Access ${subItem.title} module`,
            icon: section.icon || ChevronRight,
            color: 'bg-muted text-foreground border-border',
            hoverBg: 'group-hover:bg-primary group-hover:text-primary-foreground dark:group-hover:text-primary-foreground',
            hoverText: 'group-hover:text-primary',
            borderHover: 'hover:border-primary/40',
          }
          actions.push({
            title: subItem.title,
            url: subItem.url || '#',
            icon: meta.icon,
            desc: meta.desc,
            color: meta.color,
            hoverBg: meta.hoverBg,
            hoverText: meta.hoverText,
            borderHover: meta.borderHover,
          })
        }
      })
    } else if (
      section.title &&
      section.title !== 'Dashboard' &&
      section.title !== 'System Overview' &&
      section.title !== 'Hostel Overview' &&
      section.title !== 'My Overview' &&
      !seenTitles.has(section.title)
    ) {
      seenTitles.add(section.title)
      const meta = ACTION_METADATA[section.title] || {
        desc: `Access ${section.title} module`,
        icon: section.icon || ChevronRight,
        color: 'bg-muted text-foreground border-border',
        hoverBg: 'group-hover:bg-primary group-hover:text-primary-foreground dark:group-hover:text-primary-foreground',
        hoverText: 'group-hover:text-primary',
        borderHover: 'hover:border-primary/40',
      }
      actions.push({
        title: section.title,
        url: section.url || '#',
        icon: meta.icon,
        desc: meta.desc,
        color: meta.color,
        hoverBg: meta.hoverBg,
        hoverText: meta.hoverText,
        borderHover: meta.borderHover,
      })
    }
  })

  return actions
}

// ── Superadmin Dashboard ────────────────────────────────────────────────
function SuperadminDashboard({ user }: { user: any }) {
  const stats = [
    {
      label: 'Total Hostels',
      value: '42',
      change: '+3 registered this month',
      isPositive: true,
      icon: Building2,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    },
    {
      label: 'Active Students',
      value: '3,850',
      change: '+12% from last academic term',
      isPositive: true,
      icon: Users,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    },
    {
      label: 'Active Plans',
      value: '4 Tiers',
      change: 'Standard • Pro • Enterprise',
      isPositive: null,
      icon: Layers,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
    },
    {
      label: 'System Health',
      value: '99.98%',
      change: 'All cluster nodes nominal',
      isPositive: true,
      icon: Activity,
      color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
    },
  ]

  const recentHostels = [
    { name: 'Al-Razi Boys Hostel', subdomain: 'al-razi', students: 240, plan: 'Enterprise', status: 'Active' },
    { name: 'Iqbal Hall Residence', subdomain: 'iqbal-hall', students: 480, plan: 'Pro', status: 'Active' },
    { name: 'Fatima Girls Hostel', subdomain: 'fatima-hall', students: 310, plan: 'Enterprise', status: 'Active' },
    { name: 'Jinnah Executive Hostel', subdomain: 'jinnah-exec', students: 160, plan: 'Standard', status: 'Trial' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Superadmin Portal
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Live Infrastructure
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {getGreeting()}, {user?.name || 'Administrator'}
          </h1>
          <p className="text-xs text-muted-foreground">
            Multi-tenant system monitoring and global host governance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1.5 shadow-sm font-medium">
            <Plus className="h-4 w-4" />
            New Hostel Tenant
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              className="p-5 rounded-xl bg-card border border-border hover:border-border/80 transition-colors flex flex-col justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-muted-foreground">{stat.label}</span>
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</div>
                <p className={`text-[11px] mt-1 ${stat.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground/80'}`}>
                  {stat.change}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tenants Table & Platform Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 rounded-xl bg-card border border-border p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Registered Tenants</h2>
              <p className="text-xs text-muted-foreground">Recent hostel onboarding and subscription health</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground">
              View All <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2.5 font-medium">Hostel Name</th>
                  <th className="pb-2.5 font-medium">Subdomain</th>
                  <th className="pb-2.5 font-medium">Residents</th>
                  <th className="pb-2.5 font-medium">Plan</th>
                  <th className="pb-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recentHostels.map((h, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-medium text-foreground">{h.name}</td>
                    <td className="py-3 text-muted-foreground">{h.subdomain}.messpro.app</td>
                    <td className="py-3 text-foreground font-mono">{h.students}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground border border-border">
                        {h.plan}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        h.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${h.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global System Diagnostics */}
        <div className="rounded-xl bg-card border border-border p-5 space-y-4 shadow-xs">
          <div>
            <h2 className="text-base font-semibold text-foreground">Global Services</h2>
            <p className="text-xs text-muted-foreground">Live cluster and communication health</p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-foreground">Authentication Server</span>
              </div>
              <span className="text-muted-foreground font-mono">18ms</span>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-foreground">WebSocket Event Bus</span>
              </div>
              <span className="text-muted-foreground font-mono">Operational</span>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-foreground">Database Shards</span>
              </div>
              <span className="text-muted-foreground font-mono">Healthy</span>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-foreground">Cloudinary Asset Store</span>
              </div>
              <span className="text-muted-foreground font-mono">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Admin / Manager Dashboard ───────────────────────────────────────────
function AdminManagerDashboard({
  user,
  hostel,
  isLoading,
  navMain,
}: {
  user: any
  hostel: any
  isLoading: boolean
  navMain: any[]
}) {
  const role = user?.role
  const perms: string[] = user?.permissions || []

  const daysRemaining = calculateDaysRemaining(hostel?.subscriptionExpiresAt || hostel?.trialExpiresAt)
  const isExpired = hostel?.status === 'Expired' || daysRemaining === 0

  const planName = hostel?.plan?.name || 'Standard Plan'
  const maxCapacity = hostel?.plan?.limits?.maxStudents || 300
  const activeResidents = 184

  // Permission Checks for Admin & Manager
  const hasResidencePerm = perms.includes('residence_management')
  const hasMealPerm = perms.includes('meal_settings')
  const hasComplaintPerm = perms.includes('complaint_management')
  const hasBillPerm = perms.includes('bill_management')
  const hasUserPerm = perms.includes('user_management')
  const hasAttendancePerm =
    perms.includes('manual_attendance') ||
    perms.includes('qr_attendance') ||
    perms.includes('biometric_attendance')

  // Dynamic Statistics with distinct category tints
  const stats = []

  if (hasResidencePerm) {
    stats.push({
      label: 'Resident Capacity',
      value: `${activeResidents} / ${maxCapacity}`,
      subtext: `${Math.round((activeResidents / maxCapacity) * 100)}% occupied`,
      icon: Users,
      color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20',
    })
  }

  if (hasMealPerm) {
    stats.push({
      label: "Today's Active Meals",
      value: '142',
      subtext: 'Lunch attendance logged',
      icon: Utensils,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    })
  }

  if (hasComplaintPerm) {
    stats.push({
      label: 'Pending Complaints',
      value: '3',
      subtext: '2 maintenance, 1 mess',
      icon: AlertCircle,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    })
  }

  if (hasBillPerm) {
    stats.push({
      label: 'Monthly Fee Collection',
      value: '88%',
      subtext: '16 pending invoices',
      icon: CreditCard,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
    })
  }

  if (hasUserPerm && stats.length < 4) {
    stats.push({
      label: 'Staff & Members',
      value: '18',
      subtext: 'Active management staff',
      icon: Users,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    })
  }

  if (stats.length === 0) {
    stats.push({
      label: 'Hostel Status',
      value: hostel?.status || 'Active',
      subtext: `${planName}`,
      icon: Building2,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    })
  }

  // Extract quick actions dynamically from sidebar navMain
  const quickActions = extractQuickActions(navMain)

  const todaysMeals = [
    { name: 'Breakfast', time: '07:30 AM – 09:30 AM', menu: 'Omelette, Paratha, Tea & Milk', status: 'Completed' },
    { name: 'Lunch', time: '12:30 PM – 02:30 PM', menu: 'Chicken Biryani, Raita, Fresh Salad', status: 'Serving' },
    { name: 'Dinner', time: '07:30 PM – 09:30 PM', menu: 'Daal Makhni, Roti, Kheer Dessert', status: 'Upcoming' },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Expiration Banner if applicable */}
      {isExpired && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold">Subscription Expired:</span> Your current hostel subscription plan has ended.
            Please renew to retain full management features.
          </div>
        </div>
      )}

      {/* Hostel Brand Header */}
      <div className="p-6 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
              {hostel?.name || 'Hostel Operations'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
              {planName}
            </span>
            {daysRemaining !== null && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  daysRemaining <= 7
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Clock className="h-3 w-3 text-amber-500" />
                {daysRemaining} days remaining
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {getGreeting()}, {user?.name}
          </h1>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <span>{hostel?.location || 'Campus Residence'}</span>
            <span>•</span>
            <span>
              Subdomain: <strong className="text-foreground">{hostel?.subdomain || 'hostel'}</strong>.messpro.app
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button variant="outline" size="sm" className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Button>
        </div>
      </div>

      {/* Operational Stats with High-Contrast Typography & 20px padding */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${stats.length >= 4 ? 'lg:grid-cols-4' : stats.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4`}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div
              key={idx}
              className="p-5 rounded-xl bg-card border border-border hover:border-border/80 transition-colors flex flex-col justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-muted-foreground">{stat.label}</span>
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</div>
                <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5">{stat.subtext}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Hub: Quick Launch + Today's Mess Schedule with Natural Top Alignment */}
      <div className={`grid grid-cols-1 ${hasMealPerm ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6 items-start`}>
        {/* Quick Launch Actions (derived from navMain) */}
        <div className={`${hasMealPerm ? 'lg:col-span-2' : 'w-full'} space-y-4`}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Quick Management Actions</h2>
            <span className="text-xs text-muted-foreground">Permitted feature shortcuts</span>
          </div>

          {quickActions.length > 0 ? (
            <div className={`grid grid-cols-1 ${hasMealPerm ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-3.5`}>
              {quickActions.map((action, i) => {
                const Icon = action.icon
                return (
                  <div
                    key={i}
                    className={`p-5 rounded-xl bg-card border border-border ${action.borderHover} hover:bg-muted/20 transition-all cursor-pointer group flex flex-col justify-between gap-3 shadow-xs`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center border transition-colors ${action.color} ${action.hoverBg}`}
                      >
                        <Icon className="h-4 w-4 transition-colors group-hover:text-white dark:group-hover:text-white" />
                      </div>
                      <ChevronRight className={`h-4 w-4 text-muted-foreground ${action.hoverText} group-hover:translate-x-0.5 transition-all`} />
                    </div>
                    <div>
                      <h3 className={`text-sm font-semibold text-foreground ${action.hoverText} transition-colors`}>
                        {action.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-card border border-border text-center text-muted-foreground text-xs">
              No management shortcuts assigned to your role.
            </div>
          )}

          {/* Attendance Automation Banner: for Admin ONLY with attendance permissions */}
          {role === 'admin' && hasAttendancePerm && (
            <div className="p-4 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between gap-3 mt-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-foreground">Attendance Automation:</span>
                  <span className="text-muted-foreground ml-1.5">
                    Automated attendance verification is active for your hostel.
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-xs h-7 shrink-0 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10">
                Configure
              </Button>
            </div>
          )}
        </div>

        {/* Today's Mess Schedule: Shown ONLY if user.permissions includes meal_settings */}
        {hasMealPerm && (
          <div className="rounded-xl bg-card border border-border p-5 space-y-4 shadow-xs lg:sticky lg:top-16">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Utensils className="h-3.5 w-3.5" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">Today's Menu</h2>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Live Schedule
                </span>
              </div>

              <div className="space-y-3">
                {todaysMeals.map((meal, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{meal.name}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          meal.status === 'Serving'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : meal.status === 'Completed'
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {meal.status === 'Serving' && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        )}
                        {meal.status}
                      </span>
                    </div>
                    <p className="text-xs text-foreground font-medium">{meal.menu}</p>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {meal.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Student Dashboard ───────────────────────────────────────────────────
function StudentDashboard({
  user,
  hostel,
  navMain,
}: {
  user: any
  hostel: any
  navMain: any[]
}) {
  const roomNumber = user?.room || 'Room 204'
  const hostelName = hostel?.name || 'Campus Residence'

  // Student features driven strictly by hostel.plan.features
  const features: PlanFeature[] = hostel?.plan?.features || []
  const hasFeature = (name: string): boolean => {
    const f = features.find((item) => item.name.toLowerCase().replace(/\s+/g, '_') === name)
    return f?.isEnabled === true
  }

  const hasMealFeature = hasFeature('meal_settings')
  const hasResidenceFeature = hasFeature('residence_management')
  const hasComplaintFeature = hasFeature('complaint_management')
  const hasQrFeature = hasFeature('qr_attendance')

  const mealsToday = [
    { title: 'Breakfast', time: '07:30 AM – 09:30 AM', item: 'Boiled Eggs, Paratha & Chai', status: 'Consumed' },
    { title: 'Lunch', time: '12:30 PM – 02:30 PM', item: 'Chicken Biryani with Mint Raita', status: 'Active Now' },
    { title: 'Dinner', time: '07:30 PM – 09:30 PM', item: 'Daal Mash & Hot Tandoori Naan', status: 'Upcoming' },
  ]

  const studentShortcuts = extractQuickActions(navMain)

  return (
    <div className="space-y-6">
      {/* Student Welcome Header */}
      <div className="p-6 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
              Student Resident
            </span>
            {hasResidenceFeature && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border">
                {roomNumber}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-xs text-muted-foreground">
            Resident of <strong className="text-foreground">{hostelName}</strong> • Roll No / ID:{' '}
            <span className="font-mono text-foreground">{user?.id || user?._id || 'STD-8841'}</span>
          </p>
        </div>

        {/* QR attendance button only if qr_attendance feature is enabled */}
        {hasQrFeature && (
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-2 shadow-sm font-medium">
              <QrCode className="h-4 w-4" />
              Mark Mess Attendance
            </Button>
          </div>
        )}
      </div>

      {/* Status Highlights with 20px padding */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {hasMealFeature && (
          <div className="p-5 rounded-xl bg-card border border-border space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-muted-foreground">Mess Subscription</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">Active Package</div>
              <p className="text-[11px] text-muted-foreground/80 font-normal mt-0.5">Daily Mess Access Included</p>
            </div>
          </div>
        )}

        <div className="p-5 rounded-xl bg-card border border-border space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">Monthly Dues</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">Paid & Clear</div>
            <p className="text-[11px] text-muted-foreground/80 font-normal mt-0.5">Next invoice due 1st of month</p>
          </div>
        </div>

        {hasComplaintFeature && (
          <div className="p-5 rounded-xl bg-card border border-border space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-muted-foreground">Active Complaints</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">No Open Tickets</div>
              <p className="text-[11px] text-muted-foreground/80 font-normal mt-0.5">Everything resolved</p>
            </div>
          </div>
        )}
      </div>

      {/* Student Today's Meals & Shortcuts */}
      <div className={`grid grid-cols-1 ${hasMealFeature ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6 items-start`}>
        {/* Today's Meals */}
        {hasMealFeature && (
          <div className="lg:col-span-2 rounded-xl bg-card border border-border p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Today's Meals</h2>
                <p className="text-xs text-muted-foreground">Daily mess dining schedule</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10">
                Full Week Menu <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {mealsToday.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{m.title}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          m.status === 'Active Now'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : m.status === 'Consumed'
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {m.status === 'Active Now' && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        )}
                        {m.status}
                      </span>
                    </div>
                    <div className="text-xs text-foreground font-medium pt-1">{m.item}</div>
                  </div>

                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>{m.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Shortcuts */}
        <div className="rounded-xl bg-card border border-border p-5 space-y-3.5 shadow-xs">
          <h2 className="text-base font-semibold text-foreground">Resident Portal</h2>
          {studentShortcuts.length > 0 ? (
            <div className="space-y-2">
              {studentShortcuts.map((s, idx) => {
                const Icon = s.icon
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border border-border ${s.borderHover} hover:bg-muted/40 transition-colors cursor-pointer flex items-center justify-between gap-3 group`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-colors ${s.color} ${s.hoverBg}`}
                      >
                        <Icon className="h-4 w-4 transition-colors group-hover:text-white dark:group-hover:text-white" />
                      </div>
                      <div>
                        <div className={`text-xs font-semibold text-foreground ${s.hoverText} transition-colors`}>
                          {s.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{s.desc}</div>
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground ${s.hoverText} group-hover:translate-x-0.5 transition-transform`} />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground text-center py-4">
              No additional portals available in your plan.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard Container ────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth)
  const { currentHostel } = useSelector((state: RootState) => state.hostel)
  const { navMain } = useNavigation()
  const role = user?.role

  const { data: fetchedHostel, isLoading } = useGetMyHostel(role)
  const hostel = currentHostel || fetchedHostel

  return (
    <div className="w-full pb-8">
      {role === 'superadmin' ? (
        <SuperadminDashboard user={user} />
      ) : role === 'student' ? (
        <StudentDashboard user={user} hostel={hostel} navMain={navMain} />
      ) : (
        <AdminManagerDashboard
          user={user}
          hostel={hostel}
          isLoading={isLoading}
          navMain={navMain}
        />
      )}
    </div>
  )
}
