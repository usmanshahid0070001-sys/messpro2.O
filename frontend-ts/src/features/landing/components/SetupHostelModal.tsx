import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Building2,
  Globe,
  Clock,
  User,
  Mail,
  Phone,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Users,
  Check,
  Lock,
  Search,
  Flame,
  UserCheck,
  Sliders,
} from 'lucide-react';
import { TIMEZONE_OPTIONS } from '@/utils/timezones';
import { useSubmitHostelRequest } from '@/hooks/mutations/useSuperadminMutations';
import { ALL_PLAN_FEATURES } from '@/features/superadmin/components/PlanFormModal';
import { PRICING_PLANS, type PricingPlanTier } from '../data/plansData';
import { toast } from 'sonner';

const RESERVED_SUBDOMAINS = [
  'api',
  'app',
  'admin',
  'superadmin',
  'auth',
  'login',
  'dashboard',
  'mail',
  'billing',
  'support',
  'test',
  'demo',
  'staging',
  'dev',
  'portal',
  'root',
  'help',
  'docs',
  'status',
  'cdn',
  'static',
  'assets',
  'ws',
  'graphql',
  'system',
  'null',
  'undefined',
  'www',
];

interface SetupHostelModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Optional initial plan identifier to pre-select upon opening */
  initialPlan?: string;
}

/**
 * SetupHostelModal Component
 *
 * Multi-step onboarding wizard for new hostel and mess facility administrators:
 * - Step 1: Facility Name, Custom Subdomain Slug, Timezone & Physical Location.
 * - Step 2: Primary Administrator Details & Optional Operational Manager.
 * - Step 3: Subscription Plan Selection (all 5 tiers) + Custom Quota & Module Configuration.
 * - Complete DNS MX mailbox verification, reserved subdomain protection, and auto-provisioning workflow.
 */
