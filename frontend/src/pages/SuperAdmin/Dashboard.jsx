import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';

function Building2Icon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21V9l8-4 8 4v12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21v-6h6v6" />
    </svg>
  );
}

function UsersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 19a4 4 0 00-3-3.87M8 19a4 4 0 013-3.87M12 13a3 3 0 100-6 3 3 0 000 6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 20a4 4 0 013-3.87M19 20a4 4 0 00-3-3.87" />
    </svg>
  );
}

function UtensilsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v8a3 3 0 006 0V3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h2M16 3h2M5 11h14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10" />
    </svg>
  );
}

function TrendIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4-4 3 3 5-6 4 4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7h4v4" />
    </svg>
  );
}

function WalletIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 13h2" />
    </svg>
  );
}

function ShieldIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 5-3.5 7.5-7 10-3.5-2.5-7-5-7-10V6l7-3z" />
    </svg>
  );
}

function SparklesIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.4 4.1L18 8.5l-4.6 1.4L12 14l-1.4-4.1L6 8.5l4.6-1.4L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l.7 2.1 2.1.7-2.1.7L19 20l-.7-2.1-2.1-.7 2.1-.7L19 14z" />
    </svg>
  );
}

const overviewStats = [
  { label: 'Active Hostels', value: '24', note: 'Across 3 cities', change: '+4 this week', icon: Building2Icon, accent: '#fb923c' },
  { label: 'Students Served', value: '1,284', note: 'Daily average 842', change: '+12.4%', icon: UsersIcon, accent: '#38bdf8' },
  { label: 'Meals Prepared', value: '8,420', note: 'Prepared this week', change: '+9.1%', icon: UtensilsIcon, accent: '#34d399' },
  { label: 'Revenue Flow', value: 'PKR 1.2M', note: 'Monthly recurring', change: '+6.8%', icon: WalletIcon, accent: '#a78bfa' },
];

const upcomingTasks = [
  { title: 'Invoice review', detail: '3 pending hostel invoices', tone: 'warning' },
  { title: 'Inventory check', detail: 'Rice and chicken stock below target', tone: 'info' },
  { title: 'Security alert', detail: '2 staff access changes need confirmation', tone: 'danger' },
];

const hostelActivity = [
  { name: 'Al Noor Boys Hostel', location: 'Lahore', status: 'Live', tone: 'success' },
  { name: 'Green Valley Mess', location: 'Islamabad', status: 'Review', tone: 'warning' },
  { name: 'Riverside Student House', location: 'Karachi', status: 'Pending', tone: 'info' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <SectionCard
          title="Operational snapshot"
          subtitle="A clean overview of your mess operations, ready for future API integrations."
          action={
            <button className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-sm font-medium text-orange-300">
              + New hostel
            </button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-orange-300">
                <SparklesIcon className="h-4 w-4" />
                Today’s focus
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-white">Stable service, stronger oversight</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                This dashboard is structured for the professional admin experience from your design reference while leaving the space APIs ready for the backend team.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/20 via-slate-900 to-slate-900 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-300">
                <TrendIcon className="h-4 w-4" />
                Growth trend
              </div>
              <p className="mt-5 text-4xl font-semibold text-white">+18.6%</p>
              <p className="mt-2 text-sm text-slate-400">Expected uplift in meal demand over the next 30 days.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Priority actions" subtitle="Operational alerts and follow-ups">
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.title} className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">{task.title}</p>
                  <StatusBadge tone={task.tone}>{task.tone === 'danger' ? 'Urgent' : task.tone === 'warning' ? 'Review' : 'Info'}</StatusBadge>
                </div>
                <p className="mt-2 text-sm text-slate-400">{task.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Hostel activity" subtitle="Live status across partner locations">
          <div className="space-y-3">
            {hostelActivity.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                <div>
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="text-sm text-slate-400">{item.location}</p>
                </div>
                <StatusBadge tone={item.tone === 'Live' ? 'success' : item.tone === 'Review' ? 'warning' : 'info'}>{item.status}</StatusBadge>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Security & compliance" subtitle="Controls that can be mapped to backend endpoints later">
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-300">
                <ShieldIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-white">Access protection is enabled</p>
                <p className="text-sm text-slate-400">All admin actions are guarded and ready for API wiring.</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
