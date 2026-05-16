import apiConfig from "@/config/api";
import {
  clientsFakeData,
  vehiculesFakeData
} from "@/data/datas.fake";
import { listUtilisateursFake } from "@/data/fake/user.fake";
import { isModeDemoEnabled } from "@/tools/tools";
import { client, listClients } from "@/types/client.type";
import {
  successMessage
} from "@/types/other.type";
import { listUtilisateurs, utilisateur } from "@/types/utilisateurs";
import { listVehicules, vehicule } from "@/types/vehicule.type";
import { deleteJsonAuth, getJsonAuth, postJsonAuth, putAuthNoBody, putJsonAuth } from "./api-client";

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


export async function deleteClient(
  token: string,
  id: number,
): Promise<successMessage> {
  if (isModeDemoEnabled()) {
    const index = clientsFakeData.data.findIndex((c) => c.id === id);
    if (index !== -1) {
      clientsFakeData.data.splice(index, 1);
      return { message: "Client supprimé avec succès" };
    }

    throw new Error("Client introuvable");
  }
  return deleteJsonAuth<successMessage>(
    `${apiConfig.endpoints.clients}/${id}`,
    token,
  );
}

export async function deleteVehicule(
  token: string,
  id: number,
): Promise<successMessage> {
  if (isModeDemoEnabled()) {
    const index = vehiculesFakeData.data.findIndex((v) => v.id === id);
    if (index !== -1) {
      vehiculesFakeData.data.splice(index, 1);
      return { message: "Véhicule supprimé avec succès" };
    }

    throw new Error("Véhicule introuvable");
  }
  return deleteJsonAuth<successMessage>(
    `${apiConfig.endpoints.vehicules}/${id}`,
    token,
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



export async function getfetchBasesVehicules(
  token: string,
  clientId?: number,
  immatriculation?: string
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

  const params = new URLSearchParams();
  if (clientId !== undefined) {
    params.append('client', clientId.toString());
  }
  if (immatriculation) {
    params.append('immatriculation', immatriculation);
  }

  const endpoint = params.toString()
    ? `${apiConfig.endpoints.basesVehicules}?${params.toString()}`
    : apiConfig.endpoints.basesVehicules;

  const data = await getJsonAuth<listVehicules>(endpoint, token);
  return data;
}



export async function getfetchUtilisateurs(
  token: string,
  partenaireId?: number,
): Promise<listUtilisateurs> {
  if (isModeDemoEnabled()) {
    if (partenaireId !== undefined) {
      return {
        ...listUtilisateursFake,
        data: listUtilisateursFake.data.filter((v: utilisateur) => v.partenaireId === partenaireId),
      };
    }
    return listUtilisateursFake;
  }

  const endpoint = partenaireId !== undefined
    ? `${apiConfig.endpoints.utilisateurs}?partenaire=${partenaireId}`
    : apiConfig.endpoints.utilisateurs;

  const data = await getJsonAuth<listUtilisateurs>(endpoint, token);
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

export async function createUtilisateur(
  token: string,
  data: Partial<utilisateur>,
): Promise<utilisateur> {
  if (isModeDemoEnabled()) {
    const newUtilisateur: utilisateur = {
      id: Math.max(...listUtilisateursFake.data.map((v) => v.id), 0) + 1,
      nom: data.nom ?? "",
      login: data.login ?? "",
      email: data.email ?? "",
      contacts: data.contacts ?? "",
      compteActive: data.compteActive ?? true,
      superUser: data.superUser ?? false,
      typeUser: data.typeUser ?? 1,
      partenaireNom: data.partenaireNom ?? "",
    };
    
    listUtilisateursFake.data.unshift(newUtilisateur);
    return newUtilisateur;
  }

     console.log("Payload des createUtilisateur :", data);

  const d = await postJsonAuth<utilisateur, Partial<utilisateur>>( apiConfig.endpoints.utilisateurs, token, data);

  return d ;
}

export async function updateUtilisateur(
  token: string,
  id: number,
  data: Partial<utilisateur>,
): Promise<utilisateur> {
  if (isModeDemoEnabled()) {
    const index = listUtilisateursFake.data.findIndex((v) => v.id === id);
    if (index === -1) {
      throw new Error("Utilisateur introuvable");
    }

    listUtilisateursFake.data[index] = {
      ...listUtilisateursFake.data[index],
      ...data,
      id,
    };

    return listUtilisateursFake.data[index];
  }
  const d = await putJsonAuth<utilisateur, Partial<utilisateur>>(
    `${apiConfig.endpoints.utilisateurs}/${id}`,
    token,
    data,
  );

  return d ;
}


export async function desactivationUtilisateur(token: string, id: number): Promise<utilisateur> {
  if (isModeDemoEnabled()) {
    const index = listUtilisateursFake.data.findIndex((p) => p.id === id);
    if (index !== -1) listUtilisateursFake.data.splice(index, 1);
    return index !== -1
      ? { ...listUtilisateursFake.data[index], compteActive: false }
      : { id, nom: "", compteActive: false } as utilisateur;
  }

  return putAuthNoBody<utilisateur>(`${apiConfig.endpoints.utilisateurs}/${id}/desactivations`, token);
}

export async function activationUtilisateur(token: string, id: number): Promise<utilisateur> {
  if (isModeDemoEnabled()) {
    const index = listUtilisateursFake.data.findIndex((p) => p.id === id);
    if (index !== -1) listUtilisateursFake.data.splice(index, 1);
    return index !== -1
      ? { ...listUtilisateursFake.data[index], compteActive: true }
      : { id, nom: "", compteActive: true } as utilisateur;
  }
  return putAuthNoBody<utilisateur>(`${apiConfig.endpoints.utilisateurs}/${id}/activations`, token);
}
