import {
  Users,
  Building2,
  BedDouble,
  Utensils,
  CreditCard,
  FileText,
  DollarSign,
  ClipboardCheck,
  UserCheck,
  QrCode,
  Fingerprint,
  Settings2,
  AlertCircle,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react'

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

export const ACTION_METADATA: Record<string, ActionMeta> = {
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
  'My Bills': {
    desc: 'View personal invoices, arrears, and download receipts',
    icon: FileText,
    defaultUrl: '/app/my-bills',
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
    desc: 'Scan live dining hall QR code or display badge',
    icon: QrCode,
    defaultUrl: '/app/meals/qr',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    hoverBg: 'group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:text-white',
    hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    borderHover: 'hover:border-emerald-500/40',
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

export function calculateDaysRemaining(expiresAt?: string | { $date: string }): number | null {
  if (!expiresAt) return null
  const dateStr = typeof expiresAt === 'string' ? expiresAt : expiresAt.$date
  if (!dateStr) return null
  const diffMs = new Date(dateStr).getTime() - new Date().getTime()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

export function getGreeting(): string {
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

export function extractQuickActions(navItems: any[]): QuickActionItem[] {
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
