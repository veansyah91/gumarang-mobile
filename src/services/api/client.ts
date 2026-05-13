import axios from 'axios';

import { getApiBaseUrl } from '@/src/utils/env';
import { toAppError } from '@/src/utils/errors';

let accessToken: string | null = null;
let unauthorizedHandler: (() => void) | undefined;

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
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

    if (appError.code === 'unauthorized') {
      unauthorizedHandler?.();
    }

    return Promise.reject(appError);
  },
);
