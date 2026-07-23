import { useState, useEffect, useId } from 'react';
import { X, Shield, AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { useGetHostelDetails } from '../../hooks/queries/useUsers';

const AVAILABLE_PERMISSIONS = [
  { slug: 'meal_settings', label: 'Meal Management / Meal setting', requiredPlanFeature: 'Meal settings' },
  { slug: 'user_management', label: 'User Management', requiredPlanFeature: 'User Management' },
  { slug: 'residence_management', label: 'Residence Management', requiredPlanFeature: 'Residence Management' },
  { slug: 'service_management', label: 'Service Management', requiredPlanFeature: 'Service Management' },
  { slug: 'complaint_management', label: 'Complaint Management', requiredPlanFeature: 'Complaint Management' }
];

export default function UserPermissionsModal({ user, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const formId = useId();
  
  // Note: This relies on the admin fetching their own hostel
  const { data: hostelDataResponse, isLoading: isLoadingHostel } = useGetHostelDetails('admin');
  
  // hostelDataResponse is the single hostel object for Admin/Manager
  const hostelData = hostelDataResponse || {};
  const enabledPlanFeatures = hostelData?.plan?.features || [];

  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    if (isOpen && user) {
      setPermissions(user.permissions || []);
    }
  }, [isOpen, user]);

  const updatePermissionsMutation = useMutation({
    mutationFn: async (newPermissions) => {
      const response = await api.patch(`/api/users/${user._id}`, { permissions: newPermissions });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['targettedUsers']);
      toast.success('Permissions updated successfully.');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update permissions.');
    }
  });

  const handleToggle = (slug) => {
    setPermissions(prev => 
      prev.includes(slug) ? prev.filter(p => p !== slug) : [...prev, slug]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePermissionsMutation.mutate(permissions);
  };

  // Filter which permissions can be shown based on active plan features
  const allowedPermissions = AVAILABLE_PERMISSIONS.filter(perm => {
    if (perm.requiredPlanFeature === "Service Management") {
      return enabledPlanFeatures.some(f => (f.name === "Service Management" || f.name === "Room Service") && f.isEnabled);
    }
    return enabledPlanFeatures.some(f => f.name === perm.requiredPlanFeature && f.isEnabled);
  });

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
            className="relative w-full max-w-md max-h-[calc(100vh-3rem)] flex flex-col bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl border border-[#e5e5e5] dark:border-[#222222]"
          >
            {/* Header */}
            <div className="shrink-0 flex justify-between items-start gap-4 px-6 py-5 border-b border-[#f0f0f0] dark:border-[#1a1a1a]">
              <div>
                <h2 className="text-lg font-bold text-[#111111] dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  Manage Permissions
                </h2>
                <p className="text-[13px] text-[#737373] dark:text-[#888888] mt-1">
                  Grant additional access to <span className="font-bold text-[#111] dark:text-white">{user?.name}</span>. Only features available in your active plan are shown.
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg text-[#a3a3a3] hover:text-[#111111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              {isLoadingHostel ? (
                <div className="flex justify-center py-8">
                   <div className="w-6 h-6 border-2 border-black/20 dark:border-white/20 border-t-black dark:border-t-white rounded-full animate-spin" />
                </div>
              ) : allowedPermissions.length === 0 ? (
                <div className="text-center py-6">
                  <AlertCircle className="w-10 h-10 text-[#a3a3a3] mx-auto mb-3" />
                  <p className="text-sm font-semibold text-[#111] dark:text-white">No Additional Permissions Available</p>
                  <p className="text-xs text-[#737373] mt-1">Your current plan does not support any delegatable functionalities.</p>
                </div>
              ) : (
                <form id={formId} onSubmit={handleSubmit} className="space-y-3">
                  {allowedPermissions.map((perm) => {
                    const isChecked = permissions.includes(perm.slug);
                    return (
                      <label key={perm.slug} className={`relative flex items-center gap-3 cursor-pointer rounded-xl px-4 py-3 border transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#111111] dark:has-[:focus-visible]:ring-white ${
                        isChecked ? 'bg-[#f5f5f5] dark:bg-[#1a1a1a] border-[#d4d4d4] dark:border-[#333]' : 'bg-white dark:bg-[#111] border-[#e5e5e5] dark:border-[#222] hover:bg-[#fafafa] dark:hover:bg-[#151515]'
                      }`}>
                        <div className={`w-5 h-5 shrink-0 rounded flex items-center justify-center transition-all duration-150 ${
                          isChecked ? 'bg-[#111111] dark:bg-white border border-[#111111] dark:border-white' : 'bg-white dark:bg-[#111111] border border-[#d4d4d4] dark:border-[#333333]'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 text-white dark:text-[#111111]" />}
                        </div>
                        <input type="checkbox" className="sr-only" checked={isChecked} onChange={() => handleToggle(perm.slug)} />
                        <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-[#111111] dark:text-white' : 'text-[#737373] dark:text-[#888888]'}`}>
                          {perm.label}
                        </span>
                      </label>
                    );
                  })}
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#f0f0f0] dark:border-[#1a1a1a] bg-[#fafafa]/80 dark:bg-[#111111]/60 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#404040] hover:bg-black/5 dark:text-white dark:hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button 
                form={formId} 
                type="submit" 
                disabled={updatePermissionsMutation.isPending || isLoadingHostel} 
                className="min-w-[100px] px-5 py-2 rounded-xl text-sm font-semibold bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-black/80 transition-colors flex items-center justify-center gap-2"
              >
                {updatePermissionsMutation.isPending ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