export const SetupHostelModal: React.FC<SetupHostelModalProps> = ({
  isOpen,
  onClose,
  initialPlan,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Form State: Facility
  const [hostelName, setHostelName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [location, setLocation] = useState('Asia/Karachi');
  const [address, setAddress] = useState('');

  // Form State: Administrator & Manager Contacts
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');

  // Form State: Plan Selection & Capabilities
  const [selectedPlanKey, setSelectedPlanKey] = useState<string>('free_trial');
  const [estimatedStudents, setEstimatedStudents] = useState<number>(100);
  const [estimatedManagers, setEstimatedManagers] = useState<number>(2);
  const [desiredFeatures, setDesiredFeatures] = useState<string[]>(
    ALL_PLAN_FEATURES.map((f) => f.id)
  );
  const [notes, setNotes] = useState('');

  // Timezone search query
  const [tzSearch, setTzSearch] = useState('');

  const { mutateAsync: submitRequest, isPending: isSubmitting } = useSubmitHostelRequest();

  // Pre-select plan when opened with an initialPlan prop
  useEffect(() => {
    if (!initialPlan) return;
    const clean = initialPlan.toLowerCase().trim();
    const matched = PRICING_PLANS.find(
      (p) =>
        p.id === clean ||
        p.name.toLowerCase() === clean ||
        clean.includes(p.id) ||
        clean.includes(p.name.toLowerCase())
    );
    if (matched) {
      setSelectedPlanKey(matched.id);
      setEstimatedStudents(matched.limits.defaultStudents);
      setEstimatedManagers(matched.limits.defaultManagers);
    }
  }, [initialPlan, isOpen]);

  // Auto-generate subdomain from hostel name if not edited
  const handleHostelNameChange = (val: string) => {
    setHostelName(val);
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 30);
    setSubdomain(slug);
    setSubmissionError(null);
  };

  const isSubdomainReserved = useMemo(() => {
    return RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase().trim());
  }, [subdomain]);

  const filteredTimezones = useMemo(() => {
    if (!tzSearch.trim()) return TIMEZONE_OPTIONS;
    const q = tzSearch.toLowerCase();
    return TIMEZONE_OPTIONS.filter(
      (tz) =>
        tz.value.toLowerCase().includes(q) ||
        tz.label.toLowerCase().includes(q) ||
        tz.region.toLowerCase().includes(q)
    );
  }, [tzSearch]);

  const toggleFeature = (id: string) => {
    const isCore = ALL_PLAN_FEATURES.find((f) => f.id === id)?.isCore;
    if (isCore) return;
    setDesiredFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    if (!hostelName.trim()) {
      toast.error('Please provide your Hostel Name');
      return;
    }
    const cleanSub = subdomain.trim().toLowerCase();
    if (!cleanSub || cleanSub.length < 3) {
      toast.error('Subdomain must be at least 3 characters long');
      return;
    }
    if (isSubdomainReserved) {
      toast.error(`"${cleanSub}" is a reserved system keyword. Please choose a unique subdomain.`);
      return;
    }
    setStep(2);
  };

  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    if (!adminName.trim() || !adminEmail.trim() || !adminPhone.trim()) {
      toast.error('Please provide Admin Name, Email, and WhatsApp phone number');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail.trim())) {
      toast.error('Please provide a valid official email address');
      return;
    }
    if (managerEmail.trim() && !emailRegex.test(managerEmail.trim())) {
      toast.error('Manager email is invalid');
      return;
    }
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    const selectedPlan = PRICING_PLANS.find((p) => p.id === selectedPlanKey) || PRICING_PLANS[0];

    const payload = {
      hostelName: hostelName.trim(),
      subdomain: subdomain.trim().toLowerCase(),
      location: location || 'Asia/Karachi',
      address: address.trim(),
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim().toLowerCase(),
      adminPhone: adminPhone.trim(),
      managerName: managerName.trim() || undefined,
      managerEmail: managerEmail.trim() ? managerEmail.trim().toLowerCase() : undefined,
      requestedPlan: {
        planType: selectedPlan.id,
        planName: selectedPlan.name,
        estimatedStudents: Number(estimatedStudents) || selectedPlan.limits.defaultStudents,
        estimatedManagers: Number(estimatedManagers) || selectedPlan.limits.defaultManagers,
        desiredFeatures: selectedPlan.isCustom
          ? Array.from(new Set(['user_management', 'hostel_configuration', ...desiredFeatures]))
          : selectedPlan.features.included,
        notes: notes.trim() || undefined,
      },
    };

    try {
      await submitRequest(payload);
      setIsSuccess(true);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to submit setup request';
      setSubmissionError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const resetAndClose = () => {
    setIsSuccess(false);
    setSubmissionError(null);
    setStep(1);
    setHostelName('');
    setSubdomain('');
    setAddress('');
    setAdminName('');
    setAdminEmail('');
    setAdminPhone('');
    setManagerName('');
    setManagerEmail('');
    setSelectedPlanKey('free_trial');
    setEstimatedStudents(100);
    setEstimatedManagers(2);
    onClose();
  };

  const currentSelectedPlan =
    PRICING_PLANS.find((p) => p.id === selectedPlanKey) || PRICING_PLANS[0];

  const handleSelectPlan = (plan: PricingPlanTier) => {
    setSelectedPlanKey(plan.id);
    setEstimatedStudents(plan.limits.defaultStudents);
    setEstimatedManagers(plan.limits.defaultManagers);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-card border border-border/80 dark:border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 glass-bevel">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border/60 dark:border-white/10 bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight text-foreground">
                  Setup Your Hostel on MessPro
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-primary/10 text-primary border border-primary/20">
                  10-Day Free Trial Included
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Automate mess dining, room allocation, QR attendance & billing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success View */}
        {isSuccess ? (
          <div className="p-8 sm:p-10 text-center space-y-5 flex-1 overflow-y-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl font-extrabold text-foreground">
                Hostel Setup Request Received!
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Thank you, <strong className="text-foreground">{adminName}</strong>. We have registered your request for <strong className="text-foreground">{hostelName}</strong> under the <strong className="text-primary">{currentSelectedPlan.name}</strong> plan.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 dark:bg-white/5 border border-border/80 dark:border-white/10 text-left space-y-2.5 max-w-md mx-auto text-xs">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Mail className="w-4 h-4 text-primary" />
                <span>Next Steps:</span>
              </div>
              <ul className="space-y-1.5 text-muted-foreground pl-6 list-disc text-[11px]">
                <li>A confirmation acknowledgment has been dispatched to <strong className="text-foreground">{adminEmail}</strong>.</li>
                <li>The MessPro Superadmin team will review and approve your workspace setup.</li>
                <li>Once approved, you will receive your official login credentials, custom subdomain URL, and complete feature overview via email & WhatsApp.</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:opacity-90 transition-all cursor-pointer"
              >
                Close & Return to Home
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step Progress Tracker */}
            <div className="px-6 pt-4 pb-2 border-b border-border/40 dark:border-white/5 bg-background/50 flex items-center justify-between shrink-0">
              {[
                { num: 1, label: 'Hostel Details' },
                { num: 2, label: 'Admin Contact' },
                { num: 3, label: 'Choose Plan & Quotas' },
              ].map((s, idx) => (
                <div key={s.num} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                      step >= s.num
                        ? 'bg-primary text-primary-foreground shadow-2xs'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span
                    className={`text-[11px] font-semibold hidden sm:inline ${
                      step >= s.num ? 'text-foreground font-bold' : 'text-muted-foreground'
                    }`}
                  >
                    {s.label}
                  </span>
                  {idx < 2 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 rounded-full transition-all ${
                        step > s.num ? 'bg-primary' : 'bg-border/60 dark:bg-white/10'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* Submission Error Alert */}
              {submissionError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                  <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    !
                  </div>
                  <div className="space-y-1 flex-1">
                    <span className="font-bold block text-rose-900 dark:text-rose-200">
                      Request Validation Notice
                    </span>
                    <p className="text-[11px] leading-relaxed">{submissionError}</p>
                    {submissionError.includes('already registered') && (
                      <div className="pt-1">
                        <a
                          href="/login"
                          className="inline-flex items-center gap-1 font-bold text-primary underline text-xs"
                        >
                          <span>Sign in to your MessPro account</span>
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmissionError(null)}
                    className="text-muted-foreground hover:text-foreground p-0.5 rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 1: Hostel Details */}
              {step === 1 && (
                <form onSubmit={handleNextFromStep1} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">Step 1: Facility & Timezone</h3>
                    <p className="text-xs text-muted-foreground">
                      Enter your hostel name and match your local operating timezone.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      Hostel / Hall Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Falcon Boys Residence, Jinnah Hall"
                      value={hostelName}
                      onChange={(e) => handleHostelNameChange(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-border/80 dark:border-white/10 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-teal-500" />
                      Subdomain Identifier <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-border/80 dark:border-white/10 bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/40">
                      <input
                        type="text"
                        required
                        placeholder="falcon-hall"
                        value={subdomain}
                        onChange={(e) => {
                          setSubdomain(
                            e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                          );
                          setSubmissionError(null);
                        }}
                        className="flex-1 h-10 px-3.5 bg-transparent text-foreground text-xs font-mono focus:outline-none"
                      />
                      <span className="px-3 text-[11px] font-mono font-semibold text-muted-foreground bg-muted/40 border-l border-border/60 dark:border-white/10 h-10 flex items-center">
                        .messpro.app
                      </span>
                    </div>
                    {isSubdomainReserved && (
                      <p className="text-[10px] text-rose-500 font-semibold">
                        ⚠️ &ldquo;{subdomain}&rdquo; is a reserved platform keyword. Please pick another name.
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground flex items-center justify-between gap-1 flex-wrap">
                      <span>Your staff and residents will access their dedicated portal at this link.</span>
                      <span className="text-primary font-medium">(Can be changed afterwards)</span>
                    </p>
                  </div>

                  {/* Location as Timezone */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        Hostel Location / Operating Timezone <span className="text-rose-500">*</span>
                      </label>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search city or timezone (e.g. Karachi, Dubai, London)..."
                          value={tzSearch}
                          onChange={(e) => setTzSearch(e.target.value)}
                          className="w-full h-9 pl-9 pr-3 rounded-xl border border-border/80 dark:border-white/10 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>

                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-border/80 dark:border-white/10 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        {filteredTimezones.map((tz) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label} ({tz.offset}) — {tz.region}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Determines automated meal cut-off timings, QR token validity windows, and daily attendance resets.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Physical Street Address / Campus Location (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sector H-12, University Road, Islamabad"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-border/80 dark:border-white/10 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:opacity-95 transition-all cursor-pointer"
                    >
                      <span>Next: Admin Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: Admin & Manager Details */}
              {step === 2 && (
                <form onSubmit={handleNextFromStep2} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">Step 2: Administrator & Staff</h3>
                    <p className="text-xs text-muted-foreground">
                      Login credentials and setup verification link will be emailed to this administrator.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-muted/30 dark:bg-white/5 border border-border/80 dark:border-white/10 space-y-3">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider block flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-500" /> Primary Admin Contact
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-foreground">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dr. Salman Qureshi"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          className="w-full h-9 px-3 rounded-xl border border-border/80 dark:border-white/10 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-foreground">
                          Official Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="salman@hostel.com"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="w-full h-9 px-3 rounded-xl border border-border/80 dark:border-white/10 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-emerald-500" />
                        WhatsApp / Contact Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+92 300 1234567"
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl border border-border/80 dark:border-white/10 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Our onboarding coordinator will also send quick setup assistance via WhatsApp.
                      </p>
                    </div>
                  </div>

                  {/* Optional Manager */}
                  <div className="p-3.5 rounded-2xl bg-muted/20 dark:bg-white/5 border border-border/60 dark:border-white/10 space-y-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      Optional Operational Manager
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          Manager Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Tariq Mehmood"
                          value={managerName}
                          onChange={(e) => setManagerName(e.target.value)}
                          className="w-full h-9 px-3 rounded-xl border border-border/80 dark:border-white/10 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          Manager Email
                        </label>
                        <input
                          type="email"
                          placeholder="manager@hostel.com"
                          value={managerEmail}
                          onChange={(e) => setManagerEmail(e.target.value)}
                          className="w-full h-9 px-3 rounded-xl border border-border/80 dark:border-white/10 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:opacity-95 transition-all cursor-pointer"
                    >
                      <span>Next: Select Plan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Plan & Quotas (5 Tiers Included) */}
              {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">Step 3: Select Your Operating Plan</h3>
                    <p className="text-xs text-muted-foreground">
                      Pick the tier tailored for your facility. All workspaces include an initial 10-day full-feature trial to explore MessPro before billing.
                    </p>
                  </div>

                  {/* 5-Plan Card Grid / Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {PRICING_PLANS.map((plan) => {
                      const isSelected = selectedPlanKey === plan.id;
                      return (
                        <div
                          key={plan.id}
                          onClick={() => handleSelectPlan(plan)}
                          className={`p-2.5 rounded-2xl border text-xs cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                            isSelected
                              ? 'border-primary bg-primary/10 ring-2 ring-primary/30 shadow-md scale-[1.02]'
                              : 'border-border/70 bg-card hover:border-primary/40 hover:bg-muted/30'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-1 min-h-[18px]">
                              <span
                                className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${plan.badgeColor}`}
                              >
                                {plan.badge}
                              </span>
                              {plan.isPopular && <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />}
                            </div>
                            <span className="font-bold text-foreground text-xs block leading-tight">
                              {plan.name}
                            </span>
                          </div>

                          <div className="pt-2 mt-2 border-t border-border/40">
                            <span className="text-sm font-black text-foreground block">
                              {plan.priceMonthly}
                            </span>
                            <span className="text-[9px] text-muted-foreground block truncate">
                              {plan.limits.students}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Active Selected Plan Detailed Specification Panel */}
                  <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-md space-y-3.5 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-extrabold text-foreground">
                            {currentSelectedPlan.name}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${currentSelectedPlan.badgeColor}`}
                          >
                            {currentSelectedPlan.badge}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {currentSelectedPlan.tagline}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-xl font-extrabold text-foreground">
                          {currentSelectedPlan.priceMonthly}
                          <span className="text-xs font-normal text-muted-foreground ml-1">
                            {currentSelectedPlan.billingPeriod}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Limits Highlight Strip */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/60">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] text-muted-foreground block font-medium">
                            {currentSelectedPlan.id === 'mess_basic' ? 'Diners Limit' : 'Resident Limit'}
                          </span>
                          <span className="text-xs font-bold text-foreground block truncate">
                            {currentSelectedPlan.limits.students}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                          <UserCheck className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] text-muted-foreground block font-medium">
                            Staff Accounts
                          </span>
                          <span className="text-xs font-bold text-foreground block truncate">
                            {currentSelectedPlan.limits.managers}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Included Modules Grid */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Included In This Plan:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {currentSelectedPlan.features.included.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-xs text-foreground/90">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
                            <span className="leading-tight text-[11px]">{feature}</span>
                          </div>
                        ))}

                        {currentSelectedPlan.features.excluded?.map((feature, idx) => (
                          <div key={`ex-${idx}`} className="flex items-start gap-1.5 text-xs text-muted-foreground/50">
                            <Lock className="w-3 h-3 text-muted-foreground/40 shrink-0 mt-0.5" />
                            <span className="leading-tight text-[11px] line-through">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Custom Quota & Module Controls for Custom / Enterprise */}
                    {currentSelectedPlan.isCustom && (
                      <div className="pt-3 border-t border-border/50 space-y-3 animate-in fade-in duration-150">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                          <Sliders className="w-3.5 h-3.5 text-blue-600" />
                          <span>Customize Scale & Module Selection</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-muted-foreground">
                              Requested Student Capacity
                            </label>
                            <input
                              type="number"
                              min={100}
                              step={50}
                              value={estimatedStudents}
                              onChange={(e) => setEstimatedStudents(parseInt(e.target.value, 10) || 500)}
                              className="w-full h-9 px-3 rounded-xl border border-border/80 bg-background text-foreground text-xs font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-muted-foreground">
                              Requested Staff Accounts
                            </label>
                            <input
                              type="number"
                              min={2}
                              value={estimatedManagers}
                              onChange={(e) => setEstimatedManagers(parseInt(e.target.value, 10) || 5)}
                              className="w-full h-9 px-3 rounded-xl border border-border/80 bg-background text-foreground text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 pt-1">
                          <span className="text-[11px] font-bold text-foreground block">
                            Pick Specific Desired Modules:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                            {ALL_PLAN_FEATURES.map((f) => {
                              const isSelected = desiredFeatures.includes(f.id);
                              const isLocked = Boolean(f.isCore);
                              return (
                                <div
                                  key={f.id}
                                  onClick={() => !isLocked && toggleFeature(f.id)}
                                  className={`p-2 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 transition-all select-none ${
                                    isLocked
                                      ? 'border-blue-500/30 bg-blue-500/10 text-foreground cursor-default'
                                      : isSelected
                                      ? 'border-primary bg-primary/10 text-foreground cursor-pointer font-bold'
                                      : 'border-border/60 bg-muted/10 text-muted-foreground cursor-pointer hover:bg-muted/30'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-[11px] font-semibold text-foreground truncate">{f.label}</span>
                                    {isLocked && (
                                      <span className="inline-flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
                                        <Lock className="w-2 h-2" /> Core
                                      </span>
                                    )}
                                  </div>
                                  <div
                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                      isLocked || isSelected
                                        ? 'bg-primary border-primary text-primary-foreground'
                                        : 'border-muted-foreground/40 bg-background'
                                    }`}
                                  >
                                    {(isLocked || isSelected) && <Check className="w-2.5 h-2.5" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional notes */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">
                      Special Inquiries / Hardware Integration Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Need help importing student roster from Excel or connecting ZKTeco biometric gate..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                    />
                  </div>

                  {/* Superadmin Approval Disclaimer */}
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-[11px]">
                      <span className="font-bold block">10-Day Full Access Trial Workflow</span>
                      <span>
                        All setup requests automatically receive a 10-day full-access trial upon approval. Official login details and custom subdomain link will be sent to <strong>{adminEmail}</strong>.
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting Request...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Submit Setup Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SetupHostelModal;
