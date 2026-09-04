import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Globe,
  Shield,
  Settings2,
  Building2,
  Utensils,
  BedDouble,
  LayoutDashboard,
  FileTextIcon,
  UserCheck,
  QrCode,
  Fingerprint,
  ClipboardCheck,
  Layers,
  BookOpen,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import type { RootState } from '@/store';
import type { PlanFeature } from '@/store/slices/HostelSlice';

const EMPTY_PERMISSIONS: string[] = [];
const EMPTY_FEATURES: PlanFeature[] = [];

export function useNavigation() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { currentHostel } = useSelector((state: RootState) => state.hostel);

  const role = user?.role;
  const perms = user?.permissions || EMPTY_PERMISSIONS;
  const features: PlanFeature[] = currentHostel?.plan?.features || EMPTY_FEATURES;

  const hasFeature = (featureName: string): boolean => {
    const feature = features.find(
      (f) => f.name.toLowerCase().replace(/\s+/g, '_') === featureName
    );
    return feature?.isEnabled === true;
  };

  const GetPermittedAdminFeatures = (adminNav: any[]) => {
    // Safety guard: ensure the first item has an items array
    if (!adminNav[0]?.items) return;

    if (perms.includes('user_management')) {
      adminNav[0].items.push({ title: "Manage Users", url: "/app/users" });
    }

    if (role === 'manager' && hasFeature('residence_management')) {
      adminNav[0].items.push({ title: "My Room", url: "/app/my-room" });
    }

    if (perms.includes("residence_management") && perms.includes('service_management')) {
      adminNav.push({
        title: "Residence",
        icon: Building2,
        url: '#',
        items: [
          { title: 'Room Allocation', url: '/app/residence/allocation' },
          { title: 'Room Services', url: '/app/residence/services' }
        ]
      });
    } else if (perms.includes("residence_management")) {
      adminNav.push({
        title: "Residence",
        icon: Building2,
        url: '#',
        items: [{ title: 'Room Allocation', url: '/app/residence/allocation' }]
      });
    } else if (perms.includes("service_management")) {
      adminNav.push({
        title: "Residence",
        icon: Building2,
        url: '#',
        items: [{ title: 'Room Services', url: '/app/residence/services' }]
      });
    }

    if (perms.includes('meal_settings') && perms.includes('meal_control')) {
      adminNav.push({
        title: "Mess Meals & Schedule",
        icon: Utensils,
        url: '#',
        items: [
          { title: 'Manage Weekly Menu', url: '/app/meals/manage-schedule' },
          { title: 'Meal Control & Audit', url: '/app/meals/control' }
        ]
      });
    } else if (perms.includes("meal_settings")) {
      adminNav.push({
        title: "Mess Meals & Schedule",
        icon: Utensils,
        url: '#',
        items: [
          { title: 'Manage Weekly Menu', url: '/app/meals/manage-schedule' },
          { title: 'Meal Control & Audit', url: '/app/meals/control' }
        ]
      });
    } else if (perms.includes("meal_control")) {
      adminNav.push({
        title: "Mess Meals & Schedule",
        icon: Utensils,
        url: '#',
        items: [{ title: 'Meal Control & Audit', url: '/app/meals/control' }]
      });
    }

    if (perms.includes('bill_management') && perms.includes('bill_generation')) {
      adminNav.push({
        title: "Finance & Dues",
        icon: FileTextIcon,
        url: '#',
        items: [
          { title: 'Manage Hostel Dues', url: '/app/finance/bills' },
          { title: 'Generate Bills', url: '/app/finance/generate-bills' },
          { title: 'Edit Meal Prices', url: '/app/finance/meal-prices' }
        ]
      });
    } else if (perms.includes("bill_management")) {
      adminNav.push({
        title: "Finance & Dues",
        icon: FileTextIcon,
        url: '#',
        items: [{ title: 'Manage Hostel Dues', url: '/app/finance/bills' }]
      });
    } else if (perms.includes("bill_generation")) {
      adminNav.push({
        title: "Finance & Dues",
        icon: FileTextIcon,
        url: '#',
        items: [
          { title: 'Generate Bills', url: '/app/finance/generate-bills' },
          { title: 'Edit Meal Prices', url: '/app/finance/meal-prices' }
        ]
      });
    }

    if (perms.includes('complaint_management')) {
      adminNav[0].items.push({ title: "Complaints", url: "/app/complaints" });
    }

    // ── Attendance Methods: Group if 2+, single button if 1 ──
    const attendanceItems: { title: string; url: string; icon: any }[] = [];
    if (perms.includes("manual_attendance")) {
      attendanceItems.push({ title: "Manual Attendance", url: '/app/attendance/manual', icon: UserCheck });
    }
    if (perms.includes("qr_attendance")) {
      attendanceItems.push({ title: "QR Attendance", url: '/app/attendance/qr', icon: QrCode });
    }
    if (perms.includes("biometric_attendance")) {
      attendanceItems.push({ title: "Biometric Attendance", url: '/app/attendance/biometric', icon: Fingerprint });
    }

    if (attendanceItems.length >= 2) {
      adminNav.push({
        title: "Attendance",
        icon: ClipboardCheck,
        url: '#',
        items: attendanceItems.map(item => ({ title: item.title, url: item.url }))
      });
    } else if (attendanceItems.length === 1) {
      adminNav.push({
        title: attendanceItems[0].title,
        url: attendanceItems[0].url,
        icon: attendanceItems[0].icon,
      });
    }

    if (perms.includes("hostel_configuration")) {
      adminNav.push({ title: "Hostel Configuration", url: '/app/hostel-configuration', icon: Settings2 });
    }
  };

  const navMain = useMemo(() => {
    if (!role || !isAuthenticated) return [];

    // ── Superadmin ──────────────────────────────────────────────────────────
    if (role === 'superadmin') {
      return [
        {
          title: "Dashboard",
          url: "/app",
          icon: LayoutDashboard
        },
        {
          title: "Hostel Tenants",
          url: "/app/superadmin/hostels",
          icon: Building2
        },
        {
          title: "Subscription Plans",
          url: "/app/superadmin/plans",
          icon: Layers
        },
        {
          title: "Manage Users",
          url: "/app/users",
          icon: Shield
        },
      ];
    }

    // ── Admin ───────────────────────────────────────────────────────────────
    if (role === 'admin') {
      const adminNav: any[] = [
        {
          title: "Hostel Overview",
          icon: LayoutDashboard,
          isActive: true,
          items: [{ title: "Dashboard", url: "/app" }]
        }
      ];
      GetPermittedAdminFeatures(adminNav);
      return adminNav;
    }

    // ── Manager ─────────────────────────────────────────────────────────────
    if (role === 'manager') {
      const managerNav: any[] = [
        {
          title: "Hostel Overview",
          url: "#",
          icon: LayoutDashboard,
          isActive: true,
          items: [{ title: "Dashboard", url: "/app" }]
        }
      ];
      GetPermittedAdminFeatures(managerNav);
      return managerNav;
    }

    // ── Student ─────────────────────────────────────────────────────────────
    if (role === 'student') {
      // 1. Resident Standard Overview items
      const overviewItems: any[] = [{ title: "Dashboard", url: "/app" }];

      if (hasFeature('complaint_management')) {
        overviewItems.push({ title: "My Complaints", url: "/app/complaints" });
      }

      const studentNav: any[] = [
        {
          title: "My Overview",
          url: "#",
          icon: LayoutDashboard,
          isActive: true,
          items: overviewItems,
        }
      ];

      // 2. Student Resident Mess section
      if (hasFeature('meal_settings')) {
        const messItems: any[] = [
          { title: "Weekly Schedule", url: "/app/meals/schedule" },
          { title: "Meal History", url: "/app/meals/history" },
        ];
        if (hasFeature('qr_attendance')) {
          messItems.push({ title: "Mark Attendance", url: '/app/meals/qr' });
        }
        studentNav.push({ title: "Mess", icon: Utensils, items: messItems, isActive: true });
      } else if (hasFeature('qr_attendance')) {
        studentNav.push({
          title: "Attendance",
          icon: QrCode,
          items: [{ title: "Mark Attendance", url: '/app/meals/qr' }],
        });
      }

      // 3. Student Resident Room section
      if (hasFeature('residence_management')) {
        studentNav.push({
          title: "My Room",
          icon: BedDouble,
          url: "/app/my-room",
        });
      }
      if (hasFeature('bill_management')) {
        studentNav.push({
          title: "My Bills",
          icon: FileTextIcon,
          url: "/app/my-bills",
        });
      }

      // 4. Special Admin Features for Permitted Students (Separated Section!)
      const adminFeatureItems: { title: string; url: string }[] = [];

      if (perms.includes('user_management')) {
        adminFeatureItems.push({ title: "Manage Users", url: "/app/users" });
      }
      if (perms.includes('meal_settings')) {
        adminFeatureItems.push({ title: "Manage Weekly Menu", url: "/app/meals/manage-schedule" });
      }
      if (perms.includes('meal_control')) {
        adminFeatureItems.push({ title: "Meal Control & Audit", url: "/app/meals/control" });
      }
      if (perms.includes('residence_management')) {
        adminFeatureItems.push({ title: "Room Allocation", url: "/app/residence/allocation" });
      }
      if (perms.includes('service_management')) {
        adminFeatureItems.push({ title: "Room Services", url: "/app/residence/services" });
      }
      if (perms.includes('manual_attendance')) {
        adminFeatureItems.push({ title: "Manual Attendance", url: "/app/attendance/manual" });
      }
      if (perms.includes('qr_attendance')) {
        adminFeatureItems.push({ title: "QR Attendance", url: "/app/attendance/qr" });
      }
      if (perms.includes('biometric_attendance')) {
        adminFeatureItems.push({ title: "Biometric Attendance", url: "/app/attendance/biometric" });
      }
      if (perms.includes('bill_management')) {
        adminFeatureItems.push({ title: "Manage Hostel Dues", url: "/app/finance/bills" });
      }
      if (perms.includes('bill_generation')) {
        adminFeatureItems.push({ title: "Generate Bills", url: "/app/finance/generate-bills" });
        adminFeatureItems.push({ title: "Edit Meal Prices", url: "/app/finance/meal-prices" });
      }
      if (perms.includes('complaint_management')) {
        adminFeatureItems.push({ title: "All Complaints", url: "/app/complaints" });
      }
      if (perms.includes('hostel_configuration')) {
        adminFeatureItems.push({ title: "Hostel Configuration", url: "/app/hostel-configuration" });
      }

      if (adminFeatureItems.length > 0) {
        studentNav.push({
          title: "Admin Features",
          icon: Shield,
          isActive: false,
          items: adminFeatureItems,
        });
      }

      return studentNav;
    }

    return [];
  }, [role, isAuthenticated, features, perms]);

  const projects = [
    { name: "Landing Page", url: "/", icon: Globe },
    { name: "Documentation", url: "/docs", icon: BookOpen },
    { name: "Terms of Service", url: "/terms", icon: Scale },
    { name: "Privacy Policy", url: "/privacy", icon: ShieldCheck },
  ];

  return { navMain, projects };
}
