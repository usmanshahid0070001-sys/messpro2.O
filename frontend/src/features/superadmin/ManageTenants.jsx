import { useState } from 'react';
import { Building2, ClipboardList, AlertTriangle, Plus, Settings } from 'lucide-react';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useHostels } from '../../hooks/queries/useSuperadminQueries';
import CreateHostelModal from '../../components/superadmin/CreateHostelModal';
import HostelSettingsModal from '../../components/superadmin/HostelSettingsModal';

export default function ManageTenants() {
  const { data, isLoading: loading, error } = useHostels();
  const hostels = data?.data || [];
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedHostelSettings, setSelectedHostelSettings] = useState(null);

  if (error) {
    // Optionally handle error visually
    console.error(error);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Tenant Demand" subtitle="Monitoring tenant status and allocations."> 
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200/50 dark:border-[#222222] bg-slate-50/50 dark:bg-[#0a0a0a] p-6 shadow-sm transition-transform hover:scale-[1.02] duration-300">
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-[#555555]">
                <Building2 className="h-5 w-5 text-slate-700 dark:text-[#888888]" /> 
                Current portfolio
              </div>
              <p className="mt-4 text-4xl font-black text-slate-900 dark:text-white tracking-tight">{hostels.length} <span className="text-xl text-slate-400">hostels</span></p>
              <p className="mt-2 text-xs font-bold text-slate-500 dark:text-[#888888]">Active across multiple cities.</p>
            </div>
            <div className="rounded-[2rem] border border-slate-200/50 dark:border-[#222222] bg-slate-50/50 dark:bg-[#0a0a0a] p-6 shadow-sm transition-transform hover:scale-[1.02] duration-300">
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-[#555555]">
                <ClipboardList className="h-5 w-5 text-slate-700 dark:text-[#888888]" /> 
                Contract coverage
              </div>
              <p className="mt-4 text-4xl font-black text-slate-900 dark:text-white tracking-tight">89<span className="text-xl text-slate-400">%</span></p>
              <p className="mt-2 text-xs font-bold text-slate-500 dark:text-[#888888]">Annual renewals confirmed.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Performance Alerts" subtitle="Tenant operations flags and warnings."> 
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-3xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-5 shadow-sm">
              <div>
                <p className="text-sm font-black text-amber-800 dark:text-amber-400">At-risk tenant</p>
                <p className="mt-1 text-xs font-bold text-amber-700/70 dark:text-amber-400/70">Green Valley Residency requires compliance review.</p>
              </div>
              <div className="bg-amber-100 dark:bg-amber-500/20 p-2.5 rounded-2xl text-amber-600 dark:text-amber-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200/50 dark:border-[#222222] bg-slate-50/50 dark:bg-[#0a0a0a] p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-[#555555]">Average uptime</p>
                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">99.95%</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard 
        title="Tenant Roster" 
        subtitle="Detailed tenant management table."
        action={
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Hostel
          </button>
        }
      >
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/50 dark:border-[#222222] bg-white dark:bg-[#0a0a0a] shadow-sm">
          <div className="grid gap-0 border-b border-slate-100 dark:border-[#1a1a1a] bg-slate-50/50 dark:bg-[#111111] px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-[#555555] sm:grid-cols-[100px_minmax(200px,1fr)_120px_100px_120px_100px]">
            <span>ID</span>
            <span>Hostel</span>
            <span>Admin</span>
            <span>Plan</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-[#1a1a1a]">
            {loading ? (
              <div className="p-8 text-center text-slate-500 font-bold">Loading hostels...</div>
            ) : hostels.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-bold">No hostels found. Create one to get started.</div>
            ) : (
              hostels.map((hostel) => (
                <div key={hostel._id} className="grid gap-0 px-6 py-5 text-sm sm:grid-cols-[100px_minmax(200px,1fr)_120px_100px_120px_100px] hover:bg-slate-50 dark:hover:bg-[#111111] transition-colors items-center">
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-[#888888]">{hostel._id.slice(-6)}</span>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white">{hostel.name}</p>
                    <p className="text-xs font-bold text-slate-500 dark:text-[#555555] mt-0.5">{hostel.location}</p>
                  </div>
                  <p className="font-bold text-slate-600 dark:text-[#888888]">Superadmin</p>
                  <p className="font-bold text-slate-700 dark:text-[#dddddd]">{hostel.plan || 'Basic'}</p>
                  <div>
                    <StatusBadge tone={hostel.status === 'Active' ? 'success' : hostel.status === 'Suspended' ? 'danger' : 'warning'}>
                      {hostel.status || 'Active'}
                    </StatusBadge>
                  </div>
                  <div>
                    <button 
                      onClick={() => setSelectedHostelSettings(hostel)}
                      className="p-2 bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-[#2a2a2a] transition-colors"
                      title="Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </SectionCard>

      <CreateHostelModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      <HostelSettingsModal 
        isOpen={!!selectedHostelSettings}
        onClose={() => setSelectedHostelSettings(null)}
        hostel={selectedHostelSettings}
      />
    </div>
  );
}
