import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, ChevronRight, ChevronLeft, Check, Building2, Users, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateHostel } from '../../hooks/mutations/useSuperadminMutations';
import { usePlans } from '../../hooks/queries/usePlanQueries';
import { useFormDraft } from '../../hooks/useFormDraft';

const INITIAL_FORM = {
  name: '', subdomain: '', location: '', plan: '',
  adminName: '', adminEmail: '', managerName: '', managerEmail: ''
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STEPS = [
  { id: 1, title: 'Hostel Info', icon: Building2 },
  { id: 2, title: 'Staff Profiles', icon: Users },
  { id: 3, title: 'Subscription', icon: CreditCard },
];

// --- Sub-Components ---

const FormInput = ({ label, error, required, ...props }) => (
  <div className="space-y-1.5 flex flex-col">
    <label htmlFor={props.id} className="block text-sm font-semibold text-[#111111] dark:text-white">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#111111] border rounded-xl text-sm text-[#111111] dark:text-white placeholder:text-[#c4c4c4] dark:placeholder:text-[#444444] focus:outline-none focus:ring-1 transition-all ${
        error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-[#e5e5e5] dark:border-[#222222] focus:border-[#111111] focus:ring-[#111111] dark:focus:border-white dark:focus:ring-white'
      }`}
    />
    <div className="h-[16px]">
      <p className={`text-[11px] font-medium text-red-500 flex items-center gap-1 transition-opacity duration-200 ${error ? 'opacity-100' : 'opacity-0 select-none'}`}>
        <AlertCircle className="w-3 h-3" /> {error}
      </p>
    </div>
  </div>
);

// --- Main Component ---

export default function CreateHostelModal({ isOpen, onClose }) {
  const [formData, setFormData, clearDraft] = useFormDraft('create-hostel-draft', INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [step, setStep] = useState(1);
  const nameInputRef = useRef(null);
  const formId = useId();
  
  const { data: plansData, isLoading: loadingPlans } = usePlans();
  const plans = plansData?.data || [];
  const { mutateAsync: createHostel, isPending: loading, error: mutationError, reset: resetMutation } = useCreateHostel();

  // Reset state smoothly on open
  useEffect(() => {
    if (isOpen) {
      setTouched({});
      setStep(1);
      resetMutation();
    }
  }, [isOpen, resetMutation]);

  // Set default plan
  useEffect(() => {
    if (plans.length > 0 && !formData.plan) {
      setFormData(prev => ({ ...prev, plan: plans[0]._id }));
    }
  }, [plans, formData.plan, setFormData]);

  // Lock body scroll & focus trap
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    if (step === 1) requestAnimationFrame(() => nameInputRef.current?.focus());

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose, step]);

  // Handlers
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleBlur = (e) => setTouched(prev => ({ ...prev, [e.target.name]: true }));
  const SUBDOMAIN_REGEX = /^[@.a-z0-9-]+$/;

  // Validation Logic broken down by step
  const errors = {
    name: touched.name && !formData.name.trim() ? 'Hostel name required' : null,
    subdomain: touched.subdomain && (!formData.subdomain.trim() || !SUBDOMAIN_REGEX.test(formData.subdomain)) ? 'Invalid domain format' : null,
    location: touched.location && !formData.location.trim() ? 'Location required' : null,
    adminName: touched.adminName && !formData.adminName.trim() ? 'Admin name required' : null,
    adminEmail: touched.adminEmail && (!formData.adminEmail.trim() || !EMAIL_REGEX.test(formData.adminEmail)) ? 'Valid email required' : null,
    managerName: touched.managerName && !formData.managerName.trim() ? 'Manager name required' : null,
    managerEmail: touched.managerEmail && (!formData.managerEmail.trim() || !EMAIL_REGEX.test(formData.managerEmail)) ? 'Valid email required' : null,
    plan: touched.plan && !formData.plan ? 'Plan selection required' : null,
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      setTouched(p => ({ ...p, name: true, subdomain: true, location: true }));
      return formData.name.trim() && SUBDOMAIN_REGEX.test(formData.subdomain) && formData.location.trim();
    }
    if (currentStep === 2) {
      setTouched(p => ({ ...p, adminName: true, adminEmail: true, managerName: true, managerEmail: true }));
      return formData.adminName.trim() && EMAIL_REGEX.test(formData.adminEmail) && formData.managerName.trim() && EMAIL_REGEX.test(formData.managerEmail);
    }
    if (currentStep === 3) {
      setTouched(p => ({ ...p, plan: true }));
      return !!formData.plan;
    }
    return false;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(s => s + 1);
  };

  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step !== 3) {
      handleNext();
      return;
    }
    if (!validateStep(3)) return;

    try {
      await createHostel(formData);
      toast.success('Hostel created successfully!');
      clearDraft();
      onClose();
    } catch (error) {
      // Handled by UI error display
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl flex flex-col border border-[#e5e5e5] dark:border-[#222222] overflow-hidden"
          >
            {/* Header */}
            <div className="shrink-0 px-6 py-5 border-b border-[#f0f0f0] dark:border-[#1a1a1a]">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-[#111111] dark:text-white">Create New Hostel</h2>
                  <p className="text-[13px] text-[#737373] dark:text-[#888888] mt-0.5">Step {step} of 3: {STEPS[step - 1].title}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg text-[#a3a3a3] hover:text-[#111111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Stepper */}
              <div className="relative flex items-center justify-between w-full">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-[#f0f0f0] dark:bg-[#222222]" />
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#111111] dark:bg-white transition-all duration-300 ease-out"
                  style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                />
                {STEPS.map((s) => {
                  const isActive = step === s.id;
                  const isCompleted = step > s.id;
                  const Icon = s.icon;
                  return (
                    <div key={s.id} className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                      isActive ? 'bg-white dark:bg-[#0a0a0a] border-[#111111] dark:border-white text-[#111111] dark:text-white' : 
                      isCompleted ? 'bg-[#111111] dark:bg-white border-[#111111] dark:border-white text-white dark:text-[#111111]' : 
                      'bg-white dark:bg-[#0a0a0a] border-[#e5e5e5] dark:border-[#333333] text-[#a3a3a3] dark:text-[#666666]'
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Body */}
            <div className="overflow-y-auto flex-1 min-h-[320px]">
              <form id={formId} onSubmit={handleSubmit} noValidate className="p-6 relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* STEP 1: HOSTEL INFO */}
                    {step === 1 && (
                      <div className="space-y-4">
                        <FormInput ref={nameInputRef} id="hostel-name" name="name" label="Hostel Name" required value={formData.name} onChange={handleChange} onBlur={handleBlur} error={errors.name} placeholder="e.g. Green Valley Residency" />
                        <div className="grid grid-cols-2 gap-4">
                          <FormInput id="hostel-subdomain" name="subdomain" label="Domain" required value={formData.subdomain} onChange={handleChange} onBlur={handleBlur} error={errors.subdomain} placeholder="e.g. @gmail.com" />
                          <FormInput id="hostel-location" name="location" label="City / Location" required value={formData.location} onChange={handleChange} onBlur={handleBlur} error={errors.location} placeholder="e.g. Islamabad" />
                        </div>
                      </div>
                    )}

                    {/* STEP 2: STAFF PROFILES */}
                    {step === 2 && (
                      <div className="space-y-6">
                        <div className="p-4 rounded-xl border border-[#f0f0f0] dark:border-[#1a1a1a] bg-[#fafafa] dark:bg-[#111111]">
                          <h3 className="text-sm font-bold text-[#111111] dark:text-white mb-4">Admin Account</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <FormInput id="admin-name" name="adminName" label="Full Name" required value={formData.adminName} onChange={handleChange} onBlur={handleBlur} error={errors.adminName} placeholder="Jane Doe" />
                            <FormInput id="admin-email" name="adminEmail" type="email" label="Email Address" required value={formData.adminEmail} onChange={handleChange} onBlur={handleBlur} error={errors.adminEmail} placeholder="admin@example.com" />
                          </div>
                        </div>
                        <div className="p-4 rounded-xl border border-[#f0f0f0] dark:border-[#1a1a1a] bg-[#fafafa] dark:bg-[#111111]">
                          <h3 className="text-sm font-bold text-[#111111] dark:text-white mb-4">Manager Account</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <FormInput id="manager-name" name="managerName" label="Full Name" required value={formData.managerName} onChange={handleChange} onBlur={handleBlur} error={errors.managerName} placeholder="John Smith" />
                            <FormInput id="manager-email" name="managerEmail" type="email" label="Email Address" required value={formData.managerEmail} onChange={handleChange} onBlur={handleBlur} error={errors.managerEmail} placeholder="manager@example.com" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: SUBSCRIPTION PLAN */}
                    {step === 3 && (
                      <div className="space-y-4">
                        <div className="space-y-1.5 flex flex-col">
                          <label className="block text-sm font-semibold text-[#111111] dark:text-white">Select a Plan <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <select
                              name="plan" value={formData.plan} onChange={handleChange} onBlur={handleBlur} disabled={loadingPlans}
                              className={`w-full pl-3.5 pr-10 py-3 bg-white dark:bg-[#111111] border rounded-xl text-sm text-[#111111] dark:text-white focus:outline-none focus:ring-1 appearance-none cursor-pointer ${errors.plan ? 'border-red-400' : 'border-[#e5e5e5] dark:border-[#222222]'}`}
                            >
                              {loadingPlans ? <option value="">Loading...</option> : plans.map(p => (
                                <option key={p._id} value={p._id}>{p.name} — ${p.price}/mo</option>
                              ))}
                            </select>
                            <ChevronRight className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a3a3a3] pointer-events-none rotate-90" />
                          </div>
                          <p className={`text-[11px] text-red-500 transition-opacity h-[16px] ${errors.plan ? 'opacity-100' : 'opacity-0'}`}>{errors.plan}</p>
                        </div>

                        {mutationError && (
                          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{mutationError.response?.data?.message || 'Something went wrong.'}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </form>
            </div>

            {/* Footer Actions */}
            <div className="shrink-0 px-6 py-4 border-t border-[#f0f0f0] dark:border-[#1a1a1a] bg-[#fafafa]/80 dark:bg-[#111111]/60 flex items-center justify-between">
              {step > 1 ? (
                <button type="button" onClick={handlePrev} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#404040] dark:text-[#dddddd] hover:bg-[#e5e5e5] dark:hover:bg-[#222222] transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={() => {
                    clearDraft();
                    onClose();
                  }} 
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-[#a3a3a3] hover:text-[#111111] dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}

              <button
                form={formId}
                type="submit"
                disabled={loading}
                className="min-w-[132px] px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-black/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step < 3 ? (
                  <>Continue <ChevronRight className="w-4 h-4" /></>
                ) : loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Hostel'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}