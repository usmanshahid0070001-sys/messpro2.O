import { ArrowUpRight, Building2, Database, Users, Utensils } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';

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

export default function GlobalDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        {metrics.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.65fr_0.85fr]">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Revenue Trend</p>
              <p className="mt-2 text-lg font-semibold text-white">Jan - Aug 2025</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">
              <ArrowUpRight className="h-4 w-4" />
              +32.8% YTD
            </span>
          </div>

          <div className="chart-viewport">
            <div className="chart-surface">
              <svg viewBox="0 0 680 300" className="h-[320px] w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revLine" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#fb923c" stopOpacity="0.42" />
                    <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
                  </linearGradient>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <rect x="0" y="0" width="680" height="300" rx="24" fill="#0f172a" />

                <path
                  d="M60 214 C140 206 220 216 300 190 C380 170 460 160 540 150 C620 136 660 120 720 104"
                  fill="none"
                  stroke="#fb923c"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeOpacity="0.12"
                  filter="url(#glow)"
                />
                {/* x-axis labels (months) */}
                <g className="chart-axes" fill="#9aa0ad" fontSize="12" textAnchor="middle">
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
                <g className="chart-axes" fill="#9aa0ad" fontSize="12" textAnchor="end">
                  <text x="46" y="40">$100k</text>
                  <text x="46" y="100">$75k</text>
                  <text x="46" y="160">$50k</text>
                  <text x="46" y="220">$25k</text>
                  <text x="46" y="280">$0k</text>
                </g>

                <path
                  d="M60 214 C140 206 220 216 300 190 C380 170 460 160 540 150 C620 136 660 120 720 104 L720 300 L60 300 Z"
                  fill="url(#revLine)"
                  opacity="0.9"
                />

                <path
                  d="M60 214 C140 206 220 216 300 190 C380 170 460 160 540 150 C620 136 660 120 720 104"
                  fill="none"
                  stroke="#fb923c"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Plan Breakdown</p>
              </div>
            </div>

            <div className="space-y-4">
              {planData.map((plan) => (
                <div key={plan.name}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm font-medium text-slate-300">
                    <span>{plan.name}</span>
                    <span>{plan.value} hostels</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div className="h-2 rounded-full" style={{ width: `${plan.percent}%`, backgroundColor: plan.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Platform Health</p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>API Uptime</span>
                  <span className="font-semibold text-emerald-300">99.97%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Avg Response</span>
                  <span className="font-semibold text-emerald-300">142ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Suspended</span>
                  <span className="font-semibold text-amber-300">1 tenant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Recent Audit Events</p>
          </div>
          <button className="text-sm text-orange-400 hover:text-orange-300">View all →</button>
        </div>

        <div className="grid gap-3 text-sm text-slate-300">
          {auditEvents.map((event) => (
            <div key={event.time} className="grid gap-2 rounded-3xl border border-white/10 bg-slate-950/70 p-4 md:grid-cols-[90px_200px_1fr] items-center">
              <div className="font-mono text-slate-400">{event.time}</div>
              <div className="font-semibold text-white">{event.code}</div>
              <div className="text-slate-400">{event.detail}</div>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: event.dot }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
