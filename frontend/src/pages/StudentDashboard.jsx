import { useState, useEffect } from "react";
import {
  Utensils,
  LayoutDashboard,
  Clock,
  Home,
  Users,
  ConciergeBell,
  AlertTriangle,
  QrCode,
  Calculator
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

// Feature Components
import WeeklyMealSelection from "../features/student/WeeklyMealSelection";
import MealHistoryDashboard from "../features/mealHistory/MealHistoryDashboard";
import ManageUsers from "../features/users/ManageUsers";
import ManageRooms from "../features/residence/ManageRooms";
import ManageMealSettings from "../features/mealSetting/ManageMealSettings";
import LoadingScreen from "../components/ui/LoadingScreen";
import ServiceManagement from "../features/services/ServiceManagement";
import StudentComplaintForm from "../features/services/StudentComplaintForm";
import StudentQRAttendance from "../features/attendance/StudentQRAttendance";
import BillGeneration from "../features/billing/BillGeneration";

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
  let activeTab = (currentTab === "student-dashboard" || !currentTab) 
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

  if (isExpired && activeTab !== "dashboard") {
    activeTab = "dashboard";
  }

  // Helper to check permissions dynamically
  const hasPermission = (permName) => {
      // 1. Check if the hostel actually has this feature enabled
      const featureMap = {
        'service_management': ['Service Management', 'Room Service'],
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

      // 2. Fallback for old students with empty permissions
      if (user?.role === 'student' && (!user.permissions || user.permissions.length === 0)) {
         // Students historically never had any extra dashboard modules enabled by default.
         return false;
      }

      // 3. Strictly check student's granted permissions
      return user?.permissions?.includes(permName);
  };

  const hasService = hasPermission("service_management");
  const hasComplaint = hasPermission("complaint_management");
  const showServiceTab = hasService || hasComplaint;
  
  const canFileComplaint = enabledFeatures.some(f => f.name === "Complaint Management" && f.isEnabled);
  const hasQRAttendance = enabledFeatures.some(f => f.name === "QR Attendance" && f.isEnabled);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "meals", label: "Meal Selection", icon: Utensils }, // Default
    { id: "history", label: "Meal History", icon: Clock }, // Default (Dues/History)
    
    // Student can file complaints if hostel has the feature
    canFileComplaint && { id: "file-complaint", label: "File Complaint", icon: AlertTriangle },
    
    // QR Attendance if attendance feature is enabled
    hasQRAttendance && { id: "qr-attendance", label: "QR Attendance", icon: QrCode },
    
    // Conditionally added features based on permissions AND hostel plan
    hasPermission("meal_settings") && { id: "menu", label: "Meal Management", icon: Utensils },
    hasPermission("user_management") && { id: "users", label: "User Management", icon: Users },
    hasPermission("residence_management") && { id: "rooms", label: "Residence Management", icon: Home },
    showServiceTab && { id: "services", label: "Service Management", icon: ConciergeBell },
    hasPermission("bill_generation") && { id: "bills", label: "Bill Generation", icon: Calculator },
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
            <div className="w-full">
              <MealHistoryDashboard />
            </div>
          )}

          {/* ADDITIONAL PERMISSIONS */}
          {activeTab === "menu" && <ManageMealSettings />}

          {activeTab === "users" && <ManageUsers />}

          {activeTab === "rooms" && <ManageRooms />}

          {activeTab === "services" && <ServiceManagement />}

          {activeTab === "bills" && <BillGeneration />}

          {activeTab === "file-complaint" && <StudentComplaintForm />}

          {activeTab === "qr-attendance" && (
            <div className="w-full max-w-4xl mx-auto">
              <StudentQRAttendance />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
