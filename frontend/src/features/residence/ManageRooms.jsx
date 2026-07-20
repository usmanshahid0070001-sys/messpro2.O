import React, { useState } from 'react';
import { useRooms } from '../../hooks/queries/useResidenceQueries';
import { useRemoveRoom, useRemoveStudentFromRoom } from '../../hooks/mutations/useResidenceMutations';
import { useGetTargettedUsers } from '../../hooks/queries/useUsers';
import RoomModal from './RoomModal';
import ConfirmationCard from '../../components/ui/ConfirmationCard';
import StatCard from '../../components/ui/StatCard';
import { Home, Users, Building2 } from 'lucide-react';
// Centralized status -> badge style map (dark-mode aware, no clashing pure-100 fills on dark bg)
const STATUS_STYLES = {
  Available: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  Full: 'bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
  Maintenance: 'bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
};

const getStatusStyle = (status) => STATUS_STYLES[status] || 'bg-slate-50 text-slate-700 border border-slate-200/60 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';

const RoomCardSkeleton = () => (
  <div className="card p-5 animate-pulse border border-gray-100 dark:border-[#222]">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-2">
        <div className="h-5 w-24 bg-gray-200 dark:bg-[#333] rounded"></div>
        <div className="h-3 w-16 bg-gray-200 dark:bg-[#333] rounded"></div>
      </div>
      <div className="h-5 w-16 bg-gray-200 dark:bg-[#333] rounded-full"></div>
    </div>
    <div className="flex flex-col space-y-2">
      <div className="h-8 bg-gray-100 dark:bg-[#222] rounded-md"></div>
      <div className="h-8 bg-gray-100 dark:bg-[#222] rounded-md"></div>
      <div className="h-8 bg-gray-100 dark:bg-[#222] rounded-md"></div>
      <div className="h-8 bg-gray-100 dark:bg-[#222] rounded-md"></div>
    </div>
  </div>
);

