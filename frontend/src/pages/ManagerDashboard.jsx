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

  const activeTab = (currentTab === "manager-dashboard" || !currentTab) 
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

  // Helper: true if feature is in hostel plan AND user has permission
  const hasFeatureAndPermission = (featureName, requiredPermissionName) => {
    let isFeatureEnabled = false;
    
    // Fallbacks for older databases that still use 'Room Service' mapped to Service Management (Cleaning)
    if (featureName === "Service Management") {
      isFeatureEnabled = enabledFeatures.some(f => (f.name === "Service Management" || f.name === "Room Service") && f.isEnabled);
    } else {
      isFeatureEnabled = enabledFeatures.some(f => f.name === featureName && f.isEnabled);
    }

    const hasPermission = userPermissions.includes(requiredPermissionName);
    return isFeatureEnabled && hasPermission;
  };

  const hasService = hasFeatureAndPermission("Service Management", "service_management");
  const hasComplaint = hasFeatureAndPermission("Complaint Management", "complaint_management");
  const showServiceTab = hasService || hasComplaint;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "live", label: "Live Overview", icon: Activity }, // Default
    { id: "menu", label: "Weekly Menu", icon: Utensils }, // Default 
    { id: "bills", label: "Bill Management", icon: FileText }, // Default

    // Conditionally added features based on permissions AND hostel plan
    hasFeatureAndPermission("User Management", "user_management") && { id: "users", label: "User Management", icon: Users },
    hasFeatureAndPermission("Residence Management", "residence_management") && { id: "rooms", label: "Residence Management", icon: Home },
    showServiceTab && { id: "services", label: "Service Management", icon: ConciergeBell },
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

          {activeTab === "menu" && <ManageMealSettings />}

          {activeTab === "live" && (
            <div className="w-full flex items-center justify-center h-64 glass-panel rounded-2xl">
               <p className="text-[#737373] font-bold">Live Overview (Migration Pending)</p>
            </div>
          )}

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
