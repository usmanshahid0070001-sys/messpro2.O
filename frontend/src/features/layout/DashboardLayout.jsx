import { useEffect } from"react";
import { Outlet } from"react-router-dom";
import { AnimatePresence, motion } from"framer-motion";
import { X, AlertTriangle } from"lucide-react";
import DashboardNavbar from"./DashboardNavbar";
import DashboardSidebar from"./DashboardSidebar";
import useUIStore from"../../store/useUIStore";

function UnsavedChangesModal({ onDiscard, onKeepEditing }) {
 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"role="dialog"aria-modal="true">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-zinc-900/40 dark:bg-zinc-900/60 backdrop-blur-sm transition-opacity"
 onClick={onKeepEditing}
 />
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 10 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 className="relative flex flex-col w-full max-w-md bg-white dark:bg-zinc-950 shadow-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
 >
 <div className="p-6 pb-5 border-b border-zinc-100 dark:border-zinc-800">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
 <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500"/>
 </div>
 <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Unsaved Changes</h3>
 </div>
 </div>
 <div className="p-6 py-5">
 <p className="text-sm text-zinc-600 dark:text-zinc-400">
 You have unsaved edits on this page. If you leave now, you will lose these changes. What would you like to do?
 </p>
 </div>
 <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
 <button
 type="button"
 onClick={onKeepEditing}
 className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 transition-all duration-200"
 >
 Let me Save it
 </button>
 <button
 type="button"
 onClick={onDiscard}
 className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-all duration-200"
 >
 Lose the edits
 </button>
 </div>
 </motion.div>
 </div>
 );
}

export default function DashboardLayout({
 userRole,
 navItems,
 activeTab,
 setActiveTab,
 children,
}) {
 const { triggerDiscard, isMobileMenuOpen, toggleMobileMenu, hasUnsavedChanges, setHasUnsavedChanges, pendingTabId, setPendingTabId } = useUIStore();
 const setActiveSectionLabel = useUIStore.getState().setActiveSectionLabel;

 // Sync the active section label to the store so the navbar can display it
 // Only activeTab triggers this — navItems reference is unstable (new array each render)
 useEffect(() => {
 const activeItem = navItems.find((item) => item.id === activeTab);
 setActiveSectionLabel(activeItem?.label ||'');
 return () => setActiveSectionLabel('');
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [activeTab]);

 // Protect against accidental browser refresh when there are unsaved changes
 useEffect(() => {
 const handleBeforeUnload = (e) => {
 if (hasUnsavedChanges) {
 e.preventDefault();
 e.returnValue =''; // Standard way to trigger the browser's unsaved changes warning
 }
 };
 window.addEventListener('beforeunload', handleBeforeUnload);
 return () => window.removeEventListener('beforeunload', handleBeforeUnload);
 }, [hasUnsavedChanges]);

 const handleMobileTabClick = (tabId) => {
 if (activeTab === tabId) {
 toggleMobileMenu();
 return;
 }
 if (hasUnsavedChanges) {
 setPendingTabId(tabId);
 toggleMobileMenu(); // Close mobile menu but show warning modal
 } else {
 setActiveTab(tabId);
 toggleMobileMenu();
 }
 };

 const handleDiscardChanges = () => {
 sessionStorage.removeItem('mealSettingsDraft');
 triggerDiscard();
 setHasUnsavedChanges(false);
 setActiveTab(pendingTabId);
 setPendingTabId(null);
 };

 const handleKeepEditing = () => {
 setPendingTabId(null);
 };

 return (
 <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 transition-colors duration-300 selection:bg-zinc-900/10 dark:selection:bg-zinc-100/10">

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
 className="flex-1 w-full overflow-x-hidden px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-6 transition-all duration-300 ease-in-out lg:ml-[112px] pb-24 md:pb-10"
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
 transition={{ duration: 0.2, ease:"easeOut"}}
 className="fixed inset-0 bg-zinc-900/40 dark:bg-zinc-900/60 backdrop-blur-sm z-40 lg:hidden"
 onClick={toggleMobileMenu}
 aria-hidden="true"
 />

 {/* Mobile Drawer */}
 <motion.div
 initial={{ x:"-100%"}}
 animate={{ x: 0 }}
 exit={{ x:"-100%"}}
 transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} // ease-out-expo curve
 className="fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 z-50 flex flex-col shadow-2xl lg:hidden"
 role="dialog"
 aria-modal="true"
 aria-label="Mobile navigation menu"
 >
 <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0 shadow-sm flex items-center justify-center">
 <img src="/pwa-192x192.png"alt="MessPro Logo"className="w-full h-full object-contain"/>
 </div>
 <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">MessPro</span>
 </div>
 <button
 onClick={toggleMobileMenu}
 aria-label="Close menu"
 className="p-2 -mr-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
 >
 <X className="w-5 h-5"/>
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
 onClick={() => handleMobileTabClick(item.id)}
 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-zinc-100/20 ${
 isActive
 ?"bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold shadow-sm"
 :"text-zinc-500 dark:text-zinc-400 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
 }`}
 >
 <Icon className={`w-[18px] h-[18px] ${isActive ?"opacity-100":"opacity-70"}`} />
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

 <AnimatePresence>
 {pendingTabId && (
 <UnsavedChangesModal 
 onDiscard={handleDiscardChanges} 
 onKeepEditing={handleKeepEditing} 
 />
 )}
 </AnimatePresence>
 </div>
 );
}