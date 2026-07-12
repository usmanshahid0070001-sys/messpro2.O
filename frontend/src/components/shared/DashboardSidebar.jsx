import { useState } from "react";
import { motion } from "framer-motion";

export default function DashboardSidebar({ 
  navItems, 
  activeTab, 
  setActiveTab, 
  isCollapsed,
  userRole 
}) {
  const [hoveredItem, setHoveredItem] = useState(null);
  
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      // FIX: Changed left-4 to left-4 md:left-6 to perfectly align with Navbar. 
      // FIX: Changed top-20 to top-[88px] and bottom to bottom-6 for perfect vertical spacing.
      className={`hidden lg:flex fixed left-4 md:left-6 top-[88px] bottom-6 flex-col z-30 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[88px]' : 'w-[280px]'
      } bg-[#fafafa]/80 dark:bg-[#121212]/80 backdrop-blur-xl rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] shadow-sm`}
    >
      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
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
              className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-[#111111] dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'text-[#737373] dark:text-slate-300 hover:bg-[#f5f5f5]/80 dark:hover:bg-[#1a1a1a]/80'
              } ${isCollapsed ? 'justify-center' : ''}`}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
              title={isCollapsed ? item.label : ''}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${
                isActive ? 'text-white dark:text-slate-900' : 'text-[#a3a3a3] dark:text-slate-500 group-hover:text-[#111111] dark:group-hover:text-white'
              }`} />
              
              {!isCollapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && hoveredItem === index && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-[#111111] dark:bg-slate-700 text-white text-sm rounded-lg whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#111111] dark:bg-slate-700 rotate-45"></div>
                </div>
              )}
            </a>
          );
        })}
      </nav>

      {/* Bottom Section - Role Badge */}
      <div className={`p-3 border-t border-[#e0e0e0]/50 dark:border-slate-700/50 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-xl bg-[#111111] dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold text-xs flex-shrink-0">
            {userRole?.charAt(0)?.toUpperCase() || "U"}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-xs font-bold text-[#404040] dark:text-slate-200 truncate capitalize">
                {userRole || "User"}
              </p>
              <p className="text-[10px] text-[#a3a3a3] dark:text-slate-500">
                {userRole === "admin" ? "Administrator" : userRole === "manager" ? "Manager" : "Student"}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}