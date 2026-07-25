import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, QrCode, Fingerprint, CalendarCheck } from 'lucide-react';
import { useMyHostel } from '../../hooks/queries/useHostelQueries';
import LoadingScreen from '../../components/ui/LoadingScreen';

import ManualAttendance from './ManualAttendance';
import QRAttendance from './QRAttendance';
import BiometricAttendance from './BiometricAttendance';

export default function AttendanceManagement() {
  const { data: hostelResponse, isLoading } = useMyHostel();
  const hostelData = hostelResponse?.data;
  
  const enabledFeatures = hostelData?.plan?.features || [];
  
  // Helper to check if a feature is enabled
  const hasFeature = (featureName) => {
    return enabledFeatures.some(f => f.name === featureName && f.isEnabled);
  };

  // We check for these features based on plan assumption
  const hasManual = hasFeature("Manual Attendance");
  const hasQR = hasFeature("QR Attendance");
  const hasBiometric = hasFeature("Biometric Attendance");

  const availableTabs = [
    hasManual && { id: 'manual', label: 'Manual', icon: UserCheck, component: <ManualAttendance /> },
    hasQR && { id: 'qr', label: 'QR Scan', icon: QrCode, component: <QRAttendance /> },
    hasBiometric && { id: 'biometric', label: 'Machine Sync', icon: Fingerprint, component: <BiometricAttendance /> },
  ].filter(Boolean);

  const [activeTab, setActiveTab] = useState(availableTabs[0]?.id || 'manual');

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
      <div className="w-full h-64 glass-panel rounded-2xl flex items-center justify-center">
        <p className="text-[#737373] font-bold">Attendance features are not enabled for your plan.</p>
      </div>
    );
  }

  const activeComponent = availableTabs.find(t => t.id === activeTab)?.component;

  return (
    <div className="space-y-6 p-2 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <CalendarCheck className="w-7 h-7 text-emerald-400" />
            Attendance Management
          </h1>
          <p className="text-gray-400 mt-1">Manage and track student attendance effectively.</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="glass-panel p-2 rounded-2xl border border-white/5 inline-flex flex-wrap gap-2">
        {availableTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 relative ${
                isActive 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeAttendanceTab"
                  className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10" />
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
