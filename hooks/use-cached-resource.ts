import { getCacheData, setCacheData } from "@/services/cache-service";
import { useCallback, useEffect, useState } from "react";

type UseCachedResourceOptions<T> = {
  cacheKey: string;
  initialData: T;
  enabled: boolean;
  fetcher: () => Promise<T>;
  hasUsableCachedData?: (data: T | null) => boolean;
};

type UseCachedResourceResult<T> = {
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  isOfflineMode: boolean;
  reload: () => Promise<void>;
  refresh: () => Promise<void>;
};

export function useCachedResource<T>(
  options: UseCachedResourceOptions<T>,
): UseCachedResourceResult<T> {
  const {
    cacheKey,
    initialData,
    enabled,
    fetcher,
    hasUsableCachedData = (data) => data !== null,
  } = options;

  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const reload = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let hasCachedData = false;

    try {
      setIsLoading(true);
      setIsError(false);

      const cachedData = await getCacheData<T>(cacheKey);
      if (hasUsableCachedData(cachedData)) {
        setData(cachedData as T);
        hasCachedData = true;
      }

      const freshData = await fetcher();
      setData(freshData);
      setIsOfflineMode(false);
      await setCacheData(cacheKey, freshData);
    } catch {
      if (!hasCachedData) {
        setData(initialData);
      }
      setIsError(true);
      setIsOfflineMode(true);
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, enabled, fetcher, hasUsableCachedData, initialData]);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setIsRefreshing(false);
      return;
    }

    try {
      setIsRefreshing(true);
      const freshData = await fetcher();
      setData(freshData);
      setIsOfflineMode(false);
      setIsError(false);
      await setCacheData(cacheKey, freshData);
    } catch {
      setIsError(true);
      setIsOfflineMode(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [cacheKey, enabled, fetcher]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    data,
    setData,
    isLoading,
    isRefreshing,
    isError,
    isOfflineMode,
    reload,
    refresh,
  };
}
