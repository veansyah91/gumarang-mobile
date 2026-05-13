import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getJsonStorage<T>(key: string, fallback: T): Promise<T> {
  const value = await AsyncStorage.getItem(key);

  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function setJsonStorage<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeStorage(key: string) {
  await AsyncStorage.removeItem(key);
}
