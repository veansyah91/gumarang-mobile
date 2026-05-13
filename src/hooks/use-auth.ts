import { useAuthStore } from '@/src/state/auth-store';

export function useAuth() {
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const register = useAuthStore((state) => state.register);
  const verifyPhone = useAuthStore((state) => state.verifyPhone);
  const setPendingPhone = useAuthStore((state) => state.setPendingPhone);
  const pendingPhone = useAuthStore((state) => state.pendingPhone);
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  return {
    error,
    login,
    logout,
    register,
    verifyPhone,
    setPendingPhone,
    pendingPhone,
    status,
    user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}
