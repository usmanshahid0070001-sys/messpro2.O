import React, { useState } from 'react';
import { useRooms } from '../../hooks/queries/useResidenceQueries';
import { useRemoveRoom, useRemoveStudentFromRoom } from '../../hooks/mutations/useResidenceMutations';
import { useGetTargettedUsers } from '../../hooks/queries/useUsers';
import RoomModal from './RoomModal';

const ManageRooms = () => {
  const { data: response, isLoading: roomsLoading, error: roomsError } = useRooms();
  const { data: users } = useGetTargettedUsers();
  
  const removeRoomMutation = useRemoveRoom();
  const removeStudentMutation = useRemoveStudentFromRoom();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'assign', 'swap', 'allotments'
  const [selectedRoom, setSelectedRoom] = useState(null);

  const rooms = response?.data || [];
  const usersList = users || [];

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
    setSelectedRoom(null);
  };

  const handleRemoveRoom = (roomId) => {
    if (window.confirm('Are you sure you want to delete this room? Any students currently allotted to this room will be automatically disalloted.')) {
      removeRoomMutation.mutate(roomId);
    }
  };

  const handleRemoveStudent = (studentId) => {
    if (window.confirm('Are you sure you want to remove this student from the room?')) {
      removeStudentMutation.mutate({ studentId });
    }
  };

  if (roomsLoading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-[#222] rounded w-48 mb-4"></div>
        <div className="h-64 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl w-full"></div>
      </div>
    );
  }

  if (roomsError) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          Error loading rooms. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Manage Rooms</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage hostel rooms, capacity, and student allocations.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors duration-150"
          >
            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Room
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rooms.map((room) => (
          <div key={room._id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{room.roomName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {room.occupants} / {room.capacity} Occupants
                </p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                room.status === 'Available' ? 'bg-green-100 text-green-800' :
                room.status === 'Full' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {room.status}
              </span>
            </div>

            <div className="mt-4 flex flex-col space-y-2">
              <button
                onClick={() => handleOpenAllotments(room)}
                className="w-full inline-flex justify-center items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Allotments
              </button>
              <button
                onClick={() => handleOpenAssign(room)}
                disabled={room.status === 'Full'}
                className="w-full inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 dark:border-[#333] shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-[#222] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50"
              >
                Assign Student
              </button>
              <button
                onClick={() => handleOpenSwap(room)}
                className="w-full inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 dark:border-[#333] shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-[#222] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
              >
                Swap Room
              </button>
              <button
                onClick={() => handleRemoveRoom(room._id)}
                className="w-full inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Room
              </button>
            </div>
          </div>
        ))}
        {rooms.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500 border-2 border-dashed border-gray-200 dark:border-[#333] rounded-xl">
            No rooms found. Add a room to get started.
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
    </div>
  );
};

export default ManageRooms;
