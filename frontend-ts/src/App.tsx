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
import MealPricesPage from "./features/Finance/MealPrices/MealPricesPage";
import BillGenerationPage from "./features/Finance/BillGeneration/BillGenerationPage";
import BillManagementPage from "./features/Finance/BillManagement/BillManagementPage";
import MyBillsPage from "./features/Finance/MyBills/MyBillsPage";
import { ThemeProvider } from "@/context/ThemeProvider";
import LoginForm from "./features/auth/LoginForm";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { PublicRoute } from "./features/auth/components/PublicRoute";
import { AuthSync } from "./features/auth/components/AuthSync";
import { Toaster } from "@/components/ui/sonner";
import { StorageWarningModal } from "@/components/StorageWarningModal";

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <StorageWarningModal />
      <BrowserRouter>
        <AuthSync>
          <Routes>
            {/* Public Routes (Accessible only if NOT logged in) */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginForm />} />
            </Route>

            {/* Protected Routes (Accessible only if logged in) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="hostel-configuration" element={<HostelConfiguration />} />
                <Route path="complaints" element={<ComplaintIndex />} />
                <Route path="residence/allocation" element={<RoomAllocation />} />
                <Route path="residence/services" element={<RoomService />} />
                <Route path="my-room" element={<MyRoom />} />
                <Route path="meals/schedule" element={<WeeklySchedule />} />
                <Route path="meals/manage-schedule" element={<ManageMealSchedule />} />
                <Route path="meals/history" element={<MealHistoryPage />} />
                <Route path="my-bills" element={<MyBillsPage />} />
                <Route path="finance/my-bills" element={<Navigate to="/app/my-bills" replace />} />
                <Route path="finance/bills" element={<BillManagementPage />} />
                <Route path="finance/manage-bills" element={<Navigate to="/app/finance/bills" replace />} />
                <Route path="finance/meal-prices" element={<MealPricesPage />} />
                <Route path="finance/generate-bills" element={<BillGenerationPage />} />
                <Route path="finance/bills/generate" element={<Navigate to="/app/finance/generate-bills" replace />} />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </AuthSync>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  );
};

export default App;

