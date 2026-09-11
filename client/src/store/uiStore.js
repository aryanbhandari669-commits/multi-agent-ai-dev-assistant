import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: true,
  theme: 'dark',
  notifications: [],

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen
    })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setTheme: (theme) => set({ theme }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification]
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (notif) => notif.id !== id
      )
    })),

  clearNotifications: () => set({ notifications: [] })
}));

export default useUIStore;
