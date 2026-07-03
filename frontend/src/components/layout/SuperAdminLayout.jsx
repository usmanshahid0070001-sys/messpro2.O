import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const pageTitles = {
  '/': 'Platform Overview',
  '/hostels': 'Tenant Management',
  '/subscriptions': 'Subscription Packages',
  '/customization': 'Customization Matrix',
  '/integrations': 'Third-Party Integrations',
  '/security': 'Security Controls',
};

const pageSubs = {
  '/': 'MessPro SaaS · Platform Control Center',
  '/hostels': 'Manage tenant locations, contracts, and billing status.',
  '/subscriptions': 'Review package performance and contract health.',
  '/customization': 'Configure platform defaults, feature toggles, and policies.',
  '/integrations': 'Third-party gateway connectivity and status management.',
  '/security': 'System protection, audit trails, and emergency controls.',
};

export default function SuperAdminLayout() {
  const location = useLocation();
  const page = location.pathname === '/' ? '/' : location.pathname;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar title={pageTitles[page] ?? 'MessPro'} subtitle={pageSubs[page] ?? ''} />
          <main className="flex-1 overflow-auto p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
