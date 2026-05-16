import { create } from 'zustand';

import { authApi } from '@/src/services/api/auth';
import { setApiAccessToken } from '@/src/services/api/client';
import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from '@/src/storage/session-storage';
import type {
  AuthStatus,
  LoginCredentials,
  RegisterCredentials,
  Session,
  VerifyPhonePayload,
} from '@/src/types/auth';
import type { User } from '@/src/types/user';
import { toAppError } from '@/src/utils/errors';

type AuthState = {
  error: string | null;
  status: AuthStatus;
  token: string | null;
  user: User | null;
  pendingPhone: string | null;
  restoreSession: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<boolean | 'unverified'>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  verifyPhone: (payload: VerifyPhonePayload) => Promise<boolean>;
  logout: () => Promise<void>;
  handleUnauthorized: () => Promise<void>;
  setSession: (session: Session | null) => Promise<void>;
  setPendingPhone: (phone: string | null) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  error: null,
  status: 'restoring',
  token: null,
  user: null,
  pendingPhone: null,

  setPendingPhone: (phone) => set({ pendingPhone: phone }),

  restoreSession: async () => {
    try {
      const session = await getStoredSession();

      if (!session) {
        setApiAccessToken(null);
        set({ error: null, status: 'anonymous', token: null, user: null });
        return;
      }

      setApiAccessToken(session.token);
      set({
        error: null,
        status: 'authenticated',
        token: session.token,
        user: session.user,
      });

      try {
        const freshUser = await authApi.getProfile();
        await get().setSession({ ...session, user: freshUser });
      } catch {
        // Keep the cached session when offline or when the backend is unavailable.
      }
    } catch {
      await clearStoredSession();
      setApiAccessToken(null);
      set({ error: null, status: 'anonymous', token: null, user: null });
    }
  },

  login: async (credentials) => {
    set({ error: null, status: 'loading' });

    try {
      const session = await authApi.login(credentials);
      await get().setSession(session);
      return true;
    } catch (error) {
      const appError = toAppError(error);
      if (appError.status === 403) {
        set({
          error: 'Nomor telepon Anda belum diverifikasi.',
          status: 'anonymous',
        });
        get().setPendingPhone(credentials.phone);
        return 'unverified';
      }
      set({ error: appError.userMessage, status: 'anonymous' });
      return false;
    }
  },

  register: async (credentials) => {
    set({ error: null, status: 'loading' });

    try {
      await authApi.register(credentials);
      get().setPendingPhone(credentials.phone);
      set({ status: 'anonymous' });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ error: appError.userMessage, status: 'anonymous' });
      return false;
    }
  },

  verifyPhone: async (payload) => {
    set({ error: null, status: 'loading' });

    try {
      const session = await authApi.verifyPhone(payload);
      await get().setSession(session);
      get().setPendingPhone(null);
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ error: appError.userMessage, status: 'anonymous' });
      return false;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // The local session should still be cleared even if the API is unavailable.
    }

    await get().setSession(null);
  },

  handleUnauthorized: async () => {
    await get().setSession(null);
    set({ error: 'Sesi Anda telah berakhir. Silakan masuk kembali.' });
  },

  setSession: async (session) => {
    if (!session) {
      await clearStoredSession();
      setApiAccessToken(null);
      set({ status: 'anonymous', token: null, user: null });
      return;
    }

    await setStoredSession(session);
    setApiAccessToken(session.token);
    set({
      error: null,
      status: 'authenticated',
      token: session.token,
      user: session.user,
    });
  },
}));
