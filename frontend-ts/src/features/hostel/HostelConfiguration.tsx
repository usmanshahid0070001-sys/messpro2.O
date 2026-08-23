import { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  Save,
  Plus,
  Trash2,
  Settings2,
  Lock,
  QrCode,
  Fingerprint,
  UserCheck,
  Building2,
  Utensils,
  CreditCard,
  AlertCircle,
  Sparkles,
  ChevronDown,
  Globe,
  Clock,
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  RotateCcw,
  Users,
  Shield,
  Layers,
  BedDouble,
  Info,
  SlidersHorizontal,
} from 'lucide-react'
import type { RootState } from '@/store'
import { useGetMyHostel } from '@/hooks/queries/useHostelQueries'
import {
  useUpdateMyHostelSettings,
  type CustomRegistrationField,
  type PlanFeatureConfig,
} from '@/hooks/mutations/useHostelMutations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

// ── Timezone options ─────────────────────────────────────────────────────────
const TIMEZONE_OPTIONS = [
  { value: 'Asia/Karachi', label: 'Asia/Karachi — PKT (UTC+5)', city: 'Karachi, Pakistan' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai — GST (UTC+4)', city: 'Dubai, UAE' },
  { value: 'Asia/Riyadh', label: 'Asia/Riyadh — AST (UTC+3)', city: 'Riyadh, Saudi Arabia' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata — IST (UTC+5:30)', city: 'New Delhi, India' },
  { value: 'Asia/Dhaka', label: 'Asia/Dhaka — BST (UTC+6)', city: 'Dhaka, Bangladesh' },
  { value: 'Europe/London', label: 'Europe/London — GMT/BST (UTC+0/+1)', city: 'London, UK' },
  { value: 'America/New_York', label: 'America/New_York — EST/EDT (UTC-5/-4)', city: 'New York, USA' },
  { value: 'America/Chicago', label: 'America/Chicago — CST/CDT (UTC-6/-5)', city: 'Chicago, USA' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles — PST/PDT (UTC-8/-7)', city: 'Los Angeles, USA' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney — AEST (UTC+10)', city: 'Sydney, Australia' },
  { value: 'UTC', label: 'UTC — Coordinated Universal Time', city: 'Universal Standard' },
]

// ── Core features are always locked enabled when present in plan ─────────────
const CORE_FEATURE_NAMES = [
  'user_management',
  'hostel_configuration',
  'bill_management',
  'bill_generation',
  'residence_management',
]

const normalize = (name: string) => (name || '').toLowerCase().replace(/[\s-]+/g, '_')

const isCore = (name: string) => CORE_FEATURE_NAMES.includes(normalize(name))

// Semantic Category Color & Icon Mapping (AGENTS.md 9.1)
const featureMeta = (
  name: string
): {
  icon: React.ElementType
  label: string
  desc: string
  category: 'core' | 'attendance' | 'service'
  badgeColor: string
  activeColor: string
} => {
  const n = normalize(name)

  if (n.includes('user')) {
    return {
      icon: UserCheck,
      label: 'User Management',
      desc: 'Resident & staff directory with granular permission controls',
      category: 'core',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      activeColor: 'text-blue-600 dark:text-blue-400',
    }
  }
  if (n.includes('hostel_config')) {
    return {
      icon: Settings2,
      label: 'Hostel Configuration',
      desc: 'Branding, timezone, registration fields and module gates',
      category: 'core',
      badgeColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
      activeColor: 'text-slate-600 dark:text-slate-400',
    }
  }
  if (n.includes('bill_gen') || n.includes('generation')) {
    return {
      icon: CreditCard,
      label: 'Bill Generation',
      desc: 'Automated invoice runs and recurring monthly billing generation',
      category: 'core',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      activeColor: 'text-purple-600 dark:text-purple-400',
    }
  }
  if (n.includes('bill')) {
    return {
      icon: CreditCard,
      label: 'Bill Management',
      desc: 'Dues ledger, fee receipts, and payment reconciliation tracking',
      category: 'core',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      activeColor: 'text-purple-600 dark:text-purple-400',
    }
  }
  if (n.includes('residence') || n.includes('room')) {
    return {
      icon: Building2,
      label: 'Residence Management',
      desc: 'Room inventory, bed allocation matrix, and occupancy tracking',
      category: 'core',
      badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      activeColor: 'text-teal-600 dark:text-teal-400',
    }
  }
  if (n.includes('manual_attendance')) {
    return {
      icon: UserCheck,
      label: 'Manual Rollcall Attendance',
      desc: 'Staff-supervised dining check-ins and paperless roster logs',
      category: 'attendance',
      badgeColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
      activeColor: 'text-slate-600 dark:text-slate-400',
    }
  }
  if (n.includes('qr')) {
    return {
      icon: QrCode,
      label: 'QR Code Attendance Token',
      desc: 'Instant counter scanning using dynamic student QR codes',
      category: 'attendance',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      activeColor: 'text-indigo-600 dark:text-indigo-400',
    }
  }
  if (n.includes('biometric')) {
    return {
      icon: Fingerprint,
      label: 'Biometric Scanner Hardware',
      desc: 'Hardware device sync with fingerprint & face verification devices',
      category: 'attendance',
      badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      activeColor: 'text-cyan-600 dark:text-cyan-400',
    }
  }
  if (n.includes('complaint')) {
    return {
      icon: AlertCircle,
      label: 'Complaint & Maintenance Tickets',
      desc: 'Resident maintenance tickets, staff dispatch, and SLA resolution',
      category: 'service',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      activeColor: 'text-amber-600 dark:text-amber-400',
    }
  }
  if (n.includes('meal') || n.includes('schedule') || n.includes('dining')) {
    return {
      icon: Utensils,
      label: 'Mess Schedule & Menu Management',
      desc: 'Weekly dish schedule, pre-order cutoff windows, and portion limits',
      category: 'service',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      activeColor: 'text-emerald-600 dark:text-emerald-400',
    }
  }
  return {
    icon: Sparkles,
    label: name.replace(/_/g, ' '),
    desc: 'Supplemental hostel management module',
    category: 'service',
    badgeColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    activeColor: 'text-slate-600 dark:text-slate-400',
  }
}

// ── Uniform Feature Card ──────────────────────────────────────────────────
function FeatureCard({
  feat,
  locked,
  onToggle,
}: {
  feat: PlanFeatureConfig
  locked: boolean
  onToggle?: () => void
}) {
  const meta = featureMeta(feat.name)
  const Icon = meta.icon

  return (
    <div
      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3.5 ${
        feat.isEnabled
          ? 'bg-card border-border shadow-xs'
          : 'bg-muted/30 border-border/60 opacity-60'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className={`p-2.5 rounded-xl border shrink-0 ${meta.badgeColor}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground block truncate">
              {meta.label}
            </span>
            {locked && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md text-[9px] font-semibold bg-muted text-muted-foreground border border-border">
                <Lock className="h-2.5 w-2.5" />
                Core
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
            {meta.desc}
          </p>
        </div>
      </div>

      <div className="shrink-0 pt-0.5">
        {locked ? (
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 select-none">
            <Check className="h-3.5 w-3.5" />
            Active
          </span>
        ) : (
          <Switch
            checked={feat.isEnabled}
            onCheckedChange={onToggle}
            className="cursor-pointer"
          />
        )}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────
export default function HostelConfiguration() {
  const { user } = useSelector((s: RootState) => s.auth)
  const { currentHostel } = useSelector((s: RootState) => s.hostel)
  const role = user?.role

  const { data: fetchedHostel, isLoading } = useGetMyHostel(role)
  const hostel = fetchedHostel || currentHostel
  const mutation = useUpdateMyHostelSettings()

  const [subdomain, setSubdomain] = useState('')
  const [location, setLocation] = useState('Asia/Karachi')
  const [autoMealVerification, setAutoMeal] = useState(true)
  const [customFields, setCustomFields] = useState<CustomRegistrationField[]>([])
  const [features, setFeatures] = useState<PlanFeatureConfig[]>([])
  const [copiedSecret, setCopiedSecret] = useState(false)

  // Seed from server data
  useEffect(() => {
    if (!hostel) return
    setSubdomain(hostel.subdomain || '')
    setLocation(hostel.location || 'Asia/Karachi')
    setAutoMeal(hostel.settings?.autoMealVerification ?? true)
    setCustomFields(
      (hostel.customRegistrationFields || []).map((f: any) => ({
        name: f.name || '',
        isRequired: Boolean(f.isRequired),
      }))
    )
    setFeatures(
      (hostel.plan?.features || []).map((f: any) => ({
        name: f.name,
        isEnabled: isCore(f.name) ? true : Boolean(f.isEnabled),
      }))
    )
  }, [hostel])

  // Feature groups
  const { coreGroup, attendanceGroup, serviceGroup } = useMemo(() => {
    const core: PlanFeatureConfig[] = []
    const attendance: PlanFeatureConfig[] = []
    const service: PlanFeatureConfig[] = []
    for (const f of features) {
      const cat = featureMeta(f.name).category
      if (cat === 'core') core.push(f)
      else if (cat === 'attendance') attendance.push(f)
      else service.push(f)
    }
    return { coreGroup: core, attendanceGroup: attendance, serviceGroup: service }
  }, [features])

  // Real-time live clock for selected timezone
  const currentTimeInZone = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: location,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(new Date())
    } catch {
      return new Date().toLocaleTimeString()
    }
  }, [location])

  // Dirty tracking
  const hasChanges = useMemo(() => {
    if (!hostel) return false
    if (subdomain !== (hostel.subdomain || '')) return true
    if (location !== (hostel.location || 'Asia/Karachi')) return true
    if (autoMealVerification !== (hostel.settings?.autoMealVerification ?? true)) return true
    const initFields = (hostel.customRegistrationFields || []).map((f: any) => ({
      name: f.name || '',
      isRequired: Boolean(f.isRequired),
    }))
    if (JSON.stringify(customFields) !== JSON.stringify(initFields)) return true
    const initFeats = (hostel.plan?.features || []).map((f: any) => ({
      name: f.name,
      isEnabled: isCore(f.name) ? true : Boolean(f.isEnabled),
    }))
    return JSON.stringify(features) !== JSON.stringify(initFeats)
  }, [subdomain, location, autoMealVerification, customFields, features, hostel])

  // Custom field handlers
  const addField = () => {
    if (customFields.length >= 5) {
      toast.error('Maximum 5 custom registration fields allowed')
      return
    }
    setCustomFields((p) => [...p, { name: '', isRequired: false }])
  }

  const removeField = (i: number) => setCustomFields((p) => p.filter((_, idx) => idx !== i))

  const updateField = (i: number, key: keyof CustomRegistrationField, val: any) =>
    setCustomFields((p) => p.map((f, idx) => (idx === i ? { ...f, [key]: val } : f)))

  const toggleFeature = (name: string) => {
    if (isCore(name)) return
    setFeatures((p) => p.map((f) => (f.name === name ? { ...f, isEnabled: !f.isEnabled } : f)))
  }

  const handleDiscard = () => {
    if (!hostel) return
    setSubdomain(hostel.subdomain || '')
    setLocation(hostel.location || 'Asia/Karachi')
    setAutoMeal(hostel.settings?.autoMealVerification ?? true)
    setCustomFields(
      (hostel.customRegistrationFields || []).map((f: any) => ({
        name: f.name || '',
        isRequired: Boolean(f.isRequired),
      }))
    )
    setFeatures(
      (hostel.plan?.features || []).map((f: any) => ({
        name: f.name,
        isEnabled: isCore(f.name) ? true : Boolean(f.isEnabled),
      }))
    )
    toast.info('Discarded configuration changes')
  }

  const handleSave = () => {
    for (let i = 0; i < customFields.length; i++) {
      if (!customFields[i].name.trim()) {
        toast.error(`Custom registration field #${i + 1} requires a valid name`)
        return
      }
    }

    // Check for duplicate field names
    const names = customFields.map((f) => f.name.trim().toLowerCase())
    const duplicates = names.filter((item, index) => names.indexOf(item) !== index)
    if (duplicates.length > 0) {
      toast.error(`Duplicate custom field "${duplicates[0]}" found. Field names must be unique.`)
      return
    }

    mutation.mutate({
      subdomain: subdomain.trim().toLowerCase(),
      location: location.trim(),
      customRegistrationFields: customFields.map((f) => ({
        name: f.name.trim(),
        isRequired: f.isRequired,
      })),
      planFeatures: features.map((f) => ({
        name: f.name,
        isEnabled: isCore(f.name) ? true : f.isEnabled,
      })),
      settings: { autoMealVerification },
    })
  }

  const handleCopyQrSecret = () => {
    if (hostel?.qrSecret) {
      navigator.clipboard.writeText(hostel.qrSecret)
      setCopiedSecret(true)
      toast.success('Terminal QR Secret copied to clipboard')
      setTimeout(() => setCopiedSecret(false), 2000)
    }
  }

  // Quota Derivations
  const maxStudents = hostel?.plan?.limits?.maxStudents ?? 100
  const maxManagers = hostel?.plan?.limits?.maxManagers ?? 5
  const currentStudents = hostel?.plan?.limits?.students ?? 0
  const currentManagers = hostel?.plan?.limits?.managers ?? 0
  const studentPct =
    maxStudents === -1 ? 0 : Math.min(100, Math.round((currentStudents / maxStudents) * 100))
  const managerPct =
    maxManagers === -1 ? 0 : Math.min(100, Math.round((currentManagers / maxManagers) * 100))

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      {/* ── 1. Header & Live Profile Strip ── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20">
              Tenant System Configuration
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {hostel?.status || 'Active'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
              {hostel?.plan?.name || 'Standard Tier'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {hostel?.name || 'Hostel Settings'}
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure institutional identity, attendance timezone, custom resident admission fields,
            and enabled plan modules.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <Button
            onClick={handleSave}
            disabled={mutation.isPending || !hasChanges}
            size="sm"
            className="gap-1.5 h-9 px-4 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{mutation.isPending ? 'Saving…' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>

      {/* ── 2. Capacity & Subscription Overview Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Resident Capacity */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">Resident Capacity</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {currentStudents}{' '}
              <span className="text-xs font-normal text-muted-foreground">
                / {maxStudents === -1 ? 'Unlimited' : maxStudents}
              </span>
            </div>
            <div className="w-full bg-muted/60 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all"
                style={{ width: `${studentPct}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground block">
            {studentPct}% student quota utilized
          </span>
        </div>

        {/* Operational Staff Seats */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">Staff & Managers</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {currentManagers}{' '}
              <span className="text-xs font-normal text-muted-foreground">
                / {maxManagers === -1 ? 'Unlimited' : maxManagers}
              </span>
            </div>
            <div className="w-full bg-muted/60 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-purple-600 h-1.5 rounded-full transition-all"
                style={{ width: `${managerPct}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground block">
            {managerPct}% staff seats assigned
          </span>
        </div>

        {/* Operational Timezone Clock */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">Regional Clock</span>
            <div className="p-2 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-foreground font-mono truncate">
              {currentTimeInZone}
            </div>
            <span className="text-[11px] text-muted-foreground block mt-0.5 truncate">
              {location}
            </span>
          </div>
        </div>

        {/* Counter Terminal Security Token */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">Terminal Secret</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <KeyRound className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm font-bold text-foreground px-2 py-1 bg-muted/60 rounded-lg border border-border">
              {hostel?.qrSecret || 'N/A'}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopyQrSecret}
              className="h-8 w-8 rounded-lg cursor-pointer"
              title="Copy Terminal QR Secret"
            >
              {copiedSecret ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Button>
          </div>
          <span className="text-[11px] text-muted-foreground block">
            Used by POS scanner terminals
          </span>
        </div>
      </div>

      {/* ── 3. Identity, Domain & Regional Operations Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain & Login Suffix */}
        <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Institutional Domain Suffix</h3>
              <p className="text-xs text-muted-foreground">
                Email suffix appended during student roll number logins.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-foreground">
              Email Domain Suffix <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="@student.uet.edu.pk"
                className="font-mono text-xs h-9"
              />
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-[11px] text-muted-foreground flex items-center gap-2">
              <Info className="h-3.5 w-3.5 shrink-0 text-blue-500" />
              <span>
                Example: A student entering roll number <code>2021-CS-15</code> logs in with{' '}
                <strong className="text-foreground">
                  2021-CS-15{subdomain.startsWith('@') ? subdomain : `@${subdomain || 'hostel.edu'}`}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Timezone & Shift Schedules */}
        <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Operational Timezone</h3>
              <p className="text-xs text-muted-foreground">
                Controls meal cutoff lockouts and attendance session logging.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-foreground">
              System Timezone <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full appearance-none px-3 py-2 pr-8 bg-background border border-input rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors cursor-pointer h-9"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
              <span>Active local time:</span>
              <span className="font-mono font-bold">{currentTimeInZone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Mess & Counter Terminal Automations ── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Utensils className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Dining & Terminal Automations</h3>
            <p className="text-xs text-muted-foreground">
              Configure counter POS behavior and automated meal validation rules.
            </p>
          </div>
        </div>

        <div className="pt-2 divide-y divide-border/60">
          <div className="flex items-center justify-between py-3">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-bold text-foreground block">
                Instant Auto-Verification on QR Token Scan
              </span>
              <p className="text-[11px] text-muted-foreground">
                When enabled, scanned student QR tokens at dining hall counters immediately mark meals
                as served without requiring secondary manager confirmation.
              </p>
            </div>
            <Switch
              checked={autoMealVerification}
              onCheckedChange={setAutoMeal}
              className="cursor-pointer shrink-0"
            />
          </div>
        </div>
      </div>

      {/* ── 5. Dynamic Custom Admission Registration Fields ── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Custom Resident Registration Fields
              </h3>
              <p className="text-xs text-muted-foreground">
                Define institutional fields collected during student onboarding (Max 5 fields).
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addField}
            disabled={customFields.length >= 5}
            className="gap-1.5 text-xs rounded-xl self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Field ({customFields.length}/5)</span>
          </Button>
        </div>

        {customFields.length > 0 ? (
          <div className="space-y-2.5">
            {customFields.map((field, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-muted/20 border border-border/80 flex flex-col sm:flex-row sm:items-center gap-3 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                    {idx + 1}
                  </span>
                  <Input
                    value={field.name}
                    onChange={(e) => updateField(idx, 'name', e.target.value)}
                    placeholder="Field Name (e.g., CNIC, Emergency Contact, Blood Group)"
                    className="h-9 text-xs flex-1"
                  />
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0">
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={field.isRequired}
                      onChange={(e) => updateField(idx, 'isRequired', e.target.checked)}
                      className="h-4 w-4 rounded border-input cursor-pointer accent-purple-600"
                    />
                    <span className="font-semibold text-foreground text-xs">Mandatory Field</span>
                  </label>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeField(idx)}
                    className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                    title="Delete field"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center border-2 border-dashed border-border rounded-2xl space-y-2">
            <div className="h-10 w-10 mx-auto rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">No Custom Fields Configured</p>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              Add fields like CNIC, Blood Group, Guardian Phone, or Vehicle Number to collect during
              resident admission.
            </p>
          </div>
        )}
      </div>

      {/* ── 6. Plan Capabilities & Enabled Modules ── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-border/60">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Plan Feature Modules & Gates</h3>
            <p className="text-xs text-muted-foreground">
              Feature modules active for your tenant tier. Core modules are permanent.
            </p>
          </div>
        </div>

        {/* Core Modules */}
        {coreGroup.length > 0 && (
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Core Platform Modules (Always Active)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {coreGroup.map((feat) => (
                <FeatureCard key={feat.name} feat={feat} locked onToggle={undefined} />
              ))}
            </div>
          </div>
        )}

        {/* Attendance Modules */}
        {attendanceGroup.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Attendance Verification Channels
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {attendanceGroup.map((feat) => (
                <FeatureCard
                  key={feat.name}
                  feat={feat}
                  locked={false}
                  onToggle={() => toggleFeature(feat.name)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Additional Services */}
        {serviceGroup.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Hostel Services & Mess Modules
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {serviceGroup.map((feat) => (
                <FeatureCard
                  key={feat.name}
                  feat={feat}
                  locked={false}
                  onToggle={() => toggleFeature(feat.name)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 7. Sticky Floating Save Bar (When Changes are Dirty) ── */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-blue-500/40 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-semibold text-foreground">
              You have unsaved configuration changes
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDiscard}
              className="h-8 text-xs rounded-xl cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              <span>Discard</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={mutation.isPending}
              className="h-8 px-4 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              <span>{mutation.isPending ? 'Saving…' : 'Save Changes'}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
