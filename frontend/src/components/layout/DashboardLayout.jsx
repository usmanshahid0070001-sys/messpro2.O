import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
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
  const setActiveSectionLabel = useUIStore.getState().setActiveSectionLabel;

  // Sync the active section label to the store so the navbar can display it
  // Only activeTab triggers this — navItems reference is unstable (new array each render)
  useEffect(() => {
    const activeItem = navItems.find((item) => item.id === activeTab);
    setActiveSectionLabel(activeItem?.label || '');
    return () => setActiveSectionLabel('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#fafafa]/50 dark:bg-[#050505] font-sans text-[#111111] dark:text-slate-100 transition-colors duration-300 selection:bg-black/10 dark:selection:bg-white/10">

      {/* Global Navbar */}
      <DashboardNavbar />

      <div className="flex pt-[80px] lg:pt-[88px] min-h-screen relative">
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

      {/* Mobile Drawer and Overlay with AnimatePresence */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Mobile Sidebar Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={toggleMobileMenu}
              aria-hidden="true"
            />

            {/* Mobile Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} // ease-out-expo curve
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-[#0a0a0a] border-r border-black/5 dark:border-white/5 z-50 flex flex-col shadow-2xl lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
            >
              <div className="flex items-center justify-between p-6 pb-4 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 shrink-0 shadow-sm flex items-center justify-center">
                    <img src="/pwa-192x192.png" alt="MessPro Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-[#111111] dark:text-white">MessPro</span>
                </div>
                <button
                  onClick={toggleMobileMenu}
                  aria-label="Close menu"
                  className="p-2 -mr-2 rounded-lg text-[#737373] hover:text-[#111111] hover:bg-black/5 dark:text-[#888888] dark:hover:text-white dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain py-4 px-3">
                <nav className="space-y-1">
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
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/20 ${
                          isActive
                            ? "bg-black/5 dark:bg-white/10 text-[#111111] dark:text-white font-semibold shadow-sm"
                            : "text-[#737373] dark:text-[#a0a0a0] font-medium hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#111111] dark:hover:text-white"
                        }`}
                      >
                        <Icon className={`w-[18px] h-[18px] ${isActive ? "opacity-100" : "opacity-70"}`} />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}