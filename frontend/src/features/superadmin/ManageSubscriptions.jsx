import { useState } from 'react';
import { Plus, Settings, CreditCard, CheckCircle2, Shield, Users, Infinity, Zap, Receipt, ScanLine } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import { usePlans } from '../../hooks/queries/usePlanQueries';
import PlanFormModal from '../../components/superadmin/PlanFormModal';

// Helper to format limits nicely
function formatLimit(value) {
  if (value === -1) return 'Unlimited';
  return value?.toLocaleString();
}

export default function ManageSubscriptions() {
  const { data, isLoading: loading, error } = usePlans();
  const plans = data?.data || [];
  
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  if (error) {
    console.error(error);
  }

  const openEditModal = (plan) => {
    setSelectedPlan(plan);
    setIsPlanModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedPlan(null);
    setIsPlanModalOpen(true);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-black tracking-tight text-[#111111] dark:text-white">Subscriptions</h1>
          <p className="mt-1 text-sm font-medium text-[#737373] dark:text-[#a0a0a0]">
            Manage subscription plans, limits, and feature toggles for hostels.
          </p>
        </div>
        <button 
          onClick={openCreateModal}
          className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#111111] dark:bg-white text-white dark:text-[#111111] rounded-xl text-sm font-semibold hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#050505]"
        >
          <Plus className="w-4 h-4" />
          Create Plan
        </button>
      </div>

      {/* Plans Section */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2 text-sm font-bold text-[#111111] dark:text-white">
          <CreditCard className="w-4 h-4 text-[#737373] dark:text-[#888888]" />
          Available Plans 
          <span className="text-[#737373] dark:text-[#888888] font-medium">({plans.length})</span>
        </div>

        {loading ? (
          <div className="p-16 text-center flex flex-col items-center gap-3 border border-[#e5e5e5] dark:border-[#222222] rounded-2xl bg-white dark:bg-[#0a0a0a]">
            <div className="w-6 h-6 border-2 border-black/20 dark:border-white/20 border-t-black dark:border-t-white rounded-full animate-spin" />
            <p className="text-sm font-medium text-[#737373] dark:text-[#888888]">Loading plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center border border-dashed border-[#d4d4d4] dark:border-[#333333] rounded-2xl bg-[#fafafa] dark:bg-[#0a0a0a]">
            <div className="w-12 h-12 rounded-full bg-[#f5f5f5] dark:bg-[#1a1a1a] flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-[#a3a3a3] dark:text-[#555555]" />
            </div>
            <p className="text-sm font-semibold text-[#111111] dark:text-white">
              No plans created yet
            </p>
            <p className="text-xs font-medium text-[#737373] mt-1 max-w-xs">
              Create your first subscription tier to define limits, pricing, and features for tenants.
            </p>
            <button 
              onClick={openCreateModal}
              className="mt-5 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-[#e5e5e5] dark:border-[#222222] text-[#111111] dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first plan
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <div 
                key={plan._id} 
                className="flex flex-col rounded-2xl border border-[#e5e5e5] dark:border-[#222222] bg-white dark:bg-[#0a0a0a] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-black/15 dark:hover:border-white/15 transition-all duration-300 group"
              >
                {/* Card Header — name, price, status */}
                <div className="p-6 pb-5">
                  <div className="flex items-start justify-between mb-3">
                    <StatusBadge tone={plan.isActive ? 'success' : 'neutral'}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </StatusBadge>
                    <button 
                      onClick={() => openEditModal(plan)}
                      className="p-1.5 rounded-lg text-[#d4d4d4] dark:text-[#444444] group-hover:text-[#737373] dark:group-hover:text-[#888888] hover:!text-[#111111] dark:hover:!text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white"
                      aria-label={`Edit ${plan.name} plan`}
                      title="Edit Plan"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h3 className="text-lg font-bold text-[#111111] dark:text-white tracking-tight">{plan.name}</h3>
                  <p className="text-[13px] text-[#737373] dark:text-[#a0a0a0] leading-relaxed mt-1 line-clamp-2">
                    {plan.description}
                  </p>
                  
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-3xl font-black tracking-tight text-[#111111] dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-sm font-semibold text-[#a3a3a3] dark:text-[#666666]">/mo</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="mx-6 h-px bg-[#f0f0f0] dark:bg-[#1a1a1a]" />

                {/* Card Body — limits */}
                <div className="px-6 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#a3a3a3] dark:text-[#555555] mb-3">Limits</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#fafafa] dark:bg-[#111111] border border-[#f0f0f0] dark:border-[#1a1a1a]">
                      <Users className="w-4 h-4 text-[#a3a3a3] dark:text-[#555555] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#111111] dark:text-white leading-none">
                          {plan.limits?.maxStudents === -1 
                            ? <Infinity className="w-4 h-4 inline" /> 
                            : formatLimit(plan.limits?.maxStudents)}
                        </p>
                        <p className="text-[10px] font-medium text-[#a3a3a3] dark:text-[#666666] mt-0.5">Students</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#fafafa] dark:bg-[#111111] border border-[#f0f0f0] dark:border-[#1a1a1a]">
                      <Shield className="w-4 h-4 text-[#a3a3a3] dark:text-[#555555] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#111111] dark:text-white leading-none">
                          {plan.limits?.maxManagers === -1 
                            ? <Infinity className="w-4 h-4 inline" /> 
                            : formatLimit(plan.limits?.maxManagers)}
                        </p>
                        <p className="text-[10px] font-medium text-[#a3a3a3] dark:text-[#666666] mt-0.5">Managers</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer — features */}
                <div className="px-6 pb-6 pt-1 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#a3a3a3] dark:text-[#555555] mb-3">Features</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <ScanLine className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-[13px] font-medium text-[#404040] dark:text-[#cccccc]">
                        {plan.features?.allowedAttendanceMethods?.join(', ') || 'Manual'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Receipt className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span className="text-[13px] font-medium text-[#404040] dark:text-[#cccccc]">
                        {plan.features?.allowedBillingModels?.join(', ') || 'Prepaid'}
                      </span>
                    </div>

                    {plan.features?.allowAutoMealVerification && (
                      <div className="flex items-center gap-2.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="text-[13px] font-medium text-[#404040] dark:text-[#cccccc]">Auto Meal Verification</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PlanFormModal 
        isOpen={isPlanModalOpen} 
        onClose={() => setIsPlanModalOpen(false)} 
        plan={selectedPlan}
      />
    </div>
  );
}
