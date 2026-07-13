import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUpdateHostelSettings } from '../../hooks/mutations/useSuperadminMutations';
import { usePlans } from '../../hooks/queries/usePlanQueries';

export default function HostelSettingsModal({ isOpen, onClose, hostel }) {
  const [formData, setFormData] = useState({
    plan: ''
  });
  
  const { mutateAsync: updateHostelSettings, isPending: loading } = useUpdateHostelSettings();
  const { data: plansData, isLoading: loadingPlans } = usePlans();
  const plans = plansData?.data || [];

  useEffect(() => {
    if (hostel && hostel.plan) {
      setFormData({
        plan: hostel.plan.planId || ''
      });
    }
  }, [hostel]);

  if (!isOpen || !hostel) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateHostelSettings({ id: hostel._id, settingsData: formData });
      toast.success('Settings updated successfully!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-[#e0e0e0] dark:border-[#222222] shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-[#f5f5f5] dark:border-[#1a1a1a]">
          <div>
            <h2 className="text-xl font-black text-[#111111] dark:text-white">Hostel Settings</h2>
            <p className="text-sm font-bold text-[#737373] dark:text-[#888888]">{hostel.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#f5f5f5] dark:hover:bg-[#111111] transition-colors text-[#737373] dark:text-[#888888]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-[#737373] dark:text-[#555555] mb-2">Hostel Subscription Plan</label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3a3a3]" />
              <select
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                disabled={loadingPlans}
                className="w-full pl-12 pr-4 py-3 bg-[#fafafa] dark:bg-[#111111] border border-[#e0e0e0] dark:border-[#222222] rounded-2xl text-[#111111] dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-50"
              >
                {loadingPlans ? (
                  <option value="">Loading plans...</option>
                ) : plans.length === 0 ? (
                  <option value="">No plans available</option>
                ) : (
                  plans.map(p => (
                    <option key={p._id} value={p._id}>{p.name} (${p.price})</option>
                  ))
                )}
              </select>
            </div>
            <p className="mt-2 text-xs font-medium text-[#737373] dark:text-[#888888]">Changing the plan updates limits and allowed features for this hostel.</p>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl font-black text-[#404040] dark:text-slate-300 bg-[#f5f5f5] dark:bg-[#1a1a1a] hover:bg-[#e0e0e0] dark:hover:bg-[#222222] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
