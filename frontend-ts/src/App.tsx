import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./features/app/AppLayout";
import { ThemeProvider } from "@/context/ThemeProvider";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { PublicRoute } from "./features/auth/components/PublicRoute";
import { AuthSync } from "./features/auth/components/AuthSync";
import { Toaster } from "@/components/ui/sonner";
import { StorageWarningModal } from "@/components/StorageWarningModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Route-based Code Splitting (Lazy-loaded per Section 8 of AGENTS.md)
const LoginForm = React.lazy(() => import("./features/auth/LoginForm"));
const Dashboard = React.lazy(() => import("./features/app/Dashboard"));
const ManageUsers = React.lazy(() => import("./features/managerUsers/ManageUsers"));
const HostelConfiguration = React.lazy(() => import("./features/hostel/HostelConfiguration"));
const ComplaintIndex = React.lazy(() => import("./features/complain/ComplaintIndex"));
const RoomAllocation = React.lazy(() => import("./features/Residence/RoomAllocation"));
const RoomService = React.lazy(() => import("./features/Residence/RoomService"));
const MyRoom = React.lazy(() => import("./features/Residence/MyRoom"));
const WeeklySchedule = React.lazy(() => import("./features/Mess/WeeklySchedule"));
const ManageMealSchedule = React.lazy(() => import("./features/Mess/ManageMealSchedule"));
const MealHistoryPage = React.lazy(() => import("./features/Mess/MealHistory/MealHistoryPage"));
const MealControlPage = React.lazy(() => import("./features/Mess/MealControl/MealControlPage"));
const StudentAttendancePage = React.lazy(() => import("./features/attendance/QR/StudentAttendancePage"));
const QRAttendancePage = React.lazy(() => import("./features/attendance/QR/QRAttendancePage"));
const ManualAttendancePage = React.lazy(() => import("./features/attendance/Manual/ManualAttendancePage"));
const BiometricAttendancePage = React.lazy(() => import("./features/attendance/Biometric/BiometricAttendancePage"));
const MealPricesPage = React.lazy(() => import("./features/Finance/MealPrices/MealPricesPage"));
const BillGenerationPage = React.lazy(() => import("./features/Finance/BillGeneration/BillGenerationPage"));
const BillManagementPage = React.lazy(() => import("./features/Finance/BillManagement/BillManagementPage"));
const MyBillsPage = React.lazy(() => import("./features/Finance/MyBills/MyBillsPage"));
const ManageTenantsPage = React.lazy(() => import("./features/superadmin/ManageTenantsPage"));
const ManagePlansPage = React.lazy(() => import("./features/superadmin/ManagePlansPage"));
const HostelRequestsPage = React.lazy(() => import("./features/superadmin/HostelRequestsPage"));
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
                <Route
                  path="/login"
                  element={
                    <Suspense fallback={<div className="min-h-screen bg-background" />}>
                      <LoginForm />
                    </Suspense>
                  }
                />
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
                    <Route path="superadmin/requests" element={<HostelRequestsPage />} />
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
