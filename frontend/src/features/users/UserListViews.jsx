import React, { useState, useMemo } from'react';
import { useUserUIStore } from'../../store/useUserUIStore';
import { useGetHostelDetails } from'../../hooks/queries/useUsers';
import { Search } from'lucide-react';

// --- Custom Hook for DRY Search Logic ---
const useFilteredUsers = (users, searchQuery, sortOption ='alphabetical') => {
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
 }, [users, searchQuery, sortOption]);
};

// --- Reusable UI Primitives ---
const SearchInput = ({ value, onChange, placeholder ="Search users by name, email, or ID..."}) => (
 <div className="relative w-full sm:w-[320px]">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <Search className="h-4 w-4 text-zinc-400 dark:text-zinc-500"/>
 </div>
 <input
 type="text"
 placeholder={placeholder}
 value={value}
 onChange={(e) => onChange(e.target.value)}
 className="block w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:focus:border-zinc-50 dark:focus:ring-zinc-50 transition-all shadow-sm"
 />
 </div>
);

const ROLE_STYLES = {
 admin:'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20 dark:bg-purple-900/20 dark:text-purple-300 dark:ring-purple-500/30',
 manager:'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-500/30',
 student:'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-500/30',
 default:'bg-zinc-50 text-zinc-700 ring-1 ring-inset ring-zinc-600/20 dark:bg-zinc-900/30 dark:text-zinc-300 dark:ring-zinc-500/30'
};

const RoleBadge = ({ role }) => {
 const normalizedRole = role?.toLowerCase() ||'default';
 const styles = ROLE_STYLES[normalizedRole] || ROLE_STYLES.default;
 const displayText = role ? role.charAt(0).toUpperCase() + role.slice(1) :'Unknown';

 return (
 <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${styles}`}>
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
 <div className="p-16 flex flex-col items-center justify-center text-center border-t border-zinc-200 dark:border-zinc-800">
 <div className="bg-zinc-100 dark:bg-zinc-900/50 p-4 rounded-full mb-4">
 <Search className="w-6 h-6 text-zinc-500 dark:text-zinc-400"/>
 </div>
 <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">No users found</p>
 <p className="text-sm text-zinc-500 dark:text-zinc-400">We couldn't find any users matching your criteria.</p>
 </div>
 );
 }

 return (
 <div className="overflow-x-auto [scrollbar-width:thin]">
 <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
 <thead className="bg-zinc-50/50 dark:bg-zinc-900/50">
 <tr>
 <th scope="col"className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">User</th>
 <th scope="col"className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Email</th>
 <th scope="col"className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Role</th>
 <th scope="col"className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Room</th>
 <th scope="col"className="px-6 py-3 text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-transparent">
 {users.map((user) => {
 const initial = user?.name ? user.name.charAt(0).toUpperCase() :'?';
 const hasExtraInfo = user.additionalInfo && user.additionalInfo.length > 0;
 const isExpanded = expandedUserId === user._id;
 
 return (
 <React.Fragment key={user._id}>
 <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors duration-150">
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="flex items-center">
 <div className="h-9 w-9 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
 <span className="text-zinc-600 dark:text-zinc-300 font-medium text-sm">
 {initial}
 </span>
 </div>
 <div className="ml-3 min-w-0">
 <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">{user.name ||'Unknown User'}</div>
 {user.id && <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">{user.id}</div>}
 </div>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-500 dark:text-zinc-400">
 {user.email}
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <RoleBadge role={user.role} />
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-50">
 {user.room?.roomName || <span className="text-zinc-400 dark:text-zinc-500 italic">Unassigned</span>}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
 {hasExtraInfo && (
 <button
 onClick={() => setExpandedUserId(isExpanded ? null : user._id)}
 className="inline-flex items-center justify-center px-3 py-1.5 text-[13px] font-medium text-zinc-600 bg-zinc-100 border border-transparent rounded-md hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-zinc-50/20"
 >
 {isExpanded ?'Hide Details':'View Details'}
 </button>
 )}
 <button
 onClick={() => openUpdateModal(user)}
 className="inline-flex items-center justify-center px-3 py-1.5 text-[13px] font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md shadow-sm hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-zinc-50/20"
 >
 Edit
 </button>
 </td>
 </tr>
 {isExpanded && hasExtraInfo && (
 <tr className="bg-zinc-50/50 dark:bg-zinc-900/20">
 <td colSpan="5"className="px-6 py-5 border-t-0">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
 {user.additionalInfo.map((info, idx) => (
 <div key={idx}>
 <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">{info.key}</p>
 <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{info.value ||'-'}</p>
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
 let groupName ='Unassigned';
 if (user.hostelId) {
 groupName = hostelMap[user.hostelId] || (isLoading ?'Loading Hostel...':'Unknown Hostel');
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
 <div className="p-8 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
 <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">No tenants match your search.</p>
 </div>
 )}

 {Object.entries(groupedUsers).map(([hostelName, hostelUsers]) => (
 <div key={hostelName} className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
 <div className="px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/40 flex items-center justify-between">
 <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
 {hostelName}
 <span className="flex items-center justify-center px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
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
 managers: filteredUsers?.filter(u => u.role ==='manager') || [],
 students: filteredUsers?.filter(u => u.role ==='student') || [],
 };
 }, [filteredUsers]);

 return (
 <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 px-6 bg-zinc-50/80 dark:bg-zinc-900/40">
 
 <nav className="-mb-px flex space-x-6"aria-label="Tabs">
 {[
 { id:'managers', label:'Managers', count: managers.length },
 { id:'students', label:'Students', count: students.length }
 ].map(tab => {
 const isActive = activeTab === tab.id;
 return (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-[14px] transition-all duration-150 flex items-center gap-2 ${
 isActive
 ?'border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50'
 :'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:border-zinc-700'
 }`}
 >
 {tab.label}
 <span className={`py-0.5 px-2 rounded-full text-[11px] font-semibold transition-colors ${
 isActive 
 ?'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
 :'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
 }`}>
 {tab.count}
 </span>
 </button>
 );
 })}
 </nav>
 
 {/* Search integrated cleanly next to tabs */}
 <div className="py-3 shrink-0">
 <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search by name, email..."/>
 </div>
 </div>
 <div>
 <UsersTable users={activeTab ==='managers'? managers : students} />
 </div>
 </div>
 );
};

// --- Manager / Student View ---
export const FlatListView = ({ users, sortOption }) => {
 const [searchQuery, setSearchQuery] = useState('');
 const filteredUsers = useFilteredUsers(users, searchQuery, sortOption);

 return (
 <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
 <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-end bg-zinc-50/80 dark:bg-zinc-900/40">
 <SearchInput value={searchQuery} onChange={setSearchQuery} />
 </div>
 <UsersTable users={filteredUsers} />
 </div>
 );
};