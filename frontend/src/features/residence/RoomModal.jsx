import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAddRoom, useAssignRoom, useSwapRoom, useRemoveStudentFromRoom } from '../../hooks/mutations/useResidenceMutations';

const UserSearchSelect = ({ users, value, onChange, placeholder = "Search for a user...", autoFocus = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedUser = users?.find(u => u._id === value);
  const displayValue = selectedUser ? `${selectedUser.name} (${selectedUser.role})` : searchTerm;

  const filteredUsers = users?.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Replaced buggy onBlur with a robust click-outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        autoFocus={autoFocus}
        value={isOpen ? searchTerm : displayValue}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
          onChange(''); // Clear selection if typing
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        className="mt-1 block w-full px-3.5 py-2.5 border border-slate-300 dark:border-white/10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 dark:bg-[#222] dark:text-white sm:text-sm truncate transition-colors"
      />
      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-[#222] border border-gray-300 dark:border-[#333] rounded-md shadow-xl max-h-48 overflow-y-auto">
          {!filteredUsers || filteredUsers.length === 0 ? (
            <div className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              {users && users.length === 0 ? 'No eligible users available.' : 'No users found.'}
            </div>
          ) : (
            filteredUsers.map(u => (
              <div
                key={u._id}
                onClick={() => {
                  onChange(u._id);
                  setSearchTerm('');
                  setIsOpen(false);
                }}
                className="px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333] dark:text-white transition-colors border-b border-gray-100 dark:border-[#333] last:border-0"
              >
                <div className="font-medium truncate" title={u.name}>{u.name}</div>
                <div className="text-xs text-gray-500 capitalize mt-0.5">{u.role}</div>
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
  const [removingUserId, setRemovingUserId] = useState(null);

  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setRoomName('');
      setCapacity(1);
      setStudentId('');
      setNewRoomId('');
      setRemovingUserId(null);
    }
  }, [isOpen, mode, room?._id]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const eligibleRoomsForSwap = rooms?.filter(r => r._id !== room?._id && r.status !== 'Full' && r.status !== 'Maintenance') || [];
  const usersInThisRoom = users?.filter(u => u.room?._id === room?._id) || [];

  const handleSubmit = (e) => {
    e.preventDefault();

    if ((mode === 'assign' || mode === 'swap') && !studentId) {
      toast.error('Please select a user from the list before confirming.');
      return;
    }

    if (mode === 'swap' && !newRoomId) {
      toast.error('Please select a room to swap into.');
      return;
    }

    if (mode === 'add') {
      addRoomMutation.mutate(
        { roomName: roomName.trim(), capacity: Number(capacity) },
        { onSuccess: () => onClose() }
      );
    } else if (mode === 'assign') {
      assignRoomMutation.mutate(
        { studentId, roomId: room._id },
        { onSuccess: () => onClose() }
      );
    } else if (mode === 'swap') {
      swapRoomMutation.mutate(
        { studentId, newRoomId },
        { onSuccess: () => onClose() }
      );
    }
  };

  const handleRemoveFromAllotments = (u) => {
    if (window.confirm(`Remove ${u.name} from this room?`)) {
      setRemovingUserId(u._id);
      removeStudentMutation.mutate({ studentId: u._id }, {
        onSettled: () => setRemovingUserId(null),
        onSuccess: () => {
          if (usersInThisRoom.length <= 1) onClose();
        },
      });
    }
  };

  const isPending = addRoomMutation.isPending || assignRoomMutation.isPending || swapRoomMutation.isPending;

  const titleText = {
    add: 'Add New Room',
    assign: `Assign User to ${room?.roomName ?? ''}`,
    swap: `Swap Room from ${room?.roomName ?? ''}`,
    allotments: `Users in ${room?.roomName ?? ''}`,
  }[mode];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="room-modal-title">
      {/* Backdrop overlay */}
      <div className="fixed inset-0 transition-opacity bg-gray-500/75 dark:bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Card - Removed overflow-hidden to allow dropdown to escape bounds */}
      <div
        ref={dialogRef}
        className="relative flex flex-col w-full max-w-md bg-white dark:bg-[#0a0a0a] shadow-2xl rounded-2xl border border-black/5 dark:border-white/5"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-[#222]">
          <h3 id="room-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white truncate" title={titleText}>
            {titleText}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            {mode === 'add' && (
              <>
                <div>
                  <label htmlFor="room-name-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room Name</label>
                  <input
                    id="room-name-input"
                    type="text"
                    required
                    autoFocus
                    maxLength={40}
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="block w-full px-3.5 py-2.5 border border-slate-300 dark:border-white/10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 dark:bg-[#222] dark:text-white sm:text-sm transition-colors"
                    placeholder="e.g., A-101"
                  />
                </div>
                <div>
                  <label htmlFor="room-capacity-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity</label>
                  <input
                    id="room-capacity-input"
                    type="number"
                    required
                    min="1"
                    max="20"
                    step="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="block w-full px-3.5 py-2.5 border border-slate-300 dark:border-white/10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 dark:bg-[#222] dark:text-white sm:text-sm transition-colors"
                  />
                </div>
              </>
            )}

            {mode === 'assign' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select User</label>
                <UserSearchSelect
                  autoFocus
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select User to Swap</label>
                  <UserSearchSelect
                    autoFocus
                    users={usersInThisRoom}
                    value={studentId}
                    onChange={setStudentId}
                    placeholder="Type a name to swap..."
                  />
                </div>
                <div>
                  <label htmlFor="new-room-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Room</label>
                  <select
                    id="new-room-select"
                    required
                    value={newRoomId}
                    onChange={(e) => setNewRoomId(e.target.value)}
                    disabled={eligibleRoomsForSwap.length === 0}
                    className="block w-full px-3.5 py-2.5 border border-slate-300 dark:border-white/10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 dark:bg-[#222] dark:text-white sm:text-sm disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <option value="">
                      {eligibleRoomsForSwap.length === 0 ? 'No available rooms to swap into' : 'Select a new room'}
                    </option>
                    {eligibleRoomsForSwap.map(r => (
                      <option key={r._id} value={r._id}>{r.roomName} ({r.occupants}/{r.capacity})</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {mode === 'allotments' && (
              /* Isolated scroll area specifically for allotments, ensuring the modal remains manageable in height */
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {usersInThisRoom.map(u => (
                  <div key={u._id} className="flex items-center justify-between gap-3 p-3.5 border border-gray-200 dark:border-[#333] rounded-lg bg-gray-50 dark:bg-[#1a1a1a]">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={u.name}>{u.name}</p>
                      <p className="text-xs text-gray-500 capitalize mt-0.5">{u.role}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => { setStudentId(u._id); setModalMode('swap'); }}
                        className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-100 dark:bg-[#222] dark:border-[#444] dark:text-gray-200 dark:hover:bg-[#333] transition-colors focus:ring-2 focus:ring-slate-500"
                      >Swap</button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromAllotments(u)}
                        disabled={removingUserId === u._id}
                        className="px-3 py-1.5 text-xs font-medium bg-red-50 border border-red-200 rounded-md shadow-sm text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-900/40 disabled:opacity-50 transition-colors focus:ring-2 focus:ring-red-500"
                      >{removingUserId === u._id ? 'Removing…' : 'Remove'}</button>
                    </div>
                  </div>
                ))}
                {usersInThisRoom.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6 border border-dashed border-gray-200 dark:border-[#333] rounded-lg">No users are currently allotted to this room.</p>
                )}
              </div>
            )}
          </div>

          {/* Footer - Cleaned up flex layout, completely replacing the messy grid logic */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-[#222] flex flex-col-reverse sm:flex-row sm:justify-end gap-3 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all active:scale-[0.98]"
            >
              {mode === 'allotments' ? 'Close' : 'Cancel'}
            </button>
            
            {mode !== 'allotments' && (
              <button
                type="submit"
                disabled={isPending || (mode === 'swap' && eligibleRoomsForSwap.length === 0)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg shadow-sm text-sm font-medium hover:bg-slate-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {isPending ? 'Processing...' : 'Confirm'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomModal;