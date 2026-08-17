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
  { value: 'Asia/Karachi',       label: 'Asia/Karachi — PKT (UTC+5)' },
  { value: 'Asia/Dubai',         label: 'Asia/Dubai — GST (UTC+4)' },
  { value: 'Asia/Riyadh',        label: 'Asia/Riyadh — AST (UTC+3)' },
  { value: 'Asia/Kolkata',       label: 'Asia/Kolkata — IST (UTC+5:30)' },
  { value: 'Asia/Dhaka',         label: 'Asia/Dhaka — BST (UTC+6)' },
  { value: 'Europe/London',      label: 'Europe/London — GMT/BST (UTC+0/+1)' },
  { value: 'America/New_York',   label: 'America/New_York — EST/EDT (UTC-5/-4)' },
  { value: 'America/Chicago',    label: 'America/Chicago — CST/CDT (UTC-6/-5)' },
  { value: 'America/Los_Angeles',label: 'America/Los_Angeles — PST/PDT (UTC-8/-7)' },
  { value: 'Australia/Sydney',   label: 'Australia/Sydney — AEST (UTC+10)' },
  { value: 'UTC',                label: 'UTC — Coordinated Universal Time' },
]

// ── Core features are always locked enabled when present in plan ─────────────
const CORE_FEATURE_NAMES = [
  'user_management',
  'hostel_configuration',
  'bill_management',
  'bill_generation',
  'residence_management',
]

const normalize = (name: string) =>
  (name || '').toLowerCase().replace(/[\s-]+/g, '_')

const isCore = (name: string) => CORE_FEATURE_NAMES.includes(normalize(name))

// Icon + description per feature — driven by what the feature *does*, not its group
const featureMeta = (name: string): { icon: React.ElementType; desc: string; category: 'core' | 'attendance' | 'service' } => {
  const n = normalize(name)
  if (n.includes('user'))              return { icon: UserCheck,  desc: 'User directory and role-based access control',          category: 'core' }
  if (n.includes('hostel_config'))     return { icon: Settings2,  desc: 'Domain, timezone, and global hostel settings',           category: 'core' }
  if (n.includes('bill_gen') || n.includes('generation'))
                                       return { icon: CreditCard, desc: 'Automated monthly dues and batch invoice generation',    category: 'core' }
  if (n.includes('bill'))              return { icon: CreditCard, desc: 'Invoice tracking, receipts, and payment ledger',         category: 'core' }
  if (n.includes('residence') || n.includes('room'))
                                       return { icon: Building2,  desc: 'Room allocations, wing structure, and occupancy',        category: 'core' }
  if (n.includes('manual_attendance')) return { icon: UserCheck,  desc: 'Staff-marked rollcall and bulk check-in logs',           category: 'attendance' }
  if (n.includes('qr'))                return { icon: QrCode,     desc: 'QR code scanning at the mess counter terminal',          category: 'attendance' }
  if (n.includes('biometric'))         return { icon: Fingerprint,desc: 'Fingerprint reader integration and hardware sync',       category: 'attendance' }
  if (n.includes('complaint'))         return { icon: AlertCircle,desc: 'Resident maintenance tickets and resolution tracking',   category: 'service' }
  if (n.includes('meal') || n.includes('schedule') || n.includes('dining'))
                                       return { icon: Utensils,   desc: 'Dining schedule, menu management, and session controls', category: 'service' }
  return                                      { icon: Sparkles,   desc: 'Supplemental hostel management module',                  category: 'service' }
}

// ── Section wrapper — the Settings page pattern used throughout ──────────────
function Section({ title, description, children }: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-x-12 gap-y-4 py-8 border-t border-border/60 first:border-t-0 first:pt-0">
      <div className="space-y-1.5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  )
}

