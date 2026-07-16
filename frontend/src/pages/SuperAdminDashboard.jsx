import {
  Globe,
  Building2,
  CreditCard,
  Settings,
  Link,
  ShieldCheck,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

// Feature Components
import GlobalOverview from "../features/superadmin/GlobalOverview";
import ManageTenants from "../features/superadmin/ManageTenants";
import ManageSubscriptions from "../features/superadmin/ManageSubscriptions";
import PlatformCustomization from "../features/superadmin/PlatformCustomization";
import Integrations from "../features/superadmin/Integrations";
import SecurityAudit from "../features/superadmin/SecurityAudit";

// Shared UI Components
import DashboardLayout from "../components/layout/DashboardLayout";
import ManageUsers from "../features/users/ManageUsers";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const pathParts = location.pathname.split("/");
  const currentTab = pathParts[pathParts.length - 1];

  const activeTab = (currentTab === "super-admin" || !currentTab) 
                    ? "overview" 
                    : currentTab;

  const setActiveTab = (tabId) => {
    navigate(`/super-admin/${tabId}`);
  };

  const navItems = [
    { id: "overview", label: "Global Overview", icon: Globe },
    { id: "hostels", label: "Manage Hostels", icon: Building2 },
    { id: "users", label: "Manage Users", icon: Users },
    { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
    { id: "customization", label: "Platform Customization", icon: Settings },
    { id: "integrations", label: "Integrations", icon: Link },
    { id: "security", label: "Security & Audit", icon: ShieldCheck },
  ];

  return (
    <DashboardLayout
      userRole="superadmin"
      navItems={navItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          {activeTab === "overview" && <GlobalOverview />}
          {activeTab === "hostels" && <ManageTenants />}
          {activeTab === "users" && <ManageUsers />}
          {activeTab === "subscriptions" && <ManageSubscriptions />}
          {activeTab === "customization" && <PlatformCustomization />}
          {activeTab === "integrations" && <Integrations />}
          {activeTab === "security" && <SecurityAudit />}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
