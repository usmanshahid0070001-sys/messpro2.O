import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./features/app/AppLayout";
import Dashboard from "./features/app/Dashboard";
import ManageUsers from "./features/managerUsers/ManageUsers";
import HostelConfiguration from "./features/hostel/HostelConfiguration";
import ComplaintIndex from "./features/complain/ComplaintIndex";
import RoomAllocation from "./features/Residence/RoomAllocation";
import RoomService from "./features/Residence/RoomService";
import MyRoom from "./features/Residence/MyRoom";
import WeeklySchedule from "./features/Mess/WeeklySchedule";
import ManageMealSchedule from "./features/Mess/ManageMealSchedule";
import MealHistoryPage from "./features/Mess/MealHistory/MealHistoryPage";
import MealControlPage from "./features/Mess/MealControl/MealControlPage";
import StudentAttendancePage from "./features/attendance/QR/StudentAttendancePage";
import QRAttendancePage from "./features/attendance/QR/QRAttendancePage";
import ManualAttendancePage from "./features/attendance/Manual/ManualAttendancePage";
import BiometricAttendancePage from "./features/attendance/Biometric/BiometricAttendancePage";
import MealPricesPage from "./features/Finance/MealPrices/MealPricesPage";
import BillGenerationPage from "./features/Finance/BillGeneration/BillGenerationPage";
import BillManagementPage from "./features/Finance/BillManagement/BillManagementPage";
import MyBillsPage from "./features/Finance/MyBills/MyBillsPage";
import ManageTenantsPage from "./features/superadmin/ManageTenantsPage";
import ManagePlansPage from "./features/superadmin/ManagePlansPage";
import { ThemeProvider } from "@/context/ThemeProvider";
import LoginForm from "./features/auth/LoginForm";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { PublicRoute } from "./features/auth/components/PublicRoute";
import { AuthSync } from "./features/auth/components/AuthSync";
import { Toaster } from "@/components/ui/sonner";
import { StorageWarningModal } from "@/components/StorageWarningModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const LandingPage = React.lazy(() => import("./features/landing/LandingPage"));
const TermsPage = React.lazy(() => import("./features/legal/TermsPage"));
const PrivacyPolicyPage = React.lazy(() => import("./features/legal/PrivacyPolicyPage"));
const DocumentationPage = React.lazy(() => import("./features/docs/DocumentationPage"));

