import { SlidersHorizontal, Paintbrush, Layers } from 'lucide-react';
import SectionCard from '../components/ui/SectionCard';
import ToggleSwitch from '../components/ui/ToggleSwitch';

const settings = [
  { label: 'Auto meal verification', description: 'Enable automated validation for daily meal claims.', enabled: true },
  { label: 'Multi-campus mode', description: 'Allow tenants to manage more than one campus per contract.', enabled: false },
  { label: 'Smart menu rotation', description: 'Rotate daily menus based on student preferences and attendance.', enabled: true },
  { label: 'Guest access tracking', description: 'Log visitor meals and optional guest billing.', enabled: false },
];

export default function CustomizationMatrix() {
  return (
    <div className="space-y-6">
      <SectionCard title="Feature controls" subtitle="Platform configuration toggles for the Super Admin." action={<button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">Save changes</button>}>
        <div className="grid gap-4 lg:grid-cols-2">
          {settings.map((setting) => (
            <div key={setting.label} className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-800 p-3 text-slate-200">
                  <Slider className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">{setting.label}</p>
                  <p className="mt-1 text-sm text-slate-400">{setting.description}</p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <ToggleSwitch checked={setting.enabled} onChange={() => {}} label={setting.enabled ? 'Enabled' : 'Disabled'} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Design tokens" subtitle="Core theming and layout controls." action={null}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
            <div className="flex items-center gap-3">
              <Paintbrush className="h-5 w-5 text-teal-300" />
              <p className="font-semibold text-white">Brand accents</p>
            </div>
            <p className="mt-3 text-sm text-slate-400">Defines the core visual palette used across all screens.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-orange-300" />
              <p className="font-semibold text-white">Layout density</p>
            </div>
            <p className="mt-3 text-sm text-slate-400">Select between compact and standard spacing rules for dashboards.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
