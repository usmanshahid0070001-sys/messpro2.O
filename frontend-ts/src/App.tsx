import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./features/app/AppLayout";
import Dashboard from "./features/app/Dashboard";
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

