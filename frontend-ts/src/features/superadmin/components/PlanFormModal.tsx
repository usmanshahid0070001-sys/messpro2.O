import { useState, useEffect } from 'react'
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

const AVAILABLE_FEATURES = [
  { id: 'residence_management', label: 'Residence & Room Allocation' },
  { id: 'service_management', label: 'Room Sanitation & Cleaning' },
  { id: 'meal_settings', label: 'Weekly Menu & Meal Configuration' },
  { id: 'meal_control', label: 'Meal Restrictions & Audit Control' },
  { id: 'bill_management', label: 'Hostel Dues & Payment Tracking' },
  { id: 'bill_generation', label: 'Automated Invoice Generation' },
  { id: 'manual_attendance', label: 'Manual Register Attendance' },
  { id: 'qr_attendance', label: 'Dynamic QR Attendance Scanner' },
  { id: 'biometric_attendance', label: 'Biometric Gate Terminal Sync' },
  { id: 'complaint_management', label: 'Resident Maintenance Tickets' },
  { id: 'hostel_configuration', label: 'Hostel Profile & Custom Fields' },
]

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

        // Normalize features
        setFeatures(plan.features || [])
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
        setFeatures(AVAILABLE_FEATURES.map((f) => f.id))
      }
    }
  }, [isOpen, plan])

  if (!isOpen) return null

  const toggleFeature = (id: string) => {
    setFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Please provide a plan name')
      return
    }

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
      features,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
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
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Plan Tier Name <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Enterprise Plus"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                className="font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Tier Description</label>
            <Input
              placeholder="e.g. Designed for large scale universities & private hostel networks"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Quotas */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border/80 space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Tenant Quota Limits
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
                  className="font-mono text-xs"
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
                  className="font-mono text-xs"
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
                  Unlimited Managers
                </label>
              </div>
            </div>
          </div>

          {/* Active Features */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Enabled Platform Modules
              </h3>
              <button
                type="button"
                onClick={() =>
                  setFeatures(
                    features.length === AVAILABLE_FEATURES.length
                      ? []
                      : AVAILABLE_FEATURES.map((f) => f.id)
                  )
                }
                className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                {features.length === AVAILABLE_FEATURES.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AVAILABLE_FEATURES.map((f) => {
                const isSelected = features.includes(f.id)
                return (
                  <div
                    key={f.id}
                    onClick={() => toggleFeature(f.id)}
                    className={`p-2.5 rounded-lg border text-xs font-medium cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-blue-600/40 bg-blue-500/10 text-foreground'
                        : 'border-border/60 bg-card text-muted-foreground hover:bg-muted/30'
                    }`}
                  >
                    <span>{f.label}</span>
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-muted-foreground/40'
                      }`}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Active Plan Switch */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
            <div>
              <p className="text-xs font-semibold text-foreground">Active for New Hostels</p>
              <p className="text-[11px] text-muted-foreground">
                Disabled plans will not appear in the tenant creation dropdown.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
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
