import type { LoginCredentials, Session } from '@/src/types/auth';
import type { User } from '@/src/types/user';
import { AppError } from '@/src/utils/errors';

import { apiClient } from './client';

type LoginResponse = {
  token?: string;
  access_token?: string;
  user?: User;
  data?: {
    token?: string;
    access_token?: string;
    user?: User;
  };
};

function normalizeSession(response: LoginResponse): Session {
  const token = response.token ?? response.access_token ?? response.data?.token ?? response.data?.access_token;
  const user = response.user ?? response.data?.user;

  if (!token || !user) {
    throw new AppError('Unexpected authentication payload.', {
      code: 'invalid_auth_payload',
      userMessage: 'The server response could not be validated. Please contact support.',
    });
  }

  return {
    token,
    user,
  };
}

export const authApi = {
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      ...credentials,
      device_name: credentials.deviceName ?? 'gumarang-mobile',
    });

    return normalizeSession(response.data);
  },
  async logout() {
    await apiClient.post('/auth/logout');
  },
  async getProfile() {
    const response = await apiClient.get<User>('/auth/me');

    return response.data;
  },
};
