import { Utensils, LayoutDashboard, CreditCard, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

// Feature Components
import LiveCounts from "../features/manager/LiveCounts";

// Shared UI Components
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardOverview from "../components/shared/DashboardOverview";

// Auth & API
import { useAuth } from "../context/AuthContext";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pathParts = location.pathname.split("/");
  const currentTab = pathParts[pathParts.length - 1];

  const activeTab = (currentTab === "manager-dashboard" || !currentTab) 
                    ? "dashboard" 
                    : currentTab;

  const setActiveTab = (tabId) => {
    navigate(`/manager-dashboard/${tabId}`);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "overview", label: "Live Counts", icon: LayoutDashboard },
    { id: "menu", label: "Weekly Menu", icon: Utensils },
    { id: "bills", label: "Bill Management", icon: CreditCard },
  ];

  return (
    <DashboardLayout
      userRole="manager"
      navItems={navItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "dashboard" && (
            <DashboardOverview userRole="manager" user={user} setActiveTab={setActiveTab} />
          )}

          {activeTab === "overview" && (
            <div className="max-w-4xl mx-auto">
              <LiveCounts />
            </div>
          )}

          {activeTab === "menu" && (
            <div className="w-full max-w-5xl mx-auto flex items-center justify-center h-64 glass-panel rounded-3xl">
              <p className="text-[#737373] font-bold">Weekly Menu (Migration Pending)</p>
            </div>
          )}

          {activeTab === "bills" && (
            <div className="w-full flex items-center justify-center h-64 glass-panel rounded-3xl">
               <p className="text-[#737373] font-bold">Manage Bills (Migration Pending)</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
