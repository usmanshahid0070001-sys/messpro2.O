import { Building2, Users, ClipboardList, AlertTriangle } from 'lucide-react';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';

const tenants = [
  { id: 'HST-001', name: 'Al-Noor Boys Hostel', location: 'Lahore', admin: 'Usman Tariq', plan: 'Enterprise', status: 'Active', revenue: '$2,840' },
  { id: 'HST-002', name: 'Punjab University Mess', location: 'Lahore', admin: 'Sana Malik', plan: 'Premium', status: 'Active', revenue: '$1,920' },
  { id: 'HST-003', name: 'Green Valley Residency', location: 'Islamabad', admin: 'Kashif Raza', plan: 'Basic', status: 'Suspended', revenue: '$580' },
  { id: 'HST-004', name: 'Roots Hostel', location: 'Karachi', admin: 'Aisha Noor', plan: 'Premium', status: 'Active', revenue: '$2,100' },
];

export default function TenantManagement() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Tenant demand" subtitle="Monitoring tenant status and revenue allocations."> 
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
              <div className="flex items-center gap-3 text-sm text-slate-300"><Building2 className="h-5 w-5 text-orange-300" /> Current portfolio</div>
              <p className="mt-4 text-3xl font-semibold text-white">63 hostels</p>
              <p className="mt-2 text-sm text-slate-500">Active across multiple cities.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
              <div className="flex items-center gap-3 text-sm text-slate-300"><ClipboardList className="h-5 w-5 text-emerald-300" /> Contract coverage</div>
              <p className="mt-4 text-3xl font-semibold text-white">89%</p>
              <p className="mt-2 text-sm text-slate-500">Annual renewals confirmed.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Performance alerts" subtitle="Tenant operations flags and warnings."> 
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-3xl border border-amber-500/15 bg-amber-500/10 p-4 text-sm text-amber-200">
              <div>
                <p className="font-semibold text-white">At-risk tenant</p>
                <p className="mt-1 text-slate-400">Green Valley Residency requires compliance review.</p>
              </div>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
              <p className="text-sm font-semibold text-white">Average uptime</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">99.95%</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Tenant roster" subtitle="Detailed tenant management table.">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90">
          <div className="grid gap-0 border-b border-white/10 px-5 py-3 text-xs uppercase tracking-[0.18em] text-slate-500 sm:grid-cols-[120px_minmax(220px,1fr)_130px_110px_120px_100px]">
            <span>ID</span>
            <span>Hostel</span>
            <span>Admin</span>
            <span>Plan</span>
            <span>Status</span>
            <span>Revenue</span>
          </div>
          <div className="divide-y divide-white/5">
            {tenants.map((tenant) => (
              <div key={tenant.id} className="grid gap-0 px-5 py-4 text-sm text-slate-200 sm:grid-cols-[120px_minmax(220px,1fr)_130px_110px_120px_100px] hover:bg-white/5 transition">
                <span className="font-mono text-orange-300">{tenant.id}</span>
                <div>
                  <p className="font-semibold text-white">{tenant.name}</p>
                  <p className="text-xs text-slate-500">{tenant.location}</p>
                </div>
                <p className="text-slate-400">{tenant.admin}</p>
                <p className="text-slate-300">{tenant.plan}</p>
                <StatusBadge tone={tenant.status === 'Active' ? 'success' : tenant.status === 'Suspended' ? 'danger' : 'warning'}>{tenant.status}</StatusBadge>
                <p className="font-semibold text-slate-100">{tenant.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
