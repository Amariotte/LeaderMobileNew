import apiConfig from "@/config/api";

import { listAgencesDataFake, listPartenairesDataFake } from "@/data/fake/partenaires.fake";
import { isModeDemoEnabled } from "@/tools/tools";
import { agence, listAgences } from "@/types/agences";
import { listPartenaires, partenaire } from "@/types/partenaires";
import { deleteJsonAuth, getJsonAuth, postJsonAuth, putAuthNoBody, putJsonAuth } from "./api-client";


export async function getfetchPartenaires(token: string): Promise<listPartenaires> {
  if (isModeDemoEnabled()) {
    return  listPartenairesDataFake;
  } 
  const payload = await getJsonAuth<listPartenaires>(`${apiConfig.endpoints.partenaires}`, token);
   console.log("Payload des partenaires :", payload);

  return payload
}


export async function getfetchAgences(token: string,idPartenaire: number): Promise<listAgences> {
  if (isModeDemoEnabled()) {
    return  listAgencesDataFake;
  } 
  const payload = await getJsonAuth<listAgences>(`${apiConfig.endpoints.agences.replace("{idPartenaire}", idPartenaire.toString())}`, token);

  console.log("Payload des agences :", payload);
  return payload
}

export async function getfetchAgencesById(token: string,idPartenaire: number): Promise<agence> {
  if (isModeDemoEnabled()) {
    return  listAgencesDataFake.data.find((a) => a.id === idPartenaire) as agence;
  } 

  const url = `${apiConfig.endpoints.agences.replace("{idPartenaire}", idPartenaire.toString())}`+`/${idPartenaire}`;
  const payload = await getJsonAuth<agence>(url, token);
  return payload
}

export async function createPartenaire(token: string, data: Partial<partenaire>): Promise<partenaire> {
  if (isModeDemoEnabled()) {
    const fake: partenaire = { id: Date.now(), nom: data.nom ?? "", ...data };
    listPartenairesDataFake.data.unshift(fake);
    return fake;
  }
  return postJsonAuth<partenaire, Partial<partenaire>>(apiConfig.endpoints.partenaires, token, data);
}

export async function updatePartenaire(token: string, id: number, data: Partial<partenaire>): Promise<partenaire> {
  if (isModeDemoEnabled()) {
    const index = listPartenairesDataFake.data.findIndex((p) => p.id === id);
    if (index !== -1) {
      listPartenairesDataFake.data[index] = { ...listPartenairesDataFake.data[index], ...data };
      return listPartenairesDataFake.data[index];
    }
    return { id, nom: data.nom ?? "", ...data };
  }
  return putJsonAuth<partenaire, Partial<partenaire>>(`${apiConfig.endpoints.partenaires}/${id}`, token, data);
}

export async function deletePartenaire(token: string, id: number): Promise<{ message: string }> {
  if (isModeDemoEnabled()) {
    const index = listPartenairesDataFake.data.findIndex((p) => p.id === id);
    if (index !== -1) listPartenairesDataFake.data.splice(index, 1);
    return { message: "Partenaire supprimé avec succès." };
  }
  return deleteJsonAuth<{ message: string }>(`${apiConfig.endpoints.partenaires}/${id}`, token);
}


export async function desactivationPartenaire(token: string, id: number): Promise<partenaire> {
  if (isModeDemoEnabled()) {
    const index = listPartenairesDataFake.data.findIndex((p) => p.id === id);
    if (index !== -1) listPartenairesDataFake.data.splice(index, 1);

    return index !== -1
      ? { ...listPartenairesDataFake.data[index], etat: 3 }
      : { id, nom: "", etat: 3} as partenaire;
  }
  return putAuthNoBody<partenaire>(`${apiConfig.endpoints.partenaires}/${id}/desactivations`, token);
}

export async function activationPartenaire(token: string, id: number): Promise<partenaire> {
  if (isModeDemoEnabled()) {
    const index = listPartenairesDataFake.data.findIndex((p) => p.id === id);
    if (index !== -1) listPartenairesDataFake.data.splice(index, 1);
    return index !== -1
      ? { ...listPartenairesDataFake.data[index], etat: 2 }
      : { id, nom: "", etat: 2 } as partenaire;
  }
  return putAuthNoBody<partenaire>(`${apiConfig.endpoints.partenaires}/${id}/activations`, token);
}
