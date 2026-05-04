import { meta } from "./other.type";

export type typeOperation = 'Décaissement' | 'Encaissement';

export const typeMouvementColorMap: Record<typeOperation, string> = {
  'Décaissement': '#fe1818',
  'Encaissement': '#16a34a',
};

export type operation = {
  id?: number;
  numero?: string;
  date?: Date;
  desc: string;
  modeId: number;
  agenceId: number;
  banqueId: number;
  modeNom?: string;
  bEnc: boolean;
  montant?: number;
  ref?: string;
  beneOrDep?: string;
  operateurNom?: string;
  agenceNom?: string;
  banqueNom?: string;
  objetOp?: string;
};


export type listOperations = {      
  meta?: meta;
  data: operation[];
};
