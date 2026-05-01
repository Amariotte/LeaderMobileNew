import apiConfig from "@/config/api";
import {
  clientsFakeData,
  contratsFakeData,
  cotationsFakeData,
  dataChartsFakeData,
  mouvementsFakeData,
  operationsFakeData,
  produitsFakeData,
  reglementsFakeData,
  soldeFake,
  statsFake,
  vehiculesFakeData,
} from "@/data/datas.fake";
import { isModeDemoEnabled } from "@/tools/tools";
import { client, listClients } from "@/types/client.type";
import { contrat, listContrats } from "@/types/contrat.type";
import {
  cotation,
  cotationLigneEdit,
  deleteCotationLigneEdit,
  listCotation,
} from "@/types/devis.type";
import { encaissementPrime, listEncaissementsPrimes } from "@/types/encaissementPrime.type";
import { listMouvements } from "@/types/mouvements.type";
import { listOperations, operation } from "@/types/operations.type";
import {
  dataChart,
  meta,
  PaginatedResponse,
  PaginationParams,
  stat,
} from "@/types/other.type";
import { listProduits } from "@/types/produits.type";
import { SoldeResponse } from "@/types/solde.type";
import { stockCourtier, stockPartenaire, stockProducteur } from "@/types/stock.type";
import { listVehicules, vehicule } from "@/types/vehicule.type";
import { getJsonAuth, postJsonAuth, putJsonAuth } from "./api-client";

const LIMIT_RECENT_TRANSACTIONS = process.env
  .EXPO_PUBLIC_NBRE_RECENT_TRANSACTIONS
  ? Number(process.env.EXPO_PUBLIC_NBRE_RECENT_TRANSACTIONS)
  : 20;
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

async function fetchPaginatedList<
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

function parseSoldeValue(
  rawBalance: number | string | null | undefined,
): number {
  const parsedBalance = Number(rawBalance);

  if (Number.isNaN(parsedBalance)) {
    throw new Error("Format de solde invalide");
  }

  return parsedBalance;
}

export function getSoldeFromFakeData(): number {
  return parseSoldeValue(soldeFake.solde);
}

export async function fetchMonStock(token: string): Promise<number> {
  if (isModeDemoEnabled()) {
    return getSoldeFromFakeData();
  }

  const payload = await getJsonAuth<SoldeResponse>(
    apiConfig.endpoints.stockMe,
    token,
  );
  return parseSoldeValue(payload?.solde);
}

export async function getAllClients(token: string): Promise<listClients> {
  if (isModeDemoEnabled()) {
    return clientsFakeData;
  }

  const data = await getJsonAuth<listClients>(
    `${apiConfig.endpoints.clients}`,
    token,
  );

  return data;
}

export async function getfetchClients(token: string): Promise<listClients> {
  if (isModeDemoEnabled()) {
    return clientsFakeData;
  }

  const data = await getJsonAuth<listClients>(
    `${apiConfig.endpoints.clients}`,
    token,
  );

  return data;
}

export async function getStats(token: string): Promise<stat> {
  if (isModeDemoEnabled()) {
    return statsFake;
  }

  const payload = await getJsonAuth<stat>(apiConfig.endpoints.stats, token);
  return payload;
}

export async function getfetchContrats(
  token: string,
  params?: PaginationParams,
): Promise<listContrats> {
  const d = await fetchPaginatedList(
    token,
    apiConfig.endpoints.contrats,
    params,
    contratsFakeData,
  );
  return d;
}

export async function getfetchCotations(token: string): Promise<listCotation> {
  if (isModeDemoEnabled()) {
    return cotationsFakeData;
  }

  const data = await getJsonAuth<listCotation>(
    `${apiConfig.endpoints.cotations}`,
    token,
  );

  return data;
}

export async function getfetchContratById(
  token: string,
  id: number,
): Promise<contrat | null> {
  if (isModeDemoEnabled()) {
    return contratsFakeData.data.filter((c) => c.id === id).length > 0
      ? contratsFakeData.data.filter((c) => c.id === id)[0]
      : null;
  }

  const d = await getJsonAuth<contrat>(
    `${apiConfig.endpoints.contrats}/${id}`,
    token,
  );

  return d;
}

export async function getfetchOperationById(
  token: string,
  id: number,
): Promise<operation | null> {
  if (isModeDemoEnabled()) {
    return operationsFakeData.data.filter((operation) => operation.id === id)
      .length > 0
      ? operationsFakeData.data.filter((operation) => operation.id === id)[0]
      : null;
  }

  const d = await getJsonAuth<operation>(
    `${apiConfig.endpoints.operations}/${id}`,
    token,
  );

  return d;
}

