import type {
  ForgotPasswordPayload,
  LoginCredentials,
  RegisterCredentials,
  ResetPasswordPayload,
  Session,
  UpdatePasswordPayload,
  VerifyPhonePayload,
} from '@/src/types/auth';
import type { User } from '@/src/types/user';
import { AppError } from '@/src/utils/errors';

import { apiClient } from './client';

type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

function normalizeSession(data: { token?: string; user?: User }): Session {
  const { token, user } = data;

  if (!token || !user) {
    throw new AppError('Unexpected authentication payload.', {
      code: 'invalid_auth_payload',
      userMessage: 'Respons server tidak valid. Silakan hubungi dukungan.',
    });
  }

  return { token, user };
}

export const authApi = {
  async register(credentials: RegisterCredentials): Promise<User> {
    const response = await apiClient.post<ApiResponse<{ user: User }>>(
      '/api/v1/auth/register',
      credentials,
    );
    const user = response.data.data?.user;
    if (!user) {
      throw new AppError('Register payload invalid.', {
        code: 'invalid_auth_payload',
        userMessage: 'Respons server tidak valid.',
      });
    }
    return user;
  },

  async login(credentials: LoginCredentials): Promise<Session> {
    const response = await apiClient.post<
      ApiResponse<{ token: string; user: User }>
    >('/api/v1/auth/login', credentials);
    return normalizeSession(response.data.data ?? {});
  },

  async verifyPhone(payload: VerifyPhonePayload): Promise<Session> {
    const response = await apiClient.post<
      ApiResponse<{ token: string; user: User }>
    >('/api/v1/auth/verify-phone', payload);
    return normalizeSession(response.data.data ?? {});
  },

  async resendOtp(phone: string): Promise<void> {
    await apiClient.post('/api/v1/auth/verify-phone/resend', { phone });
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await apiClient.post('/api/v1/auth/forgot-password', payload);
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await apiClient.post('/api/v1/auth/reset-password', payload);
  },

  async updatePassword(payload: UpdatePasswordPayload): Promise<void> {
    await apiClient.post('/api/v1/auth/update-password', payload);
  },

  async logout(): Promise<void> {
    await apiClient.post('/api/v1/auth/logout');
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/api/v1/auth/me');
    return response.data.data ?? (response.data as unknown as User);
  },
};
