import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAddRoom, useAssignRoom, useSwapRoom, useRemoveStudentFromRoom } from '../../hooks/mutations/useResidenceMutations';

const UserSearchSelect = ({ users, value, onChange, placeholder = "Search for a user..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const selectedUser = users?.find(u => u._id === value);
  const displayValue = selectedUser ? `${selectedUser.name} (${selectedUser.role})` : searchTerm;

  const filteredUsers = users?.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <input
        type="text"
        value={isOpen ? searchTerm : displayValue}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
          onChange(''); // Clear selection if typing
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder={placeholder}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-[#333] rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 dark:bg-[#222] dark:text-white sm:text-sm"
      />
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#222] border border-gray-300 dark:border-[#333] rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredUsers?.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No users found.</div>
          ) : (
            filteredUsers?.map(u => (
              <div
                key={u._id}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input onBlur from firing immediately
                  onChange(u._id);
                  setSearchTerm('');
                  setIsOpen(false);
                }}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333] dark:text-white"
              >
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-gray-500 capitalize">{u.role}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const RoomModal = ({ isOpen, onClose, mode, room, rooms, users, setModalMode }) => {
  const addRoomMutation = useAddRoom();
  const assignRoomMutation = useAssignRoom();
  const swapRoomMutation = useSwapRoom();
  const removeStudentMutation = useRemoveStudentFromRoom();

  const [roomName, setRoomName] = useState('');
  const [capacity, setCapacity] = useState(1);
  const [studentId, setStudentId] = useState('');
  const [newRoomId, setNewRoomId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if ((mode === 'assign' || mode === 'swap') && !studentId) {
      toast.error('Please select a user from the list before confirming.');
      return;
    }

    if (mode === 'add') {
      addRoomMutation.mutate(
        { roomName, capacity: Number(capacity) },
        {
          onSuccess: () => {
            setRoomName('');
            setCapacity(1);
            onClose();
          },
        }
      );
    } else if (mode === 'assign') {
      assignRoomMutation.mutate(
        { studentId, roomId: room._id },
        {
          onSuccess: () => {
            setStudentId('');
            onClose();
          },
        }
      );
    } else if (mode === 'swap') {
      swapRoomMutation.mutate(
        { studentId, newRoomId },
        {
          onSuccess: () => {
            setStudentId('');
            setNewRoomId('');
            onClose();
          },
        }
      );
    }
  };

  const isPending = addRoomMutation.isPending || assignRoomMutation.isPending || swapRoomMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-black dark:bg-opacity-80" onClick={onClose}></div>

        <div className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-[#111] shadow-xl rounded-2xl">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
            {mode === 'add' && 'Add New Room'}
            {mode === 'assign' && `Assign User to ${room?.roomName}`}
            {mode === 'swap' && `Swap Room from ${room?.roomName}`}
            {mode === 'allotments' && `Users in ${room?.roomName}`}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'add' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Room Name</label>
                  <input
                    type="text"
                    required
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-[#333] rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 dark:bg-[#222] dark:text-white sm:text-sm"
                    placeholder="e.g., A-101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Capacity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-[#333] rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 dark:bg-[#222] dark:text-white sm:text-sm"
                  />
                </div>
              </>
            )}

            {mode === 'assign' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select User</label>
                <UserSearchSelect
                  users={users?.filter(u => ['student', 'manager'].includes(u.role) && u.room?._id !== room?._id)}
                  value={studentId}
                  onChange={setStudentId}
                  placeholder="Type a name to assign..."
                />
              </div>
            )}

            {mode === 'swap' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select User to Swap</label>
                  <UserSearchSelect
                    users={users?.filter(u => u.room?._id === room?._id)}
                    value={studentId}
                    onChange={setStudentId}
                    placeholder="Type a name to swap..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Room</label>
                  <select
                    required
                    value={newRoomId}
                    onChange={(e) => setNewRoomId(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-[#333] rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 dark:bg-[#222] dark:text-white sm:text-sm"
                  >
                    <option value="">Select a new room</option>
                    {rooms?.filter(r => r._id !== room?._id && r.status !== 'Full' && r.status !== 'Maintenance').map(r => (
                      <option key={r._id} value={r._id}>{r.roomName} ({r.occupants}/{r.capacity})</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {mode === 'allotments' && (
              <div className="space-y-3">
                {users?.filter(u => u.room?._id === room?._id).map(u => (
                  <div key={u._id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-[#333] rounded-lg bg-gray-50 dark:bg-[#1a1a1a]">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{u.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{u.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setStudentId(u._id); setModalMode('swap'); }}
                        className="px-2 py-1 text-xs font-medium bg-white border border-gray-300 rounded shadow-sm text-gray-700 hover:bg-gray-50 dark:bg-[#222] dark:border-[#444] dark:text-gray-200 dark:hover:bg-[#333]"
                      >Swap</button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Remove ${u.name} from this room?`)) {
                            removeStudentMutation.mutate({ studentId: u._id }, {
                              onSuccess: () => {
                                if (users.filter(usr => usr.room?._id === room._id).length <= 1) {
                                  onClose();
                                }
                              }
                            });
                          }
                        }}
                        disabled={removeStudentMutation.isPending}
                        className="px-2 py-1 text-xs font-medium bg-red-50 border border-red-200 rounded shadow-sm text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >Remove</button>
                    </div>
                  </div>
                ))}
                {users?.filter(u => u.room?._id === room?._id).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No users are currently allotted to this room.</p>
                )}
              </div>
            )}

            {mode !== 'allotments' && (
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-slate-900 dark:bg-white text-base font-medium text-white dark:text-black hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                >
                  {isPending ? 'Processing...' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-[#333] shadow-sm px-4 py-2 bg-white dark:bg-[#111] text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#222] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            )}

            {mode === 'allotments' && (
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-[#333] shadow-sm px-4 py-2 bg-white dark:bg-[#111] text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#222] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 sm:text-sm"
                >
                  Close
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoomModal;
