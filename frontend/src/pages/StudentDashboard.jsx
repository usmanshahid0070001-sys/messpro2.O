import { useState, useEffect } from "react";
import {
  Utensils,
  LayoutDashboard,
  Clock,
  CalendarDays,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

// Feature Components
import WeeklyMealSelection from "../features/student/WeeklyMealSelection";
import StudentMealHistory from "../features/student/StudentMealHistory";

// Shared UI Components (V1 Layout + Premium Theme)
import DashboardLayout from "../components/layout/DashboardLayout";
import PageHeader from "../components/shared/PageHeader";

// Auth
import { useAuth } from "../context/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth(); // Logout handles globally
  const [greeting, setGreeting] = useState("Welcome");
  const [currentDate, setCurrentDate] = useState("");
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

  // Set dynamic greeting and date
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const dateOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(new Date().toLocaleDateString("en-US", dateOptions));
  }, []);

  const navItems = [
    { id: "meals", label: "Meal Selection", icon: Utensils },
    { id: "history", label: "Meal History", icon: Clock },
  ];

  // The Live Date Card to be passed into the PageHeader (Upgraded with monochrome glassmorphism)
  const DateWidget = (
    <div className="flex items-center gap-3 bg-[#fafafa]/60 dark:bg-[#0a0a0a]/60 backdrop-blur-md p-3 rounded-2xl border border-[#e0e0e0] dark:border-[#222222] shadow-sm w-fit">
      <div className="w-10 h-10 bg-[#f5f5f5] dark:bg-[#111111] rounded-xl flex items-center justify-center shadow-inner text-[#404040] dark:text-[#888888]">
        <CalendarDays className="w-5 h-5" />
      </div>
      <div className="pr-2">
        <p className="text-[10px] font-black text-[#737373] dark:text-[#555555] uppercase tracking-[0.2em] mb-0.5">
          Today is
        </p>
        <p className="text-sm font-black text-[#171717] dark:text-white">
          {currentDate}
        </p>
      </div>
    </div>
  );

  return (
    <DashboardLayout
      userRole="student"
      navItems={navItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {/* 1. Unified Premium Header */}
      <PageHeader
        title={`${greeting},`}
        highlightText={user?.name || "Student"}
        subtitle={
          activeTab === "meals"
            ? "Plan your upcoming meals for the week and track your dining history all in one place."
            : "Review your past meal selections, cancellations, and billing history."
        }
        badgeText="Student Portal"
        icon={LayoutDashboard}
        rightWidget={DateWidget}
      />

      {/* 2. Main Content Area */}
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
