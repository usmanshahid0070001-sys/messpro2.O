import { CreditCard, BarChart3, ArrowUpRight } from 'lucide-react';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';

const packages = [
  { tier: 'Basic', price: '$49/mo', limit: '500 students', admins: '2 admins', support: 'Email only', badge: 'warning' },
  { tier: 'Premium', price: '$149/mo', limit: '1,000 students', admins: '5 admins', support: 'Email + SMS', badge: 'success' },
  { tier: 'Enterprise', price: '$399/mo', limit: 'Unlimited students', admins: 'Unlimited admins', support: 'All channels', badge: 'success' },
];

const revenueCards = [
  { title: 'Monthly recurring', value: 'PKR 1.1M', desc: 'Stable subscription revenue', accent: '#f97316' },
  { title: 'Contract renewals', value: '78%', desc: 'Upcoming this quarter', accent: '#38bdf8' },
];

export default function ManageSubscriptions() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Package Lineup" subtitle="Subscription tiers built for scale and control.">
          <div className="grid gap-4 md:grid-cols-3">
            {packages.map((pkg) => (
              <div key={pkg.tier} className="group rounded-[2rem] border border-[#e0e0e0] dark:border-[#222222] bg-[#fafafa]/50 dark:bg-[#0a0a0a] p-6 shadow-sm transition-all hover:scale-[1.02] duration-300">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#737373] dark:text-[#555555]">{pkg.tier}</p>
                    <div className="rounded-full border border-[#e0e0e0] dark:border-[#222222] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#404040] dark:text-[#dddddd]">
                      {pkg.badge === 'success' ? 'Recommended' : 'Standard'}
                    </div>
                  </div>
                  <p className="mt-2 text-4xl font-black text-[#111111] dark:text-white tracking-tight">{pkg.price}</p>
                </div>
                <div className="mt-6 space-y-3 text-xs font-bold text-[#737373] dark:text-[#888888]">
                  <p>{pkg.limit}</p>
                  <p>{pkg.admins}</p>
                  <p>{pkg.support}</p>
                </div>
                <button className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-[#e0e0e0] dark:border-[#222222] bg-white dark:bg-[#111111] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#111111] dark:text-white transition-colors hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a]">
                  Edit plan
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Revenue Signals" subtitle="Subscription growth and usage trends.">
          <div className="space-y-4">
            {revenueCards.map((card) => (
              <div key={card.title} className="rounded-[2rem] border border-[#e0e0e0] dark:border-[#222222] bg-[#fafafa]/50 dark:bg-[#0a0a0a] p-6 shadow-sm transition-transform hover:scale-[1.02] duration-300">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#737373] dark:text-[#555555]">{card.title}</p>
                <p className="mt-4 text-3xl font-black text-[#111111] dark:text-white tracking-tight">{card.value}</p>
                <p className="mt-2 text-xs font-bold text-[#737373] dark:text-[#888888]">{card.desc}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard 
        title="Contract Overview" 
        subtitle="Active service agreements and balance." 
        action={<button className="rounded-2xl border border-[#e0e0e0] dark:border-[#222222] bg-white dark:bg-[#111111] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#111111] dark:text-white transition-colors hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a]">Export CSV</button>}
      >
        <div className="overflow-hidden rounded-[2rem] border border-[#e0e0e0] dark:border-[#222222] bg-white dark:bg-[#0a0a0a] shadow-sm">
          <div className="grid gap-0 border-b border-[#f5f5f5] dark:border-[#1a1a1a] bg-[#fafafa]/50 dark:bg-[#111111] px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#737373] dark:text-[#555555] sm:grid-cols-[2fr_120px_120px_120px]">
            <span>Hostel</span>
            <span>Plan</span>
            <span>Renewal</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-[#f5f5f5] dark:divide-[#1a1a1a]">
            {packages.map((pkg) => (
              <div key={pkg.tier} className="grid gap-0 px-6 py-5 text-sm sm:grid-cols-[2fr_120px_120px_120px] hover:bg-[#fafafa] dark:hover:bg-[#111111] transition-colors items-center">
                <div>
                  <p className="font-black text-[#111111] dark:text-white">{pkg.tier} Partner</p>
                  <p className="text-xs font-bold text-[#737373] dark:text-[#555555] mt-0.5">Hostel agreement baseline</p>
                </div>
                <p className="font-bold text-[#404040] dark:text-[#dddddd]">{pkg.tier}</p>
                <p className="font-mono text-xs font-bold text-[#737373] dark:text-[#888888]">2026-03-12</p>
                <div>
                  <StatusBadge tone={pkg.badge === 'success' ? 'success' : 'info'}>Active</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
