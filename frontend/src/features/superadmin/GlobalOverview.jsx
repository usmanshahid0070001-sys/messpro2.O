import { ArrowUpRight, Building2, Database, Users, Utensils } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';

const metrics = [
  { label: 'Platform MRR', value: '$94,280', note: 'Monthly recurring', change: '+18.4%', icon: Database, accent: '#fb923c' },
  { label: 'Active Hostels', value: '63', note: '4 pending review', change: '+3', icon: Building2, accent: '#22c55e' },
  { label: 'Total Students', value: '12,847', note: 'Across all tenants', change: '+924', icon: Users, accent: '#14b8a6' },
  { label: 'Meals Served', value: '284K', note: 'This month', change: '+12.1%', icon: Utensils, accent: '#eab308' },
];

const planData = [
  { name: 'Basic', value: '18', percent: 29, color: '#9a9fae' },
  { name: 'Premium', value: '31', percent: 49, color: '#fb923c' },
  { name: 'Enterprise', value: '14', percent: 22, color: '#14b8a6' },
];

const auditEvents = [
  { time: '14:32:07', code: 'HOSTEL_SUSPENDED', detail: 'HST-003 · Green Valley Residency', dot: '#ef4444' },
  { time: '14:18:43', code: 'PLAN_UPDATED', detail: 'HST-006 · IBA Mess — Basic → Enterprise', dot: '#14b8a6' },
  { time: '13:55:11', code: 'INTEGRATION_REVOKED', detail: 'HST-005 · Stripe Gateway', dot: '#eab308' },
  { time: '13:40:02', code: 'HOSTEL_CREATED', detail: 'HST-007 · NED University Hostel', dot: '#22c55e' },
];

export default function GlobalOverview() {
  return (
    <div className="space-y-8 p-4 lg:p-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.65fr_0.85fr]">
        <SectionCard
          title="Revenue Trend"
          subtitle="Jan - Aug 2025"
          action={
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
              +32.8% YTD
            </span>
          }
        >
          <div className="bg-[#fafafa] dark:bg-[#111111] rounded-[2rem] p-6 shadow-inner border border-[#e0e0e0] dark:border-[#222222]">
            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-4 shadow-sm border border-[#f5f5f5] dark:border-[#1a1a1a]">
              <svg viewBox="0 0 680 300" className="h-[320px] w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revLine" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#888888" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#888888" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <rect x="0" y="0" width="680" height="300" rx="24" fill="transparent" />

                <path
                  d="M60 214 C140 206 220 216 300 190 C380 170 460 160 540 150 C620 136 660 120 720 104 L720 300 L60 300 Z"
                  fill="url(#revLine)"
                  opacity="0.9"
                />

                <path
                  d="M60 214 C140 206 220 216 300 190 C380 170 460 160 540 150 C620 136 660 120 720 104"
                  fill="none"
                  stroke="#dddddd"
                  className="dark:stroke-[#dddddd] stroke-[#a3a3a3]"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* x-axis labels (months) */}
                <g className="fill-[#737373] dark:fill-[#555555] font-bold text-[10px] uppercase tracking-widest" textAnchor="middle">
                  <text x="60" y="272">Jan</text>
                  <text x="140" y="272">Feb</text>
                  <text x="220" y="272">Mar</text>
                  <text x="300" y="272">Apr</text>
                  <text x="380" y="272">May</text>
                  <text x="460" y="272">Jun</text>
                  <text x="540" y="272">Jul</text>
                  <text x="620" y="272">Aug</text>
                </g>

                {/* y-axis labels */}
                <g className="fill-[#737373] dark:fill-[#555555] font-bold text-[10px] uppercase tracking-widest" textAnchor="end">
                  <text x="46" y="40">$100k</text>
                  <text x="46" y="100">$75k</text>
                  <text x="46" y="160">$50k</text>
                  <text x="46" y="220">$25k</text>
                  <text x="46" y="280">$0k</text>
                </g>
              </svg>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Plan Breakdown" subtitle="Hostels by tier">
            <div className="space-y-6">
              {planData.map((plan) => (
                <div key={plan.name}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm font-bold text-[#404040] dark:text-[#888888]">
                    <span className="uppercase tracking-widest text-[10px]">{plan.name}</span>
                    <span className="text-[#111111] dark:text-white">{plan.value} hostels</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#f5f5f5] dark:bg-[#1a1a1a]">
                    <div className="h-2 rounded-full bg-[#171717] dark:bg-white" style={{ width: `${plan.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-[#e0e0e0] dark:border-[#222222] bg-[#fafafa]/50 dark:bg-[#0a0a0a] p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#737373] dark:text-[#555555]">Platform Health</p>
              <div className="mt-5 space-y-4 text-sm font-bold text-[#404040] dark:text-[#888888]">
                <div className="flex items-center justify-between">
                  <span>API Uptime</span>
                  <span className="text-[#111111] dark:text-white">99.97%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Avg Response</span>
                  <span className="text-[#111111] dark:text-white">142ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Suspended</span>
                  <span className="text-[#111111] dark:text-white">1 tenant</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard 
        title="Recent Audit Events" 
        subtitle="Global system activity"
        action={<button className="text-xs font-black uppercase tracking-widest text-[#737373] dark:text-[#888888] hover:text-[#111111] dark:hover:text-white transition-colors">View all →</button>}
      >
        <div className="grid gap-3">
          {auditEvents.map((event) => (
            <div key={event.time} className="grid gap-3 rounded-2xl border border-[#e0e0e0] dark:border-[#222222] bg-[#fafafa]/50 dark:bg-[#0a0a0a] p-4 md:grid-cols-[100px_220px_1fr] items-center hover:bg-[#f5f5f5] dark:hover:bg-[#111111] transition-colors">
              <div className="font-mono text-[10px] font-bold text-[#737373] dark:text-[#555555] uppercase tracking-widest">{event.time}</div>
              <div className="text-xs font-black tracking-widest text-[#111111] dark:text-white uppercase">{event.code}</div>
              <div className="text-sm font-semibold text-[#737373] dark:text-[#888888]">{event.detail}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
