import AsyncStorage from "@react-native-async-storage/async-storage";

export const BALANCE_CACHE_KEY = "home.balance.cache.v1";
export const RECENTS_MOUVEMENTS_CACHE_KEY = "home.mouvements.recents.cache.v1";
export const STAT_DATA_CACHE_KEY = "statData.cache.v1";
export const STATISTIQUES_LIST_CACHE_KEY = "statistiques.list.cache.v1";
export const STOCK_ME_CACHE_KEY = "stock.me.cache.v1";

let currentUserCode: string | null = null;

function normalizeUserCode(userCode: string): string {
  return userCode.trim();
}

function getScopedCacheKey(key: string): string {
  if (!currentUserCode) {
    return key;
  }

  return `${key}.${currentUserCode}`;
}

export function setCacheUserCode(userCode: string | null | undefined): void {
  if (!userCode || !userCode.trim()) {
    currentUserCode = null;
    return;
  }

  currentUserCode = normalizeUserCode(userCode);
}

export async function getCacheData<T>(key: string): Promise<T | null> {
  try {
    const rawValue = await AsyncStorage.getItem(getScopedCacheKey(key));
    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
}

export async function setCacheData<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(getScopedCacheKey(key), JSON.stringify(value));
}

export async function removeCacheData(key: string): Promise<void> {
  await AsyncStorage.removeItem(getScopedCacheKey(key));
}
