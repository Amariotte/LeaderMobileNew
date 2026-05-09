import apiConfig from "@/config/api";
import {
  clientsFakeData,
  contratsFakeData,
  cotationsFakeData,
  vehiculesFakeData
} from "@/data/datas.fake";
import { CompagnieFakeData, parametresFakeData, professionsFakeData } from "@/data/fake/params.fake";
import { isModeDemoEnabled } from "@/tools/tools";
import { client, listClients } from "@/types/client.type";
import { contrat, listContrats } from "@/types/contrat.type";
import {
  cotation,
  cotationLigneEdit,
  deleteCotationLigneEdit,
  listCotation,
} from "@/types/devis.type";
import {
  itemDefaut,
  PaginationParams,
  parametresData,
  params
} from "@/types/other.type";
import { listStockCourtier, listStockPartenaire, listStockProducteur, stockCourtier, stockCourtierForm } from "@/types/stock.type";
import { listVehicules, vehicule } from "@/types/vehicule.type";
import { getJsonAuth, postJsonAuth, putJsonAuth } from "./api-client";
import { fetchPaginatedList } from "./pagination-service";

const LIMIT_RECENT_TRANSACTIONS = process.env
  .EXPO_PUBLIC_NBRE_RECENT_TRANSACTIONS
  ? Number(process.env.EXPO_PUBLIC_NBRE_RECENT_TRANSACTIONS)
  : 20;


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
        categorie: "ANNULÉ",
      };
      return contratsFakeData.data[idx];
    }
    throw new Error("Police introuvable");
  }
  return putJsonAuth<contrat, Partial<contrat>>(
    `${apiConfig.endpoints.contrats}/${id}/annuler`,
    token,
    { categorie: "ANNULÉ" },
  );
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

export async function createVehicule(
  token: string,
  data: Partial<vehicule>,
): Promise<vehicule> {
  if (isModeDemoEnabled()) {
    const newVehicule: vehicule = {
      id: Math.max(...vehiculesFakeData.data.map((v) => v.id), 0) + 1,
      clientId: data.clientId ?? 0,
      numImmatriculation: data.numImmatriculation ?? "",
      dateImmatriculation: data.dateImmatriculation ?? new Date(),
      dateMiseEnCirculation: data.dateMiseEnCirculation ?? new Date(),
      numSerie: data.numSerie ?? "",
      numCarteGrise: data.numCarteGrise ?? "",
      numMoteur: data.numMoteur ?? "",
      nbPlaces: data.nbPlaces ?? 0,
      chargeUtile: data.chargeUtile ?? 0,
      cylindree: data.cylindree ?? 0,
      puissance: data.puissance ?? 0,
      nbCartes: data.nbCartes ?? 0,
      valeurNeuve: data.valeurNeuve ?? 0,
      valeurVenale: data.valeurVenale ?? 0,
      modele: data.modele ?? "",
      typeCommercial: data.typeCommercial ?? "",
      commentaires: data.commentaires ?? "",
      usageId: data.usageId ?? 0,
      groupeZoneId: data.groupeZoneId ?? 0,
      genreId: data.genreId ?? 0,
      typeId: data.typeId ?? 0,
      carrosserieId: data.carrosserieId ?? 0,
      energieId: data.energieId ?? 0,
      marqueId: data.marqueId ?? 0,
      couleurId: data.couleurId ?? 0,
      categorieId: data.categorieId ?? 0,
      sousCategorieId: data.sousCategorieId ?? 0,
      villeId: data.villeId ?? 0,
      zoneCirculationId: data.zoneCirculationId ?? 0,
      luiMemeAssure: data.luiMemeAssure ?? true,
      assure: data.assure
    };

    vehiculesFakeData.data.unshift(newVehicule);
    return newVehicule;
  }
  const d = await postJsonAuth<vehicule, Partial<vehicule>>( apiConfig.endpoints.vehicules, token, data);

  return d ;
}

export async function updateVehicule(
  token: string,
  id: number,
  data: Partial<vehicule>,
): Promise<vehicule> {
  if (isModeDemoEnabled()) {
    const index = vehiculesFakeData.data.findIndex((v) => v.id === id);
    if (index === -1) {
      throw new Error("Véhicule introuvable");
    }

    vehiculesFakeData.data[index] = {
      ...vehiculesFakeData.data[index],
      ...data,
      id,
    };

    return vehiculesFakeData.data[index];
  }

  return putJsonAuth<vehicule, Partial<vehicule>>(
    `${apiConfig.endpoints.vehicules}/${id}`,
    token,
    data,
  );
}

export async function getfetchMonStock(token: string): Promise<listStockProducteur> {
  if (isModeDemoEnabled()) {
    return { data: [] };
  }
  const payload = await getJsonAuth<listStockProducteur>(apiConfig.endpoints.stockMe, token);
    return payload
}

export async function getfetchStockProducteurs(token: string): Promise<listStockProducteur> {
  if (isModeDemoEnabled()) {
    return { data: [] };
  }
  
  const payload = await getJsonAuth<listStockProducteur>(apiConfig.endpoints.stockProducteurs, token);
  return payload

}

export async function getfetchStockCourtiers(token: string): Promise<listStockCourtier> {
  if (isModeDemoEnabled()) {
    return { data: [] };
  }

  const payload = await getJsonAuth<listStockCourtier>(apiConfig.endpoints.stockCourtiers, token);
  return payload
  
}

export async function getfetchStockPartenaires(token: string): Promise<listStockPartenaire> {
  if (isModeDemoEnabled()) {
    return { data: [] };
  }
  
  const payload = await getJsonAuth<listStockPartenaire>(apiConfig.endpoints.stockPartenaires, token);
   return payload

}


export async function getfetchParametres(token: string,tabParams: params[]): Promise<parametresData> {
  if (isModeDemoEnabled()) {
    return parametresFakeData;
  }

  const parameters: string = tabParams.join(",");
  const finalUrl = apiConfig.endpoints.parametres + "?param="+parameters;

  console.log("URL finale pour les paramètres :", finalUrl);

  const payload = await getJsonAuth<parametresData>(finalUrl, token);
    return payload
}

export async function getfetchProfessions(token: string): Promise<itemDefaut[]> {
  if (isModeDemoEnabled()) {
    return professionsFakeData;
  }

  const payload = await getfetchParametres(token, [params.PROFESSIONS]);
  return payload.professions?.data ?? [];
}

export async function getfetchCompagnies(token: string): Promise<itemDefaut[]> {
  if (isModeDemoEnabled()) {
    return CompagnieFakeData;
  }

  const payload = await getfetchParametres(token, [params.COMPAGNIES]);
  return payload.compagnies?.data ?? [];
}


export async function movementStockCourtier(
  token: string,
  data: stockCourtierForm,
): Promise<stockCourtier> {

  if (isModeDemoEnabled()) {
    const newStockCourtier: stockCourtier = {
      compagnieId: data.compagnieId,
      compagnieNom: `Compagnie ${data.compagnieId}`,
    }
   
    return newStockCourtier;
  }
  const d = await postJsonAuth<stockCourtier, stockCourtierForm>( apiConfig.endpoints.stockCourtiers, token, data);
  return d ;
}
