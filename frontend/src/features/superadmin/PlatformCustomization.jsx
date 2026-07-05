import { SlidersHorizontal, Paintbrush, Layers } from 'lucide-react';
import SectionCard from '../../components/ui/SectionCard';
import ToggleSwitch from '../../components/ui/ToggleSwitch';

const settings = [
  { label: 'Auto meal verification', description: 'Enable automated validation for daily meal claims.', enabled: true },
  { label: 'Multi-campus mode', description: 'Allow tenants to manage more than one campus per contract.', enabled: false },
  { label: 'Smart menu rotation', description: 'Rotate daily menus based on student preferences and attendance.', enabled: true },
  { label: 'Guest access tracking', description: 'Log visitor meals and optional guest billing.', enabled: false },
];

export default function PlatformCustomization() {
  return (
    <div className="space-y-6">
      <SectionCard 
        title="Feature Controls" 
        subtitle="Platform configuration toggles for the Super Admin." 
        action={<button className="rounded-2xl border border-slate-200/50 dark:border-[#222222] bg-white dark:bg-[#111111] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white transition-colors hover:bg-slate-50 dark:hover:bg-[#1a1a1a]">Save changes</button>}
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {settings.map((setting) => (
            <div key={setting.label} className="rounded-[2rem] border border-slate-200/50 dark:border-[#222222] bg-slate-50/50 dark:bg-[#0a0a0a] p-6 shadow-sm flex flex-col justify-between transition-transform hover:scale-[1.01] duration-300">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-white dark:bg-[#111111] p-3 text-slate-700 dark:text-[#888888] shadow-sm border border-slate-200/50 dark:border-[#222222]">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <div className="flex-1 mt-1">
                  <p className="text-sm font-black text-slate-900 dark:text-white">{setting.label}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500 dark:text-[#888888]">{setting.description}</p>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-200/50 dark:border-[#222222] flex items-center justify-between">
                <ToggleSwitch checked={setting.enabled} onChange={() => {}} label={setting.enabled ? 'Enabled' : 'Disabled'} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Design Tokens" subtitle="Core theming and layout controls.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200/50 dark:border-[#222222] bg-slate-50/50 dark:bg-[#0a0a0a] p-6 shadow-sm transition-transform hover:scale-[1.02] duration-300">
            <div className="flex items-center gap-3">
              <Paintbrush className="h-5 w-5 text-slate-700 dark:text-[#888888]" />
              <p className="text-sm font-black text-slate-900 dark:text-white">Brand accents</p>
            </div>
            <p className="mt-3 text-xs font-bold text-slate-500 dark:text-[#888888]">Defines the core visual palette used across all screens.</p>
          </div>
          <div className="rounded-[2rem] border border-slate-200/50 dark:border-[#222222] bg-slate-50/50 dark:bg-[#0a0a0a] p-6 shadow-sm transition-transform hover:scale-[1.02] duration-300">
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-slate-700 dark:text-[#888888]" />
              <p className="text-sm font-black text-slate-900 dark:text-white">Layout density</p>
            </div>
            <p className="mt-3 text-xs font-bold text-slate-500 dark:text-[#888888]">Select between compact and standard spacing rules for dashboards.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
