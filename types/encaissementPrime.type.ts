import { meta } from "./other.type";

export type typeDetails = "Vente" | "Décaissement";
export type statusEncaisse = "Encaissé" | "Non encaissé";

export const statusEncaisseColorMap: Record<statusEncaisse, string> = {
  Encaissé: "#16a34a",
  "Non encaissé": "#dc2626",
};

export type encaissementPrime = {
  id: Number ;
  numero: string;
  clientId: number;
  agenceId: number;
  banqueId: number;
  modeId: number;

  clientCode?: string;
  clientNom?: string;
  agenceNom?: string;
  banqueNom?: string;
  operateurNom?: string;
  date: Date;
  montant: number;
  montantUtilise: number;
  solde: number;
  obs?: string;
  ref?: string;
  modeNom?: string;
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
