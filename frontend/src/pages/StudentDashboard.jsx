import { useState, useEffect } from "react";
import {
  Utensils,
  LayoutDashboard,
  Clock,
  Home,
  Users,
  ConciergeBell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

// Feature Components
import WeeklyMealSelection from "../features/student/WeeklyMealSelection";
import StudentMealHistory from "../features/student/StudentMealHistory";
import ManageUsers from "../features/users/ManageUsers";
import ManageRooms from "../features/residence/ManageRooms";
import ManageMealSettings from "../features/mealSetting/ManageMealSettings";
import LoadingScreen from "../components/ui/LoadingScreen";

// Shared UI Components
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardOverview from "../components/shared/DashboardOverview";

// Auth
import { useAuth } from "../context/AuthContext";
import { useMyHostel } from "../hooks/queries/useHostelQueries";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Extract tab from path
  const pathParts = location.pathname.split("/");
  const currentTab = pathParts[pathParts.length - 1];

  // 2. Default to "dashboard" if the student just lands on /student-dashboard
  const activeTab = (currentTab === "student-dashboard" || !currentTab) 
                    ? "dashboard" 
                    : currentTab;

  const setActiveTab = (tabId) => {
    navigate(`/student-dashboard/${tabId}`);
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

  // Helper: true if feature is in hostel plan AND user has permission (unless it's a default)
  const hasFeatureAndPermission = (featureName, requiredPermissionName) => {
    let isFeatureEnabled = false;
    
    // Fallbacks for older databases that still use 'Room Service'
    if (featureName === "Service Management" || featureName === "Residence Management") {
      isFeatureEnabled = enabledFeatures.some(f => (f.name === featureName || f.name === "Room Service") && f.isEnabled);
    } else {
      isFeatureEnabled = enabledFeatures.some(f => f.name === featureName && f.isEnabled);
    }

    const hasPermission = userPermissions.includes(requiredPermissionName);
    return isFeatureEnabled && hasPermission;
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "meals", label: "Meal Selection", icon: Utensils }, // Default
    { id: "history", label: "Meal History", icon: Clock }, // Default (Dues/History)
    
    // Conditionally added features based on permissions AND hostel plan
    hasFeatureAndPermission("Meal settings", "meal_settings") && { id: "menu", label: "Meal Management", icon: Utensils },
    hasFeatureAndPermission("User Management", "user_management") && { id: "users", label: "User Management", icon: Users },
    hasFeatureAndPermission("Residence Management", "residence_management") && { id: "rooms", label: "Residence Management", icon: Home },
    hasFeatureAndPermission("Service Management", "service_management") && { id: "services", label: "Service Management", icon: ConciergeBell },
  ].filter(Boolean);

  const filteredNavItems = isExpired 
    ? navItems.filter(item => item.id === "dashboard")
    : navItems;

  return (
    <DashboardLayout
      userRole="student"
      navItems={filteredNavItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* TAB 0: DASHBOARD */}
          {activeTab === "dashboard" && (
            <DashboardOverview userRole="student" user={user} navItems={filteredNavItems} setActiveTab={setActiveTab} />
          )}

          {/* TAB 1: MEAL SELECTION */}
          {activeTab === "meals" && (
            <div className="flex flex-col xl:flex-row gap-6 items-start">
              <div className="flex-[2] w-full min-w-0">
                <WeeklyMealSelection />
              </div>
            </div>
          )}

          {/* TAB 2: HISTORY */}
          {activeTab === "history" && (
            <div className="w-full max-w-4xl mx-auto">
              <StudentMealHistory />
            </div>
          )}

          {/* ADDITIONAL PERMISSIONS */}
          {activeTab === "menu" && <ManageMealSettings />}

          {activeTab === "users" && <ManageUsers />}

          {activeTab === "rooms" && <ManageRooms />}

          {activeTab === "services" && (
            <div className="w-full flex items-center justify-center h-64 glass-panel rounded-2xl">
               <p className="text-[#737373] font-bold">Service Management (Migration Pending)</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
