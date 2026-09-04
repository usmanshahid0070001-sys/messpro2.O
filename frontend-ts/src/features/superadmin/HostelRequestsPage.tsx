import { useState } from 'react';
import {
  Inbox,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Globe,
  User,
  Mail,
  Phone,
  Eye,
  Check,
  X,
  Loader2,
  AlertTriangle,
  Send,
  ExternalLink,
  Sparkles,
  Layers,
  ShieldCheck,
  PhoneCall,
} from 'lucide-react';
import {
  useGetHostelRequests,
  useGetPlans,
  type HostelSetupRequest,
} from '@/hooks/queries/useSuperadminQueries';
import {
  useApproveHostelRequest,
  useRejectHostelRequest,
} from '@/hooks/mutations/useSuperadminMutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SuperadminSupportContactsModal } from './components/SuperadminSupportContactsModal';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { toast } from 'sonner';

const FEATURE_NAME_MAP: Record<string, string> = {
  user_management: 'Staff & Student Directory',
  hostel_configuration: 'Hostel & Branding Config',
  residence_management: 'Room & Bed Allocations',
  meal_management: 'Mess & Dining Controls',
  meal_settings: 'Dietary & Menu Scheduler',
  attendance_marking: 'Digital Attendance System',
  qr_scanner: 'Instant QR Token Validation',
  bill_management: 'Billing & Invoice Ledger',
  bill_generation: 'Automated Bill Generator',
  complaint_system: 'Resident Grievance Desk',
  analytics_dashboard: 'Financial & Growth Analytics',
  inventory_management: 'Mess Pantry & Stocks',
  guest_meals: 'Guest & Casual Scans',
  access_logs: 'Security & Audit Logs',
};

