import {create} from 'zustand';

export const useStore = create((set) => ({
  user: null,
  role: null,

  setUser: (user, role) => set({ user, role }),

  logout: () => set({ user: null, role: null }),
}));
