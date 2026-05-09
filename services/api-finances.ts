import apiConfig from "@/config/api";
import { operationsFakeData, reglementsFakeData } from "@/data/fake/finances.fake";
import { isModeDemoEnabled } from "@/tools/tools";
import { encaissementPrime, listEncaissementsPrimes } from "@/types/encaissementPrime.type";
import { listOperations, operation } from "@/types/operations.type";
import { deleteJsonAuth, getJsonAuth, postJsonAuth, putJsonAuth } from "./api-client";


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
  params?: { dateFrom?: string; dateTo?: string },
): Promise<listEncaissementsPrimes> {
  if (isModeDemoEnabled()) {
    return reglementsFakeData;
  }

  const query = new URLSearchParams();
  if (params?.dateFrom) query.append("dateFrom", params.dateFrom);
  if (params?.dateTo) query.append("dateTo", params.dateTo);
  const qs = query.toString();
  const url = qs
    ? `${apiConfig.endpoints.encaissementsPrimes}?${qs}`
    : apiConfig.endpoints.encaissementsPrimes;

  const data = await getJsonAuth<listEncaissementsPrimes>(url, token);
  return data;
}

export async function createEncaissementPrime(
  token: string,
  data: Partial<encaissementPrime>,
): Promise<encaissementPrime> {
  if (isModeDemoEnabled()) {
    const newItem: encaissementPrime = {
      ...data,
      id: Math.max(...reglementsFakeData.data.map((r) => Number(r.id)), 0) + 1,
      numero: `REG-${Date.now()}`,
      montantUtilise: 0,
      solde: Number(data.montant ?? 0),
    } as encaissementPrime;
    reglementsFakeData.data.unshift(newItem);
    return newItem;
  }
  return postJsonAuth<encaissementPrime, Partial<encaissementPrime>>(
    apiConfig.endpoints.encaissementsPrimes,
    token,
    data,
  );
}

export async function updateEncaissementPrime(
  token: string,
  id: number,
  data: Partial<encaissementPrime>,
): Promise<encaissementPrime> {
  if (isModeDemoEnabled()) {
    const index = reglementsFakeData.data.findIndex((r) => Number(r.id) === id);
    if (index !== -1) {
      reglementsFakeData.data[index] = { ...reglementsFakeData.data[index], ...data };
      return reglementsFakeData.data[index];
    }
    throw new Error("Encaissement introuvable");
  }
  return putJsonAuth<encaissementPrime, Partial<encaissementPrime>>(
    `${apiConfig.endpoints.encaissementsPrimes}/${id}`,
    token,
    data,
  );
}

export async function deleteEncaissementPrime(
  token: string,
  id: number,
): Promise<boolean> {
  if (isModeDemoEnabled()) {
    const initial = reglementsFakeData.data.length;
    reglementsFakeData.data = reglementsFakeData.data.filter((r) => Number(r.id) !== id);
    return reglementsFakeData.data.length < initial;
  }
  await deleteJsonAuth<null>(
    `${apiConfig.endpoints.encaissementsPrimes}/${id}`,
    token,
  );
  return true;
}

// ─── Opérations diverses ──────────────────────────────────────────────────────

export async function getfetchOperationsDiverses(
  token: string,
  params?: { dateFrom?: string; dateTo?: string },
): Promise<listOperations> {
  if (isModeDemoEnabled()) {
    return operationsFakeData;
  }
  const query = new URLSearchParams();
  if (params?.dateFrom) query.append("dateFrom", params.dateFrom);
  if (params?.dateTo) query.append("dateTo", params.dateTo);
  const qs = query.toString();
  const url = qs ? `${apiConfig.endpoints.operations}?${qs}` : apiConfig.endpoints.operations;
  return getJsonAuth<listOperations>(url, token);
}

export async function createOperationDiverse(
  token: string,
  data: Partial<operation>,
): Promise<operation> {
  if (isModeDemoEnabled()) {
    const newItem: operation = {
      ...data,
      id: Math.max(...operationsFakeData.data.map((o) => Number(o.id)), 0) + 1,
      numero: `OP-${Date.now()}`,
    } as operation;
    operationsFakeData.data.unshift(newItem);
    return newItem;
  }
  return postJsonAuth<operation, Partial<operation>>(
    apiConfig.endpoints.operations,
    token,
    data,
  );
}

export async function updateOperationDiverse(
  token: string,
  id: number,
  data: Partial<operation>,
): Promise<operation> {
  if (isModeDemoEnabled()) {
    const idx = operationsFakeData.data.findIndex((o) => Number(o.id) === id);
    if (idx !== -1) operationsFakeData.data[idx] = { ...operationsFakeData.data[idx], ...data };
    return operationsFakeData.data[idx];
  }
  return putJsonAuth<operation, Partial<operation>>(
    `${apiConfig.endpoints.operations}/${id}`,
    token,
    data,
  );
}

export async function deleteOperationDiverse(
  token: string,
  id: number,
): Promise<boolean> {
  if (isModeDemoEnabled()) {
    const initial = operationsFakeData.data.length;
    operationsFakeData.data = operationsFakeData.data.filter((o) => Number(o.id) !== id);
    return operationsFakeData.data.length < initial;
  }
  await deleteJsonAuth<null>(`${apiConfig.endpoints.operations}/${id}`, token);
  return true;
}