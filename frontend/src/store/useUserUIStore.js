import { create } from 'zustand';

export const useUserUIStore = create((set) => ({
  isModalOpen: false,
  modalType: 'create', // 'create' or 'update'
  selectedUser: null,
  draftUser: null,

  openCreateModal: () => set({ isModalOpen: true, modalType: 'create', selectedUser: null }),
  
  openUpdateModal: (user) => set({ isModalOpen: true, modalType: 'update', selectedUser: user }),
  
  closeModal: () => set({ isModalOpen: false, selectedUser: null }),

  isPermissionsModalOpen: false,
  permissionsUser: null,
  openPermissionsModal: (user) => set({ isPermissionsModalOpen: true, permissionsUser: user }),
  closePermissionsModal: () => set({ isPermissionsModalOpen: false, permissionsUser: null }),

  setDraftUser: (data) => set({ draftUser: data }),
  clearDraft: () => set({ draftUser: null }),
}));
