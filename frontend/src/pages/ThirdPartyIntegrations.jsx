import { Cloud, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import SectionCard from '../components/ui/SectionCard';
import ToggleSwitch from '../components/ui/ToggleSwitch';

const integrations = [
  { name: 'Stripe', type: 'Payment', active: true },
  { name: 'JazzCash', type: 'Payment', active: true },
  { name: 'Twilio SMS', type: 'Notifications', active: true },
  { name: 'WhatsApp Business', type: 'Notifications', active: true },
  { name: 'SendGrid', type: 'Email', active: true },
  { name: 'ZKTeco Biometric', type: 'Attendance', active: false },
  { name: 'SAP ERP', type: 'University ERP', active: true },
];

export default function ThirdPartyIntegrations() {
  return (
    <div className="space-y-6">
      <SectionCard title="Integration matrix" subtitle="Third-party services and connector status." action={<button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">Sync status</button>}>
        <div className="space-y-3">
          {integrations.map((integration) => (
            <div key={integration.name} className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-900/80 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-800 text-slate-200">
                  <Cloud className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">{integration.name}</p>
                  <p className="text-sm text-slate-500">{integration.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ToggleSwitch checked={integration.active} onChange={() => {}} />
                <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">
                  Manage
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Integration health" subtitle="Gateway success and connection statistics.">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
            <div className="flex items-center gap-3 text-sm text-slate-300"><Zap className="h-5 w-5 text-emerald-300" /> Connection uptime</div>
            <p className="mt-4 text-3xl font-semibold text-white">99.9%</p>
            <p className="mt-2 text-sm text-slate-500">API gateway availability across partners.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
            <div className="flex items-center gap-3 text-sm text-slate-300"><ShieldCheck className="h-5 w-5 text-teal-300" /> Security posture</div>
            <p className="mt-4 text-3xl font-semibold text-white">Protected</p>
            <p className="mt-2 text-sm text-slate-500">All connected services pass authorization checks.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
