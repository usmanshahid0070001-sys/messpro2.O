import { create } from 'zustand';

const useUIStore = create((set) => ({
  theme: localStorage.getItem('theme') || 'dark', // Default to dark as requested for premium look
  isMobileMenuOpen: false,
  activeSectionLabel: '',

  setActiveSectionLabel: (label) => set({ activeSectionLabel: label }),

  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),

  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    // Directly manipulating the document class here is generally better handled in a top-level effect,
    // but doing it here guarantees immediate DOM update. We'll also have an effect in DashboardLayout.
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    return { theme: newTheme };
  }),

  setTheme: (newTheme) => set(() => {
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    return { theme: newTheme };
  }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
}));

export default useUIStore;
