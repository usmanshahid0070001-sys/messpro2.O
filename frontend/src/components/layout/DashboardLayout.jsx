import { Outlet, useLocation } from 'react-router-dom';
import UnifiedSidebar from './UnifiedSidebar';
import UnifiedTopBar from './UnifiedTopBar';
import { useAuth } from '../../context/AuthContext';

// Centralized page titles and subtitles mapping
const PAGE_META = {
  // SuperAdmin
  '/super-admin': { title: 'Platform Overview', sub: 'MessPro SaaS · Platform Control Center' },
  '/super-admin/hostels': { title: 'Tenant Management', sub: 'Manage tenant locations, contracts, and billing status.' },
  '/super-admin/subscriptions': { title: 'Subscription Packages', sub: 'Review package performance and contract health.' },
  '/super-admin/customization': { title: 'Customization Matrix', sub: 'Configure platform defaults, feature toggles, and policies.' },
  '/super-admin/integrations': { title: 'Third-Party Integrations', sub: 'Third-party gateway connectivity and status management.' },
  '/super-admin/security': { title: 'Security Controls', sub: 'System protection, audit trails, and emergency controls.' },
  
  // Admin
  '/admin-dashboard': { title: 'Admin Overview', sub: 'Manage your hostel operations' },
  '/admin-dashboard/users': { title: 'Staff & Users', sub: 'Manage staff and student access' },
  '/admin-dashboard/billing': { title: 'Billing', sub: 'Review financial transactions' },
  '/admin-dashboard/settings': { title: 'Settings', sub: 'Hostel configuration' },
  
  // Manager
  '/manager-dashboard': { title: 'Manager Overview', sub: 'Daily operations control' },
  '/manager-dashboard/menu': { title: 'Menu Planning', sub: 'Set up weekly meals' },
  '/manager-dashboard/inventory': { title: 'Inventory', sub: 'Stock management' },
  '/manager-dashboard/reports': { title: 'Reports', sub: 'Consumption and waste reports' },

  // Student
  '/student-dashboard': { title: 'Student Overview', sub: 'Your mess portal' },
  '/student-dashboard/menu': { title: 'Weekly Menu', sub: 'See whats cooking' },
  '/student-dashboard/invoices': { title: 'Invoices', sub: 'Your billing history' },
  '/student-dashboard/feedback': { title: 'Feedback', sub: 'Share your thoughts' },
};

export default function DashboardLayout() {
  const location = useLocation();
  const { role } = useAuth();
  
  // Fallback defaults if route isn't mapped
  const currentMeta = PAGE_META[location.pathname] || { 
    title: role ? `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard` : 'Dashboard', 
    sub: 'Welcome back' 
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
      <div className="flex min-h-screen relative overflow-hidden">
        
        {/* Sidebar Component */}
        <UnifiedSidebar />
        
        {/* Main Content Area */}
        <div className="flex flex-1 flex-col min-w-0 transition-all duration-300">
          
          <UnifiedTopBar title={currentMeta.title} subtitle={currentMeta.sub} />
          
          {/* Outlet Wrapper */}
          <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 bg-slate-50/30 dark:bg-[#030712] transition-colors duration-300 relative">
            
            {/* Ambient Background Blur (Subtle, Premium look) */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 pointer-events-none -z-10 transition-colors duration-300"></div>

            <div className="max-w-7xl mx-auto w-full pb-20">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
