import { Outlet } from "react-router-dom";
import DashboardNavbar from "./DashboardNavbar";
import DashboardSidebar from "./DashboardSidebar";
import useUIStore from "../../store/useUIStore";

export default function DashboardLayout({
  userRole,
  navItems,
  activeTab,
  setActiveTab,
  children,
}) {
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();

  return (
    <div className="min-h-screen bg-[#fafafa]/50 dark:bg-[#050505] font-sans text-[#111111] dark:text-slate-100 transition-colors duration-300">

      {/* Global Navbar */}
      <DashboardNavbar />

      <div className="flex pt-[80px] lg:pt-[88px] min-h-screen relative z-10">
        {/* Desktop Sidebar (Hover-based) */}
        <DashboardSidebar
          navItems={navItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={userRole}
        />

        {/* Dynamic Page Content */}
        <main
          className="flex-1 w-full overflow-x-hidden lg:pl-2.5 px-4 md:px-6 pt-4 lg:pt-0 pb-20 md:pb-10 transition-all duration-300 ease-in-out lg:ml-[112px]"
        >
          <div className="h-full w-full max-w-[1600px] mx-auto flex flex-col">
            {children || <Outlet />}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-[#0a0a0a] border-r border-[#e0e0e0] dark:border-[#222222] z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <img src="/pwa-192x192.png" alt="MessPro Logo" className="w-8 h-8 rounded-lg object-contain" />
            <span className="text-xl font-black text-[#111111] dark:text-white">MessPro</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    toggleMobileMenu();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${isActive
                    ? "bg-[#f5f5f5] dark:bg-[#1a1a1a] text-[#111111] dark:text-white"
                    : "text-[#737373] dark:text-[#888888] hover:bg-[#fafafa] dark:hover:bg-[#111111]"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

    </div>
  );
}