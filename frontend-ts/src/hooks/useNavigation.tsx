import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Globe,
  Shield,
  FileText,
  Settings2,
  Building2,
  Utensils,
  BedDouble,
  PieChart,
  LayoutDashboard,
  FileTextIcon,
  UserCheck,
  QrCode,
  Fingerprint,
  ClipboardCheck,
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
      adminNav[0].items.push({ title: "User Management", url: "/app/users" });
    }

    if (perms.includes("residence_management") && perms.includes('service_management')) {
      adminNav.push({
        title: "Residence",
        icon: Building2,
        url: '#',
        items: [
          { title: 'Room Allocation', url: '#' },
          { title: 'Room Services', url: '#' }
        ]
      });
    } else if (perms.includes("residence_management")) {
      adminNav.push({
        title: "Residence",
        icon: Building2,
        url: '#',
        items: [{ title: 'Room Allocation', url: '#' }]
      });
    }

    if (perms.includes('meal_settings') && perms.includes('meal_control')) {
      adminNav.push({
        title: "Mess Meals & Schedule",
        icon: Utensils,
        url: '#',
        items: [
          { title: 'Weekly Schedule', url: '#' },
          ...(role === 'manager' ? [{ title: "Meal Overview", url: '#' }] : []),
          { title: 'Meal Control', url: '#' }
        ]
      });
    } else if (perms.includes("meal_settings")) {
      adminNav.push({
        title: "Mess Meals & Schedule",
        icon: Utensils,
        url: '#',
        items: role === 'manager'
          ? [{ title: 'Weekly Schedule', url: '#' }, { title: 'Meal Overview', url: '#' }]
          : [{ title: 'Weekly Schedule', url: '#' }]
      });
    }

    if (perms.includes('bill_management') && perms.includes('bill_generation')) {
      adminNav.push({
        title: "Finance & Dues",
        icon: FileTextIcon,
        url: '#',
        items: [
          { title: 'Manage Hostel Dues', url: '#' },
          { title: 'Generate Bills', url: '#' }
        ]
      });
    } else if (perms.includes("bill_management")) {
      adminNav.push({ title: "Finance & Dues", icon: FileTextIcon, url: '#' });
    }

    if (perms.includes('complaint_management')) {
      adminNav[0].items.push({ title: "Complaints", url: "#" });
    }

    // ── Attendance Methods: Group if 2+, single button if 1 ──
    const attendanceItems: { title: string; url: string; icon: any }[] = [];
    if (perms.includes("manual_attendance")) {
      attendanceItems.push({ title: "Manual Attendance", url: '#', icon: UserCheck });
    }
    if (perms.includes("qr_attendance")) {
      attendanceItems.push({ title: "QR Attendance", url: '#', icon: QrCode });
    }
    if (perms.includes("biometric_attendance")) {
      attendanceItems.push({ title: "Biometric Attendance", url: '#', icon: Fingerprint });
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
          title: "System Overview",
          icon: PieChart,
          isActive: true,
          items: [
            { title: "Dashboard", url: "/app" },
            { title: "System Health", url: "/app/system-health" },
          ]
        },
        {
          title: "Manage Hostels",
          icon: Building2,
          isActive: true,
          items: [
            { title: "All Hostels", url: "#" },
            { title: "Hostel Users", url: "/app/users" },
          ],
        },
        {
          title: "Global Settings",
          url: "#",
          icon: Settings2,
          isActive: true,
          items: [{ title: "Manage Plans", url: "#" }]
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
      // Build overview items first so we can safely push into them
      const overviewItems: any[] = [{ title: "Dashboard", url: "/app" }];

      // Complaints live in the overview section for students
      if (hasFeature('complaint_management')) {
        overviewItems.push({ title: "My Complaints", url: "#" });
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

      // Mess section — driven by the hostel plan feature, not user permissions
      if (hasFeature('meal_settings')) {
        const messItems: any[] = [
          { title: "Weekly Schedule", url: "#" },
          { title: "Meal History", url: "#" },
        ];
        // Mark Attendance appears inside Mess when QR attendance is also enabled
        if (hasFeature('qr_attendance')) {
          messItems.push({ title: "Mark Attendance", url: '#' });
        }
        studentNav.push({ title: "Mess", icon: Utensils, items: messItems });
      } else if (hasFeature('qr_attendance')) {
        // Standalone attendance section when there's no mess feature
        studentNav.push({
          title: "Attendance",
          icon: QrCode,
          items: [{ title: "Mark Attendance", url: '#' }],
        });
      }

      // My Room — only when residence management is enabled for this hostel
      if (hasFeature('residence_management')) {
        studentNav.push({ title: "My Room", icon: BedDouble, url: '#' });
      }

      return studentNav;
    }

    return [];
  }, [role, isAuthenticated, features, perms]);

  const projects = [
    { name: "Landing Page", url: "https://messprouet.vercel.app", icon: Globe },
    { name: "Terms & Policy", url: "https://messprouet.vercel.app", icon: Shield },
    { name: "Legal Doc", url: "https://messprouet.vercel.app", icon: FileText },
  ];

  return { navMain, projects };
}
