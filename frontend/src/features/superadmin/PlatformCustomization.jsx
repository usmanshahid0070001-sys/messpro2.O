import { SlidersHorizontal, Paintbrush, Layers } from'lucide-react';
import SectionCard from'../../features/ui/SectionCard';
import ToggleSwitch from'../../features/ui/ToggleSwitch';

const settings = [
 { label:'Auto meal verification', description:'Enable automated validation for daily meal claims.', enabled: true },
 { label:'Multi-campus mode', description:'Allow tenants to manage more than one campus per contract.', enabled: false },
 { label:'Smart menu rotation', description:'Rotate daily menus based on student preferences and attendance.', enabled: true },
 { label:'Guest access tracking', description:'Log visitor meals and optional guest billing.', enabled: false },
];

export default function PlatformCustomization() {
 return (
 <div className="space-y-6 p-4 lg:p-8">
 <SectionCard 
 title="Feature Controls"
 subtitle="Platform configuration toggles for the Super Admin."
 action={<button className="rounded-2xl border border-border bg-card px-4 py-2 text-[10px] font-black uppercase tracking-widest text-foreground transition-colors hover:bg-accent">Save changes</button>}
 >
 <div className="grid gap-4 xl:grid-cols-2">
 {settings.map((setting) => (
 <div key={setting.label} className="rounded-[2rem] border border-border bg-card p-6 shadow-sm flex flex-col justify-between transition-transform hover:scale-[1.01] duration-300">
 <div className="flex items-start gap-4">
 <div className="rounded-2xl bg-card p-3 text-foreground dark:text-foreground shadow-sm border border-border">
 <SlidersHorizontal className="h-5 w-5"/>
 </div>
 <div className="flex-1 mt-1">
 <p className="text-sm font-black text-foreground">{setting.label}</p>
 <p className="mt-1 text-xs font-bold text-foreground dark:text-foreground">{setting.description}</p>
 </div>
 </div>
 <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
 <ToggleSwitch checked={setting.enabled} onChange={() => {}} label={setting.enabled ?'Enabled':'Disabled'} />
 </div>
 </div>
 ))}
 </div>
 </SectionCard>

 <SectionCard title="Design Tokens"subtitle="Core theming and layout controls.">
 <div className="grid gap-4 md:grid-cols-2">
 <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm transition-transform hover:scale-[1.02] duration-300">
 <div className="flex items-center gap-3">
 <Paintbrush className="h-5 w-5 text-foreground dark:text-foreground"/>
 <p className="text-sm font-black text-foreground">Brand accents</p>
 </div>
 <p className="mt-3 text-xs font-bold text-foreground dark:text-foreground">Defines the core visual palette used across all screens.</p>
 </div>
 <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm transition-transform hover:scale-[1.02] duration-300">
 <div className="flex items-center gap-3">
 <Layers className="h-5 w-5 text-foreground dark:text-foreground"/>
 <p className="text-sm font-black text-foreground">Layout density</p>
 </div>
 <p className="mt-3 text-xs font-bold text-foreground dark:text-foreground">Select between compact and standard spacing rules for dashboards.</p>
 </div>
 </div>
 </SectionCard>
 </div>
 );
}