// ── FeatureRow — uniform row for any plan feature ────────────────────────────
function FeatureRow({
  feat,
  locked,
  onToggle,
}: {
  feat: PlanFeatureConfig
  locked: boolean
  onToggle?: () => void
}) {
  const { icon: Icon, desc } = featureMeta(feat.name)
  return (
    <div className="flex items-center justify-between px-4 py-3.5 gap-4">
      <div className="flex items-center gap-3.5 min-w-0">
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <span className="text-sm font-medium text-foreground block">{feat.name}</span>
          <span className="text-xs text-muted-foreground block mt-0.5">{desc}</span>
        </div>
      </div>

      {locked ? (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground/80 shrink-0 select-none">
          <Lock className="h-3 w-3" />
          Always on
        </span>
      ) : (
        <Switch checked={feat.isEnabled} onCheckedChange={onToggle} />
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function HostelConfiguration() {
  const { user }          = useSelector((s: RootState) => s.auth)
  const { currentHostel } = useSelector((s: RootState) => s.hostel)
  const role = user?.role

  const { data: fetchedHostel, isLoading } = useGetMyHostel(role)
  const hostel = fetchedHostel || currentHostel
  const mutation = useUpdateMyHostelSettings()

  const [subdomain, setSubdomain]                   = useState('')
  const [location, setLocation]                     = useState('Asia/Karachi')
  const [autoMealVerification, setAutoMeal]         = useState(true)
  const [customFields, setCustomFields]             = useState<CustomRegistrationField[]>([])
  const [features, setFeatures]                     = useState<PlanFeatureConfig[]>([])

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

  // Dirty tracking
  const hasChanges = useMemo(() => {
    if (!hostel) return false
    if (subdomain !== (hostel.subdomain || '')) return true
    if (location  !== (hostel.location  || 'Asia/Karachi')) return true
    if (autoMealVerification !== (hostel.settings?.autoMealVerification ?? true)) return true
    const initFields = (hostel.customRegistrationFields || []).map((f: any) => ({ name: f.name || '', isRequired: Boolean(f.isRequired) }))
    if (JSON.stringify(customFields) !== JSON.stringify(initFields)) return true
    const initFeats = (hostel.plan?.features || []).map((f: any) => ({ name: f.name, isEnabled: isCore(f.name) ? true : Boolean(f.isEnabled) }))
    return JSON.stringify(features) !== JSON.stringify(initFeats)
  }, [subdomain, location, autoMealVerification, customFields, features, hostel])

  // Custom field handlers
  const addField = () => {
    if (customFields.length >= 5) { toast.error('Maximum 5 custom fields allowed'); return }
    setCustomFields(p => [...p, { name: '', isRequired: false }])
  }
  const removeField = (i: number) => setCustomFields(p => p.filter((_, idx) => idx !== i))
  const updateField = (i: number, key: keyof CustomRegistrationField, val: any) =>
    setCustomFields(p => p.map((f, idx) => idx === i ? { ...f, [key]: val } : f))

  const toggleFeature = (name: string) => {
    if (isCore(name)) return
    setFeatures(p => p.map(f => f.name === name ? { ...f, isEnabled: !f.isEnabled } : f))
  }

  const handleSave = () => {
    for (let i = 0; i < customFields.length; i++) {
      if (!customFields[i].name.trim()) {
        toast.error(`Field ${i + 1} needs a name`)
        return
      }
    }
    mutation.mutate({
      subdomain: subdomain.trim(),
      location: location.trim(),
      customRegistrationFields: customFields.map(f => ({ name: f.name.trim(), isRequired: f.isRequired })),
      planFeatures: features.map(f => ({ name: f.name, isEnabled: isCore(f.name) ? true : f.isEnabled })),
      settings: { autoMealVerification },
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-10 pb-20">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>
        {[1, 2, 3].map(n => (
          <div key={n} className="grid grid-cols-[200px_1fr] gap-10 py-8 border-t border-border">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-44" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between pb-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Hostel Configuration
          </h1>
          <p className="text-xs text-muted-foreground">
            {hostel?.name || 'My Hostel'} • Manage domain, timezone, registration, and plan modules.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={mutation.isPending || !hasChanges}
          size="sm"
          className="gap-2 min-w-[110px]"
        >
          <Save className="h-3.5 w-3.5" />
          {mutation.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      {/* ── SECTION 1: Identity ─────────────────────────────────────────── */}
      <Section
        title="Domain & timezone"
        description="Controls how students log in and how attendance timestamps are recorded."
      >
        <div className="space-y-1.5">
          <label htmlFor="subdomain" className="text-xs font-medium text-foreground">
            Email domain suffix
          </label>
          <Input
            id="subdomain"
            type="text"
            value={subdomain}
            onChange={e => setSubdomain(e.target.value)}
            placeholder="@student.uet.edu.pk"
            className="font-mono text-sm max-w-sm lg:ml-2"
          />
          <p className="text-xs text-muted-foreground">
            Appended to login identifiers for email-based authentication.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="timezone" className="text-xs font-medium text-foreground">
            Attendance timezone
          </label>
          <div className="relative max-w-sm">
            <select
              id="timezone"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors cursor-pointer"
            >
              {TIMEZONE_OPTIONS.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <p className="text-xs text-muted-foreground">
            Meal sessions and check-in windows use this timezone for all time calculations.
          </p>
        </div>
      </Section>

      {/* ── SECTION 2: Automations ──────────────────────────────────────── */}
      <Section
        title="Attendance automation"
        description="Configure automatic actions at the mess counter terminal."
      >
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <span className="text-sm font-medium text-foreground">Auto-verify on QR scan</span>
            <p className="text-xs text-muted-foreground">
              Mark attendance as verified immediately on scan, without a manager review step.
            </p>
          </div>
          <Switch checked={autoMealVerification} onCheckedChange={setAutoMeal} />
        </div>
      </Section>

      {/* ── SECTION 3: Custom registration fields ───────────────────────── */}
      <Section
        title="Registration fields"
        description="Extra fields collected from students at admission. Up to 5 fields."
      >
        <div>
          {customFields.length > 0 && (
            <div className="mb-3 border border-border rounded-lg overflow-hidden divide-y divide-border bg-background">
              {customFields.map((field, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-3.5 py-2.5 bg-background hover:bg-muted/30 transition-colors"
                >
                  <span className="text-xs tabular-nums text-muted-foreground w-5 shrink-0 text-right">
                    {idx + 1}
                  </span>
                  <Input
                    value={field.name}
                    onChange={e => updateField(idx, 'name', e.target.value)}
                    placeholder="Field name"
                    className="h-8 text-sm flex-1"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      checked={field.isRequired}
                      onChange={e => updateField(idx, 'isRequired', e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-input cursor-pointer accent-foreground"
                    />
                    Required
                  </label>
                  <button
                    type="button"
                    onClick={() => removeField(idx)}
                    className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                    aria-label="Remove field"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addField}
            disabled={customFields.length >= 5}
            className="gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add field
            <span className="text-muted-foreground">({customFields.length}/5)</span>
          </Button>
        </div>
      </Section>

      {/* ── SECTION 4: Plan modules ─────────────────────────────────────── */}
      <Section
        title="Plan modules"
        description={`Feature set for ${hostel?.plan?.name || 'your current plan'}. Core modules cannot be disabled.`}
      >
        {/* Core — always on */}
        {coreGroup.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">Core</p>
            <div className="border border-border rounded-lg overflow-hidden divide-y divide-border bg-background">
              {coreGroup.map(feat => (
                <FeatureRow key={feat.name} feat={feat} locked onToggle={undefined} />
              ))}
            </div>
          </div>
        )}

        {/* Attendance methods */}
        {attendanceGroup.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">Attendance methods</p>
            <div className="border border-border rounded-lg overflow-hidden divide-y divide-border bg-background">
              {attendanceGroup.map(feat => (
                <FeatureRow key={feat.name} feat={feat} locked={false} onToggle={() => toggleFeature(feat.name)} />
              ))}
            </div>
          </div>
        )}

        {/* Other services */}
        {serviceGroup.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">Services</p>
            <div className="border border-border rounded-lg overflow-hidden divide-y divide-border bg-background">
              {serviceGroup.map(feat => (
                <FeatureRow key={feat.name} feat={feat} locked={false} onToggle={() => toggleFeature(feat.name)} />
              ))}
            </div>
          </div>
        )}
      </Section>
    </div>
  )
}
