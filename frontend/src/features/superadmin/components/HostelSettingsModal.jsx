import { useState, useEffect } from'react';
import { motion } from'framer-motion';
import { X, CreditCard, RefreshCw, MapPin, Utensils } from'lucide-react';
import toast from'react-hot-toast';
import { useUpdateHostelSettings } from'../../../hooks/mutations/useSuperadminMutations';
import { usePlans } from'../../../hooks/queries/usePlanQueries';

export default function HostelSettingsModal({ isOpen, onClose, hostel }) {
 const [formData, setFormData] = useState({
 plan:'',
 additionalDays: 0,
 maxMealSelection: 4,
 lat: 0,
 lng: 0,
 regenerateQR: false
 });
 
 const { mutateAsync: updateHostelSettings, isPending: loading } = useUpdateHostelSettings();
 const { data: plansData, isLoading: loadingPlans } = usePlans();
 const plans = plansData?.data || [];

 useEffect(() => {
 if (hostel) {
 setFormData({
 plan: hostel.plan?.planId ||'',
 additionalDays: 0,
 maxMealSelection: hostel.settings?.maxMealSelection || 4,
 lat: hostel.locationCoords?.lat || 0,
 lng: hostel.locationCoords?.lng || 0,
 regenerateQR: false
 });
 }
 }, [hostel]);

 if (!isOpen || !hostel) return null;

 const handleChange = (e) => {
 const { name, value, type, checked } = e.target;
 setFormData(prev => ({
 ...prev,
 [name]: type ==='checkbox'? checked : (name ==='additionalDays'|| name ==='maxMealSelection'|| name ==='lat'|| name ==='lng'? Number(value) : value)
 }));
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 try {
 const payload = {
 plan: formData.plan,
 additionalDays: formData.additionalDays,
 settings: {
 maxMealSelection: formData.maxMealSelection
 },
 locationCoords: {
 lat: formData.lat,
 lng: formData.lng
 }
 };

 if (formData.regenerateQR) {
 payload.qrSecret = Math.random().toString(36).substring(2, 10).toUpperCase();
 }

 await updateHostelSettings({ id: hostel._id, settingsData: payload });
 toast.success('Settings updated successfully!');
 onClose();
 } catch (error) {
 toast.error(error.response?.data?.message ||'Failed to update settings');
 }
 };

 return (
 <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="relative w-full max-w-lg bg-background rounded-[2rem] border border-border shadow-xl flex flex-col max-h-[90vh]"
 >
 <div className="flex items-center justify-between p-6 border-b border-border dark:border-border shrink-0">
 <div>
 <h2 className="text-xl font-black text-foreground">Hostel Settings</h2>
 <p className="text-sm font-bold text-foreground dark:text-foreground">{hostel.name}</p>
 </div>
 <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-background transition-colors text-foreground dark:text-foreground">
 <X className="w-5 h-5"/>
 </button>
 </div>

 <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
 <div>
 <label className="block text-xs font-black uppercase tracking-widest text-foreground dark:text-foreground mb-2">Hostel Subscription Plan</label>
 <div className="relative">
 <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground"/>
 <select
 name="plan"
 value={formData.plan}
 onChange={handleChange}
 disabled={loadingPlans}
 className="w-full pl-12 pr-4 py-3 bg-background dark:bg-background border border-border rounded-2xl text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-50"
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
 <p className="mt-2 text-xs font-medium text-foreground dark:text-foreground">Changing the plan updates limits and allowed features for this hostel.</p>
 </div>

 <div className="pt-2">
 <label className="block text-xs font-black uppercase tracking-widest text-foreground dark:text-foreground mb-2">Duration (Days)</label>
 <div className="relative">
 <input
 type="number"
 name="additionalDays"
 min="0"
 value={formData.additionalDays}
 onChange={handleChange}
 disabled={loading}
 className="w-full px-4 py-3 bg-background dark:bg-background border border-border rounded-2xl text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
 placeholder="e.g. 30"
 />
 </div>
 <p className="mt-2 text-xs font-medium text-foreground dark:text-foreground">Number of days to extend the subscription.</p>
 </div>

 <div className="pt-2">
 <label className="block text-xs font-black uppercase tracking-widest text-foreground dark:text-foreground mb-2">Max Meal Selection</label>
 <div className="relative">
 <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground"/>
 <input
 type="number"
 name="maxMealSelection"
 min="1"
 max="10"
 value={formData.maxMealSelection}
 onChange={handleChange}
 disabled={loading}
 className="w-full pl-12 pr-4 py-3 bg-background dark:bg-background border border-border rounded-2xl text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
 />
 </div>
 <p className="mt-2 text-xs font-medium text-foreground dark:text-foreground">Maximum number of plates a student can select per meal.</p>
 </div>

 <div className="pt-2">
 <label className="block text-xs font-black uppercase tracking-widest text-foreground dark:text-foreground mb-2">GPS Coordinates (Geofencing)</label>
 <div className="grid grid-cols-2 gap-4">
 <div className="relative">
 <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground"/>
 <input
 type="number"
 step="any"
 name="lat"
 value={formData.lat}
 onChange={handleChange}
 disabled={loading}
 placeholder="Latitude"
 className="w-full pl-12 pr-4 py-3 bg-background dark:bg-background border border-border rounded-2xl text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
 />
 </div>
 <div className="relative">
 <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground"/>
 <input
 type="number"
 step="any"
 name="lng"
 value={formData.lng}
 onChange={handleChange}
 disabled={loading}
 placeholder="Longitude"
 className="w-full pl-12 pr-4 py-3 bg-background dark:bg-background border border-border rounded-2xl text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
 />
 </div>
 </div>
 </div>

 <div className="pt-2">
 <label className="flex items-center gap-3 p-4 bg-background dark:bg-background border border-border rounded-2xl cursor-pointer">
 <input
 type="checkbox"
 name="regenerateQR"
 checked={formData.regenerateQR}
 onChange={handleChange}
 disabled={loading}
 className="w-5 h-5 rounded border-border text-blue-600 focus:ring-blue-500"
 />
 <div className="flex items-center gap-2">
 <RefreshCw className="w-5 h-5 text-foreground"/>
 <div>
 <p className="text-sm font-bold text-foreground">Regenerate QR Secret</p>
 <p className="text-xs font-medium text-foreground">Invalidates all previous printed QRs.</p>
 </div>
 </div>
 </label>
 </div>

 <div className="pt-4 flex gap-3 shrink-0">
 <button
 type="button"
 onClick={onClose}
 className="flex-1 px-4 py-3 rounded-2xl font-black text-foreground dark:text-slate-300 bg-secondary hover:bg-background dark:hover:bg-background transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={loading}
 className="flex-1 px-4 py-3 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
 >
 {loading ?'Saving...':'Save Settings'}
 </button>
 </div>
 </form>
 </motion.div>
 </div>
 );
}
