import { useAuthStore } from '@/src/state/auth-store';

export function useAuth() {
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  return {
    error,
    login,
    logout,
    status,
    user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}
