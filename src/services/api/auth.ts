import { isAxiosError } from 'axios';

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

function isUser(value: unknown): value is User {
  return !!value && typeof value === 'object' && 'id' in value && 'name' in value && 'phone' in value && 'email' in value && 'is_admin' in value;
}

type UserEnvelope = {
  user?: unknown;
};

function extractRegisteredUser(value: unknown): User | null {
  if (isUser(value)) {
    return value;
  }

  if (value && typeof value === 'object') {
    const envelope = value as UserEnvelope;
    return isUser(envelope.user) ? envelope.user : null;
  }

  return null;
}

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
    const payload = {
      ...credentials,
      name: credentials.name.trim(),
      phone: credentials.phone.trim(),
      agree: Boolean(credentials.agree),
    };

    try {
      const response = await apiClient.post<ApiResponse<User | { user: User }>>(
        '/v1/auth/register',
        payload,
      );

      const user = extractRegisteredUser(response.data.data);

      if (!user) {
        throw new AppError('Register payload invalid.', {
          code: 'invalid_auth_payload',
          userMessage: 'Response server tidak valid.',
        });
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) {
        console.error('[auth.register] invalid response', {
          message: error.message,
          code: error.code,
          userMessage: error.userMessage,
        });
      } else if (isAxiosError(error)) {
        console.error('[auth.register] error', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
      } else {
        console.error('[auth.register] unexpected error', error);
      }

      throw error;
    }
  },

  async login(credentials: LoginCredentials): Promise<Session> {
    const response = await apiClient.post<
      ApiResponse<{ token: string; user: User }>
    >('/v1/auth/login', credentials);
    return normalizeSession(response.data.data ?? {});
  },

  async verifyPhone(payload: VerifyPhonePayload): Promise<Session> {
    const response = await apiClient.post<
      ApiResponse<{ token: string; user: User }>
    >('/v1/auth/verify-phone', payload);
    return normalizeSession(response.data.data ?? {});
  },

  async resendOtp(phone: string): Promise<void> {
    await apiClient.post('/v1/auth/verify-phone/resend', { phone });
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await apiClient.post('/v1/auth/forgot-password', payload);
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await apiClient.post('/v1/auth/reset-password', payload);
  },

  async updatePassword(payload: UpdatePasswordPayload): Promise<void> {
    await apiClient.post('/v1/auth/update-password', payload);
  },

  async logout(): Promise<void> {
    await apiClient.post('/v1/auth/logout');
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/v1/auth/me');
    return response.data.data ?? (response.data as unknown as User);
  },
};
