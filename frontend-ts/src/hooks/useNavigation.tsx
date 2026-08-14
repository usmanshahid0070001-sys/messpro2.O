import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Globe,
  Shield,
  FileText,
  Settings2,
  SquareTerminal,
  Building,
  Users,
  Utensils,
  MessageSquareWarning,
  BedDouble,
  DollarSign,
  PieChart
} from 'lucide-react';
import type { RootState } from '@/store';
import { url } from 'zod';

const EMPTY_ARRAY: string[] = [];

export function useNavigation() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { currentHostel } = useSelector((state: RootState) => state.hostel);

  const role = user?.role;
  const permissions = user?.permissions;
  const features = currentHostel?.features || EMPTY_ARRAY;

  const navMain = useMemo(() => {
    if (!role || !isAuthenticated) return [];

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
          icon: Building,
          isActive: true,
          items: [
            { title: "All Hostels", url: "#" },
            { title: "Hostel Users", url: "#" },
          ],
        },
        {
          title: "Global Settings",
          url: "#",
          icon: Settings2,
          isActive: true,
          items: [
            { title: "Manage Plans", url: "#" }
          ]
        },
      ];
    }

    if (role === 'admin') {
      const perms = permissions || EMPTY_ARRAY;

      const adminNav: any[] = [
        {
          title: "Dashboard",
          url: "/app",
          icon: SquareTerminal,
          isActive: true,
        }
      ];

      if (perms.includes('residents') || perms.includes('user_management')) {
        adminNav.push({
          title: "Residents",
          url: "#",
          icon: Users,
        });
      }

      if (perms.includes('rooms') || perms.includes('room_management')) {
        adminNav.push({
          title: "Rooms",
          url: "#",
          icon: BedDouble,
        });
      }

      // Conditionally add features if they exist for this hostel AND user has permission
      if (features.includes('mess') && (perms.includes('mess') || perms.includes('mess_management'))) {
        adminNav.push({
          title: "Mess Management",
          url: "#",
          icon: Utensils,
        });
      }

      if (features.includes('complaints') && (perms.includes('complaints') || perms.includes('complaint_management'))) {
        adminNav.push({
          title: "Complaints",
          url: "#",
          icon: MessageSquareWarning,
        });
      }

      if (features.includes('billing') && (perms.includes('billing') || perms.includes('billing_management'))) {
        adminNav.push({
          title: "Billing",
          url: "#",
          icon: DollarSign,
        });
      }

      if (perms.includes('settings') || perms.includes('hostel_settings')) {
        adminNav.push({
          title: "Hostel Settings",
          url: "#",
          icon: Settings2,
        });
      }

      return adminNav;
    }

    if (role === 'student') {
      const studentNav: any[] = [
        {
          title: "My Room",
          url: "#",
          icon: BedDouble,
          isActive: true,
        }
      ];

      if (features.includes('mess')) {
        studentNav.push({
          title: "Mess Menu",
          url: "#",
          icon: Utensils,
        });
      }

      if (features.includes('complaints')) {
        studentNav.push({
          title: "My Complaints",
          url: "#",
          icon: MessageSquareWarning,
        });
      }
      
      if (features.includes('billing')) {
        studentNav.push({
          title: "My Bills",
          url: "#",
          icon: DollarSign,
        });
      }

      return studentNav;
    }

    return [];
  }, [role, features, permissions]);

  const projects = [
    { name: "Landing Page", url: "https://messprouet.vercel.app", icon: Globe },
    { name: "Terms & Policy", url: "https://messprouet.vercel.app", icon: Shield },
    { name: "Legal Doc", url: "https://messprouet.vercel.app", icon: FileText },
  ];

  return { navMain, projects };
}
