import { useState } from "react";
import { motion } from "framer-motion";

export default function DashboardSidebar({
  navItems,
  activeTab,
  setActiveTab,
  userRole
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Clean, monochrome glass panel based on login theme
  return (
    <motion.aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`hidden lg:flex fixed left-4 md:left-6 top-[88px] bottom-6 flex-col z-30 transition-all duration-300 ease-in-out ${isHovered ? 'w-[280px]' : 'w-[88px]'
        } glass-panel rounded-2xl shadow-sm dark:shadow-sm overflow-hidden`}
    >
      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <a
              key={item.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(item.id);
              }}
              className={`relative flex items-center rounded-xl transition-colors duration-300 group ${isActive
                  ? 'bg-[#f5f5f5] dark:bg-[#1a1a1a] text-[#111111] dark:text-white'
                  : 'text-[#737373] dark:text-[#888888] hover:bg-[#fafafa] dark:hover:bg-[#111111] hover:text-[#111111] dark:hover:text-[#dddddd]'
                }`}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Fixed-position icon slot - identical box in both states, so the icon never shifts */}
              <div className="w-[60px] h-[46px] flex items-center justify-center flex-shrink-0">
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#111111] dark:text-white' : 'text-[#a3a3a3] dark:text-[#555555] group-hover:text-[#404040] dark:group-hover:text-white'
                  }`} />
              </div>

              {/* Text grows into the remaining space; icon slot is untouched */}
              <span
                className={`text-sm font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered ? 'max-w-[180px] opacity-100' : 'max-w-0 opacity-0'
                  }`}
              >
                {item.label}
              </span>

              {isActive && isHovered && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-[#111111] dark:bg-white rounded-r-full"
                />
              )}

              {/* Tooltip for collapsed state */}
              {!isHovered && hoveredItem === index && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-[#111111] dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg whitespace-nowrap z-50 shadow-lg border border-[#404040] dark:border-[#e2e8f0]">
                  {item.label}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#111111] dark:bg-white rotate-45"></div>
                </div>
              )}
            </a>
          );
        })}
      </nav>

      {/* Bottom Section - Role Badge */}
      <div className="p-3 border-t border-[#e0e0e0]/50 dark:border-[#222222] bg-[#fafafa]/50 dark:bg-[#0a0a0a]">
        <div className="flex items-center">
          <div className="w-[56px] h-[40px] flex items-center justify-center flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#111111] dark:bg-[#222222] flex items-center justify-center text-white dark:text-[#888888] font-black text-sm shadow-sm border border-transparent dark:border-[#333333]">
              {userRole?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
          <div
            className={`min-w-0 overflow-hidden transition-all duration-300 ${isHovered ? 'max-w-[180px] opacity-100' : 'max-w-0 opacity-0'
              }`}
          >
            <p className="text-sm font-black text-[#171717] dark:text-white truncate capitalize">
              {userRole || "User"}
            </p>
            <p className="text-xs font-bold text-[#737373] dark:text-[#888888]">
              {userRole === "admin" ? "Administrator" : userRole === "manager" ? "Manager" : "Student"}
            </p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}