import { meta } from "./other.type";

export type typeDetails = "Vente" | "Décaissement";
export type statusEncaisse = "Encaissé" | "Non encaissé";

export const statusEncaisseColorMap: Record<statusEncaisse, string> = {
  Encaissé: "#16a34a",
  "Non encaissé": "#dc2626",
};

export type encaissementPrime = {
  id: string;
  codeReg: string;
  nomSite?: string;
  nomClient?: string;
  nomUser?: string;
  dateReg: Date;
  montantReg: number;
  descReg?: string;
  refReg?: string;
  nomModePaiement?: string;
  details?: detailsTransaction[];
};

export type detailsTransaction = {
  id: string;
  montantRegDoc: number;
  montantDoc: number;
  dateAction: Date;
  dateEchDoc: Date;
  dateDoc: Date;
  idDoc: string;
  nomClient?: string;
  codeDoc: string;
  typeDoc: typeDetails;
};

export type listEncaissementsPrimes = {
  meta?: meta;
  data: encaissementPrime[];
};
