import { ShieldAlert, ShieldCheck, Clock3, Lock, Download } from 'lucide-react';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';

const auditLogs = [
  { time: '14:32:07', event: 'HOSTEL_SUSPENDED', target: 'HST-003 · Green Valley Residency', severity: 'danger', code: 'LOG-8821' },
  { time: '14:18:43', event: 'PLAN_UPDATED', target: 'HST-006 · IBA Mess — Basic → Enterprise', severity: 'info', code: 'LOG-8820' },
  { time: '13:55:11', event: 'INTEGRATION_REVOKED', target: 'HST-005 · Stripe Gateway', severity: 'warning', code: 'LOG-8819' },
  { time: '13:40:02', event: 'HOSTEL_CREATED', target: 'HST-007 · NED University Hostel', severity: 'success', code: 'LOG-8818' },
];

export default function SecurityControls() {
  return (
    <div className="space-y-6">
      <SectionCard title="Instant Suspension Kill Switch" subtitle="Emergency controls for critical tenant actions." action={<button className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20">Activate</button>}>
        <div className="rounded-3xl border border-rose-500/15 bg-slate-900/80 p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-400">Revokes sessions, invalidates JWTs, blocks API access, and disables dashboard control immediately.</p>
              <div className="mt-4 flex items-center gap-3 text-sm text-slate-300">
                <ShieldAlert className="h-5 w-5 text-rose-300" />
                <span>Emergency action readiness</span>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Current state</p>
              <p className="mt-2 text-2xl font-semibold text-white">Secure</p>
              <StatusBadge tone="success">Protected</StatusBadge>
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Security summary" subtitle="Key metrics for control plane stability.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
              <div className="flex items-center gap-3 text-sm text-slate-300"><Lock className="h-5 w-5 text-teal-300" /> Authorized access requests</div>
              <p className="mt-4 text-3xl font-semibold text-white">1,232</p>
              <p className="mt-2 text-sm text-slate-500">Requests validated in the last 24 hours.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
              <div className="flex items-center gap-3 text-sm text-slate-300"><Clock3 className="h-5 w-5 text-orange-300" /> Average response</div>
              <p className="mt-4 text-3xl font-semibold text-white">142ms</p>
              <p className="mt-2 text-sm text-slate-500">Latency on security policy enforcement.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Audit export" subtitle="Immutable audit trails for compliance." action={<button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"><Download className="h-4 w-4" /> Export logs</button>}>
          <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-4">
            <div className="grid gap-3 text-sm text-slate-400 sm:grid-cols-[90px_minmax(160px,1fr)_1fr_80px]">
              <span>Time</span>
              <span>Event</span>
              <span>Target</span>
              <span>Code</span>
            </div>
            <div className="mt-4 space-y-3">
              {auditLogs.map((log) => (
                <div key={log.code} className="grid gap-3 rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-200 sm:grid-cols-[90px_minmax(160px,1fr)_1fr_80px] hover:bg-white/5 transition">
                  <span>{log.time}</span>
                  <span className="font-semibold text-white">{log.event}</span>
                  <span className="text-slate-400">{log.target}</span>
                  <StatusBadge tone={log.severity}>{log.code}</StatusBadge>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