const getFeatureLabel = (key: string) => {
  const normalized = key.toLowerCase().replace(/[\s-]+/g, '_');
  return FEATURE_NAME_MAP[normalized] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function HostelRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Support Contacts Modal State
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const superadminContacts = currentUser?.additionalInfo || [];

  // Active modal targets
  const [viewingRequest, setViewingRequest] = useState<HostelSetupRequest | null>(null);
  const [approvingRequest, setApprovingRequest] = useState<HostelSetupRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<HostelSetupRequest | null>(null);

  // Approval Form State
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [tempPassword, setTempPassword] = useState<string>('');

  // Rejection Form State
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const { data: requestsData, isLoading } = useGetHostelRequests({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

  const { data: plans = [] } = useGetPlans(Boolean(approvingRequest));

  const { mutateAsync: approveRequest, isPending: isApproving } = useApproveHostelRequest();
  const { mutateAsync: rejectRequest, isPending: isRejecting } = useRejectHostelRequest();

  const requests: HostelSetupRequest[] = Array.isArray(requestsData)
    ? requestsData
    : requestsData?.requests || [];

  // Metrics
  const totalCount = requestsData?.total ?? requests.length;
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  const handleOpenApproveModal = (req: HostelSetupRequest) => {
    setApprovingRequest(req);
    const reqPlanId = typeof req.requestedPlan?.planId === 'object' 
      ? req.requestedPlan.planId?._id 
      : req.requestedPlan?.planId;

    if (reqPlanId) {
      setSelectedPlanId(reqPlanId);
    } else if (plans.length > 0) {
      setSelectedPlanId(plans[0]._id);
    }
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingRequest) return;
    if (!selectedPlanId) {
      toast.error('Please choose a subscription plan tier');
      return;
    }

    try {
      await approveRequest({
        id: approvingRequest._id,
        planId: selectedPlanId,
        temporaryPassword: tempPassword.trim() || undefined,
      });
      setApprovingRequest(null);
      setSelectedPlanId('');
      setTempPassword('');
    } catch {
      // Handled in mutation toast
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequest) return;
    if (!rejectionReason.trim()) {
      toast.error('Please specify a rejection reason');
      return;
    }

    try {
      await rejectRequest({
        id: rejectingRequest._id,
        reason: rejectionReason.trim(),
      });
      setRejectingRequest(null);
      setRejectionReason('');
    } catch {
      // Handled in mutation toast
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Hostel Setup Requests
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {pendingCount} Pending
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review applicant onboarding submissions, verify custom requirements, and provision tenant workspaces.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsContactsModalOpen(true)}
            className="text-xs h-9 gap-1.5 border-border/80 shadow-2xs"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
            <span>Support Contacts</span>
            {superadminContacts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                {superadminContacts.length}
              </span>
            )}
          </Button>

          <a
            href="/app/superadmin/plans"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-muted/60 hover:bg-muted text-foreground border border-border/80 transition-colors h-9"
          >
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Manage Subscription Plans</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>
        </div>
      </div>

      <SuperadminSupportContactsModal 
        isOpen={isContactsModalOpen} 
        onClose={() => setIsContactsModalOpen(false)} 
      />

      {/* ── KPI Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-border/80 bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Requests</span>
            <Inbox className="h-4 w-4 text-blue-500" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">{totalCount}</span>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Pending Review</span>
            <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-amber-700 dark:text-amber-300">
            {pendingCount}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Approved & Active</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">
            {approvedCount}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Rejected</span>
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-rose-700 dark:text-rose-300">
            {rejectedCount}
          </span>
        </div>
      </div>

      {/* ── Filters & Search ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/80 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search hostel, subdomain, admin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'pending', label: 'Pending' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Requests Table / List ───────────────────────────────── */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Inbox className="h-10 w-10 text-muted-foreground mx-auto opacity-40" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">No Onboarding Requests Found</h3>
              <p className="text-xs text-muted-foreground">
                Public hostel setup submissions from the landing page will appear here for review.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Hostel & Subdomain</th>
                  <th className="py-3 px-4">Admin Contact</th>
                  <th className="py-3 px-4">Timezone / Location</th>
                  <th className="py-3 px-4">Requested Scope</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {requests.map((req) => {
                  const isPending = req.status === 'pending';
                  const isApproved = req.status === 'approved';
                  const isRejected = req.status === 'rejected';
                  const planType = req.requestedPlan?.planType;
                  const reqFeatures = req.requestedPlan?.desiredFeatures || req.requestedPlan?.customFeatures || [];

                  return (
                    <tr key={req._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground block text-xs">
                            {req.hostelName}
                          </span>
                          <span className="text-[10px] font-mono text-primary flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {req.subdomain}.messpro.app
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-foreground flex items-center gap-1">
                            <User className="h-3 w-3 text-blue-500" />
                            {req.adminName}
                          </span>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {req.adminEmail}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {req.adminPhone}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-semibold text-foreground">
                            {req.location}
                          </span>
                          {req.address && (
                            <span className="text-[10px] text-muted-foreground block truncate max-w-[180px]">
                              {req.address}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              planType === 'custom'
                                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                : planType === 'standard'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {planType === 'custom'
                                ? 'Custom Plan'
                                : planType === 'standard'
                                ? 'Standard Plan'
                                : '10-Day Trial'}
                            </span>
                            {reqFeatures.length > 0 && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted font-semibold text-muted-foreground">
                                +{reqFeatures.length} modules
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground block">
                            ~{req.requestedPlan?.estimatedStudents || 100} Students, ~{req.requestedPlan?.estimatedManagers || 2} Staff
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Clock className="h-3 w-3" /> Pending
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" /> Approved
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <XCircle className="h-3 w-3" /> Rejected
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-muted-foreground text-[11px]">
                        {new Date(req.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingRequest(req)}
                            className="h-7 px-2 text-xs"
                            title="View Full Scope & Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          {isPending && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleOpenApproveModal(req)}
                                className="h-7 px-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                              >
                                <Check className="h-3 w-3" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setRejectingRequest(req)}
                                className="h-7 px-2 text-xs"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── APPROVE MODAL ───────────────────────────────────────── */}
      {approvingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-emerald-500/5 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Approve & Provision Hostel Workspace
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {approvingRequest.hostelName} ({approvingRequest.subdomain}.messpro.app)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setApprovingRequest(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleApproveSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/80 space-y-1.5">
                <span className="font-bold text-foreground block">Client Contact Details:</span>
                <p className="text-muted-foreground">
                  Admin: <strong className="text-foreground">{approvingRequest.adminName}</strong> ({approvingRequest.adminEmail} • {approvingRequest.adminPhone})
                </p>
                <p className="text-muted-foreground">
                  Timezone: <strong className="text-foreground">{approvingRequest.location}</strong>
                  {approvingRequest.address && ` • ${approvingRequest.address}`}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    Applicant&apos;s Requested Scope & Needs:
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25">
                    {approvingRequest.requestedPlan?.planType === '10_day_trial'
                      ? '10-Day Free Trial'
                      : approvingRequest.requestedPlan?.planType === 'standard'
                      ? 'Standard Tier'
                      : 'Custom Enterprise Plan'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-purple-500/15">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Estimated Residents:</span>
                    <strong className="text-foreground">~{approvingRequest.requestedPlan?.estimatedStudents || 100} Students</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Estimated Managers:</span>
                    <strong className="text-foreground">~{approvingRequest.requestedPlan?.estimatedManagers || 2} Staff</strong>
                  </div>
                </div>

                {((approvingRequest.requestedPlan?.desiredFeatures && approvingRequest.requestedPlan.desiredFeatures.length > 0) ||
                  (approvingRequest.requestedPlan?.customFeatures && approvingRequest.requestedPlan.customFeatures.length > 0)) && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-muted-foreground font-semibold block">
                      Requested Specific Modules ({
                        (approvingRequest.requestedPlan?.desiredFeatures || approvingRequest.requestedPlan?.customFeatures || []).length
                      }):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(approvingRequest.requestedPlan?.desiredFeatures || approvingRequest.requestedPlan?.customFeatures || []).map((feat) => (
                        <span
                          key={feat}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20"
                        >
                          ✓ {getFeatureLabel(feat)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {approvingRequest.requestedPlan?.notes && (
                  <div className="p-2 rounded-lg bg-background/80 border border-border/60 text-[11px] space-y-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground block">Applicant Note / Special Requirements:</span>
                    <p className="italic text-foreground">{approvingRequest.requestedPlan.notes}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground">
                    Assign Subscription Plan Tier <span className="text-rose-500">*</span>
                  </label>
                  <a
                    href="/app/superadmin/plans"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                  >
                    <span>Create Custom Plan in Plans Section</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <select
                  required
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">-- Choose Plan Tier to Provision --</option>
                  {plans.map((p) => {
                    const studentLabel = p.limits.maxStudents === -1 ? 'Unlimited' : `${p.limits.maxStudents}`;
                    const managerLabel = p.limits.maxManagers === -1 ? 'Unlimited' : `${p.limits.maxManagers}`;
                    const priceLabel = p.price === 0 ? 'FREE' : `$${p.price}/mo`;
                    return (
                      <option key={p._id} value={p._id}>
                        {p.name} ({priceLabel}) — Up to {studentLabel} Residents & {managerLabel} Staff ({p.features?.length || 0} Modules)
                      </option>
                    );
                  })}
                </select>

                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300 text-[11px] flex items-center justify-between">
                  <span>
                    💡 Selected plan will be provisioned with a <strong>10-day active trial</strong> automatically.
                  </span>
                </div>
              </div>

              {/* Official Supporting Contacts Card (Auto-fetched from Superadmin additionalInfo) */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    Official Superadmin Support Contacts (Auto-Dispatched):
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsContactsModalOpen(true)}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Edit Contacts
                  </button>
                </div>

                {superadminContacts.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {superadminContacts.map((c, i) => {
                      const isEmail = c.value.includes('@') || c.key.toLowerCase().includes('mail');
                      return (
                        <div
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-background border border-border/80 text-[11px] flex items-center gap-1.5 shadow-2xs"
                        >
                          {isEmail ? (
                            <Mail className="w-3 h-3 text-blue-500" />
                          ) : (
                            <Phone className="w-3 h-3 text-emerald-500" />
                          )}
                          <span className="text-muted-foreground">{c.key}:</span>
                          <strong className="text-foreground">{c.value}</strong>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] flex items-center justify-between">
                    <span>No custom supporting numbers added yet. Default will use your account email ({currentUser?.email}).</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsContactsModalOpen(true)}
                      className="h-6 text-[10px] px-2"
                    >
                      + Add Contacts
                    </Button>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground">
                  These supporting emails and WhatsApp numbers will automatically be embedded into the welcome email sent to this hostel&apos;s administrator.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Custom Admin Temporary Password (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="Leave empty to auto-generate secure password"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] space-y-1">
                <span className="font-bold block flex items-center gap-1">
                  <Send className="h-3 w-3" /> Automated Dispatch on Approval:
                </span>
                <p>
                  1. Creates `Hostel` tenant + `admin` user with 10-day trial.<br />
                  2. Dispatches welcome email with credentials, login URL, and Superadmin WhatsApp contacts.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setApprovingRequest(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isApproving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Provisioning...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" /> Approve & Dispatch Credentials
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── REJECT MODAL ────────────────────────────────────────── */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-rose-500/5 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Reject Setup Request</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {rejectingRequest.hostelName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRejectingRequest(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Reason for Rejection <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Duplicate request, missing contact details, invalid domain..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
                <p className="text-[10px] text-muted-foreground">
                  This explanation will be emailed to the applicant ({rejectingRequest.adminEmail}) immediately.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRejectingRequest(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={isRejecting}
                  className="gap-1.5 font-semibold"
                >
                  {isRejecting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" /> Confirm Rejection & Email Client
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DETAILS MODAL ───────────────────────────────────────── */}
      {viewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {viewingRequest.hostelName}
                  </h3>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {viewingRequest.subdomain}.messpro.app
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingRequest(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/20 border border-border/60">
                <div>
                  <span className="text-muted-foreground text-[10px] block">Admin Name</span>
                  <span className="font-bold text-foreground">{viewingRequest.adminName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Admin Email</span>
                  <span className="font-bold text-foreground">{viewingRequest.adminEmail}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Admin WhatsApp</span>
                  <span className="font-bold text-foreground">{viewingRequest.adminPhone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Timezone / Location</span>
                  <span className="font-bold text-foreground">{viewingRequest.location}</span>
                </div>
              </div>

              {viewingRequest.address && (
                <div className="p-3 rounded-xl bg-muted/20 border border-border/60">
                  <span className="text-muted-foreground text-[10px] block">Physical Address</span>
                  <span className="font-medium text-foreground">{viewingRequest.address}</span>
                </div>
              )}

              {viewingRequest.managerName && (
                <div className="p-3 rounded-xl bg-muted/20 border border-border/60">
                  <span className="text-muted-foreground text-[10px] block">Manager Contact</span>
                  <span className="font-medium text-foreground">
                    {viewingRequest.managerName} {viewingRequest.managerEmail && `(${viewingRequest.managerEmail})`}
                  </span>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    Applicant's Custom Requirements:
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25">
                    {viewingRequest.requestedPlan?.planType === '10_day_trial'
                      ? '10-Day Free Trial'
                      : viewingRequest.requestedPlan?.planType === 'standard'
                      ? 'Standard Plan'
                      : 'Custom Enterprise'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-purple-500/15">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Estimated Scale:</span>
                    <strong className="text-foreground">~{viewingRequest.requestedPlan?.estimatedStudents || 100} Students</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Estimated Staff:</span>
                    <strong className="text-foreground">~{viewingRequest.requestedPlan?.estimatedManagers || 2} Managers</strong>
                  </div>
                </div>

                {((viewingRequest.requestedPlan?.desiredFeatures && viewingRequest.requestedPlan.desiredFeatures.length > 0) ||
                  (viewingRequest.requestedPlan?.customFeatures && viewingRequest.requestedPlan.customFeatures.length > 0)) && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-muted-foreground font-semibold block">Requested Feature Modules:</span>
                    <div className="flex flex-wrap gap-1">
                      {(viewingRequest.requestedPlan?.desiredFeatures || viewingRequest.requestedPlan?.customFeatures || []).map((f) => (
                        <span key={f} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                          ✓ {getFeatureLabel(f)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {viewingRequest.requestedPlan?.notes && (
                  <div className="p-2 rounded-lg bg-background/80 border border-border/60 text-[11px] space-y-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground block">Client Notes:</span>
                    <p className="italic text-foreground">{viewingRequest.requestedPlan.notes}</p>
                  </div>
                )}
              </div>

              {viewingRequest.rejectionReason && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300">
                  <span className="font-bold block text-[10px]">Rejection Reason:</span>
                  <p>{viewingRequest.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border flex justify-between items-center shrink-0">
              {viewingRequest.status === 'pending' ? (
                <Button
                  size="sm"
                  onClick={() => {
                    const req = viewingRequest;
                    setViewingRequest(null);
                    handleOpenApproveModal(req);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Approve This Request
                </Button>
              ) : (
                <div />
              )}
              <Button variant="ghost" size="sm" onClick={() => setViewingRequest(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
