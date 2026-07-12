import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Sun, Moon, Home, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useUIStore from "../../store/useUIStore";

export default function DashboardNavbar() {
  const { theme, toggleTheme, toggleMobileMenu } = useUIStore();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isPWA = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

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
          className="glass-panel rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
        >
          <div className="flex items-center justify-between px-4 py-2.5 md:px-6">
            {/* Left: Mobile Menu Toggle + Logo */}
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] rounded-xl transition-all duration-300"
              >
                <Menu className="w-5 h-5 text-[#737373] dark:text-[#888888]" />
              </button>

              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
                <div className="relative flex items-center justify-center w-9 h-9 hidden md:flex">
                  <div className="w-8 h-8 rounded-lg bg-[#111111] dark:bg-white text-white dark:text-black font-black flex items-center justify-center">
                    M
                  </div>
                </div>
                <span className="text-xl md:text-2xl font-black tracking-tight text-[#111111] dark:text-white">
                  MessPro<span className="text-[#a3a3a3] dark:text-[#555555]">.</span>
                </span>
              </div>
            </div>

            {/* Right: Theme Toggle + User Avatar + Logout */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="relative flex items-center w-[52px] h-[28px] rounded-full p-[3px] transition-colors duration-300 focus:outline-none bg-[#e0e0e0] dark:bg-[#111111] border border-[#d4d4d4] dark:border-[#222222]"
                aria-label="Toggle theme"
              >
                <Sun weight="bold" className="absolute left-[5px] w-3 h-3 text-[#a3a3a3] dark:text-[#555555] transition-colors duration-300" />
                <Moon weight="bold" className="absolute right-[5px] w-3 h-3 text-[#a3a3a3] dark:text-[#555555] transition-colors duration-300" />
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 600, damping: 32 }}
                  className={`relative z-10 w-[22px] h-[22px] rounded-full shadow-sm flex items-center justify-center bg-white dark:bg-[#222222] ${
                    theme === "dark" ? "ml-auto" : "mr-auto"
                  }`}
                >
                  {theme === "dark" ? (
                    <Moon className="w-3 h-3 text-white" />
                  ) : (
                    <Sun className="w-3 h-3 text-[#111111]" />
                  )}
                </motion.div>
              </button>

              {/* User Avatar */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 sm:pr-3 hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] rounded-xl transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#111111] dark:bg-[#222222] flex items-center justify-center text-white dark:text-[#888888] font-bold text-sm shrink-0 border border-transparent dark:border-[#333333]">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <span className="hidden sm:block text-sm font-bold text-[#404040] dark:text-white max-w-[120px] md:max-w-[180px] truncate text-left">
                    {user?.name || "User"}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.8)] border border-[#e0e0e0] dark:border-[#222222] z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-[#f5f5f5] dark:border-[#222222]">
                          <p className="text-sm font-bold text-[#111111] dark:text-white truncate">
                            {user?.name || "User"}
                          </p>
                          <p className="text-xs font-semibold text-[#737373] dark:text-[#888888] truncate">
                            {user?.email || "user@messpro.com"}
                          </p>
                        </div>

                        {!isPWA && (
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              navigate("/", { state: { fromDashboard: true } });
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#404040] dark:text-[#888888] hover:bg-[#fafafa] dark:hover:bg-[#111111] dark:hover:text-white transition-colors cursor-pointer border-b border-[#f5f5f5] dark:border-[#222222]"
                          >
                            <Home className="w-4 h-4" />
                            Home
                          </button>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#1a0a0a] transition-colors cursor-pointer"
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