export async function getfetchEncaissementPrimeById(
  token: string,
  id: number,
): Promise<encaissementPrime | null> {
  if (isModeDemoEnabled()) {
    return reglementsFakeData.data.filter((reglement) => reglement.id === id)
      .length > 0
      ? reglementsFakeData.data.filter((reglement) => reglement.id === id)[0]
      : null;
  }

  const d = await getJsonAuth<encaissementPrime>(
    `${apiConfig.endpoints.encaissementsPrimes}/${id}`,
    token,
  );

  return d;
}


export async function getfetchCotationById(
  token: string,
  id: number,
): Promise<cotation | null> {
  if (isModeDemoEnabled()) {
    return cotationsFakeData.data.filter((cotation) => cotation.id === id).length > 0
      ? cotationsFakeData.data.filter((cotation) => cotation.id === id)[0]
      : null;
  }

  const d = await getJsonAuth<cotation>(
    `${apiConfig.endpoints.cotations}/${id}`,
    token,
  );

  return d;
}

export async function postCotationLigne(
  token: string,
  ligne: cotationLigneEdit,
  cotationId?: number,
): Promise<cotation | null> {
  if (isModeDemoEnabled()) {
    if (!cotationId) {
      return null;
    }

    const found = cotationsFakeData.data.find((cotation) => cotation.id === cotationId);
    return found ?? null;
  }

  const endpoint = cotationId
    ? `${apiConfig.endpoints.cotations}/${cotationId}`
    : `${apiConfig.endpoints.cotations}`;

  const d = await postJsonAuth<cotation, cotationLigneEdit>(endpoint, token, ligne);
  return d;
}

export async function updateCotationLigne(
  token: string,
  cotationId: number,
  ligneId: number,
  ligne: cotationLigneEdit,
): Promise<cotation | null> {
  if (isModeDemoEnabled()) {
    const found = cotationsFakeData.data.find((cotation) => cotation.id === cotationId);
    return found ?? null;
  }

  const d = await postJsonAuth<cotation, cotationLigneEdit>(
    `${apiConfig.endpoints.cotations}/${cotationId}/lignes/${ligneId}`,
    token,
    ligne,
  );

  return d;
}

export async function deleteCotationLigne(
  token: string,
  cotationId: number,
  ligneId: number,
  ligne: deleteCotationLigneEdit,
): Promise<cotation | null> {
  if (isModeDemoEnabled()) {
    const found = cotationsFakeData.data.find((cotation) => cotation.id === cotationId);
    return found ?? null;
  }

  const endpoint = `${apiConfig.endpoints.cotations}/${cotationId}/lignes/${ligneId}/delete`;
  const d = await postJsonAuth<cotation, deleteCotationLigneEdit>(
    endpoint,
    token,
    ligne,
  );

  return d;
}

export async function deleteCotation(token: string, id: number): Promise<boolean> {
  if (isModeDemoEnabled()) {
    const initialLength = cotationsFakeData.data.length;
    cotationsFakeData.data = cotationsFakeData.data.filter(
      (cotation) => cotation.id !== id,
    );
    return cotationsFakeData.data.length < initialLength;
  }

  await getJsonAuth<null>(`${apiConfig.endpoints.cotations}/${id}/delete`, token);
  return true;
}

export async function getfetchOperations(
  token: string,
): Promise<listOperations> {
  if (isModeDemoEnabled()) {
    return operationsFakeData;
  }

  const data = await getJsonAuth<listOperations>(
    `${apiConfig.endpoints.operations}`,
    token,
  );
  return data;
}

export async function getfetchEncaissementsPrimes(
  token: string,
): Promise<listEncaissementsPrimes> {
  if (isModeDemoEnabled()) {
    return reglementsFakeData;
  }

  const data = await getJsonAuth<listEncaissementsPrimes>(
    `${apiConfig.endpoints.encaissementsPrimes}`,
    token,
  );
  return data;
}

export async function getfetchStatistiques(
  token: string,
): Promise<dataChart[]> {
  if (isModeDemoEnabled()) {
    return dataChartsFakeData;
  }

  const data = await getJsonAuth<dataChart[]>(
    `${apiConfig.endpoints.statistiques}`,
    token,
  );
  return data;
}

export async function getfetchRecentMouvements(
  token: string,
): Promise<listMouvements> {
  if (isModeDemoEnabled()) {
    return getRecentMouvementsFromFakeData();
  }

  const data = await getJsonAuth<listMouvements>(
    `${apiConfig.endpoints.mouvements}?size=${LIMIT_RECENT_TRANSACTIONS}`,
    token,
  );
  return data;
}

