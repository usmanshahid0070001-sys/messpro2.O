import { useState, useEffect, useMemo } from 'react'
import {
  X,
  Loader2,
  CreditCard,
  Check,
  Users,
  Shield,
  Layers,
  Infinity as InfinityIcon,
  CheckCircle2,
  Lock,
  Building2,
  Utensils,
  QrCode,
  UserCheck,
  Sparkles,
} from 'lucide-react'
import {
  useCreatePlan,
  useUpdatePlan,
} from '@/hooks/mutations/useSuperadminMutations'
import type { SubscriptionPlan } from '@/hooks/queries/useSuperadminQueries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface PlanFormModalProps {
  isOpen: boolean
  onClose: () => void
  plan: SubscriptionPlan | null
}

export interface FeatureDefinition {
  id: string
  label: string
  desc: string
  isCore?: boolean
  category: 'core' | 'residence' | 'food' | 'attendance'
}

export const FEATURE_CATEGORIES = [
  {
    id: 'core',
    title: 'Core Platform Modules',
    subtitle: 'Always enabled & included by default across all plans',
    icon: UserCheck,
    color: 'text-blue-600 dark:text-blue-400',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  {
    id: 'residence',
    title: 'Residence & Facility Management',
    subtitle: 'Room allocation, resident hygiene, and maintenance ticketing',
    icon: Building2,
    color: 'text-teal-600 dark:text-teal-400',
    badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  },
  {
    id: 'food',
    title: 'Mess Services & Dining Dues',
    subtitle: 'Weekly menu planning, counter dining controls, and billing ledgers',
    icon: Utensils,
    color: 'text-emerald-600 dark:text-emerald-400',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  {
    id: 'attendance',
    title: 'Attendance Verification Channels',
    subtitle: 'Manual register, digital QR token scans, and biometric hardware terminals',
    icon: QrCode,
    color: 'text-slate-600 dark:text-slate-400',
    badgeColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  },
] as const

export const ALL_PLAN_FEATURES: FeatureDefinition[] = [
  // ── Core Platform (Always checked/locked) ──
  {
    id: 'user_management',
    label: 'User & Staff Management',
    desc: 'Resident & operational staff directory with granular permission controls',
    isCore: true,
    category: 'core',
  },
  {
    id: 'hostel_configuration',
    label: 'MessPro Configuration',
    desc: 'Hostel profile, registration fields, and institutional branding',
    isCore: true,
    category: 'core',
  },

  // ── Residence & Facilities ──
  {
    id: 'residence_management',
    label: 'Residence & Room Allocation',
    desc: 'Room allocation, capacity management, and bed assignments',
    category: 'residence',
  },
  {
    id: 'service_management',
    label: 'Room Sanitation & Cleaning',
    desc: 'Daily room housekeeping, cleaning logs, and sanitation status',
    category: 'residence',
  },
  {
    id: 'complaint_management',
    label: 'Maintenance & Complaint Tickets',
    desc: 'Resident grievance reporting and maintenance ticket resolution',
    category: 'residence',
  },

  // ── Mess & Dining Services ──
  {
    id: 'meal_settings',
    label: 'Weekly Menu & Meal Configuration',
    desc: 'Weekly menu schedule, meal timings, and dining hours',
    category: 'food',
  },
  {
    id: 'meal_control',
    label: 'Meal Restrictions & Dining Control',
    desc: 'Dining privilege enforcement and meal lockouts based on dues',
    category: 'food',
  },
  {
    id: 'bill_management',
    label: 'Bill Management',
    desc: 'Student dues ledger, payment recording, and balance tracking',
    category: 'food',
  },
  {
    id: 'bill_generation',
    label: 'Bill Generation',
    desc: 'Monthly fee invoices and automated student bill calculation',
    category: 'food',
  },

  // ── Attendance Channels ──
  {
    id: 'manual_attendance',
    label: 'Manual Register Attendance',
    desc: 'Manual attendance roll-call and register recordkeeping',
    category: 'attendance',
  },
  {
    id: 'qr_attendance',
    label: 'Dynamic QR Attendance Scanner',
    desc: 'Digital student QR token scanner with anti-passback security',
    category: 'attendance',
  },
  {
    id: 'biometric_attendance',
    label: 'Biometric Gate Terminal Sync',
    desc: 'Hardware biometric scanner integration and attendance sync',
    category: 'attendance',
  },
]

const CORE_FEATURE_IDS = ALL_PLAN_FEATURES.filter((f) => f.isCore).map((f) => f.id)

export default function PlanFormModal({ isOpen, onClose, plan }: PlanFormModalProps) {
  const isEditing = Boolean(plan?._id)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<number>(49)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [maxStudents, setMaxStudents] = useState<number>(100)
  const [unlimitedStudents, setUnlimitedStudents] = useState<boolean>(false)
  const [maxManagers, setMaxManagers] = useState<number>(2)
  const [unlimitedManagers, setUnlimitedManagers] = useState<boolean>(false)
  const [isActive, setIsActive] = useState<boolean>(true)
  const [features, setFeatures] = useState<string[]>([])

  const { mutateAsync: createPlan, isPending: isCreating } = useCreatePlan()
  const { mutateAsync: updatePlan, isPending: isUpdating } = useUpdatePlan()

  const isSubmitting = isCreating || isUpdating

  useEffect(() => {
    if (isOpen) {
      if (plan) {
        setName(plan.name || '')
        setDescription(plan.description || '')
        setPrice(plan.price || 0)
        setBillingCycle(plan.billingCycle || 'monthly')
        setIsActive(plan.isActive !== false)

        const studentLimit = plan.limits?.maxStudents
        if (studentLimit === -1) {
          setUnlimitedStudents(true)
          setMaxStudents(100)
        } else {
          setUnlimitedStudents(false)
          setMaxStudents(studentLimit || 100)
        }

        const managerLimit = plan.limits?.maxManagers
        if (managerLimit === -1) {
          setUnlimitedManagers(true)
          setMaxManagers(2)
        } else {
          setUnlimitedManagers(false)
          setMaxManagers(managerLimit || 2)
        }

        // Pre-fill features, ensuring core features are ALWAYS included
        const existingFeats = Array.isArray(plan.features) ? plan.features : []
        const merged = Array.from(new Set([...CORE_FEATURE_IDS, ...existingFeats]))
        setFeatures(merged)
      } else {
        setName('')
        setDescription('')
        setPrice(49)
        setBillingCycle('monthly')
        setMaxStudents(100)
        setUnlimitedStudents(false)
        setMaxManagers(2)
        setUnlimitedManagers(false)
        setIsActive(true)
        // Default on create: All features pre-selected
        setFeatures(ALL_PLAN_FEATURES.map((f) => f.id))
      }
    }
  }, [isOpen, plan])

  if (!isOpen) return null

  const toggleFeature = (id: string) => {
    // Core features are permanent & locked
    if (CORE_FEATURE_IDS.includes(id)) {
      toast.info('Core platform modules are required for all plan tiers.')
      return
    }

    setFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }

  const toggleCategory = (catId: string) => {
    const catFeats = ALL_PLAN_FEATURES.filter((f) => f.category === catId && !f.isCore)
    const catIds = catFeats.map((f) => f.id)
    if (catIds.length === 0) return

    const allSelected = catIds.every((id) => features.includes(id))
    if (allSelected) {
      // Remove all non-core features in this category
      setFeatures((prev) => prev.filter((id) => !catIds.includes(id)))
    } else {
      // Add all features in this category
      setFeatures((prev) => Array.from(new Set([...prev, ...catIds])))
    }
  }

  const handleSelectAll = () => {
    setFeatures(ALL_PLAN_FEATURES.map((f) => f.id))
  }

  const handleDeselectNonCore = () => {
    setFeatures([...CORE_FEATURE_IDS])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Please provide a plan name')
      return
    }

    // Always guarantee core features are included in payload
    const finalFeatures = Array.from(new Set([...CORE_FEATURE_IDS, ...features]))

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price) || 0,
      billingCycle,
      isActive,
      limits: {
        maxStudents: unlimitedStudents ? -1 : Number(maxStudents) || 100,
        maxManagers: unlimitedManagers ? -1 : Number(maxManagers) || 2,
      },
      features: finalFeatures,
    }

    try {
      if (isEditing && plan?._id) {
        await updatePlan({ id: plan._id, payload })
      } else {
        await createPlan(payload)
      }
      onClose()
    } catch {
      // Handled by mutation toast
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {isEditing ? `Edit Plan Tier: ${plan?.name}` : 'Create Subscription Tier'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Configure quotas, pricing, and enabled capabilities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Plan Basics */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Plan Tier Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Standard, Premium, Enterprise"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Price / Month ($)</label>
                <Input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="font-mono h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Tier Description</label>
              <Input
                placeholder="e.g. Designed for private hostel facilities & university residences"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Quotas */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border/80 space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-purple-500" /> Tenant Quota Limits
            </h3>

            {/* Students */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Max Student Residents
                </label>
                <Input
                  type="number"
                  disabled={unlimitedStudents}
                  value={unlimitedStudents ? '' : maxStudents}
                  placeholder={unlimitedStudents ? 'Unlimited' : '100'}
                  onChange={(e) => setMaxStudents(parseInt(e.target.value, 10) || 0)}
                  className="font-mono text-xs h-9"
                />
              </div>
              <div className="flex items-center gap-2 pt-4">
                <Switch
                  checked={unlimitedStudents}
                  onCheckedChange={setUnlimitedStudents}
                  id="unlimited-students"
                />
                <label
                  htmlFor="unlimited-students"
                  className="text-xs text-foreground font-medium cursor-pointer"
                >
                  Unlimited Students
                </label>
              </div>
            </div>

            {/* Managers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Max Staff Managers
                </label>
                <Input
                  type="number"
                  disabled={unlimitedManagers}
                  value={unlimitedManagers ? '' : maxManagers}
                  placeholder={unlimitedManagers ? 'Unlimited' : '2'}
                  onChange={(e) => setMaxManagers(parseInt(e.target.value, 10) || 0)}
                  className="font-mono text-xs h-9"
                />
              </div>
              <div className="flex items-center gap-2 pt-4">
                <Switch
                  checked={unlimitedManagers}
                  onCheckedChange={setUnlimitedManagers}
                  id="unlimited-managers"
                />
                <label
                  htmlFor="unlimited-managers"
                  className="text-xs text-foreground font-medium cursor-pointer"
                >
                  Unlimited Staff
                </label>
              </div>
            </div>
          </div>

          {/* Categorized Features */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-blue-500" /> Enabled Platform Capabilities
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {features.length} of {ALL_PLAN_FEATURES.length} features enabled in this tier
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-muted-foreground text-xs">•</span>
                <button
                  type="button"
                  onClick={handleDeselectNonCore}
                  className="text-[11px] text-muted-foreground font-semibold hover:underline cursor-pointer"
                >
                  Reset to Core
                </button>
              </div>
            </div>

            {/* Categories Loop */}
            <div className="space-y-4">
              {FEATURE_CATEGORIES.map((cat) => {
                const CatIcon = cat.icon
                const catFeatures = ALL_PLAN_FEATURES.filter((f) => f.category === cat.id)
                const isCoreCat = cat.id === 'core'
                const nonCoreCatFeatures = catFeatures.filter((f) => !f.isCore)
                const allCatSelected =
                  nonCoreCatFeatures.length > 0 &&
                  nonCoreCatFeatures.every((f) => features.includes(f.id))

                return (
                  <div
                    key={cat.id}
                    className="p-3.5 rounded-xl bg-card border border-border/80 shadow-2xs space-y-2.5"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${cat.badgeColor}`}>
                          <CatIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-foreground">{cat.title}</h4>
                          <p className="text-[10px] text-muted-foreground">{cat.subtitle}</p>
                        </div>
                      </div>

                      {!isCoreCat && nonCoreCatFeatures.length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className="text-[10px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {allCatSelected ? 'Deselect group' : 'Select group'}
                        </button>
                      )}
                    </div>

                    {/* Features in Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {catFeatures.map((f) => {
                        const isSelected = features.includes(f.id)
                        const isLocked = Boolean(f.isCore)

                        return (
                          <div
                            key={f.id}
                            onClick={() => !isLocked && toggleFeature(f.id)}
                            className={`p-2.5 rounded-lg border text-xs font-medium flex items-start justify-between gap-2 transition-all select-none ${
                              isLocked
                                ? 'border-blue-500/30 bg-blue-500/5 text-foreground cursor-default'
                                : isSelected
                                ? 'border-blue-600/40 bg-blue-500/10 text-foreground cursor-pointer hover:border-blue-600/60'
                                : 'border-border/60 bg-muted/10 text-muted-foreground cursor-pointer hover:bg-muted/30 hover:border-border'
                            }`}
                          >
                            <div className="space-y-0.5 flex-1 pr-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-foreground text-xs block leading-tight">
                                  {f.label}
                                </span>
                                {isLocked && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400">
                                    <Lock className="h-2.5 w-2.5" /> Core
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-tight">
                                {f.desc}
                              </p>
                            </div>

                            <div
                              className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                isLocked
                                  ? 'border-blue-600 bg-blue-600 text-white'
                                  : isSelected
                                  ? 'border-blue-600 bg-blue-600 text-white'
                                  : 'border-muted-foreground/40 bg-background'
                              }`}
                            >
                              {(isLocked || isSelected) && <Check className="h-2.5 w-2.5" />}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Active Plan Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card">
            <div>
              <p className="text-xs font-semibold text-foreground">Active for New Hostels</p>
              <p className="text-[11px] text-muted-foreground">
                Disabled plans will not appear in the tenant creation onboarding dropdown.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving Plan...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" /> {isEditing ? 'Update Plan Tier' : 'Create Plan'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
