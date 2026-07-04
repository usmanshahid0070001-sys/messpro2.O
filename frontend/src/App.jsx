import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import LoginForm from "./features/auth/LoginForm.jsx";
import ProtectedRoute from "./features/auth/ProtectedRoute.jsx";
import PublicRoute from "./features/auth/PublicRoute.jsx";

// Tenant Dashboard Pages
import LandingPage from "./pages/LandingPage/index.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ManagerDashboard from "./pages/ManagerDashboard.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";

// SuperAdmin (existing)
import SuperAdminLayout from "./components/layout/SuperAdminLayout.jsx";
import GlobalDashboard from "./pages/SuperAdmin/GlobalDashboard.jsx";
import TenantManagement from "./pages/SuperAdmin/TenantManagement.jsx";
import SubscriptionPackages from "./pages/SuperAdmin/SubscriptionPackages.jsx";
import CustomizationMatrix from "./pages/SuperAdmin/CustomizationMatrix.jsx";
import ThirdPartyIntegrations from "./pages/SuperAdmin/ThirdPartyIntegrations.jsx";
import SecurityControls from "./pages/SuperAdmin/SecurityControls.jsx";

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

        {/* ─── SuperAdmin Routes (existing) ───────────────────────── */}
        <Route
          path="/super-admin"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<GlobalDashboard />} />
          <Route path="hostels" element={<TenantManagement />} />
          <Route path="subscriptions" element={<SubscriptionPackages />} />
          <Route path="customization" element={<CustomizationMatrix />} />
          <Route path="integrations" element={<ThirdPartyIntegrations />} />
          <Route path="security" element={<SecurityControls />} />
        </Route>

        {/* ─── Fallback ───────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}