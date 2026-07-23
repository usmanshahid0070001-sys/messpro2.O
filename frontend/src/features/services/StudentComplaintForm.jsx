import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Send, 
  History, 
  MessageSquare,
  Clock,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  CheckCircle2,
  Wrench,
  Zap,
  Sparkles,
  Wifi,
  ShieldAlert,
  UtensilsCrossed,
  Sofa,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SectionCard from '../../components/ui/SectionCard';

const CATEGORIES = [
  { id: 'electrical', label: 'Electrical', icon: Zap, defaultPriority: 'High' },
  { id: 'plumbing', label: 'Plumbing', icon: Wrench, defaultPriority: 'High' },
  { id: 'furniture', label: 'Furniture', icon: Sofa, defaultPriority: 'Low' },
  { id: 'cleaning', label: 'Cleaning', icon: Sparkles, defaultPriority: 'Medium' },
  { id: 'internet', label: 'Internet/WiFi', icon: Wifi, defaultPriority: 'Medium' },
  { id: 'security', label: 'Security', icon: ShieldAlert, defaultPriority: 'Urgent' },
  { id: 'mess', label: 'Mess/Food', icon: UtensilsCrossed, defaultPriority: 'High' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, defaultPriority: 'Medium' }
];

const PRIORITIES = [
  { id: 'Low', icon: ArrowDownRight, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20', border: 'border-sky-200 dark:border-sky-500/20' },
  { id: 'Medium', icon: ArrowRight, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20', border: 'border-amber-200 dark:border-amber-500/20' },
  { id: 'High', icon: ArrowUpRight, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20', border: 'border-rose-200 dark:border-rose-500/20' },
  { id: 'Urgent', icon: AlertTriangle, color: 'text-red-600 dark:text-red-500', bg: 'bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30', border: 'border-red-300 dark:border-red-500/30' }
];

const getStatusBadge = (status) => {
  switch (status) {
    case 'Open':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#f5f5f5] text-[#404040] dark:bg-[#1a1a1a] dark:text-[#a3a3a3] border border-[#e5e5e5] dark:border-[#333]"><AlertTriangle className="w-3 h-3" /> Open</span>;
    case 'Assigned':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"><Clock className="w-3 h-3" /> Assigned</span>;
    case 'In Progress':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"><Clock className="w-3 h-3" /> In Progress</span>;
    case 'Resolved':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> Resolved</span>;
    default:
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#f5f5f5] text-[#404040] dark:bg-[#1a1a1a] dark:text-[#a3a3a3] border border-[#e5e5e5] dark:border-[#333]">{status}</span>;
  }
};

export default function StudentComplaintForm() {
  const { user } = useAuth();
  
  // Using user room if populated, else fallback
  const roomNumber = typeof user?.room === 'object' ? user?.room?.roomNumber : (user?.room || 'Unknown Room');

  const [formData, setFormData] = useState({
    category: '',
    priority: '',
    description: ''
  });

  // Mocked complaints history state
  const [complaints, setComplaints] = useState([
    {
      id: 1,
      category: 'Electrical',
      priority: 'High',
      description: 'Fan is making a loud noise and spinning slowly',
      status: 'Resolved',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      category: 'Internet/WiFi',
      priority: 'Medium',
      description: 'Connection drops frequently near the window',
      status: 'Open',
      createdAt: new Date().toISOString(),
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-update priority when category changes
  const handleCategorySelect = (categoryId) => {
    const selectedCat = CATEGORIES.find(c => c.id === categoryId);
    setFormData({
      ...formData,
      category: categoryId,
      priority: selectedCat ? selectedCat.defaultPriority : 'Medium'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category || !formData.description) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newComplaint = {
        id: Date.now(),
        category: CATEGORIES.find(c => c.id === formData.category)?.label || 'Other',
        priority: formData.priority,
        description: formData.description,
        status: 'Open',
        createdAt: new Date().toISOString(),
      };
      
      setComplaints([newComplaint, ...complaints]);
      setFormData({ category: '', priority: '', description: '' });
      setIsSubmitting(false);
    }, 600);
  };

  const selectedCategory = CATEGORIES.find(c => c.id === formData.category);

  return (
    <div className="space-y-6 flex flex-col w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300 p-2 lg:p-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#111] dark:text-white tracking-tight">File a Complaint</h1>
        <p className="text-sm font-semibold text-[#737373] dark:text-[#888888] mt-1">
          Report maintenance issues, internet problems, or other concerns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 xl:gap-8">
        
        {/* Left Column: Complaint Form */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <SectionCard title="Issue Details" subtitle="Describe the problem accurately for a faster response">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
              
              {/* Room Number (Read-only) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#737373] dark:text-[#a3a3a3] uppercase tracking-wider">Your Room</label>
                <div className="w-full px-4 py-3 bg-[#f5f5f5] dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#333] rounded-xl text-sm font-bold text-[#404040] dark:text-[#a3a3a3] cursor-not-allowed flex items-center justify-between">
                  <span>{roomNumber}</span>
                  <span className="text-[11px] font-semibold text-[#a3a3a3] dark:text-[#737373] px-2 py-0.5 bg-white dark:bg-[#222] rounded shadow-sm border border-[#e5e5e5] dark:border-[#333]">Auto-filled</span>
                </div>
              </div>

              {/* Category Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#737373] dark:text-[#a3a3a3] uppercase tracking-wider">Category <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => {
                    const isSelected = formData.category === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                          isSelected 
                            ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400 shadow-sm' 
                            : 'bg-white dark:bg-[#111] border-[#e5e5e5] dark:border-[#222] text-[#404040] dark:text-[#a3a3a3] hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a]'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-[#737373] dark:text-[#737373]'}`} />
                        <span className="text-[11px] font-bold text-center leading-tight">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority Selection */}
              <AnimatePresence mode="popLayout">
                {formData.category && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-2 overflow-hidden"
                  >
                    <label className="text-[12px] font-bold text-[#737373] dark:text-[#a3a3a3] uppercase tracking-wider">Priority Level <span className="text-[10px] lowercase normal-case font-medium ml-1">(auto-suggested)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {PRIORITIES.map(prio => {
                        const isSelected = formData.priority === prio.id;
                        const PrioIcon = prio.icon;
                        return (
                          <button
                            key={prio.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, priority: prio.id })}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border transition-all duration-200 flex-1 min-w-[100px] justify-center ${
                              isSelected 
                                ? `${prio.bg} ${prio.border} shadow-sm ring-1 ring-inset ${prio.color.replace('text-', 'ring-')}` 
                                : 'bg-white dark:bg-[#111] border-[#e5e5e5] dark:border-[#222] text-[#737373] hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a]'
                            }`}
                          >
                            <PrioIcon className={`w-4 h-4 ${isSelected ? prio.color : 'text-[#a3a3a3]'}`} />
                            <span className={`text-[13px] font-bold ${isSelected ? prio.color : ''}`}>{prio.id}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#737373] dark:text-[#a3a3a3] uppercase tracking-wider">Description <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what's wrong and when you noticed it..."
                  className="w-full px-4 py-3 bg-white dark:bg-[#111] border border-[#e5e5e5] dark:border-[#333] rounded-xl text-sm text-[#111] dark:text-white placeholder:text-[#a3a3a3] dark:placeholder:text-[#555] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!formData.category || !formData.description || isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#111] dark:bg-white text-white dark:text-[#111] rounded-xl text-sm font-bold shadow-md hover:bg-black/90 dark:hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Complaint
                    </>
                  )}
                </button>
              </div>

            </form>
          </SectionCard>
        </div>

        {/* Right Column: History & Status */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <SectionCard 
            title="My Complaints" 
            subtitle="Recent issues and their current status"
            action={<History className="w-4 h-4 text-[#a3a3a3]" />}
          >
            <div className="flex flex-col gap-3 pt-2">
              <AnimatePresence mode="popLayout">
                {complaints.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex flex-col items-center justify-center py-10 px-4 bg-[#fafafa] dark:bg-[#111] border border-[#e5e5e5] dark:border-[#222] rounded-xl text-center"
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-3" />
                    <h3 className="text-sm font-bold text-[#111] dark:text-white">All clear!</h3>
                    <p className="text-[13px] text-[#737373] mt-1">You haven't reported any issues.</p>
                  </motion.div>
                ) : (
                  complaints.map((complaint) => {
                    const matchedCat = CATEGORIES.find(c => c.label === complaint.category) || CATEGORIES[7];
                    const Icon = matchedCat.icon;
                    const prioDetails = PRIORITIES.find(p => p.id === complaint.priority) || PRIORITIES[1];
                    const PrioIcon = prioDetails.icon;

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        key={complaint.id}
                        className="flex flex-col gap-3 p-4 bg-white dark:bg-[#111] border border-[#e5e5e5] dark:border-[#222] rounded-xl shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#f5f5f5] dark:bg-[#1a1a1a] flex items-center justify-center">
                              <Icon className="w-4 h-4 text-[#404040] dark:text-[#a3a3a3]" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-bold text-[#111] dark:text-white leading-tight">{complaint.category}</span>
                              <span className="text-[11px] text-[#737373]">
                                {new Date(complaint.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          {getStatusBadge(complaint.status)}
                        </div>
                        
                        <div className="pl-10">
                          <p className="text-[13px] text-[#404040] dark:text-[#a3a3a3] leading-relaxed line-clamp-2">
                            "{complaint.description}"
                          </p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <PrioIcon className={`w-3.5 h-3.5 ${prioDetails.color}`} />
                            <span className="text-[11px] font-bold text-[#737373] uppercase tracking-wider">{complaint.priority} Priority</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
