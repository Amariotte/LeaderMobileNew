import apiConfig from "@/config/api";
import { isModeDemoEnabled } from "@/tools/tools";
import { successMessage } from "@/types/other.type";
import { listStockCourtier, listStockPartenaire, listStockProducteur, stockCourtier, stockCourtierForm, stockPartenaire, stockPartenaireForm } from "@/types/stock.type";
import { getJsonAuth, putJsonAuth } from "./api-client";



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


export async function getfetchStockCourtierById(token: string,compagnieId: number): Promise<stockCourtier | undefined> {
  if (isModeDemoEnabled()) {
    return {
      compagnieNom: "Compagnie Demo",
      compagnieId: compagnieId,
    };
  }
  const url = `${apiConfig.endpoints.stockCourtiers}?compagnie=${compagnieId}`;
  const payload = await getJsonAuth<listStockCourtier>(url, token);
  return payload.data[0]  || undefined;
}


export async function getfetchStockPartenaireById(token: string,partenaireId: number, compagnieId: number,typeId: number): Promise<stockPartenaire | undefined> {
  if (isModeDemoEnabled()) {
    return {
      compagnieNom: "Compagnie Demo",
      compagnieId: compagnieId,
      partenaireId: partenaireId,
      partenaireNom: "Partenaire Demo",
      typeId: typeId,
      typeNom: "Type Demo",
    };
  }

  const url = `${apiConfig.endpoints.stockPartenaires}?compagnie=${compagnieId}&partenaire=${partenaireId}&type=${typeId}`;
  const payload = await getJsonAuth<listStockPartenaire>(url, token);
  return payload.data[0] || undefined;
  
}



export async function getfetchStockPartenaires(token: string): Promise<listStockPartenaire> {
  if (isModeDemoEnabled()) {
    return { data: [] };
  }
  
  const payload = await getJsonAuth<listStockPartenaire>(apiConfig.endpoints.stockPartenaires, token);
   return payload

}



export async function updateStockCourtier(
  token: string,
  data: stockCourtierForm,
): Promise<successMessage> {

  if (isModeDemoEnabled()) {   
    return { message: `Stock courtier mis à jour pour la compagnie ${data.compagnieId}` };
  }
  const d = await putJsonAuth<successMessage, stockCourtierForm>( apiConfig.endpoints.stockCourtiers, token, data);
  return d ;
}

export async function updateStockPartenaire(
  token: string,
  data: stockPartenaireForm,
): Promise<successMessage> {

  if (isModeDemoEnabled()) {   
    return { message: `Stock partenaire mis à jour pour la compagnie ${data.compagnieId}` };
  }
  const d = await putJsonAuth<successMessage, stockPartenaireForm>( apiConfig.endpoints.stockPartenaires, token, data);
  return d ;
}
