import type { User } from './user';

export type LoginCredentials = {
  email: string;
  password: string;
  deviceName?: string;
};

export type Session = {
  token: string;
  user: User;
};

export type AuthStatus = 'restoring' | 'anonymous' | 'loading' | 'authenticated';
