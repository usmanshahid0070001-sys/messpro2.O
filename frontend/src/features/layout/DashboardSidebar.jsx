import { useState } from "react";
import { motion } from "framer-motion";
import useUIStore from "../../store/useUIStore";

export default function DashboardSidebar({
  navItems,
  activeTab,
  setActiveTab,
  userRole
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const { hasUnsavedChanges, setPendingTabId } = useUIStore();

  const handleTabClick = (e, item) => {
    e.preventDefault();
    if (activeTab === item.id) return;
    
    if (hasUnsavedChanges) {
      setPendingTabId(item.id);
    } else {
      setActiveTab(item.id);
    }
  };

  return (
    <motion.aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`hidden lg:flex fixed left-4 md:left-6 top-[88px] bottom-6 flex-col z-30 transition-all duration-300 ease-in-out ${isHovered ? 'w-[280px]' : 'w-[88px]'
        } bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-sm overflow-hidden`}
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
              onClick={(e) => handleTabClick(e, item)}
              className={`relative flex items-center rounded-xl transition-colors duration-300 group ${isActive
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Fixed-position icon slot - identical box in both states, so the icon never shifts */}
              <div className="w-[60px] h-[46px] flex items-center justify-center flex-shrink-0">
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-100'
                  }`} />
              </div>

              {/* Text grows into the remaining space; icon slot is untouched */}
              <span
                className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered ? 'max-w-[180px] opacity-100' : 'max-w-0 opacity-0'
                  }`}
              >
                {item.label}
              </span>

              {isActive && isHovered && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-900 dark:bg-zinc-50 rounded-r-full"
                />
              )}

              {/* Tooltip for collapsed state */}
              {!isHovered && hoveredItem === index && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-sm font-medium rounded-lg whitespace-nowrap z-50 shadow-lg border border-zinc-800 dark:border-zinc-200">
                  {item.label}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 dark:bg-zinc-100 rotate-45"></div>
                </div>
              )}
            </a>
          );
        })}
      </nav>

      {/* Bottom Section - Role Badge */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="flex items-center">
          <div className="w-[56px] h-[40px] flex items-center justify-center flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-800 flex items-center justify-center text-zinc-50 dark:text-zinc-300 font-bold text-sm shadow-sm border border-transparent dark:border-zinc-700">
              {userRole?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
          <div
            className={`min-w-0 overflow-hidden transition-all duration-300 ${isHovered ? 'max-w-[180px] opacity-100' : 'max-w-0 opacity-0'
              }`}
          >
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate capitalize">
              {userRole || "User"}
            </p>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {userRole === "admin" ? "Administrator" : userRole === "manager" ? "Manager" : "Student"}
            </p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
