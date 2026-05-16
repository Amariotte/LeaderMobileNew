import apiConfig from "@/config/api";
import {
  contratsFakeData,
  cotationsFakeData
} from "@/data/datas.fake";
import { isModeDemoEnabled } from "@/tools/tools";
import { contrat, listContrats } from "@/types/contrat.type";
import {
  listCotation
} from "@/types/devis.type";
import {
  PaginationParams
} from "@/types/other.type";
import { getJsonAuth, postJsonAuth, putJsonAuth } from "./api-client";
import { fetchPaginatedList } from "./pagination-service";

const LIMIT_RECENT_TRANSACTIONS = process.env
  .EXPO_PUBLIC_NBRE_RECENT_TRANSACTIONS
  ? Number(process.env.EXPO_PUBLIC_NBRE_RECENT_TRANSACTIONS)
  : 20;


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

export async function annulerPolice(
  token: string,
  id: number,
): Promise<contrat> {
  if (isModeDemoEnabled()) {
    const idx = contratsFakeData.data.findIndex((c) => c.id === id);
    if (idx !== -1) {
      contratsFakeData.data[idx] = {
        ...contratsFakeData.data[idx],
        categorie: 100,
      };
      return contratsFakeData.data[idx];
    }
    throw new Error("Police introuvable");
  }
  return putJsonAuth<contrat, Partial<contrat>>(
    `${apiConfig.endpoints.contrats}/${id}/annuler`,
    token,
    { categorie: 100 },
  );
}

export async function createContrat(
  token: string,
  data: Partial<contrat>,
): Promise<contrat> {
  if (isModeDemoEnabled()) {
    const newContrat: contrat = {
      ...data,
    } as contrat;
    contratsFakeData.data.unshift(newContrat);
    return newContrat;
  }
  return postJsonAuth<contrat, Partial<contrat>>(
    apiConfig.endpoints.contrats,
    token,
    data,
  );
}

export async function updateContrat(
  token: string,
  id: number,
  data: Partial<contrat>,
): Promise<contrat> {
  if (isModeDemoEnabled()) {
    const index = contratsFakeData.data.findIndex((c) => c.id === id);
    if (index !== -1) {
      contratsFakeData.data[index] = { ...contratsFakeData.data[index], ...data };
      return contratsFakeData.data[index];
    }
    throw new Error("Contrat introuvable");
  }
  return putJsonAuth<contrat, Partial<contrat>>(
    `${apiConfig.endpoints.contrats}/${id}`,
    token,
    data,
  );
}