const ManageRooms = () => {
  const { data: response, isLoading: roomsLoading, error: roomsError, refetch } = useRooms();
  const { data: users } = useGetTargettedUsers();

  const removeRoomMutation = useRemoveRoom();
  const removeStudentMutation = useRemoveStudentFromRoom();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'assign', 'swap', 'allotments'
  const [selectedRoom, setSelectedRoom] = useState(null);
  // Track which room is currently mid-delete so we only disable that one button, not the whole grid
  const [deletingRoomId, setDeletingRoomId] = useState(null);
  const [roomToDelete, setRoomToDelete] = useState(null);

  const rooms = response?.data || [];
  const usersList = users || [];

  const totalRooms = rooms.length;
  const totalOccupants = rooms.reduce((acc, room) => acc + room.occupants, 0);
  const totalCapacity = rooms.reduce((acc, room) => acc + room.capacity, 0);

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedRoom(null);
    setIsModalOpen(true);
  };

  const handleOpenAssign = (room) => {
    setModalMode('assign');
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleOpenAllotments = (room) => {
    setModalMode('allotments');
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleOpenSwap = (room) => {
    setModalMode('swap');
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Delay clearing the room until the close transition would finish, avoids a
    // flash of "undefined" title if a fade-out animation is added later.
    setSelectedRoom(null);
  };

  const handleRemoveRoom = (room) => {
    setRoomToDelete(room);
  };

  const confirmRemoveRoom = () => {
    if (roomToDelete) {
      setDeletingRoomId(roomToDelete._id);
      removeRoomMutation.mutate(roomToDelete._id, {
        onSettled: () => {
          setDeletingRoomId(null);
          setRoomToDelete(null);
        },
      });
    }
  };

  if (roomsLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5">
          <div className="animate-pulse space-y-2">
            <div className="h-7 bg-gray-200 dark:bg-[#222] rounded w-48"></div>
            <div className="h-4 bg-gray-200 dark:bg-[#222] rounded w-72"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <RoomCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (roomsError) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg flex items-center justify-between gap-4">
          <span>Error loading rooms. Please try again.</span>
          <button
            onClick={() => refetch()}
            className="shrink-0 px-3 py-1.5 text-sm font-medium rounded-md border border-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Manage Rooms</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage hostel rooms, capacity, and student allocations.
          </p>
        </div>
        <div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors duration-150"
          >
            <svg className="-ml-1 mr-2 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Room
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          label="Total Rooms" 
          value={totalRooms} 
          note="Active rooms in hostel" 
          icon={Home} 
          accent="#3b82f6" 
        />
        <StatCard 
          label="Allotted Students" 
          value={totalOccupants} 
          note="Currently residing" 
          icon={Users} 
          accent="#10b981" 
        />
        <StatCard 
          label="Total Capacity" 
          value={totalCapacity} 
          note="Maximum possible occupants" 
          icon={Building2} 
          accent="#8b5cf6" 
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rooms.map((room) => {
          const isDeleting = deletingRoomId === room._id;
          return (
            <div key={room._id} className="card p-5 hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all duration-300 ease-out min-w-0 border border-gray-100 dark:border-[#222]">
              <div className="flex justify-between items-start gap-2 mb-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate" title={room.roomName}>
                    {room.roomName}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                    {room.occupants} / {room.capacity} Occupants
                  </p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(room.status)}`}
                >
                  {room.status}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleOpenAllotments(room)}
                  className="col-span-2 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-out active:scale-[0.98]"
                >
                  View Allotments
                </button>
                <button
                  onClick={() => handleOpenAssign(room)}
                  disabled={room.status === 'Full'}
                  title={room.status === 'Full' ? 'Room is at full capacity' : undefined}
                  className="inline-flex justify-center items-center px-4 py-2 border border-slate-200 dark:border-white/10 shadow-sm text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-out active:scale-[0.98]"
                >
                  Assign
                </button>
                <button
                  onClick={() => handleOpenSwap(room)}
                  disabled={room.occupants === 0}
                  title={room.occupants === 0 ? 'No one to swap out of this room' : undefined}
                  className="inline-flex justify-center items-center px-4 py-2 border border-slate-200 dark:border-white/10 shadow-sm text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-out active:scale-[0.98]"
                >
                  Swap
                </button>
                <button
                  onClick={() => handleRemoveRoom(room)}
                  disabled={isDeleting}
                  className="col-span-2 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-out active:scale-[0.98]"
                >
                  {isDeleting ? 'Deleting…' : 'Delete Room'}
                </button>
              </div>
            </div>
          );
        })}
        {rooms.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-[#111] border border-dashed border-gray-300 dark:border-[#333] rounded-2xl">
            <div className="h-14 w-14 rounded-full bg-white dark:bg-[#222] shadow-sm flex items-center justify-center mb-4 border border-gray-100 dark:border-[#333]">
              <Home className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No rooms yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">Get started by creating a new room to allot students.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-6 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-sm text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 transition-all duration-200 ease-out active:scale-[0.98]"
            >
              <svg className="-ml-1 mr-2 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Room
            </button>
          </div>
        )}
      </div>

      <RoomModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        room={selectedRoom}
        rooms={rooms}
        users={usersList}
        setModalMode={setModalMode}
      />

      <ConfirmationCard
        isOpen={!!roomToDelete}
        onClose={() => setRoomToDelete(null)}
        onConfirm={confirmRemoveRoom}
        title={roomToDelete ? `Delete room "${roomToDelete.roomName}"` : "Delete Room"}
        message={roomToDelete ? `By deleting this room, the students that are allotted in this room will be unallotted. Are you sure you want to proceed?` : "Are you sure you want to delete this room?"}
        confirmText="Delete Room"
        cancelText="Cancel"
        variant="danger"
        isPending={!!deletingRoomId}
      />
    </div>
  );
};

export default ManageRooms;