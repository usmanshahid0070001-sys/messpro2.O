import { useState } from "react";
import { Moon, Sun, Menu, ChevronLeft, LogOut, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function DashboardNavbar({ onMenuToggle, isSidebarCollapsed }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3">
      <div className="max-w-[1920px] mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          // Increased light mode opacity to 90% and defined border colors to make it pop
          className="bg-[#fafafa]/90 dark:bg-[#121212]/90 backdrop-blur-xl rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] shadow-sm"
        >
          <div className="flex items-center justify-between px-4 py-2.5 md:px-6">
            {/* Left: Menu Toggle + Logo */}
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={onMenuToggle}
                className="hidden md:block p-2 hover:bg-[#f5f5f5] dark:hover:bg-slate-800 rounded-xl transition-all duration-300"
              >
                {isSidebarCollapsed ? (
                  <Menu className="w-5 h-5 text-[#737373] dark:text-slate-300" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-[#737373] dark:text-slate-300" />
                )}
              </button>

              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-9 h-9">
                  <img
                    src="/pwa-512x512.png"
                    alt="MessPro Logo"
                    // Removed blocky background/shadows, added a crisp dark-mode glow
                    className="w-8 h-8 object-contain"
                  />
                </div>
                {/* Fixed Text Color: Slate-900 in light mode, White in dark mode */}
                <span className="text-xl md:text-2xl font-black tracking-tight font-display text-[#111111] dark:text-white">
                  MessPro
                </span>
              </div>
            </div>

            {/* Right: Theme Toggle + User Avatar + Logout */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Theme Toggle */}
              <button
            onClick={toggleTheme}
            className="relative flex items-center w-[52px] h-[28px] rounded-full p-[3px] transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a3a3a3] bg-[#f5f5f5] dark:bg-[#1a1a1a] border border-[#e0e0e0] dark:border-[#2a2a2a]"
            aria-label="Toggle theme"
          >
            {/* Track icons — sun on left, moon on right */}
            <Sun
              weight="bold"
              className="absolute left-[5px] w-3 h-3 text-[#a3a3a3] dark:text-slate-600 transition-colors duration-300"
            />
            <Moon
              weight="bold"
              className="absolute right-[5px] w-3 h-3 text-[#a3a3a3] dark:text-white transition-colors duration-300"
            />

            {/* Sliding Thumb */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 600, damping: 32 }}
              className={`relative z-10 w-[22px] h-[22px] rounded-full shadow-sm flex items-center justify-center bg-white dark:bg-[#2a2a2a] ${
                theme === "dark" ? "ml-auto" : "mr-auto"
              }`}
            >
              {theme === "dark" ? (
                <Moon weight="fill" className="w-3 h-3 text-white" />
              ) : (
                <Sun weight="fill" className="w-3 h-3 text-[#111111]" />
              )}
            </motion.div>
          </button>

              {/* User Avatar with Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 sm:pr-3 hover:bg-[#f5f5f5] dark:hover:bg-slate-800 rounded-xl transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#111111] dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold text-sm shrink-0">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  {/* Show full name on SM screens and up, hide entirely on mobile, truncate if too long */}
                  <span className="hidden sm:block text-sm font-bold text-[#404040] dark:text-slate-200 max-w-[120px] md:max-w-[180px] truncate text-left">
                    {user?.name || "User"}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-[#e0e0e0] dark:border-slate-700 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-[#f5f5f5] dark:border-slate-800">
                          <p className="text-sm font-bold text-[#111111] dark:text-white truncate">
                            {user?.name || "User"}
                          </p>
                          <p className="text-xs text-[#737373] dark:text-slate-400 truncate">
                            {user?.email || "user@messpro.com"}
                          </p>
                        </div>

                        {/* Landing Page Button */}
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            // Pass the hidden state flag to bypass the PublicRoute redirect!
                            navigate("/", { state: { fromDashboard: true } });
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#404040] dark:text-slate-200 hover:bg-[#fafafa] dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-[#f5f5f5] dark:border-slate-800"
                        >
                          <Home className="w-4 h-4" />
                          Landing Page
                        </button>

                        {/* Sign Out Button */}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
