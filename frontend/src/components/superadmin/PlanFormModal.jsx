import { useState, useEffect, useRef, useId } from 'react';
import { X, Check, AlertCircle, DollarSign } from 'lucide-react';
import { useCreatePlan, useUpdatePlan } from '../../hooks/mutations/usePlanMutations';
import ToggleSwitch from '../ui/ToggleSwitch';
import { motion, AnimatePresence } from 'framer-motion';

const ATTENDANCE_METHODS = ['Manual', 'QR', 'Biometric'];
const BILLING_MODELS = ['Prepaid', 'Postpaid', 'FlatRate'];

const INITIAL_FORM = {
  name: '',
  description: '',
  price: '', // Use empty string for empty state to prevent 0 snapping
  isActive: true,
  limits: { maxStudents: 100, maxManagers: 2 },
  features: [],
};

const AVAILABLE_FEATURES = [
  "User Management",
  "Meal settings",
  "Hostel Configuration",
  "Bill Generation",
  "Bill Summary",
  "Service Management",
  "Complaint Management",
  "Residence Management",
  "Meal control",
  "Manual Attendance",
  "QR Attendance",
  "Biometric Attendance"
];

// --- Sub-Components (Extract these to separate files in a real app) ---

const FormInput = ({ label, error, icon: Icon, required, ...props }) => (
  <div className="space-y-1.5 flex flex-col">
    <label htmlFor={props.id} className="block text-sm font-semibold text-[#111111] dark:text-white">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] dark:text-[#666666]" />}
      <input
        {...props}
        className={`w-full ${Icon ? 'pl-9' : 'px-3.5'} pr-3.5 py-2.5 bg-white dark:bg-[#111111] border rounded-xl text-sm text-[#111111] dark:text-white placeholder:text-[#c4c4c4] dark:placeholder:text-[#444444] focus:outline-none focus:ring-1 transition-all ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
            : 'border-[#e5e5e5] dark:border-[#222222] focus:border-[#111111] focus:ring-[#111111] dark:focus:border-white dark:focus:ring-white'
        }`}
      />
    </div>
    <div className="h-[16px]">
      <p id={`${props.id}-error`} className={`text-[11px] font-medium text-red-500 flex items-center gap-1 transition-opacity duration-200 ${error ? 'opacity-100' : 'opacity-0 select-none'}`}>
        <AlertCircle className="w-3 h-3" /> {error}
      </p>
    </div>
  </div>
);

