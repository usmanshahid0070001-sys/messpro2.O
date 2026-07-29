import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, QrCode, Fingerprint, CalendarCheck } from 'lucide-react';
import { useMyHostel } from '../../hooks/queries/useHostelQueries';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../../components/ui/LoadingScreen';

import ManualAttendance from './ManualAttendance';
import QRAttendance from './QRAttendance';
import BiometricAttendance from './BiometricAttendance';

export default function AttendanceManagement() {
  const { data: hostelResponse, isLoading } = useMyHostel();
  const hostelData = hostelResponse?.data;
  
  const enabledFeatures = hostelData?.plan?.features || [];
  
  const { user } = useAuth();

  // Helper to check if a feature is enabled and the user has permission
  const hasPermission = (permName) => {
    // 1. Check if the hostel actually has this feature enabled
    const featureMap = {
      'manual_attendance': ['Manual Attendance'],
      'qr_attendance': ['QR Attendance'],
      'biometric_attendance': ['Biometric Attendance'],
    };
    
    const matchingFeatures = featureMap[permName] || [];
    const isFeatureEnabled = enabledFeatures.some(f => matchingFeatures.includes(f.name) && f.isEnabled);
    
    // If the hostel disabled it, nobody gets it!
    if (!isFeatureEnabled) return false;

    // 2. Fallbacks for old accounts with empty permissions
    if (user?.role === 'admin' && (!user.permissions || user.permissions.length === 0)) {
       return true; // Admins get whatever is enabled
    }
    
    if (user?.role === 'manager' && (!user.permissions || user.permissions.length === 0)) {
       return false; // Managers historically didn't get attendance by default unless explicitly granted
    }

    // 3. Strictly check granted permissions
    return user?.permissions?.includes(permName);
  };

  // Check BOTH hostel plan and user permission dynamically
  const hasManual = hasPermission("manual_attendance");
  const hasQR = hasPermission("qr_attendance");
  const hasBiometric = hasPermission("biometric_attendance");

  const availableTabs = [
    hasManual && { id: 'manual', label: 'Manual', icon: UserCheck, component: <ManualAttendance /> },
    hasQR && { id: 'qr', label: 'QR Scan', icon: QrCode, component: <QRAttendance /> },
    hasBiometric && { id: 'biometric', label: 'Machine Sync', icon: Fingerprint, component: <BiometricAttendance /> },
  ].filter(Boolean);

  const defaultTab = availableTabs.find(t => t.id === 'qr') ? 'qr' : availableTabs[0]?.id;
  const [activeTab, setActiveTab] = useState(defaultTab || 'manual');

  // If features load dynamically, ensure a valid tab is selected
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find(t => t.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, activeTab]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (availableTabs.length === 0) {
    return (
      <div className="w-full h-64 bg-white dark:bg-[#0a0a0a] border border-[#e5e5e5] dark:border-[#222222] rounded-2xl flex items-center justify-center">
        <p className="text-sm font-semibold text-[#737373] dark:text-[#a0a0a0]">Attendance features are not enabled for your plan.</p>
      </div>
    );
  }

  const activeComponent = availableTabs.find(t => t.id === activeTab)?.component;

  return (
    <div className="space-y-6 p-4 lg:p-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#111111] dark:text-white flex items-center gap-3">
            <CalendarCheck className="w-6 h-6 text-[#737373] dark:text-[#a3a3a3]" />
            Attendance Management
          </h1>
          <p className="mt-1 text-sm font-medium text-[#737373] dark:text-[#a0a0a0]">Manage and track student attendance effectively.</p>
        </div>
      </div>

      {/* Tabs Navigation (Segmented Control) */}
      <div className="inline-flex p-1 bg-[#f5f5f5] dark:bg-[#111111] rounded-xl border border-[#e5e5e5] dark:border-[#222222] overflow-x-auto w-full sm:w-auto snap-x">
        {availableTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 snap-start shrink-0 min-w-[120px] ${
                isActive 
                  ? 'text-[#111111] dark:text-white' 
                  : 'text-[#737373] dark:text-[#888888] hover:text-[#111111] dark:hover:text-[#dddddd]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeAttendanceTab"
                  className="absolute inset-0 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm border border-[#e5e5e5] dark:border-[#333333]"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <Icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeComponent}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
