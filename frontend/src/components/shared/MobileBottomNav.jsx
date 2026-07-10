import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function MobileBottomNav({ navItems, activeTab, setActiveTab }) {
  const [isVisible, setIsVisible] = useState(true);

  // Track scroll direction
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Hide if scrolling down and passed the top 50px buffer. Show if scrolling up.
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: isVisible ? 0 : "100%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      // pointer-events-none prevents the invisible gradient from blocking clicks on the page
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
    >
      {/* Gradient Background & Padding Wrapper */}
      <div className="px-4 pb-4 pt-8 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-slate-950 dark:via-slate-950/90">
        
        {/* Inner Glass Card (Restores pointer events for buttons) */}
        <div className="pointer-events-auto bg-[#fafafa]/80 dark:bg-[#121212]/90 backdrop-blur-xl rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] shadow-lg">
          <div className="flex items-center justify-around px-2 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveTab(item.id)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300"
                >
                  <div
                    className={`p-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-[#111111] dark:bg-white text-white dark:text-slate-900 shadow-sm"
                        : "text-[#a3a3a3] dark:text-slate-500 hover:bg-[#f5f5f5]/50 dark:hover:bg-[#1a1a1a]/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold transition-all duration-300 mt-1 ${
                      isActive
                        ? "text-[#111111] dark:text-white"
                        : "text-[#a3a3a3] dark:text-slate-500"
                    }`}
                  >
                    {item.label.length > 10 ? item.label.substring(0, 10) + "..." : item.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}