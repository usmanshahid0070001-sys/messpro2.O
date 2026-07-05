import { useState } from "react";
import DashboardNavbar from "./DashboardNavbar";
import DashboardSidebar from "./DashboardSidebar";
import MobileBottomNav from "./MobileBottomNav";

export default function DashboardLayout({
  userRole,
  navItems,
  activeTab,
  setActiveTab,
  children,
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Global Navbar */}
      <DashboardNavbar
        onMenuToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      <div className="flex pt-[72px] min-h-screen">
        {/* Desktop Sidebar */}
        <DashboardSidebar
          navItems={navItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          userRole={userRole}
        />

        {/* Dynamic Page Content with MARGIN FIX */}
        <main 
          className={`flex-1 overflow-y-auto p-4 md:p-6 md:pt-8 pb-24 md:pb-6 transition-all duration-300 ease-in-out
            ${isSidebarCollapsed ? 'lg:ml-[116px]' : 'lg:ml-[316px]'}
          `}
        >
          <div className="h-full max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav
        navItems={navItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
