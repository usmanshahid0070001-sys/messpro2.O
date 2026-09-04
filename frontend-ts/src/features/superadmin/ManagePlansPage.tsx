import { useState } from 'react'
import {
  CreditCard,
  Plus,
  Settings,
  CheckCircle2,
  Shield,
  Users,
  Infinity as InfinityIcon,
  Layers,
  Sparkles,
  Download,
  Check,
  TrendingUp,
} from 'lucide-react'
import { useGetPlans, type SubscriptionPlan } from '@/hooks/queries/useSuperadminQueries'
import PlanFormModal from './components/PlanFormModal'
import { exportPlansToExcel } from '@/utils/exportUtils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function ManagePlansPage() {
  const { data: plans = [], isLoading } = useGetPlans()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)

  const activePlans = plans.filter((p) => p.isActive)
  const avgPrice =
    plans.length > 0
      ? Math.round(plans.reduce((acc, p) => acc + (p.price || 0), 0) / plans.length)
      : 0

  const handleOpenCreate = () => {
    setSelectedPlan(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setIsModalOpen(true)
  }

  const handleExport = () => {
    exportPlansToExcel(plans)
  }

  return (
    <div className="space-y-5 pb-12 w-full max-w-full min-w-0">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Plan Packages & Feature Tiers
            </h1>
            <p className="text-xs text-muted-foreground">
              Configure tenant quotas, resident limits, pricing, and enabled system capabilities.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={plans.length === 0}
            className="gap-1.5 h-9 text-xs font-medium cursor-pointer shadow-xs rounded-xl"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Export Excel</span>
          </Button>
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="gap-1.5 h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs rounded-xl"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Plan Tier</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/80 flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">Active Tiers</span>
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground font-mono">
              {activePlans.length} / {plans.length}
            </div>
            <p className="text-[11px] mt-1 text-muted-foreground/80 font-medium">
              Available for new tenant onboarding
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/80 flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">Average Tier Price</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground font-mono">
              ${avgPrice}
            </div>
            <p className="text-[11px] mt-1 text-emerald-600 dark:text-emerald-400 font-medium">
              Per tenant monthly average
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/80 flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">Platform Capabilities</span>
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground font-mono">
              11 Modules
            </div>
            <p className="text-[11px] mt-1 text-muted-foreground/80 font-medium">
              Residence, Meals, Attendance, Dues & More
            </p>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xs"
            >
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-8 w-24" />
              <div className="space-y-2 pt-4 border-t border-border">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))
        ) : plans.length === 0 ? (
          <div className="col-span-full p-16 rounded-2xl border border-dashed border-border text-center space-y-3 bg-muted/10">
            <CreditCard className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">No subscription tiers created yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Define your pricing plans, resident limits, and feature toggles to begin onboarding hostel tenants.
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="mt-2 text-xs font-semibold gap-1.5"
            >
              <Plus className="h-4 w-4" /> Create First Plan
            </Button>
          </div>
        ) : (
          plans.map((plan) => {
            const studentLimit = plan.limits?.maxStudents
            const managerLimit = plan.limits?.maxManagers

            return (
              <div
                key={plan._id}
                className="flex flex-col justify-between p-6 rounded-2xl border border-border bg-card shadow-xs hover:border-purple-500/40 hover:shadow-md transition-all group"
              >
                <div className="space-y-4">
                  {/* Status & Edit Button */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        plan.isActive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          plan.isActive ? 'bg-emerald-500' : 'bg-muted-foreground'
                        }`}
                      />
                      {plan.isActive ? 'Active Plan' : 'Inactive'}
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(plan)}
                      className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Plan Name & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {plan.description || 'Standard multi-tenant management package'}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-3xl font-black tracking-tight text-foreground font-mono">
                      ${plan.price}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">/ month</span>
                  </div>

                  {/* Limits Badge Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                    <div className="p-2.5 rounded-xl bg-muted/20 border border-border/60">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> Students
                      </p>
                      <p className="text-sm font-bold text-foreground mt-0.5 font-mono">
                        {studentLimit === -1 ? (
                          <span className="flex items-center gap-1">
                            <InfinityIcon className="h-3.5 w-3.5 inline" /> Unlimited
                          </span>
                        ) : (
                          studentLimit || 100
                        )}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-muted/20 border border-border/60">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Staff
                      </p>
                      <p className="text-sm font-bold text-foreground mt-0.5 font-mono">
                        {managerLimit === -1 ? (
                          <span className="flex items-center gap-1">
                            <InfinityIcon className="h-3.5 w-3.5 inline" /> Unlimited
                          </span>
                        ) : (
                          managerLimit || 2
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Included Capabilities ({plan.features?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {plan.features?.map((f) => (
                        <span
                          key={f}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted/30 border border-border/80 text-foreground"
                        >
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          {f.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-border/60">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(plan)}
                    className="w-full text-xs font-semibold gap-1.5 cursor-pointer"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Configure Plan
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Plan Form Modal */}
      <PlanFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
      />
    </div>
  )
}
