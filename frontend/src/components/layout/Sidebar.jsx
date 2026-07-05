import { NavLink } from 'react-router-dom';
import { Home, Building2, CreditCard, SlidersHorizontal, Puzzle, ShieldCheck } from 'lucide-react';

const navItems = [
  { label: 'Overview', to: '/', icon: Home, end: true },
  { label: 'Hostels', to: '/hostels', icon: Building2 },
  { label: 'Subscriptions', to: '/subscriptions', icon: CreditCard },
  { label: 'Customization', to: '/customization', icon: SlidersHorizontal },
  { label: 'Integrations', to: '/integrations', icon: Puzzle },
  { label: 'Security & Audit', to: '/security', icon: ShieldCheck },
];

export default function Sidebar() {
    
  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-slate-950/95 lg:flex lg:flex-col">
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-lg font-semibold text-white shadow-lg shadow-orange-500/20">
            M
          </div>
          <div>
            <p className="text-lg font-semibold text-white">MessPro</p>
            <p className="text-sm text-slate-400">Super Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5">
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-orange-500/10 text-orange-300 shadow-inner shadow-orange-500/10'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          <p className="font-semibold">System health</p>
          <p className="mt-1 text-xs text-emerald-100/80">All modules are running normally.</p>
        </div>
      </div>
    </aside>
  );
}
