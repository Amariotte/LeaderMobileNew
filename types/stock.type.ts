import { meta } from "./other.type";

export type stockCourtier = {
  compagnieNom: string 
  compagnieId: number
  qteRecues?: number
  qteRetirees?: number
  qteDistribuees?: number
  qteRetireesAfterDistribuees?: number
  qteDisponibles?: number

};

export type stockPartenaire = {
  compagnieNom: string 
  compagnieId: number
  partenaireNom: string
  partenaireId: number
  typeNom: string
  typeId: number
  qteRecues?: number
  qteRetirees?: number
  qteRetireesProducteur?: number
  qteDistribueesProducteur?: number
  qteDisponibles?: number
};

export type stockProducteur = {
  compagnieNom: string 
  compagnieId: number
  partenaireId: number
  producteurId: number
  partenaireNom: string
  producteurNom: string
  typeNom: string
  typeId: number
  qteRecues?: number
  qteRetirees?: number
  qteProduites?: number
  qteDisponibles?: number
};


export type listStockProducteur = {      
  meta?: meta;
  data: stockProducteur[];
};

export type listStockPartenaire = {      
  meta?: meta;
  data: stockPartenaire[];
};

export type listStockCourtier = {      
  meta?: meta;
  data: stockCourtier[];
};