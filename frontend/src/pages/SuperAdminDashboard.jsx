import {
  Globe,
  Building2,
  CreditCard,
  Settings,
  Link,
  ShieldCheck,
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
import PageHeader from "../components/shared/PageHeader";

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
    { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
    { id: "customization", label: "Platform Customization", icon: Settings },
    { id: "integrations", label: "Integrations", icon: Link },
    { id: "security", label: "Security & Audit", icon: ShieldCheck },
  ];

  const getHeaderContent = () => {
    switch (activeTab) {
      case "overview":
        return { title: "Global", highlightText: "Overview", subtitle: "Monitor the entire MessPro platform performance and revenue.", badgeText: "SuperAdmin Portal", icon: Globe };
      case "hostels":
        return { title: "Manage", highlightText: "Hostels", subtitle: "Onboard, suspend, or configure specific hostel tenants.", badgeText: "Tenant Operations", icon: Building2 };
      case "subscriptions":
        return { title: "Subscription", highlightText: "Packages", subtitle: "Configure pricing tiers and monitor tenant billing.", badgeText: "Financial Controls", icon: CreditCard };
      case "customization":
        return { title: "Platform", highlightText: "Customization", subtitle: "Manage white-labeling and global system features.", badgeText: "System Config", icon: Settings };
      case "integrations":
        return { title: "Third-Party", highlightText: "Integrations", subtitle: "Configure payment gateways, biometric devices, and external APIs.", badgeText: "API Management", icon: Link };
      case "security":
        return { title: "Security &", highlightText: "Audit", subtitle: "Review global audit logs and enforce platform security policies.", badgeText: "Compliance", icon: ShieldCheck };
      default:
        return { title: "SuperAdmin", highlightText: "Dashboard", subtitle: "Manage the MessPro multi-tenant platform.", badgeText: "SuperAdmin Portal", icon: Globe };
    }
  };

  const headerContent = getHeaderContent();

  return (
    <DashboardLayout
      userRole="superadmin"
      navItems={navItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <PageHeader 
        title={headerContent.title}
        highlightText={headerContent.highlightText}
        subtitle={headerContent.subtitle}
        badgeText={headerContent.badgeText}
        icon={headerContent.icon}
      />

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
          {activeTab === "subscriptions" && <ManageSubscriptions />}
          {activeTab === "customization" && <PlatformCustomization />}
          {activeTab === "integrations" && <Integrations />}
          {activeTab === "security" && <SecurityAudit />}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
