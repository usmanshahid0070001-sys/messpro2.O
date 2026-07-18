import {
  Users,
  Clock,
  ShieldCheck,
  CreditCard,
  Calculator,
  FileText,
  LayoutDashboard,
  Home,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

// Shared UI Components
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardOverview from "../components/shared/DashboardOverview";
import ManageUsers from "../features/users/ManageUsers";  
import ManageRooms from "../features/residence/ManageRooms";
import ManageMealSettings from "../features/mealSetting/ManageMealSettings";

import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Get the current tab from the URL path
  const pathParts = location.pathname.split("/");
  const currentTab = pathParts[pathParts.length - 1];

  // 2. Set "dashboard" as the default
  const activeTab = (currentTab === "admin-dashboard" || !currentTab) 
                    ? "dashboard" 
                    : currentTab;

  const setActiveTab = (tabId) => {
    navigate(`/admin-dashboard/${tabId}`);
  };
  const { user } = useAuth();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "billSummary", label: "Bill Summary", icon: FileText },
    { id: "users", label: "Manage Users", icon: Users },
    { id: "rooms", label: "Residence Management", icon: Home },
    { id: "attendance", label: "Machine Attendance", icon: CreditCard },
    { id: "bills", label: "Generate Bills", icon: Calculator },
    { id: "meal", label: "Meal settings", icon: Clock },
    { id: "mealControl", label: "Meal Control", icon: ShieldCheck },
    { id: "weeklyMenu", label: "Weekly Menu", icon: FileText },
  ];

  const renderPlaceholder = (text) => (
    <div className="w-full h-64 glass-panel rounded-3xl flex items-center justify-center">
      <p className="text-[#737373] font-bold">{text} (Migration Pending)</p>
    </div>
  );

  return (
    <DashboardLayout
      userRole="admin"
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
          className="w-full"
        >
          {activeTab === "dashboard" && (
            <DashboardOverview userRole="admin" user={user} setActiveTab={setActiveTab} />
          )}
          {activeTab === "billSummary" && renderPlaceholder("Bill Summary")}
          {activeTab === "users" && <ManageUsers />}
          {activeTab === "rooms" && <ManageRooms />}
          {activeTab === "attendance" && renderPlaceholder("Attendance Upload")}
          {activeTab === "bills" && renderPlaceholder("Generate Bills")}
          {activeTab === "meal" && <ManageMealSettings />}
          {activeTab === "mealControl" && renderPlaceholder("Meal Control")}
          {activeTab === "weeklyMenu" && renderPlaceholder("Weekly Menu")}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
