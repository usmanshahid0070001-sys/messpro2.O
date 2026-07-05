import { NavLink } from 'react-router-dom';
import { 
  Home, Building2, CreditCard, SlidersHorizontal, Puzzle, ShieldCheck, 
  Users, Settings, Utensils, PackageSearch, FileText, MessageSquare, Receipt, LogOut
} from 'lucide-react';
import useUIStore from '../../store/useUIStore';
import { useAuth } from '../../context/AuthContext';

const NAV_CONFIG = {
  superadmin: [
    { label: 'Overview', to: '/super-admin', icon: Home, end: true },
    { label: 'Hostels', to: '/super-admin/hostels', icon: Building2 },
    { label: 'Subscriptions', to: '/super-admin/subscriptions', icon: CreditCard },
    { label: 'Customization', to: '/super-admin/customization', icon: SlidersHorizontal },
    { label: 'Integrations', to: '/super-admin/integrations', icon: Puzzle },
    { label: 'Security & Audit', to: '/super-admin/security', icon: ShieldCheck },
  ],
  admin: [
    { label: 'Overview', to: '/admin-dashboard', icon: Home, end: true },
    { label: 'Staff & Users', to: '/admin-dashboard/users', icon: Users },
    { label: 'Billing', to: '/admin-dashboard/billing', icon: CreditCard },
    { label: 'Settings', to: '/admin-dashboard/settings', icon: Settings },
  ],
  manager: [
    { label: 'Overview', to: '/manager-dashboard', icon: Home, end: true },
    { label: 'Menu Planning', to: '/manager-dashboard/menu', icon: Utensils },
    { label: 'Inventory', to: '/manager-dashboard/inventory', icon: PackageSearch },
    { label: 'Reports', to: '/manager-dashboard/reports', icon: FileText },
  ],
  student: [
    { label: 'Overview', to: '/student-dashboard', icon: Home, end: true },
    { label: 'Weekly Menu', to: '/student-dashboard/menu', icon: Utensils },
    { label: 'Invoices', to: '/student-dashboard/invoices', icon: Receipt },
    { label: 'Feedback', to: '/student-dashboard/feedback', icon: MessageSquare },
  ]
};

export default function UnifiedSidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { role, user, logout } = useAuth();
  
  // Default to student if role is not recognized or missing
  const navItems = NAV_CONFIG[role] || NAV_CONFIG['student'];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-100 dark:bg-slate-950/95 border-r border-slate-200 dark:border-white/10 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 px-6 py-6 h-20 shrink-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-orange-500 dark:to-amber-400 text-lg font-bold text-white shadow-lg">
            M
          </div>
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span className="truncate text-lg font-bold text-slate-900 dark:text-white">MessPro</span>
            <span className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">
              {role ? role.replace('superadmin', 'Super Admin') : 'User'}
            </span>
          </div>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-5">
          <div className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)} // Auto close on mobile
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-700 dark:bg-orange-500/10 dark:text-orange-400'
                      : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
                  }`
                }
              >
                <item.icon className={`h-5 w-5 ${item.isActive ? 'stroke-[2.5px]' : ''}`} />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer Area */}
        <div className="border-t border-slate-200 dark:border-white/10 p-4 shrink-0 space-y-4">
          
          {/* System Health (Optional, could be only for admins) */}
          {(role === 'superadmin' || role === 'admin') && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 p-4 text-sm">
              <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                System Normal
              </p>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-100/80 font-medium">All services operational.</p>
            </div>
          )}

          {/* User Profile Summary */}
          <div className="flex items-center gap-3 rounded-2xl p-3 bg-slate-50 border border-slate-200 dark:bg-[#0a0a0a] dark:border-[#222222]">
            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{user?.name || 'User'}</p>
              <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{user?.email || user?.rollNumber || ''}</p>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}
