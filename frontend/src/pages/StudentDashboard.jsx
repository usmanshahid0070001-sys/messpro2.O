import { useState, useEffect } from "react";
import {
  Utensils,
  LayoutDashboard,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

// Feature Components
import WeeklyMealSelection from "../features/student/WeeklyMealSelection";
import StudentMealHistory from "../features/student/StudentMealHistory";

// Shared UI Components
import DashboardLayout from "../components/layout/DashboardLayout";

// Auth
import { useAuth } from "../context/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Extract tab from path
  const pathParts = location.pathname.split("/");
  const currentTab = pathParts[pathParts.length - 1];

  // 2. Default to "meals" if the student just lands on /student-dashboard
  const activeTab = (currentTab === "student-dashboard" || !currentTab) 
                    ? "meals" 
                    : currentTab;

  const setActiveTab = (tabId) => {
    navigate(`/student-dashboard/${tabId}`);
  };

  const navItems = [
    { id: "meals", label: "Meal Selection", icon: Utensils },
    { id: "history", label: "Meal History", icon: Clock },
  ];

  return (
    <DashboardLayout
      userRole="student"
      navItems={navItems}
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
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
