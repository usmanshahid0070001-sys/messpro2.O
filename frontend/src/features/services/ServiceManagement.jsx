import React, { useState, useMemo } from 'react';
import { ComplaintManagement } from './ComplaintManagement';
import { CleaningManagement } from './CleaningManagement';
import { mockComplaintsData, mockCleaningData, mockRooms } from './mockData';
import { useAuth } from '../../context/AuthContext';
import { useMyHostel } from '../../hooks/queries/useHostelQueries';

export const ServiceManagement = () => {
  const { user } = useAuth();
  const { data: hostelResponse } = useMyHostel();
  const enabledFeatures = hostelResponse?.data?.plan?.features || [];
  const userPermissions = user?.permissions || [];
  const userRole = user?.role || 'student'; // fallback

  const hasFeatureAndPermission = (featureName, requiredPermissionName) => {
    let isFeatureEnabled = false;
    if (featureName === "Service Management") {
      isFeatureEnabled = enabledFeatures.some(f => (f.name === "Service Management" || f.name === "Room Service") && f.isEnabled);
    } else {
      isFeatureEnabled = enabledFeatures.some(f => f.name === featureName && f.isEnabled);
    }

    if (userRole === 'admin' || userRole === 'superadmin') return isFeatureEnabled;
    return isFeatureEnabled && userPermissions.includes(requiredPermissionName);
  };

  const showCleaning = hasFeatureAndPermission("Service Management", "service_management");
  const showComplaints = hasFeatureAndPermission("Complaint Management", "complaint_management");
  const [complaints, setComplaints] = useState(mockComplaintsData);
  const [cleaningData, setCleaningData] = useState(mockCleaningData);

  // Cross-link logic happens naturally here as both states are managed at this level.
  // The child components receive the states and filter based on 'roomId' and 'status'.
  
  const handleUpdateComplaintStatus = (id, newStatus) => {
    setComplaints(prev => 
      prev.map(c => c.id === id ? { ...c, status: newStatus } : c)
    );
  };

  return (
    <div className="space-y-4 flex flex-col w-full animate-in fade-in slide-in-from-bottom-2 duration-300 p-2 lg:p-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#111111] dark:text-white tracking-tight">Service Management</h1>
        <p className="text-sm font-semibold text-[#737373] dark:text-[#888888] mt-1">
          {showCleaning && showComplaints 
            ? "Manage daily complaints and room cleaning schedules"
            : showCleaning 
            ? "Manage room cleaning schedules" 
            : "Manage daily complaints"}
        </p>
      </div>

      {/* Main Content Area - Split Layout */}
      <div className="flex flex-col gap-8">
        
        {/* Top Half: Complaints */}
        {showComplaints && (
          <div className="w-full">
            <ComplaintManagement 
              complaints={complaints} 
              onUpdateStatus={handleUpdateComplaintStatus} 
            />
          </div>
        )}

        {/* Bottom Half: Cleaning */}
        {showCleaning && (
          <div className="w-full">
            <CleaningManagement 
              rooms={mockRooms} 
              cleaningData={cleaningData} 
              complaints={complaints} 
            />
          </div>
        )}
      </div>

    </div>
  );
};

export default ServiceManagement;
