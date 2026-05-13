import type { User } from './user';

export type LoginCredentials = {
  phone: string;
  password: string;
};

export type RegisterCredentials = {
  name: string;
  phone: string;
  password: string;
  password_confirmation: string;
  agree: boolean;
};

export type VerifyPhonePayload = {
  phone: string;
  otp: string;
};

export type ForgotPasswordPayload = {
  phone: string;
};

export type ResetPasswordPayload = {
  token: string;
  phone: string;
  password: string;
  password_confirmation: string;
};

export type Session = {
  token: string;
  user: User;
};

export type AuthStatus =
  | 'restoring'
  | 'anonymous'
  | 'loading'
  | 'authenticated';
