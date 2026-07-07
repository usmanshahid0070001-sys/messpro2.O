import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Building2, MapPin, Globe, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateHostel } from '../../hooks/mutations/useSuperadminMutations';

export default function CreateHostelModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    location: '',
    plan: 'Basic'
  });
  
  const { mutateAsync: createHostel, isPending: loading } = useCreateHostel();

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createHostel(formData);
      toast.success('Hostel created successfully!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create hostel');
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
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Create New Hostel</h2>
            <p className="text-sm font-bold text-slate-500 dark:text-[#888888]">Add a new tenant to the platform.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#111111] transition-colors text-slate-500 dark:text-[#888888]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-[#555555] mb-2">Hostel Name</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Green Valley Residency"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-[#222222] rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-[#555555] mb-2">Subdomain</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="subdomain"
                required
                value={formData.subdomain}
                onChange={handleChange}
                placeholder="e.g., green-valley"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-[#222222] rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-[#555555] mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Islamabad"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-[#222222] rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-[#555555] mb-2">Plan</label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-[#222222] rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="Basic">Basic</option>
                <option value="Premium">Premium</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
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
              {loading ? 'Creating...' : 'Create Hostel'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
