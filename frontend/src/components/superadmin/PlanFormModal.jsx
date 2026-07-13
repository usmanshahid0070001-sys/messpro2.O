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
  price: 0,
  isActive: true,
  limits: {
    maxStudents: 100,
    maxManagers: 2,
  },
  features: {
    allowedAttendanceMethods: ['Manual'],
    allowedBillingModels: ['Prepaid'],
    allowAutoMealVerification: false,
  }
};

export default function PlanFormModal({ isOpen, onClose, plan }) {
  const isEditing = !!plan;
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();
  const nameInputRef = useRef(null);
  const formId = useId();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        description: plan.description || '',
        price: plan.price || 0,
        isActive: plan.isActive ?? true,
        limits: {
          maxStudents: plan.limits?.maxStudents ?? 100,
          maxManagers: plan.limits?.maxManagers ?? 2,
        },
        features: {
          allowedAttendanceMethods: plan.features?.allowedAttendanceMethods || ['Manual'],
          allowedBillingModels: plan.features?.allowedBillingModels || ['Prepaid'],
          allowAutoMealVerification: plan.features?.allowAutoMealVerification ?? false,
        }
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setTouched({});
  }, [plan, isOpen]);

  // Close on Escape, lock background scroll while open, focus first field
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = setTimeout(() => nameInputRef.current?.focus(), 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      clearTimeout(focusTimer);
    };
  }, [isOpen, onClose]);

  const nameError = touched.name && !formData.name.trim() ? 'Plan name is required' : null;
  const descriptionError = touched.description && !formData.description.trim() ? 'Description is required' : null;
  const hasNoAttendanceMethod = formData.features.allowedAttendanceMethods.length === 0;
  const hasNoBillingModel = formData.features.allowedBillingModels.length === 0;

  const isFormValid =
    formData.name.trim() &&
    formData.description.trim() &&
    !hasNoAttendanceMethod &&
    !hasNoBillingModel;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, description: true });
    if (!isFormValid) return;

    if (isEditing) {
      updateMutation.mutate(
        { id: plan._id, planData: formData },
        { onSuccess: () => onClose() }
      );
    } else {
      createMutation.mutate(
        formData,
        { onSuccess: () => onClose() }
      );
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const handleLimitChange = (e) => {
    const { name, value } = e.target;
    // Clamp to -1 (unlimited) as the floor so users can't enter e.g. -5
    const numeric = Math.max(Number(value), -1);
    setFormData(prev => ({
      ...prev,
      limits: {
        ...prev.limits,
        [name]: numeric
      }
    }));
  };

  const handleFeatureToggle = (featureName) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [featureName]: !prev.features[featureName]
      }
    }));
  };

  const handleArrayToggle = (category, value) => {
    setFormData(prev => {
      const currentArray = prev.features[category];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(v => v !== value)
        : [...currentArray, value];

      return {
        ...prev,
        features: {
          ...prev.features,
          [category]: newArray
        }
      };
    });
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.isError ? createMutation.error : updateMutation.isError ? updateMutation.error : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <motion.div
            key="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-modal-title"
            aria-describedby="plan-modal-subtitle"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-2xl max-h-[calc(100vh-3rem)] overflow-hidden bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl ring-1 ring-black/5 flex flex-col border border-[#e5e5e5] dark:border-[#222222]"
          >
            {/* Header */}
            <div className="shrink-0 flex items-start justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 border-b border-[#f0f0f0] dark:border-[#1a1a1a]">
              <div className="min-w-0">
                <h2 id="plan-modal-title" className="text-lg font-bold text-[#111111] dark:text-white truncate">
                  {isEditing ? 'Edit Plan' : 'Create New Plan'}
                </h2>
                <p id="plan-modal-subtitle" className="text-[13px] font-medium text-[#737373] dark:text-[#888888] mt-0.5">
                  {isEditing ? 'Modify pricing, limits, and feature access.' : 'Define a new subscription tier for your tenants.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 p-2 rounded-lg text-[#a3a3a3] hover:text-[#111111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body - Added min-h-0 to prevent flexbox popping glitch */}
            <div className="overflow-y-auto flex-1 min-h-0 [scrollbar-width:thin]">
              <form id={formId} onSubmit={handleSubmit} noValidate>
                {/* Basic Info */}
                <fieldset className="px-5 sm:px-6 py-5 sm:py-6 border-b border-[#f0f0f0] dark:border-[#1a1a1a] space-y-4">
                  <legend className="text-[10px] font-bold uppercase tracking-widest text-[#a3a3a3] dark:text-[#555555]">Basic Info</legend>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 flex flex-col">
                      <label htmlFor="plan-name" className="block text-sm font-semibold text-[#111111] dark:text-white">
                        Plan Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        ref={nameInputRef}
                        id="plan-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        aria-invalid={!!nameError}
                        aria-describedby={nameError ? 'plan-name-error' : undefined}
                        className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#111111] border rounded-xl text-sm text-[#111111] dark:text-white placeholder:text-[#c4c4c4] dark:placeholder:text-[#444444] focus:outline-none focus:ring-1 transition-all ${
                          nameError
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                            : 'border-[#e5e5e5] dark:border-[#222222] focus:border-[#111111] focus:ring-[#111111] dark:focus:border-white dark:focus:ring-white'
                        }`}
                        placeholder="e.g. Basic, Premium"
                      />
                      {/* Space reserved to prevent height shift */}
                      <p id="plan-name-error" className={`text-[11px] font-medium text-red-500 flex items-center gap-1 transition-opacity duration-200 ${nameError ? 'opacity-100' : 'opacity-0 select-none'}`}>
                        <AlertCircle className="w-3 h-3" /> {nameError || 'Required'}
                      </p>
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                      <label htmlFor="plan-price" className="block text-sm font-semibold text-[#111111] dark:text-white">
                        Price / mo <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] dark:text-[#666666]" />
                        <input
                          id="plan-price"
                          required
                          type="number"
                          name="price"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          value={formData.price}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#222222] rounded-xl text-sm text-[#111111] dark:text-white placeholder:text-[#c4c4c4] dark:placeholder:text-[#444444] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] dark:focus:border-white dark:focus:ring-white transition-all"
                          placeholder="0.00"
                        />
                      </div>
                      {/* Empty spacer to align with the name input's error message space */}
                      <div className="h-[16px]" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <label htmlFor="plan-desc" className="block text-sm font-semibold text-[#111111] dark:text-white">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] font-medium text-[#a3a3a3] dark:text-[#666666]">
                        {formData.description.length}/240
                      </span>
                    </div>
                    <textarea
                      id="plan-desc"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      maxLength={240}
                      rows={2}
                      aria-invalid={!!descriptionError}
                      aria-describedby={descriptionError ? 'plan-desc-error' : undefined}
                      className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#111111] border rounded-xl text-sm text-[#111111] dark:text-white placeholder:text-[#c4c4c4] dark:placeholder:text-[#444444] focus:outline-none focus:ring-1 transition-all resize-none ${
                        descriptionError
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                          : 'border-[#e5e5e5] dark:border-[#222222] focus:border-[#111111] focus:ring-[#111111] dark:focus:border-white dark:focus:ring-white'
                      }`}
                      placeholder="What does this plan include?"
                    />
                    {/* Space reserved to prevent height shift */}
                    <p id="plan-desc-error" className={`text-[11px] font-medium text-red-500 flex items-center gap-1 transition-opacity duration-200 ${descriptionError ? 'opacity-100' : 'opacity-0 select-none'}`}>
                      <AlertCircle className="w-3 h-3" /> {descriptionError || 'Required'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#f5f5f5] dark:border-[#1a1a1a]">
                    <div>
                      <span className="text-sm font-semibold text-[#111111] dark:text-white block">Plan is Active</span>
                      <span className="text-[11px] font-medium text-[#a3a3a3] dark:text-[#666666]">Inactive plans are hidden from tenants</span>
                    </div>
                    <ToggleSwitch
                      checked={formData.isActive}
                      onChange={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                    />
                  </div>
                </fieldset>

                {/* Limits */}
                <fieldset className="px-5 sm:px-6 py-5 sm:py-6 border-b border-[#f0f0f0] dark:border-[#1a1a1a]">
                  <legend className="text-[10px] font-bold uppercase tracking-widest text-[#a3a3a3] dark:text-[#555555] mb-4">Limits</legend>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="max-students" className="block text-sm font-semibold text-[#111111] dark:text-white">
                        Max Students
                      </label>
                      <input
                        id="max-students"
                        type="number"
                        name="maxStudents"
                        min="-1"
                        value={formData.limits.maxStudents}
                        onChange={handleLimitChange}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#222222] rounded-xl text-sm text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] dark:focus:border-white dark:focus:ring-white transition-all"
                      />
                      <p className="text-[11px] font-medium text-[#a3a3a3] dark:text-[#666666]">Use -1 for unlimited</p>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="max-managers" className="block text-sm font-semibold text-[#111111] dark:text-white">
                        Max Managers
                      </label>
                      <input
                        id="max-managers"
                        type="number"
                        name="maxManagers"
                        min="-1"
                        value={formData.limits.maxManagers}
                        onChange={handleLimitChange}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#222222] rounded-xl text-sm text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] dark:focus:border-white dark:focus:ring-white transition-all"
                      />
                      <p className="text-[11px] font-medium text-[#a3a3a3] dark:text-[#666666]">Use -1 for unlimited</p>
                    </div>
                  </div>
                </fieldset>

                {/* Features */}
                <fieldset className="px-5 sm:px-6 py-5 sm:py-6">
                  <legend className="text-[10px] font-bold uppercase tracking-widest text-[#a3a3a3] dark:text-[#555555] mb-4">Features</legend>

                  <div className="flex items-center justify-between mb-5 pb-5 border-b border-[#f5f5f5] dark:border-[#1a1a1a]">
                    <div>
                      <span className="text-sm font-semibold text-[#111111] dark:text-white block">Auto Meal Verification</span>
                      <span className="text-[11px] font-medium text-[#a3a3a3] dark:text-[#666666]">Automatically verify meal attendance</span>
                    </div>
                    <ToggleSwitch
                      checked={formData.features.allowAutoMealVerification}
                      onChange={() => handleFeatureToggle('allowAutoMealVerification')}
                    />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-[#111111] dark:text-white">Attendance Methods</p>
                        {/* Space reserved to prevent height shift */}
                        <span className={`text-[11px] font-medium text-red-500 flex items-center gap-1 transition-opacity duration-200 ${hasNoAttendanceMethod ? 'opacity-100' : 'opacity-0 select-none'}`}>
                          <AlertCircle className="w-3 h-3" /> Pick one
                        </span>
                      </div>
                      <div className="space-y-1">
                        {ATTENDANCE_METHODS.map(method => {
                          const isChecked = formData.features.allowedAttendanceMethods.includes(method);
                          return (
                            <label
                              key={method}
                              className={`relative flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 -mx-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#111111] dark:has-[:focus-visible]:ring-white ${
                                isChecked
                                  ? 'bg-[#f5f5f5] dark:bg-[#1a1a1a]'
                                  : 'hover:bg-[#fafafa] dark:hover:bg-[#111111]'
                              }`}
                            >
                              <div className={`w-[18px] h-[18px] shrink-0 rounded flex items-center justify-center transition-all duration-150 ${
                                isChecked
                                  ? 'bg-[#111111] dark:bg-white border border-[#111111] dark:border-white'
                                  : 'bg-white dark:bg-[#111111] border border-[#d4d4d4] dark:border-[#333333]'
                              }`}>
                                {isChecked && <Check className="w-3 h-3 text-white dark:text-[#111111]" />}
                              </div>
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={isChecked}
                                onChange={() => handleArrayToggle('allowedAttendanceMethods', method)}
                              />
                              <span className={`text-sm font-medium transition-colors ${
                                isChecked
                                  ? 'text-[#111111] dark:text-white'
                                  : 'text-[#737373] dark:text-[#888888]'
                              }`}>{method}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-[#111111] dark:text-white">Billing Models</p>
                        {/* Space reserved to prevent height shift */}
                        <span className={`text-[11px] font-medium text-red-500 flex items-center gap-1 transition-opacity duration-200 ${hasNoBillingModel ? 'opacity-100' : 'opacity-0 select-none'}`}>
                          <AlertCircle className="w-3 h-3" /> Pick one
                        </span>
                      </div>
                      <div className="space-y-1">
                        {BILLING_MODELS.map(model => {
                          const isChecked = formData.features.allowedBillingModels.includes(model);
                          return (
                            <label
                              key={model}
                              className={`relative flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 -mx-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#111111] dark:has-[:focus-visible]:ring-white ${
                                isChecked
                                  ? 'bg-[#f5f5f5] dark:bg-[#1a1a1a]'
                                  : 'hover:bg-[#fafafa] dark:hover:bg-[#111111]'
                              }`}
                            >
                              <div className={`w-[18px] h-[18px] shrink-0 rounded flex items-center justify-center transition-all duration-150 ${
                                isChecked
                                  ? 'bg-[#111111] dark:bg-white border border-[#111111] dark:border-white'
                                  : 'bg-white dark:bg-[#111111] border border-[#d4d4d4] dark:border-[#333333]'
                              }`}>
                                {isChecked && <Check className="w-3 h-3 text-white dark:text-[#111111]" />}
                              </div>
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={isChecked}
                                onChange={() => handleArrayToggle('allowedBillingModels', model)}
                              />
                              <span className={`text-sm font-medium transition-colors ${
                                isChecked
                                  ? 'text-[#111111] dark:text-white'
                                  : 'text-[#737373] dark:text-[#888888]'
                              }`}>{model}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </fieldset>

                {mutationError && (
                  <div className="mx-5 sm:mx-6 mb-5 p-3 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{mutationError.response?.data?.message || mutationError.message || 'Something went wrong. Please try again.'}</span>
                  </div>
                )}
              </form>
            </div>

            {/* Footer Actions */}
            <div className="shrink-0 px-5 sm:px-6 py-4 border-t border-[#f0f0f0] dark:border-[#1a1a1a] bg-[#fafafa]/80 dark:bg-[#111111]/60 backdrop-blur-sm flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#404040] dark:text-[#dddddd] hover:bg-[#e5e5e5] dark:hover:bg-[#222222] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white"
              >
                Cancel
              </button>
              <button
                form={formId}
                type="submit"
                disabled={isLoading}
                className="min-w-[132px] px-5 py-2 rounded-xl text-sm font-semibold bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-black/80 dark:hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0a0a0a]"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  isEditing ? 'Save Changes' : 'Create Plan'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}