import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import LoginForm from "./features/auth/LoginForm.jsx";
import ProtectedRoute from "./features/auth/ProtectedRoute.jsx";
import PublicRoute from "./features/auth/PublicRoute.jsx";

// Dashboard Layout
import DashboardLayout from "./components/layout/DashboardLayout.jsx";

// Tenant Dashboard Pages
import LandingPage from "./pages/LandingPage/index.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ManagerDashboard from "./pages/ManagerDashboard.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";

// SuperAdmin Dashboard
import SuperAdminDashboard from "./pages/SuperAdminDashboard.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ─── Public Marketing & Auth Routes ─────────────────────── */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          }
        />

        {/* ─── Protected Tenant Dashboard Routes ─────────────────── */}
        <Route
          path="/admin-dashboard/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/manager-dashboard/*"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/student-dashboard/*"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* ─── SuperAdmin Route ───────────────────────── */}
        <Route
          path="/super-admin/*"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ─── Fallback ───────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}