import apiConfig from "@/config/api";
import { CompagnieFakeData, parametresFakeData, permissionsFakeData, professionsFakeData } from "@/data/fake/params.fake";
import { isModeDemoEnabled } from "@/tools/tools";
import {
  itemDefaut,
  parametresData,
  params,
  permission
} from "@/types/other.type";
import { getJsonAuth } from "./api-client";


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

export async function getfetchPermissions(token: string,typeUser:number): Promise<permission[]> {
  if (isModeDemoEnabled()) {
    return permissionsFakeData || [];
  }

  const payload = await getJsonAuth<permission[]>(apiConfig.endpoints.permissions + "/"+typeUser, token);
    return payload
}

export async function getfetchCompagnies(token: string): Promise<itemDefaut[]> {
  if (isModeDemoEnabled()) {
    return CompagnieFakeData;
  }

  const payload = await getfetchParametres(token, [params.COMPAGNIES]);
  return payload.compagnies?.data ?? [];
}