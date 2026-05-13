import * as SecureStore from 'expo-secure-store';

import type { Session } from '@/src/types/auth';

import { getJsonStorage, removeStorage, setJsonStorage } from './local-storage';

const SESSION_KEY = 'auth:session';
const TOKEN_KEY = 'auth:token';

export async function getStoredSession(): Promise<Session | null> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
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
  await SecureStore.setItemAsync(TOKEN_KEY, session.token);
  await setJsonStorage(SESSION_KEY, { user: session.user, token: session.token });
}

export async function clearStoredSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await removeStorage(SESSION_KEY);
}
