import React, { useState, useMemo } from 'react';
import { useUserUIStore } from '../../store/useUserUIStore';
import { useGetHostelDetails } from '../../hooks/queries/useUsers';
import { Search } from 'lucide-react'; // Ensure you import Search

// --- Custom Hook for DRY Search Logic ---
const useFilteredUsers = (users, searchQuery, sortOption = 'alphabetical') => {
  return useMemo(() => {
    if (!users) return [];
    
    // 1. Filter
    let result = users;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = users.filter(user => 
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.id?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
      );
    }
    
    // 2. Sort
    return [...result].sort((a, b) => {
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
  }, [users, searchQuery, sortOption]);
};

// --- Reusable UI Primitives ---
const SearchInput = ({ value, onChange, placeholder = "Search users by name, email, or ID..." }) => (
  <div className="relative w-full sm:w-[320px]">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Search className="h-4 w-4 text-[#a3a3a3] dark:text-[#666666]" />
    </div>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#0a0a0a] border border-[#e5e5e5] dark:border-[#222222] rounded-xl text-sm placeholder:text-[#a3a3a3] dark:placeholder:text-[#666666] text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] dark:focus:border-white dark:focus:ring-white transition-all shadow-sm"
    />
  </div>
);

const ROLE_STYLES = {
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  manager: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  student: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
};

const RoleBadge = ({ role }) => {
  const normalizedRole = role?.toLowerCase() || 'default';
  const styles = ROLE_STYLES[normalizedRole] || ROLE_STYLES.default;
  const displayText = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown';

  return (
    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold tracking-wide rounded-full ${styles}`}>
      {displayText}
    </span>
  );
};

// --- Shared Table Component ---
const UsersTable = ({ users }) => {
  const { openUpdateModal } = useUserUIStore();
  const [expandedUserId, setExpandedUserId] = useState(null);

  if (!users || users.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center border-t border-[#e5e5e5] dark:border-[#222222]">
        <Search className="w-8 h-8 text-[#d4d4d4] dark:text-[#333333] mb-3" />
        <p className="text-sm font-semibold text-[#111111] dark:text-white">No users found</p>
        <p className="text-xs text-[#737373] dark:text-[#a3a3a3] mt-1">Try adjusting your search query.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto [scrollbar-width:thin]">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-[#222222]">
        <thead className="bg-gray-50/50 dark:bg-[#111111]/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#737373] dark:text-[#a3a3a3] uppercase tracking-wider">User</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#737373] dark:text-[#a3a3a3] uppercase tracking-wider">Email</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#737373] dark:text-[#a3a3a3] uppercase tracking-wider">Role</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#737373] dark:text-[#a3a3a3] uppercase tracking-wider">Room</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-[#737373] dark:text-[#a3a3a3] uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-[#222222] bg-white dark:bg-transparent">
          {users.map((user) => {
            const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';
            const hasExtraInfo = user.additionalInfo && user.additionalInfo.length > 0;
            const isExpanded = expandedUserId === user._id;
            
            return (
              <React.Fragment key={user._id}>
              <tr className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-9 w-9 shrink-0 rounded-full bg-[#f1f5f9] dark:bg-[#1e293b] flex items-center justify-center">
                      <span className="text-[#334155] dark:text-[#cbd5e1] font-bold text-sm">
                        {initial}
                      </span>
                    </div>
                    <div className="ml-3 min-w-0">
                      <div className="text-sm font-semibold text-[#111111] dark:text-white truncate">{user.name || 'Unknown User'}</div>
                      {user.id && <div className="text-xs font-medium text-[#737373] dark:text-[#888888] truncate">{user.id}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#737373] dark:text-[#a3a3a3]">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#111111] dark:text-white">
                  {user.room?.roomName || <span className="text-[#a3a3a3] dark:text-[#666666] italic">Unassigned</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {hasExtraInfo && (
                    <button
                      onClick={() => setExpandedUserId(isExpanded ? null : user._id)}
                      className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-[#737373] bg-[#f5f5f5] border border-transparent rounded-md hover:bg-[#e5e5e5] hover:text-[#111] dark:bg-[#1a1a1a] dark:text-[#a3a3a3] dark:hover:bg-[#222] dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      {isExpanded ? 'Hide Details' : 'View Details'}
                    </button>
                  )}
                  <button
                    onClick={() => openUpdateModal(user)}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-[#111111] bg-white border border-[#d4d4d4] rounded-md hover:bg-[#f5f5f5] dark:bg-[#111111] dark:text-white dark:border-[#333333] dark:hover:bg-[#222222] transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    Edit
                  </button>
                </td>
              </tr>
              {isExpanded && hasExtraInfo && (
                <tr className="bg-[#fafafa] dark:bg-[#0a0a0a]">
                  <td colSpan="4" className="px-6 py-5 border-t-0">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                      {user.additionalInfo.map((info, idx) => (
                        <div key={idx}>
                          <p className="text-[10px] font-bold text-[#a3a3a3] dark:text-[#737373] uppercase tracking-wider mb-1">{info.key}</p>
                          <p className="text-sm font-semibold text-[#111111] dark:text-white">{info.value || '-'}</p>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// --- Superadmin View ---
export const SuperadminView = ({ users, sortOption }) => {
  const { data: hostelData, isLoading } = useGetHostelDetails('superadmin');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 1. Filter and sort global users
  const filteredUsers = useFilteredUsers(users, searchQuery, sortOption);

  // 2. Group the FILTERED users
  const groupedUsers = useMemo(() => {
    if (!filteredUsers) return {};

    const hostelMap = (hostelData || []).reduce((acc, hostel) => {
      acc[hostel._id] = hostel.name;
      return acc;
    }, {});

    return filteredUsers.reduce((acc, user) => {
      let groupName = 'Unassigned';
      if (user.hostelId) {
        groupName = hostelMap[user.hostelId] || (isLoading ? 'Loading Hostel...' : 'Unknown Hostel');
      }
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(user);
      return acc;
    }, {});
  }, [filteredUsers, hostelData, isLoading]);

  return (
    <div className="space-y-6">
      {/* Global Search Above All Hostels */}
      <div className="flex justify-end">
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
      </div>

      {Object.keys(groupedUsers).length === 0 && searchQuery && (
        <div className="p-8 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-[#e5e5e5] dark:border-[#222222] text-center">
          <p className="text-sm font-semibold text-[#111111] dark:text-white">No tenants match your search.</p>
        </div>
      )}

      {Object.entries(groupedUsers).map(([hostelName, hostelUsers]) => (
        <div key={hostelName} className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-sm border border-[#e5e5e5] dark:border-[#222222] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f0f0f0] dark:border-[#1a1a1a] bg-[#fafafa]/80 dark:bg-[#111111]/60 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111111] dark:text-white flex items-center gap-3">
              {hostelName}
              <span className="flex items-center justify-center px-2 py-0.5 bg-[#f5f5f5] dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#333333] rounded-full text-[11px] font-semibold text-[#737373] dark:text-[#a3a3a3]">
                {hostelUsers.length}
              </span>
            </h3>
          </div>
          <UsersTable users={hostelUsers} />
        </div>
      ))}
    </div>
  );
};

// --- Admin View ---
export const AdminView = ({ users, sortOption }) => {
  const [activeTab, setActiveTab] = useState('students');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 1. Filter and sort global users
  const filteredUsers = useFilteredUsers(users, searchQuery, sortOption);

  // 2. Separate into tabs using the filtered list
  const { managers, students } = useMemo(() => {
    return {
      managers: filteredUsers?.filter(u => u.role === 'manager') || [],
      students: filteredUsers?.filter(u => u.role === 'student') || [],
    };
  }, [filteredUsers]);

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-sm border border-[#e5e5e5] dark:border-[#222222] overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0f0f0] dark:border-[#1a1a1a] px-6 bg-[#fafafa]/80 dark:bg-[#111111]/60">
        
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {[
            { id: 'managers', label: 'Managers', count: managers.length },
            { id: 'students', label: 'Students', count: students.length }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-all duration-150 flex items-center gap-2 ${
                  isActive
                    ? 'border-[#111111] text-[#111111] dark:border-white dark:text-white'
                    : 'border-transparent text-[#737373] hover:text-[#111111] dark:text-[#888888] dark:hover:text-[#dddddd]'
                }`}
              >
                {tab.label}
                <span className={`py-0.5 px-2 rounded-full text-[11px] font-semibold transition-colors ${
                  isActive 
                    ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]' 
                    : 'bg-[#f5f5f5] text-[#737373] dark:bg-[#1a1a1a] dark:text-[#a3a3a3]'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
        
        {/* Search integrated cleanly next to tabs */}
        <div className="py-3 shrink-0">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search by name, email..." />
        </div>
      </div>
      <div>
        <UsersTable users={activeTab === 'managers' ? managers : students} />
      </div>
    </div>
  );
};

// --- Manager / Student View ---
export const FlatListView = ({ users, sortOption }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredUsers = useFilteredUsers(users, searchQuery, sortOption);

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-sm border border-[#e5e5e5] dark:border-[#222222] overflow-hidden flex flex-col">
      <div className="p-4 border-b border-[#f0f0f0] dark:border-[#1a1a1a] flex justify-end bg-[#fafafa]/80 dark:bg-[#111111]/60">
         <SearchInput value={searchQuery} onChange={setSearchQuery} />
      </div>
      <UsersTable users={filteredUsers} />
    </div>
  );
};