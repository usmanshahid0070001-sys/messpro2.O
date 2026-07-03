import { CreditCard, BarChart3, ArrowUpRight } from 'lucide-react';
import SectionCard from '../components/ui/SectionCard';
import StatusBadge from '../components/ui/StatusBadge';

const packages = [
  { tier: 'Basic', price: '$49/mo', limit: '500 students', admins: '2 admins', support: 'Email only', badge: 'warning' },
  { tier: 'Premium', price: '$149/mo', limit: '1,000 students', admins: '5 admins', support: 'Email + SMS', badge: 'success' },
  { tier: 'Enterprise', price: '$399/mo', limit: 'Unlimited students', admins: 'Unlimited admins', support: 'All channels', badge: 'success' },
];

const revenueCards = [
  { title: 'Monthly recurring', value: 'PKR 1.1M', desc: 'Stable subscription revenue', accent: '#f97316' },
  { title: 'Contract renewals', value: '78%', desc: 'Upcoming this quarter', accent: '#38bdf8' },
];

export default function SubscriptionPackages() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Package lineup" subtitle="Subscription tiers built for scale and control.">
          <div className="grid gap-4 md:grid-cols-3">
            {packages.map((pkg) => (
              <div key={pkg.tier} className="group rounded-3xl border border-white/10 bg-slate-900/80 p-5 transition hover:border-orange-400/30">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-400">{pkg.tier}</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{pkg.price}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 px-3 py-1 text-sm text-slate-200">{pkg.badge === 'success' ? 'Recommended' : 'Standard'}</div>
                </div>
                <div className="mt-6 space-y-3 text-sm text-slate-400">
                  <p>{pkg.limit}</p>
                  <p>{pkg.admins}</p>
                  <p>{pkg.support}</p>
                </div>
                <button className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">
                  Edit plan
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Revenue signals" subtitle="Subscription growth and usage trends.">
          <div className="space-y-4">
            {revenueCards.map((card) => (
              <div key={card.title} className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                <p className="text-sm text-slate-400">{card.title}</p>
                <p className="mt-4 text-3xl font-semibold text-white">{card.value}</p>
                <p className="mt-2 text-sm text-slate-500">{card.desc}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Contract overview" subtitle="Active service agreements and balance." action={<button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">Export CSV</button>}>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90">
          <div className="grid gap-0 border-b border-white/10 px-5 py-3 text-xs uppercase tracking-[0.18em] text-slate-500 sm:grid-cols-[2fr_120px_120px_120px]">
            <span>Hostel</span>
            <span>Plan</span>
            <span>Renewal</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-white/5">
            {packages.map((pkg) => (
              <div key={pkg.tier} className="grid gap-0 px-5 py-4 text-sm text-slate-200 sm:grid-cols-[2fr_120px_120px_120px] hover:bg-white/5 transition">
                <div>
                  <p className="font-semibold text-white">{pkg.tier} Partner</p>
                  <p className="text-xs text-slate-500">Hostel agreement baseline</p>
                </div>
                <p className="text-slate-300">{pkg.tier}</p>
                <p className="text-slate-400">2026-03-12</p>
                <StatusBadge tone={pkg.badge === 'success' ? 'success' : 'info'}>Active</StatusBadge>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
