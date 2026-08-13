import { Cloud, Zap, ShieldCheck, ArrowRight } from'lucide-react';
import SectionCard from'../../features/ui/SectionCard';
import ToggleSwitch from'../../features/ui/ToggleSwitch';

const integrations = [
 { name:'Stripe', type:'Payment', active: true },
 { name:'JazzCash', type:'Payment', active: true },
 { name:'Twilio SMS', type:'Notifications', active: true },
 { name:'WhatsApp Business', type:'Notifications', active: true },
 { name:'SendGrid', type:'Email', active: true },
 { name:'ZKTeco Biometric', type:'Attendance', active: false },
 { name:'SAP ERP', type:'University ERP', active: true },
];

export default function Integrations() {
 return (
 <div className="space-y-6 p-4 lg:p-8">
 <SectionCard 
 title="Integration Matrix"
 subtitle="Third-party services and connector status."
 action={<button className="rounded-2xl border border-border bg-card px-4 py-2 text-[10px] font-black uppercase tracking-widest text-foreground transition-colors hover:bg-accent">Sync status</button>}
 >
 <div className="space-y-4">
 {integrations.map((integration) => (
 <div key={integration.name} className="flex flex-col gap-4 rounded-[2rem] border border-border bg-card p-5 md:flex-row md:items-center md:justify-between transition-transform hover:scale-[1.01] duration-300 shadow-sm">
 <div className="flex items-center gap-4">
 <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card text-foreground dark:text-foreground shadow-sm border border-border">
 <Cloud className="h-6 w-6"/>
 </div>
 <div>
 <p className="text-base font-black text-foreground">{integration.name}</p>
 <p className="mt-1 text-xs font-bold text-foreground dark:text-foreground uppercase tracking-wider">{integration.type}</p>
 </div>
 </div>
 <div className="flex items-center gap-6">
 <ToggleSwitch checked={integration.active} onChange={() => {}} />
 <button className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-[10px] font-black uppercase tracking-widest text-foreground transition-colors hover:bg-accent">
 Manage
 <ArrowRight className="h-4 w-4"/>
 </button>
 </div>
 </div>
 ))}
 </div>
 </SectionCard>

 <SectionCard title="Integration Health"subtitle="Gateway success and connection statistics.">
 <div className="grid gap-4 lg:grid-cols-2">
 <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm transition-transform hover:scale-[1.02] duration-300">
 <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-foreground dark:text-foreground">
 <Zap className="h-5 w-5 text-foreground dark:text-foreground"/> 
 Connection uptime
 </div>
 <p className="mt-4 text-4xl font-black text-foreground tracking-tight">99.9<span className="text-xl text-foreground">%</span></p>
 <p className="mt-2 text-xs font-bold text-foreground dark:text-foreground">API gateway availability across partners.</p>
 </div>
 <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm transition-transform hover:scale-[1.02] duration-300">
 <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-foreground dark:text-foreground">
 <ShieldCheck className="h-5 w-5 text-foreground dark:text-foreground"/> 
 Security posture
 </div>
 <p className="mt-4 text-4xl font-black text-foreground tracking-tight">Protected</p>
 <p className="mt-2 text-xs font-bold text-foreground dark:text-foreground">All connected services pass authorization checks.</p>
 </div>
 </div>
 </SectionCard>
 </div>
 );
}
