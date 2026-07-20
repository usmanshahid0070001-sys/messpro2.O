import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGetTargettedUsers } from '../../hooks/queries/useUsers';
import { useUserUIStore } from '../../store/useUserUIStore';
import { SuperadminView, AdminView, FlatListView } from './UserListViews';
import UserModal from './UserModal';
import { ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';

const ManageUsers = () => {
  const { role, user, isAuthenticated } = useAuth();
  const { data: users, isLoading, error } = useGetTargettedUsers();
  const { openCreateModal } = useUserUIStore();
  const [sortOption, setSortOption] = useState('alphabetical');

  // Check conditional access for Student
  const hasAccess = useMemo(() => {
    if (!isAuthenticated) return false;
    if (role === 'superadmin' || role === 'admin' || role === 'manager') return true;
    if (role === 'student') {
      // Assuming additionalFunctionality is a string that might contain "user management"
      const functionality = user?.additionalFunctionality || '';
      return functionality.toLowerCase().includes('user management');
    }
    return false;
  }, [role, user, isAuthenticated]);

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50/50 rounded-3xl border border-gray-100 p-8 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 max-w-md">You do not have the required permissions to view the User Management module.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5">
          <div>
            <div className="h-8 bg-gray-200 dark:bg-[#222] rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-[#222] rounded w-64"></div>
          </div>
          <div className="mt-4 sm:mt-0 h-10 bg-gray-200 dark:bg-[#222] rounded-lg w-32"></div>
        </div>
        <div className="card p-6">
          <div className="space-y-4">
            <div className="h-10 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg w-full"></div>
            <div className="h-10 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg w-full"></div>
            <div className="h-10 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
          Error loading users. Please try again.
        </div>
      </div>
    );
  }

  // Export users to CSV
  const handleExport = () => {
    if (!users || users.length === 0) return;

    const sortedUsers = [...users].sort((a, b) => {
      if (sortOption === 'alphabetical') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sortOption === 'room') {
        const roomA = a.room?.roomName || 'ZZZ';
        const roomB = b.room?.roomName || 'ZZZ';
        if (roomA !== roomB) return roomA.localeCompare(roomB);
        return (a.name || '').localeCompare(b.name || '');
      } else if (sortOption === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      return 0;
    });

    const excelData = [];
    const headers = ['Name', 'Email', 'Role', 'Roll Number', 'Room'];

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
        'Name': user.name || '',
        'Email': user.email || '',
        'Role': user.role || '',
        'Roll Number': user.id || '',
        'Room': user.room?.roomName || 'Unassigned'
      };

      dynamicHeaders.forEach(key => {
        row[key] = dynamicMap[key] || '';
      });
      
      excelData.push(row);
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, `Users_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Render view based on role
  const renderView = () => {
    if (role === 'superadmin') {
      return <SuperadminView users={users} sortOption={sortOption} />;
    } else if (role === 'admin') {
      return <AdminView users={users} sortOption={sortOption} />;
    } else {
      // Manager or Student (with access)
      return <FlatListView users={users} sortOption={sortOption} />;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Manage Users</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage {role === 'superadmin' ? 'admins and managers' : role === 'admin' ? 'managers and students' : 'students'} across the platform.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-3">
          <div className="relative">
             <select 
               value={sortOption}
               onChange={(e) => setSortOption(e.target.value)}
               className="block w-full pl-3 pr-8 py-2 bg-white dark:bg-[#111] border border-[#e5e5e5] dark:border-[#222] rounded-lg text-sm text-[#111] dark:text-white focus:outline-none focus:ring-1 focus:border-[#111] focus:ring-[#111] dark:focus:border-white dark:focus:ring-white appearance-none shadow-sm cursor-pointer font-semibold transition-all"
             >
               <option value="alphabetical">Alphabetical</option>
               <option value="room">By Room Number</option>
               <option value="newest">Recently Added</option>
             </select>
             <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a3a3a3] pointer-events-none" />
          </div>
          <button
            onClick={handleExport}
            disabled={!users || users.length === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-[#333] rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-[#222] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Excel
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors duration-150"
          >
            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create User
          </button>
        </div>
      </div>

      <div className="w-full">
        {renderView()}
      </div>

      {/* The Modal Component that reacts to Zustand state */}
      <UserModal />
    </div>
  );
};

export default ManageUsers;
