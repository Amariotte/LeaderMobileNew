import apiConfig from "@/config/api";

import { listAgencesDataFake, listPartenairesDataFake } from "@/data/fake/partenaires.fake";
import { isModeDemoEnabled } from "@/tools/tools";
import { agence, listAgences } from "@/types/agences";
import { listPartenaires } from "@/types/partenaires";
import { getJsonAuth } from "./api-client";


export async function getfetchPartenaires(token: string): Promise<listPartenaires> {
  if (isModeDemoEnabled()) {
    return  listPartenairesDataFake;
  } 
  const payload = await getJsonAuth<listPartenaires>(`${apiConfig.endpoints.partenaires}`, token);
  return payload
}


export async function getfetchAgences(token: string,idPartenaire: number): Promise<listAgences> {
  if (isModeDemoEnabled()) {
    return  listAgencesDataFake;
  } 
  const payload = await getJsonAuth<listAgences>(`${apiConfig.endpoints.agences.replace("{idPartenaire}", idPartenaire.toString())}`, token);
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

