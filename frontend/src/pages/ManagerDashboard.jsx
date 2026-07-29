import { Utensils, LayoutDashboard, CreditCard, Home, Users, FileText, ConciergeBell, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

// Shared UI Components
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardOverview from "../components/shared/DashboardOverview";
import ManageRooms from "../features/residence/ManageRooms";
import ManageMealSettings from "../features/mealSetting/ManageMealSettings";
import ManageUsers from "../features/users/ManageUsers";
import ServiceManagement from "../features/services/ServiceManagement";
import AttendanceManagement from "../features/attendance/AttendanceManagement";
import LiveOverview from "../features/attendance/ManagerLiveOverview";
import LoadingScreen from "../components/ui/LoadingScreen";

// Auth & API
import { useAuth } from "../context/AuthContext";
import { useMyHostel } from "../hooks/queries/useHostelQueries";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pathParts = location.pathname.split("/");
  const currentTab = pathParts[pathParts.length - 1];

  let activeTab = (currentTab === "manager-dashboard" || !currentTab)
    ? "dashboard"
    : currentTab;

  const setActiveTab = (tabId) => {
    navigate(`/manager-dashboard/${tabId}`);
  };

  const { data: hostelResponse, isLoading } = useMyHostel();
  const hostelData = hostelResponse?.data;

  // Wait for hostel data to prevent flashing unauthorized tabs
  if (isLoading) {
    return <LoadingScreen />;
  }

  const isExpired = hostelData?.status === 'Expired';
  const enabledFeatures = hostelData?.plan?.features || [];
  const userPermissions = user?.permissions || [];

  if (isExpired && activeTab !== "dashboard") {
    activeTab = "dashboard";
  }

  // Helper: true if feature is in hostel plan AND user has permission
  const hasPermission = (permName) => {
    // 1. Check if the hostel actually has this feature enabled
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
      'meal_control': ['Meal control']
    };

    const matchingFeatures = featureMap[permName] || [];
    const isFeatureEnabled = enabledFeatures.some(f => matchingFeatures.includes(f.name) && f.isEnabled);

    // If the hostel disabled it, nobody gets it!
    if (!isFeatureEnabled) return false;

    // 2. Fallback for old managers with empty permissions
    if (user?.role === 'manager' && (!user.permissions || user.permissions.length === 0)) {
      return permName === 'bill_management' || permName === 'meal_settings' || permName === 'meal_control';
    }

    // 3. Strictly check manager's granted permissions
    return user?.permissions?.includes(permName);
  };

  const hasService = hasPermission("service_management");
  const hasComplaint = hasPermission("complaint_management");
  const showServiceTab = hasService || hasComplaint;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    hasPermission("meal_settings") && { id: "live", label: "Live Overview", icon: Activity },
    hasPermission("meal_settings") && { id: "menu", label: "Weekly Menu", icon: Utensils },
    hasPermission("bill_management") && { id: "bills", label: "Bill Management", icon: FileText },
    hasPermission("user_management") && { id: "users", label: "User Management", icon: Users },
    hasPermission("residence_management") && { id: "rooms", label: "Residence Management", icon: Home },
    showServiceTab && { id: "services", label: "Service Management", icon: ConciergeBell },
    (hasPermission("manual_attendance") || hasPermission("qr_attendance") || hasPermission("biometric_attendance")) && { id: "attendance", label: "Attendance", icon: CreditCard },
  ].filter(Boolean);

  const filteredNavItems = isExpired
    ? navItems.filter(item => item.id === "dashboard")
    : navItems;

  return (
    <DashboardLayout
      userRole="manager"
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
        >
          {activeTab === "dashboard" && (
            <DashboardOverview userRole="manager" user={user} navItems={filteredNavItems} setActiveTab={setActiveTab} />
          )}

          {activeTab === "users" && <ManageUsers />}

          {activeTab === "rooms" && <ManageRooms />}

          {activeTab === "services" && <ServiceManagement />}

          {activeTab === "attendance" && <AttendanceManagement />}

          {activeTab === "menu" && <ManageMealSettings />}

          {activeTab === "live" && <LiveOverview />}

          {activeTab === "bills" && (
            <div className="w-full flex items-center justify-center h-64 glass-panel rounded-2xl">
              <p className="text-[#737373] font-bold">Manage Bills (Migration Pending)</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
