import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import type { Session } from '@/src/types/auth';

import { getJsonStorage, removeStorage, setJsonStorage } from './local-storage';

const SESSION_KEY = 'auth_session';
const TOKEN_KEY = 'auth_token';

const isWeb = Platform.OS === 'web';

async function getSecureItem(key: string): Promise<string | null> {
  if (isWeb) {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function setSecureItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function deleteSecureItem(key: string): Promise<void> {
  if (isWeb) {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export async function getStoredSession(): Promise<Session | null> {
  const token = await getSecureItem(TOKEN_KEY);
  const session = await getJsonStorage<Session | null>(SESSION_KEY, null);

  if (!token || !session?.user) {
    return null;
  }

  return {
    token,
    user: session.user,
  };
}

export async function setStoredSession(session: Session) {
  await setSecureItem(TOKEN_KEY, session.token);
  await setJsonStorage(SESSION_KEY, {
    user: session.user,
    token: session.token,
  });
}

export async function clearStoredSession() {
  await deleteSecureItem(TOKEN_KEY);
  await removeStorage(SESSION_KEY);
}
