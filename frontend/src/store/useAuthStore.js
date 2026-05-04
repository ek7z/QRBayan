import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setAuth: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: !!token 
      }),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      }),

      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      }))
    }),
    {
      name: 'auth-storage', // name of the item in storage (localStorage by default)
    }
  )
);

export default useAuthStore;
