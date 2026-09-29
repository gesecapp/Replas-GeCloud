import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AppUserType } from '@/lib/permissions';

export const useAppAuth = create<AppAuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      userId: null,
      document: null,
      userType: null,

      setAuth: (token: string, userId: string, document: string, userType: AppUserType) => {
        set({ isAuthenticated: true, token, userId, document, userType });
      },

      clearAuth: () => {
        set({ isAuthenticated: false, token: null, userId: null, document: null, userType: null });
      },
      checkTokenValidity: () => {
        const { token, clearAuth } = get();
        if (!token) {
          if (get().isAuthenticated) clearAuth();
          return false;
        }

        try {
          const payloadBase64 = token.split('.')[1];
          if (!payloadBase64) return true;

          const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
              .join(''),
          );
          const payload = JSON.parse(jsonPayload);

          if (payload.exp && payload.exp * 1000 < Date.now()) {
            clearAuth();
            return false;
          }
          return true;
        } catch {
          clearAuth();
          return false;
        }
      },
    }),
    {
      name: 'app-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        userId: state.userId,
        document: state.document,
        userType: state.userType,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.checkTokenValidity();
        }
      },
    },
  ),
);

type AppAuthStore = {
  isAuthenticated: boolean;
  token: string | null;
  userId: string | null;
  document: string | null;
  userType: AppUserType | null;
  setAuth: (token: string, userId: string, document: string, userType: AppUserType) => void;
  clearAuth: () => void;
  checkTokenValidity: () => boolean;
};
