import { useState, useMemo } from'react';
import { useAuth } from'../../context/AuthContext';
import { useGetTargettedUsers } from'../../hooks/queries/useUsers';
import { useUserUIStore } from'../../store/useUserUIStore';
import { SuperadminView, AdminView, FlatListView } from'./UserListViews';
import UserModal from'./UserModal';
import UserPermissionsModal from'./UserPermissionsModal';
import { ChevronDown, Download, Plus, ShieldAlert, Users } from'lucide-react';
import * as XLSX from'xlsx';

const ManageUsers = () => {
 const { role, user, isAuthenticated } = useAuth();
 const { data: users, isLoading, error } = useGetTargettedUsers();
 const { openCreateModal, isPermissionsModalOpen, closePermissionsModal, permissionsUser } = useUserUIStore();
 const [sortOption, setSortOption] = useState('alphabetical');

 // Check conditional access for Manager and Student
 const hasAccess = useMemo(() => {
 if (!isAuthenticated) return false;
 if (role ==='superadmin'|| role ==='admin') return true;
 if (role ==='manager'|| role ==='student') {
 const permissions = user?.permissions || [];
 return permissions.includes('user_management');
 }
 return false;
 }, [role, user, isAuthenticated]);

 if (!hasAccess) {
 return (
 <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center shadow-sm">
 <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-full mb-4">
 <ShieldAlert className="w-8 h-8"/>
 </div>
 <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Access Restricted</h2>
 <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">You do not have the required permissions to view the User Management module.</p>
 </div>
 );
 }

 if (isLoading) {
 return (
 <div className="space-y-6 w-full max-w-[1600px] mx-auto animate-pulse">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="space-y-3">
 <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-64"></div>
 <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-96 max-w-full"></div>
 </div>
 <div className="flex items-center gap-3 w-full sm:w-auto">
 <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-32"></div>
 <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-32"></div>
 </div>
 </div>

 <div>
 <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
 <div className="flex flex-col sm:flex-row gap-4 mb-6">
 <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full sm:w-64"></div>
 <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full sm:w-32"></div>
 </div>
 
 <div className="space-y-4">
 <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full"></div>
 {[1, 2, 3, 4, 5].map((i) => (
 <div key={i} className="h-[68px] bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full"></div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
 }

 if (error) {
 return (
 <div className="px-4 sm:px-6 lg:p-8 p-4">
 <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/30 flex items-center gap-3 text-sm font-medium">
 <ShieldAlert className="w-5 h-5"/>
 Error loading users. Please check your connection and try again.
 </div>
 </div>
 );
 }

 // Export users to CSV
 const handleExport = () => {
 if (!users || users.length === 0) return;

 const sortedUsers = [...users].sort((a, b) => {
 if (sortOption ==='alphabetical') {
 return (a.name ||'').localeCompare(b.name ||'');
 } else if (sortOption ==='room') {
 const roomA = a.room?.roomName ||'ZZZ';
 const roomB = b.room?.roomName ||'ZZZ';
 if (roomA !== roomB) return roomA.localeCompare(roomB);
 return (a.name ||'').localeCompare(b.name ||'');
 } else if (sortOption ==='newest') {
 return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
 }
 return 0;
 });

 const excelData = [];
 const headers = ['Name','Email','Role','Roll Number','Room'];

 const additionalKeys = new Set();
 sortedUsers.forEach(u => {
 if (Array.isArray(u.additionalInfo)) {
 u.additionalInfo.forEach(info => additionalKeys.add(info.key));
 }
 });

 const dynamicHeaders = Array.from(additionalKeys);

 sortedUsers.forEach(user => {
 const dynamicMap = {};
 if (Array.isArray(user.additionalInfo)) {
 user.additionalInfo.forEach(info => {
 dynamicMap[info.key] = info.value;
 });
 }

 const row = {
'Name': user.name ||'',
'Email': user.email ||'',
'Role': user.role ||'',
'Roll Number': user.id ||'',
'Room': user.room?.roomName ||'Unassigned'
 };

 dynamicHeaders.forEach(key => {
 row[key] = dynamicMap[key] ||'';
 });

 excelData.push(row);
 });

 const worksheet = XLSX.utils.json_to_sheet(excelData);
 const workbook = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(workbook, worksheet,"Users");
 XLSX.writeFile(workbook, `Users_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
 };

 // Render view based on role
 const renderView = () => {
 if (role ==='superadmin') {
 return <SuperadminView users={users} sortOption={sortOption} />;
 } else if (role ==='admin') {
 return <AdminView users={users} sortOption={sortOption} />;
 } else {
 // Manager or Student (with access)
 return <FlatListView users={users} sortOption={sortOption} />;
 }
 };

 return (
 <div>
 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5">
 <div>
 <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
 <Users className="w-6 h-6 text-zinc-500 dark:text-zinc-400"/>
 Manage Users
 </h1>
 <p className="mt-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400">
 View and manage {role ==='superadmin'?'admins and managers': role ==='admin'?'managers and students':'students'} across the platform.
 </p>
 </div>
 <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-3">
 <div className="relative">
 <select
 value={sortOption}
 onChange={(e) => setSortOption(e.target.value)}
 className="block w-full pl-3 pr-8 py-2 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 transition-all appearance-none shadow-sm cursor-pointer font-medium"
 >
 <option value="alphabetical">Alphabetical</option>
 <option value="room">By Room Number</option>
 <option value="newest">Recently Added</option>
 </select>
 <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"/>
 </div>
 <button
 onClick={handleExport}
 disabled={!users || users.length === 0}
 className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm text-sm font-medium text-zinc-900 dark:text-zinc-50 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <Download className="w-4 h-4"/>
 Export
 </button>
 <button
 onClick={openCreateModal}
 className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-zinc-100/20 transition-colors duration-150"
 >
 <Plus className="w-4 h-4"/>
 Create User
 </button>
 </div>
 </div>

 <div className="w-full">
 {renderView()}
 </div>

 {/* The Modal Component that reacts to Zustand state */}
 <UserModal />
 <UserPermissionsModal
 isOpen={isPermissionsModalOpen}
 onClose={closePermissionsModal}
 user={permissionsUser}
 />
 </div>
 );
};

export default ManageUsers;
