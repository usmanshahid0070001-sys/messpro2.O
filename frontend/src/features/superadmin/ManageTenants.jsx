import { Building2, Users, ClipboardList, AlertTriangle } from 'lucide-react';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';

const tenants = [
  { id: 'HST-001', name: 'Al-Noor Boys Hostel', location: 'Lahore', admin: 'Usman Tariq', plan: 'Enterprise', status: 'Active', revenue: '$2,840' },
  { id: 'HST-002', name: 'Punjab University Mess', location: 'Lahore', admin: 'Sana Malik', plan: 'Premium', status: 'Active', revenue: '$1,920' },
  { id: 'HST-003', name: 'Green Valley Residency', location: 'Islamabad', admin: 'Kashif Raza', plan: 'Basic', status: 'Suspended', revenue: '$580' },
  { id: 'HST-004', name: 'Roots Hostel', location: 'Karachi', admin: 'Aisha Noor', plan: 'Premium', status: 'Active', revenue: '$2,100' },
];

export default function ManageTenants() {
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
              <p className="mt-4 text-4xl font-black text-slate-900 dark:text-white tracking-tight">63 <span className="text-xl text-slate-400">hostels</span></p>
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

      <SectionCard title="Tenant Roster" subtitle="Detailed tenant management table.">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/50 dark:border-[#222222] bg-white dark:bg-[#0a0a0a] shadow-sm">
          <div className="grid gap-0 border-b border-slate-100 dark:border-[#1a1a1a] bg-slate-50/50 dark:bg-[#111111] px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-[#555555] sm:grid-cols-[120px_minmax(220px,1fr)_130px_110px_120px_100px]">
            <span>ID</span>
            <span>Hostel</span>
            <span>Admin</span>
            <span>Plan</span>
            <span>Status</span>
            <span>Revenue</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-[#1a1a1a]">
            {tenants.map((tenant) => (
              <div key={tenant.id} className="grid gap-0 px-6 py-5 text-sm sm:grid-cols-[120px_minmax(220px,1fr)_130px_110px_120px_100px] hover:bg-slate-50 dark:hover:bg-[#111111] transition-colors items-center">
                <span className="font-mono text-xs font-bold text-slate-500 dark:text-[#888888]">{tenant.id}</span>
                <div>
                  <p className="font-black text-slate-900 dark:text-white">{tenant.name}</p>
                  <p className="text-xs font-bold text-slate-500 dark:text-[#555555] mt-0.5">{tenant.location}</p>
                </div>
                <p className="font-bold text-slate-600 dark:text-[#888888]">{tenant.admin}</p>
                <p className="font-bold text-slate-700 dark:text-[#dddddd]">{tenant.plan}</p>
                <div>
                  <StatusBadge tone={tenant.status === 'Active' ? 'success' : tenant.status === 'Suspended' ? 'danger' : 'warning'}>
                    {tenant.status}
                  </StatusBadge>
                </div>
                <p className="font-black text-slate-900 dark:text-white">{tenant.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
