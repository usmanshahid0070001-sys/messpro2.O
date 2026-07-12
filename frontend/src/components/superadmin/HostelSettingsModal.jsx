import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, Clock, CreditCard, Utensils } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUpdateHostelSettings } from '../../hooks/mutations/useSuperadminMutations';

export default function HostelSettingsModal({ isOpen, onClose, hostel }) {
  const [formData, setFormData] = useState({
    authMethod: 'Email',
    attendanceMethod: 'Manual',
    billingModel: 'Prepaid',
    autoMealVerification: true
  });
  
  const { mutateAsync: updateHostelSettings, isPending: loading } = useUpdateHostelSettings();

  useEffect(() => {
    if (hostel && hostel.settings) {
      setFormData({
        authMethod: hostel.settings.authMethod || 'Email',
        attendanceMethod: hostel.settings.attendanceMethod || 'Manual',
        billingModel: hostel.settings.billingModel || 'Prepaid',
        autoMealVerification: hostel.settings.autoMealVerification !== undefined ? hostel.settings.autoMealVerification : true
      });
    }
  }, [hostel]);

  if (!isOpen || !hostel) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-slate-200/50 dark:border-[#222222] shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-[#1a1a1a]">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Hostel Settings</h2>
            <p className="text-sm font-bold text-slate-500 dark:text-[#888888]">{hostel.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#111111] transition-colors text-slate-500 dark:text-[#888888]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-[#555555] mb-2">Authentication Method</label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                disabled
                value="Email"
                className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-[#111111]/50 border border-slate-200 dark:border-[#222222] rounded-2xl text-slate-500 dark:text-[#888888] font-bold cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-[#555555] mb-2">Attendance Method</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                name="attendanceMethod"
                value={formData.attendanceMethod}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-[#222222] rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="Manual">Manual</option>
                <option value="QR">QR Code</option>
                <option value="Biometric">Biometric</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-[#555555] mb-2">Billing Model</label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                name="billingModel"
                value={formData.billingModel}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-[#222222] rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="Prepaid">Prepaid</option>
                <option value="Postpaid">Postpaid</option>
                <option value="FlatRate">Flat Rate</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Utensils className="w-5 h-5 text-slate-400" />
              <div>
                <label className="block text-sm font-black text-slate-900 dark:text-white">Auto Meal Verification</label>
                <span className="text-xs font-bold text-slate-500 dark:text-[#888888]">Automatically verify meals on entry</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="autoMealVerification"
                checked={formData.autoMealVerification}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-[#222222] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:hover:bg-[#222222] transition-colors"
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
