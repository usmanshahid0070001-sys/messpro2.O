import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, ChevronDown } from 'lucide-react';
import { useUserUIStore } from '../../store/useUserUIStore';
import { useGetHostelDetails } from '../../hooks/queries/useUsers';
import { useCreateUserMutation, useUpdateUserMutation } from '../../hooks/mutations/useUserMutations';
import DynamicFields from './DynamicFields';
import { useAuth } from '../../context/AuthContext';
import { Shield, Check } from 'lucide-react';

const AVAILABLE_PERMISSIONS = [
  { slug: 'user_management', label: 'User Management', requiredPlanFeature: 'User Management' },
  { slug: 'bill_management', label: 'Bill Management', requiredPlanFeature: 'Bill Management' },
  { slug: 'residence_management', label: 'Residence Management', requiredPlanFeature: 'Residence Management' },
  { slug: 'manual_attendance', label: 'Manual Attendance', requiredPlanFeature: 'Manual Attendance' },
  { slug: 'qr_attendance', label: 'QR Attendance', requiredPlanFeature: 'QR Attendance' },
  { slug: 'biometric_attendance', label: 'Biometric Attendance', requiredPlanFeature: 'Biometric Attendance' },
  { slug: 'meal_settings', label: 'Meal Settings', requiredPlanFeature: 'Meal settings' },
  { slug: 'meal_control', label: 'Meal Control', requiredPlanFeature: 'Meal control' },
  { slug: 'bill_generation', label: 'Bill Generation', requiredPlanFeature: 'Bill Generation' },
  { slug: 'service_management', label: 'Service Management', requiredPlanFeature: 'Service Management' },
  { slug: 'complaint_management', label: 'Complaint Management', requiredPlanFeature: 'Complaint Management' }
];

