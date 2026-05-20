import { getCacheData, setCacheData } from "@/services/cache-service";
import { meta, PaginatedResponse } from "@/types/other.type";
import { useCallback, useEffect, useRef, useState } from "react";

type PaginatedOptions<TItem, TResponse extends PaginatedResponse<TItem>> = {
  cacheKey: string;
  initialData: TResponse;
  enabled: boolean;
  pageSize?: number;
  fetchPage: (page: number, size: number) => Promise<TResponse>;
  getItemKey?: (item: TItem) => string | number;
  hasUsableCachedData?: (data: TResponse | null) => boolean;
};

type PaginatedResult<TItem, TResponse extends PaginatedResponse<TItem>> = {
  data: TResponse;
  setData: React.Dispatch<React.SetStateAction<TResponse>>;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  isError: boolean;
  isOfflineMode: boolean;
  hasNextPage: boolean;
  reload: () => Promise<void>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
};

const DEFAULT_PAGE_SIZE = 100;

function normalizeMeta(
  metaValue: meta | undefined,
  totalItems: number,
  page: number,
  size: number,
): meta {
  const total =
    typeof metaValue?.total === "number" ? metaValue.total : totalItems;
  const safeSize =
    typeof metaValue?.size === "number" && metaValue.size > 0
      ? metaValue.size
      : size;
  const totalPages =
    typeof metaValue?.totalPages === "number" && metaValue.totalPages > 0
      ? metaValue.totalPages
      : Math.max(1, Math.ceil(total / safeSize));
  const safePage =
    typeof metaValue?.page === "number" && metaValue.page > 0
      ? Math.min(metaValue.page, totalPages)
      : Math.min(page, totalPages);
  const next =
    typeof metaValue?.next === "number" && metaValue.next > safePage
      ? Math.min(metaValue.next, totalPages)
      : safePage < totalPages
        ? safePage + 1
        : safePage;

  return {
    page: safePage,
    next,
    totalPages,
    total,
    size: safeSize,
  };
}

function getNextPage(metaValue: meta | undefined): number | null {
  if (!metaValue || metaValue.page >= metaValue.totalPages) {
    return null;
  }

  if (metaValue.next > metaValue.page) {
    return metaValue.next;
  }

  return metaValue.page + 1;
}

export function usePaginatedCachedResource<
  TItem,
  TResponse extends PaginatedResponse<TItem>,
>(
  options: PaginatedOptions<TItem, TResponse>,
): PaginatedResult<TItem, TResponse> {
  const {
    cacheKey,
    initialData,
    enabled,
    pageSize = DEFAULT_PAGE_SIZE,
    fetchPage,
    getItemKey,
    hasUsableCachedData = (data) => data !== null,
  } = options;

  const [data, setData] = useState<TResponse>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const dataRef = useRef<TResponse>(initialData);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const normalizePageData = useCallback(
    (response: TResponse, page: number, items: TItem[]) => {
      return {
        ...response,
        data: items,
        meta: normalizeMeta(response.meta, items.length, page, pageSize),
      } as TResponse;
    },
    [pageSize],
  );

  const mergePageData = useCallback(
    (currentData: TResponse, incomingData: TResponse, page: number) => {
      const incomingItems = Array.isArray(incomingData.data)
        ? incomingData.data
        : [];
      if (page <= 1) {
        return normalizePageData(incomingData, 1, incomingItems);
      }

      const mergedItems = getItemKey
        ? Array.from(
            new Map(
              [...currentData.data, ...incomingItems].map((item) => [
                String(getItemKey(item)),
                item,
              ]),
            ).values(),
          )
        : [...currentData.data, ...incomingItems];

      return normalizePageData(incomingData, page, mergedItems);
    },
    [getItemKey, normalizePageData],
  );

  const replaceData = useCallback(
    async (nextData: TResponse) => {
      setData(nextData);
      dataRef.current = nextData;
      await setCacheData(cacheKey, nextData);
    },
    [cacheKey],
  );

  const reload = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let hasCachedData = false;

    try {
      setIsLoading(true);
      setIsError(false);

      const cachedData = await getCacheData<TResponse>(cacheKey);
      if (hasUsableCachedData(cachedData)) {
        setData(cachedData as TResponse);
        dataRef.current = cachedData as TResponse;
        hasCachedData = true;
      }

      const freshData = await fetchPage(1, pageSize);
      await replaceData(normalizePageData(freshData, 1, freshData.data ?? []));
      setIsOfflineMode(false);
    } catch {
      if (!hasCachedData) {
        setData(initialData);
        dataRef.current = initialData;
      }
      setIsError(true);
      setIsOfflineMode(true);
    } finally {
      setIsLoading(false);
    }
  }, [
    cacheKey,
    enabled,
    fetchPage,
    hasUsableCachedData,
    initialData,
    normalizePageData,
    pageSize,
    replaceData,
  ]);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setIsRefreshing(false);
      return;
    }

    try {
      setIsRefreshing(true);
      const freshData = await fetchPage(1, pageSize);
      await replaceData(normalizePageData(freshData, 1, freshData.data ?? []));
      setIsOfflineMode(false);
      setIsError(false);
    } catch {
      setIsError(true);
      setIsOfflineMode(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [enabled, fetchPage, normalizePageData, pageSize, replaceData]);

  const loadMore = useCallback(async () => {
    if (!enabled || isLoading || isLoadingMore) {
      return;
    }

    const nextPage = getNextPage(dataRef.current.meta);
    if (!nextPage) {
      return;
    }

    try {
      setIsLoadingMore(true);
      const freshData = await fetchPage(nextPage, pageSize);
      const mergedData = mergePageData(dataRef.current, freshData, nextPage);
      await replaceData(mergedData);
      setIsOfflineMode(false);
      setIsError(false);
    } catch {
      setIsError(true);
      setIsOfflineMode(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    enabled,
    fetchPage,
    isLoading,
    isLoadingMore,
    mergePageData,
    pageSize,
    replaceData,
  ]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    data,
    setData,
    isLoading,
    isRefreshing,
    isLoadingMore,
    isError,
    isOfflineMode,
    hasNextPage: getNextPage(data.meta) !== null,
    reload,
    refresh,
    loadMore,
  };
}
