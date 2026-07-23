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
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardOverview from "../components/shared/DashboardOverview";
import ManageUsers from "../features/users/ManageUsers";
import ManageRooms from "../features/residence/ManageRooms";
import HostelConfiguration from "../features/hostel/HostelConfiguration";
import ManageMealSettings from "../features/mealSetting/ManageMealSettings";
import LoadingScreen from "../components/ui/LoadingScreen";
import ServiceManagement from "../features/services/ServiceManagement";

import { useAuth } from "../context/AuthContext";
import { useMyHostel } from "../hooks/queries/useHostelQueries";

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
  const { data: hostelResponse, isLoading } = useMyHostel();
  const hostelData = hostelResponse?.data;

  // Wait for hostel data to prevent flashing unauthorized tabs
  if (isLoading) {
    return <LoadingScreen />;
  }

  const isExpired = hostelData?.status === 'Expired';
  const enabledFeatures = hostelData?.plan?.features || [];

  // Helper to check if a feature is enabled
  const hasFeature = (featureName) => {
    // Backward compatibility for existing databases that still have 'Room Service' mapped to Service Management (Cleaning)
    if (featureName === "Service Management") {
      return enabledFeatures.some(f => (f.name === "Service Management" || f.name === "Room Service") && f.isEnabled);
    }
    return enabledFeatures.some(f => f.name === featureName && f.isEnabled);
  };

  const hasService = hasFeature("Service Management");
  const hasComplaint = hasFeature("Complaint Management");
  const showServiceTab = hasService || hasComplaint;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    hasFeature("User Management") && { id: "users", label: "User Management", icon: Users },
    hasFeature("Residence Management") && { id: "rooms", label: "Residence Management", icon: Home },
    showServiceTab && { id: "services", label: "Service Management", icon: ConciergeBell },
    hasFeature("Biometric Attendance") && { id: "attendance", label: "Machine Attendance", icon: CreditCard },
    hasFeature("Bill Generation") && { id: "bills", label: "Bill generate", icon: Calculator },
    hasFeature("Bill Summary") && { id: "billSummary", label: "Bill Summary", icon: FileText },
    hasFeature("Meal settings") && { id: "meal", label: "Meal settings", icon: Clock },
    hasFeature("Meal control") && { id: "mealControl", label: "Meal Control", icon: ShieldCheck },
    hasFeature("Hostel Configuration") && { id: "weeklyMenu", label: "Hostel Configurations", icon: Settings },
  ].filter(Boolean); // Remove false/undefined items

  // Apply expiration lockout: Only keep dashboard if expired
  const filteredNavItems = isExpired
    ? navItems.filter(item => item.id === "dashboard")
    : navItems;

  const renderPlaceholder = (text) => (
    <div className="w-full h-64 glass-panel rounded-2xl flex items-center justify-center">
      <p className="text-[#737373] font-bold">{text} (Migration Pending)</p>
    </div>
  );

  return (
    <DashboardLayout
      userRole="admin"
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
            <DashboardOverview userRole="admin" user={user} navItems={filteredNavItems} setActiveTab={setActiveTab} />
          )}
          {activeTab === "billSummary" && renderPlaceholder("Bill Summary")}
          {activeTab === "users" && <ManageUsers />}
          {activeTab === "rooms" && <ManageRooms />}
          {activeTab === "attendance" && renderPlaceholder("Attendance Upload")}
          {activeTab === "bills" && renderPlaceholder("Generate Bills")}
          {activeTab === "meal" && <ManageMealSettings />}
          {activeTab === "mealControl" && renderPlaceholder("Meal Control")}
          {activeTab === "weeklyMenu" && <HostelConfiguration />}
          {activeTab === "services" && <ServiceManagement />}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
