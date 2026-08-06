import {
  Users,
  Clock,
  ShieldCheck,
  CreditCard,
  Calculator,
  FileText,
  LayoutDashboard,
  Home,
  Settings,
  ConciergeBell,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

// Shared UI Components
import DashboardLayout from "../features/layout/DashboardLayout";
import DashboardOverview from "../features/layout/DashboardOverview";
import ManageUsers from "../features/users/ManageUsers";
import ManageRooms from "../features/residence/ManageRooms";
import HostelConfiguration from "../features/hostel/HostelConfiguration";
import ManageMealSettings from "../features/mealSetting/ManageMealSettings";
import LoadingScreen from "../features/ui/LoadingScreen";
import ServiceManagement from "../features/services/ServiceManagement";
import AttendanceManagement from "../features/attendance/AttendanceManagement";
import BillGeneration from "../features/billing/BillGeneration";
import BillManagement from "../features/billing/BillManagement";

import { useAuth } from "../context/AuthContext";
import { useMyHostel } from "../hooks/queries/useHostelQueries";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Get the current tab from the URL path
  const pathParts = location.pathname.split("/");
  const currentTab = pathParts[pathParts.length - 1];

  // 2. Set "dashboard" as the default
  let activeTab = (currentTab === "admin-dashboard" || !currentTab)
    ? "dashboard"
    : currentTab;

  const setActiveTab = (tabId) => {
    navigate(`/admin-dashboard/${tabId}`);
  };
  const { user } = useAuth();
  const { data: hostelResponse, isLoading } = useMyHostel();
  const hostelData = hostelResponse?.data;

  // Wait for hostel data to prevent flashing unauthorized tabs
  if (isLoading) {
    return <LoadingScreen />;
  }

  const isExpired = hostelData?.status === 'Expired';
  const enabledFeatures = hostelData?.plan?.features || [];

  if (isExpired && !["dashboard", "users", "weeklyMenu"].includes(activeTab)) {
    activeTab = "dashboard";
  }

  // Helper to check permissions dynamically
  const hasPermission = (permName) => {
    // If the user is an admin but has no permissions array (old database data fallback)
    if (user?.role === 'admin' && (!user.permissions || user.permissions.length === 0)) {
      // Reconstruct the original string to check against enabledFeatures
      const featureMap = {
        'service_management': ['Service Management'],
        'complaint_management': ['Complaint Management'],
        'user_management': ['User Management'],
        'residence_management': ['Residence Management'],
        'manual_attendance': ['Manual Attendance'],
        'qr_attendance': ['QR Attendance'],
        'biometric_attendance': ['Biometric Attendance'],
        'bill_generation': ['Bill Generation'],
        'bill_management': ['Bill Management', 'Bills Management'],
        'meal_settings': ['Meal settings'],
        'meal_control': ['Meal control'],
        'hostel_configuration': ['Hostel Configuration']
      };
      const matchingFeatures = featureMap[permName] || [];
      return enabledFeatures.some(f => matchingFeatures.includes(f.name) && f.isEnabled);
    }

    return user?.permissions?.includes(permName);
  };

  const hasService = hasPermission("service_management");
  const hasComplaint = hasPermission("complaint_management");
  const showServiceTab = hasService || hasComplaint;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    hasPermission("user_management") && { id: "users", label: "User Management", icon: Users },
    hasPermission("residence_management") && { id: "rooms", label: "Residence Management", icon: Home },
    showServiceTab && { id: "services", label: "Service Management", icon: ConciergeBell },
    (hasPermission("manual_attendance") || hasPermission("qr_attendance") || hasPermission("biometric_attendance")) && { id: "attendance", label: "Attendance", icon: CreditCard },
    hasPermission("bill_generation") && { id: "bills", label: "Bill generate", icon: Calculator },
    hasPermission("bill_management") && { id: "billManagement", label: "Bill Management", icon: FileText },
    hasPermission("meal_settings") && { id: "meal", label: "Meal settings", icon: Clock },
    hasPermission("meal_control") && { id: "mealControl", label: "Meal Control", icon: ShieldCheck },
    hasPermission("hostel_configuration") && { id: "weeklyMenu", label: "Hostel Configurations", icon: Settings },
  ].filter(Boolean);

  // Apply expiration lockout: Allow dashboard, user management, and hostel configuration if expired
  const filteredNavItems = isExpired
    ? navItems.filter(item => ["dashboard", "users", "weeklyMenu"].includes(item.id))
    : navItems;

  const renderPlaceholder = (text) => (
    <div className="w-full h-64 glass-panel rounded-2xl flex items-center justify-center">
      <p className="text-[#737373] font-bold">{text} (Migration Pending)</p>
    </div>
  );

  return (
    <DashboardLayout
      userRole={user?.role}
      navItems={filteredNavItems}
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
            <DashboardOverview userRole={user?.role} user={user} navItems={filteredNavItems} setActiveTab={setActiveTab} />
          )}
          {activeTab === "billManagement" && <BillManagement />}
          {activeTab === "users" && <ManageUsers />}
          {activeTab === "rooms" && <ManageRooms />}
          {activeTab === "attendance" && <AttendanceManagement />}
          {activeTab === "bills" && <BillGeneration />}
          {activeTab === "meal" && <ManageMealSettings />}
          {activeTab === "mealControl" && renderPlaceholder("Meal Control")}
          {activeTab === "weeklyMenu" && <HostelConfiguration />}
          {activeTab === "services" && <ServiceManagement />}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
