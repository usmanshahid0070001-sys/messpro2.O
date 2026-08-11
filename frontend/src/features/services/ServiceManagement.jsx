import React from'react';
import { ComplaintManagement } from'./ComplaintManagement';
import { CleaningManagement } from'./CleaningManagement';
import { useAuth } from'../../context/AuthContext';
import { useMyHostel } from'../../hooks/queries/useHostelQueries';
import { Wrench } from'lucide-react';

export const ServiceManagement = () => {
 const { user } = useAuth();
 const { data: hostelResponse } = useMyHostel();
 const enabledFeatures = hostelResponse?.data?.plan?.features || [];
 const userPermissions = user?.permissions || [];
 const userRole = user?.role ||'student'; // fallback

 const hasFeatureAndPermission = (featureName, requiredPermissionName) => {
 let isFeatureEnabled = false;
 if (featureName ==="Service Management") {
 isFeatureEnabled = enabledFeatures.some(f => (f.name ==="Service Management"|| f.name ==="Room Service") && f.isEnabled);
 } else {
 isFeatureEnabled = enabledFeatures.some(f => f.name === featureName && f.isEnabled);
 }

 if (userRole ==='admin'|| userRole ==='superadmin') return isFeatureEnabled;
 return isFeatureEnabled && userPermissions.includes(requiredPermissionName);
 };

 const showCleaning = hasFeatureAndPermission("Service Management","service_management");
 const showComplaints = hasFeatureAndPermission("Complaint Management","complaint_management");

 return (
 <div className="space-y-4 flex flex-col w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
 
 {/* Header */}
 <div>
 <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-3">
 <Wrench className="w-6 h-6 text-zinc-500 dark:text-zinc-400"/>
 Service Management
 </h1>
 <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
 {showCleaning && showComplaints 
 ?"Manage daily complaints and room cleaning schedules"
 : showCleaning 
 ?"Manage room cleaning schedules"
 :"Manage daily complaints"}
 </p>
 </div>

 {/* Main Content Area - Split Layout */}
 <div className="flex flex-col gap-8">
 
 {/* Top Half: Complaints */}
 {showComplaints && (
 <div className="w-full">
 <ComplaintManagement />
 </div>
 )}

 {/* Bottom Half: Cleaning */}
 {showCleaning && (
 <div className="w-full">
 <CleaningManagement />
 </div>
 )}
 </div>

 </div>
 );
};

export default ServiceManagement;
