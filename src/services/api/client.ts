import { create } from 'axios';

import { getApiBaseUrl } from '@/src/utils/env';
import { toAppError } from '@/src/utils/errors';

let accessToken: string | null = null;
let unauthorizedHandler: (() => void) | undefined;

const baseURL = getApiBaseUrl();
const isNgrok = baseURL.includes('ngrok');

export const apiClient = create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(isNgrok && { 'ngrok-skip-browser-warning': 'true' }),
  },
  timeout: 10000,
});

export function setApiAccessToken(token: string | null) {
  accessToken = token;
}

export function registerUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const appError = toAppError(error);

    // Bypass unauthorized check for home API
    const isHomeApi = error.config?.url?.includes('/api/v1/home');

    if (appError.code === 'unauthorized' && !isHomeApi) {
      unauthorizedHandler?.();
    }

    return Promise.reject(appError);
  },
);
