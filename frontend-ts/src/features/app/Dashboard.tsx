import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
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
  UserCheck,
  Fingerprint,
  ClipboardCheck,
  TrendingUp,
  MapPin,
  Globe,
  DollarSign,
} from 'lucide-react'
import type { RootState } from '@/store'
import type { PlanFeature } from '@/store/slices/HostelSlice'
import { useGetMyHostel } from '@/hooks/queries/useHostelQueries'
import { useNavigation } from '@/hooks/useNavigation'
import {
  useGetMealSchedule,
  useGetStudentSelections,
  type StudentSelectionRecord,
} from '@/hooks/queries/useMealQueries'
import { useGetBills } from '@/hooks/queries/useBillingQueries'
import { useGetStudentComplaints } from '@/hooks/queries/useComplaintQueries'
import { useGetMyRoom } from '@/hooks/queries/useResidenceQueries'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

// ── Metadata with semantic category color-coding (AGENTS.md 9.1) ───────────
export interface ActionMeta {
  desc: string
  icon: any
  defaultUrl: string
  color: string
  badgeColor: string
  hoverBg: string
  hoverText: string
  borderHover: string
}

const ACTION_METADATA: Record<string, ActionMeta> = {
  // ── People / Access ── (Brand Blue)
  'Manage Users': {
    desc: 'Add, edit, or configure user permissions & records',
    icon: Users,
    defaultUrl: '/app/users',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    hoverBg: 'group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    borderHover: 'hover:border-blue-500/40',
  },

  // ── Residence / Rooms ── (Teal / Cyan)
  'Room Allocation': {
    desc: 'Allot rooms, handle shifts, and track occupancy',
    icon: BedDouble,
    defaultUrl: '/app/residence/allocation',
    color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    badgeColor: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20',
    hoverBg: 'group-hover:bg-teal-600 dark:group-hover:bg-teal-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-teal-600 dark:group-hover:text-teal-400',
    borderHover: 'hover:border-teal-500/40',
  },
  'Room Services': {
    desc: 'Monitor daily room sanitation and cleaning logs',
    icon: Building2,
    defaultUrl: '/app/residence/services',
    color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    badgeColor: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20',
    hoverBg: 'group-hover:bg-teal-600 dark:group-hover:bg-teal-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-teal-600 dark:group-hover:text-teal-400',
    borderHover: 'hover:border-teal-500/40',
  },
  'My Room': {
    desc: 'View your allotted room, roommates & cleaning log',
    icon: BedDouble,
    defaultUrl: '/app/my-room',
    color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    badgeColor: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20',
    hoverBg: 'group-hover:bg-teal-600 dark:group-hover:bg-teal-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-teal-600 dark:group-hover:text-teal-400',
    borderHover: 'hover:border-teal-500/40',
  },

  // ── Food / Meals ── (Emerald Green)
  'Manage Weekly Menu': {
    desc: 'Configure weekly dining menu, dishes & pricing',
    icon: Utensils,
    defaultUrl: '/app/meals/manage-schedule',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    hoverBg: 'group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    borderHover: 'hover:border-emerald-500/40',
  },
  'Weekly Schedule': {
    desc: 'View weekly dining schedule & select meals',
    icon: Utensils,
    defaultUrl: '/app/meals/schedule',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    hoverBg: 'group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    borderHover: 'hover:border-emerald-500/40',
  },
  'Meal Overview': {
    desc: 'Real-time dining counts and session attendance',
    icon: Utensils,
    defaultUrl: '/app/meals/overview',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    hoverBg: 'group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    borderHover: 'hover:border-emerald-500/40',
  },
  'Meal Control': {
    desc: 'Configure dining restrictions and auto-verification',
    icon: Utensils,
    defaultUrl: '/app/meals/control',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    hoverBg: 'group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    borderHover: 'hover:border-emerald-500/40',
  },
  'Meal History': {
    desc: 'Review past dining consumption and records',
    icon: Utensils,
    defaultUrl: '/app/meals/history',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    hoverBg: 'group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    borderHover: 'hover:border-emerald-500/40',
  },

  // ── Finance & Dues ── (Purple / Violet)
  'Manage Hostel Dues': {
    desc: 'Track resident dues, fees, and payments',
    icon: CreditCard,
    defaultUrl: '/app/finance/dues',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
    hoverBg: 'group-hover:bg-purple-600 dark:group-hover:bg-purple-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
    borderHover: 'hover:border-purple-500/40',
  },
  'Generate Bills': {
    desc: 'Generate monthly invoices and custom fee statements',
    icon: FileText,
    defaultUrl: '/app/finance/generate-bills',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
    hoverBg: 'group-hover:bg-purple-600 dark:group-hover:bg-purple-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
    borderHover: 'hover:border-purple-500/40',
  },
  'Edit Meal Prices': {
    desc: 'Review consumed meals, adjust rates & recalculate totals',
    icon: DollarSign,
    defaultUrl: '/app/finance/meal-prices',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
    hoverBg: 'group-hover:bg-purple-600 dark:group-hover:bg-purple-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
    borderHover: 'hover:border-purple-500/40',
  },

  // ── Attendance & Configuration ── (Neutral Slate)
  'Attendance': {
    desc: 'Manage and review student attendance registers',
    icon: ClipboardCheck,
    defaultUrl: '/app/attendance',
    color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    badgeColor: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    hoverBg: 'group-hover:bg-slate-700 dark:group-hover:bg-slate-600 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-slate-700 dark:group-hover:text-slate-300',
    borderHover: 'hover:border-slate-500/40',
  },
  'Manual Attendance': {
    desc: 'Log manual attendance entries and waivers',
    icon: UserCheck,
    defaultUrl: '/app/attendance/manual',
    color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    badgeColor: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    hoverBg: 'group-hover:bg-slate-700 dark:group-hover:bg-slate-600 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-slate-700 dark:group-hover:text-slate-300',
    borderHover: 'hover:border-slate-500/40',
  },
  'QR Attendance': {
    desc: 'Manage dynamic QR attendance and scanner points',
    icon: QrCode,
    defaultUrl: '/app/attendance/qr',
    color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    badgeColor: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    hoverBg: 'group-hover:bg-slate-700 dark:group-hover:bg-slate-600 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-slate-700 dark:group-hover:text-slate-300',
    borderHover: 'hover:border-slate-500/40',
  },
  'Biometric Attendance': {
    desc: 'Sync fingerprint and biometric gate terminals',
    icon: Fingerprint,
    defaultUrl: '/app/attendance/biometric',
    color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    badgeColor: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    hoverBg: 'group-hover:bg-slate-700 dark:group-hover:bg-slate-600 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-slate-700 dark:group-hover:text-slate-300',
    borderHover: 'hover:border-slate-500/40',
  },
  'Mark Attendance': {
    desc: 'Scan live QR code at the counter for meal check-in',
    icon: QrCode,
    defaultUrl: '/app/attendance/mark',
    color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    badgeColor: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    hoverBg: 'group-hover:bg-slate-700 dark:group-hover:bg-slate-600 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-slate-700 dark:group-hover:text-slate-300',
    borderHover: 'hover:border-slate-500/40',
  },
  'Hostel Configuration': {
    desc: 'Configure hostel settings, custom fields & rules',
    icon: Settings2,
    defaultUrl: '/app/hostel-configuration',
    color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    badgeColor: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    hoverBg: 'group-hover:bg-slate-700 dark:group-hover:bg-slate-600 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-slate-700 dark:group-hover:text-slate-300',
    borderHover: 'hover:border-slate-500/40',
  },

  // ── Alerts & Complaints ── (Warm Amber)
  'Complaints': {
    desc: 'Review, triage, and resolve maintenance tickets',
    icon: AlertCircle,
    defaultUrl: '/app/complaints',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    hoverBg: 'group-hover:bg-amber-600 dark:group-hover:bg-amber-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    borderHover: 'hover:border-amber-500/40',
  },
  'My Complaints': {
    desc: 'File maintenance issues and track resolution status',
    icon: AlertCircle,
    defaultUrl: '/app/complaints',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    hoverBg: 'group-hover:bg-amber-600 dark:group-hover:bg-amber-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    borderHover: 'hover:border-amber-500/40',
  },

  // ── Superadmin Portals ──
  'All Hostels': {
    desc: 'Manage tenant directories, licenses, and subdomains',
    icon: Building2,
    defaultUrl: '/app/superadmin/hostels',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    hoverBg: 'group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    borderHover: 'hover:border-blue-500/40',
  },
  'System Health': {
    desc: 'Real-time telemetry, cluster nodes, and error logs',
    icon: Activity,
    defaultUrl: '/app/system-health',
    color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    badgeColor: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
    hoverBg: 'group-hover:bg-cyan-600 dark:group-hover:bg-cyan-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400',
    borderHover: 'hover:border-cyan-500/40',
  },
  'Manage Plans': {
    desc: 'Configure subscription packages, quotas, and pricing',
    icon: Layers,
    defaultUrl: '/app/superadmin/plans',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
    hoverBg: 'group-hover:bg-purple-600 dark:group-hover:bg-purple-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
    borderHover: 'hover:border-purple-500/40',
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
  badgeColor: string
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
            defaultUrl: subItem.url || '#',
            color: 'bg-muted text-foreground border-border',
            badgeColor: 'bg-muted text-foreground border-border',
            hoverBg: 'group-hover:bg-primary group-hover:text-primary-foreground dark:group-hover:text-primary-foreground',
            hoverText: 'group-hover:text-primary',
            borderHover: 'hover:border-primary/40',
          }
          actions.push({
            title: subItem.title,
            url: subItem.url && subItem.url !== '#' ? subItem.url : meta.defaultUrl,
            icon: meta.icon,
            desc: meta.desc,
            color: meta.color,
            badgeColor: meta.badgeColor,
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
        defaultUrl: section.url || '#',
        color: 'bg-muted text-foreground border-border',
        badgeColor: 'bg-muted text-foreground border-border',
        hoverBg: 'group-hover:bg-primary group-hover:text-primary-foreground dark:group-hover:text-primary-foreground',
        hoverText: 'group-hover:text-primary',
        borderHover: 'hover:border-primary/40',
      }
      actions.push({
        title: section.title,
        url: section.url && section.url !== '#' ? section.url : meta.defaultUrl,
        icon: meta.icon,
        desc: meta.desc,
        color: meta.color,
        badgeColor: meta.badgeColor,
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
  const navigate = useNavigate()

  const stats = [
    {
      label: 'Total Hostels',
      value: '42',
      change: '+3 registered this month',
      isPositive: true,
      icon: Building2,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      actionUrl: '/app/superadmin/hostels',
    },
    {
      label: 'Active Students',
      value: '3,850',
      change: '+12% from last academic term',
      isPositive: true,
      icon: Users,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      actionUrl: '/app/users',
    },
    {
      label: 'Active Plans',
      value: '4 Tiers',
      change: 'Standard • Pro • Enterprise',
      isPositive: null,
      icon: Layers,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
      actionUrl: '/app/superadmin/plans',
    },
    {
      label: 'System Health',
      value: '99.98%',
      change: 'All cluster nodes nominal',
      isPositive: true,
      icon: Activity,
      color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
      actionUrl: '/app/system-health',
    },
  ]

  const recentHostels = [
    { name: 'Al-Razi Boys Hostel', subdomain: 'al-razi', students: 240, plan: 'Enterprise', status: 'Active', color: 'emerald' },
    { name: 'Iqbal Hall Residence', subdomain: 'iqbal-hall', students: 480, plan: 'Pro', status: 'Active', color: 'emerald' },
    { name: 'Fatima Girls Hostel', subdomain: 'fatima-hall', students: 310, plan: 'Enterprise', status: 'Active', color: 'emerald' },
    { name: 'Jinnah Executive Hostel', subdomain: 'jinnah-exec', students: 160, plan: 'Standard', status: 'Trial', color: 'amber' },
  ]

  const superAdminActions = [
    ACTION_METADATA['All Hostels'],
    ACTION_METADATA['Manage Users'],
    ACTION_METADATA['Manage Plans'],
    ACTION_METADATA['System Health'],
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Superadmin Portal
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Live Infrastructure
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {getGreeting()}, {user?.name || 'Administrator'}
          </h1>
          <p className="text-xs text-muted-foreground">
            Multi-tenant governance, global subscription health, and cluster infrastructure monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={() => navigate('/app/superadmin/hostels')}
            size="sm"
            className="gap-1.5 shadow-sm font-medium cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Hostel Tenant
          </Button>
        </div>
      </div>

      {/* Stats Grid with 20px padding */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              onClick={() => navigate(stat.actionUrl)}
              className="p-5 rounded-2xl bg-card border border-border/80 hover:border-blue-500/40 transition-all flex flex-col justify-between gap-3 shadow-xs cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {stat.label}
                </span>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${stat.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tight text-foreground font-mono">
                  {stat.value}
                </div>
                <p className={`text-[11px] mt-1 flex items-center gap-1 ${stat.isPositive ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground/80'}`}>
                  {stat.isPositive && <TrendingUp className="h-3 w-3" />}
                  {stat.change}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Launch Cards */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Global Control Centers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {superAdminActions.map((action, idx) => {
            const Icon = action.icon
            const title = Object.keys(ACTION_METADATA).find((k) => ACTION_METADATA[k] === action) || 'Action'
            return (
              <div
                key={idx}
                onClick={() => navigate(action.defaultUrl)}
                className={`p-5 rounded-2xl bg-card border border-border/80 ${action.borderHover} hover:bg-muted/20 transition-all cursor-pointer group flex flex-col justify-between gap-3 shadow-xs`}
              >
                <div className="flex items-center justify-between">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center border transition-colors ${action.color} ${action.hoverBg}`}>
                    <Icon className="h-4 w-4 transition-colors group-hover:text-white dark:group-hover:text-white" />
                  </div>
                  <ChevronRight className={`h-4 w-4 text-muted-foreground ${action.hoverText} group-hover:translate-x-0.5 transition-all`} />
                </div>
                <div>
                  <h3 className={`text-sm font-semibold text-foreground ${action.hoverText} transition-colors`}>
                    {title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tenants Table & Platform Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border/80 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div>
              <h2 className="text-base font-semibold text-foreground">Registered Tenants</h2>
              <p className="text-xs text-muted-foreground">Recent hostel onboarding & tenant subscription status</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/superadmin/hostels')}
              className="text-xs gap-1 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 cursor-pointer"
            >
              Directory <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
                  <th className="pb-3 font-semibold">Hostel Name</th>
                  <th className="pb-3 font-semibold">Subdomain</th>
                  <th className="pb-3 font-semibold">Residents</th>
                  <th className="pb-3 font-semibold">Plan</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recentHostels.map((h, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-semibold text-foreground">{h.name}</td>
                    <td className="py-3 text-muted-foreground font-mono">{h.subdomain}.messpro.app</td>
                    <td className="py-3 text-foreground font-mono font-medium">{h.students}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground border border-border">
                        {h.plan}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${h.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
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
        <div className="rounded-2xl bg-card border border-border/80 p-5 space-y-4 shadow-xs">
          <div>
            <h2 className="text-base font-semibold text-foreground">Global Cluster Health</h2>
            <p className="text-xs text-muted-foreground">Live cluster node telemetry</p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-foreground">Auth & Token Service</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">14ms</span>
            </div>
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-foreground">Real-time WebSocket Bus</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">Active</span>
            </div>
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-foreground">MongoDB Replica Sets</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">Healthy</span>
            </div>
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-foreground">Media CDN Storage</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">99.9%</span>
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
  const navigate = useNavigate()
  const role = user?.role
  const perms: string[] = user?.permissions || []

  const daysRemaining = calculateDaysRemaining(hostel?.subscriptionExpiresAt || hostel?.trialExpiresAt)
  const isExpired = hostel?.status === 'Expired' || daysRemaining === 0

  const planName = hostel?.plan?.name || 'Standard Plan'
  const maxCapacity = hostel?.plan?.limits?.maxStudents || 300
  const activeResidents = 184
  const occupancyPct = Math.min(100, Math.round((activeResidents / maxCapacity) * 100))

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

  // Dynamic Statistics with distinct category tints (AGENTS.md 9.1)
  const stats = []

  if (hasResidencePerm) {
    stats.push({
      label: 'Resident Capacity',
      value: `${activeResidents} / ${maxCapacity}`,
      subtext: `${occupancyPct}% occupied`,
      icon: BedDouble,
      color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20',
      actionUrl: '/app/residence/allocation',
      progress: occupancyPct,
      progressColor: occupancyPct >= 90 ? 'bg-rose-500' : 'bg-teal-500',
    })
  }

  if (hasMealPerm) {
    stats.push({
      label: "Today's Active Meals",
      value: '142',
      subtext: 'Lunch attendance logged',
      icon: Utensils,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      actionUrl: '/app/meals/manage-schedule',
    })
  }

  if (hasComplaintPerm) {
    stats.push({
      label: 'Pending Complaints',
      value: '3',
      subtext: '2 maintenance, 1 mess',
      icon: AlertCircle,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      actionUrl: '/app/complaints',
    })
  }

  if (hasBillPerm) {
    stats.push({
      label: 'Monthly Fee Collection',
      value: '88%',
      subtext: '16 pending dues invoices',
      icon: CreditCard,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
      actionUrl: '/app/finance/dues',
    })
  }

  if (hasUserPerm && stats.length < 4) {
    stats.push({
      label: 'Directory Members',
      value: '18',
      subtext: 'Active management staff',
      icon: Users,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      actionUrl: '/app/users',
    })
  }

  if (stats.length === 0) {
    stats.push({
      label: 'Hostel Status',
      value: hostel?.status || 'Active',
      subtext: `${planName}`,
      icon: Building2,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      actionUrl: '/app/hostel-configuration',
    })
  }

  // Extract quick actions dynamically from sidebar navMain
  const quickActions = extractQuickActions(navMain)

  const todaysMeals = [
    { name: 'Breakfast', time: '07:30 AM – 09:30 AM', menu: 'Omelette, Crispy Paratha, Karak Chai', status: 'Completed' },
    { name: 'Lunch', time: '12:30 PM – 02:30 PM', menu: 'Special Chicken Biryani, Mint Raita & Salad', status: 'Serving' },
    { name: 'Dinner', time: '07:30 PM – 09:30 PM', menu: 'Daal Makhni, Fresh Tandoori Roti & Dessert', status: 'Upcoming' },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Expiration Banner if applicable */}
      {isExpired && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold">Subscription Expired:</span> Your current hostel subscription plan has ended.
            Please renew to retain full management features.
          </div>
        </div>
      )}

      {/* Hostel Brand Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
              {hostel?.name || 'Hostel Operations'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
              {planName}
            </span>
            {daysRemaining !== null && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${daysRemaining <= 7
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-muted text-muted-foreground'
                  }`}
              >
                <Clock className="h-3 w-3 text-amber-500" />
                {daysRemaining} days remaining
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {getGreeting()}, {user?.name || (role === 'admin' ? 'Administrator' : 'Manager')}
          </h1>
          <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              {hostel?.location || 'Campus Residence'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-mono">
              <Globe className="h-3 w-3 text-muted-foreground" />
              {hostel?.subdomain ? `${hostel.subdomain}.messpro.app` : 'hostel.messpro.app'}
            </span>
          </div>
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
              onClick={() => {
                if (stat.actionUrl && stat.actionUrl !== '#') {
                  navigate(stat.actionUrl)
                }
              }}
              className="p-5 rounded-2xl bg-card border border-border/80 hover:border-blue-500/40 transition-all flex flex-col justify-between gap-3 shadow-xs cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {stat.label}
                </span>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${stat.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tight text-foreground font-mono">
                  {stat.value}
                </div>
                <div className="text-[11px] text-muted-foreground/80 font-normal mt-0.5">{stat.subtext}</div>
                {stat.progress !== undefined && (
                  <div className="h-1.5 w-full bg-muted rounded-full mt-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${stat.progressColor || 'bg-teal-500'}`}
                      style={{ width: `${stat.progress}%` }}
                    />
                  </div>
                )}
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
            <h2 className="text-base font-semibold text-foreground">Operational Shortcuts</h2>
            <span className="text-xs text-muted-foreground">Permitted feature control</span>
          </div>

          {quickActions.length > 0 ? (
            <div className={`grid grid-cols-1 ${hasMealPerm ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-3.5`}>
              {quickActions.map((action, i) => {
                const Icon = action.icon
                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (action.url && action.url !== '#') {
                        navigate(action.url)
                      }
                    }}
                    className={`p-5 rounded-2xl bg-card border border-border/80 ${action.borderHover} hover:bg-muted/20 transition-all cursor-pointer group flex flex-col justify-between gap-3 shadow-xs`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center border transition-colors ${action.color} ${action.hoverBg}`}
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
            <div className="p-8 rounded-2xl bg-card border border-border text-center text-muted-foreground text-xs">
              No management shortcuts assigned to your active permissions.
            </div>
          )}

          {/* Attendance Automation Banner */}
          {role === 'admin' && hasAttendancePerm && (
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between gap-3 mt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-foreground">Attendance Automation:</span>
                  <span className="text-muted-foreground ml-1.5">
                    Automated QR & biometric check-in engine active.
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/attendance')}
                className="text-xs h-8 shrink-0 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 cursor-pointer"
              >
                Configure
              </Button>
            </div>
          )}
        </div>

        {/* Today's Mess Schedule: Shown ONLY if user.permissions includes meal_settings */}
        {hasMealPerm && (
          <div className="rounded-2xl bg-card border border-border/80 p-5 space-y-4 shadow-xs lg:sticky lg:top-16">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Utensils className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">Today's Menu</h2>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  Live Mess
                </span>
              </div>

              <div className="space-y-3">
                {todaysMeals.map((meal, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-1.5 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{meal.name}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${meal.status === 'Serving'
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

// ── Student Dashboard (Real Data Connected) ─────────────────────────────
function StudentDashboard({
  user,
  hostel,
  navMain,
}: {
  user: any
  hostel: any
  navMain: any[]
}) {
  const navigate = useNavigate()
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

  // ── Date Computations ────────────────────────────────────────────────
  const now = new Date()
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ] as const
  const todayDayName = daysOfWeek[now.getDay()]
  const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  // ── Real Data Queries ────────────────────────────────────────────────
  const { data: myRoom } = useGetMyRoom(hasResidenceFeature)
  const { data: schedule, isLoading: isScheduleLoading } = useGetMealSchedule(hasMealFeature)
  const { data: todaySelections = [], isLoading: isSelectionsLoading } = useGetStudentSelections(
    todayDateStr,
    todayDateStr
  )
  const { data: currentBills = [], isLoading: isBillsLoading } = useGetBills({ demand: 'current' })
  const { data: complaints = [], isLoading: isComplaintsLoading } = useGetStudentComplaints(hasComplaintFeature)

  // ── Derived Summaries ────────────────────────────────────────────────
  // Clean human-readable room name (avoiding raw 24-char MongoDB ObjectId)
  const displayRoomName = useMemo(() => {
    if (myRoom?.roomName) return myRoom.roomName
    if (typeof user?.room === 'object' && user?.room?.roomName) return user.room.roomName
    if (typeof user?.room === 'string' && !/^[0-9a-fA-F]{24}$/.test(user.room)) return user.room
    return 'Room Pending'
  }, [myRoom, user?.room])

  const mealNames = schedule?.mealNames?.length ? schedule.mealNames : ['Breakfast', 'Lunch', 'Dinner']
  const todayMenuItems = schedule?.menu?.[todayDayName] || []
  const timings = schedule?.selectionTiming || []

  // Count how many meals are reserved/claimed for today
  const reservedCount = todaySelections.filter(
    (s) => s.date === todayDateStr && (s.count > 0 || s.hasSelected)
  ).length
  const totalMealsCount = mealNames.length

  // Total current unpaid dues
  const totalRemainingDues = currentBills.reduce((acc, curr) => acc + (curr.remainingBill || 0), 0)

  // Active open complaints
  const activeTickets = complaints.filter((c) => c.status !== 'Resolved')

  const studentShortcuts = extractQuickActions(navMain)

  return (
    <div className="space-y-6">
      {/* 1. Student Welcome Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Student Resident
            </span>
            {hasResidenceFeature && (
              <button
                type="button"
                onClick={() => navigate('/app/my-room')}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/20 transition-colors cursor-pointer"
              >
                <BedDouble className="h-3 w-3" />
                {displayRoomName}
              </button>
            )}
            <span className="text-xs text-muted-foreground font-medium">
              &bull; {todayDayName}, {now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {getGreeting()}, {user?.name || 'Student'}
          </h1>
          <p className="text-xs text-muted-foreground">
            Resident of <strong className="text-foreground">{hostelName}</strong> &bull; Roll / ID:{' '}
            <span className="font-mono text-foreground font-semibold">
              {user?.id || user?._id || 'STD-8841'}
            </span>
          </p>
        </div>

        {/* QR attendance button only if qr_attendance feature is enabled */}
        {hasQrFeature && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Button
              size="sm"
              onClick={() => navigate('/app/meals/attendance')}
              className="gap-2 shadow-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            >
              <QrCode className="h-4 w-4" />
              Mark Attendance
            </Button>
          </div>
        )}
      </div>

      {/* 2. Real-Time Connected Stat Highlights (Mobile-Optimized Compact Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        {/* A. Today's Mess Status (Emerald Green) */}
        {hasMealFeature && (
          <div
            onClick={() => navigate('/app/meals/schedule')}
            className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-card border border-border/80 hover:border-emerald-500/40 transition-all shadow-xs cursor-pointer group flex sm:flex-col items-center sm:items-stretch justify-between gap-3 sm:gap-2"
          >
            <div className="flex items-center gap-2.5 sm:justify-between w-auto sm:w-full">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform">
                <Utensils className="h-4 w-4" />
              </div>
              <div className="sm:hidden">
                <div className="text-xs font-semibold text-foreground">
                  Today&apos;s Meals
                </div>
                <div className="text-[11px] text-muted-foreground font-normal">
                  {todayDayName} Menu
                </div>
              </div>
              <span className="hidden sm:inline text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Today&apos;s Meals ({todayDayName})
              </span>
            </div>

            <div className="text-right sm:text-left shrink-0 sm:shrink">
              <div className="text-sm sm:text-2xl font-bold text-foreground">
                {isSelectionsLoading || isScheduleLoading ? (
                  <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 ml-auto sm:ml-0" />
                ) : (
                  `${reservedCount}/${totalMealsCount} Reserved`
                )}
              </div>
              <p className="hidden sm:block text-[11px] text-muted-foreground/80 font-normal mt-0.5">
                {reservedCount === totalMealsCount
                  ? 'All meals reserved for today'
                  : 'Tap to update today\'s selections'}
              </p>
            </div>
          </div>
        )}

        {/* B. Monthly Dues & Pending Balance (Purple / Violet) */}
        <div
          onClick={() => navigate('/app/my-bills')}
          className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-card border border-border/80 hover:border-purple-500/40 transition-all shadow-xs cursor-pointer group flex sm:flex-col items-center sm:items-stretch justify-between gap-3 sm:gap-2"
        >
          <div className="flex items-center gap-2.5 sm:justify-between w-auto sm:w-full">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="sm:hidden">
              <div className="text-xs font-semibold text-foreground">
                Current Dues
              </div>
              <div className="text-[11px] text-muted-foreground font-normal">
                Billing Cycle
              </div>
            </div>
            <span className="hidden sm:inline text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Current Cycle Dues
            </span>
          </div>

          <div className="text-right sm:text-left shrink-0 sm:shrink">
            <div className="text-sm sm:text-2xl font-bold text-foreground">
              {isBillsLoading ? (
                <Skeleton className="h-6 sm:h-8 w-20 sm:w-28 ml-auto sm:ml-0" />
              ) : totalRemainingDues > 0 ? (
                <span className="text-purple-600 dark:text-purple-400 font-mono">
                  Rs. {totalRemainingDues.toLocaleString()}
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">All Clear</span>
              )}
            </div>
            <p className="hidden sm:block text-[11px] text-muted-foreground/80 font-normal mt-0.5">
              {totalRemainingDues > 0
                ? `${currentBills.length} active invoice statement(s)`
                : 'Zero outstanding dues on file'}
            </p>
          </div>
        </div>

        {/* C. Maintenance & Complaints (Warm Amber) */}
        {hasComplaintFeature && (
          <div
            onClick={() => navigate('/app/complaints')}
            className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-card border border-border/80 hover:border-amber-500/40 transition-all shadow-xs cursor-pointer group flex sm:flex-col items-center sm:items-stretch justify-between gap-3 sm:gap-2"
          >
            <div className="flex items-center gap-2.5 sm:justify-between w-auto sm:w-full">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0 group-hover:scale-105 transition-transform">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div className="sm:hidden">
                <div className="text-xs font-semibold text-foreground">
                  Complaints
                </div>
                <div className="text-[11px] text-muted-foreground font-normal">
                  Hostel Tickets
                </div>
              </div>
              <span className="hidden sm:inline text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Maintenance Tickets
              </span>
            </div>

            <div className="text-right sm:text-left shrink-0 sm:shrink">
              <div className="text-sm sm:text-2xl font-bold text-foreground">
                {isComplaintsLoading ? (
                  <Skeleton className="h-6 sm:h-8 w-16 sm:w-24 ml-auto sm:ml-0" />
                ) : activeTickets.length > 0 ? (
                  `${activeTickets.length} Open`
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">All Resolved</span>
                )}
              </div>
              <p className="hidden sm:block text-[11px] text-muted-foreground/80 font-normal mt-0.5">
                {activeTickets.length > 0
                  ? `Latest: ${activeTickets[0].category} (${activeTickets[0].status})`
                  : 'Zero pending maintenance issues'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Today's Real Dining Schedule & Quick Launch Grid */}
      <div
        className={`grid grid-cols-1 ${hasMealFeature ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-4 items-start`}
      >
        {/* Today's Real Meals from Weekly Schedule */}
        {hasMealFeature && (
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border/80 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Today&apos;s Dining Schedule ({todayDayName})
                </h2>
                <p className="text-xs text-muted-foreground">
                  Live menu and attendance reservation for today
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/meals/schedule')}
                className="text-xs gap-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
              >
                Weekly Menu <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {isScheduleLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {mealNames.map((mealName, idx) => {
                  const menuItem =
                    todayMenuItems[idx] ||
                    todayMenuItems.find(
                      (m: any) =>
                        (m.mealType || m.type || '').toLowerCase() ===
                        mealName.toLowerCase()
                    )
                  const dishName =
                    (menuItem as any)?.meal ||
                    (menuItem as any)?.name ||
                    "Chef's Choice Daily Special"
                  const price = menuItem?.price || 0
                  const timeWindow = timings[idx] || 'Scheduled Dining Session'

                  // Find today's student selection/attendance record
                  const selRecord = todaySelections.find(
                    (s: StudentSelectionRecord) =>
                      s.mealType.toLowerCase() === mealName.toLowerCase() &&
                      s.date === todayDateStr
                  )

                  const hasEaten = selRecord?.attendance?.hasEaten === true
                  const isReserved =
                    Boolean(selRecord?.hasSelected || selRecord?.selection?.hasSelected) &&
                    (selRecord?.count || selRecord?.selection?.count || 0) > 0

                  return (
                    <div
                      key={mealName}
                      className="p-4 rounded-xl border border-border/70 bg-muted/20 flex flex-col justify-between gap-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">{mealName}</span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${hasEaten
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : isReserved
                                  ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                          >
                            {hasEaten ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                Claimed
                              </>
                            ) : isReserved ? (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block" />
                                Reserved (x{selRecord?.count || selRecord?.selection?.count || 1})
                              </>
                            ) : (
                              'Not Reserved'
                            )}
                          </span>
                        </div>

                        <div className="text-xs text-foreground font-medium pt-1">
                          {dishName}
                        </div>

                        {price > 0 && (
                          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                            Rs. {price}
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>{timeWindow}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Resident Portal Shortcuts */}
        <div className="rounded-2xl bg-card border border-border/80 p-5 space-y-3.5 shadow-xs">
          <h2 className="text-base font-semibold text-foreground">Resident Portal</h2>
          {studentShortcuts.length > 0 ? (
            <div className="space-y-2">
              {studentShortcuts.map((s, idx) => {
                const Icon = s.icon
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (s.url && s.url !== '#') {
                        navigate(s.url)
                      }
                    }}
                    className={`p-3.5 rounded-xl border border-border/80 ${s.borderHover} hover:bg-muted/40 transition-colors cursor-pointer flex items-center justify-between gap-3 group`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-colors ${s.color} ${s.hoverBg}`}
                      >
                        <Icon className="h-4 w-4 transition-colors group-hover:text-white dark:group-hover:text-white" />
                      </div>
                      <div>
                        <div
                          className={`text-xs font-semibold text-foreground ${s.hoverText} transition-colors`}
                        >
                          {s.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{s.desc}</div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 text-muted-foreground ${s.hoverText} group-hover:translate-x-0.5 transition-transform`}
                    />
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