const LandingRouteWrapper: React.FC = () => {
  // If running as an installed PWA (standalone display mode), launch directly into the app
  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://"));

  if (isStandalone) {
    return <Navigate to="/app" replace />;
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LandingPage />
    </Suspense>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <StorageWarningModal />
        <BrowserRouter>
          <AuthSync>
            <Routes>
              {/* Landing & Informational Public Routes */}
              <Route path="/" element={<LandingRouteWrapper />} />
              <Route path="/landing" element={<LandingRouteWrapper />} />
              <Route
                path="/terms"
                element={
                  <Suspense fallback={<div className="min-h-screen bg-background" />}>
                    <TermsPage />
                  </Suspense>
                }
              />
              <Route
                path="/privacy"
                element={
                  <Suspense fallback={<div className="min-h-screen bg-background" />}>
                    <PrivacyPolicyPage />
                  </Suspense>
                }
              />
              <Route
                path="/docs"
                element={
                  <Suspense fallback={<div className="min-h-screen bg-background" />}>
                    <DocumentationPage />
                  </Suspense>
                }
              />
              <Route path="/documentation" element={<Navigate to="/docs" replace />} />

              {/* Public Routes (Accessible only if NOT logged in) */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginForm />} />
              </Route>

              {/* Protected Routes (Accessible only if logged in) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/app" element={<AppLayout />}>
                  {/* General Authenticated Routes */}
                  <Route index element={<Dashboard />} />
                  <Route path="complaints" element={<ComplaintIndex />} />
                  <Route path="meals/schedule" element={<WeeklySchedule />} />
                  <Route path="meals/history" element={<MealHistoryPage />} />

                  {/* Staff / Admin / Management Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'manager']} />}>
                    {/* User Directory — Requires user_management */}
                    <Route element={<ProtectedRoute requiredPermission="user_management" />}>
                      <Route path="users" element={<ManageUsers />} />
                    </Route>

                    {/* Residence Management — Requires residence_management */}
                    <Route element={<ProtectedRoute requiredPermission="residence_management" requiredFeature="residence_management" />}>
                      <Route path="residence/allocation" element={<RoomAllocation />} />
                      <Route path="residence/services" element={<RoomService />} />
                    </Route>

                    {/* Dining Management */}
                    <Route path="meals/manage-schedule" element={<ManageMealSchedule />} />
                    <Route path="meals/control" element={<MealControlPage />} />
                    <Route path="meals/violations" element={<Navigate to="/app/meals/control" replace />} />
                    <Route path="meals/overview" element={<Navigate to="/app/meals/control" replace />} />

                    {/* Attendance Methods */}
                    <Route element={<ProtectedRoute requiredFeature="qr_attendance" />}>
                      <Route path="attendance/qr" element={<QRAttendancePage />} />
                    </Route>
                    <Route element={<ProtectedRoute requiredFeature="manual_attendance" />}>
                      <Route path="attendance/manual" element={<ManualAttendancePage />} />
                      <Route path="meals/manual-attendance" element={<Navigate to="/app/attendance/manual" replace />} />
                    </Route>
                    <Route element={<ProtectedRoute requiredFeature="biometric_attendance" />}>
                      <Route path="attendance/biometric" element={<BiometricAttendancePage />} />
                      <Route path="meals/biometric" element={<Navigate to="/app/attendance/biometric" replace />} />
                    </Route>

                    {/* Finance & Invoicing */}
                    <Route element={<ProtectedRoute requiredPermission="bill_management" requiredFeature="bill_management" />}>
                      <Route path="finance/bills" element={<BillManagementPage />} />
                      <Route path="finance/manage-bills" element={<Navigate to="/app/finance/bills" replace />} />
                    </Route>
                    <Route path="finance/meal-prices" element={<MealPricesPage />} />
                    <Route element={<ProtectedRoute requiredPermission="bill_generation" requiredFeature="bill_generation" />}>
                      <Route path="finance/generate-bills" element={<BillGenerationPage />} />
                      <Route path="finance/bills/generate" element={<Navigate to="/app/finance/generate-bills" replace />} />
                    </Route>
                  </Route>

                  {/* Hostel Administrator Configuration Only */}
                  <Route element={<ProtectedRoute allowedRoles={['admin']} requiredPermission="hostel_configuration" />}>
                    <Route path="hostel-configuration" element={<HostelConfiguration />} />
                  </Route>

                  {/* Resident / Student Accessible Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['student', 'manager', 'admin', 'superadmin']} />}>
                    <Route element={<ProtectedRoute requiredFeature="residence_management" />}>
                      <Route path="my-room" element={<MyRoom />} />
                    </Route>
                    <Route path="meals/qr" element={<StudentAttendancePage />} />
                    <Route path="meals/attendance" element={<Navigate to="/app/meals/qr" replace />} />
                    <Route path="attendance/mark" element={<Navigate to="/app/meals/qr" replace />} />
                    <Route path="my-bills" element={<MyBillsPage />} />
                    <Route path="finance/my-bills" element={<Navigate to="/app/my-bills" replace />} />
                  </Route>

                  {/* Superadmin Dedicated Governance Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
                    <Route path="superadmin/hostels" element={<ManageTenantsPage />} />
                    <Route path="superadmin/plans" element={<ManagePlansPage />} />
                  </Route>
                </Route>
              </Route>

              {/* Catch-all redirect to Landing Page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthSync>
        </BrowserRouter>
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