export function getRecentMouvementsFromFakeData(): listMouvements {
  return {
    ...mouvementsFakeData,
    data: mouvementsFakeData.data.slice(0, LIMIT_RECENT_TRANSACTIONS),
  };
}

export async function getfetchMouvements(
  token: string,
  params?: PaginationParams,
): Promise<listMouvements> {
  const data = await fetchPaginatedList(
    token,
    `${apiConfig.endpoints.mouvements}`,
    params,
    mouvementsFakeData,
  );
  return data;
}

export async function postValidateCotation(
  token: string,
  id: number,
): Promise<cotation | null> {
  if (isModeDemoEnabled()) {
    const initialLength = cotationsFakeData.data.length;
    cotationsFakeData.data = cotationsFakeData.data.filter(
      (cotation) => cotation.id !== id,
    );
    return cotationsFakeData.data.length < initialLength
      ? (cotationsFakeData.data.find((cotation) => cotation.id === id) ?? null)
      : null;
  }

  const d = await getJsonAuth<cotation>(
    `${apiConfig.endpoints.cotations}/${id}/validate`,
    token,
  );
  return d;
}

export async function postSaveCotation(
  token: string,
  id: number,
): Promise<cotation | null> {
  if (isModeDemoEnabled()) {
    const initialLength = cotationsFakeData.data.length;
    cotationsFakeData.data = cotationsFakeData.data.filter(
      (cotation) => cotation.id !== id,
    );
    return cotationsFakeData.data.length < initialLength
      ? (cotationsFakeData.data.find((cotation) => cotation.id === id) ?? null)
      : null;
  }

  const d = await getJsonAuth<cotation>(
    `${apiConfig.endpoints.cotations}/${id}/save`,
    token,
  );
  return d;
}

export async function createClient(
  token: string,
  data: Partial<client>,
): Promise<client> {
  if (isModeDemoEnabled()) {
    const newClient: client = {
      id: Math.max(...clientsFakeData.data.map((c) => c.id), 0) + 1,
      ...data,
    } as client;
    clientsFakeData.data.unshift(newClient);
    return newClient;
  }
  return postJsonAuth<client, Partial<client>>(
    apiConfig.endpoints.clients,
    token,
    data,
  );
}

export async function updateClient(
  token: string,
  id: number,
  data: Partial<client>,
): Promise<client> {
  if (isModeDemoEnabled()) {
    const index = clientsFakeData.data.findIndex((c) => c.id === id);
    if (index !== -1) {
      clientsFakeData.data[index] = { ...clientsFakeData.data[index], ...data };
      return clientsFakeData.data[index];
    }
    throw new Error("Client introuvable");
  }
  return putJsonAuth<client, Partial<client>>(
    `${apiConfig.endpoints.clients}/${id}`,
    token,
    data,
  );
}

export async function getfetchVehicules(
  token: string,
  clientId?: number,
): Promise<listVehicules> {
  if (isModeDemoEnabled()) {
    if (clientId !== undefined) {
      return {
        ...vehiculesFakeData,
        data: vehiculesFakeData.data.filter((v: vehicule) => v.clientId === clientId),
      };
    }
    return vehiculesFakeData;
  }

  const endpoint = clientId !== undefined
    ? `${apiConfig.endpoints.vehicules}?client=${clientId}`
    : apiConfig.endpoints.vehicules;

  const data = await getJsonAuth<listVehicules>(endpoint, token);
  return data;
}

export async function getAllProduits(token: string): Promise<listProduits> {
  if (isModeDemoEnabled()) {
    return produitsFakeData;
  }
  return getJsonAuth<listProduits>(apiConfig.endpoints.produits, token);
}

export async function getfetchMonStock(token: string): Promise<stockProducteur[]> {
  if (isModeDemoEnabled()) {
    return [];
  }
  const data = await getJsonAuth<stockProducteur[]>(apiConfig.endpoints.stockMe, token);
  return data ?? [];
}

export async function getfetchStockProducteurs(token: string): Promise<stockProducteur[]> {
  if (isModeDemoEnabled()) {
    return [];
  }
  const data = await getJsonAuth<stockProducteur[]>(apiConfig.endpoints.stockProducteurs, token);
  return data ?? [];
}

export async function getfetchStockCourtiers(token: string): Promise<stockCourtier[]> {
  if (isModeDemoEnabled()) {
    return [];
  }
  const data = await getJsonAuth<stockCourtier[]>(apiConfig.endpoints.stockCourtiers, token);
  return data ?? [];
}

export async function getfetchStockPartenaires(token: string): Promise<stockPartenaire[]> {
  if (isModeDemoEnabled()) {
    return [];
  }
  const data = await getJsonAuth<stockPartenaire[]>(apiConfig.endpoints.stockPartenaires, token);
  return data ?? [];
}