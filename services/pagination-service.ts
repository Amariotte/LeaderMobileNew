import { isModeDemoEnabled } from "@/tools/tools";
import {
  meta,
  PaginatedResponse,
  PaginationParams
} from "@/types/other.type";
import { getJsonAuth } from "./api-client";

const DEFAULT_PAGE_SIZE = 20;

function normalizePaginationParams(
  params?: PaginationParams,
): Required<PaginationParams> {
  const page = Number.isFinite(params?.page)
    ? Math.max(1, Math.floor(params?.page ?? 1))
    : 1;
  const size = Number.isFinite(params?.size)
    ? Math.max(1, Math.floor(params?.size ?? DEFAULT_PAGE_SIZE))
    : DEFAULT_PAGE_SIZE;

  return { page, size };
}

function buildPaginationMeta(total: number, params?: PaginationParams): meta {
  const normalized = normalizePaginationParams(params);
  const totalPages = Math.max(1, Math.ceil(total / normalized.size));
  const page = Math.min(normalized.page, totalPages);

  return {
    page,
    next: page < totalPages ? page + 1 : page,
    totalPages,
    total,
    size: normalized.size,
  };
}

function buildPaginatedEndpoint(
  endpoint: string,
  params?: PaginationParams,
): string {
  const normalized = normalizePaginationParams(params);
  const separator = endpoint.includes("?") ? "&" : "?";

  return `${endpoint}${separator}page=${normalized.page}&size=${normalized.size}`;
}

function paginateFakeResponse<
  TItem,
  TResponse extends PaginatedResponse<TItem>,
>(source: TResponse, params?: PaginationParams): TResponse {
  const paginationMeta = buildPaginationMeta(source.data.length, params);
  const startIndex = (paginationMeta.page - 1) * paginationMeta.size;

  return {
    ...source,
    meta: paginationMeta,
    data: source.data.slice(startIndex, startIndex + paginationMeta.size),
  } as TResponse;
}

export async function fetchPaginatedList<
  TItem,
  TResponse extends PaginatedResponse<TItem>,
>(
  token: string,
  endpoint: string,
  params: PaginationParams | undefined,
  fakeData: TResponse,
): Promise<TResponse> {
  if (!params) {
    if (isModeDemoEnabled()) {
      return fakeData;
    }

    const firstPage = await getJsonAuth<TResponse>(
      buildPaginatedEndpoint(endpoint, { page: 1, size: DEFAULT_PAGE_SIZE }),
      token,
    );

    if (!firstPage?.meta) {
      return {
        ...firstPage,
        meta: buildPaginationMeta(firstPage?.data?.length ?? 0, params),
      } as TResponse;
    }

    const totalPages = Math.max(1, firstPage.meta.totalPages || 1);

    if (totalPages === 1) {
      return firstPage;
    }

    let mergedItems = Array.isArray(firstPage.data) ? [...firstPage.data] : [];

    for (let page = 2; page <= totalPages; page += 1) {
      const nextPage = await getJsonAuth<TResponse>(
        buildPaginatedEndpoint(endpoint, {
          page,
          size: firstPage.meta.size || DEFAULT_PAGE_SIZE,
        }),
        token,
      );

      if (Array.isArray(nextPage?.data) && nextPage.data.length > 0) {
        mergedItems = [...mergedItems, ...nextPage.data];
      }
    }

    return {
      ...firstPage,
      data: mergedItems,
      meta: buildPaginationMeta(mergedItems.length, {
        page: 1,
        size: mergedItems.length || 1,
      }),
    } as TResponse;
  }

  if (isModeDemoEnabled()) {
    return paginateFakeResponse(fakeData, params);
  }

  const response = await getJsonAuth<TResponse>(
    buildPaginatedEndpoint(endpoint, params),
    token,
  );

  if (response?.meta) {
    return response;
  }

  return {
    ...response,
    meta: buildPaginationMeta(response?.data?.length ?? 0, params),
  } as TResponse;
}