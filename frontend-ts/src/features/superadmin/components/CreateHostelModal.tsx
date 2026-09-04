import { useState, useEffect } from 'react'
import {
  X,
  Loader2,
  Building2,
  Users,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Sparkles,
  MapPin,
  Globe,
  Utensils,
} from 'lucide-react'
import { useCreateHostel } from '@/hooks/mutations/useSuperadminMutations'
import { useGetPlans } from '@/hooks/queries/useSuperadminQueries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface CreateHostelModalProps {
  isOpen: boolean
  onClose: () => void
}

const INITIAL_FORM = {
  name: '',
  subdomain: '',
  location: '',
  plan: '',
  maxMealSelection: 4,
  adminName: '',
  adminEmail: '',
  managerName: '',
  managerEmail: '',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SUBDOMAIN_REGEX = /^@?[a-zA-Z0-9.-]+$/

export default function CreateHostelModal({ isOpen, onClose }: CreateHostelModalProps) {
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [step, setStep] = useState<1 | 2 | 3>(1)

  const { data: plans = [], isLoading: loadingPlans } = useGetPlans(isOpen)
  const { mutateAsync: createHostel, isPending: isSubmitting } = useCreateHostel()

  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM)
      setTouched({})
      setStep(1)
    }
  }, [isOpen])

  // Pre-select first plan when plans load
  useEffect(() => {
    if (plans.length > 0 && !formData.plan) {
      setFormData((prev) => ({ ...prev, plan: plans[0]._id }))
    }
  }, [plans, formData.plan])

  if (!isOpen) return null

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFormData((prev) => ({
      ...prev,
      name: val,
    }))
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const errors = {
    name: touched.name && !formData.name.trim() ? 'Hostel name is required' : null,
    subdomain:
      touched.subdomain && (!formData.subdomain.trim() || !SUBDOMAIN_REGEX.test(formData.subdomain))
        ? 'Valid domain suffix required (e.g. @student.uet.edu.pk)'
        : null,
    location: touched.location && !formData.location.trim() ? 'City / Location is required' : null,
    maxMealSelection:
      touched.maxMealSelection && (formData.maxMealSelection < 1 || formData.maxMealSelection > 10)
        ? 'Must be between 1 and 10'
        : null,
    adminName: touched.adminName && !formData.adminName.trim() ? 'Admin full name is required' : null,
    adminEmail:
      touched.adminEmail && (!formData.adminEmail.trim() || !EMAIL_REGEX.test(formData.adminEmail))
        ? 'Valid admin email is required'
        : null,
    managerName: touched.managerName && !formData.managerName.trim() ? 'Manager name is required' : null,
    managerEmail:
      touched.managerEmail && (!formData.managerEmail.trim() || !EMAIL_REGEX.test(formData.managerEmail))
        ? 'Valid manager email is required'
        : null,
  }

  const isStep1Valid = Boolean(
    formData.name.trim() &&
      formData.subdomain.trim() &&
      SUBDOMAIN_REGEX.test(formData.subdomain) &&
      formData.location.trim()
  )

  const isStep2Valid = Boolean(
    formData.adminName.trim() &&
      EMAIL_REGEX.test(formData.adminEmail) &&
      (!formData.managerEmail.trim() || EMAIL_REGEX.test(formData.managerEmail))
  )

  const isStep3Valid = Boolean(formData.plan)

  const handleNext = () => {
    if (step === 1) {
      setTouched((prev) => ({ ...prev, name: true, subdomain: true, location: true }))
      if (isStep1Valid) setStep(2)
      else toast.error('Please fill in all required hostel details')
    } else if (step === 2) {
      setTouched((prev) => ({ ...prev, adminName: true, adminEmail: true }))
      if (isStep2Valid) setStep(3)
      else toast.error('Please provide a valid administrator email')
    }
  }

  const handleSubmit = async () => {
    if (!formData.plan) {
      toast.error('Please select a subscription plan')
      return
    }

    try {
      await createHostel({
        name: formData.name.trim(),
        subdomain: formData.subdomain.trim(),
        location: formData.location.trim(),
        plan: formData.plan,
        maxMealSelection: Number(formData.maxMealSelection) || 4,
        adminName: formData.adminName.trim(),
        adminEmail: formData.adminEmail.trim(),
        managerName: formData.managerName.trim() || undefined,
        managerEmail: formData.managerEmail.trim() || undefined,
      })
      onClose()
    } catch {
      // Handled by mutation toast
    }
  }

  const stepsMeta = [
    { num: 1, label: 'Hostel Info', icon: Building2 },
    { num: 2, label: 'Staff Access', icon: Users },
    { num: 3, label: 'Subscription', icon: CreditCard },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Provision New Hostel Tenant</h2>
              <p className="text-xs text-muted-foreground">
                Step {step} of 3 • {stepsMeta[step - 1].label}
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

        {/* Step Indicator */}
        <div className="grid grid-cols-3 border-b border-border bg-muted/10">
          {stepsMeta.map((s) => {
            const Icon = s.icon
            const isCompleted = step > s.num
            const isCurrent = step === s.num
            return (
              <div
                key={s.num}
                className={`py-3 px-4 flex items-center justify-center gap-2 border-b-2 text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-500/5'
                    : isCompleted
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-muted-foreground'
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Check className="h-3 w-3" /> : s.num}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            )
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* STEP 1: HOSTEL INFO */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-blue-500" /> Hostel Name{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Al-Razi Boys Hostel"
                  value={formData.name}
                  onChange={handleNameChange}
                  onBlur={() => handleBlur('name')}
                  className={errors.name ? 'border-rose-500' : ''}
                />
                {errors.name && <p className="text-[11px] text-rose-500 font-medium">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-blue-500" /> Institutional Email Domain Suffix{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="e.g. @student.uet.edu.pk or student.uet.edu.pk"
                    value={formData.subdomain}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9.@-]/g, ''),
                      }))
                    }
                    onBlur={() => handleBlur('subdomain')}
                    className={`text-xs font-mono h-9 ${errors.subdomain ? 'border-rose-500' : ''}`}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Shared across hostels of the same university. Used to construct student emails (e.g.{' '}
                  <span className="font-mono text-foreground font-semibold">
                    2021-CS-15{formData.subdomain ? (formData.subdomain.startsWith('@') ? formData.subdomain : `@${formData.subdomain}`) : '@student.uet.edu.pk'}
                  </span>
                  ) during Excel imports and roll-number logins.
                </p>
                {errors.subdomain && (
                  <p className="text-[11px] text-rose-500 font-medium">{errors.subdomain}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-500" /> Campus / Location{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Sector H-12, Islamabad"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    onBlur={() => handleBlur('location')}
                    className={errors.location ? 'border-rose-500' : ''}
                  />
                  {errors.location && (
                    <p className="text-[11px] text-rose-500 font-medium">{errors.location}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Utensils className="h-3.5 w-3.5 text-blue-500" /> Max Meal Selections / Day
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.maxMealSelection}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxMealSelection: parseInt(e.target.value, 10) || 1,
                      }))
                    }
                    onBlur={() => handleBlur('maxMealSelection')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: STAFF PROFILES */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              {/* Primary Administrator */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/80 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Primary Hostel Administrator
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Admin Full Name <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Dr. Salman Ahmed"
                      value={formData.adminName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, adminName: e.target.value }))}
                      onBlur={() => handleBlur('adminName')}
                      className={errors.adminName ? 'border-rose-500' : ''}
                    />
                    {errors.adminName && (
                      <p className="text-[10px] text-rose-500">{errors.adminName}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Admin Email (Login ID) <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="admin@alrazi.messpro.app"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData((prev) => ({ ...prev, adminEmail: e.target.value }))}
                      onBlur={() => handleBlur('adminEmail')}
                      className={errors.adminEmail ? 'border-rose-500' : ''}
                    />
                    {errors.adminEmail && (
                      <p className="text-[10px] text-rose-500">{errors.adminEmail}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Optional Manager Account */}
              <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Mess Manager Account (Optional)
                    </h3>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">Optional</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Manager Full Name
                    </label>
                    <Input
                      placeholder="e.g. Tariq Mehmood"
                      value={formData.managerName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, managerName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Manager Email
                    </label>
                    <Input
                      type="email"
                      placeholder="manager@alrazi.messpro.app"
                      value={formData.managerEmail}
                      onChange={(e) => setFormData((prev) => ({ ...prev, managerEmail: e.target.value }))}
                      onBlur={() => handleBlur('managerEmail')}
                      className={errors.managerEmail ? 'border-rose-500' : ''}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
                <Sparkles className="h-4 w-4 shrink-0 text-blue-500" />
                <span>
                  Welcome credentials and secure initial password setup links will be dispatched to the
                  provided email addresses immediately upon creation.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: SUBSCRIPTION PLAN */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                  Select Subscription Tier
                </h3>
                <p className="text-xs text-muted-foreground">
                  Determines resident capacity, active features, and license quota.
                </p>
              </div>

              {loadingPlans ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <p className="text-xs text-muted-foreground">Loading available plans...</p>
                </div>
              ) : plans.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-border text-center space-y-2">
                  <AlertCircle className="h-6 w-6 text-amber-500 mx-auto" />
                  <p className="text-xs font-semibold text-foreground">No subscription tiers found</p>
                  <p className="text-[11px] text-muted-foreground">
                    Please create a plan under Subscriptions first or proceed with default trial tier.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {plans.map((p) => {
                    const isSelected = formData.plan === p._id
                    return (
                      <div
                        key={p._id}
                        onClick={() => setFormData((prev) => ({ ...prev, plan: p._id }))}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-500/10 shadow-xs ring-1 ring-blue-600'
                            : 'border-border bg-muted/20 hover:border-border/80 hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-foreground">{p.name}</h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                              {p.description || 'Standard multi-tenant hostel tier'}
                            </p>
                          </div>
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

                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-foreground font-mono">
                            ${p.price}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium">/ month</span>
                        </div>

                        <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground space-y-1">
                          <div className="flex justify-between">
                            <span>Max Students:</span>
                            <span className="font-semibold text-foreground">
                              {p.limits?.maxStudents === -1 ? 'Unlimited' : p.limits?.maxStudents || 100}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Managers:</span>
                            <span className="font-semibold text-foreground">
                              {p.limits?.maxManagers === -1 ? 'Unlimited' : p.limits?.maxManagers || 2}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
          {step > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="gap-1 text-xs"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
          )}

          {step < 3 ? (
            <Button size="sm" onClick={handleNext} className="gap-1 text-xs font-semibold">
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={isSubmitting || !formData.plan}
              onClick={handleSubmit}
              className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Provisioning Hostel...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" /> Provision Tenant
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
