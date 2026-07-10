import { ShieldAlert, ShieldCheck, Clock3, Lock, Download } from 'lucide-react';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';

const auditLogs = [
  { time: '14:32:07', event: 'HOSTEL_SUSPENDED', target: 'HST-003 · Green Valley Residency', severity: 'danger', code: 'LOG-8821' },
  { time: '14:18:43', event: 'PLAN_UPDATED', target: 'HST-006 · IBA Mess — Basic → Enterprise', severity: 'info', code: 'LOG-8820' },
  { time: '13:55:11', event: 'INTEGRATION_REVOKED', target: 'HST-005 · Stripe Gateway', severity: 'warning', code: 'LOG-8819' },
  { time: '13:40:02', event: 'HOSTEL_CREATED', target: 'HST-007 · NED University Hostel', severity: 'success', code: 'LOG-8818' },
];

export default function SecurityAudit() {
  return (
    <div className="space-y-6">
      <SectionCard 
        title="Instant Suspension Kill Switch" 
        subtitle="Emergency controls for critical tenant actions." 
        action={<button className="rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-700 dark:text-rose-400 transition-colors hover:bg-rose-100 dark:hover:bg-rose-500/20">Activate</button>}
      >
        <div className="rounded-[2rem] border border-[#e0e0e0] dark:border-[#222222] bg-[#fafafa]/50 dark:bg-[#0a0a0a] p-6 shadow-sm transition-transform hover:scale-[1.01] duration-300">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold text-[#737373] dark:text-[#888888]">Revokes sessions, invalidates JWTs, blocks API access, and disables dashboard control immediately.</p>
              <div className="mt-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#737373] dark:text-[#555555]">
                <ShieldAlert className="h-5 w-5 text-rose-500 dark:text-rose-400" />
                <span>Emergency action readiness</span>
              </div>
            </div>
            <div className="rounded-3xl border border-[#e0e0e0] dark:border-[#222222] bg-white dark:bg-[#111111] px-5 py-4 shadow-sm flex flex-col items-center gap-2 shrink-0 min-w-[140px]">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#737373] dark:text-[#555555]">Current state</p>
              <p className="text-xl font-black text-[#111111] dark:text-white tracking-tight">Secure</p>
              <StatusBadge tone="success">Protected</StatusBadge>
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Security Summary" subtitle="Key metrics for control plane stability.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[2rem] border border-[#e0e0e0] dark:border-[#222222] bg-[#fafafa]/50 dark:bg-[#0a0a0a] p-6 shadow-sm transition-transform hover:scale-[1.02] duration-300">
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#737373] dark:text-[#555555]">
                <Lock className="h-5 w-5 text-[#404040] dark:text-[#888888]" /> 
                Authorized requests
              </div>
              <p className="mt-4 text-4xl font-black text-[#111111] dark:text-white tracking-tight">1,232</p>
              <p className="mt-2 text-xs font-bold text-[#737373] dark:text-[#888888]">Requests validated in the last 24 hours.</p>
            </div>
            <div className="rounded-[2rem] border border-[#e0e0e0] dark:border-[#222222] bg-[#fafafa]/50 dark:bg-[#0a0a0a] p-6 shadow-sm transition-transform hover:scale-[1.02] duration-300">
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#737373] dark:text-[#555555]">
                <Clock3 className="h-5 w-5 text-[#404040] dark:text-[#888888]" /> 
                Average response
              </div>
              <p className="mt-4 text-4xl font-black text-[#111111] dark:text-white tracking-tight">142<span className="text-xl text-[#a3a3a3]">ms</span></p>
              <p className="mt-2 text-xs font-bold text-[#737373] dark:text-[#888888]">Latency on security policy enforcement.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard 
          title="Audit Export" 
          subtitle="Immutable audit trails for compliance." 
          action={<button className="inline-flex items-center gap-2 rounded-2xl border border-[#e0e0e0] dark:border-[#222222] bg-white dark:bg-[#111111] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#111111] dark:text-white transition-colors hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a]"><Download className="h-4 w-4" /> Export logs</button>}
        >
          <div className="rounded-[2rem] border border-[#e0e0e0] dark:border-[#222222] bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
            <div className="grid gap-3 border-b border-[#f5f5f5] dark:border-[#1a1a1a] bg-[#fafafa]/50 dark:bg-[#111111] px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#737373] dark:text-[#555555] sm:grid-cols-[90px_minmax(160px,1fr)_1fr_80px]">
              <span>Time</span>
              <span>Event</span>
              <span>Target</span>
              <span>Code</span>
            </div>
            <div className="divide-y divide-[#f5f5f5] dark:divide-[#1a1a1a]">
              {auditLogs.map((log) => (
                <div key={log.code} className="grid gap-3 px-6 py-5 text-sm sm:grid-cols-[90px_minmax(160px,1fr)_1fr_80px] hover:bg-[#fafafa] dark:hover:bg-[#111111] transition-colors items-center">
                  <span className="font-mono text-xs font-bold text-[#737373] dark:text-[#888888]">{log.time}</span>
                  <span className="font-black text-[#111111] dark:text-white">{log.event}</span>
                  <span className="font-bold text-[#737373] dark:text-[#888888]">{log.target}</span>
                  <div>
                    <StatusBadge tone={log.severity}>{log.code}</StatusBadge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
