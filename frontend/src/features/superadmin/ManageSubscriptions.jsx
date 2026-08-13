import { useState } from'react';
import { Plus, Settings, CreditCard, CheckCircle2, Shield, Users, Infinity, Zap, Receipt, ScanLine } from'lucide-react';
import StatusBadge from'../../features/ui/StatusBadge';
import { usePlans } from'../../hooks/queries/usePlanQueries';
import PlanFormModal from'./components/PlanFormModal';

// Helper to format limits nicely
function formatLimit(value) {
 if (value === -1) return'Unlimited';
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
 <div className="space-y-6 p-4 lg:p-8">
 {/* Page Header */}
 <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
 <div className="min-w-0">
 <h1 className="text-2xl font-black tracking-tight text-foreground">Subscriptions</h1>
 <p className="mt-1 text-sm font-medium text-foreground dark:text-foreground">
 Manage subscription plans, limits, and feature toggles for hostels.
 </p>
 </div>
 </div>

 {/* Plans Section */}
 <div className="flex flex-col gap-5">
 {/* Header Section */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

 {/* Left: Title & Count Badge */}
 <div className="flex items-center gap-2.5 shrink-0">
 <div className="p-1.5 bg-secondary rounded-lg border border-border dark:border-border">
 <CreditCard className="w-4 h-4 text-foreground dark:text-foreground"/>
 </div>
 <h2 className="text-sm font-bold text-foreground">
 Available Plans
 </h2>
 <span className="flex items-center justify-center px-2 py-0.5 bg-secondary border border-border dark:border-border rounded-full text-[11px] font-semibold text-foreground dark:text-foreground">
 {plans.length}
 </span>
 </div>

 {/* Right: Actions Group */}
 <div className="w-full sm:w-auto">
 <button
 onClick={openCreateModal}
 className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 dark:bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background"
 >
 <Plus className="w-4 h-4 shrink-0"/>
 <span>Create Plan</span>
 </button>
 </div>

 </div>

 {loading ? (
 <div className="p-16 text-center flex flex-col items-center gap-3 border border-border dark:border-border rounded-2xl bg-background">
 <div className="w-6 h-6 border-2 border-black/20 dark:border-white/20 border-t-black dark:border-t-white rounded-full animate-spin"/>
 <p className="text-sm font-medium text-foreground dark:text-foreground">Loading plans...</p>
 </div>
 ) : plans.length === 0 ? (
 <div className="p-16 text-center flex flex-col items-center border border-dashed border-border dark:border-border rounded-2xl bg-background">
 <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
 <CreditCard className="w-6 h-6 text-foreground dark:text-foreground"/>
 </div>
 <p className="text-sm font-semibold text-foreground">
 No plans created yet
 </p>
 <p className="text-xs font-medium text-foreground mt-1 max-w-xs">
 Create your first subscription tier to define limits, pricing, and features for tenants.
 </p>
 <button
 onClick={openCreateModal}
 className="mt-5 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-border dark:border-border text-foreground hover:bg-background dark:hover:bg-background transition-colors"
 >
 <Plus className="w-4 h-4"/>
 Create your first plan
 </button>
 </div>
 ) : (
 <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
 {plans.map((plan) => (
 <div
 key={plan._id}
 className="flex flex-col rounded-2xl border border-border dark:border-border bg-background overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-black/15 dark:hover:border-white/15 transition-all duration-300 group"
 >
 {/* Card Header — name, price, status */}
 <div className="p-6 pb-5">
 <div className="flex items-start justify-between mb-3">
 <StatusBadge tone={plan.isActive ?'success':'neutral'}>
 {plan.isActive ?'Active':'Inactive'}
 </StatusBadge>
 <button
 onClick={() => openEditModal(plan)}
 className="p-1.5 rounded-lg text-foreground dark:text-foreground group-hover:text-foreground dark:group-hover:text-foreground hover:!text-foreground dark:hover:!text-white hover:bg-accent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:focus-visible:ring-white"
 aria-label={`Edit ${plan.name} plan`}
 title="Edit Plan"
 >
 <Settings className="w-4 h-4"/>
 </button>
 </div>

 <h3 className="text-lg font-bold text-foreground tracking-tight">{plan.name}</h3>
 <p className="text-[13px] text-foreground dark:text-foreground leading-relaxed mt-1 line-clamp-2">
 {plan.description}
 </p>

 <div className="mt-5 flex items-baseline gap-1">
 <span className="text-3xl font-black tracking-tight text-foreground">
 ${plan.price}
 </span>
 <span className="text-sm font-semibold text-foreground dark:text-foreground">/mo</span>
 </div>
 </div>

 {/* Divider */}
 <div className="mx-6 h-px bg-background dark:bg-background"/>

 {/* Card Body — limits */}
 <div className="px-6 py-4">
 <p className="text-[10px] font-bold uppercase tracking-widest text-foreground dark:text-foreground mb-3">Limits</p>
 <div className="grid grid-cols-2 gap-3">
 <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background dark:bg-background border border-border">
 <Users className="w-4 h-4 text-foreground dark:text-foreground shrink-0"/>
 <div className="min-w-0">
 <p className="text-sm font-bold text-foreground leading-none">
 {plan.limits?.maxStudents === -1
 ? <Infinity className="w-4 h-4 inline"/>
 : formatLimit(plan.limits?.maxStudents)}
 </p>
 <p className="text-[10px] font-medium text-foreground dark:text-foreground mt-0.5">Students</p>
 </div>
 </div>
 <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background dark:bg-background border border-border">
 <Shield className="w-4 h-4 text-foreground dark:text-foreground shrink-0"/>
 <div className="min-w-0">
 <p className="text-sm font-bold text-foreground leading-none">
 {plan.limits?.maxManagers === -1
 ? <Infinity className="w-4 h-4 inline"/>
 : formatLimit(plan.limits?.maxManagers)}
 </p>
 <p className="text-[10px] font-medium text-foreground dark:text-foreground mt-0.5">Managers</p>
 </div>
 </div>
 </div>
 </div>

 {/* Card Footer — features */}
 <div className="px-6 pb-6 pt-1 flex-1">
 <p className="text-[10px] font-bold uppercase tracking-widest text-foreground dark:text-foreground mb-3">Features</p>
 <div className="space-y-2.5">
 {plan.features?.length > 0 ? (
 <div className="flex flex-wrap gap-2">
 {plan.features.map(feature => (
 <span key={feature} className="inline-flex items-center px-2 py-1 rounded-md bg-background dark:bg-background border border-border dark:border-border text-[12px] font-medium text-foreground dark:text-foreground">
 <CheckCircle2 className="w-3 h-3 text-emerald-500 mr-1.5 shrink-0"/>
 {feature}
 </span>
 ))}
 </div>
 ) : (
 <span className="text-[13px] text-foreground italic">No features specified</span>
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