const FeatureCard = ({ label, isChecked, onChange }) => (
  <label className={`relative flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 -mx-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#111111] dark:has-[:focus-visible]:ring-white ${
    isChecked ? 'bg-[#f5f5f5] dark:bg-[#1a1a1a]' : 'hover:bg-[#fafafa] dark:hover:bg-[#111111]'
  }`}>
    <div className={`w-[18px] h-[18px] shrink-0 rounded flex items-center justify-center transition-all duration-150 ${
      isChecked ? 'bg-[#111111] dark:bg-white border border-[#111111] dark:border-white' : 'bg-white dark:bg-[#111111] border border-[#d4d4d4] dark:border-[#333333]'
    }`}>
      {isChecked && <Check className="w-3 h-3 text-white dark:text-[#111111]" />}
    </div>
    <input type="checkbox" className="sr-only" checked={isChecked} onChange={onChange} />
    <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-[#111111] dark:text-white' : 'text-[#737373] dark:text-[#888888]'}`}>
      {label}
    </span>
  </label>
);

// --- Main Component ---

export default function PlanFormModal({ isOpen, onClose, plan }) {
  const isEditing = !!plan;
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();
  const nameInputRef = useRef(null);
  const formId = useId();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});

  // Initialize Data
  useEffect(() => {
    if (plan && isOpen) {
      setFormData({
        name: plan.name || '',
        description: plan.description || '',
        price: plan.price ?? '',
        isActive: plan.isActive ?? true,
        limits: {
          maxStudents: plan.limits?.maxStudents ?? 100,
          maxManagers: plan.limits?.maxManagers ?? 2,
        },
        features: plan.features || []
      });
    } else if (!isOpen) {
      // Reset after exit animation completes
      setTimeout(() => setFormData(INITIAL_FORM), 200);
    }
    setTouched({});
  }, [plan, isOpen]);

  // Document effects (Scroll lock & Escape key)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    // Use requestAnimationFrame for smoother focus management over setTimeout
    requestAnimationFrame(() => nameInputRef.current?.focus());

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto'; // Safer than originalOverflow if multiple modals exist
    };
  }, [isOpen, onClose]);

  // Validation Logic
  const errors = {
    name: touched.name && !formData.name.trim() ? 'Plan name is required' : null,
    description: touched.description && !formData.description.trim() ? 'Description is required' : null,
    price: touched.price && (formData.price === '' || formData.price < 0) ? 'Valid price required' : null,
    features: formData.features.length === 0 ? 'Pick at least one feature' : null,
  };

  const isFormValid = !Object.values(errors).some(Boolean) && formData.name.trim() && formData.description.trim();

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLimitChange = (e) => {
    const { name, value } = e.target;
    // Fix: Allow empty strings so users can use backspace comfortably
    const parsedValue = value === '' ? '' : Math.max(Number(value), -1);
    setFormData(prev => ({ ...prev, limits: { ...prev.limits, [name]: parsedValue } }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => {
      const arr = prev.features;
      return {
        ...prev,
        features: arr.includes(feature) ? arr.filter(f => f !== feature) : [...arr, feature]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, description: true, price: true });
    
    if (!isFormValid) return;

    // Sanitize before sending (convert empty strings back to safe numbers)
    const payload = {
      ...formData,
      price: Number(formData.price),
      limits: {
        maxStudents: formData.limits.maxStudents === '' ? -1 : formData.limits.maxStudents,
        maxManagers: formData.limits.maxManagers === '' ? -1 : formData.limits.maxManagers,
      }
    };

    const mutationOptions = { onSuccess: () => onClose() };
    isEditing 
      ? updateMutation.mutate({ id: plan._id, planData: payload }, mutationOptions)
      : createMutation.mutate(payload, mutationOptions);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

          <motion.div
            key="modal-content"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            className="relative w-full max-w-2xl max-h-[calc(100vh-3rem)] flex flex-col bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl border border-[#e5e5e5] dark:border-[#222222]"
          >
            {/* Header */}
            <div className="shrink-0 flex justify-between items-start gap-4 px-6 py-5 border-b border-[#f0f0f0] dark:border-[#1a1a1a]">
              <div>
                <h2 className="text-lg font-bold text-[#111111] dark:text-white">
                  {isEditing ? 'Edit Plan' : 'Create New Plan'}
                </h2>
                <p className="text-[13px] text-[#737373] dark:text-[#888888] mt-0.5">
                  {isEditing ? 'Modify pricing, limits, and feature access.' : 'Define a new subscription tier for your tenants.'}
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg text-[#a3a3a3] hover:text-[#111111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="overflow-y-auto flex-1 min-h-0">
              <form id={formId} onSubmit={handleSubmit} noValidate>
                <fieldset className="px-6 py-2 border-b border-[#f0f0f0] dark:border-[#1a1a1a] space-y-1">
                  <legend className="text-[10px] font-bold uppercase tracking-widest text-[#a3a3a3] pt-4">Basic Info</legend>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput 
                      id="plan-name" name="name" label="Plan Name" required
                      ref={nameInputRef} value={formData.name}
                      onChange={handleChange} onBlur={() => setTouched(p => ({ ...p, name: true }))}
                      error={errors.name} placeholder="e.g. Basic, Premium"
                    />
                    <FormInput 
                      id="plan-price" name="price" type="number" label="Price / mo" icon={DollarSign} required
                      min="0" step="0.01" value={formData.price}
                      onChange={handleChange} onBlur={() => setTouched(p => ({ ...p, price: true }))}
                      error={errors.price} placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <label className="block text-sm font-semibold text-[#111111] dark:text-white">Description <span className="text-red-500">*</span></label>
                      <span className="text-[11px] text-[#a3a3a3]">{formData.description.length}/240</span>
                    </div>
                    <textarea
                      name="description" value={formData.description} maxLength={240} rows={2}
                      onChange={handleChange} onBlur={() => setTouched(p => ({ ...p, description: true }))}
                      className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#111111] border rounded-xl text-sm transition-all resize-none ${errors.description ? 'border-red-400' : 'border-[#e5e5e5] dark:border-[#222222]'}`}
                      placeholder="What does this plan include?"
                    />
                    <p className={`text-[11px] text-red-500 transition-opacity ${errors.description ? 'opacity-100' : 'opacity-0'}`}>{errors.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#f5f5f5] dark:border-[#1a1a1a]">
                    <div>
                      <span className="text-sm font-semibold block text-[#111111] dark:text-white">Plan is Active</span>
                      <span className="text-[11px] text-[#a3a3a3]">Inactive plans are hidden</span>
                    </div>
                    <ToggleSwitch checked={formData.isActive} onChange={() => setFormData(p => ({ ...p, isActive: !p.isActive }))} />
                  </div>
                </fieldset>

                <fieldset className="px-6 py-2 border-b border-[#f0f0f0] dark:border-[#1a1a1a]">
                  <legend className="text-[10px] font-bold uppercase tracking-widest text-[#a3a3a3] pt-4">Limits</legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Object.entries({ maxStudents: 'Max Students', maxManagers: 'Max Managers' }).map(([key, label]) => (
                      <div key={key} className="space-y-1.5">
                        <label className="block text-sm font-semibold text-[#111111] dark:text-white">{label}</label>
                        <input
                          type="number" name={key} value={formData.limits[key]} onChange={handleLimitChange}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#222222] rounded-xl text-sm text-white"
                        />
                        <p className="text-[11px] text-[#a3a3a3]">Use -1 for unlimited</p>
                      </div>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="px-6 py-2">
                  <legend className="text-[10px] font-bold uppercase tracking-widest text-[#a3a3a3] pt-4">Features</legend>
                  
                  <div className="grid gap-3 sm:grid-cols-2">
                    {AVAILABLE_FEATURES.map(feature => (
                      <FeatureCard 
                        key={feature} 
                        label={feature} 
                        isChecked={formData.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                      />
                    ))}
                  </div>
                  {errors.features && <p className="text-[11px] text-red-500 mt-2">{errors.features}</p>}
                </fieldset>

                {mutationError && (
                  <div className="mx-6 mb-6 p-3 text-sm text-red-700 bg-red-50 rounded-xl flex items-start gap-2 border border-red-200">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{mutationError.response?.data?.message || 'Something went wrong. Please try again.'}</span>
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#f0f0f0] dark:border-[#1a1a1a] bg-[#fafafa]/80 dark:bg-[#111111]/60 flex justify-end gap-3">
              <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#404040] hover:bg-black/5 dark:text-white dark:hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button form={formId} type="submit" disabled={isLoading} className="min-w-[132px] px-5 py-2 rounded-xl text-sm font-semibold bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-black/80 transition-colors flex items-center justify-center gap-2">
                {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Plan'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}