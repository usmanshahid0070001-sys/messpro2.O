import { useState } from "react";
import {
  Users,
  Clock,
  ShieldCheck,
  CreditCard,
  Calculator,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

// Feature Components (to be migrated in Phase 4)
// import BillSummary from "../features/admin/BillSummary";
// import ManageUsers from "../features/admin/ManageUsers";
// import MealSettings from "../features/admin/MealSettings";
// import GenerateBills from "../features/admin/GenerateBills";
// import AttendanceUpload from "../features/admin/AttendenceUpload";
// import MealControl from "../features/admin/MealControl";
// import WeeklyMenu from "../features/admin/WeeklyMenu";

// Shared UI Components (V1 Layout + Premium Theme)
import DashboardLayout from "../components/layout/DashboardLayout";
import PageHeader from "../components/shared/PageHeader";

import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Get the current tab from the URL path
  const pathParts = location.pathname.split("/");
  const currentTab = pathParts[pathParts.length - 1];

  // 2. Set "billSummary" as the default
  const activeTab = (currentTab === "admin-dashboard" || !currentTab) 
                    ? "billSummary" 
                    : currentTab;

  const setActiveTab = (tabId) => {
    navigate(`/admin-dashboard/${tabId}`);
  };
  const { user } = useAuth();

  const navItems = [
    { id: "billSummary", label: "Bill Summary", icon: FileText },
    { id: "users", label: "Manage Students", icon: Users },
    { id: "attendance", label: "Machine Attendance", icon: CreditCard },
    { id: "bills", label: "Generate Bills", icon: Calculator },
    { id: "settings", label: "Meal Timings", icon: Clock },
    { id: "mealControl", label: "Meal Control", icon: ShieldCheck },
    { id: "weeklyMenu", label: "Weekly Menu", icon: FileText },
  ];

  const getHeaderContent = () => {
    switch (activeTab) {
      case "billSummary":
        return { title: "Financial", highlightText: "Overview", subtitle: "Monitor hostel revenue, pending dues, and overall financial health." };
      case "users":
        return { title: "Student", highlightText: "Directory", subtitle: "Manage student accounts, room allocations, and system access." };
      case "attendance":
        return { title: "Machine", highlightText: "Attendance", subtitle: "Upload and sync biometric attendance logs." };
      case "bills":
        return { title: "Invoice", highlightText: "Generation", subtitle: "Calculate and generate monthly mess bills for all active students." };
      case "settings":
        return { title: "System", highlightText: "Settings", subtitle: "Configure daily meal timings and system-wide operational rules." };
      case "mealControl":
        return { title: "Meal", highlightText: "Control", subtitle: "Manually adjust meal counts and apply fines for violations." };
      case "weeklyMenu":
        return { title: "Weekly", highlightText: "Menu", subtitle: "Plan and manage the weekly mess menu." };
      default:
        return { title: "Admin", highlightText: "Dashboard", subtitle: "Manage the mess system operations." };
    }
  };

  const headerContent = getHeaderContent();

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
      <PageHeader 
        title={headerContent.title}
        highlightText={headerContent.highlightText}
        subtitle={headerContent.subtitle}
        badgeText="Administrator Portal"
        icon={ShieldCheck}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          {activeTab === "billSummary" && renderPlaceholder("Bill Summary")}
          {activeTab === "users" && renderPlaceholder("Manage Users")}
          {activeTab === "attendance" && renderPlaceholder("Attendance Upload")}
          {activeTab === "bills" && renderPlaceholder("Generate Bills")}
          {activeTab === "settings" && renderPlaceholder("Meal Settings")}
          {activeTab === "mealControl" && renderPlaceholder("Meal Control")}
          {activeTab === "weeklyMenu" && renderPlaceholder("Weekly Menu")}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