// --- Shared UI Primitives (Extract to separate file in a real app) ---
export const FormInput = React.forwardRef(({ label, error, required, helperText, ...props }, ref) => (
  <div className="space-y-1.5 flex flex-col">
    <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      ref={ref}
      {...props}
      className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-950 border rounded-xl text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 transition-all ${error
          ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
          : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 focus:ring-zinc-900 dark:focus:border-zinc-50 dark:focus:ring-zinc-50'
        }`}
    />
    <div className="min-h-[16px] flex items-start justify-between gap-2 mt-0.5">
      <p className={`text-[11px] font-medium text-red-500 flex items-center gap-1 transition-opacity duration-200 ${error ? 'opacity-100' : 'opacity-0 select-none'}`}>
        <AlertCircle className="w-3 h-3 shrink-0" /> {error}
      </p>
      {helperText && !error && <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{helperText}</span>}
    </div>
  </div>
));

export const FormSelect = ({ label, options, error, required, ...props }) => (
  <div className="space-y-1.5 flex flex-col">
    <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        {...props}
        className={`w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-zinc-950 border rounded-xl text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 transition-all appearance-none cursor-pointer disabled:opacity-50 ${error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
            : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 focus:ring-zinc-900 dark:focus:border-zinc-50 dark:focus:ring-zinc-50'
          }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
    </div>
    <div className="h-[16px]">
      <p className={`text-[11px] font-medium text-red-500 flex items-center gap-1 transition-opacity duration-200 ${error ? 'opacity-100' : 'opacity-0 select-none'}`}>
        <AlertCircle className="w-3 h-3 shrink-0" /> {error}
      </p>
    </div>
  </div>
);

// --- Main Component ---
const UserModal = () => {
  const { isModalOpen, modalType, selectedUser, closeModal } = useUserUIStore();
  const { role: currentUserRole, user: currentUser } = useAuth();
  const { data: hostelData, isLoading: isHostelLoading } = useGetHostelDetails(currentUserRole);

  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const nameInputRef = useRef(null);

  const [formData, setFormData] = useState({ name: '', email: '', role: '', password: '', id: '', hostelId: '', permissions: [] });
  const [dynamicFormData, setDynamicFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Reset form and manage scroll lock
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e) => e.key === 'Escape' && closeModal();
      document.addEventListener('keydown', handleEscape);

      if (modalType === 'update' && selectedUser) {
        setFormData({
          name: selectedUser.name || '',
          email: selectedUser.email || '',
          role: selectedUser.role || '',
          password: '',
          id: selectedUser.id || '',
          hostelId: selectedUser.hostelId || '',
          permissions: selectedUser.permissions || [],
        });

        const dynamicValues = {};
        if (Array.isArray(selectedUser.additionalInfo)) {
          selectedUser.additionalInfo.forEach((item) => { dynamicValues[item.key] = item.value; });
        }
        setDynamicFormData(dynamicValues);
      } else {
        let defaultRole = currentUserRole === 'superadmin' ? 'admin' : currentUserRole === 'admin' ? 'student' : 'student';
        setFormData({
          name: '', email: '', role: defaultRole, password: '', id: '', permissions: [],
          hostelId: currentUserRole !== 'superadmin' && currentUser ? currentUser.hostelId : '',
        });
        setDynamicFormData({});
      }
      setErrors({});

      // Focus first input for accessibility
      setTimeout(() => nameInputRef.current?.focus(), 100);

      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isModalOpen, modalType, selectedUser, currentUserRole, currentUser, closeModal]);

  // Memoize heavy calculations to prevent layout jitter on typing
  const roleOptions = useMemo(() => {
    if (currentUserRole === 'superadmin') return [{ value: 'admin', label: 'Admin' }, { value: 'manager', label: 'Manager' }];
    if (currentUserRole === 'admin') return [{ value: 'manager', label: 'Manager' }, { value: 'student', label: 'Student' }];
    return [{ value: 'student', label: 'Student' }];
  }, [currentUserRole]);

  const currentCustomFields = useMemo(() => {
    if (formData.role !== 'student') return [];
    if (currentUserRole === 'superadmin' && formData.hostelId) {
      return hostelData?.find(h => h._id === formData.hostelId)?.customRegistrationFields || [];
    }
    if (currentUserRole !== 'superadmin' && hostelData) {
      return hostelData.customRegistrationFields || [];
    }
    return [];
  }, [formData.role, formData.hostelId, currentUserRole, hostelData]);

  const capitalizeName = (str) => {
    if (!str) return str;
    return str.split(' ').map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '').join(' ');
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'name') {
      value = capitalizeName(value);
    }

    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Auto-assign default permissions for managers on creation if role or hostel changes
      if (modalType === 'create' && (name === 'role' || name === 'hostelId')) {
        const checkRole = name === 'role' ? value : updated.role;
        const checkHostelId = name === 'hostelId' ? value : updated.hostelId;

        if (checkRole === 'manager' || checkRole === 'admin') {
          let targetHostel = null;
          if (currentUserRole === 'superadmin') {
            targetHostel = hostelData?.find(h => h._id === checkHostelId);
          } else {
            targetHostel = Array.isArray(hostelData) ? hostelData[0] : hostelData;
          }

          const enabledFeatures = targetHostel?.plan?.features || [];
          const hasFeat = (featName) => enabledFeatures.some(f => f.name === featName && f.isEnabled);

          const defaults = [];
          if (hasFeat('Meal settings')) defaults.push('meal_settings');
          if (hasFeat('Bill Management')) defaults.push('bill_management');

          updated.permissions = defaults;
        } else {
          updated.permissions = [];
        }
      }
      return updated;
    });
  };
  const handleDynamicChange = (key, value) => setDynamicFormData(prev => ({ ...prev, [key]: value }));

  const handlePermissionToggle = (slug) => {
    setFormData(prev => {
      const perms = prev.permissions || [];
      const newPerms = perms.includes(slug) ? perms.filter(p => p !== slug) : [...perms, slug];
      return { ...prev, permissions: newPerms };
    });
  };

  const allowedPermissions = useMemo(() => {
    let targetHostel = null;
    if (currentUserRole === 'superadmin') {
      targetHostel = hostelData?.find(h => h._id === formData.hostelId);
    } else {
      // For admin, hostelData is the single hostel object
      targetHostel = Array.isArray(hostelData) ? hostelData[0] : hostelData;
    }

    const enabledPlanFeatures = targetHostel?.plan?.features || [];

    return AVAILABLE_PERMISSIONS.filter(perm => {
      if (perm.requiredPlanFeature === "Service Management") {
        return enabledPlanFeatures.some(f => (f.name === "Service Management" || f.name === "Room Service") && f.isEnabled);
      }
      return enabledPlanFeatures.some(f => f.name === perm.requiredPlanFeature && f.isEnabled);
    });
  }, [hostelData, formData.hostelId, currentUserRole]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (currentUserRole === 'superadmin' && !formData.hostelId) newErrors.hostelId = 'Hostel is required';

    if (formData.role === 'student') {
      if (modalType === 'create' && !formData.password) newErrors.password = 'Password is required';
      if (!formData.id.trim()) newErrors.id = 'Roll Number is required';

      currentCustomFields.forEach((field) => {
        if (field.isRequired && !dynamicFormData[field.name]) {
          newErrors[field.name] = 'Required field';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const additionalInfoArray = Object.entries(dynamicFormData).map(([key, value]) => ({ key, value: String(value) }));

    const payload = { ...formData };
    if (formData.role === 'student') payload.additionalInfo = additionalInfoArray;
    // Don't send empty password on update
    if (modalType === 'update' && !payload.password) delete payload.password;

    const mutationOpts = { onSuccess: () => closeModal() };

    if (modalType === 'create') {
      createMutation.mutate(payload, mutationOpts);
    } else {
      const updatePayload = { name: payload.name, permissions: payload.permissions };
      if (payload.role === 'student') updatePayload.additionalInfo = additionalInfoArray;
      updateMutation.mutate({ id: selectedUser._id, data: updatePayload }, mutationOpts);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} aria-hidden="true" />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {modalType === 'create' ? 'Create New User' : 'Update User'}
              </h3>
              <button onClick={closeModal} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 max-h-[calc(100vh-12rem)] p-6 [scrollbar-width:thin]">
              {isHostelLoading ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-[72px] bg-zinc-100 dark:bg-zinc-900/50 rounded-xl w-full"></div>
                  <div className="h-[72px] bg-zinc-100 dark:bg-zinc-900/50 rounded-xl w-full"></div>
                </div>
              ) : (
                <form id="user-form" onSubmit={handleSubmit} className="space-y-2" noValidate>

                  {modalType === 'create' && (
                    <FormSelect
                      label="User Role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      options={roleOptions}
                      disabled={roleOptions.length === 1}
                    />
                  )}

                  {currentUserRole === 'superadmin' && modalType === 'create' && (
                    <FormSelect
                      label="Hostel"
                      name="hostelId"
                      required
                      value={formData.hostelId}
                      onChange={handleChange}
                      error={errors.hostelId}
                      options={[
                        { value: '', label: 'Select a Hostel' },
                        ...(Array.isArray(hostelData) ? hostelData.map(h => ({ value: h._id, label: h.name })) : [])
                      ]}
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <FormInput
                      ref={nameInputRef}
                      label="Full Name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      placeholder="John Doe"
                    />
                    <FormInput
                      label="Email Address"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      placeholder="john@example.com"
                    />

                    {formData.role === 'student' && (
                      <FormInput
                        label="Roll Number (ID)"
                        name="id"
                        required
                        value={formData.id}
                        onChange={handleChange}
                        error={errors.id}
                        placeholder="e.g. 2023-CS-123"
                      />
                    )}

                    {(modalType === 'create' || formData.role === 'student') && (
                      <FormInput
                        label="Password"
                        name="password"
                        type="password"
                        required={modalType === 'create'}
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        placeholder="••••••••"
                        helperText={modalType === 'update' ? "Leave blank to keep unchanged" : ""}
                      />
                    )}
                  </div>

                  {formData.role === 'student' && currentCustomFields.length > 0 && (
                    <DynamicFields
                      customFields={currentCustomFields}
                      formData={dynamicFormData}
                      handleDynamicChange={handleDynamicChange}
                      errors={errors}
                    />
                  )}

                  {(formData.role === 'manager' || formData.role === 'student' || formData.role === 'admin') && allowedPermissions.length > 0 && (
                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      <h4 className="text-sm font-bold flex items-center gap-2 mb-3 text-zinc-900 dark:text-zinc-50">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        Additional Permissions
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {allowedPermissions.map((perm) => {
                          const isChecked = formData.permissions.includes(perm.slug);
                          return (
                            <label key={perm.slug} className={`relative flex items-center gap-3 cursor-pointer rounded-xl px-4 py-3 border transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-zinc-900 dark:has-[:focus-visible]:ring-zinc-50 ${isChecked ? 'bg-zinc-100 dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-700' : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/30'
                              }`}>
                              <div className={`w-5 h-5 shrink-0 rounded flex items-center justify-center transition-all duration-150 ${isChecked ? 'bg-zinc-900 dark:bg-zinc-50 border border-zinc-900 dark:border-zinc-50' : 'bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700'
                                }`}>
                                {isChecked && <Check className="w-3.5 h-3.5 text-white dark:text-zinc-900" />}
                              </div>
                              <input type="checkbox" className="sr-only" checked={isChecked} onChange={() => handlePermissionToggle(perm.slug)} />
                              <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                {perm.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/40 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                form="user-form"
                type="submit"
                disabled={isPending || isHostelLoading}
                className="min-w-[132px] px-5 py-2 rounded-xl text-sm font-semibold bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  modalType === 'create' ? 'Create User' : 'Save Changes'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserModal;