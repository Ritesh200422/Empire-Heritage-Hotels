import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  email: string | null;
  login: (email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      email: null,
      login: (email) => set({ email }),
      logout: () => set({ email: null }),
    }),
    {
      name: 'hotel-auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return window.sessionStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);
