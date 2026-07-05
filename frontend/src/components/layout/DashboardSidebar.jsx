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
      className={`hidden lg:flex fixed left-4 md:left-6 top-[88px] bottom-6 flex-col z-30 transition-all duration-300 ease-in-out ${
        isHovered ? 'w-[280px]' : 'w-[88px]'
      } glass-panel rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden`}
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
              className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-slate-100 dark:bg-[#1a1a1a] text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-[#888888] hover:bg-slate-50 dark:hover:bg-[#111111] hover:text-slate-900 dark:hover:text-[#dddddd]'
              } ${!isHovered ? 'justify-center' : ''}`}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-[#555555] group-hover:text-slate-700 dark:group-hover:text-white'
              }`} />
              
              {isHovered && (
                <span className="text-sm font-bold whitespace-nowrap">{item.label}</span>
              )}
              
              {isActive && isHovered && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900 dark:bg-white rounded-r-full"
                />
              )}

              {/* Tooltip for collapsed state */}
              {!isHovered && hoveredItem === index && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg whitespace-nowrap z-50 shadow-lg border border-slate-700 dark:border-[#e2e8f0]">
                  {item.label}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-white rotate-45"></div>
                </div>
              )}
            </a>
          );
        })}
      </nav>

      {/* Bottom Section - Role Badge */}
      <div className={`p-3 border-t border-slate-200/50 dark:border-[#222222] ${!isHovered ? 'flex justify-center' : ''} bg-slate-50/50 dark:bg-[#0a0a0a]`}>
        <div className={`flex items-center gap-3 transition-all duration-300 ${!isHovered ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-[#222222] flex items-center justify-center text-white dark:text-[#888888] font-black text-sm flex-shrink-0 shadow-sm border border-transparent dark:border-[#333333]">
            {userRole?.charAt(0)?.toUpperCase() || "U"}
          </div>
          {isHovered && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-black text-slate-800 dark:text-white truncate capitalize">
                {userRole || "User"}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-[#888888]">
                {userRole === "admin" ? "Administrator" : userRole === "manager" ? "Manager" : "Student"}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
